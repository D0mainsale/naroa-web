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
            
            // Map to internal structure - USAR IMÁGENES OPTIMIZADAS WEBP
            const allImages = allImagesRaw.map(img => {
                // Convertir ruta de raw_albums JPG a optimized WEBP
                const filename = img.filename.replace(/\.jpg$/i, '.webp');
                const optimizedPath = `/images/optimized/${img.albumId}_${filename}`;
                
                return {
                    id: img.id,
                    titulo: img.albumName || 'Sin título',
                    albumName: img.albumName,
                    imagen: optimizedPath,
                    imagenOriginal: img.path, // Fallback a raw si webp no existe
                    albumId: img.albumId,
                    imageIndex: img.index,
                    ritual: Math.random() > 0.9 // 10% ritual effect
                };
            });
            
            // 🎲 SHUFFLE ALEATORIO - Cada visita es única
            this.shuffleArray(allImages);
            
            // Limit to 306 for initial load (avoid DOM overload)
            this.obras = allImages.slice(0, 306);
            this.allObras = allImages;
            this.filteredObras = null;

            console.log(`✅ Portfolio loaded: ${this.obras.length} of ${allImages.length} images (using optimized WEBP)`);

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
        // 🔥 VERSIÓN ULTRA PREMIUM - Efectos WOW
        const view = document.getElementById('portfolio-view');
        const grid = document.getElementById('portfolio-grid');
        
        if (!view || !grid) {
            console.error('❌ Contenedores portfolio-view o portfolio-grid no encontrados');
            return;
        }
        
        view.classList.remove('hidden');
        grid.innerHTML = '';
        
        // Grid CSS ULTRA PREMIUM
        grid.className = 'portfolio-grid';
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 16px;
            padding: 24px;
            background: linear-gradient(180deg, #0a0a0a 0%, #1a1818 100%);
            min-height: 100vh;
        `;
        
        const obrasToRender = this.filteredObras || this.obras;
        console.log(`🎨 Renderizando ${obrasToRender.length} obras con efectos premium`);
        
        obrasToRender.forEach((obra, idx) => {
            const card = document.createElement('a');
            card.href = `#/portfolio/${obra.id}`;
            card.className = 'portfolio-card';
            
            // Delay escalonado para animación staggered
            const delay = Math.min(idx * 0.05, 0.6);
            
            card.style.cssText = `
                display: block;
                position: relative;
                aspect-ratio: 4/5;
                overflow: hidden;
                border-radius: 12px;
                background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
                cursor: pointer;
                animation: cardReveal 0.6s ease forwards;
                animation-delay: ${delay}s;
                opacity: 0;
                transform: translateY(30px);
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                border: 1px solid rgba(200, 168, 130, 0.1);
            `;
            
            // Badge especial para obras ritual
            const badge = obra.ritual ? '<span class="card-badge">✧ Ritual</span>' : '';
            
            card.innerHTML = `
                ${badge}
                <div class="card-image" style="width:100%;height:100%;overflow:hidden;">
                    <img src="${obra.imagen}" 
                         alt="${obra.titulo}" 
                         loading="lazy"
                         style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s cubic-bezier(0.23,1,0.32,1);">
                </div>
                <div class="card-info" style="
                    position:absolute;
                    bottom:0;
                    left:0;
                    right:0;
                    padding:1.25rem;
                    background:linear-gradient(0deg,rgba(10,10,10,0.95) 0%,rgba(10,10,10,0.6) 60%,transparent 100%);
                    transform:translateY(100%);
                    transition:transform 0.4s cubic-bezier(0.23,1,0.32,1);
                ">
                    <h3 class="card-title" style="color:#FAF8F5;font-size:0.95rem;font-weight:500;margin:0;">${obra.titulo}</h3>
                    <p class="card-subtitle" style="color:rgba(200,168,130,0.9);font-size:0.75rem;font-style:italic;margin-top:0.25rem;">${obra.albumName || ''}</p>
                </div>
            `;
            
            // Hover effects premium
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,168,130,0.3)';
                const img = card.querySelector('img');
                if (img) img.style.transform = 'scale(1.1)';
                const info = card.querySelector('.card-info');
                if (info) info.style.transform = 'translateY(0)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
                const img = card.querySelector('img');
                if (img) img.style.transform = '';
                const info = card.querySelector('.card-info');
                if (info) info.style.transform = 'translateY(100%)';
            });
            
            // Click ripple effect
            card.addEventListener('click', (e) => {
                card.classList.add('clicked');
                setTimeout(() => card.classList.remove('clicked'), 600);
            });
            
            grid.appendChild(card);
        });
        
        // Cursor glow effect en el grid
        grid.addEventListener('mousemove', (e) => {
            const rect = grid.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            grid.style.setProperty('--mouse-x', `${x}%`);
            grid.style.setProperty('--mouse-y', `${y}%`);
        });
        
        console.log('✅ Portfolio PREMIUM renderizado con efectos WOW');
    }
    
    initRevealObserver() {
        // Deshabilitado en versión disruptiva
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
