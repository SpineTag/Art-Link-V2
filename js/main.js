import { initNavbar, setActiveNavLink } from "./components/navbar.js";
import { initFeaturedSlider } from "./components/slider.js";
import { getRootPrefix, on, qs, qsa } from "./utils/helpers.js";

const COMPONENT_FALLBACKS = {
    navbar: `
<nav class="navbar" role="navigation" aria-label="Main navigation">
    <div class="nav-container container">
        <a class="logo" href="home.html" aria-label="Art Link home">Art Link</a>
        <button class="menu-toggle" aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle menu">
            <span class="bar"></span>
            <span class="bar"></span>
            <span class="bar"></span>
        </button>
        <ul id="primary-nav" class="nav-links">
            <li><a href="home.html">Home</a></li>
            <li><a href="gallery.html">Gallery</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="contact.html">Contact</a></li>
        </ul>
    </div>
</nav>`,
    footer: `
<footer class="site-footer">
    <div class="container">
        <p>&copy; <span id="current-year"></span> Art Link | Designed with passion</p>
    </div>
</footer>`
};

function setLoadedState() {
    const applyLoaded = () => document.body.classList.add("loaded");

    if (document.readyState === "complete") {
        applyLoaded();
    }

    on(window, "load", applyLoaded, { once: true });
}

async function loadComponent(name, slotId) {
    const slot = document.getElementById(slotId);
    if (!slot) {
        return false;
    }

    const root = getRootPrefix();
    const componentPath = `${root}/components/${name}.html`;

    try {
        const response = await fetch(componentPath, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Failed to load ${componentPath}`);
        }

        slot.innerHTML = await response.text();
        return true;
    } catch (error) {
        console.warn(`Component fetch failed for ${name}; using fallback.`, error);
        const fallback = COMPONENT_FALLBACKS[name];

        if (fallback) {
            slot.innerHTML = fallback;
            return true;
        }

        return false;
    }
}

function initFooterYear() {
    const yearElement = document.getElementById("current-year");
    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }
}

function initGalleryViewer() {
    const viewer = qs(".viewer");
    const viewerImg = document.getElementById("viewer-img");
    const closeBtn = qs(".close", viewer || document);
    const galleryGrid = qs(".gallery-grid");
    const images = qsa(".gallery-grid .item img");

    if (!viewer || !viewerImg || !closeBtn || !galleryGrid || !images.length) {
        return;
    }

    const openViewer = (img) => {
        viewerImg.src = img.src;
        viewerImg.alt = img.alt || "Expanded artwork";
        viewer.classList.add("show");
        viewer.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
    };

    const closeViewer = () => {
        viewer.classList.remove("show");
        viewer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
    };

    const attachImageClick = (img) => {
        on(img, "click", () => openViewer(img));
    };

    images.forEach(attachImageClick);

    const getImageSize = (index) => {
        // Alternate tall/wide to preserve variety.
        const type = index % 3;

        if (type === 0) return "900/1200";
        if (type === 1) return "900/1500";
        return "1400/900";
    };

    let nextImageIndex = galleryGrid.querySelectorAll(".item").length + 1;
    const infiniteBatchSize = 4;

    const createGalleryItem = (index) => {
        const size = getImageSize(index);
        const url = `https://picsum.photos/${size}?${Date.now()}-${index}`;
        const alt = `Gallery item ${index}`;
        const item = document.createElement("div");
        item.className = `item ${index % 4 === 0 ? "wide" : index % 5 === 0 ? "tall" : ""}`.trim();

        const img = document.createElement("img");
        img.src = url;
        img.alt = alt;
        item.appendChild(img);

        attachImageClick(img);
        return item;
    };

    const appendGalleryBatch = () => {
        for (let i = 0; i < infiniteBatchSize; i += 1) {
            const item = createGalleryItem(nextImageIndex);
            galleryGrid.appendChild(item);
            nextImageIndex += 1;
        }

        observeLastItem();
    };

    let observer;

    const observeLastItem = () => {
        const lastItem = galleryGrid.querySelector(".item:last-child");
        if (!lastItem) {
            return;
        }

        if (observer) {
            observer.disconnect();
        }

        observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    appendGalleryBatch();
                }
            });
        }, {
            rootMargin: "200px",
            threshold: 0.1
        });

        observer.observe(lastItem);
    };

    observeLastItem();

    on(closeBtn, "click", closeViewer);
    on(viewer, "click", (event) => {
        if (event.target === viewer) {
            closeViewer();
        }
    });

    on(document, "keydown", (event) => {
        if (event.key === "Escape") {
            closeViewer();
        }
    });
}


function initContactForm() {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("contactStatus");

    if (!form || !status) {
        return;
    }

    const submitBtn = qs('button[type="submit"]', form);

    const showStatus = (message, isError = false) => {
        status.textContent = message;
        status.classList.remove("sr-only");
        status.classList.remove("success", "error");
        status.classList.add(isError ? "error" : "success");
    };

    const clearStatus = () => {
        status.textContent = "";
        status.classList.add("sr-only");
        status.classList.remove("success", "error");
    };

    on(form, "submit", async (event) => {
        event.preventDefault();
        clearStatus();

        if (!form.checkValidity()) {
            form.reportValidity();
            showStatus("Please complete all required fields before submitting.", true);
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";
        }

        try {
            const formData = new FormData(form);

            const response = await fetch(form.action, {
                method: form.method || "POST",
                body: formData,
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Message submission failed.");
            }

            showStatus("Thanks, your message has been sent. We will reply shortly.");
            form.reset();
        } catch (error) {
            console.error(error);

            if (error.message.includes("Failed to fetch") || error.message.includes("ERR_CERT_AUTHORITY_INVALID")) {
                showStatus("Network error: unable to reach form submission endpoint (SSL issue).\nPlease ensure your browser/system trusts HTTPS certificates, or try one of these options: 1) use Formsubmit in a standard browser, 2) use another service (Formspree), 3) deploy to GitHub Pages and use the direct form endpoint.", true);
            } else {
                showStatus(error.message || "An error occurred while sending your message. Please try again.", true);
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Send Message";
            }
        }
    });
}

async function bootstrap() {
    setLoadedState();

    const [hasNavbar, hasFooter] = await Promise.all([
        loadComponent("navbar", "navbar-slot"),
        loadComponent("footer", "footer-slot")
    ]);

    if (hasNavbar) {
        setActiveNavLink();
        initNavbar();
    }

    if (hasFooter) {
        initFooterYear();
    }

    initFeaturedSlider();
    initGalleryViewer();
    initContactForm();
}

document.addEventListener("DOMContentLoaded", bootstrap);
