/**
 * RITUAL WEB v3.0 — RUPTURA Y ACCESO SIMBÓLICO
 * "La materia no resiste el mismo recorrido dos veces"
 */

/**
 * WEB QUE SE ROMPE (#40)
 * La navegación provoca grietas digitales
 * Zonas que funcionaban dejan de hacerlo
 */
class WebQueSeRompe {
    constructor() {
        this.cracks = [];
        this.maxCracks = 8;
        this.clickCount = 0;
        this.crackThreshold = 3;
        this.canvas = null;
        this.ctx = null;
        
        this.init();
    }
    
    init() {
        // Create crack canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'crack-layer';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9995;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Track interactions that cause damage
        document.addEventListener('click', (e) => this.onInteraction(e));
        window.addEventListener('scroll', () => this.onScroll());
        
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    onInteraction(e) {
        this.clickCount++;
        
        if (this.clickCount >= this.crackThreshold && this.cracks.length < this.maxCracks) {
            this.createCrack(e.clientX, e.clientY);
            this.crackThreshold += 2 + Math.floor(Math.random() * 3);
            
            // Show warning message occasionally
            if (this.cracks.length === 3 || this.cracks.length === 6) {
                this.showDamageWarning();
            }
        }
    }
    
    onScroll() {
        // Random cracks from aggressive scrolling
        if (Math.random() < 0.008 && this.cracks.length < this.maxCracks) {
            this.createCrack(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight
            );
        }
    }
    
    createCrack(x, y) {
        const crack = {
            x: x,
            y: y,
            segments: [],
            opacity: 0,
            targetOpacity: 0.6 + Math.random() * 0.3,
            branches: 2 + Math.floor(Math.random() * 3)
        };
        
        // Generate crack segments
        for (let b = 0; b < crack.branches; b++) {
            let currentX = x;
            let currentY = y;
            let angle = (b / crack.branches) * Math.PI * 2 + (Math.random() - 0.5);
            const segmentCount = 5 + Math.floor(Math.random() * 8);
            
            for (let i = 0; i < segmentCount; i++) {
                const length = 20 + Math.random() * 40;
                angle += (Math.random() - 0.5) * 0.8;
                
                const newX = currentX + Math.cos(angle) * length;
                const newY = currentY + Math.sin(angle) * length;
                
                crack.segments.push({
                    x1: currentX,
                    y1: currentY,
                    x2: newX,
                    y2: newY,
                    drawn: 0
                });
                
                currentX = newX;
                currentY = newY;
            }
        }
        
        this.cracks.push(crack);
        
        // Disable random element near crack
        this.damageNearby(x, y);
    }
    
    damageNearby(x, y) {
        const elements = document.querySelectorAll('.work-item, .nav-links a, p, h2, h3');
        let closest = null;
        let closestDist = Infinity;
        
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const elX = rect.left + rect.width / 2;
            const elY = rect.top + rect.height / 2;
            const dist = Math.sqrt((x - elX) ** 2 + (y - elY) ** 2);
            
            if (dist < closestDist && dist < 200) {
                closest = el;
                closestDist = dist;
            }
        });
        
        if (closest && Math.random() < 0.4) {
            closest.classList.add('damaged');
            closest.style.opacity = (parseFloat(closest.style.opacity) || 1) * 0.7;
            closest.style.filter = `blur(${Math.random() * 2}px)`;
        }
    }
    
    showDamageWarning() {
        const warning = document.createElement('div');
        warning.className = 'damage-warning';
        warning.innerHTML = `<em>"La materia no resiste el mismo recorrido dos veces."</em>`;
        document.body.appendChild(warning);
        
        setTimeout(() => warning.classList.add('visible'), 100);
        setTimeout(() => {
            warning.classList.remove('visible');
            setTimeout(() => warning.remove(), 1000);
        }, 4000);
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.cracks.forEach(crack => {
            // Fade in
            if (crack.opacity < crack.targetOpacity) {
                crack.opacity += 0.02;
            }
            
            this.ctx.strokeStyle = `rgba(60, 50, 40, ${crack.opacity})`;
            this.ctx.lineWidth = 0.5;
            
            crack.segments.forEach(seg => {
                if (seg.drawn < 1) {
                    seg.drawn += 0.05;
                }
                
                const progress = Math.min(seg.drawn, 1);
                const endX = seg.x1 + (seg.x2 - seg.x1) * progress;
                const endY = seg.y1 + (seg.y2 - seg.y1) * progress;
                
                this.ctx.beginPath();
                this.ctx.moveTo(seg.x1, seg.y1);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            });
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

/**
 * ACCESO POR VALOR SIMBÓLICO (#39)
 * Para entrar a ciertas zonas, escribir palabra clave
 * Las claves: "óxido", "piedra", "recuerdo", "grieta", "piel"
 */
class AccesoSimbolico {
    constructor() {
        this.keywords = ['óxido', 'piedra', 'recuerdo', 'grieta', 'piel', 'materia', 'tiempo'];
        this.unlockedKeywords = new Set();
        this.secretContent = null;
        
        this.init();
    }
    
    init() {
        // Create hidden input overlay
        this.createSecretPortal();
        
        // Listen for keyboard shortcuts
        let buffer = '';
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'Escape') {
                this.hidePortal();
                buffer = '';
                return;
            }
            
            // Press '/' to open portal
            if (e.key === '/' && !this.secretContent.classList.contains('visible')) {
                e.preventDefault();
                this.showPortal();
                return;
            }
        });
    }
    
    createSecretPortal() {
        this.secretContent = document.createElement('div');
        this.secretContent.className = 'secret-portal';
        this.secretContent.innerHTML = `
            <div class="portal-inner">
                <span class="portal-hint">escribe la palabra</span>
                <input type="text" class="portal-input" placeholder="..." autocomplete="off" spellcheck="false">
                <span class="portal-feedback"></span>
                <div class="unlocked-words"></div>
            </div>
        `;
        document.body.appendChild(this.secretContent);
        
        const input = this.secretContent.querySelector('.portal-input');
        const feedback = this.secretContent.querySelector('.portal-feedback');
        
        input.addEventListener('input', (e) => {
            const word = e.target.value.toLowerCase().trim();
            
            if (this.keywords.includes(word)) {
                if (!this.unlockedKeywords.has(word)) {
                    this.unlockedKeywords.add(word);
                    feedback.textContent = `"${word}" desbloqueado`;
                    feedback.classList.add('success');
                    this.revealContent(word);
                    this.updateUnlockedDisplay();
                    
                    setTimeout(() => {
                        input.value = '';
                        feedback.textContent = '';
                        feedback.classList.remove('success');
                    }, 2000);
                } else {
                    feedback.textContent = `ya conoces "${word}"`;
                }
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePortal();
            }
        });
    }
    
    showPortal() {
        this.secretContent.classList.add('visible');
        setTimeout(() => {
            this.secretContent.querySelector('.portal-input').focus();
        }, 100);
    }
    
    hidePortal() {
        this.secretContent.classList.remove('visible');
    }
    
    updateUnlockedDisplay() {
        const container = this.secretContent.querySelector('.unlocked-words');
        container.innerHTML = [...this.unlockedKeywords].map(w => 
            `<span class="unlocked-word">${w}</span>`
        ).join('');
    }
    
    revealContent(word) {
        // Reveal hidden elements based on keyword
        const revealMap = {
            'óxido': '.work-item:nth-child(3)',
            'piedra': '.work-item:nth-child(5)',
            'recuerdo': '.artist-statement',
            'grieta': '#crack-layer',
            'piel': 'body',
            'materia': '.reverso-overlay',
            'tiempo': '.bio-content'
        };
        
        const selector = revealMap[word];
        if (selector) {
            const el = document.querySelector(selector);
            if (el) {
                el.classList.add('symbolically-unlocked');
                el.style.setProperty('--unlock-glow', 'rgba(139, 107, 74, 0.3)');
            }
        }
        
        // Create floating word effect
        this.createFloatingWord(word);
    }
    
    createFloatingWord(word) {
        const floating = document.createElement('div');
        floating.className = 'floating-word';
        floating.textContent = word;
        floating.style.left = `${20 + Math.random() * 60}%`;
        floating.style.top = `${20 + Math.random() * 60}%`;
        document.body.appendChild(floating);
        
        setTimeout(() => floating.classList.add('visible'), 100);
        setTimeout(() => {
            floating.classList.remove('visible');
            setTimeout(() => floating.remove(), 1000);
        }, 5000);
    }
}

/**
 * GLOSARIO VIVO (#29)
 * Palabras clave flotando, click → mini texto poético
 */
class GlosarioVivo {
    constructor() {
        this.terms = {
            'materia': 'Lo que resiste. Lo que cede. Lo que queda.',
            'fragmento': 'Parte que contiene el todo. Ruina y semilla.',
            'peso': 'La gravedad del recuerdo. Lo que no flota.',
            'residuo': 'Lo que el tiempo no pudo del todo borrar.',
            'grieta': 'Por donde entra la luz. Por donde escapa.',
            'piel': 'Membrana entre el yo y el mundo.',
            'óxido': 'El color del tiempo sobre el hierro.',
            'huella': 'Presencia de una ausencia.'
        };
        
        this.init();
    }
    
    init() {
        // Spawn floating terms randomly
        setInterval(() => this.spawnTerm(), 8000 + Math.random() * 4000);
        
        // Initial terms
        setTimeout(() => this.spawnTerm(), 3000);
    }
    
    spawnTerm() {
        const terms = Object.keys(this.terms);
        const term = terms[Math.floor(Math.random() * terms.length)];
        
        const el = document.createElement('div');
        el.className = 'glossary-term';
        el.textContent = term;
        el.style.left = `${10 + Math.random() * 80}%`;
        el.style.top = `${10 + Math.random() * 80}%`;
        
        el.addEventListener('click', () => this.showDefinition(term, el));
        
        document.body.appendChild(el);
        
        setTimeout(() => el.classList.add('visible'), 100);
        setTimeout(() => {
            el.classList.remove('visible');
            setTimeout(() => el.remove(), 1000);
        }, 12000);
    }
    
    showDefinition(term, el) {
        const def = document.createElement('div');
        def.className = 'glossary-definition';
        def.innerHTML = `<strong>${term}</strong><br><em>${this.terms[term]}</em>`;
        
        const rect = el.getBoundingClientRect();
        def.style.left = `${rect.left}px`;
        def.style.top = `${rect.bottom + 10}px`;
        
        document.body.appendChild(def);
        
        setTimeout(() => def.classList.add('visible'), 50);
        setTimeout(() => {
            def.classList.remove('visible');
            setTimeout(() => def.remove(), 500);
        }, 4000);
    }
}

// Add styles for rupture effects
const ruptureStyles = document.createElement('style');
ruptureStyles.textContent = `
    /* DAMAGE WARNING (#40) */
    .damage-warning {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: transparent;
        color: var(--color-rust, #8b6b4a);
        font-family: var(--font-serif, Georgia);
        font-size: 0.9rem;
        font-style: italic;
        padding: 16px 32px;
        z-index: 10001;
        opacity: 0;
        transition: opacity 1s ease;
    }
    .damage-warning.visible {
        opacity: 1;
    }
    
    .damaged {
        transition: all 0.5s ease !important;
    }
    
    /* SECRET PORTAL (#39) */
    .secret-portal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
    }
    .secret-portal.visible {
        opacity: 1;
        pointer-events: all;
    }
    .portal-inner {
        text-align: center;
    }
    .portal-hint {
        display: block;
        font-family: var(--font-mono, monospace);
        font-size: 0.6rem;
        color: var(--color-text-muted, #5a5550);
        letter-spacing: 0.2em;
        text-transform: uppercase;
        margin-bottom: 24px;
    }
    .portal-input {
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--color-border, #2a2825);
        color: var(--color-text, #e8e4df);
        font-family: var(--font-serif, Georgia);
        font-size: 2rem;
        text-align: center;
        width: 300px;
        padding: 8px;
        outline: none;
    }
    .portal-input::placeholder {
        color: var(--color-text-muted, #5a5550);
    }
    .portal-feedback {
        display: block;
        margin-top: 16px;
        font-family: var(--font-mono, monospace);
        font-size: 0.7rem;
        color: var(--color-text-muted, #5a5550);
        min-height: 20px;
    }
    .portal-feedback.success {
        color: var(--color-rust, #8b6b4a);
    }
    .unlocked-words {
        margin-top: 32px;
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
    }
    .unlocked-word {
        font-family: var(--font-mono, monospace);
        font-size: 0.6rem;
        color: var(--color-rust, #8b6b4a);
        letter-spacing: 0.1em;
    }
    
    /* FLOATING WORD */
    .floating-word {
        position: fixed;
        font-family: var(--font-serif, Georgia);
        font-size: 3rem;
        color: rgba(139, 107, 74, 0.1);
        pointer-events: none;
        z-index: 9990;
        opacity: 0;
        transition: opacity 2s ease;
    }
    .floating-word.visible {
        opacity: 1;
    }
    
    /* SYMBOLICALLY UNLOCKED */
    .symbolically-unlocked {
        box-shadow: 0 0 30px var(--unlock-glow, rgba(139, 107, 74, 0.3));
    }
    
    /* GLOSSARY (#29) */
    .glossary-term {
        position: fixed;
        font-family: var(--font-mono, monospace);
        font-size: 0.65rem;
        color: var(--color-text-muted, #5a5550);
        letter-spacing: 0.15em;
        text-transform: uppercase;
        cursor: pointer;
        z-index: 9991;
        opacity: 0;
        transition: opacity 1s ease, color 0.3s ease;
    }
    .glossary-term.visible {
        opacity: 1;
    }
    .glossary-term:hover {
        color: var(--color-rust, #8b6b4a);
    }
    
    .glossary-definition {
        position: fixed;
        background: rgba(10, 10, 10, 0.95);
        border: 1px solid var(--color-border, #2a2825);
        padding: 16px 20px;
        max-width: 280px;
        font-family: var(--font-serif, Georgia);
        font-size: 0.85rem;
        color: var(--color-text, #e8e4df);
        line-height: 1.6;
        z-index: 9992;
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    .glossary-definition.visible {
        opacity: 1;
    }
    .glossary-definition strong {
        font-family: var(--font-mono, monospace);
        font-size: 0.6rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--color-rust, #8b6b4a);
    }
    
    /* PORTAL HINT */
    .portal-key-hint {
        position: fixed;
        bottom: 32px;
        left: 32px;
        font-family: var(--font-mono, monospace);
        font-size: 0.55rem;
        color: var(--color-text-muted, #5a5550);
        opacity: 0.3;
        letter-spacing: 0.1em;
    }
`;
document.head.appendChild(ruptureStyles);

// Initialize rupture features
document.addEventListener('DOMContentLoaded', () => {
    new WebQueSeRompe();
    new AccesoSimbolico();
    new GlosarioVivo();
    
    // Add portal hint
    const hint = document.createElement('div');
    hint.className = 'portal-key-hint';
    hint.textContent = '/ para portal';
    document.body.appendChild(hint);
    
    console.log('💀 Ritual Web v3.0 — La web se rompe, el acceso se gana');
});
