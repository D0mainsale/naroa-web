// === LUNAR MODE - Modo Luna Llena ===
// Estética mística que se activa durante la luna llena real
// Algoritmo astronómico de Conway para cálculo de fase lunar

class LunarMode {
    constructor() {
        this.isFullMoon = false;
        this.forced = false;
        this.indicator = null;
        
        // Check inicial
        this.checkLunarPhase();
        
        // Re-check cada hora
        setInterval(() => this.checkLunarPhase(), 60 * 60 * 1000);
        
        console.log('🌕 LunarMode initialized');
    }
    
    /**
     * Algoritmo de Conway modificado para calcular fase lunar
     * Retorna un valor de 0-29 donde ~14-16 = luna llena
     */
    getMoonPhase(date = new Date()) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Ajuste para enero y febrero
        let y = year;
        let m = month;
        if (month < 3) {
            y -= 1;
            m += 12;
        }
        
        // Algoritmo de Conway simplificado
        const c = Math.floor(y / 100);
        const n = year - 19 * Math.floor(year / 19);
        const k = Math.floor((c - 17) / 25);
        let i = c - Math.floor(c / 4) - Math.floor((c - k) / 3) + 19 * n + 15;
        i = i - 30 * Math.floor(i / 30);
        i = i - Math.floor(i / 28) * (1 - Math.floor(i / 28) * Math.floor(29 / (i + 1)) * Math.floor((21 - n) / 11));
        let j = year + Math.floor(year / 4) + i + 2 - c + Math.floor(c / 4);
        j = j - 7 * Math.floor(j / 7);
        const l = i - j;
        const moonPhase = month + day + l + 1;
        
        // Normalizar a 0-29
        return ((moonPhase % 30) + 30) % 30;
    }
    
    /**
     * Determina si es luna llena (fase 14-16 de 30)
     * Con margen de ±1.5 días
     */
    isFullMoonPhase() {
        const phase = this.getMoonPhase();
        // Luna llena aproximada: fase 14-16
        return phase >= 13 && phase <= 17;
    }
    
    /**
     * Check y aplicar modo lunar
     */
    checkLunarPhase() {
        if (this.forced) return; // Si está forzado, no recalcular
        
        const wasFullMoon = this.isFullMoon;
        this.isFullMoon = this.isFullMoonPhase();
        
        if (this.isFullMoon !== wasFullMoon) {
            this.applyMode(this.isFullMoon);
        }
        
        // Log para debugging
        const phase = this.getMoonPhase();
        console.log(`🌙 Lunar phase: ${phase}/30 | Full Moon: ${this.isFullMoon}`);
    }
    
    /**
     * Aplicar o remover modo luna llena
     */
    applyMode(active) {
        const html = document.documentElement;
        
        if (active) {
            html.classList.add('full-moon-mode');
            this.showIndicator();
            this.dispatchEvent('fullmoon:active');
        } else {
            html.classList.remove('full-moon-mode');
            this.hideIndicator();
            this.dispatchEvent('fullmoon:inactive');
        }
    }
    
    /**
     * Mostrar indicador visual de luna llena
     */
    showIndicator() {
        if (this.indicator) return;
        
        this.indicator = document.createElement('div');
        this.indicator.className = 'lunar-indicator';
        this.indicator.innerHTML = '🌕';
        this.indicator.title = 'Modo Luna Llena activo';
        this.indicator.setAttribute('aria-label', 'Luna llena - modo místico activo');
        
        Object.assign(this.indicator.style, {
            position: 'fixed',
            top: '1rem',
            right: '4rem',
            fontSize: '1.5rem',
            opacity: '0',
            transform: 'scale(0.5)',
            transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
            zIndex: '9999',
            cursor: 'help',
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 200, 0.8))'
        });
        
        document.body.appendChild(this.indicator);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            this.indicator.style.opacity = '1';
            this.indicator.style.transform = 'scale(1)';
        });
        
        // Pulso sutil
        this.startPulse();
    }
    
    /**
     * Ocultar indicador
     */
    hideIndicator() {
        if (!this.indicator) return;
        
        this.indicator.style.opacity = '0';
        this.indicator.style.transform = 'scale(0.5)';
        
        setTimeout(() => {
            if (this.indicator) {
                this.indicator.remove();
                this.indicator = null;
            }
        }, 600);
    }
    
    /**
     * Efecto de pulso en el indicador
     */
    startPulse() {
        if (!this.indicator) return;
        
        const pulse = () => {
            if (!this.indicator) return;
            this.indicator.style.filter = 'drop-shadow(0 0 20px rgba(255, 255, 200, 1))';
            setTimeout(() => {
                if (this.indicator) {
                    this.indicator.style.filter = 'drop-shadow(0 0 10px rgba(255, 255, 200, 0.6))';
                }
            }, 1000);
        };
        
        this.pulseInterval = setInterval(pulse, 3000);
        pulse();
    }
    
    /**
     * Dispatch custom event
     */
    dispatchEvent(name) {
        window.dispatchEvent(new CustomEvent(name, { 
            detail: { phase: this.getMoonPhase() } 
        }));
    }
    
    /**
     * Forzar modo para testing
     * Uso: window.lunarMode.forceFullMoon(true)
     */
    forceFullMoon(active) {
        this.forced = true;
        this.isFullMoon = active;
        this.applyMode(active);
        console.log(`🌕 Forced full moon mode: ${active}`);
    }
    
    /**
     * Reset a detección automática
     */
    resetToAuto() {
        this.forced = false;
        this.checkLunarPhase();
        console.log('🌕 Reset to automatic lunar detection');
    }
    
    /**
     * Obtener info de próxima luna llena
     */
    getNextFullMoon() {
        const today = new Date();
        let checkDate = new Date(today);
        
        for (let i = 0; i < 35; i++) {
            checkDate.setDate(checkDate.getDate() + 1);
            const phase = this.getMoonPhase(checkDate);
            if (phase >= 14 && phase <= 16) {
                return checkDate;
            }
        }
        return null;
    }
}

// === Inicializar y exportar ===
window.LunarMode = LunarMode;

// Auto-init cuando DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.lunarMode = new LunarMode();
    });
} else {
    window.lunarMode = new LunarMode();
}
