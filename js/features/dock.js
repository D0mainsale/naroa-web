/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED DOCK CONTROLLER
 * Manages the left-side control center
 * ═══════════════════════════════════════════════════════════════
 */

class Dock {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        // Create the dock element if it doesn't exist
        if (!document.getElementById('naroa-dock')) {
            this.createDock();
        }
        this.element = document.getElementById('naroa-dock');
        this.setupListeners();
    }

    createDock() {
        const dock = document.createElement('div');
        dock.id = 'naroa-dock';
        dock.innerHTML = `
            <!-- Home -->
            <button class="dock-item" data-action="home" data-label="Inicio">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </button>
            
            <!-- Portfolio -->
            <button class="dock-item" data-action="portfolio" data-label="Obras">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </button>

            <div class="dock-separator"></div>

            <!-- Valeria Virtual (Asistente Espectacular) -->
            <button class="dock-item" data-action="valeria" data-label="Valeria ✨">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <div class="ai-status-dot"></div>
            </button>

            <!-- Sound/Silence -->
            <button class="dock-item" data-action="mute" data-label="Silencio/Sonido">
                <svg class="icon-volume-on" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                <svg class="icon-volume-off hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="display:none;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            </button>

            <div class="dock-separator"></div>

             <!-- Commission / Retrato -->
            <button class="dock-item" data-action="retrato" data-label="Encargar Retrato">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </button>
        `;
        document.body.appendChild(dock);
    }

    setupListeners() {
        this.element.addEventListener('click', (e) => {
            const btn = e.target.closest('.dock-item');
            if (!btn) return;

            const action = btn.dataset.action;
            this.handleAction(action, btn);
        });

        // Update active state based on hash
        window.addEventListener('hashchange', () => this.updateActiveState());
        window.addEventListener('load', () => this.updateActiveState());
    }

    handleAction(action, btn) {
        switch(action) {
            case 'home':
                window.location.hash = '/';
                break;
            case 'portfolio':
                window.location.hash = '/portfolio';
                break;
            case 'retrato':
                window.location.hash = '/retrato';
                break;
            case 'valeria':
                // Toggle Valeria Virtual
                if (window.valeriaVirtual) {
                    window.valeriaVirtual.toggle();
                    btn.classList.toggle('active');
                }
                break;
            case 'mute':
                // Toggle global mute (placeholder for audio system integration)
                this.toggleMute(btn);
                break;
        }
    }

    updateActiveState() {
        const hash = window.location.hash || '/';
        const items = this.element.querySelectorAll('.dock-item');
        
        items.forEach(item => {
            const action = item.dataset.action;
            // Simple mapping logic
            if ((hash === '#/' || hash === '') && action === 'home') item.classList.add('active');
            else if (hash.includes('portfolio') && action === 'portfolio') item.classList.add('active');
            else if (hash.includes('retrato') && action === 'retrato') item.classList.add('active');
            else if (action !== 'valeria' && action !== 'mute') item.classList.remove('active'); 
            // Keep AI/Mute active state manual/toggle based
        });
    }

    toggleMute(btn) {
        const onIcon = btn.querySelector('.icon-volume-on');
        const offIcon = btn.querySelector('.icon-volume-off');
        
        const isMuted = btn.classList.toggle('muted');
        
        if (isMuted) {
            onIcon.style.display = 'none';
            offIcon.style.display = 'block';
            // Logic to mute actual audio
            if (window.audioSystem && window.audioSystem.mute) window.audioSystem.mute(true);
        } else {
            onIcon.style.display = 'block';
            offIcon.style.display = 'none';
             // Logic to unmute actual audio
             if (window.audioSystem && window.audioSystem.mute) window.audioSystem.mute(false);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.naroaDock = new Dock();
});
