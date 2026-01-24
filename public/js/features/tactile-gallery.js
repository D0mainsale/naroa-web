/**
 * TACTILE GALLERY - "Galería Táctil 3D"
 * Inspirado en UNESCO Stolen Objects Museum (AWWWARDS 2026)
 * Las obras se pueden "coger", rotar, voltear y examinar en detalle
 * 
 * Features:
 * - Click+Drag para rotar la obra en 3D
 * - Scroll/Pinch para zoom extremo (ver pinceladas)
 * - Click largo para "coger" y mover
 * - Doble-tap para voltear y ver información trasera
 * - Física inercial para movimientos fluidos
 * 
 * v1.0.0 - 2026-01-24
 */

class TactileGallery {
    constructor() {
        this.activeCard = null;
        this.isGrabbing = false;
        this.isDragging = false;
        this.isZooming = false;
        
        // Transform state
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.position = { x: 0, y: 0 };
        this.scale = 1;
        this.targetScale = 1;
        
        // Drag state
        this.startPos = { x: 0, y: 0 };
        this.lastPos = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        
        // Physics
        this.friction = 0.92;
        this.lerp = 0.12;
        this.maxRotation = 45;
        this.maxZoom = 5;
        this.minZoom = 1;
        
        // Timing
        this.longPressTimer = null;
        this.longPressDelay = 400;
        this.lastTap = 0;
        this.doubleTapDelay = 300;
        
        this.animationFrame = null;
        this.isFlipped = false;
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        console.log('🖐️ Tactile Gallery initialized');
    }
    
    setup() {
        this.addStyles();
        this.findCards();
        this.createOverlay();
        this.bindGlobalEvents();
        
        // Re-attach on route change
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.findCards(), 500);
        });
    }
    
    findCards() {
        const selectors = [
            '.portfolio-card',
            '.artwork-card',
            '[data-tactile]',
            '.galeria-item',
            '.ritual-card'
        ];
        
        const cards = document.querySelectorAll(selectors.join(', '));
        
        cards.forEach(card => {
            if (card.dataset.tactileProcessed) return;
            card.dataset.tactileProcessed = 'true';
            
            // Add tactile class
            card.classList.add('tactile-enabled');
            
            // Create back side for flip
            this.createCardBack(card);
            
            // Touch/Mouse events
            card.addEventListener('mousedown', (e) => this.onCardPress(e, card));
            card.addEventListener('touchstart', (e) => this.onCardTouch(e, card), { passive: true });
            
            // Double-tap detection
            card.addEventListener('click', (e) => this.onCardTap(e, card));
        });
    }
    
    createCardBack(card) {
        // Get info from card
        const title = card.querySelector('h3, .card-title')?.textContent || 'Sin título';
        const desc = card.querySelector('p, .card-description')?.textContent || '';
        const img = card.querySelector('img');
        
        // Create back face
        const backFace = document.createElement('div');
        backFace.className = 'tactile-back-face';
        backFace.innerHTML = `
            <div class="tactile-back-content">
                <h3>${title}</h3>
                <p class="tactile-back-desc">${desc}</p>
                <div class="tactile-back-meta">
                    <span class="tactile-icon">🎨</span>
                    <span>Técnica mixta sobre papel</span>
                </div>
                <div class="tactile-back-cta">
                    <span>↻ Gira para volver</span>
                </div>
            </div>
        `;
        
        card.appendChild(backFace);
        
        // Wrap card content for 3D
        const inner = document.createElement('div');
        inner.className = 'tactile-inner';
        
        // Move existing content to front face
        const frontFace = document.createElement('div');
        frontFace.className = 'tactile-front-face';
        
        while (card.firstChild !== backFace) {
            frontFace.appendChild(card.firstChild);
        }
        
        inner.appendChild(frontFace);
        inner.appendChild(backFace);
        card.innerHTML = '';
        card.appendChild(inner);
    }
    
    createOverlay() {
        // Full-screen overlay for tactile mode
        this.overlay = document.createElement('div');
        this.overlay.className = 'tactile-overlay';
        this.overlay.innerHTML = `
            <div class="tactile-workspace">
                <div class="tactile-card-container"></div>
                <div class="tactile-instructions">
                    <span class="tactile-hint">🖱️ Arrastra para rotar</span>
                    <span class="tactile-hint">🔍 Scroll para zoom</span>
                    <span class="tactile-hint">👆 Doble-tap para voltear</span>
                </div>
                <button class="tactile-close" aria-label="Cerrar">&times;</button>
            </div>
        `;
        document.body.appendChild(this.overlay);
        
        this.workspace = this.overlay.querySelector('.tactile-workspace');
        this.cardContainer = this.overlay.querySelector('.tactile-card-container');
        
        // Close button
        this.overlay.querySelector('.tactile-close').addEventListener('click', () => this.close());
        
        // Click outside to close
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay || e.target === this.workspace) {
                this.close();
            }
        });
    }
    
    bindGlobalEvents() {
        // Escape to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeCard) {
                this.close();
            }
        });
    }
    
    onCardTap(e, card) {
        const now = Date.now();
        const timeDiff = now - this.lastTap;
        
        if (timeDiff < this.doubleTapDelay && timeDiff > 0) {
            // Double-tap: flip or open in tactile mode
            e.preventDefault();
            if (this.activeCard === card) {
                this.flip();
            } else {
                this.open(card);
            }
        }
        
        this.lastTap = now;
    }
    
    onCardPress(e, card) {
        // Start long-press detection for "grab" mode
        this.longPressTimer = setTimeout(() => {
            this.open(card);
        }, this.longPressDelay);
        
        // Cancel on move or release
        const cancelLongPress = () => {
            clearTimeout(this.longPressTimer);
            document.removeEventListener('mousemove', cancelLongPress);
            document.removeEventListener('mouseup', cancelLongPress);
        };
        
        document.addEventListener('mousemove', cancelLongPress);
        document.addEventListener('mouseup', cancelLongPress);
    }
    
    onCardTouch(e, card) {
        // Same logic for touch
        this.longPressTimer = setTimeout(() => {
            this.open(card);
            // Vibrate if available
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        }, this.longPressDelay);
        
        const cancelLongPress = () => {
            clearTimeout(this.longPressTimer);
            card.removeEventListener('touchmove', cancelLongPress);
            card.removeEventListener('touchend', cancelLongPress);
        };
        
        card.addEventListener('touchmove', cancelLongPress, { passive: true });
        card.addEventListener('touchend', cancelLongPress);
    }
    
    open(card) {
        // Clone card into overlay
        const clone = card.cloneNode(true);
        clone.classList.add('tactile-active');
        
        this.cardContainer.innerHTML = '';
        this.cardContainer.appendChild(clone);
        
        this.activeCard = clone;
        this.originalCard = card;
        
        // Reset transforms
        this.rotation = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };
        this.scale = 1;
        this.targetScale = 1;
        this.isFlipped = false;
        this.velocity = { x: 0, y: 0 };
        
        // Show overlay
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Bind interaction events
        this.bindInteractionEvents();
        
        // Start animation loop
        this.animate();
        
        // Entrance animation
        clone.style.transform = 'perspective(1200px) rotateY(-30deg) scale(0.8)';
        setTimeout(() => {
            clone.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            clone.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
            setTimeout(() => {
                clone.style.transition = '';
            }, 500);
        }, 50);
    }
    
    close() {
        if (!this.activeCard) return;
        
        // Exit animation
        this.activeCard.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        this.activeCard.style.transform = 'perspective(1200px) rotateY(30deg) scale(0.8)';
        this.activeCard.style.opacity = '0';
        
        setTimeout(() => {
            this.overlay.classList.remove('active');
            document.body.style.overflow = '';
            this.cardContainer.innerHTML = '';
            this.activeCard = null;
            
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
        }, 300);
    }
    
    bindInteractionEvents() {
        // Mouse drag for rotation
        this.cardContainer.addEventListener('mousedown', (e) => this.onDragStart(e));
        document.addEventListener('mousemove', (e) => this.onDragMove(e));
        document.addEventListener('mouseup', () => this.onDragEnd());
        
        // Touch drag
        this.cardContainer.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
        this.cardContainer.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
        this.cardContainer.addEventListener('touchend', () => this.onDragEnd());
        
        // Scroll for zoom
        this.cardContainer.addEventListener('wheel', (e) => this.onZoom(e));
        
        // Double-click to flip
        this.cardContainer.addEventListener('dblclick', () => this.flip());
    }
    
    onDragStart(e) {
        if (!this.activeCard) return;
        
        this.isDragging = true;
        this.isGrabbing = true;
        this.startPos = { x: e.clientX, y: e.clientY };
        this.lastPos = { x: e.clientX, y: e.clientY };
        this.velocity = { x: 0, y: 0 };
        
        this.activeCard.classList.add('grabbing');
    }
    
    onTouchStart(e) {
        if (!this.activeCard || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        this.isDragging = true;
        this.isGrabbing = true;
        this.startPos = { x: touch.clientX, y: touch.clientY };
        this.lastPos = { x: touch.clientX, y: touch.clientY };
        this.velocity = { x: 0, y: 0 };
        
        this.activeCard.classList.add('grabbing');
    }
    
    onDragMove(e) {
        if (!this.isDragging || !this.activeCard) return;
        
        const deltaX = e.clientX - this.lastPos.x;
        const deltaY = e.clientY - this.lastPos.y;
        
        // Update velocity for inertia
        this.velocity = { x: deltaX * 0.5, y: deltaY * 0.5 };
        
        // Update target rotation
        this.targetRotation.y += deltaX * 0.3;
        this.targetRotation.x -= deltaY * 0.3;
        
        // Clamp rotation
        this.targetRotation.x = Math.max(-this.maxRotation, Math.min(this.maxRotation, this.targetRotation.x));
        this.targetRotation.y = Math.max(-this.maxRotation * 2, Math.min(this.maxRotation * 2, this.targetRotation.y));
        
        this.lastPos = { x: e.clientX, y: e.clientY };
    }
    
    onTouchMove(e) {
        if (!this.isDragging || !this.activeCard || e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.lastPos.x;
        const deltaY = touch.clientY - this.lastPos.y;
        
        this.velocity = { x: deltaX * 0.5, y: deltaY * 0.5 };
        
        this.targetRotation.y += deltaX * 0.3;
        this.targetRotation.x -= deltaY * 0.3;
        
        this.targetRotation.x = Math.max(-this.maxRotation, Math.min(this.maxRotation, this.targetRotation.x));
        this.targetRotation.y = Math.max(-this.maxRotation * 2, Math.min(this.maxRotation * 2, this.targetRotation.y));
        
        this.lastPos = { x: touch.clientX, y: touch.clientY };
    }
    
    onDragEnd() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.isGrabbing = false;
        
        if (this.activeCard) {
            this.activeCard.classList.remove('grabbing');
        }
    }
    
    onZoom(e) {
        if (!this.activeCard) return;
        
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.targetScale = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetScale + delta));
        
        // Show zoom indicator
        this.showZoomIndicator();
    }
    
    showZoomIndicator() {
        let indicator = this.overlay.querySelector('.tactile-zoom-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'tactile-zoom-indicator';
            this.overlay.appendChild(indicator);
        }
        
        const percent = Math.round(this.targetScale * 100);
        indicator.textContent = `${percent}%`;
        indicator.classList.add('visible');
        
        clearTimeout(this.zoomIndicatorTimeout);
        this.zoomIndicatorTimeout = setTimeout(() => {
            indicator.classList.remove('visible');
        }, 1000);
    }
    
    flip() {
        if (!this.activeCard) return;
        
        this.isFlipped = !this.isFlipped;
        this.targetRotation.y += 180;
        
        // Vibrate feedback
        if ('vibrate' in navigator) {
            navigator.vibrate([30, 50, 30]);
        }
    }
    
    animate() {
        if (!this.activeCard) return;
        
        // Apply inertia when not dragging
        if (!this.isDragging) {
            this.targetRotation.y += this.velocity.x;
            this.targetRotation.x += this.velocity.y;
            
            // Decay velocity
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            
            // Stop when very slow
            if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
            if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;
        }
        
        // Lerp current towards target
        this.rotation.x += (this.targetRotation.x - this.rotation.x) * this.lerp;
        this.rotation.y += (this.targetRotation.y - this.rotation.y) * this.lerp;
        this.scale += (this.targetScale - this.scale) * this.lerp;
        
        // Apply transform
        const inner = this.activeCard.querySelector('.tactile-inner');
        if (inner) {
            inner.style.transform = `
                perspective(1200px)
                rotateX(${this.rotation.x}deg)
                rotateY(${this.rotation.y}deg)
                scale(${this.scale})
            `;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    addStyles() {
        if (document.getElementById('tactile-gallery-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'tactile-gallery-styles';
        style.textContent = `
            /* ════════════════════════════════════════
               TACTILE GALLERY STYLES
               ════════════════════════════════════════ */
            
            /* Enable 3D on cards */
            .tactile-enabled {
                perspective: 1200px;
                cursor: grab;
            }
            
            .tactile-enabled:active {
                cursor: grabbing;
            }
            
            .tactile-inner {
                position: relative;
                width: 100%;
                height: 100%;
                transform-style: preserve-3d;
                transition: transform 0.1s linear;
            }
            
            .tactile-front-face,
            .tactile-back-face {
                position: absolute;
                width: 100%;
                height: 100%;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            }
            
            .tactile-front-face {
                display: flex;
                flex-direction: column;
            }
            
            .tactile-back-face {
                transform: rotateY(180deg);
                background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
                border-radius: inherit;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }
            
            .tactile-back-content {
                text-align: center;
                color: #f4f3f0;
            }
            
            .tactile-back-content h3 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                font-family: 'Playfair Display', serif;
            }
            
            .tactile-back-desc {
                font-size: 0.9rem;
                opacity: 0.8;
                line-height: 1.6;
                margin-bottom: 1.5rem;
            }
            
            .tactile-back-meta {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                font-size: 0.85rem;
                opacity: 0.6;
            }
            
            .tactile-icon {
                font-size: 1.2rem;
            }
            
            .tactile-back-cta {
                margin-top: 2rem;
                font-size: 0.8rem;
                opacity: 0.5;
                animation: pulseHint 2s ease-in-out infinite;
            }
            
            @keyframes pulseHint {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.8; }
            }
            
            /* ════════════════════════════════════════
               OVERLAY (Full-Screen Mode)
               ════════════════════════════════════════ */
            
            .tactile-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.4s ease;
                backdrop-filter: blur(20px);
            }
            
            .tactile-overlay.active {
                opacity: 1;
                pointer-events: all;
            }
            
            .tactile-workspace {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .tactile-card-container {
                width: 60vmin;
                height: 60vmin;
                max-width: 500px;
                max-height: 500px;
                perspective: 1200px;
            }
            
            .tactile-card-container .tactile-enabled {
                width: 100%;
                height: 100%;
            }
            
            .tactile-card-container .tactile-inner {
                width: 100%;
                height: 100%;
                box-shadow: 
                    0 25px 50px -12px rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                overflow: hidden;
            }
            
            .tactile-card-container .tactile-front-face img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            /* Grabbing state */
            .tactile-card-container .grabbing {
                cursor: grabbing;
            }
            
            .tactile-card-container .grabbing .tactile-inner {
                box-shadow: 
                    0 50px 100px -20px rgba(0, 0, 0, 0.7),
                    0 0 0 2px rgba(255, 255, 255, 0.2);
            }
            
            /* ════════════════════════════════════════
               UI Elements
               ════════════════════════════════════════ */
            
            .tactile-close {
                position: absolute;
                top: 2rem;
                right: 2rem;
                width: 48px;
                height: 48px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }
            
            .tactile-close:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: rotate(90deg);
            }
            
            .tactile-instructions {
                position: absolute;
                bottom: 2rem;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 2rem;
                opacity: 0.6;
            }
            
            .tactile-hint {
                font-size: 0.85rem;
                color: white;
                white-space: nowrap;
            }
            
            .tactile-zoom-indicator {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                font-size: 1.2rem;
                font-weight: bold;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            
            .tactile-zoom-indicator.visible {
                opacity: 1;
            }
            
            /* ════════════════════════════════════════
               Hover Preview Effect (on cards in grid)
               ════════════════════════════════════════ */
            
            .tactile-enabled:hover .tactile-inner {
                transform: perspective(1200px) rotateX(5deg) rotateY(-5deg) scale(1.02);
            }
            
            .tactile-enabled::after {
                content: '🖐️ Mantén para explorar';
                position: absolute;
                bottom: -2rem;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.75rem;
                color: var(--text-secondary, #666);
                opacity: 0;
                transition: opacity 0.3s ease;
                white-space: nowrap;
                pointer-events: none;
            }
            
            .tactile-enabled:hover::after {
                opacity: 0.7;
            }
            
            /* ════════════════════════════════════════
               Mobile Adaptations
               ════════════════════════════════════════ */
            
            @media (max-width: 768px) {
                .tactile-card-container {
                    width: 85vmin;
                    height: 85vmin;
                }
                
                .tactile-instructions {
                    flex-direction: column;
                    gap: 0.5rem;
                    text-align: center;
                }
                
                .tactile-close {
                    top: 1rem;
                    right: 1rem;
                }
            }
            
            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .tactile-inner,
                .tactile-overlay,
                .tactile-close {
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Public API
    toggle(enabled) {
        // Enable/disable tactile mode on cards
        const cards = document.querySelectorAll('.tactile-enabled');
        cards.forEach(card => {
            card.style.pointerEvents = enabled ? '' : 'none';
        });
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.overlay?.remove();
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tactileGallery = new TactileGallery();
    });
} else {
    window.tactileGallery = new TactileGallery();
}
