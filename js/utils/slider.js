// Silent Gallery — Home Image Slider
// Scroll changes image. Fade transition. Minimal.

class HomeSlider {
    constructor() {
        this.slides = document.querySelectorAll('.home-slide');
        this.currentIndex = 0;
        this.isScrolling = false;
        
        if (this.slides.length > 0) {
            this.init();
        }
    }
    
    init() {
        // Show first slide
        this.slides[0].classList.add('active');
        
        // Listen to scroll
        window.addEventListener('wheel', (e) => this.handleScroll(e), { passive: false });
        
        // Touch support for mobile
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        window.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            if (Math.abs(diff) > 50) { // Threshold
                if (diff > 0) {
                    this.next();
                } else {
                    this.previous();
                }
            }
        });
    }
    
    handleScroll(e) {
        if (this.isScrolling) return;
        
        e.preventDefault();
        
        if (e.deltaY > 0) {
            // Scroll down - next slide
            this.next();
        } else {
            // Scroll up - previous slide
            this.previous();
        }
        
        // Throttle
        this.isScrolling = true;
        setTimeout(() => {
            this.isScrolling = false;
        }, 600); // Match CSS transition
    }
    
    next() {
        if (this.currentIndex < this.slides.length - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }
    
    previous() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }
    
    goToSlide(index) {
        // Remove active from current
        this.slides[this.currentIndex].classList.remove('active');
        
        // Add active to new
        this.currentIndex = index;
        this.slides[this.currentIndex].classList.add('active');
        
        // Preload next image
        if (this.currentIndex < this.slides.length - 1) {
            const nextImg = this.slides[this.currentIndex + 1].querySelector('img');
            if (nextImg && !nextImg.complete) {
                nextImg.src = nextImg.src; // Trigger load
            }
        }
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HomeSlider();
    });
} else {
    new HomeSlider();
}
