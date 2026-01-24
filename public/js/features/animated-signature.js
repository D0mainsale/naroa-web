/**
 * ANIMATED SIGNATURE — Microinteracción Home
 * La firma de Naroa se dibuja en vivo con SVG stroke animation
 * v1.0.0 - 2026-01-24
 */

class AnimatedSignature {
    constructor() {
        this.container = null;
        this.svg = null;
        this.paths = [];
        this.animated = false;
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Find home name element
        const homeName = document.querySelector('.home-name');
        if (!homeName) return;
        
        // Create signature container
        this.container = document.createElement('div');
        this.container.className = 'animated-signature';
        
        // SVG signature path (artistic handwritten "Naroa")
        this.container.innerHTML = `
            <svg viewBox="0 0 300 80" class="signature-svg" aria-label="Firma de Naroa Gutiérrez Gil">
                <!-- N -->
                <path class="sig-path" d="M20,60 L20,20 L45,60 L45,20" />
                <!-- a -->
                <path class="sig-path" d="M55,40 Q55,60 70,60 Q85,60 85,45 Q85,30 70,30 Q55,30 55,40 M85,35 L85,60" />
                <!-- r -->
                <path class="sig-path" d="M95,60 L95,35 Q95,30 105,28" />
                <!-- o -->
                <path class="sig-path" d="M115,45 Q115,30 130,30 Q145,30 145,45 Q145,60 130,60 Q115,60 115,45" />
                <!-- a -->
                <path class="sig-path" d="M155,40 Q155,60 170,60 Q185,60 185,45 Q185,30 170,30 Q155,30 155,40 M185,35 L185,60" />
                <!-- Flourish underline -->
                <path class="sig-path sig-flourish" d="M20,70 Q100,75 180,68 Q220,65 280,72" />
            </svg>
        `;
        
        // Insert after the h1
        homeName.parentNode.insertBefore(this.container, homeName.nextSibling);
        
        this.svg = this.container.querySelector('.signature-svg');
        this.paths = this.container.querySelectorAll('.sig-path');
        
        // Set up stroke animation
        this.preparePaths();
        
        // Trigger animation on view
        this.observeVisibility();
        
        // Add styles
        this.addStyles();
        
        console.log('✍️ Animated Signature initialized');
    }
    
    preparePaths() {
        this.paths.forEach((path, i) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            path.style.animationDelay = `${i * 0.3}s`;
        });
    }
    
    observeVisibility() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animated) {
                    this.animate();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(this.container);
    }
    
    animate() {
        if (this.animated) return;
        this.animated = true;
        
        this.container.classList.add('animating');
        
        // Play subtle sound if available
        this.playPenSound();
    }
    
    playPenSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Subtle pen scratch sound
            const createScratch = (time) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                
                osc.type = 'sawtooth';
                osc.frequency.value = 2000 + Math.random() * 1000;
                
                filter.type = 'bandpass';
                filter.frequency.value = 3000;
                filter.Q.value = 2;
                
                gain.gain.value = 0;
                gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + time);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + time + 0.1);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(ctx.currentTime + time);
                osc.stop(ctx.currentTime + time + 0.15);
            };
            
            // Multiple scratches following the animation
            for (let i = 0; i < 6; i++) {
                createScratch(i * 0.3);
            }
        } catch (e) {
            // Audio not available
        }
    }
    
    addStyles() {
        if (document.getElementById('animated-signature-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'animated-signature-styles';
        style.textContent = `
            .animated-signature {
                width: 200px;
                height: 60px;
                margin: 1rem auto 0;
                opacity: 0;
                transform: translateY(10px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            
            .animated-signature.animating {
                opacity: 1;
                transform: translateY(0);
            }
            
            .signature-svg {
                width: 100%;
                height: 100%;
            }
            
            .sig-path {
                fill: none;
                stroke: var(--text-primary, #1a1a1a);
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }
            
            .animating .sig-path {
                animation: drawSignature 0.8s ease forwards;
            }
            
            .sig-flourish {
                stroke-width: 1.5;
                opacity: 0.6;
            }
            
            @keyframes drawSignature {
                to {
                    stroke-dashoffset: 0;
                }
            }
            
            /* Dark mode */
            @media (prefers-color-scheme: dark) {
                .sig-path {
                    stroke: var(--text-primary, #f4f3f0);
                }
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .animated-signature {
                    width: 150px;
                    height: 45px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public: replay animation
    replay() {
        this.animated = false;
        this.container.classList.remove('animating');
        this.preparePaths();
        
        setTimeout(() => this.animate(), 100);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.animatedSignature = new AnimatedSignature();
    });
} else {
    window.animatedSignature = new AnimatedSignature();
}
