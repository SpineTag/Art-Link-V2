import { on, qsa } from "../utils/helpers.js";

const AUTO_SLIDE_INTERVAL_MS = 7000;

export function initFeaturedSlider() {
    const slides = qsa(".slide");
    if (!slides.length) {
        return;
    }

    const nextBtn = document.getElementById("next");
    const prevBtn = document.getElementById("prev");

    let index = 0;
    let autoSlideId = null;

    const showSlide = (activeIndex) => {
        slides.forEach((slide, slideIndex) => {
            slide.style.transform = `translateX(${100 * (slideIndex - activeIndex)}%)`;
        });
    };

    const goNext = () => {
        index = (index + 1) % slides.length;
        showSlide(index);
    };

    const goPrev = () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
    };

    const stopAutoSlide = () => {
        if (autoSlideId !== null) {
            window.clearInterval(autoSlideId);
            autoSlideId = null;
        }
    };

    const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideId = window.setInterval(goNext, AUTO_SLIDE_INTERVAL_MS);
    };

    on(nextBtn, "click", () => {
        goNext();
        startAutoSlide();
    });

    on(prevBtn, "click", () => {
        goPrev();
        startAutoSlide();
    });

    slides.forEach((slide) => {
        on(slide, "mouseenter", stopAutoSlide);
        on(slide, "mouseleave", startAutoSlide);
    });

    showSlide(index);
    startAutoSlide();
}
