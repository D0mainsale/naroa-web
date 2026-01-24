/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * IMMERSIVE EXPERIENCE MODULE - Naroa Gutiérrez Gil
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Combina tres experiencias sensoriales:
 * 1. 🌟 Partículas de Mica - Brillos dorados/plateados flotando
 * 2. 🖋️ Manchas de Tinta - El cursor deja rastros artísticos
 * 3. 🎵 Audio Ambiente - Sonidos de estudio (grafito, pincel, agua)
 * 
 * Inspirado en: Bruno Simon, Naked City Films, IRONHILL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MICA PARTICLES - Brillos flotantes estilo polvo mágico
// ═══════════════════════════════════════════════════════════════════════════════

class MicaParticles {
    constructor(options = {}) {
        this.options = {
            count: 40,
            colors: ['#D4AF37', '#C0C0C0', '#FFD700', '#E8E8E8', '#B8860B'],
            minSize: 1,
            maxSize: 4,
            minSpeed: 0.2,
            maxSpeed: 0.8,
            minOpacity: 0.3,
            maxOpacity: 0.8,
            shimmerIntensity: 0.5,
            ...options
        };
        
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isActive = true;
        
        this.init();
    }
    
    init() {
        this.createCanvas();
        this.createParticles();
        this.animate();
        this.handleResize();
        
        // Respetar preferencias de movimiento reducido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isActive = false;
            this.canvas.style.opacity = '0.3';
        }
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'mica-particles-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0;
            transition: opacity 1.5s ease;
        `;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Fade in suave
        setTimeout(() => this.canvas.style.opacity = '1', 100);
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    handleResize() {
        window.addEventListener('resize', () => this.resize());
    }
    
    createParticles() {
        for (let i = 0; i < this.options.count; i++) {
            this.particles.push(this.createParticle());
        }
    }
    
    createParticle() {
        const { colors, minSize, maxSize, minSpeed, maxSpeed, minOpacity, maxOpacity } = this.options;
        
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: minSize + Math.random() * (maxSize - minSize),
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: (Math.random() - 0.5) * maxSpeed,
            speedY: -minSpeed - Math.random() * (maxSpeed - minSpeed), // Flotan hacia arriba
            opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
            shimmerPhase: Math.random() * Math.PI * 2,
            shimmerSpeed: 0.02 + Math.random() * 0.03,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02
        };
    }
    
    animate() {
        if (!this.isActive) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach((p, index) => {
            // Actualizar posición
            p.x += p.speedX;
            p.y += p.speedY;
            p.shimmerPhase += p.shimmerSpeed;
            p.rotation += p.rotationSpeed;
            
            // Shimmer effect (centelleo)
            const shimmer = Math.sin(p.shimmerPhase) * this.options.shimmerIntensity;
            const currentOpacity = Math.max(0.1, p.opacity + shimmer * 0.3);
            const currentSize = p.size * (1 + shimmer * 0.2);
            
            // Reciclar partículas que salen de pantalla
            if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
                this.particles[index] = this.createParticle();
                this.particles[index].y = this.canvas.height + 10;
            }
            
            // Dibujar partícula con forma de diamante/mica
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation);
            this.ctx.globalAlpha = currentOpacity;
            
            // Gradiente radial para efecto de brillo
            const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, currentSize);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.5, p.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            
            // Forma de diamante
            this.ctx.beginPath();
            this.ctx.moveTo(0, -currentSize);
            this.ctx.lineTo(currentSize * 0.6, 0);
            this.ctx.lineTo(0, currentSize);
            this.ctx.lineTo(-currentSize * 0.6, 0);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Punto central brillante
            this.ctx.globalAlpha = currentOpacity * 1.5;
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, currentSize * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    toggle(active) {
        this.isActive = active;
        this.canvas.style.opacity = active ? '1' : '0';
    }
    
    destroy() {
        cancelAnimationFrame(this.animationId);
        this.canvas.remove();
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
// 2. INK TRAILS - Manchas de tinta que deja el cursor
// ═══════════════════════════════════════════════════════════════════════════════

class InkTrails {
    constructor(options = {}) {
        this.options = {
            maxDrops: 15,
            dropInterval: 200, // ms entre gotas
            fadeTime: 4000, // ms hasta desaparecer
            minSize: 8,
            maxSize: 25,
            colors: [
                'rgba(30, 64, 124, 0.4)',   // Azul PILOT
                'rgba(45, 45, 45, 0.35)',    // Negro tinta
                'rgba(60, 60, 60, 0.3)',     // Gris grafito
                'rgba(20, 50, 100, 0.35)'    // Azul oscuro
            ],
            ...options
        };
        
        this.drops = [];
        this.lastDropTime = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isActive = true;
        this.container = null;
        
        this.init();
    }
    
    init() {
        this.createContainer();
        this.bindEvents();
        this.animate();
        
        // Respetar preferencias de movimiento reducido
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.isActive = false;
        }
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'ink-trails-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 2;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            if (this.isActive) {
                this.maybeCreateDrop();
            }
        });
    }
    
    maybeCreateDrop() {
        const now = Date.now();
        if (now - this.lastDropTime < this.options.dropInterval) return;
        
        // Solo crear gota con cierta probabilidad (más artístico)
        if (Math.random() > 0.3) return;
        
        this.lastDropTime = now;
        this.createDrop();
    }
    
    createDrop() {
        const { minSize, maxSize, colors, fadeTime } = this.options;
        
        const drop = document.createElement('div');
        const size = minSize + Math.random() * (maxSize - minSize);
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Forma irregular (como gota de tinta real)
        const borderRadius = this.generateIrregularBorderRadius();
        
        drop.className = 'ink-drop';
        drop.style.cssText = `
            position: fixed;
            left: ${this.mouseX - size / 2}px;
            top: ${this.mouseY - size / 2}px;
            width: ${size}px;
            height: ${size * (0.8 + Math.random() * 0.4)}px;
            background: ${color};
            border-radius: ${borderRadius};
            transform: rotate(${Math.random() * 360}deg) scale(0);
            opacity: 0;
            pointer-events: none;
            filter: blur(${Math.random() * 1}px);
            animation: inkDropAppear 0.3s ease-out forwards;
        `;
        
        this.container.appendChild(drop);
        this.drops.push({ element: drop, createdAt: Date.now() });
        
        // Limitar cantidad
        if (this.drops.length > this.options.maxDrops) {
            const oldest = this.drops.shift();
            oldest.element.remove();
        }
    }
    
    generateIrregularBorderRadius() {
        const values = [];
        for (let i = 0; i < 4; i++) {
            values.push(30 + Math.random() * 40 + '%');
        }
        return values.join(' ');
    }
    
    animate() {
        const now = Date.now();
        
        this.drops.forEach((drop, index) => {
            const age = now - drop.createdAt;
            const progress = age / this.options.fadeTime;
            
            if (progress >= 1) {
                drop.element.remove();
                this.drops.splice(index, 1);
            } else if (progress > 0.7) {
                // Fade out en el último 30%
                const fadeProgress = (progress - 0.7) / 0.3;
                drop.element.style.opacity = 1 - fadeProgress;
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    toggle(active) {
        this.isActive = active;
        if (!active) {
            // Limpiar gotas existentes gradualmente
            this.drops.forEach(drop => {
                drop.createdAt = Date.now() - this.options.fadeTime * 0.8;
            });
        }
    }
    
    destroy() {
        this.container.remove();
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
// 3. STUDIO AUDIO - Sonidos ambiente de estudio artístico
// ═══════════════════════════════════════════════════════════════════════════════

class StudioAudio {
    constructor(options = {}) {
        this.options = {
            volume: 0.15,
            autoStart: false,
            sounds: {
                pencilScratch: true,
                brushStroke: true,
                waterRipple: true,
                paperRustle: true,
                ambient: true
            },
            ...options
        };
        
        this.audioContext = null;
        this.isActive = false;
        this.oscillators = {};
        this.gainNodes = {};
        this.masterGain = null;
        this.audioInitialized = false;
        
        this.init();
    }
    
    init() {
        // Crear botón de audio toggle
        this.createToggleButton();
        
        // Audio solo se inicializa con interacción del usuario
        document.addEventListener('click', () => this.initAudio(), { once: true });
    }
    
    createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'studio-audio-toggle';
        btn.innerHTML = '🔇';
        btn.title = 'Activar sonido ambiente de estudio';
        btn.setAttribute('aria-label', 'Toggle studio ambient sound');
        btn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 70px;
            width: 44px;
            height: 44px;
            border: none;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            cursor: pointer;
            font-size: 20px;
            z-index: 9999;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        document.body.appendChild(btn);
        this.toggleButton = btn;
    }
    
    async initAudio() {
        if (this.audioInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0;
            
            this.audioInitialized = true;
            console.log('🎵 Studio Audio initialized');
        } catch (e) {
            console.warn('Audio not supported:', e);
        }
    }
    
    toggle() {
        if (!this.audioInitialized) {
            this.initAudio().then(() => this.toggle());
            return;
        }
        
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            this.start();
            this.toggleButton.innerHTML = '🔊';
            this.toggleButton.title = 'Desactivar sonido ambiente';
        } else {
            this.stop();
            this.toggleButton.innerHTML = '🔇';
            this.toggleButton.title = 'Activar sonido ambiente de estudio';
        }
    }
    
    start() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        // Fade in
        this.masterGain.gain.linearRampToValueAtTime(
            this.options.volume,
            this.audioContext.currentTime + 1
        );
        
        // Iniciar sonidos
        this.playAmbientDrone();
        this.schedulePencilSounds();
        this.scheduleBrushSounds();
    }
    
    stop() {
        // Fade out
        this.masterGain.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + 0.5
        );
        
        // Detener oscilladores después del fade
        setTimeout(() => {
            Object.values(this.oscillators).forEach(osc => {
                try { osc.stop(); } catch(e) {}
            });
            this.oscillators = {};
        }, 600);
    }
    
    // Drone ambiental suave (sonido base del estudio)
    playAmbientDrone() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.value = 80; // Nota baja
        
        filter.type = 'lowpass';
        filter.frequency.value = 200;
        
        gain.gain.value = 0.08;
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start();
        this.oscillators.ambient = osc;
        
        // Modular ligeramente la frecuencia (efecto orgánico)
        this.modulateFrequency(osc, 75, 85, 8);
    }
    
    modulateFrequency(osc, min, max, duration) {
        const mod = () => {
            if (!this.isActive) return;
            
            const target = min + Math.random() * (max - min);
            osc.frequency.linearRampToValueAtTime(
                target,
                this.audioContext.currentTime + duration
            );
            
            setTimeout(mod, duration * 1000);
        };
        mod();
    }
    
    // Sonido de lápiz/grafito raspando
    schedulePencilSounds() {
        const playPencil = () => {
            if (!this.isActive) return;
            
            this.createPencilScratch();
            
            // Siguiente sonido en intervalo aleatorio
            const nextDelay = 3000 + Math.random() * 8000;
            setTimeout(playPencil, nextDelay);
        };
        
        setTimeout(playPencil, 2000);
    }
    
    createPencilScratch() {
        const duration = 0.5 + Math.random() * 1;
        const noise = this.createNoiseBuffer(duration);
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = noise;
        
        filter.type = 'bandpass';
        filter.frequency.value = 2000 + Math.random() * 3000;
        filter.Q.value = 2;
        
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.03, this.audioContext.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + duration * 0.5);
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        source.start();
    }
    
    // Sonido de pincel suave
    scheduleBrushSounds() {
        const playBrush = () => {
            if (!this.isActive) return;
            
            this.createBrushStroke();
            
            const nextDelay = 5000 + Math.random() * 12000;
            setTimeout(playBrush, nextDelay);
        };
        
        setTimeout(playBrush, 5000);
    }
    
    createBrushStroke() {
        const duration = 0.8 + Math.random() * 1.2;
        const noise = this.createNoiseBuffer(duration);
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = noise;
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        
        // Envelope suave
        gain.gain.value = 0;
        gain.gain.linearRampToValueAtTime(0.02, this.audioContext.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0.015, this.audioContext.currentTime + duration * 0.7);
        gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        source.start();
    }
    
    createNoiseBuffer(duration) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < length; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }
        
        return buffer;
    }
    
    setVolume(value) {
        this.options.volume = Math.max(0, Math.min(1, value));
        if (this.isActive && this.masterGain) {
            this.masterGain.gain.linearRampToValueAtTime(
                this.options.volume,
                this.audioContext.currentTime + 0.3
            );
        }
    }
    
    destroy() {
        this.stop();
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.toggleButton.remove();
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
// 4. IMMERSIVE EXPERIENCE CONTROLLER - Orquestador principal
// ═══════════════════════════════════════════════════════════════════════════════

class ImmersiveExperience {
    constructor(options = {}) {
        this.options = {
            enableMica: true,
            enableInk: true,
            enableAudio: true,
            showControls: true,
            ...options
        };
        
        this.mica = null;
        this.ink = null;
        this.audio = null;
        this.controlPanel = null;
        
        this.init();
    }
    
    init() {
        console.log('✨ Initializing Immersive Experience...');
        
        // Inicializar módulos
        if (this.options.enableMica) {
            this.mica = new MicaParticles();
        }
        
        if (this.options.enableInk) {
            this.ink = new InkTrails();
        }
        
        if (this.options.enableAudio) {
            this.audio = new StudioAudio();
        }
        
        // Panel de control opcional
        if (this.options.showControls) {
            this.createControlPanel();
        }
        
        // Inyectar CSS
        this.injectStyles();
        
        console.log('✨ Immersive Experience ready!');
    }
    
    createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'immersive-controls';
        panel.innerHTML = `
            <button id="immersive-toggle" title="Experiencia Inmersiva" aria-label="Toggle immersive effects">
                ✨
            </button>
            <div id="immersive-menu" class="hidden">
                <label>
                    <input type="checkbox" id="toggle-mica" checked>
                    <span>Partículas Mica</span>
                </label>
                <label>
                    <input type="checkbox" id="toggle-ink" checked>
                    <span>Manchas de Tinta</span>
                </label>
            </div>
        `;
        
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 8px;
        `;
        
        document.body.appendChild(panel);
        this.controlPanel = panel;
        
        this.bindControlEvents();
    }
    
    bindControlEvents() {
        const toggle = document.getElementById('immersive-toggle');
        const menu = document.getElementById('immersive-menu');
        const micaToggle = document.getElementById('toggle-mica');
        const inkToggle = document.getElementById('toggle-ink');
        
        toggle?.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
        
        micaToggle?.addEventListener('change', (e) => {
            this.mica?.toggle(e.target.checked);
        });
        
        inkToggle?.addEventListener('change', (e) => {
            this.ink?.toggle(e.target.checked);
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!this.controlPanel.contains(e.target)) {
                menu?.classList.add('hidden');
            }
        });
    }
    
    injectStyles() {
        const style = document.createElement('style');
        style.id = 'immersive-experience-styles';
        style.textContent = `
            /* Ink Drop Animation */
            @keyframes inkDropAppear {
                0% {
                    transform: rotate(var(--rotation, 0deg)) scale(0);
                    opacity: 0;
                }
                50% {
                    transform: rotate(var(--rotation, 0deg)) scale(1.2);
                    opacity: 0.8;
                }
                100% {
                    transform: rotate(var(--rotation, 0deg)) scale(1);
                    opacity: 1;
                }
            }
            
            /* Control Panel Styles */
            #immersive-toggle {
                width: 44px;
                height: 44px;
                border: none;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                cursor: pointer;
                font-size: 20px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #immersive-toggle:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            }
            
            #immersive-menu {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(15px);
                border-radius: 12px;
                padding: 12px 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                display: flex;
                flex-direction: column;
                gap: 10px;
                min-width: 160px;
                transform-origin: bottom right;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            #immersive-menu.hidden {
                opacity: 0;
                transform: scale(0.9) translateY(10px);
                pointer-events: none;
            }
            
            #immersive-menu label {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                font-size: 14px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #333;
            }
            
            #immersive-menu input[type="checkbox"] {
                width: 16px;
                height: 16px;
                accent-color: #1E407C;
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                #mica-particles-canvas {
                    display: none;
                }
                
                .ink-drop {
                    animation: none !important;
                    opacity: 0.5;
                }
            }
            
            /* Dark mode adjustments */
            html.full-moon-mode #immersive-toggle,
            html.full-moon-mode #immersive-menu {
                background: rgba(30, 30, 50, 0.9);
                color: #e8e6ff;
            }
            
            html.full-moon-mode #immersive-menu label {
                color: #e8e6ff;
            }
            
            html.full-moon-mode #studio-audio-toggle {
                background: rgba(30, 30, 50, 0.9);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // API pública
    enableAll() {
        this.mica?.toggle(true);
        this.ink?.toggle(true);
    }
    
    disableAll() {
        this.mica?.toggle(false);
        this.ink?.toggle(false);
        this.audio?.stop();
    }
    
    destroy() {
        this.mica?.destroy();
        this.ink?.destroy();
        this.audio?.destroy();
        this.controlPanel?.remove();
        document.getElementById('immersive-experience-styles')?.remove();
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-INITIALIZE
// ═══════════════════════════════════════════════════════════════════════════════

let immersiveExperience = null;

document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar en desktop (móvil puede ser demasiado pesado)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
        immersiveExperience = new ImmersiveExperience({
            enableMica: true,
            enableInk: true,
            enableAudio: true,
            showControls: true
        });
        
        // Exponer globalmente
        window.immersiveExperience = immersiveExperience;
    } else {
        console.log('📱 Immersive Experience disabled on mobile for performance');
    }
});

// Exportar clases
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MicaParticles,
        InkTrails,
        StudioAudio,
        ImmersiveExperience
    };
}
