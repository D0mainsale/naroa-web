/**
 * WISHLIST SYSTEM — Guardar obras favoritas
 * Sistema de favoritos con localStorage y UI flotante
 * v1.0.0 - 2026-01-24
 */

class WishlistSystem {
    constructor() {
        this.storageKey = 'naroa_wishlist';
        this.wishlist = [];
        this.panel = null;
        this.badge = null;
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.wishlist = stored ? JSON.parse(stored) : [];
        } catch (e) {
            this.wishlist = [];
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.wishlist));
        } catch (e) {
            console.warn('Could not save wishlist');
        }
    }
    
    setup() {
        this.createUI();
        this.addStyles();
        this.attachToCards();
        this.updateBadge();
        
        // Re-attach on route change
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.attachToCards(), 500);
        });
        
        console.log('❤️ Wishlist System initialized', this.wishlist.length, 'items');
    }
    
    createUI() {
        // Floating wishlist button
        const btn = document.createElement('div');
        btn.className = 'wishlist-toggle';
        btn.innerHTML = `
            <button class="wishlist-btn" title="Mi Colección" aria-label="Ver favoritos">
                <span class="wishlist-icon">❤️</span>
                <span class="wishlist-badge">0</span>
            </button>
        `;
        document.body.appendChild(btn);
        
        this.badge = btn.querySelector('.wishlist-badge');
        btn.querySelector('.wishlist-btn').addEventListener('click', () => this.togglePanel());
        
        // Wishlist panel
        this.panel = document.createElement('div');
        this.panel.className = 'wishlist-panel hidden';
        this.panel.innerHTML = `
            <div class="wishlist-header">
                <h3>❤️ Mi Colección</h3>
                <button class="wishlist-close" aria-label="Cerrar">×</button>
            </div>
            <div class="wishlist-items"></div>
            <div class="wishlist-empty">
                <p>Aún no has guardado ninguna obra</p>
                <span>Haz click en ❤️ en cualquier obra para guardarla</span>
            </div>
            <div class="wishlist-footer">
                <button class="wishlist-clear">Vaciar colección</button>
            </div>
        `;
        document.body.appendChild(this.panel);
        
        this.panel.querySelector('.wishlist-close').addEventListener('click', () => this.closePanel());
        this.panel.querySelector('.wishlist-clear').addEventListener('click', () => this.clearAll());
    }
    
    attachToCards() {
        const selectors = [
            '.portfolio-card',
            '.artwork-card',
            '.shop-product-card',
            '[data-artwork-id]',
            '.galeria-item'
        ];
        
        const cards = document.querySelectorAll(selectors.join(', '));
        
        cards.forEach(card => {
            if (card.dataset.wishlistAttached) return;
            card.dataset.wishlistAttached = 'true';
            
            // Get artwork data
            const title = card.querySelector('h3, .card-title')?.textContent || 'Sin título';
            const img = card.querySelector('img');
            const imageSrc = img?.src || img?.dataset.src || '';
            const id = card.dataset.artworkId || this.generateId(title + imageSrc);
            
            // Create heart button
            const heartBtn = document.createElement('button');
            heartBtn.className = 'wishlist-heart';
            heartBtn.innerHTML = this.isInWishlist(id) ? '❤️' : '🤍';
            heartBtn.setAttribute('aria-label', 'Añadir a favoritos');
            heartBtn.dataset.id = id;
            
            heartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleItem({
                    id,
                    title,
                    image: imageSrc
                }, heartBtn);
            });
            
            card.style.position = 'relative';
            card.appendChild(heartBtn);
        });
    }
    
    generateId(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return 'art_' + Math.abs(hash).toString(36);
    }
    
    isInWishlist(id) {
        return this.wishlist.some(item => item.id === id);
    }
    
    toggleItem(item, btn) {
        const exists = this.isInWishlist(item.id);
        
        if (exists) {
            this.wishlist = this.wishlist.filter(w => w.id !== item.id);
            btn.innerHTML = '🤍';
            this.showToast('Eliminado de favoritos');
        } else {
            this.wishlist.push({
                ...item,
                addedAt: Date.now()
            });
            btn.innerHTML = '❤️';
            btn.classList.add('wishlist-heart-pop');
            setTimeout(() => btn.classList.remove('wishlist-heart-pop'), 300);
            this.showToast('¡Añadido a tu colección!');
        }
        
        this.saveToStorage();
        this.updateBadge();
        this.renderPanel();
    }
    
    updateBadge() {
        if (this.badge) {
            this.badge.textContent = this.wishlist.length;
            this.badge.classList.toggle('hidden', this.wishlist.length === 0);
        }
    }
    
    togglePanel() {
        this.panel.classList.toggle('hidden');
        if (!this.panel.classList.contains('hidden')) {
            this.renderPanel();
        }
    }
    
    closePanel() {
        this.panel.classList.add('hidden');
    }
    
    renderPanel() {
        const itemsContainer = this.panel.querySelector('.wishlist-items');
        const emptyMsg = this.panel.querySelector('.wishlist-empty');
        
        if (this.wishlist.length === 0) {
            itemsContainer.innerHTML = '';
            emptyMsg.classList.remove('hidden');
            return;
        }
        
        emptyMsg.classList.add('hidden');
        
        itemsContainer.innerHTML = this.wishlist.map(item => `
            <div class="wishlist-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="wishlist-item-info">
                    <span class="wishlist-item-title">${item.title}</span>
                </div>
                <button class="wishlist-item-remove" data-id="${item.id}">×</button>
            </div>
        `).join('');
        
        // Remove buttons
        itemsContainer.querySelectorAll('.wishlist-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.wishlist = this.wishlist.filter(w => w.id !== id);
                this.saveToStorage();
                this.updateBadge();
                this.renderPanel();
                
                // Update heart on card
                const cardBtn = document.querySelector(`.wishlist-heart[data-id="${id}"]`);
                if (cardBtn) cardBtn.innerHTML = '🤍';
            });
        });
    }
    
    clearAll() {
        if (confirm('¿Vaciar tu colección de favoritos?')) {
            this.wishlist = [];
            this.saveToStorage();
            this.updateBadge();
            this.renderPanel();
            
            // Reset all hearts
            document.querySelectorAll('.wishlist-heart').forEach(btn => {
                btn.innerHTML = '🤍';
            });
        }
    }
    
    showToast(message) {
        let toast = document.querySelector('.wishlist-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'wishlist-toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.classList.add('visible');
        
        setTimeout(() => toast.classList.remove('visible'), 2000);
    }
    
    addStyles() {
        if (document.getElementById('wishlist-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'wishlist-styles';
        style.textContent = `
            /* ════════════════════════════════════════
               WISHLIST SYSTEM STYLES
               ════════════════════════════════════════ */
            
            /* Floating Toggle */
            .wishlist-toggle {
                position: fixed;
                bottom: 160px;
                right: 20px;
                z-index: 10000;
            }
            
            .wishlist-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 56px;
                height: 56px;
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2520 100%);
                border: 1px solid rgba(255, 100, 100, 0.3);
                border-radius: 50%;
                cursor: pointer;
                font-size: 1.5rem;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                position: relative;
            }
            
            .wishlist-btn:hover {
                transform: scale(1.1);
                border-color: rgba(255, 100, 100, 0.6);
            }
            
            .wishlist-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #e74c3c;
                color: white;
                font-size: 0.75rem;
                font-weight: bold;
                min-width: 20px;
                height: 20px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: system-ui, sans-serif;
            }
            
            .wishlist-badge.hidden {
                display: none;
            }
            
            /* Heart on Cards */
            .wishlist-heart {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.5);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                font-size: 1.2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            }
            
            .wishlist-heart:hover {
                transform: scale(1.2);
                background: rgba(0, 0, 0, 0.7);
            }
            
            .wishlist-heart-pop {
                animation: heartPop 0.3s ease;
            }
            
            @keyframes heartPop {
                0% { transform: scale(1); }
                50% { transform: scale(1.4); }
                100% { transform: scale(1); }
            }
            
            /* Panel */
            .wishlist-panel {
                position: fixed;
                bottom: 230px;
                right: 20px;
                width: 320px;
                max-height: 400px;
                background: rgba(26, 26, 26, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                z-index: 10001;
                overflow: hidden;
                backdrop-filter: blur(20px);
                transition: all 0.3s ease;
            }
            
            .wishlist-panel.hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateY(20px);
            }
            
            .wishlist-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .wishlist-header h3 {
                margin: 0;
                font-size: 1rem;
                color: #f4f3f0;
            }
            
            .wishlist-close {
                background: none;
                border: none;
                color: #888;
                font-size: 1.5rem;
                cursor: pointer;
                line-height: 1;
            }
            
            .wishlist-close:hover {
                color: #fff;
            }
            
            .wishlist-items {
                max-height: 250px;
                overflow-y: auto;
                padding: 0.5rem;
            }
            
            .wishlist-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem;
                border-radius: 8px;
                transition: background 0.2s;
            }
            
            .wishlist-item:hover {
                background: rgba(255, 255, 255, 0.05);
            }
            
            .wishlist-item img {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 6px;
            }
            
            .wishlist-item-info {
                flex: 1;
                min-width: 0;
            }
            
            .wishlist-item-title {
                display: block;
                color: #f4f3f0;
                font-size: 0.85rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .wishlist-item-remove {
                background: none;
                border: none;
                color: #888;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0.25rem;
            }
            
            .wishlist-item-remove:hover {
                color: #e74c3c;
            }
            
            .wishlist-empty {
                padding: 2rem;
                text-align: center;
                color: #888;
            }
            
            .wishlist-empty.hidden {
                display: none;
            }
            
            .wishlist-empty p {
                margin: 0 0 0.5rem;
            }
            
            .wishlist-empty span {
                font-size: 0.8rem;
                opacity: 0.7;
            }
            
            .wishlist-footer {
                padding: 0.75rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .wishlist-clear {
                width: 100%;
                padding: 0.5rem;
                background: rgba(231, 76, 60, 0.2);
                border: 1px solid rgba(231, 76, 60, 0.3);
                border-radius: 8px;
                color: #e74c3c;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .wishlist-clear:hover {
                background: rgba(231, 76, 60, 0.3);
            }
            
            /* Toast */
            .wishlist-toast {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: rgba(26, 26, 26, 0.95);
                color: #f4f3f0;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-size: 0.9rem;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
                z-index: 10002;
                backdrop-filter: blur(10px);
            }
            
            .wishlist-toast.visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            /* Mobile */
            @media (max-width: 768px) {
                .wishlist-toggle {
                    bottom: 140px;
                }
                
                .wishlist-panel {
                    right: 10px;
                    left: 10px;
                    width: auto;
                    bottom: 200px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public API
    getWishlist() {
        return [...this.wishlist];
    }
    
    exportWishlist() {
        return JSON.stringify(this.wishlist, null, 2);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.wishlistSystem = new WishlistSystem();
    });
} else {
    window.wishlistSystem = new WishlistSystem();
}
