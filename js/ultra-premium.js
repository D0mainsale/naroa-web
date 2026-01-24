/**
 * ═══════════════════════════════════════════════════════════════
 * ULTRA-PREMIUM FEATURES - 11/10 AWARD-WINNING
 * The most advanced web features of 2026
 * ═══════════════════════════════════════════════════════════════
 */

/* ──────────────────────────────────────────────────────────
   ▸ 1. CUSTOM CURSOR - CONTEXT-AWARE
   ────────────────────────────────────────────────────────── */

class PremiumCursor {
    constructor() {
        this.cursor = null;
        this.cursorDot = null;
        this.mousePos = { x: 0, y: 0 };
        this.cursorPos = { x: 0, y: 0 };
        this.dotPos = { x: 0, y: 0 };
        this.speed = 0.15;
        this.init();
    }
    
    init() {
        // Crear cursor custom
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';
        this.cursor.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            border: 2px solid var(--color-graphite);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            mix-blend-mode: difference;
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
            opacity: 0;
        `;
        
        // Crear dot central
        this.cursorDot = document.createElement('div');
        this.cursorDot.className = 'custom-cursor-dot';
        this.cursorDot.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: var(--color-graphite);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10001;
            mix-blend-mode: difference;
            transition: transform 0.1s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
            opacity: 0;
        `;
        
        document.body.appendChild(this.cursor);
        document.body.appendChild(this.cursorDot);
        
        // Hide default cursor
        document.body.style.cursor = 'none';
        
        // Events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseenter', () => this.show());
        document.addEventListener('mouseleave', () => this.hide());
        
        // Hover states
        this.setupHoverStates();
        
        // Animate
        this.animate();
    }
    
    onMouseMove(e) {
        this.mousePos.x = e.clientX;
        this.mousePos.y = e.clientY;
    }
    
    animate() {
        // Smooth follow
        this.cursorPos.x += (this.mousePos.x - this.cursorPos.x) * this.speed;
        this.cursorPos.y += (this.mousePos.y - this.cursorPos.y) * this.speed;
        
        this.dotPos.x += (this.mousePos.x - this.dotPos.x) * 0.3;
        this.dotPos.y += (this.mousePos.x - this.dotPos.y) * 0.3;
        
        // Update cursor position (preserve scale if active)
        const baseTransform = `translate(${this.cursorPos.x - 20}px, ${this.cursorPos.y - 20}px)`;
        if (this.activeContext) {
            this.cursor.style.transform = `${baseTransform} scale(${this.activeContext.scale})`;
        } else {
            this.cursor.style.transform = baseTransform;
        }
        
        this.cursorDot.style.transform = `translate(${this.dotPos.x - 4}px, ${this.dotPos.y - 4}px)`;
        
        // Update icon position if visible
        if (this.cursorIcon && this.cursorIcon.style.opacity !== '0') {
            const iconX = this.cursorPos.x - 8;
            const iconY = this.cursorPos.y - 8;
            this.cursorIcon.style.transform = `translate(${iconX}px, ${iconY}px)`;
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    show() {
        this.cursor.style.opacity = '1';
        this.cursorDot.style.opacity = '1';
    }
    
    hide() {
        this.cursor.style.opacity = '0';
        this.cursorDot.style.opacity = '0';
    }
    
    setupHoverStates() {
        // Context-aware cursor icons and styles
        this.contextRules = [
            // Portfolio images - Magnify
            {
                selector: '.portfolio-image, .galeria-item img, [data-lightbox]',
                icon: '🔍',
                scale: 1.8,
                color: 'var(--color-rust)'
            },
            // Artwork titles and artistic elements
            {
                selector: '[data-artwork-title], .obra-titulo, [data-art]',
                icon: '🎨',
                scale: 1.5,
                color: '#D4AF37' // Gold
            },
            // Text content - Reading
            {
                selector: 'p, article, .bitacora-content, [data-text]',
                icon: '📖',
                scale: 1.2,
                color: 'var(--color-graphite)'
            },
            // Links - Pointer
            {
                selector: 'a',
                icon: '👆',
                scale: 1.6,
                color: 'var(--color-rust)'
            },
            // Interactive zones
            {
                selector: '[data-interactive], button, [role="button"]',
                icon: '✨',
                scale: 2.0,
                color: '#FFD700' // Bright gold
            },
            // Video/media
            {
                selector: 'video, audio, [data-video]',
                icon: '▶️',
                scale: 1.7,
                color: '#FF6B6B'
            }
        ];
        
        // Create icon element
        this.cursorIcon = document.createElement('div');
        this.cursorIcon.className = 'cursor-icon';
        this.cursorIcon.style.cssText = `
            position: fixed;
            font-size: 16px;
            pointer-events: none;
            z-index: 10002;
            opacity: 0;
            transition: opacity 0.2s, transform 0.2s;
            user-select: none;
        `;
        document.body.appendChild(this.cursorIcon);
        
        // Track active context
        this.activeContext = null;
        
        // Event delegation for performance
        document.addEventListener('mouseover', (e) => this.updateContext(e));
        document.addEventListener('mouseout', (e) => this.resetContext(e));
    }
    
    updateContext(e) {
        // Find matching context rule
        let matchedRule = null;
        
        for (const rule of this.contextRules) {
            const target = e.target.closest(rule.selector);
            if (target) {
                matchedRule = rule;
                break;
            }
        }
        
        if (matchedRule && matchedRule !== this.activeContext) {
            this.activeContext = matchedRule;
            this.applyCursorStyle(matchedRule);
        }
    }
    
    applyCursorStyle(rule) {
        // Scale cursor
        const baseTransform = `translate(${this.cursorPos.x - 20}px, ${this.cursorPos.y - 20}px)`;
        this.cursor.style.transform = `${baseTransform} scale(${rule.scale})`;
        this.cursor.style.borderColor = rule.color;
        
        // Show icon
        if (rule.icon) {
            this.cursorIcon.textContent = rule.icon;
            this.cursorIcon.style.opacity = '1';
            this.cursorIcon.style.color = rule.color;
            
            // Position icon at cursor center
            const iconX = this.cursorPos.x - 8;
            const iconY = this.cursorPos.y - 8;
            this.cursorIcon.style.transform = `translate(${iconX}px, ${iconY}px)`;
        }
    }
    
    resetContext(e) {
        // Check if we're still over ANY interactive element
        let stillHovering = false;
        for (const rule of this.contextRules) {
            if (e.relatedTarget?.closest(rule.selector)) {
                stillHovering = true;
                break;
            }
        }
        
        if (!stillHovering) {
            this.activeContext = null;
            
            // Reset to default
            const baseTransform = `translate(${this.cursorPos.x - 20}px, ${this.cursorPos.y - 20}px)`;
            this.cursor.style.transform = `${baseTransform} scale(1)`;
            this.cursor.style.borderColor = 'var(--color-graphite)';
            
            // Hide icon
            this.cursorIcon.style.opacity = '0';
        }
    }
}

/* ──────────────────────────────────────────────────────────
   ▸ 2. DARK MODE - PREMIUM TOGGLE
   ────────────────────────────────────────────────────────── */

class DarkMode {
    constructor() {
        this.isDark = false;
        this.init();
    }
    
    init() {
        // Check saved preference
        const saved = localStorage.getItem('darkMode');
        if (saved === 'true') {
            this.enable();
        }
        
        // Create toggle button
        this.createToggle();
    }
    
    createToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'dark-mode-toggle';
        toggle.setAttribute('aria-label', 'Toggle dark mode');
        toggle.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: var(--glass-white);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: var(--shadow-lg);
            cursor: pointer;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        
        toggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
        `;
        
        toggle.addEventListener('click', () => this.toggle());
        
        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'scale(1.1) rotate(10deg)';
        });
        
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1) rotate(0deg)';
        });
        
        document.body.appendChild(toggle);
        this.toggle = toggle;
    }
    
    toggle() {
        this.isDark ? this.disable() : this.enable();
    }
    
    enable() {
        this.isDark = true;
        document.documentElement.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
        
        // Update CSS variables for dark mode
        document.documentElement.style.setProperty('--color-cream', '#1A1A1A');
        document.documentElement.style.setProperty('--color-charcoal', '#FAF8F5');
        document.documentElement.style.setProperty('--color-graphite', '#E5E5E5');
        
        this.toggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        `;
    }
    
    disable() {
        this.isDark = false;
        document.documentElement.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
        
        // Reset CSS variables
        document.documentElement.style.setProperty('--color-cream', '#FAF8F5');
        document.documentElement.style.setProperty('--color-charcoal', '#1A1A1A');
        document.documentElement.style.setProperty('--color-graphite', '#2D2D2D');
        
        this.toggle.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
        `;
    }
}

/* ──────────────────────────────────────────────────────────
   ▸ 3. NOISE TEXTURE OVERLAY - PHOTOGRAPHIC GRAIN
   ────────────────────────────────────────────────────────── */

class NoiseTexture {
    constructor() {
        this.init();
    }
    
    init() {
        const noise = document.createElement('div');
        noise.className = 'noise-overlay';
        noise.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            opacity: 0.03;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E");
            animation: grain 8s steps(10) infinite;
        `;
        
        document.body.appendChild(noise);
    }
}

/* ──────────────────────────────────────────────────────────
   ▸ 4. 3D CARD TRANSFORMS - DEPTH ON HOVER
   ────────────────────────────────────────────────────────── */

class Card3D {
    constructor() {
        this.cards = [];
        this.init();
    }
    
    init() {
        const cards = document.querySelectorAll('[data-3d-card]');
        
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.handleMove(e, card));
            card.addEventListener('mouseleave', () => this.handleLeave(card));
        });
    }
    
    handleMove(e, card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * 10;
        const rotateY = ((x - centerX) / centerX) * -10;
        
        card.style.transform = `
            perspective(1000px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale3d(1.02, 1.02, 1.02)
        `;
    }
    
    handleLeave(card) {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
}

/* ──────────────────────────────────────────────────────────
   ▸ 5. KEYBOARD SHORTCUTS - POWER USER
   ────────────────────────────────────────────────────────── */

class KeyboardShortcuts {
    constructor() {
        this.shortcuts = {
            'h': () => window.location.hash = '/',
            'p': () => window.location.hash = '/portfolio',
            'b': () => window.location.hash = '/bitacora',
            'g': () => window.location.href = '/galeria.html',
            'd': () => document.querySelector('.dark-mode-toggle')?.click(),
            'Escape': () => this.closeModals()
        };
        
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            const handler = this.shortcuts[e.key];
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
        
        // Show shortcuts on '?'
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.showShortcutsModal();
            }
        });
    }
    
    closeModals() {
        document.querySelectorAll('[data-modal]').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    showShortcutsModal() {
        alert(`
Keyboard Shortcuts:
H - Home
P - Portfolio  
B - Bitácora
G - Galería
D - Toggle Dark Mode
Esc - Close modals
? - Show this help
        `.trim());
    }
}

/* ──────────────────────────────────────────────────────────
   ▸ 6. MOBILE GESTURES - SWIPE NAVIGATION
   ────────────────────────────────────────────────────────── */

class MobileGestures {
    constructor() {
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.threshold = 50;
        this.init();
    }
    
    init() {
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
    }
    
    handleSwipe() {
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > this.threshold) {
            if (diff > 0) {
                // Swipe left
                this.navigateNext();
            } else {
                // Swipe right
                this.navigatePrev();
            }
        }
    }
    
    navigateNext() {
        // Implement your navigation logic
        console.log('Swipe left - next');
    }
    
    navigatePrev() {
        // Implement your navigation logic
        console.log('Swipe right - previous');
    }
}

/* ──────────────────────────────────────────────────────────
   ▸ 7. PERFORMANCE MONITOR
   ────────────────────────────────────────────────────────── */

class PerformanceMonitor {
    constructor() {
        this.init();
    }
    
    init() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('🚀 Performance Metrics:');
                console.log(`Load Time: ${perfData.loadEventEnd - perfData.fetchStart}ms`);
                console.log(`DOM Ready: ${perfData.domContentLoadedEventEnd - perfData.fetchStart}ms`);
            });
        }
    }
}

/* ──────────────────────────────────────────────────────────
   ▸ INITIALIZE ALL 11/10 FEATURES
   ────────────────────────────────────────────────────────── */

window.addEventListener('DOMContentLoaded', () => {
    // Premium Cursor (desktop only)
    if (window.innerWidth > 768) {
        new PremiumCursor();
    }
    
    // Dark Mode
    new DarkMode();
    
    // Noise Texture
    new NoiseTexture();
    
    // 3D Cards
    new Card3D();
    
    // Keyboard Shortcuts
    new KeyboardShortcuts();
    
    // Mobile Gestures
    if ('ontouchstart' in window) {
        new MobileGestures();
    }
    
    // Performance Monitor
    new PerformanceMonitor();
    
    console.log('🏆 11/10 Ultra-Premium features loaded');
});

// Grain animation
const style = document.createElement('style');
style.textContent = `
    @keyframes grain {
        0%, 100% { transform: translate(0, 0); }
        10% { transform: translate(-5%, -10%); }
        20% { transform: translate(-15%, 5%); }
        30% { transform: translate(7%, -25%); }
        40% { transform: translate(-5%, 25%); }
        50% { transform: translate(-15%, 10%); }
        60% { transform: translate(15%, 0%); }
        70% { transform: translate(0%, 15%); }
        80% { transform: translate(3%, 35%); }
        90% { transform: translate(-10%, 10%); }
    }
`;
document.head.appendChild(style);
