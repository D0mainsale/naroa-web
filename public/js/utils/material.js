/**
 * HILOS TENSADOS (#21)
 * Overlay de líneas como redes, tensores, estructuras de andamio
 * La web SOSTIENE TENSIÓN, como una instalación
 */

// TensionWeb REMOVED for clarity

/**
 * SCROLL CON FRICCIÓN (#55)
 * No es fluido. Hay saltos, vibraciones, atascos breves.
 * Como mover una pieza pesada sobre cemento
 */
class FrictionScroll {
    constructor() {
        this.enabled = true;
        this.init();
    }
    
    init() {
        let lastScroll = 0;
        let friction = 0;
        
        window.addEventListener('scroll', () => {
            if (!this.enabled) return;
            
            const current = window.scrollY;
            const delta = Math.abs(current - lastScroll);
            
            // Random friction moments
            if (Math.random() < 0.03 && delta > 10) {
                friction = 1;
                document.body.style.transform = `translateX(${(Math.random() - 0.5) * 2}px)`;
                
                setTimeout(() => {
                    document.body.style.transform = 'translateX(0)';
                }, 50);
            }
            
            lastScroll = current;
        });
    }
}

/**
 * HOVER QUE DESVANECE (#28)
 * Al pasar el cursor sobre imagen, esta SE DESVANECE
 * Subvierte el "hover para ver más". Aquí, hover = PÉRDIDA
 */
function initFadeOnHover() {
    const images = document.querySelectorAll('.work-item img, .series-gallery img');
    
    images.forEach(img => {
        img.style.transition = 'opacity 0.8s ease, filter 0.8s ease';
        
        img.addEventListener('mouseenter', () => {
            img.style.opacity = '0.1';
            img.style.filter = 'blur(4px) grayscale(100%)';
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.opacity = '1';
            img.style.filter = 'blur(0) grayscale(0%)';
        });
    });
}

/**
 * TEXTOS QUE SE FILTRAN (#37)
 * Las palabras aparecen como si goteasen desde arriba
 * El lenguaje también es MATERIAL y PROCESO
 */
function initDrippingText() {
    const statements = document.querySelectorAll('.artist-statement p, .home-statement blockquote');
    
    statements.forEach(el => {
        const text = el.textContent;
        el.innerHTML = '';
        el.style.overflow = 'hidden';
        
        [...text].forEach((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            span.style.cssText = `
                display: inline-block;
                opacity: 0;
                transform: translateY(-20px);
                animation: drip 0.6s ease forwards;
                animation-delay: ${i * 0.02}s;
            `;
            el.appendChild(span);
        });
    });
}

// Add drip animation to stylesheet
const dripStyle = document.createElement('style');
dripStyle.textContent = `
    @keyframes drip {
        0% {
            opacity: 0;
            transform: translateY(-20px);
        }
        60% {
            opacity: 1;
            transform: translateY(3px);
        }
        100% {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* INTERFAZ CON DESGASTE (#23) */
    .nav-links a {
        position: relative;
    }
    .nav-links a::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(200,180,160,0.3) 20%,
            rgba(200,180,160,0.5) 40%,
            transparent 50%,
            rgba(200,180,160,0.4) 70%,
            transparent 100%
        );
        transform: scaleX(0);
        transition: transform 0.4s ease;
    }
    .nav-links a:hover::after {
        transform: scaleX(1);
    }
    
    /* ZONAS MUERTAS (#25) - Random unresponsive areas */
    .dead-zone {
        pointer-events: none !important;
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(dripStyle);

// Initialize all effects
document.addEventListener('DOMContentLoaded', () => {
    // TensionWeb disabled - was causing page shading
    // new TensionWeb();
    new FrictionScroll();
    initFadeOnHover();
    
    // Delay dripping text for dramatic effect
    setTimeout(initDrippingText, 500);
    
    // Random dead zones (#25)
    const elements = document.querySelectorAll('.nav-links li');
    if (elements.length > 0 && Math.random() < 0.1) {
        const randomEl = elements[Math.floor(Math.random() * elements.length)];
        randomEl.classList.add('dead-zone');
        setTimeout(() => randomEl.classList.remove('dead-zone'), 5000);
    }
});
