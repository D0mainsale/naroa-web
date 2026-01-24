// === PORTFOLIO CONTROLLER ===
class Portfolio {
    constructor(router) {
        this.router = router;
        this.obras = [];
        this.blogPosts = [];
    }
    
    async init() {
        try {
            // Load optimized image index (2800+ images from Facebook archive)
            const res = await fetch('/data/images-index.json');
            const allImagesRaw = await res.json();
            
            // Map to internal structure
            const allImages = allImagesRaw.map(img => ({
                id: img.id,
                titulo: img.albumName || 'Sin título',
                albumName: img.albumName,
                imagen: img.path,
                albumId: img.albumId,
                imageIndex: img.index,
                ritual: Math.random() > 0.9 // 10% ritual effect
            }));
            
            // 🎲 SHUFFLE ALEATORIO - Cada visita es única
            this.shuffleArray(allImages);
            
            // Limit to 306 for initial load (avoid DOM overload)
            this.obras = allImages.slice(0, 306);
            this.allObras = allImages;
            this.filteredObras = null;

            console.log(`✅ Portfolio loaded: ${this.obras.length} of ${allImages.length} images`);

            // Load blog posts from static JSON
            try {
                const blogRes = await fetch('/data/blog.json');
                this.blogPosts = await blogRes.json();
            } catch (e) {
                console.warn('Blog posts not loaded:', e);
                this.blogPosts = [];
            }
            
        } catch (e) {
            console.error('Error loading portfolio data:', e);
        }
    }
    
    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    
    renderGrid() {
        // DISABLED: El nuevo sistema UnifiedObraSystem se encarga del portfolio
        // Si unified-obra está activo, no hacer nada
        if (window.unifiedObraSystem && window.unifiedObraSystem.dataLoaded) {
            console.log('📦 Portfolio.renderGrid() cediendo control a UnifiedObraSystem');
            return;
        }
        
        const view = document.getElementById('portfolio-view');
        const grid = document.getElementById('portfolio-grid');
        view.classList.remove('hidden');
        grid.innerHTML = '';
        
        // Aplicar clase premium al grid
        grid.classList.add('portfolio-grid-premium');
        
        // Coordenadas del taller (Bilbao)
        const baseCoords = { lat: 43.2630, lng: -2.9350 };
        const materials = ['Grafito sobre papel', 'Carbón y mica', 'Acrílico sobre lienzo', 'Técnica mixta', 'Mica sobre verjurado'];
        
        const obrasToRender = this.filteredObras || this.obras;
        
        obrasToRender.forEach((obra, idx) => {
            const card = document.createElement('a');
            card.href = `#/portfolio/${obra.id}`;
            card.className = 'portfolio-card';
            card.dataset.index = idx;
            card.dataset.reveal = '';
            card.dataset['3dCard'] = ''; // Para el efecto 3D
            
            // Todas las tarjetas con tamaño uniforme
            
            // Variación de coordenadas para cada obra
            const lat = (baseCoords.lat + (Math.random() - 0.5) * 0.01).toFixed(4);
            const lng = (baseCoords.lng + (Math.random() - 0.5) * 0.01).toFixed(4);
            const material = materials[idx % materials.length];
            
            card.innerHTML = `
                <figure class="card-image img-reveal">
                    <img src="${obra.imagen}" alt="${obra.titulo}" loading="lazy">
                    <div class="card-overlay">
                        <span class="view-work">Ver obra</span>
                    </div>
                </figure>
                <div class="card-info">
                    <span class="card-coords">${lat}°N ${Math.abs(lng).toFixed(4)}°W</span>
                    <h3 class="card-title">${obra.titulo}</h3>
                    <span class="card-material">${material}</span>
                    ${obra.ritual ? '<span class="ritual-indicator">◉</span>' : ''}
                </div>
            `;
            grid.appendChild(card);
        });
        
        // IntersectionObserver para entrada ritual
        this.initRevealObserver();
        
        // Glitch aleatorio cada 30s
        this.initRandomGlitch();
        
        // Inicializar hover 3D effects (si el sistema ya está cargado)
        setTimeout(() => {
            if (typeof Card3D !== 'undefined') {
                new Card3D();
            }
        }, 100);
    }
    
    initRevealObserver() {
        const cards = document.querySelectorAll('.portfolio-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Delay escalonado para efecto "respiración"
                    const delay = parseInt(entry.target.dataset.index) * 100;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '50px' });
        
        cards.forEach(card => observer.observe(card));
    }
    
    initRandomGlitch() {
        // Limpiar intervalo anterior si existe
        if (this.glitchInterval) clearInterval(this.glitchInterval);
        
        this.glitchInterval = setInterval(() => {
            const cards = document.querySelectorAll('.portfolio-card.revealed');
            if (cards.length === 0) return;
            
            const randomCard = cards[Math.floor(Math.random() * cards.length)];
            randomCard.classList.add('glitching');
            
            setTimeout(() => {
                randomCard.classList.remove('glitching');
            }, 200);
        }, 30000); // Cada 30 segundos
    }
    
    renderProcess() {
        document.getElementById('process-view').classList.remove('hidden');
        document.querySelectorAll('.process-block').forEach((b, i) => {
            b.style.animationDelay = `${i * 0.1}s`;
            b.classList.add('animate-in');
        });
    }
    
    renderAbout() {
        document.getElementById('about-view').classList.remove('hidden');
    }

    renderBitacora() {
        const view = document.getElementById('bitacora-view');
        view.classList.remove('hidden');
        
        // Inicializar sistema premium de bitácora
        if (typeof BitacoraSystem !== 'undefined') {
            window.bitacoraSystem = new BitacoraSystem(this.blogPosts);
        } else {
            console.warn('BitacoraSystem no cargado, usando fallback');
            this.renderBitacoraFallback();
        }
    }
    
    renderBitacoraFallback() {
        const list = document.getElementById('bitacora-list');
        list.innerHTML = this.blogPosts.map((post, i) => {
            const readTime = Math.max(1, Math.ceil(post.content.split(' ').length / 200));
            const date = new Date(post.date);
            const formattedDate = date.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            
            return `
                <article class="blog-post" style="animation-delay: ${i * 0.15}s">
                    <div class="post-meta">
                        <time class="post-date">${formattedDate}</time>
                        <span class="post-reading-time">${readTime} min lectura</span>
                    </div>
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-excerpt">"${post.excerpt}"</p>
                    <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                    </div>
                </article>
            `;
        }).join('');
    }
    
    // === LIGHTBOX DE OBRA INDIVIDUAL ===
    showObra(obraId) {
        const obra = this.obras.find(o => o.id === obraId);
        if (!obra) {
            console.warn('Obra no encontrada:', obraId);
            return;
        }
        
        const lightbox = document.getElementById('obra-lightbox');
        if (!lightbox) return;
        
        const img = lightbox.querySelector('.obra-lightbox-image');
        const title = lightbox.querySelector('.obra-lightbox-title');
        const album = lightbox.querySelector('.obra-lightbox-album');
        const counter = lightbox.querySelector('.obra-lightbox-counter');
        const thumbsContainer = lightbox.querySelector('.obra-lightbox-thumbnails');
        
        // Índice actual
        const currentIndex = this.obras.findIndex(o => o.id === obraId);
        this.currentObraIndex = currentIndex;
        
        // Cargar imagen
        img.classList.add('loading');
        img.src = obra.imagen;
        img.alt = obra.titulo;
        img.onload = () => img.classList.replace('loading', 'loaded');
        
        // Info
        title.textContent = obra.titulo;
        album.textContent = obra.albumName || '';
        counter.textContent = `${currentIndex + 1} / ${this.obras.length}`;
        
        // Miniaturas del mismo álbum
        const albumObras = this.obras.filter(o => o.albumId === obra.albumId);
        thumbsContainer.innerHTML = albumObras.map(o => `
            <img class="obra-lightbox-thumb ${o.id === obraId ? 'active' : ''}" 
                 src="${o.imagen}" 
                 alt="${o.titulo}"
                 data-id="${o.id}">
        `).join('');
        
        // Click en miniaturas
        thumbsContainer.querySelectorAll('.obra-lightbox-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                this.showObra(thumb.dataset.id);
            });
        });
        
        // Mostrar lightbox
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Event listeners
        this.setupLightboxEvents(lightbox);
    }
    
    setupLightboxEvents(lightbox) {
        const closeBtn = lightbox.querySelector('.obra-lightbox-close');
        const prevBtn = lightbox.querySelector('.obra-lightbox-prev');
        const nextBtn = lightbox.querySelector('.obra-lightbox-next');
        
        // Limpiar listeners anteriores
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', () => this.closeLightbox());
        
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        newPrevBtn.addEventListener('click', () => this.navigateObra(-1));
        
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', () => this.navigateObra(1));
        
        // Click fuera para cerrar
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox();
        });
        
        // Teclas
        this.handleKeydown = (e) => {
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.navigateObra(-1);
            if (e.key === 'ArrowRight') this.navigateObra(1);
        };
        document.addEventListener('keydown', this.handleKeydown);
    }
    
    navigateObra(direction) {
        const newIndex = this.currentObraIndex + direction;
        if (newIndex >= 0 && newIndex < this.obras.length) {
            this.showObra(this.obras[newIndex].id);
        }
    }
    
    closeLightbox() {
        const lightbox = document.getElementById('obra-lightbox');
        if (!lightbox) return;
        
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this.handleKeydown);
        
        // Volver al portfolio
        window.location.hash = '/portfolio';
    }
}
