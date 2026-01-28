/**
 * ════════════════════════════════════════════════════════════════════════
 * RITUAL DE ADQUISICIÓN (2026)
 * "El intercambio no es una transacción, es un vínculo."
 * 
 * Gestiona el flujo de "checkout" ceremonial:
 * 1. La Pausa (Confirmación consciente).
 * 2. El Vínculo (Input del nombre para el certificado).
 * 3. La Promesa (Generación simulada de contrato/certificado).
 * ════════════════════════════════════════════════════════════════════════
 */

class RitualCheckout {
    constructor() {
        this.active = false;
        this.overlay = null;
        this.steps = ['pause', 'bond', 'promise'];
        this.currentStep = 0;
        this.artworkData = null;
        
        this.init();
    }

    init() {
        this.createOverlay();
        this.bindGlobalTriggers();
        console.log('📜 Ritual de Adquisición: Preparado');
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'ritual-checkout-overlay';
        this.overlay.className = 'ritual-overlay hidden';
        this.overlay.innerHTML = `
            <div class="ritual-container">
                <button class="ritual-close-btn" aria-label="Cancelar ritual">✕</button>
                
                <!-- STEP 1: LA PAUSA -->
                <div class="ritual-step" data-step="0">
                    <h2 class="ritual-title font-display">La Elección</h2>
                    <div class="ritual-artwork-preview">
                        <!-- Imagen dinámica -->
                        <div class="ritual-img-container"></div>
                    </div>
                    <p class="ritual-text">
                        Has detenido tu mirada en esta pieza.<br>
                        ¿Deseas iniciar el proceso de custodia?
                    </p>
                    <button class="ritual-cta" data-action="next">Sí, deseo custodiarla</button>
                </div>

                <!-- STEP 2: EL VÍNCULO -->
                <div class="ritual-step hidden" data-step="1">
                    <h2 class="ritual-title font-display">El Vínculo</h2>
                    <p class="ritual-text">
                        Cada obra es única, como quien la posee.<br>
                        ¿A quién pertenecerá este fragmento de tiempo?
                    </p>
                    <div class="ritual-input-group">
                        <input type="text" id="custodian-name" placeholder="Tu nombre completo" class="ritual-input font-display">
                        <span class="ritual-input-line"></span>
                    </div>
                    <p class="ritual-note text-gloss">Se inscribirá en el Certificado de Autenticidad Digital</p>
                    <button class="ritual-cta" data-action="next">Sellar Vínculo</button>
                </div>

                <!-- STEP 3: LA PROMESA -->
                <div class="ritual-step hidden" data-step="2">
                    <h2 class="ritual-title font-display">La Promesa</h2>
                    <div class="ritual-certificate">
                        <div class="cert-border">
                            <span class="cert-icon">◈</span>
                            <h3 class="cert-title">Certificado de Origen</h3>
                            <p class="cert-body">
                                Yo, Naroa Gutiérrez Gil, certifico que la obra<br>
                                <span class="cert-artwork-name"></span><br>
                                pasará a manos de<br>
                                <span class="cert-custodian-name"></span>
                            </p>
                            <div class="cert-sig">Naroa G.G.</div>
                        </div>
                    </div>
                    <button class="ritual-cta ritual-cta--final" data-action="finish">Completar Adquisición</button>
                </div>
            </div>
            <div class="ritual-bg-texture"></div>
        `;
        document.body.appendChild(this.overlay);
        
        // Estilos CSS inyectados para el checkout (o podrían ir en un .css aparte)
        const style = document.createElement('style');
        style.textContent = `
            .ritual-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: var(--color-cloud-dancer, #f4f3f0);
                z-index: 10001; /* Encima de todo */
                display: flex; justify-content: center; align-items: center;
                opacity: 0; pointer-events: none;
                transition: opacity 0.8s var(--ease, ease-out);
            }
            .ritual-overlay.active {
                opacity: 1; pointer-events: auto;
            }
            .ritual-container {
                position: relative; z-index: 2;
                width: 90%; max-width: 600px;
                text-align: center; color: var(--color-charcoal, #1a1a1a);
            }
            .ritual-bg-texture {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background-image: url('/images/textures/paper-grain.png'), radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.05) 100%);
                opacity: 0.5; z-index: 1; pointer-events: none;
            }
            .ritual-title {
                font-size: 3rem; margin-bottom: 2rem;
                color: var(--color-sienna-toasted, #D4A574);
            }
            .ritual-text {
                font-family: var(--font-body); font-size: 1.2rem; margin-bottom: 2rem;
                line-height: 1.6;
            }
            .ritual-cta {
                background: transparent; border: 1px solid currentColor;
                padding: 1rem 3rem; font-size: 1rem; cursor: pointer;
                transition: all 0.3s ease;
                font-family: var(--font-display);
                letter-spacing: 0.1em; text-transform: uppercase;
            }
            .ritual-cta:hover {
                background: var(--color-charcoal, #1a1a1a);
                color: var(--color-cloud-dancer, #f4f3f0);
            }
            .ritual-close-btn {
                position: absolute; top: -3rem; right: 0;
                background: none; border: none; font-size: 2rem; cursor: pointer;
                color: var(--color-charcoal, #1a1a1a); opacity: 0.5;
            }
            .hidden { display: none; }
            .ritual-input {
                background: transparent; border: none; border-bottom: 1px solid currentColor;
                width: 100%; text-align: center; font-size: 2rem; padding: 0.5rem;
                outline: none; color: var(--color-charcoal, #1a1a1a);
            }
            .ritual-certificate {
                border: 1px solid rgba(0,0,0,0.1); padding: 2rem; margin: 2rem 0;
                background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                transform: rotate(-1deg);
            }
        `;
        document.head.appendChild(style);
        
        // Event Listeners internos
        this.overlay.querySelector('.ritual-close-btn').addEventListener('click', () => this.close());
        
        this.overlay.querySelectorAll('[data-action="next"]').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
        
        this.overlay.querySelector('[data-action="finish"]').forEach(btn => {
           btn.addEventListener('click', () => {
               window.open('mailto:naroa@naroa.online?subject=Custodia%20de%20Obra&body=Deseo%20finalizar%20el%20ritual.', '_blank');
               this.close();
           }); 
        });
    }

    bindGlobalTriggers() {
        // Delegación de eventos para botones de "Comprar" o "Encargar"
        document.body.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-ritual="purchase"]');
            if (trigger) {
                e.preventDefault();
                const artwork = {
                    title: trigger.dataset.title || 'Obra Sin Título',
                    image: trigger.dataset.image || ''
                };
                this.open(artwork);
            }
        });
    }

    open(artwork) {
        this.artworkData = artwork;
        this.active = true;
        this.currentStep = 0;
        
        // Reset steps
        this.overlay.querySelectorAll('.ritual-step').forEach(el => el.classList.add('hidden'));
        this.overlay.querySelector('[data-step="0"]').classList.remove('hidden');
        
        // Populate data
        if (artwork.image) {
            // Set image logic here
        }
        
        this.overlay.classList.remove('hidden');
        // Pequeño delay para permitir transición CSS
        setTimeout(() => this.overlay.classList.add('active'), 10);
    }

    close() {
        this.active = false;
        this.overlay.classList.remove('active');
        setTimeout(() => this.overlay.classList.add('hidden'), 800);
    }

    nextStep() {
        // Validaciones si es necesario
        if (this.currentStep === 1) {
            const name = document.getElementById('custodian-name').value;
            if (!name) return; // Requerir nombre
            this.overlay.querySelector('.cert-custodian-name').textContent = name;
            this.overlay.querySelector('.cert-artwork-name').textContent = this.artworkData.title;
        }

        const currentEl = this.overlay.querySelector(`[data-step="${this.currentStep}"]`);
        this.currentStep++;
        const nextEl = this.overlay.querySelector(`[data-step="${this.currentStep}"]`);
        
        if (nextEl) {
            // Fade out current
            currentEl.style.opacity = '0';
            setTimeout(() => {
                currentEl.classList.add('hidden');
                nextEl.classList.remove('hidden');
                // Fade in next
                // (Simplificado, idealmente usaría clases CSS para animar entrada/salida)
            }, 300);
        }
    }
}
