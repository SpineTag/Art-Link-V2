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
    const images = qsa(".gallery-grid .item img");

    if (!viewer || !viewerImg || !closeBtn || !images.length) {
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

    images.forEach((img) => {
        on(img, "click", () => openViewer(img));
    });

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
            const response = await fetch(form.action, {
                method: form.method || "POST",
                body: new FormData(form),
                headers: {
                    Accept: "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Message submission failed.");
            }

            showStatus("Thanks, your message has been sent. We will reply shortly.");
            form.reset();
        } catch (error) {
            console.error(error);
            showStatus("An error occurred while sending your message. Please try again.", true);
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
