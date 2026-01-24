/**
 * Commission Workflow - Flujo interactivo para solicitar encargos
 * Formulario paso a paso con timeline visual
 */
class CommissionWorkflow {
  constructor() {
    this.currentStep = 0;
    this.formData = {};
    this.steps = ['tipo', 'detalles', 'referencia', 'contacto', 'confirmacion'];
    this.init();
  }

  init() {
    this.injectStyles();
    this.createTriggerButton();
    console.log('🎨 Commission Workflow ready');
  }

  createTriggerButton() {
    const btn = document.createElement('button');
    btn.className = 'commission-trigger';
    btn.innerHTML = '🎨 Solicitar Encargo';
    btn.addEventListener('click', () => this.openModal());
    document.body.appendChild(btn);
  }

  openModal() {
    if (document.getElementById('commission-modal')) return;
    
    const modal = document.createElement('div');
    modal.id = 'commission-modal';
    modal.className = 'commission-modal';
    modal.innerHTML = `
      <div class="commission-backdrop" onclick="window.commissionWorkflow.closeModal()"></div>
      <div class="commission-content">
        <button class="commission-close" onclick="window.commissionWorkflow.closeModal()">×</button>
        <div class="commission-header">
          <h2>✨ Solicitar un Retrato</h2>
          <p>Cuéntame tu visión y la haré realidad</p>
        </div>
        <div class="commission-timeline">
          ${this.steps.map((s, i) => `<div class="timeline-step ${i === 0 ? 'active' : ''}" data-step="${i}">${i + 1}</div>`).join('')}
        </div>
        <div class="commission-body">${this.renderStep(0)}</div>
        <div class="commission-footer">
          <button class="btn-prev" onclick="window.commissionWorkflow.prevStep()" style="display:none">← Anterior</button>
          <button class="btn-next" onclick="window.commissionWorkflow.nextStep()">Siguiente →</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('open'), 10);
  }

  closeModal() {
    const modal = document.getElementById('commission-modal');
    if (modal) {
      modal.classList.remove('open');
      setTimeout(() => modal.remove(), 300);
    }
    this.currentStep = 0;
    this.formData = {};
  }

  renderStep(step) {
    const steps = [
      `<div class="step-content">
        <h3>¿Qué tipo de obra buscas?</h3>
        <div class="option-grid">
          <label class="option-card"><input type="radio" name="tipo" value="retrato"> 👤 Retrato Individual</label>
          <label class="option-card"><input type="radio" name="tipo" value="pareja"> 💑 Retrato de Pareja</label>
          <label class="option-card"><input type="radio" name="tipo" value="familia"> 👨‍👩‍👧 Retrato Familiar</label>
          <label class="option-card"><input type="radio" name="tipo" value="mascota"> 🐕 Mascota</label>
          <label class="option-card"><input type="radio" name="tipo" value="otro"> 🎨 Otro / Arte Abstracto</label>
        </div>
      </div>`,
      `<div class="step-content">
        <h3>Detalles de tu encargo</h3>
        <div class="form-group">
          <label>Tamaño aproximado</label>
          <select name="tamano"><option>Pequeño (30x40cm)</option><option>Mediano (50x70cm)</option><option>Grande (70x100cm)</option><option>Personalizado</option></select>
        </div>
        <div class="form-group">
          <label>Estilo preferido</label>
          <select name="estilo"><option>Hiperrealista</option><option>Expresionista</option><option>Pop Art</option><option>A tu criterio</option></select>
        </div>
        <div class="form-group">
          <label>Cuéntame más (opcional)</label>
          <textarea name="notas" placeholder="Colores preferidos, ambiente, historia detrás..."></textarea>
        </div>
      </div>`,
      `<div class="step-content">
        <h3>Foto de referencia</h3>
        <p>Sube la foto que quieres que use como base</p>
        <div class="upload-zone" onclick="document.getElementById('photo-upload').click()">
          <input type="file" id="photo-upload" accept="image/*" hidden>
          <span>📷 Arrastra o haz clic para subir</span>
        </div>
        <p class="hint">Formatos: JPG, PNG. Máx 10MB. La calidad de la foto influye en el resultado.</p>
      </div>`,
      `<div class="step-content">
        <h3>¿Cómo te contacto?</h3>
        <div class="form-group"><label>Nombre</label><input type="text" name="nombre" placeholder="Tu nombre"></div>
        <div class="form-group"><label>Email</label><input type="email" name="email" placeholder="tu@email.com"></div>
        <div class="form-group"><label>Teléfono (opcional)</label><input type="tel" name="telefono" placeholder="+34..."></div>
      </div>`,
      `<div class="step-content confirmation">
        <div class="success-icon">🎉</div>
        <h3>¡Solicitud enviada!</h3>
        <p>Te responderé en 24-48 horas con un presupuesto personalizado.</p>
        <p class="small">Revisa tu email (y spam) por si acaso 😉</p>
      </div>`
    ];
    return steps[step] || steps[0];
  }

  nextStep() {
    this.saveCurrentData();
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.updateUI();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateUI();
    }
  }

  updateUI() {
    const body = document.querySelector('.commission-body');
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    
    if (body) body.innerHTML = this.renderStep(this.currentStep);
    if (prevBtn) prevBtn.style.display = this.currentStep > 0 ? 'block' : 'none';
    if (nextBtn) {
      nextBtn.textContent = this.currentStep === this.steps.length - 2 ? 'Enviar ✨' : 'Siguiente →';
      nextBtn.style.display = this.currentStep === this.steps.length - 1 ? 'none' : 'block';
    }
    
    document.querySelectorAll('.timeline-step').forEach((s, i) => {
      s.classList.toggle('active', i <= this.currentStep);
      s.classList.toggle('current', i === this.currentStep);
    });
  }

  saveCurrentData() {
    const inputs = document.querySelectorAll('.commission-body input, .commission-body select, .commission-body textarea');
    inputs.forEach(input => {
      if (input.type === 'radio' && input.checked) this.formData[input.name] = input.value;
      else if (input.type !== 'radio') this.formData[input.name] = input.value;
    });
  }

  injectStyles() {
    if (document.getElementById('commission-css')) return;
    const css = document.createElement('style');
    css.id = 'commission-css';
    css.textContent = `
      .commission-trigger{position:fixed;bottom:100px;right:20px;padding:12px 24px;background:linear-gradient(135deg,#d4af37,#b8962e);color:#000;border:none;border-radius:50px;font-weight:600;cursor:pointer;z-index:999;box-shadow:0 4px 20px rgba(212,175,55,.4);transition:all .3s}
      .commission-trigger:hover{transform:translateY(-3px);box-shadow:0 6px 30px rgba(212,175,55,.5)}
      .commission-modal{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s}
      .commission-modal.open{opacity:1;pointer-events:all}
      .commission-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.8);backdrop-filter:blur(5px)}
      .commission-content{position:relative;width:90%;max-width:550px;max-height:90vh;overflow-y:auto;background:#1a1a2e;border:1px solid rgba(212,175,55,.3);border-radius:20px;padding:2rem;transform:scale(.9);transition:transform .3s}
      .commission-modal.open .commission-content{transform:scale(1)}
      .commission-close{position:absolute;top:15px;right:15px;width:35px;height:35px;border:none;background:rgba(255,255,255,.1);color:#fff;font-size:1.5rem;border-radius:50%;cursor:pointer}
      .commission-header{text-align:center;margin-bottom:1.5rem}
      .commission-header h2{color:#d4af37;font-size:1.8rem;margin-bottom:.5rem}
      .commission-header p{color:rgba(255,255,255,.6)}
      .commission-timeline{display:flex;justify-content:center;gap:1rem;margin-bottom:2rem}
      .timeline-step{width:35px;height:35px;border-radius:50%;background:rgba(255,255,255,.1);color:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-weight:600;transition:all .3s}
      .timeline-step.active{background:rgba(212,175,55,.2);color:#d4af37}
      .timeline-step.current{background:#d4af37;color:#000;transform:scale(1.1)}
      .step-content h3{color:#fff;margin-bottom:1rem}
      .option-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.8rem}
      .option-card{padding:1rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;cursor:pointer;text-align:center;color:#fff;transition:all .3s}
      .option-card:hover,.option-card:has(input:checked){background:rgba(212,175,55,.1);border-color:#d4af37}
      .option-card input{display:none}
      .form-group{margin-bottom:1rem}
      .form-group label{display:block;color:rgba(255,255,255,.7);margin-bottom:.4rem;font-size:.9rem}
      .form-group input,.form-group select,.form-group textarea{width:100%;padding:.8rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-size:1rem}
      .form-group textarea{min-height:80px;resize:vertical}
      .upload-zone{padding:3rem;border:2px dashed rgba(212,175,55,.3);border-radius:15px;text-align:center;cursor:pointer;transition:all .3s;color:rgba(255,255,255,.6)}
      .upload-zone:hover{border-color:#d4af37;background:rgba(212,175,55,.05)}
      .hint{font-size:.8rem;color:rgba(255,255,255,.4);margin-top:.5rem}
      .commission-footer{display:flex;justify-content:space-between;margin-top:2rem;gap:1rem}
      .btn-prev,.btn-next{padding:.8rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-weight:600;transition:all .3s}
      .btn-prev{background:rgba(255,255,255,.1);color:#fff}
      .btn-next{background:#d4af37;color:#000;margin-left:auto}
      .btn-next:hover{background:#e5c349}
      .confirmation{text-align:center}
      .success-icon{font-size:4rem;margin-bottom:1rem}
      .confirmation h3{color:#d4af37}
      .confirmation .small{color:rgba(255,255,255,.5);font-size:.9rem}
    `;
    document.head.appendChild(css);
  }
}

window.addEventListener('DOMContentLoaded', () => { window.commissionWorkflow = new CommissionWorkflow(); });
