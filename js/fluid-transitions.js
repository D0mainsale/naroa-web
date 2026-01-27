/**
 * NAROA.ONLINE - Sistema de Transiciones Fluidas
 * No hay "carga", todo fluye
 */

class FluidTransitions {
  constructor(options = {}) {
    this.duration = options.duration || 800;
    this.easing = options.easing || 'cubic-bezier(0.16, 1, 0.3, 1)';
    this.overlay = null;
    this.isTransitioning = false;
    
    this.init();
  }
  
  init() {
    // Crear overlay de transición
    this.createOverlay();
    
    // Interceptar todos los links internos
    this.interceptLinks();
    
    // Manejar botón atrás/adelante
    window.addEventListener('popstate', () => this.handlePopState());
    
    // Animación de entrada inicial
    this.animateIn();
  }
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'page-transition-overlay';
    this.overlay.innerHTML = `
      <div class="transition-wipe"></div>
      <div class="transition-content">
        <span class="transition-text">Naroa</span>
      </div>
    `;
    document.body.appendChild(this.overlay);
    
    // Estilos inline para independencia
    const style = document.createElement('style');
    style.textContent = `
      .page-transition-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        pointer-events: none;
        overflow: hidden;
      }
      
      .transition-wipe {
        position: absolute;
        inset: 0;
        background: #0d0d0f;
        transform: translateY(100%);
        transition: transform ${this.duration}ms ${this.easing};
      }
      
      .transition-wipe.active {
        transform: translateY(0);
      }
      
      .transition-wipe.exit {
        transform: translateY(-100%);
      }
      
      .transition-content {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 300ms ease;
      }
      
      .transition-content.visible {
        opacity: 1;
      }
      
      .transition-text {
        font-family: 'Cormorant Garamond', Georgia, serif;
        font-size: 3rem;
        font-weight: 300;
        letter-spacing: 0.2em;
        color: #f0f0f4;
        text-transform: uppercase;
      }
      
      /* Animación de entrada de página */
      .page-enter {
        opacity: 0;
        transform: translateY(30px);
      }
      
      .page-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition: opacity ${this.duration}ms ${this.easing},
                    transform ${this.duration}ms ${this.easing};
      }
      
      /* Animación de salida de página */
      .page-exit {
        opacity: 1;
      }
      
      .page-exit-active {
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 300ms ease,
                    transform 300ms ease;
      }
    `;
    document.head.appendChild(style);
  }
  
  interceptLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Solo interceptar links internos
      if (href.startsWith('http') && !href.includes(window.location.host)) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('mailto:')) return;
      if (href.startsWith('tel:')) return;
      if (link.hasAttribute('download')) return;
      if (link.target === '_blank') return;
      
      e.preventDefault();
      this.navigateTo(href);
    });
  }
  
  async navigateTo(url) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    const wipe = this.overlay.querySelector('.transition-wipe');
    const content = this.overlay.querySelector('.transition-content');
    
    // 1. Fade out página actual
    document.body.classList.add('page-exit');
    await this.wait(50);
    document.body.classList.add('page-exit-active');
    
    // 2. Wipe entra
    await this.wait(200);
    wipe.classList.add('active');
    
    // 3. Mostrar texto de transición
    await this.wait(this.duration / 2);
    content.classList.add('visible');
    
    // 4. Cargar nueva página
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extraer contenido principal
      const newBody = doc.body.innerHTML;
      const newTitle = doc.title;
      
      // Pequeña pausa para que se vea la transición
      await this.wait(300);
      
      // 5. Actualizar URL y contenido
      history.pushState({}, newTitle, url);
      document.title = newTitle;
      
      // Ocultar texto
      content.classList.remove('visible');
      await this.wait(200);
      
      // 6. Actualizar body
      document.body.innerHTML = newBody;
      document.body.appendChild(this.overlay);
      
      // Reinicializar scripts si es necesario
      this.reinitScripts();
      
      // 7. Wipe sale
      wipe.classList.remove('active');
      wipe.classList.add('exit');
      
      // 8. Fade in nueva página
      document.body.classList.add('page-enter');
      await this.wait(50);
      document.body.classList.add('page-enter-active');
      
      await this.wait(this.duration);
      
      // Limpiar clases
      wipe.classList.remove('exit');
      document.body.classList.remove('page-enter', 'page-enter-active', 'page-exit', 'page-exit-active');
      
    } catch (error) {
      console.error('Error loading page:', error);
      window.location.href = url;
    }
    
    this.isTransitioning = false;
  }
  
  handlePopState() {
    this.navigateTo(window.location.href);
  }
  
  animateIn() {
    document.body.classList.add('page-enter');
    requestAnimationFrame(() => {
      document.body.classList.add('page-enter-active');
    });
    
    setTimeout(() => {
      document.body.classList.remove('page-enter', 'page-enter-active');
    }, this.duration);
  }
  
  reinitScripts() {
    // Re-interceptar links después de cambiar contenido
    this.interceptLinks();
    
    // Disparar evento para que otros scripts se reinicialicen
    window.dispatchEvent(new CustomEvent('pageTransitionComplete'));
  }
  
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Auto-inicializar
document.addEventListener('DOMContentLoaded', () => {
  window.fluidTransitions = new FluidTransitions({
    duration: 800,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  });
});

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FluidTransitions;
}
