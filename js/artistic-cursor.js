/**
 * NAROA.ONLINE v5.0 — ARTISTIC CURSOR
 * Custom brush-stroke cursor with trail effect
 */

(function() {
    'use strict';

    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        cursorSize: 12,
        trailLength: 8,
        trailDecay: 0.15,
        colors: {
            default: 'rgba(212, 175, 55, 0.8)',   // Mica gold
            hover: 'rgba(255, 255, 255, 0.9)',    // White on interactive
            active: 'rgba(184, 134, 11, 1)'       // Dark gold on click
        },
        smoothing: 0.15
    };

    // ============================================
    // STATE
    // ============================================
    let cursorX = 0, cursorY = 0;
    let targetX = 0, targetY = 0;
    let isHovering = false;
    let isClicking = false;
    let trail = [];
    let cursorElement, trailContainer;

    // ============================================
    // CURSOR CREATION
    // ============================================
    function createCursor() {
        // Main cursor dot
        cursorElement = document.createElement('div');
        cursorElement.className = 'artistic-cursor';
        cursorElement.style.cssText = `
            position: fixed;
            width: ${CONFIG.cursorSize}px;
            height: ${CONFIG.cursorSize}px;
            background: ${CONFIG.colors.default};
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
            mix-blend-mode: difference;
            transform: translate(-50%, -50%);
            transition: width 0.2s, height 0.2s, background 0.2s;
            will-change: transform;
        `;
        document.body.appendChild(cursorElement);

        // Trail container
        trailContainer = document.createElement('div');
        trailContainer.className = 'cursor-trail';
        trailContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 99998;
        `;
        document.body.appendChild(trailContainer);

        // Create trail dots
        for (let i = 0; i < CONFIG.trailLength; i++) {
            const dot = document.createElement('div');
            const scale = 1 - (i / CONFIG.trailLength);
            const size = CONFIG.cursorSize * scale * 0.6;
            
            dot.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${CONFIG.colors.default};
                border-radius: 50%;
                opacity: ${scale * 0.5};
                transform: translate(-50%, -50%);
                mix-blend-mode: difference;
                will-change: transform, opacity;
            `;
            trailContainer.appendChild(dot);
            trail.push({
                element: dot,
                x: 0,
                y: 0
            });
        }

        // Hide default cursor
        document.body.style.cursor = 'none';
        document.querySelectorAll('a, button, [role="button"], input, textarea, select').forEach(el => {
            el.style.cursor = 'none';
        });
    }

    // ============================================
    // ANIMATION LOOP
    // ============================================
    function animate() {
        // Smooth cursor movement
        cursorX += (targetX - cursorX) * CONFIG.smoothing;
        cursorY += (targetY - cursorY) * CONFIG.smoothing;

        // Update main cursor
        cursorElement.style.left = `${cursorX}px`;
        cursorElement.style.top = `${cursorY}px`;

        // Update trail with delay
        let prevX = cursorX;
        let prevY = cursorY;

        trail.forEach((dot, index) => {
            const delay = CONFIG.trailDecay * (index + 1);
            dot.x += (prevX - dot.x) * delay;
            dot.y += (prevY - dot.y) * delay;
            
            dot.element.style.left = `${dot.x}px`;
            dot.element.style.top = `${dot.y}px`;

            prevX = dot.x;
            prevY = dot.y;
        });

        requestAnimationFrame(animate);
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    function setupEvents() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });

        // Mouse enter interactive elements
        const interactiveSelector = 'a, button, [role="button"], input, textarea, select, .portfolio-card, .studio-nav-item';
        
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(interactiveSelector)) {
                isHovering = true;
                cursorElement.style.width = `${CONFIG.cursorSize * 2}px`;
                cursorElement.style.height = `${CONFIG.cursorSize * 2}px`;
                cursorElement.style.background = CONFIG.colors.hover;
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest(interactiveSelector)) {
                isHovering = false;
                cursorElement.style.width = `${CONFIG.cursorSize}px`;
                cursorElement.style.height = `${CONFIG.cursorSize}px`;
                cursorElement.style.background = CONFIG.colors.default;
            }
        });

        // Mouse down/up
        document.addEventListener('mousedown', () => {
            isClicking = true;
            cursorElement.style.transform = 'translate(-50%, -50%) scale(0.8)';
            cursorElement.style.background = CONFIG.colors.active;
        });

        document.addEventListener('mouseup', () => {
            isClicking = false;
            cursorElement.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorElement.style.background = isHovering ? CONFIG.colors.hover : CONFIG.colors.default;
        });

        // Reduced motion toggle
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="reduce-motion"]')) {
                toggleCursor();
            }
        });

        // Hide when leaving window
        document.addEventListener('mouseleave', () => {
            cursorElement.style.opacity = '0';
            trailContainer.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            cursorElement.style.opacity = '1';
            trailContainer.style.opacity = '1';
        });
    }

    function toggleCursor() {
        const isReduced = document.body.classList.contains('reduce-motion');
        if (cursorElement) {
            cursorElement.style.display = isReduced ? 'none' : 'block';
        }
        if (trailContainer) {
            trailContainer.style.display = isReduced ? 'none' : 'block';
        }
        document.body.style.cursor = isReduced ? 'auto' : 'none';
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        // Only on desktop
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            return;
        }

        createCursor();
        setupEvents();
        animate();
        
        console.log('[ArtisticCursor] Initialized');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export
    window.ArtisticCursor = { init, toggleCursor };

})();
