// === SISTEMA DE AUDIO REACTIVO A PARTÍCULAS ===
// Música generativa que responde 100% a las burbujas/partículas

class ReactiveAudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.masterGain = null;
        this.particles = [];
        this.oscillators = new Map();
        this.lastTriggerTime = 0;
        this.particleCanvas = null;
        
        // Escala pentatónica para armonía (notas que siempre suenan bien juntas)
        this.scale = [55, 65.41, 73.42, 82.41, 98, 110, 130.81, 146.83, 164.81, 196];
        // Notas base: A1, C2, D2, E2, G2, A2, C3, D3, E3, G3
        
        this.init();
    }
    
    init() {
        // Detectar canvas de partículas existente
        this.findParticleCanvas();
        
        // Crear botón de audio
        this.createAudioButton();
    }
    
    findParticleCanvas() {
        this.particleCanvas = document.getElementById('bokeh-canvas') || 
                              document.getElementById('pigment-canvas') ||
                              document.querySelector('canvas');
    }
    
    createAudioButton() {
        // Buscar si ya existe el botón de audio en el HUD
        const existingBtn = document.getElementById('audio-toggle') || 
                           document.querySelector('[data-audio-toggle]');
        
        if (existingBtn) {
            existingBtn.addEventListener('click', () => this.toggle());
            return;
        }
        
        // Crear botón flotante si no existe
        const btn = document.createElement('button');
        btn.id = 'reactive-audio-btn';
        btn.innerHTML = '🔇';
        btn.title = 'Activar música reactiva';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            zIndex: '10000',
            transition: 'all 0.3s ease'
        });
        
        btn.addEventListener('click', () => this.toggle());
        btn.addEventListener('mouseenter', () => btn.style.transform = 'scale(1.1)');
        btn.addEventListener('mouseleave', () => btn.style.transform = 'scale(1)');
        
        document.body.appendChild(btn);
        this.button = btn;
    }
    
    initAudioContext() {
        if (this.ctx) return;
        
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        
        // Reverb (convolution simplificada con delay)
        this.reverb = this.createReverb();
        
        // Filtro global
        this.filter = this.ctx.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
        this.filter.Q.setValueAtTime(1, this.ctx.currentTime);
        
        // Conectar cadena
        this.masterGain.connect(this.filter);
        this.filter.connect(this.reverb.input);
        this.reverb.connect(this.ctx.destination);
        
        // También conexión directa para claridad
        this.filter.connect(this.ctx.destination);
    }
    
    createReverb() {
        // Crear reverb simple con delay feedback
        const delay = this.ctx.createDelay();
        delay.delayTime.setValueAtTime(0.3, this.ctx.currentTime);
        
        const feedback = this.ctx.createGain();
        feedback.gain.setValueAtTime(0.4, this.ctx.currentTime);
        
        const reverbGain = this.ctx.createGain();
        reverbGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(reverbGain);
        
        return { 
            input: delay, 
            output: reverbGain,
            connect: (node) => reverbGain.connect(node)
        };
    }
    
    // Crear un tono que se desvanece (para cada partícula)
    playParticleTone(x, y, size = 1, velocity = 1) {
        if (!this.ctx || !this.isPlaying) return;
        
        const now = this.ctx.currentTime;
        
        // Limitar frecuencia de triggers
        if (now - this.lastTriggerTime < 0.05) return;
        this.lastTriggerTime = now;
        
        // Mapear posición X a nota de la escala
        const noteIndex = Math.floor((x / window.innerWidth) * this.scale.length);
        const freq = this.scale[Math.min(noteIndex, this.scale.length - 1)];
        
        // Mapear posición Y a filtro (más arriba = más brillante)
        const filterFreq = 200 + (1 - y / window.innerHeight) * 3000;
        
        // Crear oscilador
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        const oscFilter = this.ctx.createBiquadFilter();
        
        // Tipo de onda basado en tamaño
        osc.type = size > 0.7 ? 'sine' : size > 0.4 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Ligera desafinación para riqueza
        osc.detune.setValueAtTime((Math.random() - 0.5) * 20, now);
        
        // Filtro individual
        oscFilter.type = 'lowpass';
        oscFilter.frequency.setValueAtTime(filterFreq, now);
        oscFilter.Q.setValueAtTime(2, now);
        
        // Envelope ADSR
        const attackTime = 0.02;
        const decayTime = 0.1;
        const sustainLevel = 0.3 * velocity;
        const releaseTime = 0.8 + Math.random() * 0.5;
        
        oscGain.gain.setValueAtTime(0, now);
        oscGain.gain.linearRampToValueAtTime(0.15 * velocity, now + attackTime);
        oscGain.gain.linearRampToValueAtTime(sustainLevel * 0.15, now + attackTime + decayTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + releaseTime);
        
        // Conectar
        osc.connect(oscFilter);
        oscFilter.connect(oscGain);
        oscGain.connect(this.masterGain);
        
        // Iniciar y programar parada
        osc.start(now);
        osc.stop(now + releaseTime + 0.1);
        
        // Limpieza
        osc.onended = () => {
            osc.disconnect();
            oscGain.disconnect();
            oscFilter.disconnect();
        };
    }
    
    // Drone base que siempre suena
    startDrone() {
        if (!this.ctx) return;
        
        const now = this.ctx.currentTime;
        
        // Oscilador base profundo
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc1.type = 'sine';
        this.droneOsc1.frequency.setValueAtTime(55, now); // A1
        
        // Segundo oscilador (quinta)
        this.droneOsc2 = this.ctx.createOscillator();
        this.droneOsc2.type = 'sine';
        this.droneOsc2.frequency.setValueAtTime(82.41, now); // E2
        
        // LFO para modulación sutil
        this.droneLfo = this.ctx.createOscillator();
        this.droneLfo.type = 'sine';
        this.droneLfo.frequency.setValueAtTime(0.1, now);
        
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(2, now);
        
        this.droneLfo.connect(lfoGain);
        lfoGain.connect(this.droneOsc1.frequency);
        lfoGain.connect(this.droneOsc2.frequency);
        
        // Gain del drone
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0, now);
        this.droneGain.gain.linearRampToValueAtTime(0.08, now + 3);
        
        // Filtro del drone
        const droneFilter = this.ctx.createBiquadFilter();
        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(150, now);
        
        // Conectar
        this.droneOsc1.connect(droneFilter);
        this.droneOsc2.connect(droneFilter);
        droneFilter.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);
        
        // Iniciar
        this.droneOsc1.start();
        this.droneOsc2.start();
        this.droneLfo.start();
    }
    
    stopDrone() {
        const now = this.ctx?.currentTime || 0;
        
        if (this.droneGain) {
            this.droneGain.gain.linearRampToValueAtTime(0, now + 1);
        }
        
        setTimeout(() => {
            this.droneOsc1?.stop();
            this.droneOsc2?.stop();
            this.droneLfo?.stop();
        }, 1100);
    }
    
    // Observador de partículas
    startParticleObserver() {
        // Método 1: Interceptar el canvas de partículas
        if (this.particleCanvas) {
            this.observeCanvas();
        }
        
        // Método 2: Observar elementos DOM con clase .particle
        this.observeDOMParticles();
        
        // Método 3: Escuchar eventos de mouse para generar sonido
        this.observeMouseMovement();
    }
    
    observeCanvas() {
        // Si hay un canvas, generar sonidos aleatorios basados en actividad
        let lastFrame = 0;
        
        const checkActivity = () => {
            if (!this.isPlaying) return;
            
            const now = performance.now();
            if (now - lastFrame > 200) { // Cada 200ms
                lastFrame = now;
                
                // Generar sonido aleatorio como si fuera una partícula
                if (Math.random() > 0.7) {
                    this.playParticleTone(
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerHeight,
                        Math.random(),
                        0.3 + Math.random() * 0.4
                    );
                }
            }
            
            requestAnimationFrame(checkActivity);
        };
        
        requestAnimationFrame(checkActivity);
    }
    
    observeDOMParticles() {
        // Observar partículas DOM si existen
        const particleContainer = document.getElementById('ritual-particles') ||
                                  document.querySelector('.particles-container');
        
        if (!particleContainer) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.classList?.contains('particle')) {
                        const rect = node.getBoundingClientRect();
                        this.playParticleTone(rect.x, rect.y, 0.5, 0.5);
                    }
                });
            });
        });
        
        observer.observe(particleContainer, { childList: true });
    }
    
    observeMouseMovement() {
        let lastX = 0, lastY = 0;
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isPlaying) return;
            
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Solo generar sonido si hay movimiento significativo
            if (distance > 50) {
                const velocity = Math.min(distance / 100, 1);
                this.playParticleTone(e.clientX, e.clientY, 0.6, velocity * 0.5);
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });
        
        // Click genera tono más fuerte
        document.addEventListener('click', (e) => {
            if (!this.isPlaying) return;
            this.playParticleTone(e.clientX, e.clientY, 1, 0.8);
        });
    }
    
    // Conectar con sistema de partículas existente
    connectToParticleSystem(particleSystem) {
        if (!particleSystem) return;
        
        // Hookear el método de añadir partículas
        const originalAdd = particleSystem.addParticle?.bind(particleSystem);
        if (originalAdd) {
            particleSystem.addParticle = (x, y, ...args) => {
                originalAdd(x, y, ...args);
                this.playParticleTone(x, y, 0.5, 0.6);
            };
        }
    }
    
    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.start();
        }
    }
    
    start() {
        this.initAudioContext();
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        
        this.isPlaying = true;
        this.startDrone();
        this.startParticleObserver();
        
        if (this.button) {
            this.button.innerHTML = '🔊';
            this.button.style.background = 'rgba(208,48,48,0.8)';
        }
        
        // Conectar con sistemas existentes
        if (window.pigmentTrail) {
            this.connectToParticleSystem(window.pigmentTrail);
        }
        
        console.log('🎵 Audio reactivo activado');
    }
    
    stop() {
        this.isPlaying = false;
        this.stopDrone();
        
        if (this.button) {
            this.button.innerHTML = '🔇';
            this.button.style.background = 'rgba(0,0,0,0.6)';
        }
        
        console.log('🔇 Audio reactivo desactivado');
    }
    
    // Cambiar la escala musical
    setScale(scaleName) {
        const scales = {
            pentatonic: [55, 65.41, 73.42, 82.41, 98, 110, 130.81, 146.83, 164.81, 196],
            minor: [55, 61.74, 65.41, 73.42, 82.41, 87.31, 98, 110],
            major: [55, 61.74, 69.3, 73.42, 82.41, 92.5, 103.83, 110],
            japanese: [55, 58.27, 73.42, 82.41, 87.31, 110, 116.54, 146.83],
            ambient: [55, 82.41, 110, 146.83, 164.81, 220, 293.66, 329.63]
        };
        
        this.scale = scales[scaleName] || scales.pentatonic;
    }
}

// === AUTO-INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    window.reactiveAudio = new ReactiveAudioEngine();
    
    // Exponer globalmente
    window.ReactiveAudioEngine = ReactiveAudioEngine;
});

// Si el DOM ya está listo
if (document.readyState !== 'loading') {
    window.reactiveAudio = new ReactiveAudioEngine();
    window.ReactiveAudioEngine = ReactiveAudioEngine;
}
