/**
 * PAINT CURSOR — Pincel que Pinta
 * El cursor deja trazos artísticos que se desvanecen
 * v1.0.0 - 2026-01-24
 */

class PaintCursor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.trails = [];
        this.isActive = true;
        this.lastPos = { x: 0, y: 0 };
        this.hue = 0;
        this.brushSize = 3;
        this.fadeSpeed = 0.015;
        
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
        this.createCanvas();
        this.bindEvents();
        this.animate();
        
        console.log('🖌️ Paint Cursor initialized');
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'paint-cursor-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 99990;
            opacity: 0.7;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', () => this.brushSize = 6);
        document.addEventListener('mouseup', () => this.brushSize = 3);
        
        // Toggle with 'P' key
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP' && !e.ctrlKey && !e.metaKey) {
                this.toggle();
            }
        });
    }
    
    onMouseMove(e) {
        if (!this.isActive) return;
        
        const x = e.clientX;
        const y = e.clientY;
        
        // Only add trail if moved enough
        const dx = x - this.lastPos.x;
        const dy = y - this.lastPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 2) {
            this.addTrail(x, y, distance);
            this.lastPos = { x, y };
        }
    }
    
    addTrail(x, y, velocity) {
        // Colores de Naroa: tonos terrosos y dorados
        const colors = [
            'hsl(35, 60%, 50%)',   // Ocre
            'hsl(25, 70%, 40%)',   // Siena
            'hsl(45, 80%, 60%)',   // Dorado
            'hsl(15, 50%, 35%)',   // Marrón
            'hsl(200, 30%, 60%)',  // Gris azulado (mica)
        ];
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Vary brush size based on velocity
        const size = this.brushSize + Math.min(velocity * 0.1, 5);
        
        this.trails.push({
            x,
            y,
            size,
            color,
            alpha: 0.6,
            rotation: Math.random() * Math.PI * 2,
        });
        
        // Limit trail length
        if (this.trails.length > 200) {
            this.trails.shift();
        }
    }
    
    animate() {
        if (!this.isActive) {
            requestAnimationFrame(() => this.animate());
            return;
        }
        
        // Clear with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw trails
        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            
            this.ctx.save();
            this.ctx.translate(trail.x, trail.y);
            this.ctx.rotate(trail.rotation);
            
            // Brush stroke shape
            this.ctx.beginPath();
            this.ctx.globalAlpha = trail.alpha;
            this.ctx.fillStyle = trail.color;
            
            // Irregular brush shape
            this.ctx.ellipse(0, 0, trail.size, trail.size * 0.4, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add texture dots
            if (Math.random() > 0.7) {
                this.ctx.beginPath();
                this.ctx.arc(
                    (Math.random() - 0.5) * trail.size * 2,
                    (Math.random() - 0.5) * trail.size,
                    trail.size * 0.2,
                    0, Math.PI * 2
                );
                this.ctx.fill();
            }
            
            this.ctx.restore();
            
            // Fade out
            trail.alpha -= this.fadeSpeed;
            
            // Remove if invisible
            if (trail.alpha <= 0) {
                this.trails.splice(i, 1);
            }
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    toggle() {
        this.isActive = !this.isActive;
        this.canvas.style.opacity = this.isActive ? '0.7' : '0';
        
        this.showToast(this.isActive ? '🖌️ Pincel activado' : '🖌️ Pincel desactivado');
    }
    
    showToast(message) {
        let toast = document.querySelector('.paint-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'paint-toast';
            toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: rgba(26, 26, 26, 0.9);
                color: #f4f3f0;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                font-size: 0.9rem;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
                z-index: 100000;
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 2000);
    }
    
    // Public: clear all trails
    clear() {
        this.trails = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Public: set brush color
    setColor(hue) {
        this.hue = hue;
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.paintCursor = new PaintCursor();
    });
} else {
    window.paintCursor = new PaintCursor();
}
