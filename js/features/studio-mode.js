/**
 * STUDIO MODE - Modo "Estudio de Artista"
 * Toggle inmersivo con sonido ambiente e iluminación dinámica según la hora
 * v1.0.0
 */

class StudioMode {
    constructor() {
        this.isActive = false;
        this.audioContext = null;
        this.sounds = {};
        this.masterGain = null;
        this.ambientInterval = null;
        
        // Sound settings
        this.soundConfig = {
            brushStrokes: { volume: 0.3, loop: false, interval: [4000, 12000] },
            paperRustle: { volume: 0.2, loop: false, interval: [8000, 20000] },
            pencilScribble: { volume: 0.25, loop: false, interval: [6000, 15000] },
            clockTick: { volume: 0.1, loop: true },
            ambientLofi: { volume: 0.15, loop: true }
        };
        
        // Time-based lighting presets
        this.lightingPresets = {
            morning: {
                background: 'linear-gradient(135deg, #FFF8E7 0%, #FFECD2 100%)',
                accentHue: '45', // Warm gold
                ambientOpacity: 0.05,
                shadowColor: 'rgba(255, 180, 100, 0.15)'
            },
            afternoon: {
                background: 'linear-gradient(135deg, #F4F3F0 0%, #E8E6E1 100%)',
                accentHue: '30', // Natural light
                ambientOpacity: 0.03,
                shadowColor: 'rgba(0, 0, 0, 0.08)'
            },
            evening: {
                background: 'linear-gradient(135deg, #F0E6D8 0%, #E8D4C0 100%)',
                accentHue: '25', // Warm sunset
                ambientOpacity: 0.08,
                shadowColor: 'rgba(180, 100, 50, 0.12)'
            },
            night: {
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                accentHue: '220', // Cool blue
                ambientOpacity: 0.1,
                shadowColor: 'rgba(50, 100, 200, 0.15)',
                textColor: '#e0e0e0'
            }
        };
        
        this.init();
    }
    
    init() {
        this.createToggleUI();
        this.addStyles();
        console.log('🎨 Studio Mode initialized');
    }
    
    createToggleUI() {
        const toggle = document.createElement('div');
        toggle.className = 'studio-mode-toggle';
        toggle.innerHTML = `
            <button class="studio-toggle-btn" title="Modo Estudio de Artista" aria-label="Activar modo estudio">
                <span class="toggle-icon">🎨</span>
                <span class="toggle-text">Estudio</span>
            </button>
            <div class="studio-controls hidden">
                <div class="studio-control">
                    <label>Volumen ambiente</label>
                    <input type="range" class="studio-volume" min="0" max="100" value="40">
                </div>
                <div class="studio-control">
                    <label>Luz automática</label>
                    <input type="checkbox" class="studio-auto-light" checked>
                </div>
                <button class="studio-close" aria-label="Cerrar controles">×</button>
            </div>
        `;
        
        document.body.appendChild(toggle);
        
        // Event listeners
        const btn = toggle.querySelector('.studio-toggle-btn');
        const controls = toggle.querySelector('.studio-controls');
        const volumeSlider = toggle.querySelector('.studio-volume');
        const closeBtn = toggle.querySelector('.studio-close');
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.isActive) {
                controls.classList.toggle('hidden');
            } else {
                this.activate();
                controls.classList.remove('hidden');
            }
        });
        
        volumeSlider.addEventListener('input', (e) => {
            if (this.masterGain) {
                this.masterGain.gain.value = e.target.value / 100;
            }
        });
        
        closeBtn.addEventListener('click', () => {
            controls.classList.add('hidden');
            this.deactivate();
        });
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.deactivate();
                controls.classList.add('hidden');
            }
        });
    }
    
    async activate() {
        this.isActive = true;
        document.body.classList.add('studio-mode-active');
        
        // Update toggle UI
        const btn = document.querySelector('.studio-toggle-btn');
        btn.classList.add('active');
        btn.querySelector('.toggle-icon').textContent = '✨';
        
        // Initialize audio (needs user gesture)
        await this.initAudio();
        
        // Apply time-based lighting
        this.applyLighting();
        
        // Start ambient sound schedule
        this.startAmbientSounds();
        
        // Create ambient particles
        this.createDustParticles();
        
        console.log('🎨 Studio Mode activated');
    }
    
    deactivate() {
        this.isActive = false;
        document.body.classList.remove('studio-mode-active');
        
        // Update toggle UI
        const btn = document.querySelector('.studio-toggle-btn');
        btn.classList.remove('active');
        btn.querySelector('.toggle-icon').textContent = '🎨';
        
        // Stop all sounds
        this.stopAllSounds();
        
        // Clear ambient intervals
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
        }
        
        // Remove dust particles
        const dust = document.getElementById('studio-dust');
        if (dust) dust.remove();
        
        // Reset lighting
        document.documentElement.style.removeProperty('--studio-bg');
        document.documentElement.style.removeProperty('--studio-accent-hue');
        
        console.log('🎨 Studio Mode deactivated');
    }
    
    async initAudio() {
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.4;
            
            // Create oscillator-based ambient sounds (procedural)
            this.createProceduralSounds();
            
        } catch (error) {
            console.warn('Audio not available:', error);
        }
    }
    
    createProceduralSounds() {
        // Create a low-fi ambient pad using oscillators
        const createPad = (frequency, type = 'sine') => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start();
            
            return { osc, gain, filter };
        };
        
        // Create ambient pad chord
        this.sounds.pad1 = createPad(220);
        this.sounds.pad2 = createPad(277.18);
        this.sounds.pad3 = createPad(329.63);
        
        // Fade in pads
        const now = this.audioContext.currentTime;
        Object.values(this.sounds).forEach(sound => {
            if (sound.gain) {
                sound.gain.gain.linearRampToValueAtTime(0.03, now + 3);
            }
        });
    }
    
    startAmbientSounds() {
        // Periodic brush/paper sounds using noise
        const playRandomSound = () => {
            if (!this.isActive || !this.audioContext) return;
            
            const sounds = ['brush', 'paper', 'pencil'];
            const sound = sounds[Math.floor(Math.random() * sounds.length)];
            
            this.playProceduralSound(sound);
        };
        
        // Initial delay
        setTimeout(() => {
            playRandomSound();
        }, 2000);
        
        // Schedule random sounds
        this.ambientInterval = setInterval(() => {
            const delay = Math.random() * 8000 + 4000;
            setTimeout(playRandomSound, delay);
        }, 10000);
    }
    
    playProceduralSound(type) {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Create filtered noise burst (simulating brush/paper sounds)
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        
        // Different filter settings per sound type
        switch (type) {
            case 'brush':
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(2000, now);
                filter.Q.setValueAtTime(1, now);
                gain.gain.setValueAtTime(0.08, now);
                break;
            case 'paper':
                filter.type = 'highpass';
                filter.frequency.setValueAtTime(3000, now);
                gain.gain.setValueAtTime(0.04, now);
                break;
            case 'pencil':
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(4000, now);
                filter.Q.setValueAtTime(3, now);
                gain.gain.setValueAtTime(0.05, now);
                break;
        }
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        
        source.start(now);
        source.stop(now + 0.5);
    }
    
    stopAllSounds() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        Object.values(this.sounds).forEach(sound => {
            if (sound.gain) {
                sound.gain.gain.linearRampToValueAtTime(0, now + 1);
            }
            if (sound.osc) {
                setTimeout(() => sound.osc.stop(), 1100);
            }
        });
        
        this.sounds = {};
        
        setTimeout(() => {
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
                this.audioContext = null;
            }
        }, 1500);
    }
    
    applyLighting() {
        const hour = new Date().getHours();
        let preset;
        
        if (hour >= 6 && hour < 12) {
            preset = this.lightingPresets.morning;
        } else if (hour >= 12 && hour < 17) {
            preset = this.lightingPresets.afternoon;
        } else if (hour >= 17 && hour < 21) {
            preset = this.lightingPresets.evening;
        } else {
            preset = this.lightingPresets.night;
        }
        
        document.documentElement.style.setProperty('--studio-bg', preset.background);
        document.documentElement.style.setProperty('--studio-accent-hue', preset.accentHue);
        document.documentElement.style.setProperty('--studio-shadow', preset.shadowColor);
        document.documentElement.style.setProperty('--studio-ambient-opacity', preset.ambientOpacity);
        
        if (preset.textColor) {
            document.documentElement.style.setProperty('--studio-text', preset.textColor);
        }
    }
    
    createDustParticles() {
        const container = document.createElement('div');
        container.id = 'studio-dust';
        container.innerHTML = '';
        
        // Create floating dust particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'studio-dust-particle';
            particle.style.cssText = `
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                width: ${2 + Math.random() * 4}px;
                height: ${2 + Math.random() * 4}px;
                animation-delay: ${Math.random() * 10}s;
                animation-duration: ${15 + Math.random() * 20}s;
            `;
            container.appendChild(particle);
        }
        
        document.body.appendChild(container);
    }
    
    addStyles() {
        if (document.getElementById('studio-mode-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'studio-mode-styles';
        style.textContent = `
            /* Studio Mode Toggle */
            .studio-mode-toggle {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10002;
            }
            
            .studio-toggle-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(255, 255, 255, 0.95);
                -webkit-backdrop-filter: blur(12px);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(0, 0, 0, 0.1);
                border-radius: 30px;
                cursor: pointer;
                font-size: 14px;
                font-family: inherit;
                transition: all 0.3s ease;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            .studio-toggle-btn:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 30px rgba(0, 0, 0, 0.15);
            }
            
            .studio-toggle-btn.active {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #1a1a1a;
                border-color: transparent;
            }
            
            .toggle-icon {
                font-size: 18px;
            }
            
            .toggle-text {
                font-weight: 500;
            }
            
            /* Controls panel */
            .studio-controls {
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 8px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.98);
                -webkit-backdrop-filter: blur(20px);
                backdrop-filter: blur(20px);
                border-radius: 12px;
                box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
                min-width: 200px;
                transition: all 0.3s ease;
            }
            
            .studio-controls.hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateY(-10px);
            }
            
            .studio-control {
                margin-bottom: 12px;
            }
            
            .studio-control label {
                display: block;
                font-size: 12px;
                color: #666;
                margin-bottom: 4px;
            }
            
            .studio-control input[type="range"] {
                width: 100%;
                accent-color: #FFD700;
            }
            
            .studio-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
            }
            
            /* Active studio mode effects */
            body.studio-mode-active {
                background: var(--studio-bg, linear-gradient(135deg, #F4F3F0 0%, #E8E6E1 100%)) !important;
                transition: background 1s ease;
            }
            
            body.studio-mode-active::before {
                content: '';
                position: fixed;
                inset: 0;
                background: radial-gradient(
                    circle at 30% 20%,
                    rgba(255, 200, 100, var(--studio-ambient-opacity, 0.05)) 0%,
                    transparent 50%
                );
                pointer-events: none;
                z-index: 1;
            }
            
            /* Dust particles */
            #studio-dust {
                position: fixed;
                inset: 0;
                pointer-events: none;
                z-index: 2;
                overflow: hidden;
            }
            
            .studio-dust-particle {
                position: absolute;
                background: radial-gradient(circle, rgba(255, 200, 100, 0.6) 0%, transparent 70%);
                border-radius: 50%;
                animation: dustFloat 20s ease-in-out infinite;
            }
            
            @keyframes dustFloat {
                0%, 100% {
                    transform: translateY(0) translateX(0) scale(1);
                    opacity: 0;
                }
                10% {
                    opacity: 0.6;
                }
                50% {
                    transform: translateY(-30vh) translateX(20px) scale(1.2);
                    opacity: 0.3;
                }
                90% {
                    opacity: 0.6;
                }
            }
            
            /* Adjust content for studio mode */
            body.studio-mode-active .portfolio-card,
            body.studio-mode-active .process-block {
                box-shadow: var(--studio-shadow, 0 8px 32px rgba(0, 0, 0, 0.08));
            }
            
            /* Night mode text adjustments */
            body.studio-mode-active {
                color: var(--studio-text, inherit);
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .studio-dust-particle {
                    animation: none;
                    opacity: 0.3;
                }
            }
            
            /* Mobile adjustments */
            @media (max-width: 768px) {
                .studio-mode-toggle {
                    top: 10px;
                    right: 10px;
                }
                .toggle-text {
                    display: none;
                }
                .studio-toggle-btn {
                    padding: 10px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.studioMode = new StudioMode();
    });
} else {
    window.studioMode = new StudioMode();
}
