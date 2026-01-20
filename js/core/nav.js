// Silent Gallery — Minimal Navigation
// Invisible until hover/scroll. Fade-in.

class SilentNav {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.lastScroll = 0;
        this.scrollThreshold = 100;
        
        if (this.nav) {
            this.init();
        }
    }
    
    init() {
        // Show nav on scroll
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Show nav on mouse move near top
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Hide after inactivity
        let timeout;
        window.addEventListener('mousemove', () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (window.scrollY < this.scrollThreshold) {
                    this.hide();
                }
            }, 3000);
        });
    }
    
    handleScroll() {
        const currentScroll = window.scrollY;
        
        if (currentScroll > this.scrollThreshold) {
            this.show();
        } else {
            this.hide();
        }
        
        this.lastScroll = currentScroll;
    }
    
    handleMouseMove(e) {
        // Show if mouse is near top (first 80px)
        if (e.clientY < 80) {
            this.show();
        }
    }
    
    show() {
        this.nav.classList.add('visible');
    }
    
    hide() {
        this.nav.classList.remove('visible');
    }
}

// Lazy loading for work grid images
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        
        if (this.images.length > 0) {
            this.init();
        }
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });
        
        this.images.forEach(img => observer.observe(img));
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SilentNav();
        new LazyLoader();
    });
} else {
    new SilentNav();
    new LazyLoader();
}
