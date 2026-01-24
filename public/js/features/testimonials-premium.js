/**
 * Testimonials Premium - Carrusel dinámico con diseño elegante
 */
class TestimonialsPremium {
  constructor() {
    this.testimonials = [];
    this.currentIndex = 0;
    this.autoplayInterval = null;
    this.init();
  }

  async init() {
    await this.loadTestimonials();
    this.injectStyles();
    this.createUI();
    this.bindEvents();
    this.startAutoplay();
    console.log('✨ Testimonials Premium initialized');
  }

  async loadTestimonials() {
    try {
      const res = await fetch('/data/testimonials.json');
      this.testimonials = await res.json();
    } catch (e) {
      this.testimonials = [{
        author: "Siarte Leku", role: "Galería", avatar: "🎨",
        quote: "Su obra es un abrazo visual.", rating: 5
      }];
    }
  }

  createUI() {
    const section = document.createElement('section');
    section.id = 'testimonials-section';
    section.className = 'testimonials-premium';
    
    section.innerHTML = `
      <div class="testimonials-container">
        <div class="testimonials-header">
          <span class="testimonials-badge">💬 Voces</span>
          <h2>Lo que dicen de mi trabajo</h2>
        </div>
        <div class="testimonials-carousel">
          <div class="testimonials-track">
            ${this.testimonials.map((t, i) => `
              <div class="testimonial-card ${i === 0 ? 'active' : ''}" data-index="${i}">
                <div class="quote-mark">"</div>
                <blockquote>${t.quote}</blockquote>
                <div class="author">
                  <span class="avatar">${t.avatar}</span>
                  <div class="info">
                    <strong>${t.author}</strong>
                    <span>${t.role}</span>
                  </div>
                  <span class="stars">${'★'.repeat(t.rating)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="nav-controls">
            <button class="nav-btn prev">‹</button>
            <div class="dots">${this.testimonials.map((_, i) => 
              `<span class="dot ${i === 0 ? 'active' : ''}" data-i="${i}"></span>`
            ).join('')}</div>
            <button class="nav-btn next">›</button>
          </div>
        </div>
      </div>`;
    
    const target = document.querySelector('#about-view') || document.querySelector('footer');
    if (target?.parentNode) target.parentNode.insertBefore(section, target);
    else document.body.appendChild(section);
  }

  bindEvents() {
    const s = document.getElementById('testimonials-section');
    if (!s) return;
    s.querySelector('.prev')?.addEventListener('click', () => this.prev());
    s.querySelector('.next')?.addEventListener('click', () => this.next());
    s.querySelectorAll('.dot').forEach(d => d.addEventListener('click', e => this.goTo(+e.target.dataset.i)));
    s.addEventListener('mouseenter', () => this.stopAutoplay());
    s.addEventListener('mouseleave', () => this.startAutoplay());
  }

  next() { this.goTo((this.currentIndex + 1) % this.testimonials.length); }
  prev() { this.goTo((this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length); }
  
  goTo(i) {
    document.querySelectorAll('.testimonial-card').forEach((c, idx) => c.classList.toggle('active', idx === i));
    document.querySelectorAll('.dot').forEach((d, idx) => d.classList.toggle('active', idx === i));
    this.currentIndex = i;
  }

  startAutoplay() {
    if (this.autoplayInterval) return;
    this.autoplayInterval = setInterval(() => this.next(), 6000);
  }
  stopAutoplay() { clearInterval(this.autoplayInterval); this.autoplayInterval = null; }

  injectStyles() {
    if (document.getElementById('testimonials-css')) return;
    const css = document.createElement('style');
    css.id = 'testimonials-css';
    css.textContent = `
      .testimonials-premium{padding:5rem 2rem;background:linear-gradient(180deg,rgba(10,10,20,.95),rgba(20,15,30,.98));position:relative}
      .testimonials-container{max-width:900px;margin:0 auto;text-align:center}
      .testimonials-badge{display:inline-block;padding:.5rem 1.5rem;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);border-radius:50px;color:#d4af37;margin-bottom:1rem}
      .testimonials-header h2{font-size:2.5rem;font-weight:300;color:#fff;font-family:'Cormorant Garamond',serif}
      .testimonials-carousel{position:relative;min-height:250px}
      .testimonials-track{position:relative;display:flex;justify-content:center;min-height:220px}
      .testimonial-card{position:absolute;width:100%;max-width:650px;padding:2rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:20px;opacity:0;transform:translateX(60px);transition:all .5s ease;pointer-events:none}
      .testimonial-card.active{opacity:1;transform:translateX(0);pointer-events:all}
      .quote-mark{font-size:4rem;color:rgba(212,175,55,.2);line-height:1;position:absolute;top:10px;left:20px}
      blockquote{font-size:1.2rem;line-height:1.7;color:rgba(255,255,255,.9);font-style:italic;margin:1rem 0 1.5rem;padding-left:1rem}
      .author{display:flex;align-items:center;gap:1rem;justify-content:center}
      .avatar{width:45px;height:45px;background:rgba(212,175,55,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;border:2px solid rgba(212,175,55,.3)}
      .info{text-align:left}
      .info strong{display:block;color:#fff}
      .info span{color:rgba(255,255,255,.5);font-size:.9rem}
      .stars{color:#d4af37;font-size:1rem}
      .nav-controls{display:flex;justify-content:center;align-items:center;gap:1rem;margin-top:1.5rem}
      .nav-btn{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#fff;font-size:1.5rem;cursor:pointer;transition:all .3s}
      .nav-btn:hover{background:rgba(212,175,55,.2);border-color:rgba(212,175,55,.5)}
      .dots{display:flex;gap:.4rem}
      .dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.2);cursor:pointer;transition:all .3s}
      .dot.active{background:#d4af37;transform:scale(1.3)}
    `;
    document.head.appendChild(css);
  }
}

window.addEventListener('DOMContentLoaded', () => { window.testimonialsPremium = new TestimonialsPremium(); });
