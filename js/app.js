document.addEventListener('DOMContentLoaded', async () => {
    
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
