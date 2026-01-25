/**
 * ═══════════════════════════════════════════════════════════════════
 * NAROA.ONLINE — ULTRA-MINIMAL FULLSCREEN PARALLAX EXPERIENCE
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Transforma la web en una experiencia immersiva de scroll vertical
 * con imágenes fullscreen y efecto parallax suave.
 */

(function() {
    'use strict';

    // Configuración
    const CONFIG = {
        parallaxIntensity: 0.3,
        scrollSmooth: true,
        autoAdvance: false,
        showNavDots: true
    };

    // Imágenes destacadas para las secciones fullscreen
    const HERO_IMAGES = [
        '/images/optimized/551743489638410_000005_475783569_1271253671020718_8162290046042793177_n.webp',
        '/images/optimized/1225348225611263_000001_489844679_1331639158315502_2310700664900589239_n.webp',
        '/images/optimized/1225348225611263_000002_489956627_1331639161648835_2744618773693846301_n.webp',
        '/images/optimized/853524166127006_000001_485141007_1310753923737359_3104141236670420796_n.webp',
        '/images/optimized/1038960572845321_000005_510336591_30064484393199553_5462947636110124871_n.webp',
        '/images/optimized/1026561114085267_000001_508860460_30059531670361492_5023806045470663708_n.webp'
    ];

    // Series/álbumes para contexto
    const SERIES_NAMES = [
        'DiviNos VaiVenes',
        'Grafito y Mica',
        'Retratos Hiperrealistas',
        'Serie del Error',
        'Anatomía Emocional',
        'Rostros del Silencio'
    ];

    /**
     * Genera el HTML para la experiencia fullscreen
     */
    function generateFullscreenHTML() {
        const container = document.createElement('div');
        container.id = 'ultra-minimal-experience';
        container.className = 'ultra-minimal-container';

        // Sección Hero
        container.innerHTML = `
            <!-- HERO -->
            <section class="fullscreen-section hero-fullscreen" data-section="0">
                <img src="${HERO_IMAGES[0]}" alt="Obra de Naroa Gutiérrez Gil" class="fullscreen-bg" loading="eager">
                <div class="hero-content">
                    <h1 class="hero-name">Naroa Gutiérrez Gil</h1>
                    <p class="hero-tagline">El error como método · La espera como herramienta</p>
                </div>
                <div class="scroll-indicator">
                    <span>Scroll</span>
                </div>
            </section>

            <!-- OBRAS FULLSCREEN -->
            ${HERO_IMAGES.slice(1, 5).map((img, i) => `
                <section class="fullscreen-section obra-fullscreen" data-section="${i + 1}">
                    <img src="${img}" alt="Obra ${i + 1}" class="fullscreen-bg" loading="lazy">
                    <div class="obra-number">${String(i + 1).padStart(2, '0')} / ${HERO_IMAGES.length - 1}</div>
                    <div class="obra-info">
                        <h2 class="obra-title">${SERIES_NAMES[i] || 'Sin título'}</h2>
                        <p class="obra-serie">Serie · 2024</p>
                    </div>
                </section>
            `).join('')}

            <!-- CTA -->
            <section class="fullscreen-section cta-fullscreen" data-section="${HERO_IMAGES.length}">
                <div class="cta-content">
                    <h2 class="cta-question">¿Quieres un retrato?</h2>
                    <div class="cta-buttons">
                        <a href="#/retrato" class="cta-btn cta-btn--primary">Sí</a>
                        <a href="#/portfolio" class="cta-btn">Ver más obras</a>
                    </div>
                </div>
            </section>

            <!-- NAV DOTS -->
            <nav class="vertical-nav" aria-label="Navegación de secciones">
                ${Array(HERO_IMAGES.length + 1).fill(0).map((_, i) => `
                    <button class="nav-dot ${i === 0 ? 'active' : ''}" 
                            data-section="${i}" 
                            aria-label="Ir a sección ${i + 1}"></button>
                `).join('')}
            </nav>
        `;

        return container;
    }

    /**
     * Inicializa el efecto parallax
     */
    function initParallax() {
        const sections = document.querySelectorAll('.fullscreen-section');
        
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            
            sections.forEach(section => {
                const bg = section.querySelector('.fullscreen-bg');
                if (!bg) return;
                
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const relativeScroll = scrollY - sectionTop;
                
                // Solo aplicar parallax si la sección está visible
                if (scrollY >= sectionTop - window.innerHeight && 
                    scrollY <= sectionTop + sectionHeight) {
                    const parallaxOffset = relativeScroll * CONFIG.parallaxIntensity;
                    bg.style.transform = `translateY(${parallaxOffset}px)`;
                }
            });
        }, { passive: true });
    }

    /**
     * Inicializa la navegación por dots
     */
    function initNavDots() {
        const dots = document.querySelectorAll('.nav-dot');
        const sections = document.querySelectorAll('.fullscreen-section');
        
        // Click en dots
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const targetIndex = parseInt(dot.dataset.section);
                const targetSection = sections[targetIndex];
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Observer para actualizar dot activo
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionIndex = parseInt(entry.target.dataset.section);
                    dots.forEach((dot, i) => {
                        dot.classList.toggle('active', i === sectionIndex);
                    });
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => observer.observe(section));
    }

    /**
     * Inicializa la experiencia completa
     */
    function init() {
        // Verificar si ya está activo
        if (document.getElementById('ultra-minimal-experience')) {
            console.log('🖼️ Ultra-Minimal ya activo');
            return;
        }

        // Añadir clase al body
        document.body.classList.add('ultra-minimal', 'snap-scroll');
        
        // Generar e insertar HTML
        const experience = generateFullscreenHTML();
        document.body.appendChild(experience);
        
        // Inicializar sistemas
        initParallax();
        initNavDots();
        
        console.log('🖼️ Ultra-Minimal Fullscreen Parallax activo');
    }

    /**
     * Destruir experiencia y volver al modo normal
     */
    function destroy() {
        const experience = document.getElementById('ultra-minimal-experience');
        if (experience) {
            experience.remove();
        }
        document.body.classList.remove('ultra-minimal', 'snap-scroll');
        console.log('🖼️ Ultra-Minimal desactivado');
    }

    // Exponer API global
    window.UltraMinimal = {
        init,
        destroy,
        CONFIG
    };

    // Auto-inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
