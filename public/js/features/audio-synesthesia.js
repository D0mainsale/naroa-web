/**
 * AUDIO-VISUAL SYNESTHESIA - Hover → Ambient Audio
 * Composiciones ambient breves (5-10s) al hacer hover sobre obras
 * v1.0.0
 */
class AudioSynesthesia {
    constructor() {
        this.audioContext = null;
        this.isActive = true;
        this.hoverTimeout = null;
        this.delay = 800; // ms before playing
        this.init();
    }
    
    init() {
        this.addStyles();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.attach());
        } else {
            setTimeout(() => this.attach(), 1000);
        }
        window.addEventListener('hashchange', () => setTimeout(() => this.attach(), 500));
        console.log('🎵 Audio Synesthesia initialized');
    }
    
    attach() {
        const items = document.querySelectorAll('.portfolio-card, .artwork-card, [data-audio]');
        items.forEach(el => {
            if (el.dataset.audioAttached) return;
            el.dataset.audioAttached = 'true';
            el.addEventListener('mouseenter', () => this.startHover(el));
            el.addEventListener('mouseleave', () => this.stopHover());
        });
    }
    
    startHover(el) {
        if (!this.isActive) return;
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = setTimeout(() => {
            this.playAmbient(el);
            el.classList.add('synesthesia-active');
        }, this.delay);
    }
    
    stopHover() {
        clearTimeout(this.hoverTimeout);
        document.querySelectorAll('.synesthesia-active').forEach(el => el.classList.remove('synesthesia-active'));
        this.fadeOut();
    }
    
    async playAmbient(el) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        const palette = el.dataset.palette || this.detectPalette(el);
        const notes = this.paletteToNotes(palette);
        this.playChord(notes);
    }
    
    detectPalette(el) {
        const img = el.querySelector('img');
        if (!img) return 'neutral';
        const title = el.querySelector('h3')?.textContent?.toLowerCase() || '';
        if (title.includes('oscur') || title.includes('negro') || title.includes('carbón')) return 'dark';
        if (title.includes('luz') || title.includes('brill') || title.includes('mica')) return 'light';
        if (title.includes('rosa') || title.includes('cálido')) return 'warm';
        return 'neutral';
    }
    
    paletteToNotes(palette) {
        const scales = {
            dark: [110, 130.81, 164.81, 196],     // Am type
            light: [261.63, 329.63, 392, 523.25], // CMaj
            warm: [220, 277.18, 329.63, 415.30],  // jazz
            neutral: [196, 246.94, 293.66, 392]   // G
        };
        return scales[palette] || scales.neutral;
    }
    
    playChord(notes) {
        const now = this.audioContext.currentTime;
        const master = this.audioContext.createGain();
        master.gain.setValueAtTime(0, now);
        master.gain.linearRampToValueAtTime(0.15, now + 0.5);
        master.gain.linearRampToValueAtTime(0, now + 6);
        master.connect(this.audioContext.destination);
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, now);
            gain.gain.setValueAtTime(0.25, now);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(master);
            osc.start(now + i * 0.2);
            osc.stop(now + 6);
        });
    }
    
    fadeOut() {
        // Future: implement fadeout on active sounds
    }
    
    toggle(enabled) {
        this.isActive = enabled;
    }
    
    addStyles() {
        if (document.getElementById('synesthesia-styles')) return;
        const s = document.createElement('style');
        s.id = 'synesthesia-styles';
        s.textContent = `
            .synesthesia-active{position:relative}
            .synesthesia-active::before{content:'🎵';position:absolute;top:8px;right:8px;font-size:20px;z-index:20;animation:noteFloat 2s ease-in-out infinite}
            @keyframes noteFloat{0%,100%{transform:translateY(0);opacity:.6}50%{transform:translateY(-8px);opacity:1}}
        `;
        document.head.appendChild(s);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.audioSynesthesia = new AudioSynesthesia(); });
} else {
    window.audioSynesthesia = new AudioSynesthesia();
}
