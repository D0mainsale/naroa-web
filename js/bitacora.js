// === BITÁCORA PREMIUM SYSTEM ===
// 15 Features: Cover images, quotes, galleries, filters, search, timeline, grid/list, hover, progress, share, preview, etc.

class BitacoraSystem {
    constructor(posts) {
        this.allPosts = posts;
        this.filteredPosts = posts;
        this.currentView = 'list'; // 'list', 'grid', or 'timeline'
        this.activeFilter = null;
        this.searchQuery = '';
        this.init();
    }

    init() {
        this.initSearchBar();
        this.initFilterButtons();
        this.initViewToggle();
        this.initScrollProgress();
        this.render();
    }

    // === FEATURE 1 & 2: Cover Images + Pull-out Quotes ===
    renderPost(post, index) {
        const readTime = Math.max(1, Math.ceil(post.content.split(' ').length / 200));
        const date = new Date(post.date);
        const formattedDate = date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });

        // Próximo post para preview (#14)
        const nextPost = this.filteredPosts[index + 1];

        return `
            <article class="blog-post" id="post-${post.id}" data-tags="${post.tags.join(',')}" style="animation-delay: ${index * 0.15}s">
                ${post.image ? `
                    <figure class="post-cover">
                        <img src="${post.image}" alt="${post.title}" loading="lazy">
                    </figure>
                ` : ''}
                
                <div class="post-content-wrapper">
                    <div class="post-meta">
                        <time class="post-date">${formattedDate}</time>
                        <span class="post-reading-time">${readTime} min lectura</span>
                    </div>
                    
                    <h2 class="post-title glitch-hover">
                        ${post.title}
                    </h2>
                    
                    <p class="post-excerpt">"${post.excerpt}"</p>
                    
                    ${post.quote ? `
                        <blockquote class="post-pullquote">
                            <span class="quote-mark">"</span>
                            ${post.quote}
                            <span class="quote-mark">"</span>
                        </blockquote>
                    ` : ''}
                    
                    <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
                    
                    ${post.youtube ? `
                        <div class="post-youtube">
                            <iframe 
                                src="https://www.youtube.com/embed/${post.youtube}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    ` : ''}
                    
                    ${post.gif ? `
                        <figure class="post-gif">
                            <img src="${post.gif}" alt="GIF de ${post.title}">
                        </figure>
                    ` : ''}
                    
                    ${post.gallery && post.gallery.length > 0 ? `
                        <div class="post-gallery">
                            ${post.gallery.map(img => `
                                <img src="${img}" alt="Galería ${post.title}" loading="lazy">
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="post-footer">
                        <div class="post-tags">
                            ${post.tags.map(tag => `
                                <button class="post-tag" data-tag="${tag}" onclick="bitacoraSystem.filterByTag('${tag}')">
                                    #${tag}
                                </button>
                            `).join('')}
                        </div>
                        
                        <!-- FEATURE 13: Share Buttons -->
                        <div class="post-share">
                            <button onclick="bitacoraSystem.share('${post.id}', 'twitter')" class="share-btn" title="Compartir en X">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </button>
                            <button onclick="bitacoraSystem.share('${post.id}', 'facebook')" class="share-btn" title="Compartir en Facebook">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                            </button>
                            <button onclick="bitacoraSystem.share('${post.id}', 'whatsapp')" class="share-btn" title="Compartir en WhatsApp">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    ${nextPost ? `
                        <!-- FEATURE 14: Next Post Preview -->
                        <div class="post-next-preview">
                            <span class="next-label">Siguiente →</span>
                            <div class="next-post">
                                ${nextPost.image ? `<img src="${nextPost.image}" alt="${nextPost.title}">` : ''}
                                <div class="next-info">
                                    <h3>${nextPost.title}</h3>
                                    <p>${nextPost.excerpt.substring(0, 80)}...</p>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <!-- FEATURE 5: Separador Visual -->
                <div class="post-separator">
                    <span class="separator-symbol">◆</span>
                </div>
            </article>
        `;
    }

    // === FEATURE 6: Filtros por Tags ===
    initFilterButtons() {
        const allTags = [...new Set(this.allPosts.flatMap(p => p.tags))];
        const filterContainer = document.createElement('div');
        filterContainer.className = 'bitacora-filters';
        filterContainer.innerHTML = `
            <button class="filter-btn active" data-tag="all" onclick="bitacoraSystem.filterByTag(null)">
                Todos (${this.allPosts.length})
            </button>
            ${allTags.map(tag => {
                const count = this.allPosts.filter(p => p.tags.includes(tag)).length;
                return `
                    <button class="filter-btn" data-tag="${tag}" onclick="bitacoraSystem.filterByTag('${tag}')">
                        ${tag} (${count})
                    </button>
                `;
            }).join('')}
        `;
        
        const list = document.getElementById('bitacora-list');
        list.parentElement.insertBefore(filterContainer, list);
    }

    filterByTag(tag) {
        this.activeFilter = tag;
        this.filteredPosts = tag 
            ? this.allPosts.filter(p => p.tags.includes(tag))
            : this.allPosts;
        
        // Actualizar botones activos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tag === (tag || 'all'));
        });
        
        this.render();
    }

    // === FEATURE 7: Búsqueda Rápida ===
    initSearchBar() {
        const searchBar = document.createElement('div');
        searchBar.className = 'bitacora-search';
        searchBar.innerHTML = `
            <input 
                type="text" 
                placeholder="Buscar en la bitácora..." 
                id="bitacora-search-input"
                onkeyup="bitacoraSystem.search(this.value)"
            >
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
            </svg>
        `;
        
        const header = document.querySelector('.bitacora-header') || document.getElementById('bitacora-list').previousElementSibling;
        header.appendChild(searchBar);
    }

    search(query) {
        this.searchQuery = query.toLowerCase();
        this.filteredPosts = this.allPosts.filter(p => 
            p.title.toLowerCase().includes(this.searchQuery) ||
            p.content.toLowerCase().includes(this.searchQuery) ||
            p.excerpt.toLowerCase().includes(this.searchQuery) ||
            p.tags.some(t => t.toLowerCase().includes(this.searchQuery))
        );
        this.render();
    }

    // === FEATURE 10: Grid vs Lista ===
    initViewToggle() {
        const toggle = document.createElement('div');
        toggle.className = 'view-toggle';
        toggle.innerHTML = `
            <button onclick="bitacoraSystem.setView('list')" class="view-btn active" data-view="list">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
            </button>
            <button onclick="bitacoraSystem.setView('grid')" class="view-btn" data-view="grid">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
            </button>
            <button onclick="bitacoraSystem.setView('timeline')" class="view-btn" data-view="timeline">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="8" r="3"/><circle cx="12" cy="16" r="3"/>
                    <line x1="12" y1="11" x2="12" y2="13"/>
                </svg>
            </button>
        `;
        
        const filters = document.querySelector('.bitacora-filters');
        filters.appendChild(toggle);
    }

    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        this.render();
    }

    // === FEATURE 12: Scroll Progress Bar ===
    initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            document.querySelector('.scroll-progress-bar').style.width = scrolled + '%';
        });
    }

    // === FEATURE 13: Share Function ===
    share(postId, platform) {
        const post = this.allPosts.find(p => p.id === postId);
        const url = `${window.location.origin}${window.location.pathname}#/bitacora/${postId}`;
        const text = `${post.title} - Naroa Gutiérrez Gil`;

        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
        };

        window.open(urls[platform], '_blank', 'width=600,height=400');
    }

    // === RENDER SYSTEMS ===
    render() {
        const list = document.getElementById('bitacora-list');
        
        if (this.currentView === 'timeline') {
            this.renderTimeline(list);
        } else if (this.currentView === 'grid') {
            this.renderGrid(list);
        } else {
            this.renderList(list);
        }
    }

    renderList(list) {
        list.className = 'bitacora-list view-list';
        list.innerHTML = this.filteredPosts.map((post, i) => this.renderPost(post, i)).join('');
        this.initTextRevealAnimation(); // FEATURE 4
    }

    renderGrid(list) {
        list.className = 'bitacora-list view-grid';
        list.innerHTML = this.filteredPosts.map((post, i) => `
            <article class="blog-post-card" style="animation-delay: ${i * 0.1}s">
                ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
                <div class="card-content">
                    <time>${new Date(post.date).getFullYear()}</time>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt.substring(0, 120)}...</p>
                    <div class="card-tags">
                        ${post.tags.slice(0, 3).map(tag => `<span>#${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');
    }

    renderTimeline(list) {
        list.className = 'bitacora-list view-timeline';
        const byYear = this.filteredPosts.reduce((acc, post) => {
            const year = new Date(post.date).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(post);
            return acc;
        }, {});

        list.innerHTML = Object.keys(byYear).sort((a, b) => b - a).map(year => `
            <div class="timeline-year">
                <h2 class="year-label">${year}</h2>
                <div class="timeline-posts">
                    ${byYear[year].map(post => `
                        <div class="timeline-item">
                            <time>${new Date(post.date).toLocaleDateString('es-ES', {month: 'short', day: 'numeric'})}</time>
                            <h3>${post.title}</h3>
                            <div class="timeline-tags">
                                ${post.tags.slice(0, 2).map(tag => `<span>#${tag}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    // === FEATURE 4: Text Reveal Animation ===
    initTextRevealAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.post-content').forEach(el => observer.observe(el));
    }
}

// Global instance
let bitacoraSystem;
