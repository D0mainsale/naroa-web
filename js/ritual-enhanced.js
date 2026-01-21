/**
 * RITUAL WEB v3.0 — PROTOCOLO DE CONTEMPLACIÓN PROFUNDA
 * "El archivo como ritual espiritual"
 */

/**
 * RESPIRACIÓN SINCRONIZADA (#NEW)
 * El background "respira" con ritmo 4-7-8 (técnica de meditación)
 */
class BreathingBackground {
    constructor() {
        this.breathing = false;
        this.init();
    }
    
    init() {
        const ritualView = document.querySelector('.ritual-view');
        if (!ritualView) return;
        
        // Create breath overlay
        const breathOverlay = document.createElement('div');
        breathOverlay.className = 'breath-overlay';
        ritualView.insertBefore(breathOverlay, ritualView.firstChild);
        
        // Start breathing cycle
        this.breathe(breathOverlay);
    }
    
    breathe(overlay) {
        // 4-7-8 breathing: 4s inhale, 7s hold, 8s exhale
        const inhale = () => {
            overlay.style.transition = 'opacity 4s ease-in';
            overlay.style.opacity = '0.3';
        };
        
        const hold = () => {
            // No visual change during hold
        };
        
        const exhale = () => {
            overlay.style.transition = 'opacity 8s ease-out';
            overlay.style.opacity = '0.05';
        };
        
        const cycle = () => {
            inhale();
            setTimeout(() => {
                hold();
                setTimeout(() => {
                    exhale();
                    setTimeout(cycle, 8000); // Start new cycle after exhale
                }, 7000); // Hold duration
            }, 4000); // Inhale duration
        };
        
        cycle();
    }
}

/**
 * CURSOR LÍQUIDO (#NEW)
 * El cursor deja un rastro líquido y orgánico
 */
class LiquidCursor {
    constructor() {
        this.trails = [];
        this.maxTrails = 15;
        this.init();
    }
    
    init() {
        const ritualView = document.querySelector('.ritual-view');
        if (!ritualView) return;
        
        const cursorContainer = document.createElement('div');
        cursorContainer.className = 'liquid-cursor-container';
        cursorContainer.style.cssText = `
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 9998;
        `;
        document.body.appendChild(cursorContainer);
        
        document.addEventListener('mousemove', (e) => {
            this.addTrail(cursorContainer, e.clientX, e.clientY);
        });
    }
    
    addTrail(container, x, y) {
        const trail = document.createElement('div');
        trail.className = 'liquid-trail';
        trail.style.left = `${x}px`;
        trail.style.top = `${y}px`;
        
        container.appendChild(trail);
        this.trails.push(trail);
        
        // Remove old trails
        if (this.trails.length > this.maxTrails) {
            const oldTrail = this.trails.shift();
            oldTrail.remove();
        }
        
        // Fade out and expand
        setTimeout(() => trail.classList.add('fade'), 10);
        setTimeout(() => trail.remove(), 1500);
    }
}

/**
 * CALENDARIO LUNAR (#NEW)
 * Muestra la fase lunar actual en el HUD
 */
class LunarPhase {
    constructor() {
        this.phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
        this.init();
    }
    
    init() {
        const hud = document.querySelector('.game-hud');
        if (!hud) return;
        
        const lunarDisplay = document.createElement('div');
        lunarDisplay.className = 'lunar-display';
        lunarDisplay.innerHTML = `
            <div class="lunar-phase">${this.getCurrentPhase()}</div>
            <div class="lunar-label">Luna ${this.getPhaseName()}</div>
        `;
        
        hud.appendChild(lunarDisplay);
    }
    
    getCurrentPhase() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Simplified lunar calculation
        const c = (year + 4716 - Math.floor((14 - month) / 12));
        const e = (month + 9 - Math.floor((month + 9) / 12) * 12);
        const jd = Math.floor((1461 * c) / 4) + Math.floor((367 * e) / 12) 
                 - Math.floor((3 * Math.floor((c + 100) / 100)) / 4) + day - 1402;
        const phase = ((jd - 2451550.1) / 29.53058867) % 1;
        
        const index = Math.floor(phase * 8);
        return this.phases[index];
    }
    
    getPhaseName() {
        const names = ['Nueva', 'Creciente', 'Cuarto creciente', 'Gibosa creciente', 
                      'Llena', 'Gibosa menguante', 'Cuarto menguante', 'Menguante'];
        const date = new Date();
        const phase = ((date - new Date(2000, 0, 6)) / 86400000 / 29.53058867) % 1;
        const index = Math.floor(phase * 8);
        return names[index];
    }
}

/**
 * TIEMPO RITUAL (#NEW)
 * El tiempo no es cronológico, sino emocional
 */
class RitualTime {
    constructor() {
        this.startTime = Date.now();
        this.init();
    }
    
    init() {
        const hud = document.querySelector('.game-hud');
        if (!hud) return;
        
        const timeDisplay = document.createElement('div');
        timeDisplay.className = 'ritual-time-display';
        timeDisplay.innerHTML = `
            <div class="hud-label">Tiempo Ritual</div>
            <div class="ritual-time-value">Ahora</div>
        `;
        
        hud.appendChild(timeDisplay);
        
        this.updateTime(timeDisplay);
    }
    
    updateTime(display) {
        setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            
            const timeValue = display.querySelector('.ritual-time-value');
            
            if (minutes < 1) {
                timeValue.textContent = 'Instante presente';
            } else if (minutes < 5) {
                timeValue.textContent = 'Momento suspendido';
            } else if (minutes < 10) {
                timeValue.textContent = 'Flujo contemplativo';
            } else if (minutes < 20) {
                timeValue.textContent = 'Inmersión profunda';
            } else {
                timeValue.textContent = 'Tiempo fuera del tiempo';
            }
        }, 1000);
    }
}

/**
 * ONDAS DE ENERGÍA (#NEW)
 * Las tiles emiten ondas cuando las tocas
 */
class EnergyWaves {
    constructor() {
        this.init();
    }
    
    init() {
        // Add to existing tiles
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('tile')) {
                this.createWave(e.target);
            }
        });
    }
    
    createWave(tile) {
        const wave = document.createElement('div');
        wave.className = 'energy-wave';
        tile.appendChild(wave);
        
        setTimeout(() => wave.classList.add('expand'), 10);
        setTimeout(() => wave.remove(), 1000);
    }
}

/**
 * REVERSO MEJORADO (#52 Enhanced)
 * Ahora también muestra el "aura" de la obra
 */
class ReversoEnhanced {
    constructor() {
        this.revealed = new Set();
        this.init();
    }
    
    init() {
        const works = document.querySelectorAll('.tile');
        
        works.forEach((work, index) => {
            // Generate unique aura color
            const hue = (index * 137.5) % 360; // Golden angle
            const auraColor = `hsl(${hue}, 70%, 60%)`;
            
            // Create enhanced reverso overlay
            const reverso = document.createElement('div');
            reverso.className = 'reverso-overlay enhanced';
            reverso.style.setProperty('--aura-color', auraColor);
            reverso.innerHTML = `
                <div class="reverso-content">
                    <div class="reverso-aura" style="box-shadow: 0 0 60px ${auraColor}"></div>
                    <span class="reverso-label">REVERSO</span>
                    <div class="reverso-details">
                        <span>Bastidor ${340 + (index * 10)}×${220 + (index * 5)} mm</span>
                        <span>Clavos oxidados: ${Math.floor(Math.random() * 5) + 2}</span>
                        <span>Cinta embalaje: ${['Marrón', 'Transparente', 'Kraft'][index % 3]}</span>
                        <span>Etiqueta: ${2019 + (index % 7)}</span>
                        <span class="reverso-energy">Energía: ${auraColor}</span>
                    </div>
                    <span class="reverso-instruction">mantén pulsado 2s para voltear</span>
                </div>
            `;
            
            work.style.position = 'relative';
            work.appendChild(reverso);
            
            // Reveal on long press (2 seconds)
            let pressTimer;
            work.addEventListener('mousedown', () => {
                reverso.classList.add('pressing');
                pressTimer = setTimeout(() => {
                    this.revealed.add(index);
                    reverso.classList.add('revealed');
                    // Play reveal sound (if audio system exists)
                    this.playRevealSound();
                }, 2000);
            });
            
            work.addEventListener('mouseup', () => {
                clearTimeout(pressTimer);
                reverso.classList.remove('pressing');
            });
            work.addEventListener('mouseleave', () => {
                clearTimeout(pressTimer);
                reverso.classList.remove('pressing');
            });
        });
    }
    
    playRevealSound() {
        // Simple audio feedback
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 432; // A4 in 432Hz tuning
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// Add enhanced styles
const enhancedRitualStyles = document.createElement('style');
enhancedRitualStyles.textContent = `
    /* BREATHING BACKGROUND */
    .breath-overlay {
        position: fixed;
        inset: 0;
        background: radial-gradient(circle at center, 
            rgba(139, 92, 246, 0.1), 
            transparent 70%);
        opacity: 0.05;
        pointer-events: none;
        z-index: 0;
        mix-blend-mode: screen;
    }
    
    /* LIQUID CURSOR - Escala áurea */
    .liquid-trail {
        position: absolute;
        width: calc(var(--space-sm) * 1.618); /* φ × 10px = ~16px */
        height: calc(var(--space-sm) * 1.618);
        border-radius: 50%;
        background: radial-gradient(circle, 
            rgba(201, 48, 48, 0.6), 
            rgba(139, 92, 246, 0.3));
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.7;
        transition: all 1.5s cubic-bezier(0.23, 1, 0.32, 1);
        pointer-events: none;
    }
    
    .liquid-trail.fade {
        transform: translate(-50%, -50%) scale(calc(1 * 1.618 * 1.618)); /* φ² */
        opacity: 0;
    }
    
    /* LUNAR DISPLAY - Escala áurea */
    .lunar-display {
        text-align: center;
        padding: var(--space-sm) var(--space-lg); /* Proporción áurea */
        background: rgba(255, 255, 255, 0.03);
        border-radius: calc(var(--space-md) * 0.75);
        border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .lunar-phase {
        font-size: var(--font-xl); /* Áureo */
        line-height: 1;
        filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.3));
    }
    
    .lunar-label {
        font-size: var(--font-xs); /* Áureo */
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: rgba(255, 255, 255, 0.5);
        margin-top: var(--space-xs);
    }
    
    /* RITUAL TIME - Escala áurea */
    .ritual-time-display {
        text-align: center;
        padding: var(--space-sm) var(--space-lg);
    }
    
    .ritual-time-value {
        font-size: var(--font-sm); /* Áureo */
        font-style: italic;
        color: var(--ritual-gold);
        margin-top: var(--space-xs);
    }
    
    /* ENERGY WAVES - Escala áurea */
    .energy-wave {
        position: absolute;
        inset: 0;
        border: 2px solid var(--ritual-glow);
        border-radius: calc(var(--space-md) * 0.75);
        opacity: 0.7;
        transform: scale(1);
        pointer-events: none;
    }
    
    .energy-wave.expand {
        transform: scale(1.618); /* φ */
        opacity: 0;
        transition: all 0.8s ease-out;
    }
    
    /* ENHANCED REVERSO - Escala áurea */
    .reverso-overlay.pressing {
        background: rgba(10, 10, 15, 0.95);
    }
    
    .reverso-overlay.pressing::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: calc(var(--space-xs) / 2); /* ~3px */
        background: var(--ritual-gold);
        animation: pressProgress 2s linear;
    }
    
    @keyframes pressProgress {
        from { width: 0; }
        to { width: 100%; }
    }
    
    .reverso-aura {
        width: calc(var(--space-3xl) * 0.618); /* ~60px usando φ⁻¹ */
        height: calc(var(--space-3xl) * 0.618);
        border-radius: 50%;
        background: var(--aura-color);
        margin: 0 auto var(--space-lg);
        filter: blur(var(--space-md));
        opacity: 0.6;
        animation: aurapulse 3s ease-in-out infinite;
    }
    
    @keyframes aurapulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.272); opacity: 0.8; } /* √φ ≈ 1.272 */
    }
    
    .reverso-energy {
        color: var(--aura-color) !important;
        font-weight: 600;
        text-shadow: 0 0 var(--space-sm) var(--aura-color);
    }
    
    /* RITUAL VIEW CURSOR */
    .ritual-view {
        cursor: none;
    }
    
    .ritual-view .tile {
        cursor: none;
    }
`;
document.head.appendChild(enhancedRitualStyles);

// Initialize enhanced ritual features
document.addEventListener('DOMContentLoaded', () => {
    // Wait for ritual view to be active
    const initEnhancedRitual = () => {
        if (window.location.hash.includes('ritual')) {
            new BreathingBackground();
            new LiquidCursor();
            new LunarPhase();
            new RitualTime();
            new EnergyWaves();
            new ReversoEnhanced();
            
            console.log('🌙 Ritual Web v3.0 activated — Protocolo de contemplación profunda');
        }
    };
    
    // Init on hash change
    window.addEventListener('hashchange', initEnhancedRitual);
    initEnhancedRitual();
});
