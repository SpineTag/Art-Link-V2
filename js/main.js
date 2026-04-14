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

function initSecretPassion() {
    const target = document.getElementById("secret-passion");
    if (!target) {
        return;
    }

    let clicks = 0;
    target.style.cursor = "pointer";

    target.addEventListener("click", () => {
        clicks += 1;

        if (clicks >= 3) {
            clicks = 0;
            const root = getRootPrefix();
            window.location.href = `${root}/pages/passion.html`;
        }
    });
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

    // Pre-fill form from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const artistEmail = urlParams.get("artist");
    const subject = urlParams.get("subject");
    if (artistEmail) {
        const artistEmailHidden = form.querySelector("#artistEmailHidden");
        if (artistEmailHidden) {
            artistEmailHidden.value = artistEmail;
        }
        const messageField = form.querySelector('textarea[name="entry.1892958023"]');
        if (messageField) {
            messageField.value = `Hi, I'm interested in your artwork. Please contact me.\n\n`;
        }
    }
    if (subject) {
        const subjectField = form.querySelector('input[name="entry.782523406"]');
        if (subjectField) {
            subjectField.value = subject;
        }
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

    const handleContactSubmit = async (event) => {
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
            const isGoogleForm = form.action.includes("docs.google.com/forms");
            if (isGoogleForm) {
                showStatus("Sending your message...");

                const iframe = document.getElementById("contactFormTarget");

                const handleIframeLoad = () => {
                    showStatus("Thanks, your message has been sent. We will reply shortly.");
                    form.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Send Message";
                    }
                    iframe?.removeEventListener("load", handleIframeLoad);
                };

                if (iframe) {
                    iframe.addEventListener("load", handleIframeLoad, { once: true });
                }

                form.submit();
                return;
            }

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

            const isNetworkError = error.message && (error.message.includes("Failed to fetch") || error.message.includes("ERR_CERT_AUTHORITY_INVALID") || error.message.includes("NetworkError"));

            if (isNetworkError) {
                showStatus("Network/SSL issue detected. Falling back to native form submit for reliability.", true);
                form.removeEventListener("submit", handleContactSubmit);
                // native submit may still fail if cert path is invalid, but it is the most compatible fallback
                form.submit();
                return;
            }

            showStatus(error.message || "An error occurred while sending your message. Please try again.", true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Send Message";
            }
        }
    };

    on(form, "submit", handleContactSubmit);
}

async function loadArtworkGallery() {
    const galleryGrid = qs("#galleryGrid");
    const viewer = qs(".viewer");
    const artworkInfo = qs("#artworkInfo");

    if (!galleryGrid || !viewer || !artworkInfo) {
        return;
    }

    try {
        const response = await fetch("/api/artworks");
        if (!response.ok) {
            throw new Error("Unable to fetch artworks.");
        }

        const artworks = await response.json();
        galleryGrid.innerHTML = "";

        artworks.forEach((artwork) => {
            const item = document.createElement("div");
            item.className = "item";
            item.innerHTML = `<img src="${artwork.image_url}" alt="${artwork.artwork_title}" data-artwork-id="${artwork.id}">`;
            galleryGrid.appendChild(item);
        });

        initArtworkViewer(artworks);
    } catch (error) {
        console.error("Failed to load artworks:", error);
    }
}

function initArtworkViewer(artworks) {
    const viewer = qs(".viewer");
    const viewerImg = qs("#viewer-img");
    const closeBtn = qs(".close", viewer || document);
    const galleryGrid = qs("#galleryGrid");
    const images = qsa("#galleryGrid .item img");
    const artworkInfo = qs("#artworkInfo");
    const artworkTitle = qs("#artworkTitle");
    const artworkDescription = qs("#artworkDescription");
    const artistName = qs("#artistName");
    const artworkCategory = qs("#artworkCategory");
    const artworkPrice = qs("#artworkPrice");
    const contactArtistBtn = qs("#contactArtist");

    if (!viewer || !viewerImg || !closeBtn || !galleryGrid || !images.length) {
        return;
    }

    const openViewer = (img) => {
        const artworkId = img.dataset.artworkId;
        const artwork = artworks.find((item) => item.id === artworkId);
        if (!artwork) {
            return;
        }

        viewerImg.src = artwork.image_url;
        viewerImg.alt = artwork.artwork_title;
        artworkTitle.textContent = artwork.artwork_title;
        artworkDescription.textContent = artwork.artwork_description;
        artistName.textContent = artwork.artist_name;
        artworkCategory.textContent = artwork.artwork_category;
        artworkPrice.textContent = artwork.artwork_price ? `Price: $${artwork.artwork_price}` : "";
        contactArtistBtn.onclick = () => {
            window.location.href = `contact.html?artist=${encodeURIComponent(artwork.artist_email)}&subject=${encodeURIComponent(`Inquiry about "${artwork.artwork_title}"`)}`;
        };
        artworkInfo.style.display = "block";

        viewer.classList.add("show");
        viewer.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
    };

    images.forEach((img) => {
        on(img, "click", () => openViewer(img));
    });

    on(closeBtn, "click", () => {
        viewer.classList.remove("show");
        viewer.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
        artworkInfo.style.display = "none";
    });

    on(viewer, "click", (event) => {
        if (event.target === viewer) {
            viewer.classList.remove("show");
            viewer.setAttribute("aria-hidden", "true");
            document.body.classList.remove("no-scroll");
            artworkInfo.style.display = "none";
        }
    });

    on(document, "keydown", (event) => {
        if (event.key === "Escape") {
            viewer.classList.remove("show");
            viewer.setAttribute("aria-hidden", "true");
            document.body.classList.remove("no-scroll");
            artworkInfo.style.display = "none";
        }
    });
}

function initArtworkForm() {
    const form = document.getElementById("artworkForm");
    const status = document.getElementById("submitStatus");

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        clearStatus();

        if (!form.checkValidity()) {
            form.reportValidity();
            showStatus("Please complete all required fields before submitting.", true);
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Submitting...";
        }

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: "POST",
                body: formData,
            });

            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                const text = await response.text();
                throw new Error(text || "Submission failed.");
            }

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Submission failed.");
            }

            showStatus(result.message || "Artwork submitted successfully.");
            form.reset();
        } catch (error) {
            console.error(error);
            showStatus(error.message || "An error occurred while submitting your artwork.", true);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Artwork";
            }
        }
    };

    on(form, "submit", handleSubmit);
}

function initPassionPage() {
    // === Particle Canvas ===
    const particleCanvas = document.getElementById("particle-canvas");
    if (particleCanvas) {
        const ctx = particleCanvas.getContext("2d");
        particleCanvas.width = particleCanvas.offsetWidth;
        particleCanvas.height = particleCanvas.offsetHeight;

        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * particleCanvas.width,
                y: Math.random() * particleCanvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 3 + 1,
                color: `hsl(${Math.random() * 60 + 280}, 100%, 60%)`
            });
        }

        let mouseX = particleCanvas.width / 2;
        let mouseY = particleCanvas.height / 2;

        particleCanvas.addEventListener("mousemove", (e) => {
            const rect = particleCanvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        const animateParticles = () => {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

            particles.forEach((p) => {
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    p.vx -= (dx / dist) * 0.5;
                    p.vy -= (dy / dist) * 0.5;
                }

                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.99;
                p.vy *= 0.99;

                if (p.x < 0 || p.x > particleCanvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > particleCanvas.height) p.vy *= -1;

                p.x = Math.max(0, Math.min(particleCanvas.width, p.x));
                p.y = Math.max(0, Math.min(particleCanvas.height, p.y));

                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.globalAlpha = 1;
            requestAnimationFrame(animateParticles);
        };

        animateParticles();
    }

    // === Click Waves ===
    const waveContainer = document.getElementById("wave-container");
    if (waveContainer) {
        const colors = ["#82f4ff", "#ff71ce", "#ffcb2e", "#00ff88"];

        waveContainer.addEventListener("click", (e) => {
            const rect = waveContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const wave = document.createElement("div");
            wave.className = "wave";
            wave.style.left = `${x}px`;
            wave.style.top = `${y}px`;
            wave.style.borderColor = colors[Math.floor(Math.random() * colors.length)];
            wave.style.boxShadow = `0 0 20px ${wave.style.borderColor}`;

            waveContainer.appendChild(wave);

            setTimeout(() => wave.remove(), 1200);
        });
    }

    // === Color Mixer ===
    const orbGrid = document.getElementById("orb-grid");
    const mixerOutput = document.getElementById("mixer-output");
    if (orbGrid && mixerOutput) {
        const orbs = orbGrid.querySelectorAll(".orb");
        let selectedColors = [];

        orbs.forEach((orb) => {
            orb.addEventListener("click", () => {
                selectedColors.push(orb.dataset.color);
                if (selectedColors.length > 3) selectedColors.shift();

                if (selectedColors.length > 0) {
                    const avgR = Math.round(selectedColors.reduce((sum, c) => sum + parseInt(c.slice(1, 3), 16), 0) / selectedColors.length);
                    const avgG = Math.round(selectedColors.reduce((sum, c) => sum + parseInt(c.slice(3, 5), 16), 0) / selectedColors.length);
                    const avgB = Math.round(selectedColors.reduce((sum, c) => sum + parseInt(c.slice(5, 7), 16), 0) / selectedColors.length);

                    const mixedColor = `#${avgR.toString(16).padStart(2, "0")}${avgG.toString(16).padStart(2, "0")}${avgB.toString(16).padStart(2, "0")}`;
                    mixerOutput.style.background = `radial-gradient(circle, ${mixedColor}, ${mixedColor}aa)`;
                    mixerOutput.style.color = mixedColor;
                    mixerOutput.style.boxShadow = `0 0 60px ${mixedColor}`;
                }
            });
        });
    }

    // === Rhythm Pulse ===
    const rhythmInput = document.getElementById("rhythm-input");
    const pulseOrb = document.getElementById("pulse-orb");
    const beatDisplay = document.getElementById("beat-display");
    if (rhythmInput && pulseOrb && beatDisplay) {
        let beatCount = 0;

        rhythmInput.addEventListener("input", () => {
            beatCount += 1;
            beatDisplay.textContent = "♪ " + "●".repeat(Math.min(beatCount % 10, 8)) + " ♪";
            pulseOrb.style.animation = "none";
            setTimeout(() => {
                pulseOrb.style.animation = "pulse-color 0.6s ease-in-out";
            }, 10);
        });
    }

    // === Energy Balls ===
    const energyContainer = document.getElementById("energy-container");
    if (energyContainer) {
        const colors = ["#ff71ce", "#82f4ff", "#ffcb2e", "#00ff88"];

        for (let i = 0; i < 6; i++) {
            const ball = document.createElement("div");
            ball.className = "energy-ball";
            ball.style.width = `${Math.random() * 40 + 20}px`;
            ball.style.height = ball.style.width;
            ball.style.left = `${Math.random() * 50}%`;
            ball.style.top = `${Math.random() * 50}%`;
            ball.style.background = colors[i % colors.length];
            ball.style.color = colors[i % colors.length];
            ball.style.animationDuration = `${3 + Math.random() * 4}s`;
            ball.style.animationDelay = `${Math.random() * 2}s`;

            energyContainer.appendChild(ball);
        }
    }
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
        initSecretPassion();
    }

    initFeaturedSlider();
    if (document.querySelector("#galleryGrid")) {
        loadArtworkGallery();
    }
    initContactForm();
    initArtworkForm();

    if (document.querySelector(".passion-page")) {
        initPassionPage();
    }
}

document.addEventListener("DOMContentLoaded", bootstrap);
