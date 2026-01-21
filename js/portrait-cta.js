/**
 * PORTRAIT CTA - Call to Action sin culpa
 * Visible pero respetuoso
 */

class PortraitCTA {
  constructor() {
    this.visible = false;
    this.plazasDisponibles = 3; // Escasez controlada
    this.tiempoEstimado = '2-3 semanas';
    this.init();
  }

  init() {
    this.createCTA();
    this.setupVisibilityTrigger();
  }

  createCTA() {
    const cta = document.createElement('div');
    cta.className = 'portrait-cta';
    cta.id = 'portrait-cta';
    
    cta.innerHTML = `
      <div class="portrait-cta-content">
        <div class="portrait-cta-close" aria-label="Cerrar">×</div>
        
        <div class="portrait-cta-icon">🎨</div>
        
        <h3 class="portrait-cta-title">Retratos personalizados</h3>
        
        <p class="portrait-cta-description">
          Creación única, técnica mixta, entregada con cuidado
        </p>
        
        <div class="portrait-cta-meta">
          <span class="meta-item">
            <span class="meta-icon">⏱</span>
            ${this.tiempoEstimado}
          </span>
          <span class="meta-item meta-highlight">
            <span class="meta-icon">✨</span>
            Solo ${this.plazasDisponibles} plazas
          </span>
        </div>
        
        <div class="portrait-cta-buttons">
          <a href="mailto:naroa@naroa.online?subject=Quiero un retrato" 
             class="portrait-cta-btn portrait-cta-btn--primary">
            Quiero un retrato
          </a>
          <a href="mailto:naroa@naroa.online?subject=Consulta sobre retratos" 
             class="portrait-cta-btn portrait-cta-btn--secondary">
            Hablemos
          </a>
        </div>
        
        <p class="portrait-cta-note">
          Respondo personalmente a cada consulta
        </p>
      </div>
    `;
    
    document.body.appendChild(cta);
    
    // Close button
    cta.querySelector('.portrait-cta-close').addEventListener('click', () => {
      this.hide();
    });
    
    // Close on outside click
    cta.addEventListener('click', (e) => {
      if (e.target === cta) {
        this.hide();
      }
    });
  }

  setupVisibilityTrigger() {
    let scrollCount = 0;
    let lastScrollTime = Date.now();
    
    window.addEventListener('scroll', () => {
      const now = Date.now();
      
      // Show after user has scrolled 3 times (showing interest)
      if (now - lastScrollTime > 1000) {
        scrollCount++;
        lastScrollTime = now;
      }
      
      if (scrollCount >= 3 && !this.visible && !this.isDismissed()) {
        // Show with delay (no agresivo)
        setTimeout(() => this.show(), 2000);
      }
    });
    
    // Also show after 30s on page (gentle reminder)
    setTimeout(() => {
      if (!this.visible && !this.isDismissed()) {
        this.show();
      }
    }, 30000);
  }

  show() {
    const cta = document.getElementById('portrait-cta');
    if (cta) {
      cta.classList.add('visible');
      this.visible = true;
    }
  }

  hide() {
    const cta = document.getElementById('portrait-cta');
    if (cta) {
      cta.classList.remove('visible');
      this.visible = false;
      this.markAsDismissed();
    }
  }

  markAsDismissed() {
    localStorage.setItem('portrait-cta-dismissed', Date.now().toString());
  }

  isDismissed() {
    const dismissed = localStorage.getItem('portrait-cta-dismissed');
    if (!dismissed) return false;
    
    // Show again after 7 days
    const dismissedTime = parseInt(dismissed);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - dismissedTime) < sevenDays;
  }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  window.portraitCTA = new PortraitCTA();
});
