/**
 * ULTRA DISRUPTIVE CURSOR — Experiencia Visual Revolucionaria
 * Inspirado en AWWWARDS ganadores 2026: MYRIAD, CAPPEN, UNESCO Museum
 * 
 * Features Disruptivos:
 * 🌊 Fluid Simulation — Cursor fluido tipo tinta
 * 🧲 Magnetic Pull — Botones que atraen magnéticamente
 * ✨ Particle Field — Campo de partículas orbitantes
 * 🎨 Ink Morphing — Manchas de tinta que evolucionan
 * 🔮 Holographic Trail — Estela holográfica RGB
 * 💫 Echo Rings — Anillos de eco expansivos
 * 
 * v4.0.0 - 2026-01-24 — Visual Disruption Edition
 */

class UltraDisruptiveCursor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        
        // Mouse state
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.targetMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.velocity = { x: 0, y: 0 };
        this.isMoving = false;
        this.isPressed = false;
        
        // Particle systems
        this.particles = [];
        this.orbitParticles = [];
        this.echoRings = [];
        this.inkBlobs = [];
        this.maxParticles = 300;
        
        // Magnetic elements
        this.magneticElements = [];
        this.magnetStrength = 0.35;
        this.magnetRadius = 150;
        
        // Visual settings
        this.primaryColor = { h: 220, s: 100, l: 50 }; // PILOT Blue
        this.secondaryColor = { h: 270, s: 80, l: 60 }; // Purple accent
        this.hueShift = 0;
        
        // Fluid simulation 
        this.fluidPoints = [];
        this.fluidTension = 0.03;
        this.fluidFriction = 0.94;
        
        // Context awareness
        this.currentContext = 'default';
        this.contextColors = {
            'default': { h: 220, s: 100, l: 50 },
            'artwork': { h: 35, s: 90, l: 50 },
            'interactive': { h: 170, s: 80, l: 45 },
            'text': { h: 0, s: 0, l: 50 }
        };
        
        // Performance
        this.lastFrame = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        this.init();
    }
    
    init() {
        // Respect reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            console.log('⚠️ Reduced motion — cursor effects disabled');
            return;
        }
        
        // Skip on mobile
        if ('ontouchstart' in window && window.innerWidth < 1024) {
            return;
        }
        
        // Create WebGL canvas (fallback to 2D)
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'ultra-cursor-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 99999;
            mix-blend-mode: normal;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resize();
        
        // Initialize fluid points
        this.initFluid();
        
        // Initialize orbit particles
        this.initOrbitParticles();
        
        // Find magnetic elements
        this.findMagneticElements();
        
        // Events
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        document.addEventListener('mouseover', (e) => this.updateContext(e));
        
        // Re-find magnetic elements on route change
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.findMagneticElements(), 500);
        });
        
        // Hide default cursor
        document.body.style.cursor = 'none';
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after { cursor: none !important; }
            a, button, [role="button"], input, select, textarea { cursor: none !important; }
        `;
        document.head.appendChild(style);
        
        // Disable old cursors
        if (window.pilotCursor) {
            window.pilotCursor.canvas?.remove();
        }
        if (window.premiumCursor) {
            window.premiumCursor.hide?.();
        }
        
        this.animate();
        console.log('🔮 Ultra Disruptive Cursor v4.0 activated');
    }
    
    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }
    
    initFluid() {
        // Create fluid blob points
        const numPoints = 8;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            this.fluidPoints.push({
                angle,
                baseRadius: 20,
                radius: 20,
                velocity: 0,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    initOrbitParticles() {
        // Create orbiting particles
        for (let i = 0; i < 12; i++) {
            this.orbitParticles.push({
                angle: (i / 12) * Math.PI * 2,
                radius: 30 + Math.random() * 20,
                speed: 0.02 + Math.random() * 0.03,
                size: 2 + Math.random() * 3,
                hueOffset: Math.random() * 60 - 30,
                opacity: 0.6 + Math.random() * 0.4
            });
        }
    }
    
    findMagneticElements() {
        this.magneticElements = [];
        const selectors = 'a, button, [role="button"], .magnetic, [data-magnetic]';
        document.querySelectorAll(selectors).forEach(el => {
            if (!el.dataset.magneticProcessed) {
                el.dataset.magneticProcessed = 'true';
                el.style.transition = 'transform 0.15s ease-out';
            }
            this.magneticElements.push(el);
        });
    }
    
    onMouseMove(e) {
        this.targetMouse.x = e.clientX;
        this.targetMouse.y = e.clientY;
        this.isMoving = true;
        
        // Add trail particles
        const speed = Math.hypot(
            this.targetMouse.x - this.mouse.x,
            this.targetMouse.y - this.mouse.y
        );
        
        if (speed > 2) {
            this.addTrailParticle(e.clientX, e.clientY, speed);
        }
        
        // Update magnetic elements
        this.updateMagneticElements(e.clientX, e.clientY);
    }
    
    onMouseDown(e) {
        this.isPressed = true;
        
        // Create ink splash
        this.createInkBlob(e.clientX, e.clientY);
        
        // Create echo rings
        this.createEchoRing(e.clientX, e.clientY);
        
        // Particle burst
        for (let i = 0; i < 30; i++) {
            this.addBurstParticle(e.clientX, e.clientY);
        }
    }
    
    onMouseUp() {
        this.isPressed = false;
    }
    
    updateContext(e) {
        const target = e.target;
        
        if (target.closest('.portfolio-image, .galeria-item, [data-artwork], .art-card, img')) {
            this.currentContext = 'artwork';
        } else if (target.closest('a, button, [role="button"], input, select')) {
            this.currentContext = 'interactive';
        } else if (target.closest('p, article, .content, .bitacora')) {
            this.currentContext = 'text';
        } else {
            this.currentContext = 'default';
        }
        
        this.primaryColor = { ...this.contextColors[this.currentContext] };
    }
    
    updateMagneticElements(mouseX, mouseY) {
        this.magneticElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const distX = mouseX - centerX;
            const distY = mouseY - centerY;
            const distance = Math.hypot(distX, distY);
            
            if (distance < this.magnetRadius) {
                const strength = (1 - distance / this.magnetRadius) * this.magnetStrength;
                const pullX = distX * strength * 0.4;
                const pullY = distY * strength * 0.4;
                el.style.transform = `translate(${pullX}px, ${pullY}px) scale(${1 + strength * 0.1})`;
            } else {
                el.style.transform = '';
            }
        });
    }
    
    addTrailParticle(x, y, speed) {
        const color = { ...this.primaryColor };
        color.h += Math.random() * 30 - 15;
        
        this.particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.min(speed * 0.15, 6) + Math.random() * 2,
            color,
            alpha: 0.8,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.02,
            type: 'trail'
        });
        
        // Limit particles
        while (this.particles.length > this.maxParticles) {
            this.particles.shift();
        }
    }
    
    addBurstParticle(x, y) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        const color = { ...this.primaryColor };
        color.h += Math.random() * 60 - 30;
        
        this.particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 4,
            color,
            alpha: 1.0,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.03,
            gravity: 0.15,
            type: 'burst'
        });
    }
    
    createInkBlob(x, y) {
        const numPoints = 6 + Math.floor(Math.random() * 4);
        const points = [];
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            points.push({
                angle,
                radius: 20 + Math.random() * 30,
                targetRadius: 80 + Math.random() * 40,
                velocity: 0
            });
        }
        
        this.inkBlobs.push({
            x,
            y,
            points,
            life: 1.0,
            decay: 0.015,
            color: { ...this.primaryColor }
        });
    }
    
    createEchoRing(x, y) {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.echoRings.push({
                    x,
                    y,
                    radius: 10,
                    targetRadius: 100 + i * 40,
                    alpha: 0.6 - i * 0.15,
                    lineWidth: 3 - i * 0.5,
                    color: { ...this.primaryColor },
                    hueOffset: i * 20
                });
            }, i * 80);
        }
    }
    
    animate(timestamp = 0) {
        // Frame rate control
        const elapsed = timestamp - this.lastFrame;
        if (elapsed < this.frameInterval) {
            requestAnimationFrame((t) => this.animate(t));
            return;
        }
        this.lastFrame = timestamp;
        
        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Smooth mouse follow
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.15;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.15;
        
        // Hue shift animation
        this.hueShift = (this.hueShift + 0.3) % 360;
        
        // Render all effects
        this.renderEchoRings();
        this.renderInkBlobs();
        this.renderParticles();
        this.renderFluidCursor();
        this.renderOrbitParticles();
        this.renderCoreGlow();
        
        requestAnimationFrame((t) => this.animate(t));
    }
    
    renderEchoRings() {
        this.echoRings = this.echoRings.filter(ring => {
            ring.radius += (ring.targetRadius - ring.radius) * 0.08;
            ring.alpha *= 0.96;
            
            if (ring.alpha < 0.01) return false;
            
            const hue = (ring.color.h + ring.hueOffset + this.hueShift) % 360;
            this.ctx.strokeStyle = `hsla(${hue}, ${ring.color.s}%, ${ring.color.l}%, ${ring.alpha})`;
            this.ctx.lineWidth = ring.lineWidth;
            this.ctx.beginPath();
            this.ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            return true;
        });
    }
    
    renderInkBlobs() {
        this.inkBlobs = this.inkBlobs.filter(blob => {
            blob.life -= blob.decay;
            if (blob.life <= 0) return false;
            
            // Animate points
            blob.points.forEach(p => {
                p.radius += (p.targetRadius - p.radius) * 0.05;
                p.targetRadius *= 0.99;
            });
            
            // Draw blob
            this.ctx.save();
            this.ctx.translate(blob.x, blob.y);
            
            const hue = (blob.color.h + this.hueShift * 0.5) % 360;
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
            gradient.addColorStop(0, `hsla(${hue}, ${blob.color.s}%, ${blob.color.l}%, ${blob.life * 0.6})`);
            gradient.addColorStop(0.5, `hsla(${hue + 30}, ${blob.color.s}%, ${blob.color.l - 10}%, ${blob.life * 0.3})`);
            gradient.addColorStop(1, `hsla(${hue}, ${blob.color.s}%, ${blob.color.l}%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            
            // Smooth blob shape
            for (let i = 0; i <= blob.points.length; i++) {
                const p = blob.points[i % blob.points.length];
                const x = Math.cos(p.angle) * p.radius;
                const y = Math.sin(p.angle) * p.radius;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    const prev = blob.points[(i - 1) % blob.points.length];
                    const cpX = Math.cos((prev.angle + p.angle) / 2) * ((prev.radius + p.radius) / 2);
                    const cpY = Math.sin((prev.angle + p.angle) / 2) * ((prev.radius + p.radius) / 2);
                    this.ctx.quadraticCurveTo(cpX, cpY, x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
            
            return true;
        });
    }
    
    renderParticles() {
        this.particles = this.particles.filter(p => {
            p.life -= p.decay;
            if (p.life <= 0) return false;
            
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            
            if (p.gravity) {
                p.vy += p.gravity;
            }
            
            const hue = (p.color.h + this.hueShift * 0.3) % 360;
            const alpha = p.alpha * p.life;
            
            // Glow effect
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            gradient.addColorStop(0, `hsla(${hue}, ${p.color.s}%, ${p.color.l + 20}%, ${alpha})`);
            gradient.addColorStop(0.5, `hsla(${hue}, ${p.color.s}%, ${p.color.l}%, ${alpha * 0.5})`);
            gradient.addColorStop(1, `hsla(${hue}, ${p.color.s}%, ${p.color.l}%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Core
            this.ctx.fillStyle = `hsla(${hue}, ${p.color.s}%, ${p.color.l + 30}%, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            return true;
        });
    }
    
    renderFluidCursor() {
        const { x, y } = this.mouse;
        
        // Update fluid points
        this.fluidPoints.forEach((p, i) => {
            const target = this.isPressed ? 35 : 20;
            const wave = Math.sin(Date.now() * 0.003 + p.phase) * 5;
            p.velocity += (target + wave - p.radius) * this.fluidTension;
            p.velocity *= this.fluidFriction;
            p.radius += p.velocity;
        });
        
        // Draw fluid blob
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Outer glow
        const hue = (this.primaryColor.h + this.hueShift * 0.2) % 360;
        const outerGlow = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
        outerGlow.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.3)`);
        outerGlow.addColorStop(0.5, `hsla(${hue + 30}, 80%, 50%, 0.1)`);
        outerGlow.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        
        this.ctx.fillStyle = outerGlow;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 60, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fluid shape
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 35);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.9)`);
        gradient.addColorStop(0.4, `hsla(${hue}, 100%, 60%, 0.7)`);
        gradient.addColorStop(0.8, `hsla(${hue + 20}, 90%, 50%, 0.4)`);
        gradient.addColorStop(1, `hsla(${hue + 40}, 80%, 40%, 0)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        
        for (let i = 0; i <= this.fluidPoints.length; i++) {
            const p = this.fluidPoints[i % this.fluidPoints.length];
            const px = Math.cos(p.angle) * p.radius;
            const py = Math.sin(p.angle) * p.radius;
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                const prev = this.fluidPoints[(i - 1) % this.fluidPoints.length];
                const cpAngle = (prev.angle + p.angle) / 2;
                const cpRadius = (prev.radius + p.radius) / 2;
                const cpX = Math.cos(cpAngle) * cpRadius;
                const cpY = Math.sin(cpAngle) * cpRadius;
                this.ctx.quadraticCurveTo(cpX, cpY, px, py);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    renderOrbitParticles() {
        const { x, y } = this.mouse;
        
        this.orbitParticles.forEach(p => {
            p.angle += p.speed;
            
            const orbitX = x + Math.cos(p.angle) * p.radius;
            const orbitY = y + Math.sin(p.angle) * p.radius;
            
            const hue = (this.primaryColor.h + p.hueOffset + this.hueShift) % 360;
            
            // Glow
            const gradient = this.ctx.createRadialGradient(orbitX, orbitY, 0, orbitX, orbitY, p.size * 3);
            gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${p.opacity})`);
            gradient.addColorStop(0.5, `hsla(${hue}, 100%, 60%, ${p.opacity * 0.3})`);
            gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(orbitX, orbitY, p.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Core
            this.ctx.fillStyle = `hsla(${hue}, 100%, 90%, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(orbitX, orbitY, p.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    renderCoreGlow() {
        const { x, y } = this.mouse;
        const hue = (this.primaryColor.h + this.hueShift * 0.1) % 360;
        
        // Center bright core
        const coreGradient = this.ctx.createRadialGradient(x, y, 0, x, y, 8);
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.3, `hsla(${hue}, 100%, 90%, 1)`);
        coreGradient.addColorStop(0.7, `hsla(${hue}, 100%, 70%, 0.8)`);
        coreGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.isPressed ? 10 : 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // White hot center
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.isPressed ? 4 : 2.5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Public API
    setColor(h, s, l) {
        this.primaryColor = { h, s, l };
    }
    
    destroy() {
        this.canvas?.remove();
        document.body.style.cursor = '';
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ultraCursor = new UltraDisruptiveCursor();
    });
} else {
    window.ultraCursor = new UltraDisruptiveCursor();
}
