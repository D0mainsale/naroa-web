/**
 * WELCOME RITUAL - Pantalla Azul Épica con "¿JUEGAS?????"
 * Experiencia cinematográfica extendida de primera visita
 */

class WelcomeRitual {
    constructor() {
        this.storageKey = 'naroa_welcomed_v4'; // Nueva versión para forzar mostrar
        this.hasVisited = localStorage.getItem(this.storageKey);
        this.duration = 5000; // 5 segundos para la experiencia completa
        
        // Check if we should play the ritual
        if (!this.hasVisited) {
            this.playRitual();
        }
    }
    
    playRitual() {
        // Hide home content initially
        const homeView = document.querySelector('#home-view');
        if (homeView) {
            homeView.style.visibility = 'hidden';
        }
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'welcome-ritual';
        overlay.innerHTML = `
            <div class="ritual-container">
                <div class="ritual-brush-sweep"></div>
                
                <!-- Fase 1: Nombre con animación -->
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
                
                <!-- Fase 2: ¿Juegas? aparece después del nombre -->
                <div class="ritual-question">
                    <span class="question-char">¿</span>
                    <span class="question-char">J</span>
                    <span class="question-char">u</span>
                    <span class="question-char">e</span>
                    <span class="question-char">g</span>
                    <span class="question-char">a</span>
                    <span class="question-char">s</span>
                    <span class="question-char question-marks">?</span>
                </div>
                
                <!-- Fase 3: Opciones Sí / Depende -->
                <nav class="ritual-options">
                    <button class="ritual-btn ritual-btn--si" data-choice="si">
                        <span class="btn-glow"></span>
                        <span class="btn-label">Sí</span>
                    </button>
                    <button class="ritual-btn ritual-btn--depende" data-choice="depende">
                        <span class="btn-glow"></span>
                        <span class="btn-label">Depende</span>
                    </button>
                </nav>
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
        }, 1500);
        
        // Show tagline
        setTimeout(() => {
            overlay.querySelector('.ritual-tagline').classList.add('visible');
        }, 2500);
        
        // Name fades out, ¿JUEGAS????? appears
        setTimeout(() => {
            overlay.querySelector('.ritual-name').classList.add('fade-away');
            overlay.querySelector('.ritual-tagline').classList.add('fade-away');
        }, 2000);
        
        // Show ¿JUEGAS????? 
        setTimeout(() => {
            const question = overlay.querySelector('.ritual-question');
            question.classList.add('visible');
            
            // Animate each character
            const chars = question.querySelectorAll('.question-char');
            chars.forEach((char, i) => {
                char.style.animationDelay = `${i * 0.08}s`;
            });
        }, 2500);
        
        // Show options (Sí / Depende) - appear after question animation
        setTimeout(() => {
            overlay.querySelector('.ritual-options').classList.add('visible');
        }, 3500);
        
        // Button handlers
        overlay.querySelectorAll('.ritual-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.currentTarget.dataset.choice;
                this.handleChoice(choice, overlay);
            });
        });
    }
    
    handleChoice(choice, overlay) {
        // Add pulse effect to chosen button
        const btn = overlay.querySelector(`[data-choice="${choice}"]`);
        btn.classList.add('chosen');
        
        setTimeout(() => {
            this.dismissRitual(overlay, choice);
        }, 400);
    }
    
    dismissRitual(overlay, choice = 'browse') {
        if (overlay.classList.contains('fade-out')) return;
        
        overlay.classList.add('fade-out');
        
        setTimeout(() => {
            overlay.remove();
            localStorage.setItem(this.storageKey, 'true');
            
            // Reveal home and navigate based on choice
            const homeView = document.querySelector('#home-view');
            if (homeView) {
                homeView.style.visibility = 'visible';
            }
            
            // Navigate based on choice
            if (choice === 'si') {
                window.location.hash = '#/ritual';
            } else {
                window.location.hash = '#/portfolio';
            }
        }, 800);
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
                overflow: hidden;
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
                transition: opacity 0.8s ease, transform 0.8s ease;
            }
            
            .ritual-name.fade-away {
                opacity: 0;
                transform: scale(0.9);
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
                transition: color 0.6s ease, opacity 0.8s ease;
            }
            
            .ritual-tagline.visible {
                color: rgba(255, 255, 255, 0.5);
            }
            
            .ritual-tagline.fade-away {
                opacity: 0;
            }
            
            /* ¿JUEGAS????? Question */
            .ritual-question {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                pointer-events: none;
            }
            
            .ritual-question.visible {
                opacity: 1;
            }
            
            .question-char {
                display: inline-block;
                font-family: 'Playfair Display', Georgia, serif;
                font-size: clamp(4rem, 15vw, 14rem);
                font-weight: 700;
                color: #FFD700;
                opacity: 0;
                transform: translateY(50px) scale(0.5);
                animation: charBoom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            
            .question-marks {
                animation-name: charBoomBounce;
            }
            
            @keyframes charBoom {
                0% {
                    opacity: 0;
                    transform: translateY(50px) scale(0.5);
                }
                70% {
                    transform: translateY(-10px) scale(1.1);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            @keyframes charBoomBounce {
                0% {
                    opacity: 0;
                    transform: translateY(50px) scale(0.5) rotate(-10deg);
                }
                70% {
                    transform: translateY(-15px) scale(1.2) rotate(5deg);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0) scale(1) rotate(0deg);
                }
            }
            
            /* Options */
            .ritual-options {
                position: absolute;
                bottom: 15%;
                left: 50%;
                transform: translateX(-50%) translateY(30px);
                display: flex;
                gap: 3rem;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            
            .ritual-options.visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
                pointer-events: auto;
            }
            
            .ritual-btn {
                position: relative;
                padding: 1.2rem 3rem;
                border: 2px solid rgba(255, 255, 255, 0.3);
                background: transparent;
                cursor: pointer;
                font-family: 'Playfair Display', Georgia, serif;
                font-size: clamp(1.2rem, 3vw, 2rem);
                font-weight: 600;
                color: #FFFFFF;
                border-radius: 3px;
                overflow: hidden;
                transition: all 0.3s ease;
            }
            
            .ritual-btn:hover {
                border-color: rgba(255, 255, 255, 0.8);
                transform: translateY(-3px);
            }
            
            .ritual-btn--si {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), transparent);
            }
            
            .ritual-btn--si:hover {
                background: linear-gradient(135deg, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.1));
                box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
            }
            
            .ritual-btn--depende:hover {
                box-shadow: 0 10px 40px rgba(255, 255, 255, 0.2);
            }
            
            .ritual-btn.chosen {
                transform: scale(1.1);
                border-color: #FFD700;
            }
            
            .btn-glow {
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at center, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .ritual-btn:hover .btn-glow {
                opacity: 1;
            }
            
            .btn-label {
                position: relative;
                z-index: 1;
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .ritual-letter,
                .question-char {
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
                .ritual-options {
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .ritual-btn {
                    padding: 1rem 2.5rem;
                }
                
                .question-char {
                    font-size: clamp(3rem, 12vw, 8rem);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Static method to reset (for testing)
    static reset() {
        localStorage.removeItem('naroa_welcomed_v4');
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
