/**
 * === SISTEMA DE MODO DUAL ATMOSFÉRICO ===
 * "La Resonancia de la Materia" - Naroa Gutiérrez Gil 2026
 * 
 * Implementa dos estados emocionales:
 * - Estado "Luz" (Público/Expositivo): Cloud Dancer, obra terminada
 * - Estado "Tiniebla" (Íntimo/Procesual): Carbón profundo, proceso creativo
 * 
 * Transición automática según hora local o toggle gestual manual.
 */

class LunarCircadianSystem {
    constructor(options = {}) {
        this.options = {
            autoTransition: true,           // Automático según hora
            transitionDuration: 2000,       // 2s para transiciones suaves
            dawnHour: 7,                    // Inicio de "Luz"
            duskHour: 20,                   // Inicio de "Tiniebla"
            persistPreference: true,        // Guardar en localStorage
            ...options
        };

        this.currentMode = this.loadPreference() || this.calculateMode();
        this.transitioning = false;
        this.listeners = [];

        this.init();
    }

    /**
     * Paleta "Nature Distilled" - Cloud Dancer + Carbón
     */
    static PALETTES = {
        luz: {
            name: 'Luz',
            emotion: 'Público/Expositivo',
            '--bg': '#F5F5F0',              // Cloud Dancer (PANTONE 11-4201)
            '--bg-secondary': '#EAEAE5',     // Cloud Dancer tenue
            '--text': '#2C2C2C',             // Carbón suave
            '--text-secondary': '#4A4A4A',
            '--muted': 'rgba(44, 44, 44, 0.5)',
            '--accent': '#A0522D',           // Siena Tostada
            '--accent-secondary': '#8B4513', // Saddlebrown
            '--red': '#C93030',
            '--surface': 'rgba(255, 255, 255, 0.8)',
            '--surface-blur': 'rgba(245, 245, 240, 0.9)',
            '--border': 'rgba(44, 44, 44, 0.1)',
            '--shadow': 'rgba(0, 0, 0, 0.08)',
            '--glow': 'rgba(160, 82, 45, 0.2)'
        },
        tiniebla: {
            name: 'Tiniebla',
            emotion: 'Íntimo/Procesual',
            '--bg': '#1A1A1A',               // Grafito Profundo
            '--bg-secondary': '#121212',
            '--text': '#F5F5F0',             // Cloud Dancer invertido
            '--text-secondary': '#D0D0CB',
            '--muted': 'rgba(245, 245, 240, 0.5)',
            '--accent': '#CD853F',           // Arcilla/Peru
            '--accent-secondary': '#DEB887', // Burlywood
            '--red': '#E05050',
            '--surface': 'rgba(30, 30, 30, 0.8)',
            '--surface-blur': 'rgba(26, 26, 26, 0.9)',
            '--border': 'rgba(245, 245, 240, 0.08)',
            '--shadow': 'rgba(0, 0, 0, 0.4)',
            '--glow': 'rgba(205, 133, 63, 0.3)'
        }
    };

    init() {
        // Aplicar modo inicial sin transición
        this.applyMode(this.currentMode, false);

        // Crear toggle UI
        this.createToggle();

        // Auto-transición según hora
        if (this.options.autoTransition && !this.loadPreference()) {
            this.startCircadianCycle();
        }

        // Notificar otros sistemas
        this.dispatchModeChange();

        console.log(`🌓 LunarCircadian: Modo "${this.currentMode}" activo`);
    }

    /**
     * Calcula el modo según la hora local
     */
    calculateMode() {
        const hour = new Date().getHours();
        const { dawnHour, duskHour } = this.options;
        return (hour >= dawnHour && hour < duskHour) ? 'luz' : 'tiniebla';
    }

    /**
     * Carga preferencia guardada del usuario
     */
    loadPreference() {
        if (!this.options.persistPreference) return null;
        return localStorage.getItem('naroa-atmosphere-mode');
    }

    /**
     * Guarda preferencia del usuario
     */
    savePreference(mode) {
        if (this.options.persistPreference) {
            localStorage.setItem('naroa-atmosphere-mode', mode);
        }
    }

    /**
     * Limpia preferencia para volver a automático
     */
    clearPreference() {
        localStorage.removeItem('naroa-atmosphere-mode');
        this.currentMode = this.calculateMode();
        this.applyMode(this.currentMode, true);
        this.startCircadianCycle();
    }

    /**
     * Aplica el modo a las CSS variables
     */
    applyMode(mode, animate = true) {
        const palette = LunarCircadianSystem.PALETTES[mode];
        if (!palette) return;

        const root = document.documentElement;
        
        // Añadir clase de transición si es animado
        if (animate) {
            root.classList.add('atmosphere-transitioning');
            this.transitioning = true;
        }

        // Establecer data-mode para selectores CSS externos
        root.setAttribute('data-mode', mode);

        // Aplicar variables CSS
        Object.entries(palette).forEach(([key, value]) => {
            if (key.startsWith('--')) {
                root.style.setProperty(key, value);
            }
        });

        // Limpiar transición después de duración
        if (animate) {
            setTimeout(() => {
                root.classList.remove('atmosphere-transitioning');
                this.transitioning = false;
            }, this.options.transitionDuration);
        }

        this.currentMode = mode;
    }

    /**
     * Toggle entre modos
     */
    toggle() {
        if (this.transitioning) return;

        const newMode = this.currentMode === 'luz' ? 'tiniebla' : 'luz';
        this.applyMode(newMode, true);
        this.savePreference(newMode);
        this.dispatchModeChange();

        // Animación visual del toggle
        this.animateToggleButton(newMode);

        console.log(`🌓 LunarCircadian: Transición a "${newMode}"`);
    }

    /**
     * Crea el botón toggle discreto
     */
    createToggle() {
        // Verificar si ya existe
        if (document.getElementById('atmosphere-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'atmosphere-toggle';
        toggle.className = 'atmosphere-toggle';
        toggle.setAttribute('aria-label', 'Cambiar modo atmosférico');
        toggle.setAttribute('title', 'Luz / Tiniebla');
        
        // Icono según modo actual
        toggle.innerHTML = this.getToggleIcon(this.currentMode);

        toggle.addEventListener('click', () => this.toggle());

        // Estilos inline para evitar dependencias
        Object.assign(toggle.style, {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'var(--surface-blur)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            cursor: 'pointer',
            zIndex: '9000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
            boxShadow: '0 4px 20px var(--shadow)'
        });

        // Hover effect
        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'scale(1.1)';
            toggle.style.boxShadow = '0 8px 30px var(--glow)';
        });
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1)';
            toggle.style.boxShadow = '0 4px 20px var(--shadow)';
        });

        document.body.appendChild(toggle);
    }

    /**
     * Retorna el icono según el modo
     */
    getToggleIcon(mode) {
        return mode === 'luz' ? '☀️' : '🌙';
    }

    /**
     * Anima el botón durante la transición
     */
    animateToggleButton(newMode) {
        const toggle = document.getElementById('atmosphere-toggle');
        if (!toggle) return;

        toggle.style.transform = 'scale(0.8) rotate(180deg)';
        
        setTimeout(() => {
            toggle.innerHTML = this.getToggleIcon(newMode);
            toggle.style.transform = 'scale(1) rotate(0deg)';
        }, this.options.transitionDuration / 2);
    }

    /**
     * Inicia el ciclo circadiano automático
     */
    startCircadianCycle() {
        // Verificar cada minuto
        setInterval(() => {
            if (this.loadPreference()) return; // Usuario tiene preferencia

            const calculatedMode = this.calculateMode();
            if (calculatedMode !== this.currentMode) {
                this.applyMode(calculatedMode, true);
                this.dispatchModeChange();
                console.log(`🌓 LunarCircadian: Auto-transición a "${calculatedMode}"`);
            }
        }, 60000);
    }

    /**
     * Despacha evento de cambio de modo
     */
    dispatchModeChange() {
        const event = new CustomEvent('atmosphere-change', {
            detail: {
                mode: this.currentMode,
                palette: LunarCircadianSystem.PALETTES[this.currentMode]
            }
        });
        document.dispatchEvent(event);

        // Notificar listeners registrados
        this.listeners.forEach(fn => fn(this.currentMode));
    }

    /**
     * Registra un listener para cambios de modo
     */
    onModeChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * API pública: obtener modo actual
     */
    getMode() {
        return this.currentMode;
    }

    /**
     * API pública: establecer modo programáticamente
     */
    setMode(mode) {
        if (mode !== 'luz' && mode !== 'tiniebla') return;
        this.applyMode(mode, true);
        this.savePreference(mode);
        this.dispatchModeChange();
    }
}

/**
 * CSS de transición inyectado dinámicamente
 */
function injectTransitionStyles() {
    if (document.getElementById('atmosphere-transition-styles')) return;

    const style = document.createElement('style');
    style.id = 'atmosphere-transition-styles';
    style.textContent = `
        /* Transición suave entre modos atmosféricos */
        .atmosphere-transitioning,
        .atmosphere-transitioning * {
            transition: 
                background-color 2s cubic-bezier(0.23, 1, 0.32, 1),
                color 2s cubic-bezier(0.23, 1, 0.32, 1),
                border-color 2s cubic-bezier(0.23, 1, 0.32, 1),
                box-shadow 2s cubic-bezier(0.23, 1, 0.32, 1),
                fill 2s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }

        /* Modo Luz - Ajustes específicos */
        [data-mode="luz"] body {
            background: var(--bg);
            color: var(--text);
        }

        [data-mode="luz"] .cursor {
            background: var(--accent);
        }

        /* Modo Tiniebla - Ajustes específicos */
        [data-mode="tiniebla"] body {
            background: var(--bg);
            color: var(--text);
        }

        [data-mode="tiniebla"] .cursor {
            background: var(--accent);
        }

        /* Respeto por preferencias del sistema */
        @media (prefers-reduced-motion: reduce) {
            .atmosphere-transitioning,
            .atmosphere-transitioning * {
                transition: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Auto-inicialización
document.addEventListener('DOMContentLoaded', () => {
    injectTransitionStyles();
    
    // Exponer globalmente
    window.NaroaAtmosphere = new LunarCircadianSystem();
});

// Export para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LunarCircadianSystem };
}
