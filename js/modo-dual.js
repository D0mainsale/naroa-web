/**
 * ═══════════════════════════════════════════════════════════════════
 * MODO DUAL ATMOSFÉRICO 2026 - "DIVINOS VAIVENES"
 * Sistema de estados emocionales Luz/Tiniebla
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Features:
 * - Toggle gestual entre modos Luz/Tiniebla
 * - Adaptación automática por hora local (ciclos circadianos)
 * - Cursor spotlight en modo Tiniebla
 * - Transiciones orgánicas entre páginas
 * - Persistencia en localStorage
 */

class ModoDualController {
    constructor() {
        this.STORAGE_KEY = 'naroa-modo-dual';
        this.currentMode = 'luz';
        this.isManualOverride = false;
        this.cursorSpotlight = null;
        
        this.init();
    }
    
    init() {
        // Recuperar preferencia guardada
        const saved = this.loadPreference();
        
        if (saved && saved.isManualOverride) {
            this.currentMode = saved.mode;
            this.isManualOverride = true;
        } else {
            // Detección circadiana automática
            this.currentMode = this.detectCircadianMode();
        }
        
        // Aplicar modo inicial
        this.applyMode(this.currentMode, false);
        
        // Crear toggle UI
        this.createToggleUI();
        
        // Crear cursor spotlight para modo Tiniebla
        this.createCursorSpotlight();
        
        // Observar cambios de hora (cada minuto)
        this.startCircadianWatcher();
        
        console.log(`🌓 Modo Dual inicializado: ${this.currentMode}`);
    }
    
    /**
     * Detectar modo según hora local (ciclos circadianos)
     * 6:00 - 18:00 → Luz
     * 18:00 - 6:00 → Tiniebla
     */
    detectCircadianMode() {
        const hour = new Date().getHours();
        return (hour >= 6 && hour < 18) ? 'luz' : 'tiniebla';
    }
    
    /**
     * Aplicar modo al DOM
     */
    applyMode(mode, animate = true) {
        this.currentMode = mode;
        
        if (animate) {
            this.triggerTransition(() => {
                document.body.setAttribute('data-modo', mode);
            });
        } else {
            document.body.setAttribute('data-modo', mode);
        }
        
        // Actualizar cursor spotlight
        this.toggleCursorSpotlight(mode === 'tiniebla');
        
        // Disparar evento custom
        window.dispatchEvent(new CustomEvent('modo-dual:change', { 
            detail: { mode, isManual: this.isManualOverride }
        }));
    }
    
    /**
     * Toggle entre modos
     */
    toggle() {
        const newMode = this.currentMode === 'luz' ? 'tiniebla' : 'luz';
        this.isManualOverride = true;
        this.applyMode(newMode, true);
        this.savePreference(newMode, true);
        
        // Feedback háptico si disponible
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    /**
     * Transición orgánica tipo tinta/carbón
     */
    triggerTransition(callback) {
        let overlay = document.querySelector('.page-transition-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'page-transition-overlay';
            document.body.appendChild(overlay);
        }
        
        // Origen de transición desde el toggle o centro
        const toggle = document.querySelector('.modo-toggle');
        if (toggle) {
            const rect = toggle.getBoundingClientRect();
            overlay.style.setProperty('--transition-origin-x', `${rect.left + rect.width / 2}px`);
            overlay.style.setProperty('--transition-origin-y', `${rect.top + rect.height / 2}px`);
        }
        
        overlay.classList.add('active');
        
        // Ejecutar cambio a mitad de transición
        setTimeout(callback, 400);
        
        // Remover overlay después de animación
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 1200);
    }
    
    /**
     * Crear UI del toggle
     */
    createToggleUI() {
        // Evitar duplicados
        if (document.querySelector('.modo-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.className = 'modo-toggle';
        toggle.setAttribute('aria-label', 'Alternar modo Luz/Tiniebla');
        toggle.innerHTML = `
            <span class="modo-toggle__label">Atmósfera</span>
            <div class="modo-toggle__switch">
                <span class="icon-luz">☀️</span>
                <span class="icon-tiniebla">🌙</span>
            </div>
        `;
        
        toggle.addEventListener('click', () => this.toggle());
        
        document.body.appendChild(toggle);
    }
    
    /**
     * Crear elemento spotlight que sigue al cursor (modo Tiniebla)
     */
    createCursorSpotlight() {
        this.cursorSpotlight = document.createElement('div');
        this.cursorSpotlight.className = 'cursor-spotlight';
        this.cursorSpotlight.style.opacity = '0';
        document.body.appendChild(this.cursorSpotlight);
        
        // Seguir cursor con requestAnimationFrame
        let mouseX = 0, mouseY = 0;
        let spotlightX = 0, spotlightY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const updateSpotlight = () => {
            // Interpolación suave (lerp)
            spotlightX += (mouseX - spotlightX) * 0.1;
            spotlightY += (mouseY - spotlightY) * 0.1;
            
            this.cursorSpotlight.style.left = `${spotlightX}px`;
            this.cursorSpotlight.style.top = `${spotlightY}px`;
            
            requestAnimationFrame(updateSpotlight);
        };
        
        updateSpotlight();
    }
    
    /**
     * Mostrar/ocultar cursor spotlight
     */
    toggleCursorSpotlight(show) {
        if (this.cursorSpotlight) {
            this.cursorSpotlight.style.opacity = show ? '1' : '0';
        }
    }
    
    /**
     * Observador circadiano (cada minuto)
     */
    startCircadianWatcher() {
        setInterval(() => {
            if (!this.isManualOverride) {
                const detectedMode = this.detectCircadianMode();
                if (detectedMode !== this.currentMode) {
                    this.applyMode(detectedMode, true);
                    console.log(`🌓 Cambio circadiano automático: ${detectedMode}`);
                }
            }
        }, 60000); // Cada minuto
    }
    
    /**
     * Persistencia
     */
    savePreference(mode, isManual) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
            mode,
            isManualOverride: isManual,
            timestamp: Date.now()
        }));
    }
    
    loadPreference() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                // Expirar override manual después de 12 horas
                if (parsed.isManualOverride && Date.now() - parsed.timestamp > 12 * 60 * 60 * 1000) {
                    return null;
                }
                return parsed;
            }
        } catch (e) {
            console.warn('Error loading modo-dual preference', e);
        }
        return null;
    }
    
    /**
     * API pública
     */
    setMode(mode) {
        if (['luz', 'tiniebla'].includes(mode)) {
            this.isManualOverride = true;
            this.applyMode(mode, true);
            this.savePreference(mode, true);
        }
    }
    
    getMode() {
        return this.currentMode;
    }
    
    resetToCircadian() {
        this.isManualOverride = false;
        localStorage.removeItem(this.STORAGE_KEY);
        const mode = this.detectCircadianMode();
        this.applyMode(mode, true);
    }
}

// ═══════════════════════════════════════════════════════════════════
// TRANSICIONES ORGÁNICAS ENTRE RUTAS
// ═══════════════════════════════════════════════════════════════════

class OrganicPageTransitions {
    constructor() {
        this.overlay = null;
        this.init();
    }
    
    init() {
        // Crear overlay de transición
        this.overlay = document.createElement('div');
        this.overlay.className = 'page-transition-overlay';
        document.body.appendChild(this.overlay);
        
        // Interceptar clicks en enlaces internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link && !link.classList.contains('no-transition')) {
                e.preventDefault();
                this.transitionTo(link.getAttribute('href'), e);
            }
        });
    }
    
    transitionTo(href, event) {
        const rect = event?.target?.getBoundingClientRect?.();
        
        if (rect) {
            this.overlay.style.setProperty('--transition-origin-x', `${rect.left + rect.width / 2}px`);
            this.overlay.style.setProperty('--transition-origin-y', `${rect.top + rect.height / 2}px`);
        }
        
        // Animación de salida (carbón difuminándose)
        this.overlay.classList.add('carbon-dissolve');
        
        setTimeout(() => {
            // Navegar después de la mitad de la animación
            window.location.hash = href;
            
            setTimeout(() => {
                this.overlay.classList.remove('carbon-dissolve');
            }, 800);
        }, 400);
    }
}

// ═══════════════════════════════════════════════════════════════════
// INICIALIZACIÓN
// ═══════════════════════════════════════════════════════════════════

let modoDualController = null;
let organicTransitions = null;

document.addEventListener('DOMContentLoaded', () => {
    modoDualController = new ModoDualController();
    organicTransitions = new OrganicPageTransitions();
    
    // Exponer API global
    window.NaroaModo = {
        toggle: () => modoDualController.toggle(),
        setMode: (mode) => modoDualController.setMode(mode),
        getMode: () => modoDualController.getMode(),
        resetToCircadian: () => modoDualController.resetToCircadian()
    };
});

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModoDualController, OrganicPageTransitions };
}
