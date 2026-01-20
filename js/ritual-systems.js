// === SISTEMAS RITUALES SIMPLIFICADOS ===
// (Mantiene los efectos esenciales, elimina el BoardGame)

// === CURSOR ESTELA DE PIGMENTO ===
class PigmentTrail {
    constructor() {
        this.particles = [];
        this.currentColor = '#d03030';
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'pigment-canvas';
        Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: '9998'
        });
        document.body.appendChild(this.canvas);
        
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

// Exportar globalmente
window.PigmentTrail = PigmentTrail;
window.DayNightCycle = DayNightCycle;
window.ColorExtractor = ColorExtractor;
