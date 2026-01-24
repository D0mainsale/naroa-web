// === GALERÍA INTERACTIVA PREMIUM v2.0 ===
// Carga TODAS las imágenes de la colección desde images-index.json

class GaleriaSystem {
    constructor() {
        this.allImages = [];
        this.filteredImages = [];
        this.albums = {};
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.lightboxIndex = 0;
        this.itemsPerPage = 60;
        this.currentPage = 1;
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.showLoading();
        await this.loadImages();
        this.buildAlbumIndex();
        this.initUI();
        this.initLightbox();
        this.initInfiniteScroll();
        this.render();
    }

    showLoading() {
        const countEl = document.querySelector('.results-count');
        if (countEl) {
            countEl.innerHTML = '<span class="loading-pulse">Cargando colección...</span>';
        }
    }

    async loadImages() {
        try {
            const response = await fetch('/data/images-index.json');
            if (!response.ok) throw new Error('Failed to load images');
            this.allImages = await response.json();
            this.filteredImages = [...this.allImages];
            console.log(`✅ Galería: ${this.allImages.length} obras cargadas`);
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.showError();
        }
    }

    buildAlbumIndex() {
        this.albums = {};
        this.allImages.forEach(img => {
            if (!this.albums[img.albumId]) {
                this.albums[img.albumId] = {
                    name: img.albumName,
                    count: 0
                };
            }
            this.albums[img.albumId].count++;
        });
    }

    showError() {
        const countEl = document.querySelector('.results-count');
        if (countEl) {
            countEl.textContent = 'Error al cargar la galería';
        }
    }

    initUI() {
        this.initSearchBar();
        this.initFilterDropdown();
    }

    initSearchBar() {
        const header = document.querySelector('.galeria-header');
        if (!header) return;

        const searchExists = document.getElementById('galeria-search-input');
        if (searchExists) return;

        const searchBar = document.createElement('div');
        searchBar.className = 'galeria-search';
        searchBar.innerHTML = `
            <input 
                type="text" 
                placeholder="Buscar por serie..." 
                id="galeria-search-input"
                autocomplete="off"
            >
            <span class="search-icon">🔍</span>
        `;
        
        header.appendChild(searchBar);
        
        document.getElementById('galeria-search-input').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.filterAndRender();
        });
    }

    initFilterDropdown() {
        const header = document.querySelector('.galeria-header');
        if (!header) return;

        const filterExists = document.getElementById('album-filter-select');
        if (filterExists) return;

        // Get top 30 albums by count
        const sortedAlbums = Object.entries(this.albums)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 30);

        const filterContainer = document.createElement('div');
        filterContainer.className = 'galeria-filter-container';
        filterContainer.innerHTML = `
            <select id="album-filter-select" class="album-filter-select">
                <option value="all">Todas las series (${this.allImages.length})</option>
                ${sortedAlbums.map(([id, data]) => `
                    <option value="${id}">${data.name} (${data.count})</option>
                `).join('')}
            </select>
        `;
        
        header.appendChild(filterContainer);
        
        document.getElementById('album-filter-select').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.currentPage = 1;
            this.filterAndRender();
        });
    }

    filterAndRender() {
        this.filteredImages = this.allImages.filter(img => {
            const matchesFilter = this.currentFilter === 'all' || img.albumId === this.currentFilter;
            const matchesSearch = !this.searchQuery || 
                img.albumName.toLowerCase().includes(this.searchQuery);
            return matchesFilter && matchesSearch;
        });
        
        this.render();
    }

    render() {
        const grid = document.querySelector('.galeria-grid');
        if (!grid) return;

        const startIndex = 0;
        const endIndex = this.currentPage * this.itemsPerPage;
        const imagesToShow = this.filteredImages.slice(startIndex, endIndex);

        grid.innerHTML = imagesToShow.map((img, index) => `
            <div class="galeria-item" data-index="${index}">
                <img 
                    src="${img.path}" 
                    alt="${img.albumName}"
                    loading="lazy"
                    onerror="this.parentElement.style.display='none'"
                >
                <div class="galeria-item-overlay">
                    <h3>${img.albumName}</h3>
                    <span class="view-btn">Ver ↗</span>
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.galeria-item').forEach((item, idx) => {
            item.addEventListener('click', () => this.openLightbox(idx));
        });

        // Update count
        const countEl = document.querySelector('.results-count');
        if (countEl) {
            const showing = Math.min(endIndex, this.filteredImages.length);
            countEl.textContent = `${showing} de ${this.filteredImages.length} obras`;
        }

        // Show/hide load more indicator
        this.updateLoadMoreIndicator();
    }

    updateLoadMoreIndicator() {
        const existing = document.querySelector('.load-more-indicator');
        if (existing) existing.remove();

        const endIndex = this.currentPage * this.itemsPerPage;
        if (endIndex < this.filteredImages.length) {
            const indicator = document.createElement('div');
            indicator.className = 'load-more-indicator';
            indicator.innerHTML = `
                <span class="loading-pulse">Desplaza para ver más obras...</span>
            `;
            document.querySelector('.galeria-grid').after(indicator);
        }
    }

    initInfiniteScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading) {
                    this.loadMore();
                }
            });
        }, { rootMargin: '200px' });

        // Observe the load more indicator
        setInterval(() => {
            const indicator = document.querySelector('.load-more-indicator');
            if (indicator) {
                observer.observe(indicator);
            }
        }, 500);
    }

    loadMore() {
        const endIndex = this.currentPage * this.itemsPerPage;
        if (endIndex >= this.filteredImages.length) return;

        this.isLoading = true;
        this.currentPage++;
        
        setTimeout(() => {
            this.render();
            this.isLoading = false;
        }, 100);
    }

    initLightbox() {
        if (document.getElementById('galeria-lightbox')) return;

        const lightbox = document.createElement('div');
        lightbox.id = 'galeria-lightbox';
        lightbox.className = 'galeria-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Cerrar">✕</button>
                <button class="lightbox-prev" aria-label="Anterior">‹</button>
                <button class="lightbox-next" aria-label="Siguiente">›</button>
                <img id="lightbox-image" src="" alt="">
                <div class="lightbox-info">
                    <h2 id="lightbox-album"></h2>
                    <p id="lightbox-counter"></p>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);

        // Event listeners
        lightbox.querySelector('.lightbox-backdrop').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prevImage());
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.nextImage());
    }

    openLightbox(index) {
        this.lightboxIndex = index;
        this.updateLightbox();
        document.getElementById('galeria-lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        document.getElementById('galeria-lightbox').classList.remove('active');
        document.body.style.overflow = '';
    }

    nextImage() {
        this.lightboxIndex = (this.lightboxIndex + 1) % this.filteredImages.length;
        this.updateLightbox();
    }

    prevImage() {
        this.lightboxIndex = (this.lightboxIndex - 1 + this.filteredImages.length) % this.filteredImages.length;
        this.updateLightbox();
    }

    updateLightbox() {
        const img = this.filteredImages[this.lightboxIndex];
        if (!img) return;
        
        document.getElementById('lightbox-image').src = img.path;
        document.getElementById('lightbox-album').textContent = img.albumName;
        document.getElementById('lightbox-counter').textContent = 
            `${this.lightboxIndex + 1} / ${this.filteredImages.length}`;
    }

    // Public API for series cards
    filterByAlbum(albumId) {
        this.currentFilter = albumId;
        this.currentPage = 1;
        
        const select = document.getElementById('album-filter-select');
        if (select) select.value = albumId;
        
        this.filterAndRender();
        
        // Scroll to gallery
        document.getElementById('galeria-container')?.scrollIntoView({ behavior: 'smooth' });
    }

    filterBySearch(query) {
        this.searchQuery = query.toLowerCase();
        this.currentPage = 1;
        
        const input = document.getElementById('galeria-search-input');
        if (input) input.value = query;
        
        this.filterAndRender();
        
        // Scroll to gallery
        document.getElementById('galeria-container')?.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize on page load
let galeriaSystem;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('galeria-container')) {
        galeriaSystem = new GaleriaSystem();
        window.galeriaSystem = galeriaSystem; // Make available globally
    }
});

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    if (!document.getElementById('galeria-lightbox')?.classList.contains('active')) return;
    
    if (e.key === 'Escape') galeriaSystem?.closeLightbox();
    if (e.key === 'ArrowLeft') galeriaSystem?.prevImage();
    if (e.key === 'ArrowRight') galeriaSystem?.nextImage();
});
