/**
 * GSAP Animations — naroa-web
 * Animaciones premium tipo awwwards
 */

// Registrar plugins
gsap.registerPlugin(ScrollTrigger);

// ============================================
// CONFIGURACIÓN GLOBAL
// ============================================
const ANIM_CONFIG = {
    duration: 0.8,
    ease: 'power3.out',
    stagger: 0.1
};

// ============================================
// 1. PAGE TRANSITIONS
// ============================================
function initPageTransitions() {
    const views = document.querySelectorAll('[data-view]');
    
    // Fade in inicial
    gsap.from('body', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
    });
    
    // Observer para cambios de vista
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const target = mutation.target;
                if (!target.classList.contains('hidden')) {
                    animateViewIn(target);
                }
            }
        });
    });
    
    views.forEach(view => {
        observer.observe(view, { attributes: true });
    });
}

function animateViewIn(view) {
    // Fade + slide desde abajo
    gsap.fromTo(view, 
        { 
            opacity: 0, 
            y: 30 
        },
        { 
            opacity: 1, 
            y: 0, 
            duration: ANIM_CONFIG.duration,
            ease: ANIM_CONFIG.ease
        }
    );
    
    // Animar elementos internos con stagger
    const elements = view.querySelectorAll('h1, h2, p, .portfolio-card, .bitacora-card');
    gsap.fromTo(elements,
        { opacity: 0, y: 20 },
        { 
            opacity: 1, 
            y: 0, 
            duration: 0.6,
            stagger: ANIM_CONFIG.stagger,
            delay: 0.2
        }
    );
}

// ============================================
// 2. PORTFOLIO CARDS - Stagger Reveal
// ============================================
function initPortfolioAnimations() {
    // Cards reveal on scroll
    gsap.utils.toArray('.portfolio-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 50,
            scale: 0.95,
            duration: 0.6,
            delay: (i % 4) * 0.1 // Stagger por filas
        });
    });
    
    // Hover effect mejorado
    document.querySelectorAll('.portfolio-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                scale: 1.02,
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                duration: 0.3
            });
        });
        
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                scale: 1,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                duration: 0.3
            });
        });
    });
}

// ============================================
// 3. HERO TEXT - Split Animation
// ============================================
function initHeroAnimations() {
    const heroName = document.querySelector('.home-name');
    const heroQuestion = document.querySelector('.intro-question');
    const heroButtons = document.querySelectorAll('.intro-btn');
    
    if (heroName) {
        // Timeline para secuencia
        const tl = gsap.timeline({ delay: 0.3 });
        
        tl.from(heroName, {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out'
        })
        .from(heroQuestion, {
            opacity: 0,
            y: 20,
            duration: 0.8
        }, '-=0.3')
        .from(heroButtons, {
            opacity: 0,
            y: 15,
            stagger: 0.15,
            duration: 0.6
        }, '-=0.4');
    }
}

// ============================================
// 4. PARALLAX IMAGES
// ============================================
function initParallax() {
    gsap.utils.toArray('.portfolio-card img').forEach(img => {
        gsap.to(img, {
            scrollTrigger: {
                trigger: img,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1
            },
            y: -30,
            scale: 1.05
        });
    });
}

// ============================================
// 5. SCROLL PROGRESS BAR
// ============================================
function initScrollProgress() {
    const progress = document.createElement('div');
    progress.className = 'scroll-progress';
    progress.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--naroa-red, #e63946), var(--accent, #a8dadc));
        transform-origin: left;
        z-index: 9999;
    `;
    document.body.appendChild(progress);
    
    gsap.to(progress, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2
        }
    });
    
    gsap.set(progress, { scaleX: 0 });
}

// ============================================
// 6. MAGNETIC BUTTONS
// ============================================
function initMagneticButtons() {
    document.querySelectorAll('.intro-btn, .nav-link').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(btn, {
                x: x * 0.2,
                y: y * 0.2,
                duration: 0.3
            });
        });
        
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initPageTransitions();
    initHeroAnimations();
    initScrollProgress();
    initMagneticButtons();
    
    // Delay para asegurar que el DOM está listo
    setTimeout(() => {
        initPortfolioAnimations();
        initParallax();
    }, 100);
});

// Refresh ScrollTrigger en cambios de vista
window.addEventListener('hashchange', () => {
    setTimeout(() => {
        ScrollTrigger.refresh();
    }, 300);
});

console.log('✨ GSAP Animations loaded');
