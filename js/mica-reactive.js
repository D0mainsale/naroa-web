/**
 * ════════════════════════════════════════════════════════════════════════
 * EFECTO MICA REACTIVO (2026)
 * "La materia responde a la presencia."
 * 
 * Simula una capa de mica/mineral sobre la web que reacciona a la luz (cursor).
 * Utiliza Canvas para performance óptima en lugar de miles de elementos DOM.
 * ════════════════════════════════════════════════════════════════════════
 */

class MicaReactiveEffect {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = window.devicePixelRatio || 1;
        
        this.cursor = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
        this.isDark = false; // Sync with Modo Dual
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.bindEvents();
        this.loop();
        
        // Detectar modo inicial
        if (document.body.getAttribute('data-modo') === 'tiniebla') {
            this.isDark = true;
        }
        
        // Observer para cambios de modo
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-modo') {
                    this.isDark = document.body.getAttribute('data-modo') === 'tiniebla';
                }
            });
        });
        observer.observe(document.body, { attributes: true });
        
        console.log('✨ Efecto Mica Reactivo: Inicializado');
    }

    setupCanvas() {
        this.canvas.id = 'mica-overlay';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998; /* Justo debajo del cursor custom si lo hay */
            mix-blend-mode: overlay; /* Clave para el efecto material */
            opacity: 0.4;
        `;
        document.body.appendChild(this.canvas);
        this.resize();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
    }

    bindEvents() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.cursor.targetX = e.clientX;
            this.cursor.targetY = e.clientY;
        });
    }

    loop() {
        // Suavizado del movimiento (Lerp)
        this.cursor.x += (this.cursor.targetX - this.cursor.x) * 0.1;
        this.cursor.y += (this.cursor.targetY - this.cursor.y) * 0.1;
        
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (this.cursor.x === -1000) return; // No dibujar si no hay interacción
        
        // Configuración según modo
        // Luz: Mica perlada (blanco/plata)
        // Tiniebla: Grafito iridiscente (oscuro con toques de color)
        const gradientRadius = this.isDark ? 300 : 200;
        
        const gradient = this.ctx.createRadialGradient(
            this.cursor.x, this.cursor.y, 0,
            this.cursor.x, this.cursor.y, gradientRadius
        );
        
        if (this.isDark) {
            // Grafito: Brillo sutil en la oscuridad
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
            gradient.addColorStop(0.5, 'rgba(100, 100, 120, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            // Mica: Brillo perlado en la luz
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(0.4, 'rgba(200, 200, 220, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Ruido mineral (opcional, para textura táctil)
        // Dibujamos ruido estático muy sutil solo sobre el área activa para optimizar
        // Simulando destellos de mica
        this.drawSparkles();
    }
    
    drawSparkles() {
        // Pequeños destellos aleatorios cerca del cursor
        const count = this.isDark ? 3 : 5;
        this.ctx.fillStyle = this.isDark ? 'rgba(200, 230, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)';
        
        for(let i=0; i<count; i++) {
            if (Math.random() > 0.8) { // Parpadeo
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * 100;
                const x = this.cursor.x + Math.cos(angle) * dist;
                const y = this.cursor.y + Math.sin(angle) * dist;
                const size = Math.random() * 2;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
}

// Auto-inicializar si no se llama manualmente
// window.micaEffect = new MicaReactiveEffect();
