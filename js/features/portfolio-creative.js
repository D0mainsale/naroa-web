/**
 * PORTFOLIO CREATIVE - Ultra Creative Portfolio System
 * Masonry, Magnetic Hover, Scatter Mode, Color Burst
 * v2.0.0 - Awwwards Level
 */

class PortfolioCreative {
    constructor() {
        this.mode = 'masonry'; // masonry, scatter, stack
        this.magneticStrength = 0.15;
        this.isInitialized = false;
        this.cards = [];
        this.mouse = { x: 0, y: 0 };
        this.rafId = null;
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            setTimeout(() => this.setup(), 500);
        }
        
        window.addEventListener('hashchange', () => {
            if (window.location.hash.includes('portfolio')) {
                setTimeout(() => this.setup(), 300);
            }
        });
        
        console.log('🎨 Portfolio Creative initialized');
    }
    
    setup() {
        this.grid = document.getElementById('portfolio-grid');
        if (!this.grid) return;
        
        this.addModeToggle();
        this.addStyles();
        this.findCards();
        this.bindEvents();
        this.applyMode(this.mode);
        this.startMagnetic();
        this.isInitialized = true;
    }
    
    addModeToggle() {
        if (document.getElementById('portfolio-mode-toggle')) return;
        
        const toggle = document.createElement('div');
        toggle.id = 'portfolio-mode-toggle';
        toggle.innerHTML = `
            <button class="mode-btn active" data-mode="masonry" title="Masonry View">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="10" rx="1"/>
                    <rect x="14" y="3" width="7" height="6" rx="1"/>
                    <rect x="3" y="15" width="7" height="6" rx="1"/>
                    <rect x="14" y="11" width="7" height="10" rx="1"/>
                </svg>
            </button>
            <button class="mode-btn" data-mode="scatter" title="Scatter View">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="6" cy="6" r="3"/>
                    <circle cx="18" cy="8" r="2"/>
                    <circle cx="8" cy="18" r="2.5"/>
                    <circle cx="16" cy="16" r="4"/>
                    <circle cx="12" cy="10" r="2"/>
                </svg>
            </button>
            <button class="mode-btn" data-mode="stack" title="Stack View">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <rect x="6" y="6" width="16" height="16" rx="2" opacity="0.6"/>
                    <rect x="8" y="8" width="16" height="16" rx="2" opacity="0.3"/>
                </svg>
            </button>
        `;
        
        // Insert before grid
        const controls = document.querySelector('.portfolio-controls');
        if (controls) {
            controls.appendChild(toggle);
        } else {
            this.grid.parentNode.insertBefore(toggle, this.grid);
        }
        
        // Bind events
        toggle.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                toggle.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyMode(btn.dataset.mode);
            });
        });
    }
    
    findCards() {
        this.cards = Array.from(this.grid.querySelectorAll('.portfolio-card'));
        this.cards.forEach((card, i) => {
            card.dataset.creativeIndex = i;
            card.dataset.originalOrder = i;
        });
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Color burst on hover
        this.cards.forEach(card => {
            card.addEventListener('mouseenter', () => this.triggerColorBurst(card));
            card.addEventListener('mouseleave', () => this.resetCard(card));
        });
    }
    
    applyMode(mode) {
        this.mode = mode;
        this.grid.className = `portfolio-grid-premium portfolio-mode-${mode}`;
        
        // Reset transforms
        this.cards.forEach((card, i) => {
            card.style.transform = '';
            card.style.zIndex = '';
            card.style.position = '';
            card.style.left = '';
            card.style.top = '';
        });
        
        switch(mode) {
            case 'masonry':
                this.applyMasonry();
                break;
            case 'scatter':
                this.applyScatter();
                break;
            case 'stack':
                this.applyStack();
                break;
        }
    }
    
    applyMasonry() {
        // CSS Grid with varying sizes
        this.cards.forEach((card, i) => {
            // Remove inline styles
            card.style.gridColumn = '';
            card.style.gridRow = '';
            
            // Random featured cards
            if (i % 5 === 0) {
                card.classList.add('card-featured');
            } else if (i % 7 === 0) {
                card.classList.add('card-wide');
            } else if (i % 11 === 0) {
                card.classList.add('card-tall');
            } else {
                card.classList.remove('card-featured', 'card-wide', 'card-tall');
            }
        });
    }
    
    applyScatter() {
        const gridRect = this.grid.getBoundingClientRect();
        const columns = Math.floor(gridRect.width / 350);
        const rows = Math.ceil(this.cards.length / columns);
        
        // Set grid to relative for absolute positioning
        this.grid.style.position = 'relative';
        this.grid.style.height = `${rows * 450}px`;
        
        this.cards.forEach((card, i) => {
            const col = i % columns;
            const row = Math.floor(i / columns);
            
            // Random offset within cell
            const offsetX = (Math.random() - 0.5) * 80;
            const offsetY = (Math.random() - 0.5) * 60;
            const rotation = (Math.random() - 0.5) * 15;
            const scale = 0.85 + Math.random() * 0.3;
            
            card.style.position = 'absolute';
            card.style.left = `${col * (100 / columns)}%`;
            card.style.top = `${row * 420}px`;
            card.style.width = `${100 / columns - 5}%`;
            card.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg) scale(${scale})`;
            card.style.zIndex = Math.floor(Math.random() * 10);
            card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
    }
    
    applyStack() {
        const centerX = this.grid.offsetWidth / 2;
        
        this.cards.forEach((card, i) => {
            const offset = i * 3;
            const rotation = (Math.random() - 0.5) * 8;
            
            card.style.position = 'absolute';
            card.style.left = '50%';
            card.style.top = `${50 + offset}px`;
            card.style.width = '380px';
            card.style.maxWidth = '90%';
            card.style.transform = `translateX(-50%) translateY(${offset}px) rotate(${rotation}deg)`;
            card.style.zIndex = this.cards.length - i;
            card.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        });
        
        // Set grid height
        this.grid.style.position = 'relative';
        this.grid.style.height = `${500 + this.cards.length * 3}px`;
        
        // Spread on hover
        this.cards.forEach((card, i) => {
            card.addEventListener('mouseenter', () => {
                const spreadOffset = (i - this.cards.length/2) * 50;
                card.style.transform = `translateX(calc(-50% + ${spreadOffset}px)) translateY(-20px) rotate(0deg) scale(1.1)`;
                card.style.zIndex = 100;
            });
            
            card.addEventListener('mouseleave', () => {
                const offset = i * 3;
                const rotation = (Math.random() - 0.5) * 8;
                card.style.transform = `translateX(-50%) translateY(${offset}px) rotate(${rotation}deg)`;
                card.style.zIndex = this.cards.length - i;
            });
        });
    }
    
    startMagnetic() {
        const animate = () => {
            if (this.mode !== 'scatter') {
                this.cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const cardCenterX = rect.left + rect.width / 2;
                    const cardCenterY = rect.top + rect.height / 2;
                    
                    const distX = this.mouse.x - cardCenterX;
                    const distY = this.mouse.y - cardCenterY;
                    const distance = Math.sqrt(distX * distX + distY * distY);
                    
                    if (distance < 300) {
                        const force = (300 - distance) / 300;
                        const moveX = distX * force * this.magneticStrength;
                        const moveY = distY * force * this.magneticStrength;
                        
                        card.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    } else {
                        card.style.transform = '';
                    }
                });
            }
            this.rafId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    triggerColorBurst(card) {
        // Create color burst overlay
        const burst = document.createElement('div');
        burst.className = 'color-burst';
        
        // Random vibrant color
        const colors = ['#FF1493', '#00CED1', '#FF6347', '#9370DB', '#00FA9A', '#FFD700'];
        burst.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]}40 0%, transparent 70%)`;
        
        card.appendChild(burst);
        
        // Animate
        requestAnimationFrame(() => {
            burst.classList.add('active');
        });
        
        // Add ink splatter effect
        this.addInkSplatter(card);
    }
    
    addInkSplatter(card) {
        const splatter = document.createElement('div');
        splatter.className = 'ink-splatter';
        
        // Random position
        splatter.style.left = `${20 + Math.random() * 60}%`;
        splatter.style.top = `${20 + Math.random() * 60}%`;
        
        card.appendChild(splatter);
        
        setTimeout(() => splatter.remove(), 1000);
    }
    
    resetCard(card) {
        const burst = card.querySelector('.color-burst');
        if (burst) {
            burst.classList.remove('active');
            setTimeout(() => burst.remove(), 500);
        }
    }
    
    addStyles() {
        if (document.getElementById('portfolio-creative-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'portfolio-creative-styles';
        style.textContent = `
            /* Mode Toggle */
            #portfolio-mode-toggle {
                display: flex;
                gap: 8px;
                padding: 8px;
                background: rgba(255,255,255,0.9);
                backdrop-filter: blur(10px);
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            .mode-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border: none;
                background: transparent;
                border-radius: 8px;
                cursor: pointer;
                color: #666;
                transition: all 0.3s ease;
            }
            
            .mode-btn:hover {
                background: rgba(0,0,0,0.05);
                color: #333;
            }
            
            .mode-btn.active {
                background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                color: white;
                box-shadow: 0 4px 15px rgba(255,107,107,0.3);
            }
            
            /* Masonry Enhanced */
            .portfolio-mode-masonry {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 2rem;
                grid-auto-flow: dense;
            }
            
            .portfolio-mode-masonry .card-featured {
                grid-column: span 2;
                grid-row: span 2;
            }
            
            .portfolio-mode-masonry .card-wide {
                grid-column: span 2;
            }
            
            .portfolio-mode-masonry .card-tall {
                grid-row: span 2;
            }
            
            @media (max-width: 768px) {
                .portfolio-mode-masonry .card-featured,
                .portfolio-mode-masonry .card-wide {
                    grid-column: span 1;
                }
            }
            
            /* Scatter Mode */
            .portfolio-mode-scatter {
                display: block !important;
            }
            
            .portfolio-mode-scatter .portfolio-card:hover {
                z-index: 100 !important;
                transform: scale(1.15) rotate(0deg) !important;
                box-shadow: 0 30px 60px rgba(0,0,0,0.3);
            }
            
            /* Stack Mode */
            .portfolio-mode-stack {
                display: block !important;
            }
            
            /* Color Burst */
            .color-burst {
                position: absolute;
                inset: 0;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
                z-index: 5;
                mix-blend-mode: overlay;
            }
            
            .color-burst.active {
                opacity: 1;
                animation: burstPulse 0.8s ease-out;
            }
            
            @keyframes burstPulse {
                0% { transform: scale(0.5); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
            }
            
            /* Ink Splatter */
            .ink-splatter {
                position: absolute;
                width: 50px;
                height: 50px;
                background: radial-gradient(circle, rgba(0,0,0,0.8) 0%, transparent 70%);
                border-radius: 50% 40% 60% 30%;
                pointer-events: none;
                z-index: 10;
                animation: splatterIn 0.5s ease-out forwards;
                mix-blend-mode: multiply;
            }
            
            @keyframes splatterIn {
                0% {
                    transform: scale(0) rotate(0deg);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.5) rotate(180deg);
                    opacity: 0.8;
                }
                100% {
                    transform: scale(0.8) rotate(360deg);
                    opacity: 0;
                }
            }
            
            /* Magnetic Effect Smoothing */
            .portfolio-card {
                will-change: transform;
                transition: transform 0.15s ease-out, box-shadow 0.3s ease;
            }
            
            /* Hover Glow */
            .portfolio-card::before {
                content: '';
                position: absolute;
                inset: -2px;
                background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #FFE66D, #FF6B6B);
                background-size: 300% 300%;
                border-radius: inherit;
                z-index: -1;
                opacity: 0;
                transition: opacity 0.3s ease;
                animation: gradientShift 3s ease infinite;
            }
            
            .portfolio-card:hover::before {
                opacity: 1;
            }
            
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            
            /* Dark Mode */
            .dark-mode #portfolio-mode-toggle {
                background: rgba(30,30,30,0.9);
            }
            
            .dark-mode .mode-btn {
                color: #aaa;
            }
            
            .dark-mode .mode-btn:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }
    
    destroy() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.portfolioCreative = new PortfolioCreative();
    });
} else {
    window.portfolioCreative = new PortfolioCreative();
}
