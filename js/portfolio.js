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
            if (data.albums) {
                data.albums.forEach((album, ai) => {
                    if (album.images) {
                        album.images.forEach((img, ii) => {
                            allImages.push({
                                id: `obra-${ai}-${ii}`,
                                titulo: album.name || `Obra ${ii + 1}`,
                                imagen: img,
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

        this.blogPosts.forEach((post, i) => {
            const article = document.createElement('article');
            article.className = 'blog-post';
            article.style.animationDelay = `${i * 0.1}s`;
            article.innerHTML = `
                <time class="post-date">${post.date}</time>
                <h2 class="post-title">${post.title}</h2>
                <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">#${tag}</span>`).join('')}
                </div>
            `;
            list.appendChild(article);
        });
    }
}
