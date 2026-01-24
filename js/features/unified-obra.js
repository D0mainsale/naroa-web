/**
 * UNIFIED OBRA SYSTEM — Álbumes + Bitácora Unificados
 * Vista estilo Facebook: Grid de álbumes con posts intercalados
 * 
 * Features:
 * 📦 211 álbumes organizados cronológicamente
 * 📝 Posts de bitácora intercalados como hitos
 * 🖼️ Lightbox para explorar álbum completo
 * 🔍 Sin repeticiones entre álbumes
 * 🎨 Layout premium tipo Facebook/Instagram
 * 
 * v1.0.0 - 2026-01-24
 */

class UnifiedObraSystem {
    constructor() {
        this.albums = [];
        this.blogPosts = [];
        this.timeline = [];
        this.currentAlbum = null;
        this.currentImageIndex = 0;
        this.dataLoaded = false;
        this.rendered = false;
        
        console.log('📦 Unified Obra System initialized');
    }
    
    async init() {
        // Solo cargar datos una vez
        if (!this.dataLoaded) {
            await this.loadData();
            this.buildTimeline();
            this.addStyles();
            this.createLightbox();
            this.dataLoaded = true;
        }
        
        // Renderizar si estamos en portfolio
        this.checkAndRender();
        
        // Escuchar cambios de hash
        window.addEventListener('hashchange', () => this.checkAndRender());
        
        console.log(`✅ Loaded ${this.albums.length} albums + ${this.blogPosts.length} blog posts`);
    }
    
    checkAndRender() {
        const hash = window.location.hash;
        if (hash === '#/portfolio' || hash === '#/obras') {
            // Pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => this.render(), 100);
        }
    }

    
    async loadData() {
        // Load albums index
        try {
            const imagesResponse = await fetch('/data/images-index.json');
            const images = await imagesResponse.json();
            
            // Group by album
            const albumsMap = new Map();
            images.forEach(img => {
                if (!img.albumId) return;
                
                if (!albumsMap.has(img.albumId)) {
                    albumsMap.set(img.albumId, {
                        id: img.albumId,
                        name: img.albumName || 'Sin título',
                        images: [],
                        cover: null,
                        count: 0
                    });
                }
                
                const album = albumsMap.get(img.albumId);
                album.images.push(img);
                album.count++;
                
                // First image as cover
                if (!album.cover) {
                    album.cover = img.path;
                }
            });
            
            this.albums = Array.from(albumsMap.values());
            
            // Sort by count (more images first) then by name
            this.albums.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
            
        } catch (err) {
            console.error('Error loading albums:', err);
        }
        
        // Load blog posts
        try {
            const blogResponse = await fetch('/data/blog.json');
            this.blogPosts = await blogResponse.json();
        } catch (err) {
            console.error('Error loading blog:', err);
        }
    }
    
    // === IMAGE PATH HELPERS ===
    
    /**
     * Convert image path to optimized WebP thumbnail (for grid view)
     */
    getThumbnailPath(originalPath) {
        if (!originalPath) return '/images/placeholder.jpg';
        
        // Replace /images/ with /images/thumbnails/
        // And change extension to .webp
        const thumbPath = originalPath
            .replace('/images/', '/images/thumbnails/')
            .replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        return thumbPath;
    }
    
    /**
     * Convert image path to optimized WebP (for lightbox view)
     */
    getOptimizedPath(originalPath) {
        if (!originalPath) return '/images/placeholder.jpg';
        
        // Replace /images/ with /images/optimized/
        // And change extension to .webp
        const optPath = originalPath
            .replace('/images/', '/images/optimized/')
            .replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        return optPath;
    }

    
    buildTimeline() {
        // Combine albums and blog posts in chronological order
        // Albums don't have dates, so we'll put them first
        // Blog posts have dates, so they go after ordered by date
        
        this.timeline = [
            ...this.albums.map(album => ({ type: 'album', data: album })),
            ...this.blogPosts.map(post => ({ type: 'post', data: post }))
        ];
        
        console.log(`📅 Timeline built: ${this.timeline.length} items`);
    }
    
    render() {
        const container = document.getElementById('portfolio-grid');
        if (!container) return;
        
        // Reset pagination - Start with fewer items for fast initial load
        this.currentPage = 0;
        this.itemsPerPage = 12;  // Fast initial load
        this.loadMoreCount = 8;  // Smaller batches
        this.allLoaded = false;
        
        container.innerHTML = '';
        container.className = 'unified-obra-grid';
        
        // Cargar primera página
        this.loadMoreItems(container);
        
        // Setup infinite scroll
        this.setupInfiniteScroll(container);
        
        console.log('🎨 Unified gallery initialized with infinite scroll');
    }

    
    loadMoreItems(container) {
        const startIndex = this.currentPage * (this.currentPage === 0 ? this.itemsPerPage : this.loadMoreCount);
        const endIndex = startIndex + (this.currentPage === 0 ? this.itemsPerPage : this.loadMoreCount);
        const itemsToLoad = this.timeline.slice(startIndex, endIndex);
        
        if (itemsToLoad.length === 0) {
            this.allLoaded = true;
            return;
        }
        
        // Remove loading indicator if exists
        const loader = container.querySelector('.load-more-indicator');
        if (loader) loader.remove();
        
        itemsToLoad.forEach((item, i) => {
            const globalIndex = startIndex + i;
            if (item.type === 'album') {
                container.appendChild(this.createAlbumCard(item.data, globalIndex));
            } else if (item.type === 'post') {
                container.appendChild(this.createBlogCard(item.data, globalIndex));
            }
        });
        
        this.currentPage++;
        
        // Add loading indicator if more items
        if (endIndex < this.timeline.length) {
            const loadIndicator = document.createElement('div');
            loadIndicator.className = 'load-more-indicator';
            loadIndicator.innerHTML = '<span class="loading-dots">Cargando más...</span>';
            container.appendChild(loadIndicator);
        }
        
        console.log(`📦 Loaded items ${startIndex}-${endIndex} of ${this.timeline.length}`);
    }
    
    setupInfiniteScroll(container) {
        // Throttle scroll checks
        let isLoading = false;
        
        const checkScroll = () => {
            if (isLoading || this.allLoaded) return;
            
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Load more when 300px from bottom
            if (scrollY + viewportHeight >= documentHeight - 300) {
                isLoading = true;
                this.loadMoreItems(container);
                setTimeout(() => isLoading = false, 200);
            }
            
            // Parallax effect
            this.applyParallax();
        };
        
        // Remove previous listener if exists
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
        
        this.scrollHandler = checkScroll;
        window.addEventListener('scroll', checkScroll, { passive: true });
    }
    
    applyParallax() {
        const cards = document.querySelectorAll('.unified-album-card');
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.top + rect.height / 2;
            const viewportCenter = viewportHeight / 2;
            
            // Only apply parallax to visible cards
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const offset = (cardCenter - viewportCenter) * 0.05;
                const imgOffset = (cardCenter - viewportCenter) * -0.02;
                
                card.style.setProperty('--parallax-offset', offset);
                card.style.setProperty('--parallax-img', imgOffset);
                card.classList.add('parallax-active');
            }
        });
    }


    
    createAlbumCard(album, index) {
        const card = document.createElement('div');
        card.className = 'unified-album-card';
        card.dataset.index = index;
        
        // Use thumbnail for grid with blur-up effect
        const thumbSrc = this.getThumbnailPath(album.cover);
        
        card.innerHTML = `
            <div class="album-card-inner">
                <div class="album-cover">
                    <div class="album-placeholder"></div>
                    <img data-src="${thumbSrc}" data-fallback="${album.cover}" alt="${album.name}" class="album-img lazy">
                    <div class="album-overlay">
                        <div class="album-count">${album.count} ${album.count === 1 ? 'foto' : 'fotos'}</div>
                    </div>
                </div>
                <div class="album-info">
                    <h3 class="album-title">${album.name}</h3>
                </div>
            </div>
        `;

        // Setup lazy loading
        this.setupLazyLoad(card.querySelector('.album-img'));
        
        card.addEventListener('click', () => this.openAlbum(album));
        
        return card;
    }
    
    setupLazyLoad(img) {
        if (!this.lazyObserver) {
            this.lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.onerror = () => { img.src = img.dataset.fallback; };
                        img.onload = () => img.classList.add('loaded');
                        this.lazyObserver.unobserve(img);
                    }
                });
            }, { rootMargin: '100px' });
        }
        
        this.lazyObserver.observe(img);
    }

    
    createBlogCard(post, index) {
        const card = document.createElement('div');
        card.className = 'unified-blog-card';
        card.dataset.index = index;
        
        const hasImage = post.featuredImage || post.image;
        const imageHtml = hasImage ? `
            <div class="blog-card-image">
                <img src="${post.featuredImage || post.image}" alt="${post.title}" loading="lazy">
            </div>
        ` : '';
        
        card.innerHTML = `
            <div class="blog-card-inner">
                ${imageHtml}
                <div class="blog-card-content">
                    <div class="blog-card-meta">
                        <span class="blog-icon">📝</span>
                        <time>${new Date(post.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
                    </div>
                    <h3 class="blog-card-title">${post.title}</h3>
                    <p class="blog-card-excerpt">${post.excerpt || post.description || ''}</p>
                    <div class="blog-card-tags">
                        ${(post.tags || []).map(tag => `<span class="blog-tag">#${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (post.link) {
                window.open(post.link, '_blank');
            }
        });
        
        return card;
    }
    
    createLightbox() {
        // Evitar duplicados
        if (document.getElementById('unified-lightbox')) return;
        
        const lightbox = document.createElement('div');
        lightbox.className = 'unified-lightbox';
        lightbox.id = 'unified-lightbox';
        
        lightbox.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <div class="lightbox-container">
                <div class="lightbox-header">
                    <div class="lightbox-album-info">
                        <h2 class="lightbox-album-title"></h2>
                        <p class="lightbox-album-count"></p>
                    </div>
                    <button class="lightbox-close" aria-label="Cerrar">✕</button>
                </div>
                
                <div class="lightbox-gallery">
                    <button class="lightbox-nav lightbox-prev" aria-label="Anterior">‹</button>
                    <div class="lightbox-image-container">
                        <img class="lightbox-image" src="" alt="">
                    </div>
                    <button class="lightbox-nav lightbox-next" aria-label="Siguiente">›</button>
                </div>
                
                <div class="lightbox-thumbnails">
                    <div class="lightbox-thumbnails-scroll"></div>
                </div>
                
                <button class="lightbox-museum-btn" title="Ver en Museo 3D">
                    🏛️ Museo Virtual
                </button>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        
        // Events
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-backdrop').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.navigateLightbox(-1));
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.navigateLightbox(1));
        lightbox.querySelector('.lightbox-museum-btn').addEventListener('click', () => {
            if (window.unifiedGallery) {
                this.closeLightbox();
                window.unifiedGallery.openMuseum();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.navigateLightbox(-1);
            if (e.key === 'ArrowRight') this.navigateLightbox(1);
        });
    }
    
    openAlbum(album) {
        this.currentAlbum = album;
        this.currentImageIndex = 0;
        
        const lightbox = document.getElementById('unified-lightbox');
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Update header
        lightbox.querySelector('.lightbox-album-title').textContent = album.name;
        lightbox.querySelector('.lightbox-album-count').textContent = `${album.count} ${album.count === 1 ? 'imagen' : 'imágenes'}`;
        
        // Build thumbnails
        this.buildThumbnails(album);
        
        // Show first image
        this.showImage(0);
        
        console.log(`🖼️ Opened album: ${album.name} (${album.count} images)`);
    }
    
    buildThumbnails(album) {
        const container = document.querySelector('.lightbox-thumbnails-scroll');
        container.innerHTML = '';
        
        album.images.forEach((img, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'lightbox-thumbnail';
            if (index === 0) thumb.classList.add('active');
            
            // Use thumbnails for the scroll bar
            const thumbSrc = this.getThumbnailPath(img.path);
            thumb.innerHTML = `<img src="${thumbSrc}" alt="${album.name} ${index + 1}" loading="lazy" onerror="this.src='${img.path}'">`;
            thumb.addEventListener('click', () => this.showImage(index));
            
            container.appendChild(thumb);
        });
    }

    
    showImage(index) {
        if (!this.currentAlbum) return;
        
        const images = this.currentAlbum.images;
        if (index < 0 || index >= images.length) return;
        
        this.currentImageIndex = index;
        
        const lightbox = document.getElementById('unified-lightbox');
        const imgEl = lightbox.querySelector('.lightbox-image');
        
        // Use optimized WebP with fallback to original
        const optimizedSrc = this.getOptimizedPath(images[index].path);
        imgEl.src = optimizedSrc;
        imgEl.onerror = () => { imgEl.src = images[index].path; };
        
        // Update active thumbnail
        const thumbs = lightbox.querySelectorAll('.lightbox-thumbnail');
        thumbs.forEach((t, i) => {
            t.classList.toggle('active', i === index);
        });
        
        // Scroll thumbnail into view
        if (thumbs[index]) {
            thumbs[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
        
        // Update nav buttons
        lightbox.querySelector('.lightbox-prev').disabled = index === 0;
        lightbox.querySelector('.lightbox-next').disabled = index === images.length - 1;
    }

    
    navigateLightbox(delta) {
        this.showImage(this.currentImageIndex + delta);
    }
    
    closeLightbox() {
        const lightbox = document.getElementById('unified-lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        this.currentAlbum = null;
        this.currentImageIndex = 0;
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* ═══════════════════════════════════════════════════════
               UNIFIED OBRA GRID — Facebook-style Albums + Blog
               ═══════════════════════════════════════════════════════ */
            
            .unified-obra-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 24px;
                padding: 40px 20px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            /* Album Cards */
            .unified-album-card {
                background: #fff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 12px rgba(0,0,0,0.08);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            
            .unified-album-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            }
            
            .album-cover {
                position: relative;
                width: 100%;
                padding-top: 100%; /* Square aspect ratio */
                background: #f5f5f5;
                overflow: hidden;
            }
            
            /* Blur placeholder */
            .album-placeholder {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 50%, #e0e0e0 100%);
                background-size: 200% 200%;
                animation: shimmer 1.5s infinite;
            }
            
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .album-cover img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.4s ease, opacity 0.3s ease;
                opacity: 0;
            }
            
            .album-cover img.loaded {
                opacity: 1;
            }
            
            .album-cover img.loaded + .album-placeholder,
            .album-img.loaded ~ .album-placeholder {
                display: none;
            }

            
            .unified-album-card:hover .album-cover img {
                transform: scale(1.05);
            }
            
            .album-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
                padding: 16px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .unified-album-card:hover .album-overlay {
                opacity: 1;
            }
            
            .album-count {
                color: white;
                font-size: 14px;
                font-weight: 600;
            }
            
            .album-info {
                padding: 16px;
            }
            
            .album-title {
                font-size: 16px;
                font-weight: 600;
                color: #1a1a1a;
                margin: 0;
                line-height: 1.4;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            /* Blog Cards */
            .unified-blog-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                grid-column: span 2;
            }
            
            @media (max-width: 768px) {
                .unified-blog-card {
                    grid-column: span 1;
                }
            }
            
            .unified-blog-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
            }
            
            .blog-card-inner {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            
            .blog-card-image {
                width: 100%;
                height: 200px;
                overflow: hidden;
            }
            
            .blog-card-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.4s ease;
            }
            
            .unified-blog-card:hover .blog-card-image img {
                transform: scale(1.05);
            }
            
            .blog-card-content {
                padding: 24px;
                color: white;
                flex: 1;
            }
            
            .blog-card-meta {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
                opacity: 0.9;
            }
            
            .blog-icon {
                font-size: 18px;
            }
            
            .blog-card-meta time {
                font-size: 13px;
                font-weight: 500;
            }
            
            .blog-card-title {
                font-size: 20px;
                font-weight: 700;
                color: white;
                margin: 0 0 12px;
                line-height: 1.3;
            }
            
            .blog-card-excerpt {
                font-size: 14px;
                line-height: 1.6;
                opacity: 0.95;
                margin: 0 0 16px;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
            
            .blog-card-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .blog-tag {
                background: rgba(255,255,255,0.2);
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 500;
            }
            
            /* ═══════════════════════════════════════════════════════
               LIGHTBOX — Album Viewer
               ═══════════════════════════════════════════════════════ */
            
            .unified-lightbox {
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
            
            .unified-lightbox.active {
                display: flex;
            }
            
            .lightbox-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.95);
            }
            
            .lightbox-container {
                position: relative;
                width: 90vw;
                height: 90vh;
                max-width: 1200px;
                display: flex;
                flex-direction: column;
                background: #1a1a1a;
                border-radius: 16px;
                overflow: hidden;
            }
            
            .lightbox-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                background: #222;
                border-bottom: 1px solid #333;
            }
            
            .lightbox-album-title {
                font-size: 20px;
                font-weight: 700;
                color: white;
                margin: 0 0 4px;
            }
            
            .lightbox-album-count {
                font-size: 14px;
                color: #999;
                margin: 0;
            }
            
            .lightbox-close {
                background: transparent;
                border: none;
                color: white;
                font-size: 32px;
                cursor: pointer;
                padding: 8px;
                line-height: 1;
                transition: color 0.2s;
            }
            
            .lightbox-close:hover {
                color: #ff4444;
            }
            
            .lightbox-gallery {
                position: relative;
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #000;
            }
            
            .lightbox-image-container {
                max-width: 100%;
                max-height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .lightbox-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            
            .lightbox-nav {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border: none;
                color: white;
                font-size: 48px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
                z-index: 10;
            }
            
            .lightbox-nav:hover:not(:disabled) {
                background: rgba(255,255,255,0.2);
                transform: translateY(-50%) scale(1.1);
            }
            
            .lightbox-nav:disabled {
                opacity: 0.3;
                cursor: not-allowed;
            }
            
            .lightbox-prev {
                left: 20px;
            }
            
            .lightbox-next {
                right: 20px;
            }
            
            .lightbox-thumbnails {
                background: #222;
                padding: 16px;
                border-top: 1px solid #333;
                overflow: hidden;
            }
            
            .lightbox-thumbnails-scroll {
                display: flex;
                gap: 12px;
                overflow-x: auto;
                padding-bottom: 8px;
                scrollbar-width: thin;
                scrollbar-color: #444 #222;
            }
            
            .lightbox-thumbnail {
                flex-shrink: 0;
                width: 80px;
                height: 80px;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                border: 3px solid transparent;
                transition: all 0.2s;
            }
            
            .lightbox-thumbnail:hover {
                border-color: #667eea;
            }
            
            .lightbox-thumbnail.active {
                border-color: #fff;
            }
            
            .lightbox-thumbnail img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .lightbox-museum-btn {
                position: absolute;
                bottom: 120px;
                right: 24px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 24px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            .lightbox-museum-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            
            /* ═══════════════════════════════════════════════════════
               INFINITE SCROLL & LOADING
               ═══════════════════════════════════════════════════════ */
            
            .load-more-indicator {
                grid-column: 1 / -1;
                text-align: center;
                padding: 40px;
                color: #999;
                font-size: 14px;
            }
            
            .loading-dots {
                display: inline-block;
                animation: pulse 1.5s ease-in-out infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.4; }
                50% { opacity: 1; }
            }
            
            /* Skeleton Loading for images */
            .album-cover img,
            .blog-card-image img {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            /* ═══════════════════════════════════════════════════════
               PARALLAX EFFECT
               ═══════════════════════════════════════════════════════ */
            
            .unified-album-card,
            .unified-blog-card {
                transform: translateY(0);
                transition: transform 0.3s ease-out, box-shadow 0.3s ease;
            }
            
            .unified-album-card.parallax-active {
                transform: translateY(calc(var(--parallax-offset, 0) * 1px));
            }
            
            .unified-album-card .album-cover img {
                transform: scale(1.1) translateY(calc(var(--parallax-img, 0) * 1px));
                transition: transform 0.1s linear;
            }
            
            /* Staggered reveal animation */
            .unified-album-card,
            .unified-blog-card {
                opacity: 0;
                animation: fadeInUp 0.6s ease forwards;
            }
            
            .unified-album-card:nth-child(1) { animation-delay: 0.05s; }
            .unified-album-card:nth-child(2) { animation-delay: 0.1s; }
            .unified-album-card:nth-child(3) { animation-delay: 0.15s; }
            .unified-album-card:nth-child(4) { animation-delay: 0.2s; }
            .unified-album-card:nth-child(5) { animation-delay: 0.25s; }
            .unified-album-card:nth-child(6) { animation-delay: 0.3s; }
            .unified-album-card:nth-child(n+7) { animation-delay: 0.35s; }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

        
        document.head.appendChild(style);
    }
}

// Initialize
window.unifiedObraSystem = new UnifiedObraSystem();

// Auto-init when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.unifiedObraSystem.init());
} else {
    window.unifiedObraSystem.init();
}
