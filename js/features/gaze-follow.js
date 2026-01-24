/**
 * GAZE FOLLOW - "Obras que te Miran"
 * Los retratos siguen sutilmente el cursor con la mirada
 * Usa CSS transforms y clip-path para simular movimiento ocular
 * v1.0.0
 */

class GazeFollow {
    constructor() {
        this.portraits = [];
        this.mouse = { x: 0, y: 0 };
        this.isActive = true;
        this.maxRotation = 3; // degrees
        this.maxTranslate = 5; // pixels
        this.lerp = 0.08; // smoothing factor
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        // Re-attach on route change
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.findPortraits(), 500);
        });
        
        console.log('👁️ Gaze Follow initialized');
    }
    
    setup() {
        this.addStyles();
        this.findPortraits();
        this.bindEvents();
        this.animate();
    }
    
    findPortraits() {
        // Find all portrait images (look for specific markers)
        const selectors = [
            '.portfolio-card img',
            '.artwork-card img',
            '[data-gaze] img',
            '.galeria-item img',
            '.process-block img',
            '.retrato-option img'
        ];
        
        const images = document.querySelectorAll(selectors.join(', '));
        
        this.portraits = [];
        
        images.forEach((img, index) => {
            // Skip if already processed
            if (img.dataset.gazeProcessed) return;
            img.dataset.gazeProcessed = 'true';
            
            // Wrap image in container for transform
            const wrapper = document.createElement('div');
            wrapper.className = 'gaze-wrapper';
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            // Create eye overlay layer (for subtle highlight effect)
            const highlight = document.createElement('div');
            highlight.className = 'gaze-highlight';
            wrapper.appendChild(highlight);
            
            // Store reference
            this.portraits.push({
                wrapper,
                img,
                highlight,
                current: { rotateX: 0, rotateY: 0, tx: 0, ty: 0 },
                target: { rotateX: 0, rotateY: 0, tx: 0, ty: 0 }
            });
        });
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Respect reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isActive = false;
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.portraits.forEach(portrait => {
            const rect = portrait.wrapper.getBoundingClientRect();
            
            // Check if visible
            if (rect.top > window.innerHeight || rect.bottom < 0) return;
            
            // Calculate center of portrait
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Calculate offset from center (normalized -1 to 1)
            const offsetX = (this.mouse.x - centerX) / (window.innerWidth / 2);
            const offsetY = (this.mouse.y - centerY) / (window.innerHeight / 2);
            
            // Clamp values
            const clampedX = Math.max(-1, Math.min(1, offsetX));
            const clampedY = Math.max(-1, Math.min(1, offsetY));
            
            // Set target transforms
            portrait.target.rotateY = clampedX * this.maxRotation;
            portrait.target.rotateX = -clampedY * this.maxRotation * 0.5; // Less vertical
            portrait.target.tx = clampedX * this.maxTranslate;
            portrait.target.ty = clampedY * this.maxTranslate * 0.3;
            
            // Lerp current towards target
            portrait.current.rotateX += (portrait.target.rotateX - portrait.current.rotateX) * this.lerp;
            portrait.current.rotateY += (portrait.target.rotateY - portrait.current.rotateY) * this.lerp;
            portrait.current.tx += (portrait.target.tx - portrait.current.tx) * this.lerp;
            portrait.current.ty += (portrait.target.ty - portrait.current.ty) * this.lerp;
            
            // Apply transforms
            portrait.img.style.transform = `
                perspective(1000px)
                rotateX(${portrait.current.rotateX}deg)
                rotateY(${portrait.current.rotateY}deg)
                translateX(${portrait.current.tx}px)
                translateY(${portrait.current.ty}px)
            `;
            
            // Move highlight in opposite direction for depth
            const highlightX = -portrait.current.tx * 2;
            const highlightY = -portrait.current.ty * 2;
            portrait.highlight.style.transform = `translate(${highlightX}px, ${highlightY}px)`;
        });
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    addStyles() {
        if (document.getElementById('gaze-follow-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'gaze-follow-styles';
        style.textContent = `
            /* Gaze wrapper */
            .gaze-wrapper {
                position: relative;
                display: inline-block;
                overflow: hidden;
                border-radius: inherit;
            }
            
            .gaze-wrapper img {
                display: block;
                width: 100%;
                height: auto;
                transition: transform 0.05s linear;
                transform-origin: center center;
                will-change: transform;
            }
            
            /* Highlight overlay - simulates light reflection */
            .gaze-highlight {
                position: absolute;
                top: 20%;
                right: 20%;
                width: 30%;
                height: 20%;
                background: radial-gradient(
                    ellipse at center,
                    rgba(255, 255, 255, 0.15) 0%,
                    transparent 70%
                );
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
                mix-blend-mode: overlay;
            }
            
            .gaze-wrapper:hover .gaze-highlight {
                opacity: 1;
            }
            
            /* Enhanced effect on hover */
            .gaze-wrapper:hover img {
                filter: brightness(1.02) contrast(1.02);
            }
            
            /* Subtle shadow for depth */
            .gaze-wrapper::after {
                content: '';
                position: absolute;
                inset: 0;
                box-shadow: inset 0 -50px 100px -50px rgba(0, 0, 0, 0.1);
                pointer-events: none;
                border-radius: inherit;
            }
            
            /* Eye shimmer on portfolio cards */
            .portfolio-card .gaze-wrapper::before,
            .artwork-card .gaze-wrapper::before {
                content: '';
                position: absolute;
                top: 30%;
                left: 30%;
                width: 40%;
                height: 15%;
                background: linear-gradient(
                    90deg,
                    transparent 0%,
                    rgba(255, 255, 255, 0.05) 50%,
                    transparent 100%
                );
                transform: skewX(-20deg);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.5s ease;
                z-index: 2;
            }
            
            .portfolio-card:hover .gaze-wrapper::before,
            .artwork-card:hover .gaze-wrapper::before {
                opacity: 1;
                animation: eyeShimmer 2s ease-in-out infinite;
            }
            
            @keyframes eyeShimmer {
                0%, 100% {
                    transform: skewX(-20deg) translateX(-20%);
                    opacity: 0;
                }
                50% {
                    transform: skewX(-20deg) translateX(20%);
                    opacity: 1;
                }
            }
            
            /* Breathing effect for static images */
            @keyframes subtleBreath {
                0%, 100% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.005);
                }
            }
            
            .gaze-wrapper.breathing img {
                animation: subtleBreath 4s ease-in-out infinite;
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .gaze-wrapper img,
                .gaze-highlight {
                    transition: none !important;
                    animation: none !important;
                }
            }
            
            /* Mobile: disable gaze (no mouse) */
            @media (max-width: 1024px) {
                .gaze-wrapper img {
                    transform: none !important;
                }
                .gaze-highlight {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public method to manually trigger refresh
    refresh() {
        this.findPortraits();
    }
    
    // Toggle effect
    toggle(enabled) {
        this.isActive = enabled;
        if (enabled && !this.animationFrame) {
            this.animate();
        }
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.gazeFollow = new GazeFollow();
    });
} else {
    window.gazeFollow = new GazeFollow();
}
