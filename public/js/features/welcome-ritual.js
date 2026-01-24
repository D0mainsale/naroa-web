/**
 * WELCOME RITUAL - Cinematic First Visit Experience
 * Experiencia cinematográfica de 3-5 segundos para primera visita
 */

class WelcomeRitual {
    constructor() {
        this.storageKey = 'naroa_welcomed_v3';
        this.hasVisited = localStorage.getItem(this.storageKey);
        this.duration = 5000; // 5 seconds for the full name
        
        // Check if we should play the ritual
        if (!this.hasVisited) {
            this.playRitual();
        }
    }
    
    playRitual() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'welcome-ritual';
        overlay.innerHTML = `
            <div class="ritual-container">
                <div class="ritual-brush-sweep"></div>
                <div class="ritual-name">
                    <div class="ritual-line ritual-line-1">
                        <span class="ritual-letter">N</span>
                        <span class="ritual-letter">A</span>
                        <span class="ritual-letter">R</span>
                        <span class="ritual-letter">O</span>
                        <span class="ritual-letter">A</span>
                    </div>
                    <div class="ritual-line ritual-line-2">
                        <span class="ritual-letter">G</span>
                        <span class="ritual-letter">U</span>
                        <span class="ritual-letter">T</span>
                        <span class="ritual-letter">I</span>
                        <span class="ritual-letter">É</span>
                        <span class="ritual-letter">R</span>
                        <span class="ritual-letter">R</span>
                        <span class="ritual-letter">E</span>
                        <span class="ritual-letter">Z</span>
                    </div>
                    <div class="ritual-line ritual-line-3">
                        <span class="ritual-letter">G</span>
                        <span class="ritual-letter">I</span>
                        <span class="ritual-letter">L</span>
                    </div>
                </div>
                <div class="ritual-tagline">Artista Plástica · Bilbao</div>
                <div class="ritual-enter-hint">
                    <span class="hint-icon">↓</span>
                    <span class="hint-text">Entra en el universo</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        this.addStyles();
        
        // Animate letters with stagger (all 3 lines)
        const allLetters = overlay.querySelectorAll('.ritual-letter');
        allLetters.forEach((letter, i) => {
            letter.style.animationDelay = `${i * 0.08}s`;
        });
        
        // Brush sweep after letters
        setTimeout(() => {
            overlay.querySelector('.ritual-brush-sweep').classList.add('sweep');
        }, 1200);
        
        // Show tagline
        setTimeout(() => {
            overlay.querySelector('.ritual-tagline').classList.add('visible');
        }, 2000);
        
        // Show enter hint
        setTimeout(() => {
            overlay.querySelector('.ritual-enter-hint').classList.add('visible');
        }, 2800);
        
        // Auto-dismiss after duration
        setTimeout(() => {
            this.dismissRitual(overlay);
        }, this.duration);
        
        // Or dismiss on click/key
        overlay.addEventListener('click', () => this.dismissRitual(overlay));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                this.dismissRitual(overlay);
            }
        }, { once: true });
    }
    
    dismissRitual(overlay) {
        if (overlay.classList.contains('fade-out')) return; // Already dismissing
        
        overlay.classList.add('fade-out');
        
        setTimeout(() => {
            overlay.remove();
            localStorage.setItem(this.storageKey, 'true');
            this.revealContent();
        }, 800);
    }
    
    revealContent() {
        // Animate content entry
        const activeView = document.querySelector('[data-view]:not(.hidden)');
        if (!activeView) return;
        
        const elements = activeView.querySelectorAll('h1, h2, .portfolio-card, .nav, section > *');
        elements.forEach((el, i) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 80);
        });
    }
    
    addStyles() {
        if (document.getElementById('welcome-ritual-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'welcome-ritual-styles';
        style.textContent = `
            #welcome-ritual {
                position: fixed;
                inset: 0;
                z-index: 999999;
                /* YVES KLEIN BLUE - International Klein Blue (IKB) */
                background: linear-gradient(135deg, #002FA7 0%, #001970 50%, #002FA7 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            #welcome-ritual.fade-out {
                opacity: 0;
            }
            
            .ritual-container {
                text-align: center;
                position: relative;
                padding: 2rem;
            }
            
            /* Brush sweep effect */
            .ritual-brush-sweep {
                position: absolute;
                top: 50%;
                left: -100%;
                width: 200%;
                height: 6px;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    #FFFFFF 30%, 
                    #FFD700 50%, 
                    #FFFFFF 70%, 
                    transparent 100%
                );
                transform: translateY(-50%);
                opacity: 0;
            }
            
            .ritual-brush-sweep.sweep {
                animation: brushSweep 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            @keyframes brushSweep {
                0% {
                    left: -100%;
                    opacity: 1;
                }
                50% {
                    opacity: 1;
                }
                100% {
                    left: 100%;
                    opacity: 0;
                }
            }
            
            /* Name container - 3 lines */
            .ritual-name {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
            }
            
            .ritual-line {
                display: flex;
                justify-content: center;
            }
            
            /* NAROA - biggest */
            .ritual-line-1 {
                font-size: clamp(5rem, 20vw, 16rem);
            }
            
            /* GUTIÉRREZ - medium */
            .ritual-line-2 {
                font-size: clamp(2.5rem, 10vw, 8rem);
            }
            
            /* GIL - medium-large */
            .ritual-line-3 {
                font-size: clamp(4rem, 15vw, 12rem);
            }
            
            .ritual-letter {
                display: inline-block;
                font-family: 'Playfair Display', Georgia, serif;
                font-weight: 700;
                letter-spacing: 0.02em;
                opacity: 0;
                transform: translateY(100%) rotateX(90deg);
                color: transparent;
                -webkit-text-stroke: 2px rgba(255, 255, 255, 0.3);
                animation: letterReveal 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
            }
            
            @keyframes letterReveal {
                0% {
                    opacity: 0;
                    transform: translateY(100%) rotateX(90deg);
                    color: transparent;
                    -webkit-text-stroke: 2px rgba(255, 255, 255, 0.3);
                }
                60% {
                    color: rgba(255, 255, 255, 0.9);
                    -webkit-text-stroke: 0;
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) rotateX(0);
                    color: #FFFFFF;
                    -webkit-text-stroke: 0;
                    text-shadow: 0 0 60px rgba(255, 255, 255, 0.5);
                }
            }
            
            /* Tagline */
            .ritual-tagline {
                font-family: 'Inter', sans-serif;
                font-size: clamp(0.8rem, 2vw, 1rem);
                letter-spacing: 0.4em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0);
                margin-top: 2rem;
                transition: color 0.6s ease;
            }
            
            .ritual-tagline.visible {
                color: rgba(255, 255, 255, 0.5);
            }
            
            /* Enter hint */
            .ritual-enter-hint {
                position: absolute;
                bottom: -100px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                opacity: 0;
                transition: opacity 0.6s ease;
            }
            
            .ritual-enter-hint.visible {
                opacity: 1;
            }
            
            .hint-icon {
                font-size: 1.5rem;
                color: rgba(255, 255, 255, 0.4);
                animation: hintBounce 1.5s ease-in-out infinite;
            }
            
            .hint-text {
                font-size: 0.75rem;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.3);
            }
            
            @keyframes hintBounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(8px); }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .ritual-letter {
                    animation: fadeIn 0.3s ease forwards;
                }
                .ritual-brush-sweep {
                    display: none;
                }
                @keyframes fadeIn {
                    to { opacity: 1; color: white; transform: none; }
                }
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                .ritual-text {
                    gap: 0.05em;
                }
                .ritual-enter-hint {
                    bottom: -80px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Static method to reset (for testing)
    static reset() {
        localStorage.removeItem('naroa_welcomed_v3');
        console.log('Welcome ritual reset. Refresh to see it again.');
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.welcomeRitual = new WelcomeRitual();
    });
} else {
    window.welcomeRitual = new WelcomeRitual();
}

// Expose reset for testing
window.resetWelcomeRitual = WelcomeRitual.reset;
