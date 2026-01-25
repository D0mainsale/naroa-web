/**
 * NAROA.ONLINE v5.0 — STUDIO NAVIGATION
 * Floating immersive navigation with room transitions
 */

(function() {
    'use strict';

    // Navigation routes with room names
    const ROUTES = [
        { path: '#/', label: 'Inicio', icon: 'home', room: 'El Umbral' },
        { path: '#/portfolio', label: 'Obras', icon: 'grid', room: 'Sala de Obras' },
        { path: '#/process', label: 'Proceso', icon: 'layers', room: 'El Taller' },
        { path: '#/bitacora', label: 'Bitácora', icon: 'book', room: 'Diario' },
        { path: '#/retrato', label: 'Retrato', icon: 'user', room: 'Comisiones' },
        { path: '#/about', label: 'About', icon: 'info', room: 'Sobre Naroa' }
    ];

    // SVG Icons (inline for performance)
    const ICONS = {
        home: '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
        layers: '<svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
        book: '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        user: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        moon: '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
        motion: '<svg viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
        audio: '<svg viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>'
    };

    // Current state
    let currentPath = window.location.hash || '#/';
    let isTransitioning = false;

    /**
     * Create the navigation HTML
     */
    function createNavigation() {
        // Main navigation
        const nav = document.createElement('nav');
        nav.className = 'studio-nav';
        nav.setAttribute('aria-label', 'Navegación principal');

        const container = document.createElement('div');
        container.className = 'studio-nav-container';

        // Build nav items
        ROUTES.forEach((route, index) => {
            // Add home button specially styled
            const isHome = route.path === '#/';
            
            const item = document.createElement('a');
            item.href = route.path;
            item.className = `studio-nav-item ${isHome ? 'studio-nav-home' : ''} ${currentPath === route.path ? 'active' : ''}`;
            item.setAttribute('data-room', route.room);
            item.setAttribute('aria-label', route.label);

            // Icon
            const icon = document.createElement('span');
            icon.className = 'studio-nav-icon';
            icon.innerHTML = ICONS[route.icon];
            item.appendChild(icon);

            // Label tooltip
            const label = document.createElement('span');
            label.className = 'studio-nav-label';
            label.textContent = route.label;
            item.appendChild(label);

            // Click handler with room transition
            item.addEventListener('click', (e) => handleNavClick(e, route));

            container.appendChild(item);

            // Add divider after home
            if (index === 0) {
                const divider = document.createElement('div');
                divider.className = 'studio-nav-divider';
                container.appendChild(divider);
            }
        });

        nav.appendChild(container);
        document.body.appendChild(nav);

        // Create accessibility controls
        createAccessibilityControls();

        // Create breadcrumb trail
        createBreadcrumb();

        // Create room transition overlay
        createTransitionOverlay();
    }

    /**
     * Create accessibility control buttons
     */
    function createAccessibilityControls() {
        const controls = document.createElement('div');
        controls.className = 'accessibility-controls';

        // Reduce motion toggle
        const motionBtn = document.createElement('button');
        motionBtn.className = 'accessibility-btn';
        motionBtn.setAttribute('data-action', 'reduce-motion');
        motionBtn.setAttribute('aria-label', 'Reducir animaciones');
        motionBtn.innerHTML = ICONS.motion;
        motionBtn.addEventListener('click', toggleReducedMotion);

        // Audio toggle
        const audioBtn = document.createElement('button');
        audioBtn.className = 'accessibility-btn';
        audioBtn.setAttribute('data-action', 'toggle-audio');
        audioBtn.setAttribute('aria-label', 'Activar/desactivar audio');
        audioBtn.innerHTML = ICONS.audio;
        audioBtn.addEventListener('click', toggleAudio);

        controls.appendChild(motionBtn);
        controls.appendChild(audioBtn);
        document.body.appendChild(controls);
    }

    /**
     * Create breadcrumb trail
     */
    function createBreadcrumb() {
        const breadcrumb = document.createElement('nav');
        breadcrumb.className = 'breadcrumb-trail';
        breadcrumb.setAttribute('aria-label', 'Ruta de navegación');
        updateBreadcrumb(breadcrumb);
        document.body.appendChild(breadcrumb);

        // Store reference for updates
        window.studioBreadcrumb = breadcrumb;
    }

    /**
     * Update breadcrumb based on current route
     */
    function updateBreadcrumb(breadcrumb) {
        const container = breadcrumb || window.studioBreadcrumb;
        if (!container) return;

        const currentRoute = ROUTES.find(r => r.path === currentPath) || ROUTES[0];
        
        container.innerHTML = `
            <a href="#/" class="breadcrumb-link">Naroa</a>
            ${currentPath !== '#/' ? `
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-current">${currentRoute.label}</span>
            ` : ''}
        `;
    }

    /**
     * Create room transition overlay
     */
    function createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'room-transition-overlay';
        overlay.id = 'room-transition';

        const title = document.createElement('h2');
        title.className = 'room-transition-title';
        overlay.appendChild(title);

        document.body.appendChild(overlay);
    }

    /**
     * Handle navigation click with room transition
     */
    function handleNavClick(e, route) {
        e.preventDefault();
        
        if (isTransitioning || route.path === currentPath) return;

        // Use GSAP for room transition if available
        if (typeof gsap !== 'undefined' && !document.body.classList.contains('reduce-motion')) {
            performRoomTransition(route);
        } else {
            // Fallback: direct navigation
            navigateTo(route.path);
        }
    }

    /**
     * Perform animated room transition
     */
    function performRoomTransition(route) {
        isTransitioning = true;

        const overlay = document.getElementById('room-transition');
        const title = overlay.querySelector('.room-transition-title');
        title.textContent = route.room;

        const tl = gsap.timeline({
            onComplete: () => {
                isTransitioning = false;
            }
        });

        // Fade in overlay
        tl.to(overlay, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.inOut',
            onStart: () => {
                overlay.classList.add('active');
            }
        })
        // Animate title
        .fromTo(title, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
        )
        // Navigate
        .call(() => {
            navigateTo(route.path);
        })
        // Fade out
        .to(title, {
            opacity: 0,
            y: -20,
            duration: 0.3,
            ease: 'power2.in',
            delay: 0.2
        })
        .to(overlay, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
                overlay.classList.remove('active');
            }
        });
    }

    /**
     * Navigate to a path
     */
    function navigateTo(path) {
        // Update hash
        window.location.hash = path;
        currentPath = path;
        
        // Show/hide views based on path
        showCorrectView(path);
        
        // Update navigation state
        updateActiveState();
        updateBreadcrumb();
    }

    /**
     * Show the correct view for the current path
     */
    function showCorrectView(path) {
        // Map paths to view IDs
        const pathToView = {
            '#/': 'home-view',
            '#/portfolio': 'portfolio-view',
            '#/process': 'process-view',
            '#/bitacora': 'bitacora-view',
            '#/retrato': 'retrato-view',
            '#/about': 'about-view',
            '#/tienda': 'tienda-view',
            '#/ritual': 'ritual-view',
            '#/retrospecter': 'retrospecter-view'
        };

        const targetViewId = pathToView[path] || 'home-view';
        
        // Hide all views
        document.querySelectorAll('[data-view]').forEach(view => {
            view.classList.add('hidden');
        });

        // Show target view
        const targetView = document.getElementById(targetViewId);
        if (targetView) {
            targetView.classList.remove('hidden');
            
            // Trigger GSAP animations if available
            if (typeof gsap !== 'undefined' && !document.body.classList.contains('reduce-motion')) {
                // Animate reveal-blur elements in the new view
                const revealElements = targetView.querySelectorAll('.reveal-blur, .fade-in-up');
                if (revealElements.length) {
                    gsap.fromTo(revealElements,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
                    );
                }
            }
        }
    }

    /**
     * Update active navigation state
     */
    function updateActiveState() {
        document.querySelectorAll('.studio-nav-item').forEach(item => {
            const href = item.getAttribute('href');
            item.classList.toggle('active', href === currentPath);
        });
    }

    /**
     * Toggle reduced motion
     */
    function toggleReducedMotion() {
        const enabled = document.body.classList.toggle('reduce-motion');
        
        // Update GSAP if available
        if (typeof NaroaAnimations !== 'undefined') {
            NaroaAnimations.setReducedMotion(enabled);
        }

        // Save preference
        localStorage.setItem('naroa-reduce-motion', enabled);
    }

    /**
     * Toggle audio
     */
    function toggleAudio() {
        const enabled = document.body.classList.toggle('audio-enabled');
        
        // Trigger audio system if available
        if (typeof Howler !== 'undefined') {
            Howler.mute(!enabled);
        }

        // Save preference
        localStorage.setItem('naroa-audio', enabled);
    }

    /**
     * Load saved preferences
     */
    function loadPreferences() {
        // Reduced motion
        if (localStorage.getItem('naroa-reduce-motion') === 'true') {
            document.body.classList.add('reduce-motion');
        }

        // Audio
        if (localStorage.getItem('naroa-audio') === 'true') {
            document.body.classList.add('audio-enabled');
        }
    }

    /**
     * Initialize navigation
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }

    function onReady() {
        loadPreferences();
        createNavigation();

        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            currentPath = window.location.hash || '#/';
            updateActiveState();
            updateBreadcrumb();
        });

        console.log('[StudioNav] Navigation initialized');
    }

    // Export
    window.StudioNav = {
        init,
        navigateTo,
        toggleReducedMotion,
        toggleAudio
    };

    // Auto-initialize
    init();

})();
