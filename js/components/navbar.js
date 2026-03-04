import { on, qs, qsa } from "../utils/helpers.js";

export function initNavbar() {
    const navbar = qs(".navbar");
    if (!navbar) {
        return;
    }

    const toggle = qs(".menu-toggle", navbar);
    const linksWrapper = qs(".nav-links", navbar);

    if (toggle && linksWrapper) {
        on(toggle, "click", () => {
            const isOpen = linksWrapper.classList.toggle("open");
            toggle.classList.toggle("active", isOpen);
            toggle.setAttribute("aria-expanded", String(isOpen));
        });

        qsa("a", linksWrapper).forEach((link) => {
            on(link, "click", () => {
                linksWrapper.classList.remove("open");
                toggle.classList.remove("active");
                toggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    const applyScrollState = () => {
        navbar.classList.toggle("scrolled", window.scrollY > 60);
    };

    applyScrollState();
    on(window, "scroll", applyScrollState, { passive: true });
}

export function setActiveNavLink() {
    const links = qsa(".nav-links a");
    if (!links.length) {
        return;
    }

    const current = window.location.pathname.split("/").pop() || "home.html";

    links.forEach((link) => {
        const target = link.getAttribute("href");
        const isActive = target === current;
        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}
