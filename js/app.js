document.addEventListener('DOMContentLoaded', async () => {
    
    // === NUCLEAR SHADOW EXTERMINATOR ===
    // Aggressively removes external extension overlays and internal canvas shadows
    (function() {
        const KILL_LIST = [
            'preact-border-shadow-host',
            'textcortex-shadow-host',
            'shadow-host',
            'tension-layer',
            'pigment-canvas'
        ];

        function exterminate() {
            // ID based kill
            KILL_LIST.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.remove();
                    console.log('🗑️ Shadow killed:', id);
                }
            });
            
            // Pattern kill
            document.querySelectorAll('[id*="shadow-host"], [id*="textcortex"], [id*="extension"]').forEach(el => {
                el.remove();
            });
        }
        
        // Run immediately
        exterminate();
        
        // Run on interval
        setInterval(exterminate, 2000);
        
        // Observe for new additions
        const shadowObserver = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.id && 
                        (node.id.includes('shadow') || node.id.includes('textcortex') || node.id.includes('border'))) {
                        node.remove();
                        console.log('🗑️ Blocked shadow injection:', node.id);
                    }
                });
            });
        });
        shadowObserver.observe(document.documentElement, { childList: true, subtree: true });
    })();
    
    // === ROUTER INIT ===
    const router = window.naroaRouter || new Router();
    
    // === RITUAL SYSTEMS INIT ===
    const dayNight = new DayNightCycle();
    const glitcher = new GlitchText();
    const decay = new WebDecay();
    const handshake = new RitualHandshake();
    // DISABLED: These create overlays that cause the shading issue
    // const trail = new PigmentTrail();
    // const heartbeat = new HeartbeatCursor();

    
    // Cursor con interpolación (Lerp)
    const cursor = document.getElementById('cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animateCursor() {
        const lerp = 0.1;
        cursorX += (mouseX - cursorX) * lerp;
        cursorY += (mouseY - cursorY) * lerp;
        
        if (cursor) {
            cursor.style.transform = `translate(-50%, -50%) translate3d(${cursorX}px, ${cursorY}px, 0)`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Portfolio instance (routes will use it, but init is non-blocking)
    const portfolio = new Portfolio(router);
    
    // Initialize portfolio data asynchronously (non-blocking for routes)
    portfolio.init().catch(err => {
        console.warn('⚠️ Portfolio init failed (routes still work):', err.message);
    });
    
    // Microtexto
    const microText = document.getElementById('micro-text');
    let microTimer = null;
    
    function showMicro() { if (microText) microText.classList.add('visible'); }
    function hideMicro() { 
        if (microText) microText.classList.remove('visible');
        if (microTimer) clearTimeout(microTimer);
    }
    
    // === HELPER: Ocultar/Mostrar overlay inmersivo ===
    function hideImmersiveOverlay() {
        const ultraMinimal = document.getElementById('ultra-minimal-experience');
        if (ultraMinimal) {
            ultraMinimal.style.display = 'none';
            ultraMinimal.style.visibility = 'hidden';
            ultraMinimal.style.pointerEvents = 'none';
        }
        // También ocultar el home-view
        const homeView = document.getElementById('home-view');
        if (homeView) {
            homeView.classList.add('hidden');
        }
        // Quitar clases de scroll snap del body
        document.body.classList.remove('ultra-minimal', 'snap-scroll');
    }
    
    function showImmersiveOverlay() {
        const ultraMinimal = document.getElementById('ultra-minimal-experience');
        if (ultraMinimal) {
            ultraMinimal.style.display = 'block';
            ultraMinimal.style.visibility = 'visible';
            ultraMinimal.style.pointerEvents = 'auto';
        }
        // Restaurar clases de scroll snap
        document.body.classList.add('ultra-minimal', 'snap-scroll');
    }
    
    // RUTAS
    router.register('/', () => {
        console.log('🏠 HOME ROUTE HANDLER EXECUTED');
        // Show ultra-minimal overlay experience
        showImmersiveOverlay();
        
        document.getElementById('home-view').classList.remove('hidden');
        hideMicro();
        microTimer = setTimeout(showMicro, 4000);
    });
    
    router.register('/portfolio', () => {
        console.log('🎨 PORTFOLIO ROUTE HANDLER EXECUTED');
        hideMicro();
        hideImmersiveOverlay();
        
        // Show portfolio view
        const portfolioView = document.getElementById('portfolio-view');
        if (portfolioView) {
            portfolioView.classList.remove('hidden');
            portfolioView.style.display = 'block';
            portfolioView.style.visibility = 'visible';
            console.log('✅ Portfolio shown');
            
            // Trigger reveal animations with GSAP if available
            if (typeof gsap !== 'undefined') {
                const reveals = portfolioView.querySelectorAll('.portfolio-reveal');
                gsap.fromTo(reveals,
                    { opacity: 0, y: 40 },
                    { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out', delay: 0.2 }
                );
            }
        }
        
        // Also render dynamic grid if needed
        if (portfolio && portfolio.renderGrid) {
            portfolio.renderGrid();
        }
    });
    
    router.register('/portfolio/:id', (params) => {
        hideMicro();
        portfolio.showObra(params.id);
    });
    
    router.register('/process', () => {
        console.log('🔧 PROCESS ROUTE HANDLER EXECUTED');
        hideMicro();
        hideImmersiveOverlay();
        
        // Show process view
        const processView = document.getElementById('process-view');
        if (processView) {
            processView.classList.remove('hidden');
            processView.style.display = 'block';
            processView.style.visibility = 'visible';
        }
        
        // Trigger process animations
        portfolio.renderProcess();
    });

    router.register('/bitacora', () => {
        console.log('📓 BITACORA ROUTE HANDLER EXECUTED');
        hideMicro();
        hideImmersiveOverlay();
        
        // Show bitacora view
        const bitacoraView = document.getElementById('bitacora-view');
        if (bitacoraView) {
            bitacoraView.classList.remove('hidden');
            bitacoraView.style.display = 'block';
            bitacoraView.style.visibility = 'visible';
        }
        
        portfolio.renderBitacora();
    });
    
    router.register('/retrato', () => {
        console.log('🎨 RETRATO ROUTE HANDLER EXECUTED');
        hideMicro();
        hideImmersiveOverlay();
        
        // Show retrato view
        const retratoView = document.getElementById('retrato-view');
        if (retratoView) {
            retratoView.classList.remove('hidden');
            retratoView.style.display = 'block';
            retratoView.style.visibility = 'visible';
        }
    });
    
    router.register('/about', () => {
        console.log('👤 ABOUT ROUTE HANDLER EXECUTED');
        hideMicro();
        hideImmersiveOverlay();
        
        // Show about view
        const aboutView = document.getElementById('about-view');
        if (aboutView) {
            aboutView.classList.remove('hidden');
            aboutView.style.display = 'block';
            aboutView.style.visibility = 'visible';
        }
        
        // Trigger about animations
        portfolio.renderAbout();
    });
    
    router.register('/ritual', () => {
        hideMicro();
        const ritualView = document.getElementById('ritual-view');
        ritualView.classList.remove('hidden');
        
        // Activar modo Pop Colorista
        document.documentElement.style.setProperty('--accent', 'var(--pop-magenta)');
        
        // Inicializar Juego de la Oca (si existe la clase)
        if (typeof JuegoOca !== 'undefined' && !window.ritualGameInstance) {
            // Limpiar galería anterior si existe
            const gallery = document.getElementById('archive-gallery');
            if (gallery) gallery.innerHTML = '';
            
            // Crear nueva instancia del juego
            window.ritualGameInstance = new JuegoOca();
            console.log('🦆 Juego de la Oca iniciado');
        }
    });
    
    // === TIENDA ===
    router.register('/tienda', () => {
        hideMicro();
        document.getElementById('tienda-view').classList.remove('hidden');
        
        // Renderizar productos de la tienda
        if (window.naroaShop) {
            window.naroaShop.renderShop();
        }
    });
    
    router.register('/shop', () => {
        // Alias para tienda
        window.location.hash = '#/tienda';
    });

    
    // === NUEVAS RUTAS PREMIUM ===
    router.register('/galeria', () => {
        hideMicro();
        window.location.href = '/galeria.html';
    });
    
    router.register('/press-kit', () => {
        hideMicro();
        const container = document.getElementById('press-kit-container');
        if (container && typeof PressKitSystem !== 'undefined') {
            document.querySelectorAll('[data-view]').forEach(v => v.classList.add('hidden'));
            container.classList.remove('hidden');
        }
    });
    
    router.register('/eventos', () => {
        hideMicro();
        const container = document.getElementById('eventos-container');
        if (container && typeof EventosSystem !== 'undefined') {
            document.querySelectorAll('[data-view]').forEach(v => v.classList.add('hidden'));
            container.classList.remove('hidden');
        }
    });
    
    router.register('/catalogo', () => {
        hideMicro();
        const container = document.getElementById('catalogo-container');
        if (container && typeof CatalogoSystem !== 'undefined') {
            document.querySelectorAll('[data-view]').forEach(v => v.classList.add('hidden'));
            container.classList.remove('hidden');
        }
    });
    
    // Pre-cache de imágenes críticas al estar en idle
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            const critical = ['/images/og-image.jpg', '/images/naroa-artist.jpg'];
            critical.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        });
    }

    
    // Init
    router.handle();
    console.log('🎭 Naroa.online — 3 capas');
});
