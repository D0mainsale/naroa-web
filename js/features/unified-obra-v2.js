/**
 * UNIFIED OBRA SYSTEM v2.0 — Premium Gallery Experience
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MEJORAS IMPLEMENTADAS:
 * ✅ Masonry Layout (Pinterest-style)
 * ✅ Dark Mode automático
 * ✅ Animaciones de hover 3D parallax
 * ✅ Swipe táctil en lightbox
 * ✅ Buscador de álbumes en tiempo real
 * ✅ Tags/Categorías (series temáticas)
 * ✅ Lazy loading con IntersectionObserver
 * ✅ Transiciones premium
 * 
 * v2.0.0 - 2026-01-24
 */

class UnifiedObraSystemV2 {
    constructor() {
        this.albums = [];
        this.blogPosts = [];
        this.timeline = [];
        this.filteredTimeline = [];
        this.currentAlbum = null;
        this.currentImageIndex = 0;
        this.dataLoaded = false;
        this.searchQuery = '';
        this.activeCategory = 'all';
        this.showAllAlbums = false; // Daily rotation: false = show 12/day, true = all
        
        // Touch handling
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        // Categories/Series
        this.categories = [
            { id: 'all', name: 'Todos', icon: '🎨' },
            { id: 'divinos', name: 'DiviNos VaiVenes', icon: '✨', keywords: ['divinos', 'vaivenes', 'iconos'] },
            { id: 'retratos', name: 'Retratos', icon: '👤', keywords: ['retrato', 'portrait', 'cara', 'rostro'] },
            { id: 'walking', name: 'Walking Gallery', icon: '🚶', keywords: ['walking', 'gallery', 'urbano'] },
            { id: 'espejos', name: 'Espejos del Alma', icon: '🪞', keywords: ['espejo', 'alma', 'reflejo'] },
            { id: 'abstracto', name: 'Abstracto', icon: '🌀', keywords: ['abstracto', 'abstract', 'color'] }
        ];
        
        // Dark mode
        this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        console.log('📦 Unified Obra System v2.0 initialized');
    }
    
    async init() {
        if (!this.dataLoaded) {
            await this.loadData();
            this.buildTimeline();
            this.addStyles();
            this.createLightbox();
            this.setupLazyLoading();
            this.setupDarkModeListener();
            this.dataLoaded = true;
        }
        
        this.checkAndRender();
        window.addEventListener('hashchange', () => this.checkAndRender());
        
        console.log(`✅ Loaded ${this.albums.length} albums + ${this.blogPosts.length} blog posts`);
    }
    
    checkAndRender() {
        const hash = window.location.hash;
        if (hash === '#/portfolio' || hash === '#/obras') {
            setTimeout(() => this.render(), 100);
        }
    }

    async loadData() {
        try {
            const imagesResponse = await fetch('/data/images-index.json');
            const images = await imagesResponse.json();
            
            const albumsMap = new Map();
            images.forEach(img => {
                if (!img.albumId) return;
                
                if (!albumsMap.has(img.albumId)) {
                    albumsMap.set(img.albumId, {
                        id: img.albumId,
                        name: img.albumName || 'Sin título',
                        images: [],
                        cover: null,
                        count: 0,
                        category: this.detectCategory(img.albumName)
                    });
                }
                
                const album = albumsMap.get(img.albumId);
                album.images.push(img);
                album.count++;
                
                if (!album.cover) {
                    album.cover = img.path;
                }
            });
            
            this.albums = Array.from(albumsMap.values());
            this.albums.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
            
        } catch (err) {
            console.error('Error loading albums:', err);
        }
        
        try {
            const blogResponse = await fetch('/data/blog.json');
            this.blogPosts = await blogResponse.json();
        } catch (err) {
            console.error('Error loading blog:', err);
        }
    }
    
    detectCategory(albumName) {
        if (!albumName) return 'all';
        const lower = albumName.toLowerCase();
        
        for (const cat of this.categories) {
            if (cat.keywords) {
                for (const keyword of cat.keywords) {
                    if (lower.includes(keyword)) return cat.id;
                }
            }
        }
        return 'all';
    }
    
    buildTimeline() {
        // === DAILY ROTATION SYSTEM ===
        // Show a rotating subset of albums each day instead of loading all
        const ALBUMS_PER_DAY = 12;
        
        let albumsToShow;
        
        if (this.showAllAlbums) {
            // User clicked "Ver todos" — show all
            albumsToShow = this.albums;
            console.log(`🎨 Mostrando TODOS los ${this.albums.length} álbumes`);
        } else {
            // Default: daily rotation
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 0);
            const diff = now - start;
            const oneDay = 1000 * 60 * 60 * 24;
            const dayOfYear = Math.floor(diff / oneDay);
            
            const totalAlbums = this.albums.length;
            const startIndex = (dayOfYear * ALBUMS_PER_DAY) % totalAlbums;
            
            albumsToShow = [];
            for (let i = 0; i < Math.min(ALBUMS_PER_DAY, totalAlbums); i++) {
                const index = (startIndex + i) % totalAlbums;
                albumsToShow.push(this.albums[index]);
            }
            
            console.log(`📅 Día ${dayOfYear}: mostrando ${albumsToShow.length} de ${totalAlbums} álbumes`);
        }
        
        this.timeline = [
            ...albumsToShow.map(album => ({ type: 'album', data: album })),
            ...this.blogPosts.slice(0, this.showAllAlbums ? this.blogPosts.length : 3).map(post => ({ type: 'post', data: post }))
        ];
        this.filteredTimeline = [...this.timeline];
    }
    
    filterTimeline() {
        this.filteredTimeline = this.timeline.filter(item => {
            // Category filter
            if (this.activeCategory !== 'all') {
                if (item.type === 'album' && item.data.category !== this.activeCategory) {
                    return false;
                }
            }
            
            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                if (item.type === 'album') {
                    return item.data.name.toLowerCase().includes(query);
                } else {
                    return item.data.title?.toLowerCase().includes(query);
                }
            }
            
            return true;
        });
    }
    
    render() {
        const container = document.getElementById('portfolio-grid');
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'unified-obra-grid-v2';
        
        // Add search and filters
        this.renderControls(container);
        
        // Render grid
        const grid = document.createElement('div');
        grid.className = 'masonry-grid';
        
        this.filteredTimeline.forEach((item, index) => {
            if (item.type === 'album') {
                grid.appendChild(this.createAlbumCard(item.data, index));
            } else if (item.type === 'post') {
                grid.appendChild(this.createBlogCard(item.data, index));
            }
        });
        
        container.appendChild(grid);
        
        // Initialize masonry after images load
        this.initMasonryLayout(grid);
        
        // Re-observe for lazy loading
        this.observeImages();
        
        console.log('🎨 Gallery v2 rendered with', this.filteredTimeline.length, 'items');
    }
    
    renderControls(container) {
        const controls = document.createElement('div');
        controls.className = 'gallery-controls';
        
        // Daily rotation info
        const isShowingAll = this.showAllAlbums;
        const displayCount = this.filteredTimeline.filter(i => i.type === 'album').length;
        const totalCount = this.albums.length;
        
        controls.innerHTML = `
            <div class="search-container">
                <input type="text" 
                       id="album-search" 
                       placeholder="🔍 Buscar álbumes..." 
                       value="${this.searchQuery}"
                       autocomplete="off">
                <button class="search-clear ${this.searchQuery ? 'visible' : ''}" aria-label="Limpiar búsqueda">✕</button>
            </div>
            <div class="category-filters">
                ${this.categories.map(cat => `
                    <button class="category-btn ${this.activeCategory === cat.id ? 'active' : ''}" 
                            data-category="${cat.id}">
                        <span class="cat-icon">${cat.icon}</span>
                        <span class="cat-name">${cat.name}</span>
                    </button>
                `).join('')}
            </div>
            <div class="gallery-stats">
                <span class="stat-count">${displayCount}</span> de ${totalCount} obras
                ${!isShowingAll ? `<span class="daily-rotation">· 📅 selección del día</span>` : ''}
                ${this.searchQuery ? `<span class="filter-active">· filtrado</span>` : ''}
                ${!isShowingAll ? `<button class="load-all-btn">Ver todos →</button>` : ''}
            </div>
        `;
        
        container.appendChild(controls);
        
        // Event listeners
        const searchInput = controls.querySelector('#album-search');
        const clearBtn = controls.querySelector('.search-clear');
        
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
            this.filterTimeline();
            this.render();
        });
        
        clearBtn.addEventListener('click', () => {
            this.searchQuery = '';
            searchInput.value = '';
            clearBtn.classList.remove('visible');
            this.filterTimeline();
            this.render();
        });
        
        controls.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.activeCategory = btn.dataset.category;
                this.filterTimeline();
                this.render();
            });
        });
        
        // "Ver todos" button — load all albums
        const loadAllBtn = controls.querySelector('.load-all-btn');
        if (loadAllBtn) {
            loadAllBtn.addEventListener('click', () => {
                this.showAllAlbums = true;
                this.buildTimeline();
                this.filterTimeline();
                this.render();
            });
        }
    }
    
    createAlbumCard(album, index) {
        const card = document.createElement('div');
        card.className = 'album-card-v2';
        card.dataset.index = index;
        
        // Random height for masonry effect
        const heights = ['short', 'medium', 'tall'];
        const randomHeight = heights[Math.floor(Math.random() * 3)];
        card.dataset.height = randomHeight;
        
        card.innerHTML = `
            <div class="album-card-inner" style="--parallax-x: 0px; --parallax-y: 0px;">
                <div class="album-image-container">
                    <img class="album-image lazy" 
                         data-src="${album.cover}" 
                         alt="${album.name}" 
                         loading="lazy">
                    <div class="image-shimmer"></div>
                </div>
                <div class="album-overlay-v2">
                    <div class="album-badge">${album.count} ${album.count === 1 ? 'foto' : 'fotos'}</div>
                    <div class="album-category-badge">${this.getCategoryIcon(album.category)}</div>
                </div>
                <div class="album-info-v2">
                    <h3 class="album-title-v2">${album.name}</h3>
                </div>
                <div class="album-glow"></div>
            </div>
        `;
        
        // 3D Parallax hover effect
        card.addEventListener('mousemove', (e) => this.handleParallax(e, card));
        card.addEventListener('mouseleave', () => this.resetParallax(card));
        
        card.addEventListener('click', () => this.openAlbum(album));
        
        return card;
    }
    
    getCategoryIcon(categoryId) {
        const cat = this.categories.find(c => c.id === categoryId);
        return cat ? cat.icon : '🎨';
    }
    
    handleParallax(e, card) {
        const inner = card.querySelector('.album-card-inner');
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        inner.style.setProperty('--parallax-x', `${(x - centerX) / 5}px`);
        inner.style.setProperty('--parallax-y', `${(y - centerY) / 5}px`);
    }
    
    resetParallax(card) {
        const inner = card.querySelector('.album-card-inner');
        inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        inner.style.setProperty('--parallax-x', '0px');
        inner.style.setProperty('--parallax-y', '0px');
    }
    
    createBlogCard(post, index) {
        const card = document.createElement('div');
        card.className = 'blog-card-v2';
        card.dataset.index = index;
        
        const hasImage = post.featuredImage || post.image;
        
        card.innerHTML = `
            <div class="blog-card-inner-v2">
                ${hasImage ? `
                    <div class="blog-image-container">
                        <img class="blog-image lazy" 
                             data-src="${post.featuredImage || post.image}" 
                             alt="${post.title}" 
                             loading="lazy">
                    </div>
                ` : ''}
                <div class="blog-content-v2">
                    <div class="blog-meta-v2">
                        <span class="blog-icon">📝</span>
                        <time>${new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    </div>
                    <h3 class="blog-title-v2">${post.title}</h3>
                    <p class="blog-excerpt-v2">${post.excerpt || post.description || ''}</p>
                    <div class="blog-tags-v2">
                        ${(post.tags || []).slice(0, 3).map(tag => `<span class="blog-tag-v2">#${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (post.link) window.open(post.link, '_blank');
        });
        
        return card;
    }
    
    initMasonryLayout(grid) {
        // CSS Grid handles masonry now with grid-auto-flow: dense
        // Just ensure images are loaded
        const images = grid.querySelectorAll('img.lazy');
        images.forEach(img => {
            if (img.dataset.src) {
                img.onload = () => {
                    img.classList.add('loaded');
                    img.previousElementSibling?.classList.add('hidden'); // Hide shimmer
                };
            }
        });
    }
    
    setupLazyLoading() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        this.imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '100px',
            threshold: 0.1
        });
    }
    
    observeImages() {
        document.querySelectorAll('img.lazy[data-src]').forEach(img => {
            this.imageObserver.observe(img);
        });
    }
    
    setupDarkModeListener() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.isDarkMode = e.matches;
            document.body.classList.toggle('dark-mode', this.isDarkMode);
        });
        
        // Initial set
        document.body.classList.toggle('dark-mode', this.isDarkMode);
    }
    
    createLightbox() {
        if (document.getElementById('unified-lightbox-v2')) return;
        
        const lightbox = document.createElement('div');
        lightbox.className = 'unified-lightbox-v2';
        lightbox.id = 'unified-lightbox-v2';
        
        lightbox.innerHTML = `
            <div class="lightbox-backdrop-v2"></div>
            <div class="lightbox-container-v2">
                <div class="lightbox-header-v2">
                    <div class="lightbox-album-info-v2">
                        <h2 class="lightbox-album-title-v2"></h2>
                        <p class="lightbox-album-count-v2"></p>
                    </div>
                    <button class="lightbox-close-v2" aria-label="Cerrar">✕</button>
                </div>
                
                <div class="lightbox-gallery-v2">
                    <button class="lightbox-nav-v2 lightbox-prev-v2" aria-label="Anterior">‹</button>
                    <div class="lightbox-image-container-v2">
                        <img class="lightbox-image-v2" src="" alt="">
                        <div class="lightbox-loader">
                            <div class="loader-spinner"></div>
                        </div>
                    </div>
                    <button class="lightbox-nav-v2 lightbox-next-v2" aria-label="Siguiente">›</button>
                </div>
                
                <div class="lightbox-thumbnails-v2">
                    <div class="lightbox-thumbnails-scroll-v2"></div>
                </div>
                
                <div class="lightbox-progress">
                    <div class="progress-bar"></div>
                </div>
                
                <button class="lightbox-museum-btn-v2" title="Ver en Museo 3D">
                    🏛️ Museo Virtual
                </button>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        
        // Events
        lightbox.querySelector('.lightbox-close-v2').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-backdrop-v2').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-prev-v2').addEventListener('click', () => this.navigateLightbox(-1));
        lightbox.querySelector('.lightbox-next-v2').addEventListener('click', () => this.navigateLightbox(1));
        lightbox.querySelector('.lightbox-museum-btn-v2').addEventListener('click', () => {
            if (window.openMuseoVirtual) {
                this.closeLightbox();
                window.openMuseoVirtual();
            }
        });
        
        // Touch swipe
        const container = lightbox.querySelector('.lightbox-gallery-v2');
        container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });
        container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
            if (e.key === 'ArrowRight') this.navigateLightbox(1);
        });
    }
    
    handleSwipe() {
        const threshold = 50;
        const diff = this.touchEndX - this.touchStartX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.navigateLightbox(-1); // Swipe right = previous
            } else {
                this.navigateLightbox(1); // Swipe left = next
            }
        }
    }
    
    openAlbum(album) {
        this.currentAlbum = album;
        this.currentImageIndex = 0;
        
        const lightbox = document.getElementById('unified-lightbox-v2');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        lightbox.querySelector('.lightbox-album-title-v2').textContent = album.name;
        lightbox.querySelector('.lightbox-album-count-v2').textContent = `${album.count} ${album.count === 1 ? 'imagen' : 'imágenes'}`;
        
        this.buildThumbnails(album);
        this.showImage(0);
    }
    
    buildThumbnails(album) {
        const container = document.querySelector('.lightbox-thumbnails-scroll-v2');
        container.innerHTML = '';
        
        album.images.forEach((img, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'lightbox-thumbnail-v2';
            if (index === 0) thumb.classList.add('active');
            
            thumb.innerHTML = `<img src="${img.path}" alt="${album.name} ${index + 1}" loading="lazy">`;
            thumb.addEventListener('click', () => this.showImage(index));
            
            container.appendChild(thumb);
        });
    }
    
    showImage(index) {
        if (!this.currentAlbum) return;
        
        const images = this.currentAlbum.images;
        if (index < 0 || index >= images.length) return;
        
        this.currentImageIndex = index;
        
        const lightbox = document.getElementById('unified-lightbox-v2');
        const imgEl = lightbox.querySelector('.lightbox-image-v2');
        const loader = lightbox.querySelector('.lightbox-loader');
        
        // Show loader
        loader.classList.add('active');
        
        // Preload image
        const preload = new Image();
        preload.onload = () => {
            imgEl.src = images[index].path;
            loader.classList.remove('active');
            imgEl.classList.add('loaded');
        };
        preload.src = images[index].path;
        
        // Update thumbnails
        lightbox.querySelectorAll('.lightbox-thumbnail-v2').forEach((t, i) => {
            t.classList.toggle('active', i === index);
        });
        
        // Scroll thumbnail into view
        const thumbs = lightbox.querySelectorAll('.lightbox-thumbnail-v2');
        if (thumbs[index]) {
            thumbs[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        
        // Update progress bar
        const progress = ((index + 1) / images.length) * 100;
        lightbox.querySelector('.progress-bar').style.width = `${progress}%`;
        
        // Update nav buttons
        lightbox.querySelector('.lightbox-prev-v2').disabled = index === 0;
        lightbox.querySelector('.lightbox-next-v2').disabled = index === images.length - 1;
    }
    
    navigateLightbox(delta) {
        this.showImage(this.currentImageIndex + delta);
    }
    
    closeLightbox() {
        const lightbox = document.getElementById('unified-lightbox-v2');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        this.currentAlbum = null;
        this.currentImageIndex = 0;
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.id = 'unified-obra-v2-styles';
        style.textContent = `
            /* ═══════════════════════════════════════════════════════════════════
               UNIFIED OBRA v2.0 — Premium Masonry Gallery
               ═══════════════════════════════════════════════════════════════════ */
            
            :root {
                --gallery-bg: #f8f9fa;
                --card-bg: #ffffff;
                --text-primary: #1a1a1a;
                --text-secondary: #666;
                --accent: #667eea;
                --accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                --shadow-sm: 0 2px 8px rgba(0,0,0,0.08);
                --shadow-md: 0 8px 24px rgba(0,0,0,0.12);
                --shadow-lg: 0 16px 48px rgba(0,0,0,0.18);
            }
            
            .dark-mode {
                --gallery-bg: #0a0a0a;
                --card-bg: #1a1a1a;
                --text-primary: #f5f5f5;
                --text-secondary: #999;
            }
            
            /* ═══════════════════════════════════════════════════════════════════
               CONTROLS — Search & Categories
               ═══════════════════════════════════════════════════════════════════ */
            
            .gallery-controls {
                padding: 24px 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .search-container {
                position: relative;
                margin-bottom: 20px;
            }
            
            #album-search {
                width: 100%;
                padding: 16px 50px 16px 20px;
                font-size: 16px;
                border: 2px solid transparent;
                border-radius: 16px;
                background: var(--card-bg);
                color: var(--text-primary);
                box-shadow: var(--shadow-sm);
                transition: all 0.3s ease;
            }
            
            #album-search:focus {
                outline: none;
                border-color: var(--accent);
                box-shadow: var(--shadow-md), 0 0 0 4px rgba(102, 126, 234, 0.1);
            }
            
            .search-clear {
                position: absolute;
                right: 16px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                font-size: 18px;
                color: var(--text-secondary);
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .search-clear.visible {
                opacity: 1;
            }
            
            .category-filters {
                display: flex;
                gap: 12px;
                overflow-x: auto;
                padding-bottom: 12px;
                margin-bottom: 16px;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            
            .category-filters::-webkit-scrollbar {
                display: none;
            }
            
            .category-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 18px;
                border: 2px solid transparent;
                border-radius: 24px;
                background: var(--card-bg);
                color: var(--text-secondary);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.3s ease;
            }
            
            .category-btn:hover {
                border-color: var(--accent);
                color: var(--accent);
            }
            
            .category-btn.active {
                background: var(--accent-gradient);
                color: white;
                border-color: transparent;
            }
            
            .cat-icon {
                font-size: 18px;
            }
            
            .gallery-stats {
                font-size: 14px;
                color: var(--text-secondary);
            }
            
            .stat-count {
                font-weight: 700;
                font-size: 20px;
                color: var(--text-primary);
            }
            
            .filter-active {
                color: var(--accent);
            }
            
            .daily-rotation {
                color: var(--accent);
                font-style: italic;
            }
            
            .load-all-btn {
                display: inline-block;
                margin-left: 12px;
                padding: 6px 14px;
                background: var(--accent-gradient);
                color: white;
                border: none;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .load-all-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            /* ═══════════════════════════════════════════════════════════════════
               MASONRY GRID
               ═══════════════════════════════════════════════════════════════════ */
            
            .unified-obra-grid-v2 {
                background: var(--gallery-bg);
                min-height: 100vh;
            }
            
            .masonry-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                grid-auto-rows: 10px;
                gap: 24px;
                padding: 0 20px 60px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            /* ═══════════════════════════════════════════════════════════════════
               ALBUM CARDS v2 — 3D Parallax
               ═══════════════════════════════════════════════════════════════════ */
            
            .album-card-v2 {
                border-radius: 16px;
                overflow: hidden;
                cursor: pointer;
                perspective: 1000px;
            }
            
            .album-card-v2[data-height="short"] {
                grid-row: span 28;
            }
            
            .album-card-v2[data-height="medium"] {
                grid-row: span 35;
            }
            
            .album-card-v2[data-height="tall"] {
                grid-row: span 42;
            }
            
            .album-card-inner {
                position: relative;
                height: 100%;
                background: var(--card-bg);
                border-radius: 16px;
                overflow: hidden;
                transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease;
                box-shadow: var(--shadow-sm);
            }
            
            .album-card-v2:hover .album-card-inner {
                box-shadow: var(--shadow-lg);
            }
            
            .album-image-container {
                position: relative;
                width: 100%;
                height: 100%;
            }
            
            .album-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 0;
                transition: opacity 0.5s ease, transform 0.4s ease;
            }
            
            .album-image.loaded {
                opacity: 1;
            }
            
            .album-card-v2:hover .album-image {
                transform: translate(var(--parallax-x), var(--parallax-y)) scale(1.05);
            }
            
            .image-shimmer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            
            .dark-mode .image-shimmer {
                background: linear-gradient(90deg, #222 25%, #333 50%, #222 75%);
                background-size: 200% 100%;
            }
            
            .image-shimmer.hidden {
                opacity: 0;
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            .album-overlay-v2 {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(
                    to bottom,
                    rgba(0,0,0,0) 0%,
                    rgba(0,0,0,0) 50%,
                    rgba(0,0,0,0.8) 100%
                );
                opacity: 0;
                transition: opacity 0.3s ease;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 16px;
            }
            
            .album-card-v2:hover .album-overlay-v2 {
                opacity: 1;
            }
            
            .album-badge {
                background: rgba(255,255,255,0.95);
                color: #1a1a1a;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            
            .album-category-badge {
                width: 32px;
                height: 32px;
                background: rgba(255,255,255,0.95);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            
            .album-info-v2 {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 16px;
                background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                transform: translateY(100%);
                transition: transform 0.3s ease;
            }
            
            .album-card-v2:hover .album-info-v2 {
                transform: translateY(0);
            }
            
            .album-title-v2 {
                font-size: 16px;
                font-weight: 600;
                color: white;
                margin: 0;
                line-height: 1.4;
                text-shadow: 0 2px 4px rgba(0,0,0,0.5);
            }
            
            .album-glow {
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%);
                opacity: 0;
                transition: opacity 0.4s ease;
                pointer-events: none;
            }
            
            .album-card-v2:hover .album-glow {
                opacity: 1;
            }
            
            /* ═══════════════════════════════════════════════════════════════════
               BLOG CARDS v2
               ═══════════════════════════════════════════════════════════════════ */
            
            .blog-card-v2 {
                grid-column: span 2;
                grid-row: span 32;
                border-radius: 16px;
                overflow: hidden;
                cursor: pointer;
            }
            
            @media (max-width: 768px) {
                .blog-card-v2 {
                    grid-column: span 1;
                }
            }
            
            .blog-card-inner-v2 {
                height: 100%;
                background: var(--accent-gradient);
                display: flex;
                flex-direction: column;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .blog-card-v2:hover .blog-card-inner-v2 {
                transform: translateY(-4px);
                box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
            }
            
            .blog-image-container {
                height: 180px;
                overflow: hidden;
            }
            
            .blog-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.4s ease;
            }
            
            .blog-card-v2:hover .blog-image {
                transform: scale(1.05);
            }
            
            .blog-content-v2 {
                padding: 24px;
                color: white;
                flex: 1;
            }
            
            .blog-meta-v2 {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
                opacity: 0.9;
            }
            
            .blog-title-v2 {
                font-size: 20px;
                font-weight: 700;
                margin: 0 0 12px;
                line-height: 1.3;
            }
            
            .blog-excerpt-v2 {
                font-size: 14px;
                line-height: 1.6;
                opacity: 0.9;
                margin: 0 0 16px;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .blog-tags-v2 {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .blog-tag-v2 {
                background: rgba(255,255,255,0.2);
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 500;
                backdrop-filter: blur(4px);
            }
            
            /* ═══════════════════════════════════════════════════════════════════
               LIGHTBOX v2 — Premium Viewer
               ═══════════════════════════════════════════════════════════════════ */
            
            .unified-lightbox-v2 {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: none;
                align-items: center;
                justify-content: center;
            }
            
            .unified-lightbox-v2.active {
                display: flex;
                animation: lightboxFadeIn 0.3s ease;
            }
            
            @keyframes lightboxFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .lightbox-backdrop-v2 {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.95);
                backdrop-filter: blur(10px);
            }
            
            .lightbox-container-v2 {
                position: relative;
                width: 95vw;
                height: 95vh;
                max-width: 1400px;
                display: flex;
                flex-direction: column;
                background: #0a0a0a;
                border-radius: 20px;
                overflow: hidden;
                animation: lightboxSlideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes lightboxSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(40px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .lightbox-header-v2 {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: #111;
                border-bottom: 1px solid #222;
            }
            
            .lightbox-album-title-v2 {
                font-size: 22px;
                font-weight: 700;
                color: white;
                margin: 0 0 4px;
            }
            
            .lightbox-album-count-v2 {
                font-size: 14px;
                color: #888;
                margin: 0;
            }
            
            .lightbox-close-v2 {
                background: rgba(255,255,255,0.1);
                border: none;
                color: white;
                font-size: 24px;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .lightbox-close-v2:hover {
                background: rgba(255,255,255,0.2);
                transform: scale(1.1);
            }
            
            .lightbox-gallery-v2 {
                position: relative;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #000;
                overflow: hidden;
            }
            
            .lightbox-image-container-v2 {
                position: relative;
                max-width: 100%;
                max-height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .lightbox-image-v2 {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .lightbox-image-v2.loaded {
                opacity: 1;
            }
            
            .lightbox-loader {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: none;
            }
            
            .lightbox-loader.active {
                display: block;
            }
            
            .loader-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(255,255,255,0.1);
                border-top-color: var(--accent);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .lightbox-nav-v2 {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border: none;
                color: white;
                font-size: 36px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
                z-index: 10;
            }
            
            .lightbox-nav-v2:hover:not(:disabled) {
                background: rgba(255,255,255,0.2);
                transform: translateY(-50%) scale(1.1);
            }
            
            .lightbox-nav-v2:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            
            .lightbox-prev-v2 { left: 20px; }
            .lightbox-next-v2 { right: 20px; }
            
            .lightbox-thumbnails-v2 {
                background: #111;
                padding: 16px;
                border-top: 1px solid #222;
            }
            
            .lightbox-thumbnails-scroll-v2 {
                display: flex;
                gap: 12px;
                overflow-x: auto;
                padding-bottom: 8px;
                scrollbar-width: thin;
                scrollbar-color: #333 #111;
            }
            
            .lightbox-thumbnail-v2 {
                flex-shrink: 0;
                width: 70px;
                height: 70px;
                border-radius: 10px;
                overflow: hidden;
                cursor: pointer;
                border: 3px solid transparent;
                transition: all 0.2s;
                opacity: 0.6;
            }
            
            .lightbox-thumbnail-v2:hover {
                opacity: 1;
                border-color: var(--accent);
            }
            
            .lightbox-thumbnail-v2.active {
                opacity: 1;
                border-color: white;
            }
            
            .lightbox-thumbnail-v2 img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .lightbox-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: rgba(255,255,255,0.1);
            }
            
            .progress-bar {
                height: 100%;
                background: var(--accent-gradient);
                width: 0%;
                transition: width 0.3s ease;
            }
            
            .lightbox-museum-btn-v2 {
                position: absolute;
                bottom: 100px;
                right: 24px;
                background: var(--accent-gradient);
                color: white;
                border: none;
                padding: 14px 28px;
                border-radius: 28px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
            }
            
            .lightbox-museum-btn-v2:hover {
                transform: scale(1.05);
                box-shadow: 0 12px 32px rgba(102, 126, 234, 0.6);
            }
            
            /* ═══════════════════════════════════════════════════════════════════
               RESPONSIVE
               ═══════════════════════════════════════════════════════════════════ */
            
            @media (max-width: 768px) {
                .masonry-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    padding: 0 12px 40px;
                }
                
                .album-card-v2[data-height="short"],
                .album-card-v2[data-height="medium"],
                .album-card-v2[data-height="tall"] {
                    grid-row: span 22;
                }
                
                .gallery-controls {
                    padding: 16px 12px;
                }
                
                .category-btn {
                    padding: 8px 14px;
                    font-size: 13px;
                }
                
                .lightbox-container-v2 {
                    width: 100vw;
                    height: 100vh;
                    border-radius: 0;
                }
                
                .lightbox-nav-v2 {
                    width: 44px;
                    height: 44px;
                    font-size: 28px;
                }
                
                .lightbox-prev-v2 { left: 8px; }
                .lightbox-next-v2 { right: 8px; }
                
                .lightbox-museum-btn-v2 {
                    bottom: 90px;
                    right: 16px;
                    padding: 12px 20px;
                    font-size: 13px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize
window.unifiedObraSystemV2 = new UnifiedObraSystemV2();

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.unifiedObraSystemV2.init());
} else {
    window.unifiedObraSystemV2.init();
}

// Also expose as v1 replacement
window.unifiedObraSystem = window.unifiedObraSystemV2;

console.log('🎨 Unified Obra System v2.0 loaded with all enhancements');
