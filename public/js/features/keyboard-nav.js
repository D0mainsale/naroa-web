/**
 * KEYBOARD NAVIGATION - Navegación por teclado avanzada
 * Navigate with arrows, numbers, and vim keys
 * v1.0.0
 */
class KeyboardNav {
    constructor() {
        this.focusableSelector = 'a, button, [role="button"], .portfolio-card, .nav-link';
        this.views = ['/', '/portfolio', '/process', '/bitacora', '/retrato', '/about', '/tienda', '/ritual'];
        this.init();
    }
    
    init() {
        this.addStyles();
        document.addEventListener('keydown', (e) => this.handleKey(e));
        console.log('⌨️ Keyboard Navigation initialized');
    }
    
    handleKey(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch(e.key) {
            case 'ArrowRight':
            case 'l':
                e.preventDefault();
                this.navSection(1);
                break;
            case 'ArrowLeft':
            case 'h':
                e.preventDefault();
                this.navSection(-1);
                break;
            case 'ArrowDown':
            case 'j':
                e.preventDefault();
                this.navFocus(1);
                break;
            case 'ArrowUp':
            case 'k':
                e.preventDefault();
                this.navFocus(-1);
                break;
            case 'Enter':
                if (document.activeElement.click) document.activeElement.click();
                break;
            case 'Escape':
                this.goHome();
                break;
            case '1': case '2': case '3': case '4': case '5': case '6': case '7':
                e.preventDefault();
                this.goToView(parseInt(e.key));
                break;
            case '?':
                this.showHelp();
                break;
        }
    }
    
    navSection(dir) {
        const current = window.location.hash.replace('#', '') || '/';
        const idx = this.views.indexOf(current);
        const next = (idx + dir + this.views.length) % this.views.length;
        window.location.hash = '#' + this.views[next];
    }
    
    navFocus(dir) {
        const els = Array.from(document.querySelectorAll(this.focusableSelector))
            .filter(el => el.offsetParent !== null);
        const current = els.indexOf(document.activeElement);
        const next = (current + dir + els.length) % els.length;
        els[next]?.focus();
    }
    
    goHome() {
        window.location.hash = '#/';
    }
    
    goToView(num) {
        if (this.views[num]) window.location.hash = '#' + this.views[num];
    }
    
    showHelp() {
        if (document.getElementById('kbd-help')) return;
        const help = document.createElement('div');
        help.id = 'kbd-help';
        help.innerHTML = `
            <div class="kbd-modal">
                <h3>⌨️ Atajos de Teclado</h3>
                <ul>
                    <li><kbd>←</kbd> <kbd>→</kbd> Navegar secciones</li>
                    <li><kbd>↑</kbd> <kbd>↓</kbd> Navegar elementos</li>
                    <li><kbd>1-7</kbd> Ir a sección</li>
                    <li><kbd>Esc</kbd> Volver al inicio</li>
                    <li><kbd>Enter</kbd> Seleccionar</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()">Cerrar</button>
            </div>
        `;
        document.body.appendChild(help);
    }
    
    addStyles() {
        if (document.getElementById('kbd-nav-styles')) return;
        const s = document.createElement('style');
        s.id = 'kbd-nav-styles';
        s.textContent = `
            #kbd-help{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center}
            .kbd-modal{background:#fff;padding:2rem;border-radius:12px;max-width:320px}
            .kbd-modal h3{margin:0 0 1rem}
            .kbd-modal ul{padding-left:0;list-style:none}
            .kbd-modal li{margin:.5rem 0}
            .kbd-modal kbd{background:#eee;padding:2px 8px;border-radius:4px;font-family:monospace}
            .kbd-modal button{margin-top:1rem;padding:8px 16px;cursor:pointer}
            :focus{outline:3px solid #0066CC;outline-offset:2px}
        `;
        document.head.appendChild(s);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.keyboardNav = new KeyboardNav(); });
} else {
    window.keyboardNav = new KeyboardNav();
}
