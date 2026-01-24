/**
 * ═══════════════════════════════════════════════════════════════
 * READING PROGRESS INDICATOR
 * Elegant scroll tracking for long-form content
 * ═══════════════════════════════════════════════════════════════
 */

class ReadingProgress {
    constructor() {
        this.progressBar = null;
        this.init();
    }
    
    init() {
        // Only show on content pages with significant scroll
        if (this.shouldShowProgress()) {
            this.createProgressBar();
            this.trackScrollProgress();
        }
    }
    
    shouldShowProgress() {
        // Check if page has enough scrollable content
        const docHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        
        // Show if content is at least 2x viewport height
        return (docHeight - viewportHeight) > viewportHeight;
    }
    
    createProgressBar() {
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'reading-progress-bar';
        this.progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            width: 0%;
            background: linear-gradient(90deg, var(--color-rust), #D4AF37);
            z-index: 9999;
            transition: width 0.1s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 2px 8px rgba(191, 86, 48, 0.3);
        `;
        
        document.body.appendChild(this.progressBar);
    }
    
    trackScrollProgress() {
        let ticking = false;
        
        const updateProgress = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            if (this.progressBar) {
                this.progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        });
        
        // Initial update
        updateProgress();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    new ReadingProgress();
});
