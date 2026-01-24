// === SISTEMAS RITUALES SIMPLIFICADOS ===
// (Mantiene los efectos esenciales, elimina el BoardGame)

// === CURSOR ESTELA DE PIGMENTO ===
class PigmentTrail {
    constructor() {
        this.particles = [];
        this.currentColor = '#d03030';
        // Canvas desactivado para evitar sombreado
        // this.canvas = document.createElement('canvas');
        // this.canvas.id = 'pigment-canvas';
        /* Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: '9998'
        });
        document.body.appendChild(this.canvas); */
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    addParticle(x, y) {
        this.particles.push({ x, y, life: 1.0, color: this.currentColor });
    }
    
    setColor(color) {
        this.currentColor = color;
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles = this.particles.filter(p => {
            p.life -= 0.015;
            if (p.life > 0) {
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.life * 0.25;
                this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
                return true;
            }
            return false;
        });
        
        this.ctx.globalAlpha = 1.0;
        requestAnimationFrame(() => this.animate());
    }
}

// === CICLO DÍA/NOCHE ===
class DayNightCycle {
    constructor() {
        this.updateTheme();
        setInterval(() => this.updateTheme(), 60000);
    }
    
    updateTheme() {
        const hour = new Date().getHours();
        const root = document.documentElement;
        
        if (hour >= 6 && hour < 12) {
            // Mañana
            root.style.setProperty('--bg-color', '#f4f3f0');
            root.style.setProperty('--text-color', '#1a1a1a');
        } else if (hour >= 12 && hour < 20) {
            // Tarde
            root.style.setProperty('--bg-color', '#e8e6e1');
            root.style.setProperty('--text-color', '#2a2a2a');
        } else {
            // Noche
            root.style.setProperty('--bg-color', '#1a1a1a');
            root.style.setProperty('--text-color', '#f4f3f0');
        }
        
        document.body.style.backgroundColor = getComputedStyle(root).getPropertyValue('--bg-color');
        document.body.style.color = getComputedStyle(root).getPropertyValue('--text-color');
    }
}

// === EXTRACCIÓN DE PALETA ===
class ColorExtractor {
    static getDominantColors(imageElement, count = 3) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        
        try {
            ctx.drawImage(imageElement, 0, 0, 50, 50);
            const imageData = ctx.getImageData(0, 0, 50, 50);
            const pixels = imageData.data;
            
            const colorMap = {};
            for (let i = 0; i < pixels.length; i += 16) {
                const r = Math.floor(pixels[i] / 30) * 30;
                const g = Math.floor(pixels[i + 1] / 30) * 30;
                const b = Math.floor(pixels[i + 2] / 30) * 30;
                const key = `${r},${g},${b}`;
                colorMap[key] = (colorMap[key] || 0) + 1;
            }
            
            return Object.entries(colorMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, count)
                .map(([key]) => {
                    const [r, g, b] = key.split(',');
                    return `rgb(${r},${g},${b})`;
                });
        } catch (e) {
            return ['#d03030', '#1a1a1a', '#f4f3f0'];
        }
    }
}

// === GLITCH TEXT - Textos que se corrompen ===
class GlitchText {
    constructor() {
        this.glitchChars = '█▓▒░╳╱╲◤◥◢◣△▽○●';
        this.originalTexts = new Map();
        this.init();
    }
    
    init() {
        // Aplicar a títulos ocasionalmente
        setInterval(() => this.randomGlitch(), 8000);
    }
    
    randomGlitch() {
        const elements = document.querySelectorAll('h1, h2, .hud-value');
        if (elements.length === 0) return;
        
        const el = elements[Math.floor(Math.random() * elements.length)];
        if (!this.originalTexts.has(el)) {
            this.originalTexts.set(el, el.textContent);
        }
        
        const original = this.originalTexts.get(el);
        el.textContent = this.glitchify(original);
        
        setTimeout(() => {
            el.textContent = original;
        }, 150);
    }
    
    glitchify(text) {
        return text.split('').map(char => 
            Math.random() > 0.7 ? this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)] : char
        ).join('');
    }
}

// === WEB DECAY - Web que se descompone con el tiempo ===
class WebDecay {
    constructor() {
        this.visits = this.loadVisits();
        this.decay();
    }
    
    loadVisits() {
        const v = parseInt(localStorage.getItem('naroa_visits') || '0');
        localStorage.setItem('naroa_visits', (v + 1).toString());
        return v + 1;
    }
    
    decay() {
        const decayLevel = Math.min(this.visits / 100, 0.3); // Max 30% decay
        
        if (decayLevel > 0.05) {
            // Slight visual decay
            document.documentElement.style.setProperty('--decay-blur', `${decayLevel * 2}px`);
            document.documentElement.style.setProperty('--decay-noise', decayLevel);
        }
        
        // Random element "breaks" after many visits
        if (this.visits > 20 && Math.random() > 0.9) {
            setTimeout(() => {
                const tiles = document.querySelectorAll('.tile');
                if (tiles.length) {
                    const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
                    randomTile.style.transform = `rotate(${(Math.random() - 0.5) * 10}deg)`;
                }
            }, 3000);
        }
    }
}

// === RITUAL HANDSHAKE - El usuario debe "demostrar" algo ===
class RitualHandshake {
    constructor() {
        this.secrets = {
            'kintsugi': 'Has encontrado la esencia dorada.',
            'oca': '🦆 De oca a oca...',
            'naroa': '💜 La artista te saluda.',
            'arte': 'El arte es el espejo del alma.',
            'roto': 'Lo roto también brilla.'
        };
        this.init();
    }
    
    init() {
        let typed = '';
        document.addEventListener('keydown', (e) => {
            typed += e.key.toLowerCase();
            typed = typed.slice(-15);
            
            for (const [secret, message] of Object.entries(this.secrets)) {
                if (typed.includes(secret)) {
                    this.showSecret(message);
                    typed = '';
                    break;
                }
            }
        });
    }
    
    showSecret(message) {
        const el = document.createElement('div');
        el.className = 'ritual-secret';
        el.textContent = message;
        document.body.appendChild(el);
        
        setTimeout(() => el.classList.add('visible'), 50);
        setTimeout(() => {
            el.classList.remove('visible');
            setTimeout(() => el.remove(), 500);
        }, 3000);
    }
}

// === HEARTBEAT CURSOR - Cursor que late ===
class HeartbeatCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.id = 'heartbeat-cursor';
        document.body.appendChild(this.cursor);
        
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
        });
        
        this.beat();
    }
    
    beat() {
        this.cursor.classList.add('pulse');
        setTimeout(() => this.cursor.classList.remove('pulse'), 200);
        setTimeout(() => this.beat(), 800 + Math.random() * 400);
    }
}

// === ATMOSPHERIC PARTICLES SYSTEM ===
class RitualParticles {
    constructor(containerId = 'ritual-particles') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.particleCount = window.innerWidth < 768 ? 20 : 40;
        this.init();
    }
    
    init() {
        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.setProperty('--duration', `${6 + Math.random() * 8}s`);
            particle.style.setProperty('--delay', `${Math.random() * 5}s`);
            this.container.appendChild(particle);
        }
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// === AMBIENT SOUND SYSTEM ===
class RitualAmbience {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.nodes = [];
    }
    
    init() {
        if (this.audioContext) return;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    playAmbient() {
        if (!this.audioContext) this.init();
        if (this.isPlaying) return;
        
        // Crear drone ambiente sutil
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(55, this.audioContext.currentTime); // A1
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(82.41, this.audioContext.currentTime); // E2
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 3);
        
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc1.start();
        osc2.start();
        
        this.nodes = [osc1, osc2, gain];
        this.isPlaying = true;
    }
    
    stop() {
        if (!this.isPlaying) return;
        
        this.nodes.forEach(node => {
            if (node.stop) node.stop();
        });
        this.nodes = [];
        this.isPlaying = false;
    }
    
    toggle() {
        this.isPlaying ? this.stop() : this.playAmbient();
        return this.isPlaying;
    }
}

// === GLOBAL INITIALIZERS ===
window.initRitualParticles = function() {
    if (!window.ritualParticles) {
        window.ritualParticles = new RitualParticles();
    }
};

window.initRitualAmbience = function() {
    if (!window.ritualAmbience) {
        window.ritualAmbience = new RitualAmbience();
    }
    return window.ritualAmbience;
};

// Exportar globalmente
window.PigmentTrail = PigmentTrail;
window.DayNightCycle = DayNightCycle;
window.ColorExtractor = ColorExtractor;
window.GlitchText = GlitchText;
window.WebDecay = WebDecay;
window.RitualHandshake = RitualHandshake;
window.HeartbeatCursor = HeartbeatCursor;
window.RitualParticles = RitualParticles;
window.RitualAmbience = RitualAmbience;

