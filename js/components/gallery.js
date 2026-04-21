// Gallery Artwork Generator - Generates infinite random artwork images
import { on, qs, qsa } from "./utils/helpers.js";

// Random artwork data generators
const CATEGORIES = ['painting', 'sculpture', 'photography', 'digital', 'mixed-media', 'other'];
const ARTIST_FIRST_NAMES = ['Alex', 'Jordan', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Sage', 'River', 'Phoenix', 'Dakota', 'Reese', 'Finley', 'Rowan', 'Emery'];
const ARTIST_LAST_NAMES = ['Chen', 'Williams', 'Garcia', 'Patel', 'Kim', 'Nguyen', 'Martinez', 'Johnson', 'Brown', 'Lee', 'Davis', 'Miller', 'Wilson', 'Taylor', 'Anderson'];

const ARTWORK_TITLES = [
    'Ethereal Dreams', 'Silent Echoes', 'Urban Fragments', 'Natural Forms',
    'Abstract Journey', 'Color Studies', 'Light & Shadow', 'Memory Lane',
    'Inner Space', 'Transition', 'Horizon', 'Untitled No.', 'Composition',
    'Reflection', 'Momentum', 'Genesis', 'Solitude', 'Entropy', 'Synthesis', 'Awakening'
];

const ARTWORK_DESCRIPTIONS = [
    'An exploration of form and color through layered textures.',
    'Capturing the essence of movement in static medium.',
    'A meditation on the relationship between light and space.',
    'Digital manipulation of traditional photographic elements.',
    'Mixed media piece combining found objects and paint.',
    'Abstract representation of emotional states.',
    'Study of natural patterns and organic structures.',
    'Experimental work with contemporary digital tools.',
    'Exploration of urban landscapes and their decay.',
    'Minimalist approach to complex philosophical concepts.'
];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomArtwork(index) {
    const width = 400 + Math.floor(Math.random() * 200);
    const height = 300 + Math.floor(Math.random() * 300);
    const seed = Math.floor(Math.random() * 1000);
    
    return {
        id: `artwork-${index}-${seed}`,
        title: `${randomFrom(ARTWORK_TITLES)} ${String(index).padStart(2, '0')}`,
        description: randomFrom(ARTWORK_DESCRIPTIONS),
        artist: `${randomFrom(ARTIST_FIRST_NAMES)} ${randomFrom(ARTIST_LAST_NAMES)}`,
        category: randomFrom(CATEGORIES),
        price: Math.random() > 0.6 ? `$${(Math.random() * 500 + 50).toFixed(2)}` : null,
        imageUrl: `https://picsum.photos/seed/${seed}/${width}/${height}`
    };
}

function createArtworkElement(artwork, index) {
    const item = document.createElement('div');
    item.className = 'item';
    item.style.animationDelay = `${(index % 10) * 0.05}s`;
    
    item.innerHTML = `
        <img src="${artwork.imageUrl}" 
             alt="${artwork.title}" 
             loading="lazy"
             data-id="${artwork.id}"
             data-title="${artwork.title}"
             data-description="${artwork.description}"
             data-artist="${artwork.artist}"
             data-category="${artwork.category}"
             data-price="${artwork.price || ''}">
    `;
    
    return item;
}

let artworkIndex = 0;
const BATCH_SIZE = 12;
let isLoading = false;

function loadArtworkBatch() {
    if (isLoading) return;
    isLoading = true;
    
    const grid = qs('#galleryGrid');
    if (!grid) return;
    
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < BATCH_SIZE; i++) {
        const artwork = generateRandomArtwork(artworkIndex++);
        fragment.appendChild(createArtworkElement(artwork, i));
    }
    
    grid.appendChild(fragment);
    isLoading = false;
}

function initInfiniteScroll() {
    const grid = qs('#galleryGrid');
    if (!grid) return;
    
    // Initial load
    loadArtworkBatch();
    
    // Infinite scroll on scroll
    on(window, 'scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const clientHeight = window.innerHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 500) {
            loadArtworkBatch();
        }
    }, { passive: true });
}

function initGalleryViewer() {
    const grid = qs('#galleryGrid');
    if (!grid) return;
    
    on(grid, 'click', (e) => {
        const img = e.target.closest('.item img');
        if (!img) return;
        
        const viewer = qs('.viewer');
        const viewerImg = qs('#viewer-img');
        const titleEl = qs('#artworkTitle');
        const descEl = qs('#artworkDescription');
        const artistEl = qs('#artistName');
        const categoryEl = qs('#artworkCategory');
        const priceEl = qs('#artworkPrice');
        
        if (!viewer || !viewerImg) return;
        
        viewerImg.src = img.src;
        titleEl.textContent = img.dataset.title;
        descEl.textContent = img.dataset.description;
        artistEl.textContent = img.dataset.artist;
        categoryEl.textContent = img.dataset.category;
        priceEl.textContent = img.dataset.price ? `Price: ${img.dataset.price}` : '';
        
        viewer.classList.add('show');
        viewer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    });
    
    // Close viewer
    const closeBtn = qs('.viewer .close');
    const viewer = qs('.viewer');
    
    if (closeBtn) {
        on(closeBtn, 'click', () => {
            viewer.classList.remove('show');
            viewer.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
        });
    }
    
    // Close on background click
    if (viewer) {
        on(viewer, 'click', (e) => {
            if (e.target === viewer) {
                viewer.classList.remove('show');
                viewer.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('no-scroll');
            }
        });
    }
    
    // Close on escape
    on(document, 'keydown', (e) => {
        if (e.key === 'Escape') {
            const viewer = qs('.viewer');
            if (viewer && viewer.classList.contains('show')) {
                viewer.classList.remove('show');
                viewer.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('no-scroll');
            }
        }
    });
}

export function initGallery() {
    initInfiniteScroll();
    initGalleryViewer();
}