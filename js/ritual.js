/**
 * RITUAL WEB v2.0 — ESTRATEGIAS SENSORIALES PROFUNDAS
 * No es UI. Es lenguaje ritual digital.
 */

/**
 * OBRA VISTA DESDE EL REVERSO (#52)
 * Galería muestra primero el bastidor, clavos, etiquetas
 * Lo frontal se desbloquea tras recorrer lo oculto
 */
class ReversoFirst {
    constructor() {
        this.revealed = new Set();
        this.init();
    }
    
    init() {
        const works = document.querySelectorAll('.work-item');
        
        works.forEach((work, index) => {
            const img = work.querySelector('img');
            if (!img) return;
            
            // Create reverso overlay
            const reverso = document.createElement('div');
            reverso.className = 'reverso-overlay';
            reverso.innerHTML = `
                <div class="reverso-content">
                    <span class="reverso-label">REVERSO</span>
                    <div class="reverso-details">
                        <span>Bastidor ${340 + (index * 10)}×${220 + (index * 5)} mm</span>
                        <span>3 clavos oxidados</span>
                        <span>Cinta embalaje</span>
                        <span>Etiqueta: ${2019 + (index % 6)}</span>
                    </div>
                    <span class="reverso-instruction">mantén pulsado para voltear</span>
                </div>
            `;
            
            work.style.position = 'relative';
            work.appendChild(reverso);
            
            // Reveal on long press
            let pressTimer;
            work.addEventListener('mousedown', () => {
                pressTimer = setTimeout(() => {
                    this.revealed.add(index);
                    reverso.classList.add('revealed');
                }, 1500);
            });
            
            work.addEventListener('mouseup', () => clearTimeout(pressTimer));
            work.addEventListener('mouseleave', () => clearTimeout(pressTimer));
        });
    }
}

/**
 * STATEMENT EN VIDRIO SUCIO (#53)
 * Texto trazado en polvo, se borra mientras lees
 */
class DustyText {
    constructor() {
        this.init();
    }
    
    init() {
        const statements = document.querySelectorAll('.artist-statement p, .home-statement blockquote');
        
        statements.forEach(el => {
            el.classList.add('dusty-text');
            
            // Create dust layer
            const dustLayer = document.createElement('div');
            dustLayer.className = 'dust-layer';
            el.style.position = 'relative';
            el.appendChild(dustLayer);
            
            // Erase dust on hover/touch
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                dustLayer.style.background = `
                    radial-gradient(
                        circle 60px at ${x}% ${y}%,
                        transparent 0%,
                        rgba(20,18,15,0.85) 70%
                    )
                `;
            });
        });
    }
}

/**
 * BIO COMO FOSA (#56)
 * Entras en espacio negro, palabras cayendo
 * Solo una línea por pantalla
 */
class BioFosa {
    constructor() {
        this.init();
    }
    
    init() {
        const bioContent = document.querySelector('.bio-content');
        if (!bioContent) return;
        
        const paragraphs = bioContent.querySelectorAll('p');
        
        paragraphs.forEach((p, i) => {
            p.style.cssText = `
                opacity: 0;
                transform: translateY(-30px);
                transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
                transition-delay: ${i * 0.3}s;
            `;
        });
        
        // Intersection observer for reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const paragraphs = entry.target.querySelectorAll('p');
                    paragraphs.forEach(p => {
                        p.style.opacity = '1';
                        p.style.transform = 'translateY(0)';
                    });
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(bioContent);
    }
}

/**
 * COORDENADAS GPS EN VEZ DE TÍTULO (#27)
 * Cada obra se nombra con coordenadas GPS
 */
function applyGPSCoordinates() {
    const titles = document.querySelectorAll('.work-item .work-title, .work-title');
    
    // Coordenadas de lugares significativos en Bizkaia
    const coords = [
        "43°15'40.3\"N 2°55'23.1\"W", // Bilbao
        "43°20'12.8\"N 2°58'45.2\"W", // Getxo
        "43°19'05.4\"N 2°41'18.7\"W", // Durango
        "43°17'33.1\"N 2°59'12.4\"W", // Portugalete
        "43°22'48.9\"N 3°00'56.8\"W", // Plentzia
        "43°18'21.6\"N 2°52'44.3\"W", // Galdakao
    ];
    
    titles.forEach((title, i) => {
        const originalText = title.textContent;
        title.setAttribute('data-original', originalText);
        title.textContent = coords[i % coords.length];
        title.classList.add('gps-title');
        
        // Show original on hover
        title.addEventListener('mouseenter', () => {
            title.textContent = originalText;
        });
        title.addEventListener('mouseleave', () => {
            title.textContent = coords[i % coords.length];
        });
    });
}

/**
 * MODO SILENCIO TOTAL (#38)
 * Desactiva todo texto, solo imagen
 */
class SilenceMode {
    constructor() {
        this.active = false;
        this.createToggle();
    }
    
    createToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'silence-toggle';
        toggle.innerHTML = '◯';
        toggle.setAttribute('aria-label', 'Modo silencio');
        toggle.title = 'Contemplación pura';
        
        toggle.addEventListener('click', () => this.toggle());
        document.body.appendChild(toggle);
    }
    
    toggle() {
        this.active = !this.active;
        document.body.classList.toggle('silence-mode', this.active);
        
        const toggle = document.querySelector('.silence-toggle');
        toggle.innerHTML = this.active ? '●' : '◯';
    }
}

// Add styles for new features
const ritualStyles = document.createElement('style');
ritualStyles.textContent = `
    /* REVERSO OVERLAY (#52) */
    .reverso-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #0a0908;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.8s ease;
        z-index: 10;
    }
    .reverso-overlay.revealed {
        opacity: 0;
        pointer-events: none;
    }
    .reverso-content {
        text-align: center;
        color: var(--color-text-muted, #5a5550);
        font-family: var(--font-mono, monospace);
        font-size: 0.65rem;
        text-transform: uppercase;
        letter-spacing: 0.15em;
    }
    .reverso-label {
        display: block;
        font-size: 0.5rem;
        margin-bottom: 16px;
        opacity: 0.4;
    }
    .reverso-details {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 24px;
    }
    .reverso-instruction {
        display: block;
        font-size: 0.55rem;
        opacity: 0.3;
        animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
    }
    
    /* DUSTY TEXT (#53) */
    .dusty-text {
        position: relative;
    }
    .dust-layer {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(20,18,15,0.85);
        pointer-events: none;
        transition: background 0.1s ease;
    }
    
    /* GPS TITLES (#27) */
    .gps-title {
        font-family: var(--font-mono, monospace) !important;
        font-size: 0.7rem !important;
        letter-spacing: 0.05em;
        color: var(--color-rust, #8b6b4a) !important;
        transition: all 0.3s ease;
    }
    
    /* SILENCE MODE (#38) */
    .silence-toggle {
        position: fixed;
        bottom: 32px;
        right: 32px;
        width: 32px;
        height: 32px;
        background: transparent;
        border: 1px solid var(--color-border, #2a2825);
        color: var(--color-text-muted, #5a5550);
        font-size: 12px;
        cursor: pointer;
        z-index: 10000;
        transition: all 0.3s ease;
        border-radius: 50%;
    }
    .silence-toggle:hover {
        border-color: var(--color-text, #e8e4df);
        color: var(--color-text, #e8e4df);
    }
    
    body.silence-mode .nav,
    body.silence-mode .work-title,
    body.silence-mode .work-meta,
    body.silence-mode h1, h2, h3,
    body.silence-mode p,
    body.silence-mode .artist-statement,
    body.silence-mode footer {
        opacity: 0 !important;
        pointer-events: none;
    }
    body.silence-mode .silence-toggle {
        opacity: 0.3;
    }
    body.silence-mode {
        cursor: none;
    }
    
    /* WEB QUE SE ROMPE (#40) */
    .crack-effect {
        position: fixed;
        pointer-events: none;
        z-index: 9996;
        opacity: 0.15;
    }
`;
document.head.appendChild(ritualStyles);

// Initialize all ritual features
document.addEventListener('DOMContentLoaded', () => {
    // Core ritual features
    new ReversoFirst();
    new DustyText();
    new BioFosa();
    new SilenceMode();
    
    // Apply GPS coordinates after a moment
    setTimeout(applyGPSCoordinates, 100);
    
    console.log('🕯️ Ritual Web v2.0 activated — La materia es el mensaje');
});
