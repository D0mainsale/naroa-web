/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MUSEO VIRTUAL 3D AUDIO — Sistema de Audio Ambiente Inmersivo
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Añade audio 3D espacial al museo:
 * - Pasos del visitante
 * - Ecos de galería
 * - Ambiente de museo
 * - Clicks en obras
 * 
 * v1.0.0 - 2026-01-24
 */

class MuseoAudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.isMuted = false;
        
        // Buffers de audio
        this.buffers = {};
        
        // Estado
        this.isWalking = false;
        this.lastFootstepTime = 0;
        this.footstepInterval = 450; // ms entre pasos
        
        // Sonidos de ambiente
        this.ambientSources = [];
        
        console.log('🔊 Museo Audio System created');
    }
    
    async init() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Master gain
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.6;
            this.masterGain.connect(this.audioContext.destination);
            
            // Cargar sonidos procedurales
            await this.createProceduralSounds();
            
            // Iniciar ambiente
            this.startAmbientSounds();
            
            this.isInitialized = true;
            console.log('🔊 Museo Audio System initialized');
            
        } catch (error) {
            console.error('Error initializing audio:', error);
        }
    }
    
    async createProceduralSounds() {
        // Crear sonidos proceduralmente usando Web Audio API
        
        // Buffer para pasos
        this.buffers.footstep = await this.createFootstepSound();
        
        // Buffer para eco de galería
        this.buffers.roomTone = await this.createRoomToneSound();
        
        // Buffer para click en obra
        this.buffers.artworkClick = await this.createClickSound();
        
        // Buffer para murmullo lejano
        this.buffers.murmur = await this.createMurmurSound();
    }
    
    async createFootstepSound() {
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Ruido con envolvente rápida para simular pisada
            const envelope = Math.exp(-t * 40);
            const noise = (Math.random() * 2 - 1) * 0.3;
            const lowFreq = Math.sin(2 * Math.PI * 80 * t) * 0.5;
            data[i] = (noise + lowFreq) * envelope;
        }
        
        return buffer;
    }
    
    async createRoomToneSound() {
        const duration = 5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Ruido filtrado muy suave
                const noise = (Math.random() * 2 - 1) * 0.02;
                // Leve ondulación
                const wave = Math.sin(2 * Math.PI * 0.1 * t) * 0.005;
                data[i] = noise + wave;
            }
        }
        
        return buffer;
    }
    
    async createClickSound() {
        const duration = 0.1;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Click suave y elegante
            const envelope = Math.exp(-t * 50);
            const tone = Math.sin(2 * Math.PI * 800 * t) * 0.3;
            const click = Math.sin(2 * Math.PI * 2000 * t) * 0.1 * Math.exp(-t * 100);
            data[i] = (tone + click) * envelope;
        }
        
        return buffer;
    }
    
    async createMurmurSound() {
        const duration = 8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Ruido muy filtrado simulando conversaciones lejanas
                const noise = (Math.random() * 2 - 1) * 0.015;
                // Modulación para dar "vida"
                const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.2 * t + channel);
                data[i] = noise * mod;
            }
        }
        
        return buffer;
    }
    
    startAmbientSounds() {
        // Room tone continuo
        this.playLoopingBuffer(this.buffers.roomTone, 0.4);
        
        // Murmullo lejano
        setTimeout(() => {
            this.playLoopingBuffer(this.buffers.murmur, 0.2);
        }, 2000);
    }
    
    playLoopingBuffer(buffer, volume = 0.5) {
        if (!this.audioContext || !buffer) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = volume;
        
        source.connect(gain);
        gain.connect(this.masterGain);
        
        source.start();
        this.ambientSources.push({ source, gain });
        
        return source;
    }
    
    playFootstep() {
        if (!this.isInitialized || this.isMuted) return;
        
        const now = Date.now();
        if (now - this.lastFootstepTime < this.footstepInterval) return;
        this.lastFootstepTime = now;
        
        this.playBuffer(this.buffers.footstep, 0.3 + Math.random() * 0.2);
    }
    
    playArtworkClick() {
        if (!this.isInitialized || this.isMuted) return;
        this.playBuffer(this.buffers.artworkClick, 0.5);
    }
    
    playBuffer(buffer, volume = 0.5) {
        if (!this.audioContext || !buffer) return;
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // Pequeña variación de pitch
        source.playbackRate.value = 0.95 + Math.random() * 0.1;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = volume;
        
        source.connect(gain);
        gain.connect(this.masterGain);
        
        source.start();
    }
    
    setWalking(isWalking) {
        this.isWalking = isWalking;
    }
    
    updateWalkingSound() {
        if (this.isWalking) {
            this.playFootstep();
        }
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
        }
        return this.isMuted;
    }
    
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.value = value;
        }
    }
    
    stop() {
        // Detener todos los sonidos ambiente
        this.ambientSources.forEach(({ source, gain }) => {
            gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
            setTimeout(() => source.stop(), 500);
        });
        this.ambientSources = [];
        
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
    
    // Crear reverb para simular espacio de galería
    async createReverb() {
        const length = 2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, length * sampleRate, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Impulse response de sala grande
                data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * t);
            }
        }
        
        const convolver = this.audioContext.createConvolver();
        convolver.buffer = buffer;
        
        return convolver;
    }
}

// Exportar globalmente
window.MuseoAudioSystem = MuseoAudioSystem;

console.log('🔊 Museo Audio System module loaded');
