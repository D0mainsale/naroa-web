/**
 * NAROA.ONLINE v5.0 — GSAP Animation Engine
 * Immersive scroll-driven animations inspired by Bruno Simon & Naked City Films
 */

// Import from CDN since this is a static site
// GSAP & ScrollTrigger loaded via <script> tags in HTML

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        // Reduced motion preference
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        
        // Animation durations (in seconds)
        durations: {
            instant: 0.1,
            fast: 0.2,
            base: 0.4,
            slow: 0.8,
            reveal: 1.2
        },
        
        // Easing functions
        ease: {
            smooth: 'power3.out',
            expo: 'expo.out',
            elastic: 'elastic.out(1, 0.5)',
            back: 'back.out(1.7)'
        },
        
        // Scroll trigger defaults
        scrollTrigger: {
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
        }
    };

    // ============================================
    // GSAP INITIALIZATION
    // ============================================
    function initGSAP() {
        // Check if GSAP is loaded
        if (typeof gsap === 'undefined') {
            console.warn('[NaroaAnim] GSAP not loaded. Falling back to CSS animations.');
            return false;
        }

        // Register ScrollTrigger plugin
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            console.log('[NaroaAnim] ScrollTrigger registered');
        }

        // Set global defaults
        gsap.defaults({
            duration: CONFIG.durations.base,
            ease: CONFIG.ease.smooth
        });

        // Respect reduced motion preference
        if (CONFIG.prefersReducedMotion) {
            gsap.globalTimeline.timeScale(1000); // Effectively disable animations
            console.log('[NaroaAnim] Reduced motion enabled');
            return true;
        }

        return true;
    }

    // ============================================
    // REVEAL ANIMATIONS (Scroll-Triggered)
    // ============================================
    function setupRevealAnimations() {
        if (CONFIG.prefersReducedMotion) return;

        // Blur reveal (like portfolio cards)
        gsap.utils.toArray('.reveal-blur').forEach((element, i) => {
            gsap.fromTo(element,
                {
                    opacity: 0,
                    filter: 'blur(15px)',
                    y: 30
                },
                {
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    duration: CONFIG.durations.reveal,
                    ease: CONFIG.ease.expo,
                    scrollTrigger: {
                        trigger: element,
                        start: CONFIG.scrollTrigger.start,
                        toggleActions: CONFIG.scrollTrigger.toggleActions
                    },
                    delay: i * 0.1 // Stagger effect
                }
            );
        });

        // Fade in up
        gsap.utils.toArray('.fade-in-up').forEach((element) => {
            gsap.fromTo(element,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: CONFIG.durations.slow,
                    ease: CONFIG.ease.expo,
                    scrollTrigger: {
                        trigger: element,
                        start: CONFIG.scrollTrigger.start,
                        toggleActions: CONFIG.scrollTrigger.toggleActions
                    }
                }
            );
        });

        // Scale reveal
        gsap.utils.toArray('.scale-reveal').forEach((element) => {
            gsap.fromTo(element,
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: CONFIG.durations.base,
                    ease: CONFIG.ease.elastic,
                    scrollTrigger: {
                        trigger: element,
                        start: CONFIG.scrollTrigger.start,
                        toggleActions: CONFIG.scrollTrigger.toggleActions
                    }
                }
            );
        });
    }

    // ============================================
    // STAGGER ANIMATIONS
    // ============================================
    function setupStaggerAnimations() {
        if (CONFIG.prefersReducedMotion) return;

        gsap.utils.toArray('.stagger-children').forEach((container) => {
            const children = container.children;
            
            gsap.fromTo(children,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: CONFIG.durations.base,
                    ease: CONFIG.ease.smooth,
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: container,
                        start: CONFIG.scrollTrigger.start,
                        toggleActions: CONFIG.scrollTrigger.toggleActions
                    }
                }
            );
        });
    }

    // ============================================
    // PARALLAX EFFECTS
    // ============================================
    function setupParallax() {
        if (CONFIG.prefersReducedMotion) return;

        // Subtle parallax on images
        gsap.utils.toArray('[data-parallax]').forEach((element) => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            
            gsap.to(element, {
                yPercent: -20 * speed,
                ease: 'none',
                scrollTrigger: {
                    trigger: element,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });
    }

    // ============================================
    // MAGNETIC BUTTON EFFECT
    // ============================================
    function setupMagneticButtons() {
        if (CONFIG.prefersReducedMotion) return;

        document.querySelectorAll('.magnetic-btn').forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(btn, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: CONFIG.durations.fast,
                    ease: CONFIG.ease.smooth
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: CONFIG.durations.base,
                    ease: CONFIG.ease.elastic
                });
            });
        });
    }

    // ============================================
    // PAGE TRANSITIONS (Room Navigation)
    // ============================================
    const PageTransitions = {
        // Transition to a new "room"
        enterRoom: (targetSelector, callback) => {
            const target = document.querySelector(targetSelector);
            if (!target) return;

            const tl = gsap.timeline({
                onComplete: callback
            });

            tl.to('.current-view', {
                opacity: 0,
                filter: 'blur(10px)',
                scale: 0.98,
                duration: CONFIG.durations.base,
                ease: CONFIG.ease.smooth
            })
            .set('.current-view', { display: 'none' })
            .set(target, { display: 'block', opacity: 0, filter: 'blur(10px)', scale: 1.02 })
            .to(target, {
                opacity: 1,
                filter: 'blur(0px)',
                scale: 1,
                duration: CONFIG.durations.slow,
                ease: CONFIG.ease.expo
            });

            return tl;
        },

        // Brush stroke reveal
        brushReveal: (element) => {
            return gsap.fromTo(element,
                {
                    clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)'
                },
                {
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                    duration: CONFIG.durations.reveal,
                    ease: CONFIG.ease.expo
                }
            );
        }
    };

    // ============================================
    // SCROLLYTELLING FOR PROCESS
    // ============================================
    function setupScrollytelling() {
        if (CONFIG.prefersReducedMotion) return;

        const processSteps = document.querySelectorAll('.process-step');
        if (!processSteps.length) return;

        processSteps.forEach((step, index) => {
            const image = step.querySelector('.process-image');
            const text = step.querySelector('.process-text');
            
            // Pin the step while scrolling through it
            ScrollTrigger.create({
                trigger: step,
                start: 'top center',
                end: 'bottom center',
                pin: index < processSteps.length - 1, // Don't pin last step
                pinSpacing: false,
                onEnter: () => {
                    gsap.to(image, { opacity: 1, scale: 1, duration: 0.5 });
                    gsap.to(text, { opacity: 1, x: 0, duration: 0.5, delay: 0.2 });
                },
                onLeaveBack: () => {
                    gsap.to(image, { opacity: 0, scale: 0.9, duration: 0.3 });
                    gsap.to(text, { opacity: 0, x: -20, duration: 0.3 });
                }
            });
        });
    }

    // ============================================
    // MICA PARTICLES (Cursor Following)
    // ============================================
    function setupMicaTrail() {
        if (CONFIG.prefersReducedMotion) return;

        const trail = document.querySelector('.mica-trail');
        if (!trail) return;

        let particles = [];
        const maxParticles = 20;

        document.addEventListener('mousemove', (e) => {
            if (particles.length >= maxParticles) {
                const oldParticle = particles.shift();
                oldParticle.remove();
            }

            const particle = document.createElement('div');
            particle.className = 'mica-particle';
            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
            trail.appendChild(particle);
            particles.push(particle);

            gsap.to(particle, {
                opacity: 0,
                scale: 0,
                duration: 0.8,
                ease: 'power2.out',
                onComplete: () => {
                    particle.remove();
                    particles = particles.filter(p => p !== particle);
                }
            });
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }

    function onReady() {
        if (!initGSAP()) {
            console.warn('[NaroaAnim] GSAP initialization failed');
            return;
        }

        // Setup all animations
        setupRevealAnimations();
        setupStaggerAnimations();
        setupParallax();
        setupMagneticButtons();
        setupScrollytelling();
        setupMicaTrail();

        // Refresh ScrollTrigger after images load
        window.addEventListener('load', () => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        });

        console.log('[NaroaAnim] All animations initialized');
    }

    // ============================================
    // EXPORTS
    // ============================================
    window.NaroaAnimations = {
        init,
        CONFIG,
        PageTransitions,
        refreshScrollTrigger: () => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        },
        setReducedMotion: (enabled) => {
            CONFIG.prefersReducedMotion = enabled;
            document.body.classList.toggle('reduce-motion', enabled);
        }
    };

    // Auto-initialize
    init();

})();
