// === SISTEMA DE AUDIO WARM ATMOSFÉRICO ===
// Sonido envolvente, íntimo y cálido para la galería de Naroa
// Como estar en un estudio de artista con fuego crepitando

class WarmAudioEngine {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.masterGain = null;
        this.warmth = 0.7; // Factor de calidez (0-1)
        
        // Escala Lydian en registro grave - muy cálida y soñadora
        this.scale = [
            43.65,  // F1
            48.99,  // G1
            55.00,  // A1
            61.74,  // B1
            65.41,  // C2
            73.42,  // D2
            82.41,  // E2
            87.31,  // F2
        ];
        
        this.activeNotes = new Set();
        this.crackles = null;
        this.init();
    }
    
    init() {
        this.createAudioButton();
    }
    
    createAudioButton() {
        const existingBtn = document.getElementById('warm-audio-btn') || 
                           document.getElementById('reactive-audio-btn');
        
        if (existingBtn) {
            existingBtn.addEventListener('click', () => this.toggle());
            this.button = existingBtn;
            return;
        }
        
        const btn = document.createElement('button');
        btn.id = 'warm-audio-btn';
        btn.innerHTML = '🔇';
        btn.title = 'Activar ambiente cálido';
        Object.assign(btn.style, {
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '55px',
            height: '55px',
            borderRadius: '50%',
            border: '2px solid rgba(255,200,150,0.3)',
            background: 'linear-gradient(135deg, rgba(40,20,10,0.9), rgba(60,30,15,0.85))',
            color: '#ffcc99',
            fontSize: '26px',
            cursor: 'pointer',
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
            zIndex: '10000',
            transition: 'all 0.4s ease',
            boxShadow: '0 4px 20px rgba(200,100,50,0.2)'
        });
        
        btn.addEventListener('click', () => this.toggle());
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.boxShadow = '0 6px 30px rgba(200,100,50,0.4)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 4px 20px rgba(200,100,50,0.2)';
        });
        
        document.body.appendChild(btn);
        this.button = btn;
    }
    
    initAudioContext() {
        if (this.ctx) return;
        
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        
        // === CADENA DE AUDIO CÁLIDA ===
        
        // Master gain muy suave
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        
        // === WARMTH FILTER (saturador analógico simulado) ===
        this.warmFilter = this.ctx.createBiquadFilter();
        this.warmFilter.type = 'lowshelf';
        this.warmFilter.frequency.setValueAtTime(200, this.ctx.currentTime);
        this.warmFilter.gain.setValueAtTime(6, this.ctx.currentTime); // Boost graves
        
        // Filtro high-cut para suavidad
        this.softFilter = this.ctx.createBiquadFilter();
        this.softFilter.type = 'lowpass';
        this.softFilter.frequency.setValueAtTime(3500, this.ctx.currentTime);
        this.softFilter.Q.setValueAtTime(0.5, this.ctx.currentTime);
        
        // === REVERB LARGO (como una catedral) ===
        this.reverb = this.createLongReverb();
        
        // === COMPRESOR SUAVE (para cohesión) ===
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.1, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.5, this.ctx.currentTime);
        
        // Conectar cadena: master → warm → soft → comp → reverb → destination
        this.masterGain.connect(this.warmFilter);
        this.warmFilter.connect(this.softFilter);
        this.softFilter.connect(this.compressor);
        this.compressor.connect(this.reverb.input);
        this.reverb.connect(this.ctx.destination);
        
        // También conexión directa con menos volumen
        const dryGain = this.ctx.createGain();
        dryGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        this.compressor.connect(dryGain);
        dryGain.connect(this.ctx.destination);
    }
    
    createLongReverb() {
        // Reverb largo y suave usando múltiples delays
        const input = this.ctx.createGain();
        input.gain.setValueAtTime(1, this.ctx.currentTime);
        
        const output = this.ctx.createGain();
        output.gain.setValueAtTime(0.4, this.ctx.currentTime);
        
        // 4 líneas de delay para densidad
        const delays = [0.1, 0.23, 0.37, 0.52];
        const feedbacks = [0.5, 0.45, 0.4, 0.35];
        
        delays.forEach((time, i) => {
            const delay = this.ctx.createDelay();
            delay.delayTime.setValueAtTime(time, this.ctx.currentTime);
            
            const fb = this.ctx.createGain();
            fb.gain.setValueAtTime(feedbacks[i], this.ctx.currentTime);
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000 - i * 300, this.ctx.currentTime);
            
            input.connect(delay);
            delay.connect(filter);
            filter.connect(fb);
            fb.connect(delay);
            filter.connect(output);
        });
        
        return { 
            input, 
            output,
            connect: (node) => output.connect(node)
        };
    }
    
    // === DRONE CÁLIDO PRINCIPAL ===
    startWarmDrone() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        // === Sub-bass profundo (fundación) ===
        this.subOsc = this.ctx.createOscillator();
        this.subOsc.type = 'sine';
        this.subOsc.frequency.setValueAtTime(43.65, now); // F1 - muy grave
        
        // === Pad cálido principal ===
        this.padOsc1 = this.ctx.createOscillator();
        this.padOsc1.type = 'sine';
        this.padOsc1.frequency.setValueAtTime(87.31, now); // F2
        
        // === Quinta armónica ===
        this.padOsc2 = this.ctx.createOscillator();
        this.padOsc2.type = 'sine';
        this.padOsc2.frequency.setValueAtTime(130.81, now); // C3 (quinta)
        
        // === Tercera mayor sutil ===
        this.padOsc3 = this.ctx.createOscillator();
        this.padOsc3.type = 'triangle';
        this.padOsc3.frequency.setValueAtTime(110, now); // A2
        
        // === LFO muy lento para "respiración" ===
        this.breathLfo = this.ctx.createOscillator();
        this.breathLfo.type = 'sine';
        this.breathLfo.frequency.setValueAtTime(0.05, now); // Muy lento - 20 segundos por ciclo
        
        const breathGain = this.ctx.createGain();
        breathGain.gain.setValueAtTime(3, now); // Modulación muy sutil
        
        this.breathLfo.connect(breathGain);
        breathGain.connect(this.padOsc1.frequency);
        breathGain.connect(this.padOsc2.frequency);
        
        // === LFO para wow/flutter (efecto tape) ===
        this.wowLfo = this.ctx.createOscillator();
        this.wowLfo.type = 'sine';
        this.wowLfo.frequency.setValueAtTime(0.3, now);
        
        const wowGain = this.ctx.createGain();
        wowGain.gain.setValueAtTime(0.8, now);
        
        this.wowLfo.connect(wowGain);
        wowGain.connect(this.padOsc1.detune);
        wowGain.connect(this.padOsc2.detune);
        wowGain.connect(this.padOsc3.detune);
        
        // === Gains individuales ===
        this.subGain = this.ctx.createGain();
        this.subGain.gain.setValueAtTime(0, now);
        this.subGain.gain.linearRampToValueAtTime(0.15, now + 5);
        
        this.padGain = this.ctx.createGain();
        this.padGain.gain.setValueAtTime(0, now);
        this.padGain.gain.linearRampToValueAtTime(0.08, now + 4);
        
        // Conectar osciladores
        this.subOsc.connect(this.subGain);
        this.padOsc1.connect(this.padGain);
        this.padOsc2.connect(this.padGain);
        this.padOsc3.connect(this.padGain);
        
        this.subGain.connect(this.masterGain);
        this.padGain.connect(this.masterGain);
        
        // Iniciar todo
        this.subOsc.start();
        this.padOsc1.start();
        this.padOsc2.start();
        this.padOsc3.start();
        this.breathLfo.start();
        this.wowLfo.start();
    }
    
    stopWarmDrone() {
        const now = this.ctx?.currentTime || 0;
        
        if (this.subGain) {
            this.subGain.gain.linearRampToValueAtTime(0, now + 3);
        }
        if (this.padGain) {
            this.padGain.gain.linearRampToValueAtTime(0, now + 3);
        }
        
        setTimeout(() => {
            this.subOsc?.stop();
            this.padOsc1?.stop();
            this.padOsc2?.stop();
            this.padOsc3?.stop();
            this.breathLfo?.stop();
            this.wowLfo?.stop();
        }, 3500);
    }
    
    // === CRACKLES DE FUEGO/VINILO ===
    startCrackles() {
        if (!this.ctx) return;
        
        this.crackleInterval = setInterval(() => {
            if (!this.isPlaying) return;
            
            // Random crackle
            if (Math.random() > 0.7) {
                this.playCrackle();
            }
        }, 100);
    }
    
    playCrackle() {
        const now = this.ctx.currentTime;
        
        // Noise burst muy corto
        const bufferSize = this.ctx.sampleRate * 0.03; // 30ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            // Noise con envelope
            const env = 1 - (i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * env * 0.3;
        }
        
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        
        const crackleGain = this.ctx.createGain();
        crackleGain.gain.setValueAtTime(0.02 + Math.random() * 0.03, now);
        
        // Filtro para que suene más grave/cálido
        const crackleFilter = this.ctx.createBiquadFilter();
        crackleFilter.type = 'bandpass';
        crackleFilter.frequency.setValueAtTime(800 + Math.random() * 600, now);
        crackleFilter.Q.setValueAtTime(2, now);
        
        source.connect(crackleFilter);
        crackleFilter.connect(crackleGain);
        crackleGain.connect(this.masterGain);
        
        source.start();
    }
    
    stopCrackles() {
        if (this.crackleInterval) {
            clearInterval(this.crackleInterval);
        }
    }
    
    // === NOTAS MELÓDICAS OCASIONALES ===
    startMelodyHints() {
        this.melodyInterval = setInterval(() => {
            if (!this.isPlaying) return;
            
            // Ocasionalmente tocar una nota de la escala
            if (Math.random() > 0.85) {
                this.playWarmTone();
            }
        }, 2000);
    }
    
    playWarmTone() {
        if (!this.ctx || !this.isPlaying) return;
        
        const now = this.ctx.currentTime;
        const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
        
        // Oscilador principal
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Ligero detune para calidez
        osc.detune.setValueAtTime((Math.random() - 0.5) * 10, now);
        
        // Envelope muy suave
        const gain = this.ctx.createGain();
        const attackTime = 0.3 + Math.random() * 0.2;
        const releaseTime = 2 + Math.random() * 2;
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.03, now + attackTime);
        gain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + releaseTime);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + attackTime + releaseTime + 0.1);
        
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
    }
    
    // === SONIDO REACTIVO AL CURSOR (muy sutil) ===
    startMouseReaction() {
        let lastX = 0, lastY = 0;
        let lastTrigger = 0;
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isPlaying) return;
            
            const now = performance.now();
            if (now - lastTrigger < 300) return;
            
            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 80) {
                lastTrigger = now;
                lastX = e.clientX;
                lastY = e.clientY;
                
                // Mapear posición a nota
                const noteIndex = Math.floor((e.clientX / window.innerWidth) * this.scale.length);
                const freq = this.scale[Math.min(noteIndex, this.scale.length - 1)];
                
                this.playSubtleChime(freq, 0.02);
            }
        });
    }
    
    playSubtleChime(freq, vol = 0.02) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 2, now); // Una octava arriba
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 1.6);
    }
    
    // === CONTROL PRINCIPAL ===
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
        
        // Iniciar todos los sistemas
        this.startWarmDrone();
        this.startCrackles();
        this.startMelodyHints();
        this.startMouseReaction();
        
        if (this.button) {
            this.button.innerHTML = '🔥';
            this.button.style.background = 'linear-gradient(135deg, rgba(180,80,30,0.9), rgba(120,50,20,0.85))';
            this.button.style.borderColor = 'rgba(255,200,100,0.5)';
        }
        
        console.log('🔥 Ambiente cálido activado');
    }
    
    stop() {
        this.isPlaying = false;
        this.stopWarmDrone();
        this.stopCrackles();
        
        if (this.melodyInterval) {
            clearInterval(this.melodyInterval);
        }
        
        if (this.button) {
            this.button.innerHTML = '🔇';
            this.button.style.background = 'linear-gradient(135deg, rgba(40,20,10,0.9), rgba(60,30,15,0.85))';
            this.button.style.borderColor = 'rgba(255,200,150,0.3)';
        }
        
        console.log('🔇 Ambiente cálido desactivado');
    }
    
    // Ajustar calidez
    setWarmth(value) {
        this.warmth = Math.max(0, Math.min(1, value));
        if (this.warmFilter) {
            this.warmFilter.gain.setValueAtTime(3 + this.warmth * 6, this.ctx.currentTime);
        }
    }
}

// === AUTO-INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    window.warmAudio = new WarmAudioEngine();
    window.WarmAudioEngine = WarmAudioEngine;
});

if (document.readyState !== 'loading') {
    window.warmAudio = new WarmAudioEngine();
    window.WarmAudioEngine = WarmAudioEngine;
}
