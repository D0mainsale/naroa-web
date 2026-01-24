document.addEventListener('DOMContentLoaded', async () => {
    
    // === SHADOW KILLER - Eliminar sombras de extensiones del navegador ===
    const killShadows = () => {
        const shadowHost = document.getElementById('preact-border-shadow-host');
        if (shadowHost) {
            shadowHost.remove();
            console.log('🗑️ Removed browser extension shadow overlay');
        }
        // También buscar otros posibles hosts de sombras
        document.querySelectorAll('[id*="shadow-host"], [id*="border-shadow"]').forEach(el => el.remove());
    };
    killShadows();
    // Observar por si se añade después
    const shadowObserver = new MutationObserver(mutations => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.id && (node.id.includes('shadow-host') || node.id.includes('border-shadow'))) {
                    node.remove();
                }
            });
        });
    });
    shadowObserver.observe(document.body, { childList: true, subtree: true });
    
    // === RITUAL SYSTEMS INIT ===
    const dayNight = new DayNightCycle();
    const glitcher = new GlitchText();
    const decay = new WebDecay();
    const handshake = new RitualHandshake();
    const trail = new PigmentTrail();
    const heartbeat = new HeartbeatCursor();

    
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
    
    // Portfolio
    const portfolio = new Portfolio(router);
    await portfolio.init();
    
    // Microtexto
    const microText = document.getElementById('micro-text');
    let microTimer = null;
    
    function showMicro() { if (microText) microText.classList.add('visible'); }
    function hideMicro() { 
        if (microText) microText.classList.remove('visible');
        if (microTimer) clearTimeout(microTimer);
    }
    
    // RUTAS
    router.register('/', () => {
        document.getElementById('home-view').classList.remove('hidden');
        hideMicro();
        microTimer = setTimeout(showMicro, 4000);
    });
    
    router.register('/portfolio', () => {
        hideMicro();
        portfolio.renderGrid();
    });
    
    router.register('/portfolio/:id', (params) => {
        hideMicro();
        portfolio.showObra(params.id);
    });
    
    router.register('/process', () => {
        hideMicro();
        portfolio.renderProcess();
    });

    router.register('/bitacora', () => {
        hideMicro();
        portfolio.renderBitacora();
    });
    
    router.register('/retrato', () => {
        hideMicro();
        document.getElementById('retrato-view').classList.remove('hidden');
    });
    
    router.register('/about', () => {
        hideMicro();
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
