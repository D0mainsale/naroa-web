/**
 * PILOT CURSOR REAL - Sistema con Imagen Real de Bolígrafo PILOT
 * 4 colores: Azul, Verde, Rosa, Negro
 * Cambio automático por sección + selector manual
 */

class PILOTRealCursor {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.maxParticles = 150;
        this.mouse = { x: 0, y: 0 };
        this.prevMouse = { x: 0, y: 0 };
        this.lerp = { x: 0, y: 0 };
        this.lerpFactor = 0.15;
        this.isMoving = false;
        this.isPressed = false;
        
        // Ink blot system
        this.lastBlotTime = 0;
        this.blotInterval = 150; // ms between blots
        this.inkBlotsEnabled = true;
        
        // Cursor images
        this.cursors = {
            blue: { img: null, color: '#0033CC', loaded: false },
            green: { img: null, color: '#228B22', loaded: false },
            pink: { img: null, color: '#FF1493', loaded: false },
            black: { img: null, color: '#1a1a1a', loaded: false }
        };
        
        this.currentColor = 'blue';
        this.cursorSize = 48; // Display size
        this.cursorAngle = -45 * (Math.PI / 180); // 45 degrees for writing angle
        
        // Section → Color mapping
        this.sectionColors = {
            'portfolio': 'blue',
            'process': 'green',
            'bitacora': 'pink',
            'ritual': 'black',
            'about': 'blue',
            'retrato': 'pink',
            'shop': 'green',
            'tienda': 'green',
            'home': 'blue'
        };
        
        this.init();
    }
    
    async init() {
        // Respect reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        
        // Skip on touch devices
        if ('ontouchstart' in window && window.innerWidth < 1024) return;
        
        // Load cursor images
        await this.loadCursorImages();
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'pilot-real-cursor-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 10000;
            will-change: transform;
        `;
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.resize();
        
        // Event listeners
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        document.addEventListener('mouseenter', () => this.isMoving = true);
        document.addEventListener('mouseleave', () => { this.isMoving = false; this.isPressed = false; });
        
        // Section detection
        window.addEventListener('hashchange', () => this.detectSection());
        this.detectSection();
        
        // Create color selector UI
        this.createColorSelector();
        
        // Hide default cursor
        document.body.style.cursor = 'none';
        document.querySelectorAll('a, button, [role="button"]').forEach(el => {
            el.style.cursor = 'none';
        });
        
        // Start animation
        this.animate();
        
        // Add ink blot styles
        this.addInkBlotStyles();
        
        console.log('🖊️ PILOT Real Cursor v4.0 - 4 colores + manchas de tinta');
    }
    
    addInkBlotStyles() {
        const style = document.createElement('style');
        style.id = 'ink-blot-styles';
        style.textContent = `
            @keyframes inkFade {
                0% { 
                    opacity: 0.25; 
                    transform: translate(-50%, -50%) scale(1) rotate(0deg); 
                }
                30% { 
                    opacity: 0.2; 
                    transform: translate(-50%, -50%) scale(1.3) rotate(5deg); 
                }
                100% { 
                    opacity: 0; 
                    transform: translate(-50%, -50%) scale(0.6) rotate(-10deg); 
                }
            }
            
            .ink-blot {
                position: fixed;
                pointer-events: none;
                z-index: 9990;
                border-radius: 50% 40% 60% 45%;
                animation: inkFade 4s ease-out forwards;
                mix-blend-mode: multiply;
            }
            
            @media (prefers-reduced-motion: reduce) {
                .ink-blot {
                    animation: none;
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    createInkBlot(x, y, isClick = false) {
        if (!this.inkBlotsEnabled) return;
        
        const now = Date.now();
        if (!isClick && now - this.lastBlotTime < this.blotInterval) return;
        this.lastBlotTime = now;
        
        const color = this.cursors[this.currentColor].color;
        const baseSize = isClick ? 16 : 8;
        const size = baseSize + Math.random() * (isClick ? 12 : 8);
        
        const blot = document.createElement('div');
        blot.className = 'ink-blot';
        blot.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size * (0.8 + Math.random() * 0.4)}px;
            background: ${color};
            transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
        `;
        
        document.body.appendChild(blot);
        
        // Remove after animation
        setTimeout(() => blot.remove(), 4000);
        
        // On click, create multiple smaller splatters
        if (isClick) {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const splatterX = x + (Math.random() - 0.5) * 30;
                    const splatterY = y + (Math.random() - 0.5) * 30;
                    const splatterSize = 4 + Math.random() * 6;
                    
                    const splatter = document.createElement('div');
                    splatter.className = 'ink-blot';
                    splatter.style.cssText = `
                        left: ${splatterX}px;
                        top: ${splatterY}px;
                        width: ${splatterSize}px;
                        height: ${splatterSize}px;
                        background: ${color};
                        opacity: 0.3;
                    `;
                    document.body.appendChild(splatter);
                    setTimeout(() => splatter.remove(), 4000);
                }, i * 50);
            }
        }
    }
    
    async loadCursorImages() {
        const basePath = '/images/cursors/';
        const files = {
            blue: 'pilot_cursor_blue_1769097890020.png',
            green: 'pilot_cursor_green_1769097909092.png',
            pink: 'pilot_cursor_pink_1769097927805.png',
            black: 'pilot_cursor_black_1769097946670.png'
        };
        
        const loadPromises = Object.entries(files).map(([color, filename]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.cursors[color].img = img;
                    this.cursors[color].loaded = true;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load cursor: ${color}`);
                    resolve();
                };
                img.src = basePath + filename;
            });
        });
        
        await Promise.all(loadPromises);
        console.log('🎨 Cursor images loaded');
    }
    
    createColorSelector() {
        const selector = document.createElement('div');
        selector.className = 'pilot-color-selector';
        selector.innerHTML = `
            <div class="pilot-selector-toggle" title="Cambiar color del boli">🖊️</div>
            <div class="pilot-selector-colors">
                <button class="pilot-color-btn active" data-color="blue" style="background: #0033CC" title="Azul"></button>
                <button class="pilot-color-btn" data-color="green" style="background: #228B22" title="Verde"></button>
                <button class="pilot-color-btn" data-color="pink" style="background: #FF1493" title="Rosa"></button>
                <button class="pilot-color-btn" data-color="black" style="background: #1a1a1a" title="Negro"></button>
            </div>
        `;
        document.body.appendChild(selector);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .pilot-color-selector {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 10001;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;
            }
            
            .pilot-selector-toggle {
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(12px);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                transition: all 0.3s ease;
                border: 2px solid rgba(0,0,0,0.1);
            }
            
            .pilot-selector-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
            }
            
            .pilot-selector-colors {
                display: flex;
                gap: 8px;
                padding: 12px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(12px);
                border-radius: 30px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                opacity: 0;
                transform: translateY(10px) scale(0.9);
                pointer-events: none;
                transition: all 0.3s ease;
            }
            
            .pilot-color-selector.open .pilot-selector-colors {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: auto;
            }
            
            .pilot-color-btn {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }
            
            .pilot-color-btn:hover {
                transform: scale(1.15);
            }
            
            .pilot-color-btn.active {
                border-color: #333;
                transform: scale(1.2);
            }
            
            @media (max-width: 768px) {
                .pilot-color-selector {
                    bottom: 16px;
                    right: 16px;
                }
                .pilot-selector-toggle {
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Toggle selector
        selector.querySelector('.pilot-selector-toggle').addEventListener('click', () => {
            selector.classList.toggle('open');
        });
        
        // Color buttons
        selector.querySelectorAll('.pilot-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setColor(btn.dataset.color);
                selector.querySelectorAll('.pilot-color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selector.classList.remove('open');
            });
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!selector.contains(e.target)) {
                selector.classList.remove('open');
            }
        });
    }
    
    setColor(color) {
        if (this.cursors[color]) {
            this.currentColor = color;
            console.log(`🖊️ Cursor color: ${color}`);
        }
    }
    
    detectSection() {
        const hash = window.location.hash.toLowerCase();
        
        for (const [section, color] of Object.entries(this.sectionColors)) {
            if (hash.includes(section)) {
                this.setColor(color);
                this.updateSelectorUI(color);
                return;
            }
        }
        
        // Default to blue
        this.setColor('blue');
        this.updateSelectorUI('blue');
    }
    
    updateSelectorUI(color) {
        document.querySelectorAll('.pilot-color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color === color);
        });
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
        this.prevMouse.x = this.mouse.x;
        this.prevMouse.y = this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.isMoving = true;
        
        // Interpolation for smooth trail
        const distance = Math.hypot(this.mouse.x - this.prevMouse.x, this.mouse.y - this.prevMouse.y);
        const steps = Math.min(Math.floor(distance / 4), 8);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / (steps || 1);
            const x = this.prevMouse.x + (this.mouse.x - this.prevMouse.x) * t;
            const y = this.prevMouse.y + (this.mouse.y - this.prevMouse.y) * t;
            this.addParticle(x, y);
        }
        
        // Create ink blot occasionally
        if (Math.random() < 0.15) {
            this.createInkBlot(this.mouse.x, this.mouse.y, false);
        }
    }
    
    onMouseDown() {
        this.isPressed = true;
        this.createInkSplash(this.mouse.x, this.mouse.y);
        this.createInkBlot(this.mouse.x, this.mouse.y, true); // Big ink blot on click
    }
    
    onMouseUp() {
        this.isPressed = false;
    }
    
    createInkSplash(x, y) {
        const splashCount = 20;
        const color = this.cursors[this.currentColor].color;
        
        for (let i = 0; i < splashCount; i++) {
            const angle = (Math.PI * 2 / splashCount) * i + (Math.random() - 0.5) * 0.5;
            const velocity = Math.random() * 5 + 2;
            
            this.particles.push({
                x, y,
                size: Math.random() * 3 + 1,
                color,
                alpha: 0.8,
                life: 1.0,
                decay: Math.random() * 0.025 + 0.015,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                gravity: 0.2,
                isSplash: true
            });
        }
    }
    
    addParticle(x, y) {
        const color = this.cursors[this.currentColor].color;
        const spread = this.isPressed ? 4 : 1.5;
        
        this.particles.push({
            x: x + (Math.random() - 0.5) * spread,
            y: y + (Math.random() - 0.5) * spread,
            size: (Math.random() * 1.5 + 1) * (this.isPressed ? 2 : 1),
            color,
            alpha: this.isPressed ? 1 : 0.85,
            life: 1.0,
            decay: Math.random() * 0.008 + 0.005,
            vx: 0,
            vy: 0,
            gravity: 0,
            isSplash: false
        });
        
        while (this.particles.length > this.maxParticles) {
            this.particles.shift();
        }
    }
    
    animate() {
        // Clear canvas completely (transparent background)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Smooth follow
        this.lerp.x += (this.mouse.x - this.lerp.x) * this.lerpFactor;
        this.lerp.y += (this.mouse.y - this.lerp.y) * this.lerpFactor;
        
        // Draw particles (ink trail)
        this.particles = this.particles.filter(p => {
            p.life -= p.decay;
            p.x += p.vx;
            p.y += p.vy;
            
            if (p.isSplash) {
                p.vy += p.gravity;
                p.vx *= 0.97;
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
        
        // Draw PILOT pen image
        const cursor = this.cursors[this.currentColor];
        if (cursor.loaded && cursor.img) {
            this.ctx.globalAlpha = 1.0;
            
            const x = this.lerp.x;
            const y = this.lerp.y;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(this.cursorAngle);
            
            // Draw pen image centered on tip
            const size = this.cursorSize;
            this.ctx.drawImage(
                cursor.img,
                -size * 0.15,  // Offset to position tip at cursor point
                -size * 0.85,
                size,
                size
            );
            
            this.ctx.restore();
        } else {
            // Fallback: draw simple pen tip
            this.ctx.globalAlpha = 1.0;
            const color = this.cursors[this.currentColor].color;
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(this.lerp.x, this.lerp.y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // White highlight
            this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
            this.ctx.beginPath();
            this.ctx.arc(this.lerp.x - 1, this.lerp.y - 1, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// Cleanup old cursor and initialize new one
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Remove old cursor if present
        const oldCanvas = document.getElementById('pilot-cursor-canvas');
        if (oldCanvas) oldCanvas.remove();
        
        window.pilotRealCursor = new PILOTRealCursor();
    });
} else {
    const oldCanvas = document.getElementById('pilot-cursor-canvas');
    if (oldCanvas) oldCanvas.remove();
    
    window.pilotRealCursor = new PILOTRealCursor();
}
