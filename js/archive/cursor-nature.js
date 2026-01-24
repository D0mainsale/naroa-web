/**
 * PILOT CURSOR PREMIUM - Sistema de Bolígrafo PILOT v2.0
 * +150 partículas, ink splash, context-aware halo
 * Nature Distilled × Award-Winning Interactions
 */

class PILOTCursor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.maxParticles = 200;
        this.mouse = { x: 0, y: 0 };
        this.prevMouse = { x: 0, y: 0 };
        this.lerp = { x: 0, y: 0 };
        this.lerpFactor = 0.18;
        this.isMoving = false;
        this.isPressed = false;
        this.lastMoveTime = 0;
        this.moveThrottle = 8; // ~120fps throttle
        
        // PILOT Pen - Azul intenso clásico
        this.penColor = '#0033CC';
        this.baseSize = 2;
        this.pressureMultiplier = 1;
        
        // Context-aware halo
        this.haloColor = 'rgba(0, 51, 204, 0.15)';
        this.haloRadius = 0;
        this.targetHaloRadius = 0;
        this.currentContext = null;
        
        // Context rules (port from ultra-premium)
        this.contextRules = [
            { selector: '.portfolio-image, .galeria-item img, [data-lightbox], .card-image', halo: 'rgba(212, 175, 55, 0.25)', radius: 50, name: 'image' },
            { selector: '[data-artwork-title], .obra-titulo, [data-art], .art-card', halo: 'rgba(184, 111, 80, 0.25)', radius: 45, name: 'artwork' },
            { selector: 'a, button, [role="button"]', halo: 'rgba(0, 100, 255, 0.2)', radius: 35, name: 'interactive' },
            { selector: 'p, article, .bitacora-content', halo: 'rgba(100, 100, 100, 0.1)', radius: 25, name: 'text' }
        ];
        
        this.init();
    }
    
    init() {
        // Respect reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        // Skip on touch devices
        if ('ontouchstart' in window && window.innerWidth < 1024) {
            return;
        }
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'pilot-cursor-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
            will-change: transform;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resize();
        
        // Event listeners
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseenter', () => this.isMoving = true);
        document.addEventListener('mouseleave', () => { this.isMoving = false; this.isPressed = false; });
        
        // Click events for ink splash
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        
        // Context detection
        document.addEventListener('mouseover', (e) => this.updateContext(e));
        
        // Hide default cursor
        document.body.style.cursor = 'none';
        
        // Disable PremiumCursor if exists
        if (window.premiumCursor) {
            window.premiumCursor.hide?.();
        }
        
        // Start animation loop
        this.animate();
        
        console.log('🖊️ PILOT Cursor Premium v2.0 activated');
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }
    
    onMouseMove(e) {
        const now = performance.now();
        if (now - this.lastMoveTime < this.moveThrottle) return;
        this.lastMoveTime = now;
        
        this.prevMouse.x = this.mouse.x;
        this.prevMouse.y = this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.isMoving = true;
        
        // Catmull-Rom interpolation for fast movements
        const distance = Math.hypot(this.mouse.x - this.prevMouse.x, this.mouse.y - this.prevMouse.y);
        const steps = Math.min(Math.floor(distance / 3), 10);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / (steps || 1);
            const x = this.prevMouse.x + (this.mouse.x - this.prevMouse.x) * t;
            const y = this.prevMouse.y + (this.mouse.y - this.prevMouse.y) * t;
            this.addParticle(x, y);
        }
    }
    
    onMouseDown(e) {
        this.isPressed = true;
        this.pressureMultiplier = 2.5;
        
        // Ink splash effect
        this.createInkSplash(e.clientX, e.clientY);
    }
    
    onMouseUp() {
        this.isPressed = false;
        this.pressureMultiplier = 1;
    }
    
    createInkSplash(x, y) {
        const splashCount = 25;
        
        for (let i = 0; i < splashCount; i++) {
            const angle = (Math.PI * 2 / splashCount) * i + (Math.random() - 0.5) * 0.5;
            const velocity = Math.random() * 4 + 2;
            const size = Math.random() * 3 + 1;
            
            this.particles.push({
                x,
                y,
                size,
                color: this.penColor,
                alpha: 0.9,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.015,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                gravity: 0.15,
                isSplash: true
            });
        }
    }
    
    updateContext(e) {
        let matched = null;
        
        for (const rule of this.contextRules) {
            if (e.target.closest(rule.selector)) {
                matched = rule;
                break;
            }
        }
        
        if (matched) {
            this.haloColor = matched.halo;
            this.targetHaloRadius = matched.radius;
            this.currentContext = matched.name;
        } else {
            this.haloColor = 'rgba(0, 51, 204, 0.08)';
            this.targetHaloRadius = 0;
            this.currentContext = null;
        }
    }
    
    addParticle(x, y) {
        const spread = this.isPressed ? 3 : 1.2;
        const px = x + (Math.random() - 0.5) * spread;
        const py = y + (Math.random() - 0.5) * spread;
        
        this.particles.push({
            x: px,
            y: py,
            size: (Math.random() * 1.2 + 0.8) * this.pressureMultiplier,
            color: this.penColor,
            alpha: this.isPressed ? 1.0 : (Math.random() * 0.15 + 0.85),
            life: 1.0,
            decay: Math.random() * 0.006 + 0.004,
            vx: 0,
            vy: 0,
            gravity: 0,
            isSplash: false
        });
        
        // Limit particles
        while (this.particles.length > this.maxParticles) {
            this.particles.shift();
        }
    }
    
    animate() {
        // Clear with subtle fade (ink persistence effect)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // LERP smooth follow
        this.lerp.x += (this.mouse.x - this.lerp.x) * this.lerpFactor;
        this.lerp.y += (this.mouse.y - this.lerp.y) * this.lerpFactor;
        
        // Animate halo radius
        this.haloRadius += (this.targetHaloRadius - this.haloRadius) * 0.12;
        
        // Draw context-aware halo
        if (this.haloRadius > 1) {
            const gradient = this.ctx.createRadialGradient(
                this.lerp.x, this.lerp.y, 0,
                this.lerp.x, this.lerp.y, this.haloRadius
            );
            gradient.addColorStop(0, this.haloColor);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(this.lerp.x, this.lerp.y, this.haloRadius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Update and render particles
        this.particles = this.particles.filter(p => {
            p.life -= p.decay;
            p.x += p.vx;
            p.y += p.vy;
            
            // Apply gravity for splash particles
            if (p.isSplash) {
                p.vy += p.gravity;
                p.vx *= 0.98; // Friction
            }
            
            if (p.life > 0) {
                this.ctx.globalAlpha = p.alpha * p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                this.ctx.fill();
                return true;
            }
            return false;
        });
        
        // Draw PILOT pen tip - REALISTIC STYLE
        this.ctx.globalAlpha = 1.0;
        
        const x = this.lerp.x;
        const y = this.lerp.y;
        
        // === PILOT PEN CASING (translucent blue) ===
        const casingGradient = this.ctx.createRadialGradient(x, y, 0, x, y, 12);
        casingGradient.addColorStop(0, 'rgba(65, 105, 225, 0.0)');
        casingGradient.addColorStop(0.3, 'rgba(65, 105, 225, 0.15)');
        casingGradient.addColorStop(0.7, 'rgba(30, 60, 180, 0.25)');
        casingGradient.addColorStop(1, 'rgba(20, 40, 140, 0.1)');
        
        this.ctx.fillStyle = casingGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // === METALLIC COLLAR (the silver ring) ===
        if (!this.isPressed) {
            const collarGradient = this.ctx.createRadialGradient(x, y, 4, x, y, 6);
            collarGradient.addColorStop(0, 'rgba(160, 160, 170, 0.6)');
            collarGradient.addColorStop(0.5, 'rgba(200, 200, 210, 0.8)');
            collarGradient.addColorStop(1, 'rgba(100, 100, 110, 0.4)');
            
            this.ctx.strokeStyle = collarGradient;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // === BALL POINT (metallic silver with shine) ===
        const ballGradient = this.ctx.createRadialGradient(x - 0.5, y - 0.5, 0, x, y, this.isPressed ? 4 : 3);
        ballGradient.addColorStop(0, '#E8E8EC');
        ballGradient.addColorStop(0.3, '#C0C0C8');
        ballGradient.addColorStop(0.7, '#808088');
        ballGradient.addColorStop(1, '#505058');
        
        this.ctx.fillStyle = ballGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.isPressed ? 4 : 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball highlight (specular)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.beginPath();
        this.ctx.arc(x - 1, y - 1, 1.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // === INK RING (blue ink around ball when pressed) ===
        if (this.isPressed) {
            this.ctx.strokeStyle = this.penColor;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = 0.6;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1.0;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pilotCursor = new PILOTCursor();
    });
} else {
    window.pilotCursor = new PILOTCursor();
}
