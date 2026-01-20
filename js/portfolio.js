// === PORTFOLIO CONTROLLER ===
class Portfolio {
    constructor(router) {
        this.router = router;
        this.obras = [];
        this.blogPosts = [];
    }
    
    async init() {
        try {
            const res = await fetch('data/gallery.json');
            const data = await res.json();
            const allImages = [];
            
            // Intentar cargar nombres reales de álbumes desde Facebook
            let albumNamesMap = {};
            try {
                const namesRes = await fetch('data/album-names.json');
                if (namesRes.ok) {
                    albumNamesMap = await namesRes.json();
                    console.log('✅ Nombres reales de álbumes cargados desde Facebook');
                }
            } catch (e) {
                console.log('ℹ️ album-names.json no disponible, usando nombres generados');
            }
            
            // Nombres descriptivos de series (fallback)
            const seriesNames = [
                'DiviNos VaiVenes', 'Grafito y Mica', 'Retratos Hiperrealistas',
                'Técnica Mixta', 'Carbón sobre Papel', 'Serie del Error',
                'Materia y Memoria', 'Kintsugi Visual', 'Interfaces Rituales',
                'Cuerpos e Interferencias', 'Glitch Analógico', 'Fracturas Doradas',
                'Espera como Herramienta', 'Imperfección Perfecta', 'Almas en Tránsito',
                'Lo Roto Reluce', 'Complementarios', 'Piel y Pigmento',
                'Rostros del Silencio', 'Retratos Íntimos'
            ];
            
            if (data.albums) {
                data.albums.forEach((album, ai) => {
                    if (album.images) {
                        // Usar nombre real si existe, sino usar nombre generado
                        const albumId = album.albumId;
                        const realName = albumNamesMap[albumId];
                        const seriesName = realName || seriesNames[ai % seriesNames.length];
                        
                        album.images.forEach((img, ii) => {
                            allImages.push({
                                id: `obra-${ai}-${ii}`,
                                titulo: `${seriesName} ${String(ii + 1).padStart(2, '0')}`,
                                imagen: img,
                                albumId: albumId,
                                albumIndex: ai,
                                ritual: Math.random() > 0.7
                            });
                        });
                    }
                });
            }
            this.obras = allImages.slice(0, 20);

            // Cargar blog
            const blogRes = await fetch('data/blog.json');
            this.blogPosts = await blogRes.json();
            
        } catch (e) {
            console.error('Error cargando datos:', e);
        }
    }
    
    renderGrid() {
        const view = document.getElementById('portfolio-view');
        const grid = document.getElementById('portfolio-grid');
        view.classList.remove('hidden');
        grid.innerHTML = '';
        
        // Coordenadas del taller (Bilbao)
        const baseCoords = { lat: 43.2630, lng: -2.9350 };
        const materials = ['Grafito sobre papel', 'Carbón y mica', 'Acrílico sobre lienzo', 'Técnica mixta', 'Mica sobre verjurado'];
        
        this.obras.forEach((obra, idx) => {
            const card = document.createElement('a');
            card.href = `#/portfolio/${obra.id}`;
            card.className = 'portfolio-card';
            card.dataset.index = idx;
            
            // Las primeras 4 obras son FEATURED (mejores arriba)
            if (idx < 4) {
                card.classList.add('featured');
            }
            
            // Variación de coordenadas para cada obra
            const lat = (baseCoords.lat + (Math.random() - 0.5) * 0.01).toFixed(4);
            const lng = (baseCoords.lng + (Math.random() - 0.5) * 0.01).toFixed(4);
            const material = materials[idx % materials.length];
            
            card.innerHTML = `
                <figure class="card-image">
                    <img src="${obra.imagen}" alt="${obra.titulo}" loading="lazy">
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
        const list = document.getElementById('bitacora-list');
        view.classList.remove('hidden');
        list.innerHTML = '';
        
        // Header de la bitácora
        if (!document.querySelector('.bitacora-header')) {
            const header = document.createElement('header');
            header.className = 'bitacora-header';
            header.innerHTML = `
                <h1 class="bitacora-title">Bitácora</h1>
                <p class="bitacora-subtitle">Reflexiones sobre el proceso creativo</p>
            `;
            view.insertBefore(header, list);
        }

        this.blogPosts.forEach((post, i) => {
            // Calcular tiempo de lectura
            const words = post.content.split(' ').length;
            const readTime = Math.max(1, Math.ceil(words / 200));
            
            // Formatear fecha
            const date = new Date(post.date);
            const formattedDate = date.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            
            const article = document.createElement('article');
            article.className = 'blog-post';
            article.style.animationDelay = `${i * 0.15}s`;
            article.innerHTML = `
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
            `;
            list.appendChild(article);
        });
    }
}
