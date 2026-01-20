/**
 * ═══════════════════════════════════════════════════════════════
 * AWARD-WINNING PAGE TRANSITIONS
 * Smooth, fluid transitions between pages
 * ═══════════════════════════════════════════════════════════════
 */

class PageTransitions {
    constructor() {
        this.isTransitioning = false;
        this.transitionDuration = 600;
        this.init();
    }
    
    init() {
        this.createOverlay();
        this.interceptLinks();
    }
    
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'page-transition-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #FAF8F5 0%, #E5E5E5 100%);
            z-index: 99999;
            pointer-events: none;
            opacity: 0;
            display: flex;
            align-items: center;
            justify-center;
            transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        `;
        
        // Loader artístico
       const loader = document.createElement('div');
        loader.innerHTML = `
            <div style="
                width: 60px;
                height: 60px;
                border: 3px solid #E5E5E5;
                border-top-color: #2D2D2D;
                border-radius: 50%;
                animation: spin 1s cubic-bezier(0.65, 0, 0.35, 1) infinite;
            "></div>
        `;
        overlay.appendChild(loader);
        
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }
    
    interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || link.target === '_blank') return;
            
            e.preventDefault();
            this.transitionTo(href);
        });
    }
    
    async transitionTo(url) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        // Fade out
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'all';
        
        await this.wait(this.transitionDuration);
        
        // Navigate
        window.location.href = url;
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Fade in after page load
    fadeIn() {
        setTimeout(() => {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.style.pointerEvents = 'none';
                this.isTransitioning = false;
            }, this.transitionDuration);
        }, 100);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * SCROLL REVEAL SYSTEM
 * Elements reveal on scroll with intersection observer
 * ═══════════════════════════════════════════════════════════════
 */

class ScrollReveal {
    constructor(options = {}) {
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            animationClass: 'animate-in',
            ...options
        };
        
        this.observer = null;
        this.init();
    }
    
    init() {
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersect(entries),
            {
                threshold: this.options.threshold,
                rootMargin: this.options.rootMargin
            }
        );
        
        this.observeElements();
    }
    
    observeElements() {
        const elements = document.querySelectorAll('[data-reveal]');
        elements.forEach(el => {
            el.style.opacity = '0';
            this.observer.observe(el);
        });
    }
    
    handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.revealDelay || 0;
                
                setTimeout(() => {
                    entry.target.classList.add(this.options.animationClass);
                    entry.target.style.opacity = '1';
                }, delay);
                
                this.observer.unobserve(entry.target);
            }
        });
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * PARALLAX SCROLL EFFECT
 * Smooth depth with multiple layers
 * ═══════════════════════════════════════════════════════════════
 */

class ParallaxScroll {
    constructor() {
        this.elements = [];
        this.ticking = false;
        this.init();
    }
    
    init() {
        this.findElements();
        if (this.elements.length > 0) {
            window.addEventListener('scroll', () => this.requestTick());
            this.update();
        }
    }
    
    findElements() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        parallaxElements.forEach(el => {
            this.elements.push({
                element: el,
                speed: parseFloat(el.dataset.parallax) || 0.5
            });
        });
    }
    
    requestTick() {
        if (!this.ticking) {
            requestAnimationFrame(() => this.update());
            this.ticking = true;
        }
    }
    
    update() {
        const scrollY = window.pageYOffset;
        
        this.elements.forEach(({ element, speed }) => {
            const elementTop = element.getBoundingClientRect().top + scrollY;
            const elementHeight = element.offsetHeight;
            const windowHeight = window.innerHeight;
            
            if (scrollY + windowHeight > elementTop && scrollY < elementTop + elementHeight) {
                const offset = (scrollY - elementTop) * speed;
                element.style.transform = `translateY(${offset}px)`;
            }
        });
        
        this.ticking = false;
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * SMOOTH SCROLL TO ANCHOR
 * Elegant scrolling to sections
 * ═══════════════════════════════════════════════════════════════
 */

class SmoothAnchorScroll {
    constructor() {
        this.init();
    }
    
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    this.scrollTo(target);
                }
            });
        });
    }
    
    scrollTo(target) {
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function
            const ease = progress => progress < 0.5
                ? 4 * progress * progress * progress
                : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1;
            
            window.scrollTo(0, startPosition + distance * ease(progress));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * MAGNETIC CURSOR
 * Elements attract cursor on hover
 * ═══════════════════════════════════════════════════════════════
 */

class MagneticCursor {
    constructor() {
        this.elements = [];
        this.strength = 0.3;
        this.init();
    }
    
    init() {
        const magneticElements = document.querySelectorAll('[data-magnetic]');
        
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => this.attract(e, el));
            el.addEventListener('mouseleave', () => this.reset(el));
        });
    }
    
    attract(e, element) {
        const boundingBox = element.getBoundingClientRect();
        const centerX = boundingBox.left + boundingBox.width / 2;
        const centerY = boundingBox.top + boundingBox.height / 2;
        
        const deltaX = (e.clientX - centerX) * this.strength;
        const deltaY = (e.clientY - centerY) * this.strength;
        
        element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
    
    reset(element) {
        element.style.transform = 'translate(0, 0)';
    }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * INITIALIZE ALL PREMIUM FEATURES
 * ═══════════════════════════════════════════════════════════════
 */

window.addEventListener('DOMContentLoaded', () => {
    // Page transitions
    const pageTransitions = new PageTransitions();
    pageTransitions.fadeIn();
    
    // Scroll reveals
    const scrollReveal = new ScrollReveal();
    
    // Parallax
    const parallax = new ParallaxScroll();
    
    // Smooth anchors
    const smoothScroll = new SmoothAnchorScroll();
    
    // Magnetic cursor
    const magnetic = new MagneticCursor();
    
    console.log('🏆 Premium 2026 features loaded');
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PageTransitions,
        ScrollReveal,
        ParallaxScroll,
        SmoothAnchorScroll,
        MagneticCursor
    };
}
