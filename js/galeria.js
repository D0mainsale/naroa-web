// === GALERÍA INTERACTIVA PREMIUM - 211 ÁLBUMES DE NAROA ===

class GaleriaSystem {
    constructor() {
        this.albums = null;
        this.allImages = [];
        this.filteredImages = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.lightboxIndex = 0;
        this.init();
    }

    async init() {
        await this.loadData();
        this.initSearchBar();
        this.initFilterButtons();
        this.initLightbox();
        this.render();
    }

    async loadData() {
        try {
            // Load all indexed images
            const response = await fetch('/data/images-index.json');
            this.allImages = await response.json();
            
            // Extract unique albums from images for filters
            // We use a Map to keep the first occurrence's albumName (or we could count them)
            const albumMap = new Map();
            this.allImages.forEach(img => {
                if (!albumMap.has(img.albumId)) {
                    albumMap.set(img.albumId, {
                        id: img.albumId,
                        name: img.albumName,
                        count: 0
                    });
                }
                albumMap.get(img.albumId).count++;
            });
            
            this.albums = Object.fromEntries(
                Array.from(albumMap.values()).map(a => [a.id, a.name])
            );
            
            this.filteredImages = [...this.allImages];
            console.log(`✅ Gallery loaded: ${this.allImages.length} images from ${albumMap.size} albums`);
            
        } catch (error) {
            console.error('❌ Error loading gallery data:', error);
            // Fallback empty
            this.allImages = [];
            this.filteredImages = [];
        }
    }

    initSearchBar() {
        const searchBar = document.createElement('div');
        searchBar.className = 'galeria-search';
        searchBar.innerHTML = `
            <input 
                type="text" 
                placeholder="Buscar por álbum..." 
                id="galeria-search-input"
            >
            <span class="search-icon">🔍</span>
        `;
        
        document.querySelector('#galeria-container').prepend(searchBar);
        
        document.getElementById('galeria-search-input').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterAndRender();
        });
    }

    initFilterButtons() {
        // Count images per album
        const albumCounts = {};
        this.allImages.forEach(img => {
            albumCounts[img.albumId] = (albumCounts[img.albumId] || 0) + 1;
        });

        // Sort albums by image count (descending)
        const sortedAlbums = Object.entries(this.albums)
            .filter(([id]) => id !== 'DIVINOS_VAIVENES')
            .sort(([idA], [idB]) => (albumCounts[idB] || 0) - (albumCounts[idA] || 0))
            .slice(0, 20); // Top 20 albums
        
        const filterContainer = document.createElement('div');
        filterContainer.className = 'galeria-filters';
        filterContainer.innerHTML = `
            <button class="filter-btn active" data-album="all">
                Todos (${this.allImages.length})
            </button>
            ${sortedAlbums.map(([id, name]) => {
                const count = albumCounts[id] || 0;
                return `
                    <button class="filter-btn" data-album="${id}">
                        ${name} (${count})
                    </button>
                `;
            }).join('')}
        `;
        
        // Remove existing if any (to avoid duplicates on re-init)
        const existing = document.querySelector('.galeria-filters');
        if (existing) existing.remove();

        document.querySelector('#galeria-container').prepend(filterContainer);
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.album;
                this.filterAndRender();
            });
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
        
        grid.innerHTML = this.filteredImages.slice(0, 100).map((img, index) => `
            <div class="galeria-item" data-index="${index}" style="animation-delay: ${index * 0.05}s">
                <img 
                    src="${img.path}" 
                    alt="${img.albumName}"
                    loading="lazy"
                    onerror="this.src='/images/placeholder.jpg'"
                >
                <div class="galeria-item-overlay">
                    <h3>${img.albumName}</h3>
                    <button onclick="galeriaSystem.openLightbox(${index})">
                        Ver
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update count
        document.querySelector('.results-count').textContent = 
            `${this.filteredImages.length} obras`;
    }

    initLightbox() {
        const lightbox = document.createElement('div');
        lightbox.id = 'galeria-lightbox';
        lightbox.className = 'galeria-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-backdrop" onclick="galeriaSystem.closeLightbox()"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="galeriaSystem.closeLightbox()">✕</button>
                <button class="lightbox-prev" onclick="galeriaSystem.prevImage()">‹</button>
                <button class="lightbox-next" onclick="galeriaSystem.next Image()">›</button>
                <img id="lightbox-image" src="" alt="">
                <div class="lightbox-info">
                    <h2 id="lightbox-album"></h2>
                    <p id="lightbox-counter"></p>
                </div>
            </div>
        `;
        document.body.appendChild(lightbox);
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
        document.getElementById('lightbox-image').src = img.path;
        document.getElementById('lightbox-album').textContent = img.albumName;
        document.getElementById('lightbox-counter').textContent = 
            `${this.lightboxIndex + 1} / ${this.filteredImages.length}`;
    }
}

// Initialize on page load
let galeriaSystem;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('galeria-container')) {
        galeriaSystem = new GaleriaSystem();
    }
});

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    if (!document.getElementById('galeria-lightbox')?.classList.contains('active')) return;
    
    if (e.key === 'Escape') galeriaSystem.closeLightbox();
    if (e.key === 'ArrowLeft') galeriaSystem.prevImage();
    if (e.key === 'ArrowRight') galeriaSystem.nextImage();
});
