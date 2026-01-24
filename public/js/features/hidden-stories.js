/**
 * HIDDEN STORIES - Long-Hover Reveal System
 * Revela historias secretas de las obras al mantener hover 3+ segundos
 */

class HiddenStories {
    constructor() {
        this.hoverTimer = null;
        this.revealDelay = 3000; // 3 segundos
        this.activeCard = null;
        this.progressInterval = null;
        
        // Historias por defecto (se pueden personalizar via data-story)
        this.defaultStories = [
            'Cada trazo guarda un secreto. Esta obra nació de un momento de quietud absoluta.',
            'Los colores vinieron en un sueño. Al despertar, los atrapé antes de que escaparan.',
            'Aquí conversan la luz y la sombra. Una historia de encuentros inesperados.',
            'Este retrato surgió de una mirada fugaz. A veces, un instante contiene eternidades.',
            'La materia habla si sabes escuchar. Aquí, el óleo me contó su historia.',
            'Entre líneas vive algo que no se puede nombrar. Solo sentir.',
            'Nacida de la mica y el silencio. Un ritual de creación íntimo.',
            'El rosa no es solo un color. Es una forma de ver el mundo.',
            'Aquí habita el glitch de lo real. La imperfección que revela verdad.'
        ];
        
        this.init();
    }
    
    init() {
        // Wait for DOM and portfolio to load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attachListeners());
        } else {
            // Delay to let portfolio render
            setTimeout(() => this.attachListeners(), 1000);
        }
        
        // Re-attach when hash changes (new view loads)
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.attachListeners(), 500);
        });
        
        // Add styles
        this.addStyles();
        
        console.log('✨ Hidden Stories system initialized');
    }
    
    attachListeners() {
        const cards = document.querySelectorAll('.portfolio-card, .artwork-card, .galeria-item, [data-story]');
        
        cards.forEach(card => {
            // Remove existing listeners to prevent duplicates
            card.removeEventListener('mouseenter', card._storyEnter);
            card.removeEventListener('mouseleave', card._storyLeave);
            
            // Create bound handlers
            card._storyEnter = () => this.startReveal(card);
            card._storyLeave = () => this.cancelReveal(card);
            
            card.addEventListener('mouseenter', card._storyEnter);
            card.addEventListener('mouseleave', card._storyLeave);
        });
    }
    
    addStyles() {
        if (document.getElementById('hidden-stories-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'hidden-stories-styles';
        style.textContent = `
            /* Progress bar during reveal */
            .story-revealing::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #0066CC, #00CC66, #FF1493);
                background-size: 200% 100%;
                animation: storyProgress 3s linear forwards, gradientShift 1s linear infinite;
                z-index: 15;
            }
            
            @keyframes storyProgress {
                from { width: 0%; }
                to { width: 100%; }
            }
            
            @keyframes gradientShift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            
            /* Story overlay */
            .hidden-story-overlay {
                position: absolute;
                inset: 0;
                background: rgba(10, 10, 15, 0.92);
                -webkit-backdrop-filter: blur(12px);
                backdrop-filter: blur(12px);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transform: scale(0.95);
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 20;
                border-radius: inherit;
                cursor: default;
            }
            
            .hidden-story-overlay.visible {
                opacity: 1;
                transform: scale(1);
            }
            
            /* Story content */
            .story-content {
                text-align: center;
                padding: 2rem;
                max-width: 300px;
            }
            
            .story-icon {
                font-size: 2.5rem;
                display: block;
                margin-bottom: 1rem;
                animation: storySparkle 2s ease-in-out infinite;
            }
            
            .story-text {
                font-family: 'Playfair Display', Georgia, serif;
                font-style: italic;
                font-size: 1.1rem;
                line-height: 1.7;
                color: rgba(255, 255, 255, 0.9);
                margin: 0;
            }
            
            .story-hint {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.4);
                margin-top: 1rem;
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }
            
            @keyframes storySparkle {
                0%, 100% { 
                    transform: scale(1) rotate(0deg); 
                    filter: brightness(1);
                }
                50% { 
                    transform: scale(1.15) rotate(5deg); 
                    filter: brightness(1.3);
                }
            }
            
            /* Ensure cards have relative positioning */
            .portfolio-card,
            .artwork-card,
            .galeria-item {
                position: relative;
            }
            
            /* Mobile: disable (too hard to long-press) */
            @media (max-width: 768px) {
                .story-revealing::after {
                    display: none;
                }
            }
            
            @media (prefers-reduced-motion: reduce) {
                .story-icon {
                    animation: none;
                }
                .story-revealing::after {
                    animation: storyProgress 3s linear forwards;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    startReveal(card) {
        // Skip if already active or on touch device
        if (this.activeCard === card) return;
        if ('ontouchstart' in window && window.innerWidth < 1024) return;
        
        this.activeCard = card;
        card.classList.add('story-revealing');
        
        // Start reveal timer
        this.hoverTimer = setTimeout(() => {
            this.showStory(card);
        }, this.revealDelay);
    }
    
    showStory(card) {
        card.classList.remove('story-revealing');
        
        // Get story from data attribute or use random default
        const customStory = card.dataset.story;
        const story = customStory || this.getRandomStory();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'hidden-story-overlay';
        overlay.innerHTML = `
            <div class="story-content">
                <span class="story-icon">✨</span>
                <p class="story-text">${story}</p>
                <div class="story-hint">Historia oculta</div>
            </div>
        `;
        
        // Prevent click propagation (don't open lightbox)
        overlay.addEventListener('click', (e) => e.stopPropagation());
        
        card.appendChild(overlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });
    }
    
    cancelReveal(card) {
        clearTimeout(this.hoverTimer);
        this.hoverTimer = null;
        
        card.classList.remove('story-revealing');
        
        const overlay = card.querySelector('.hidden-story-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 400);
        }
        
        if (this.activeCard === card) {
            this.activeCard = null;
        }
    }
    
    getRandomStory() {
        const index = Math.floor(Math.random() * this.defaultStories.length);
        return this.defaultStories[index];
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hiddenStories = new HiddenStories();
    });
} else {
    window.hiddenStories = new HiddenStories();
}
