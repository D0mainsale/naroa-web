/**
 * KONAMI CODE — Easter Egg System
 * ↑↑↓↓←→←→BA desbloquea galería secreta
 * v1.0.0 - 2026-01-24
 */

class KonamiCode {
    constructor() {
        this.sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                         'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                         'KeyB', 'KeyA'];
        this.current = 0;
        this.unlocked = false;
        this.secretGallery = null;
        
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', (e) => this.checkKey(e));
        this.addStyles();
        console.log('🎮 Konami Code listener active');
    }
    
    checkKey(e) {
        const expected = this.sequence[this.current];
        
        if (e.code === expected) {
            this.current++;
            this.showProgress();
            
            if (this.current === this.sequence.length) {
                this.unlock();
            }
        } else {
            this.current = 0;
        }
    }
    
    showProgress() {
        // Visual feedback for progress
        let indicator = document.querySelector('.konami-progress');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'konami-progress';
            document.body.appendChild(indicator);
        }
        
        const percent = (this.current / this.sequence.length) * 100;
        indicator.style.width = percent + '%';
        indicator.classList.add('visible');
        
        // Hide after delay if not complete
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            if (this.current < this.sequence.length) {
                indicator.classList.remove('visible');
            }
        }, 2000);
    }
    
    unlock() {
        if (this.unlocked) return;
        this.unlocked = true;
        
        // Epic unlock effect
        this.playUnlockSound();
        this.showUnlockAnimation();
        this.openSecretGallery();
        
        // Save to localStorage
        localStorage.setItem('naroa_konami_unlocked', 'true');
        
        console.log('🎮 KONAMI CODE ACTIVATED!');
    }
    
    playUnlockSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Victory fanfare
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'square';
                osc.frequency.value = freq;
                
                gain.gain.value = 0;
                gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + i * 0.15);
                gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.15 + 0.3);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.4);
            });
        } catch (e) {}
    }
    
    showUnlockAnimation() {
        const overlay = document.createElement('div');
        overlay.className = 'konami-unlock-overlay';
        overlay.innerHTML = `
            <div class="konami-unlock-content">
                <div class="konami-icon">🎮</div>
                <h2>¡CÓDIGO SECRETO!</h2>
                <p>Has desbloqueado la galería oculta de Naroa</p>
                <div class="konami-arrows">↑↑↓↓←→←→BA</div>
            </div>
        `;
        document.body.appendChild(overlay);
        
        // Animate in
        requestAnimationFrame(() => overlay.classList.add('visible'));
        
        // Close on click
        overlay.addEventListener('click', () => {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 500);
        });
    }
    
    openSecretGallery() {
        // Create secret gallery with real Naroa artworks
        const secretArtworks = [
            { img: 'images/raw_albums/1004454256295953/000001_502621047_30066918842956108_5983738605909945795_n.jpg', title: 'DiviNos VaiVenes #1', quote: 'El primer trazo siempre miente' },
            { img: 'images/raw_albums/1026561114085267/000001_508860460_30059531670361492_5023806045470663708_n.jpg', title: 'Serie del Error #1', quote: 'Donde fallo, aparezco' },
            { img: 'images/raw_albums/1038960572845321/000001_509606201_30064484719866187_616299634168736457_n.jpg', title: 'Autorretrato en Mica', quote: 'Brillo mineral sobre papel verjurado' },
            { img: 'images/raw_albums/1039704190842335/000001_488219834_1324006279078790_4805796840152762036_n.jpg', title: 'Iconos Pop #1', quote: 'La cultura devora a sus hijos' },
            { img: 'images/raw_albums/1041107699297275/000001_509137620_30064979986483327_1780158801227972781_n.jpg', title: 'Retrato Prohibido', quote: 'Lo que nunca se mostró' },
            { img: 'images/raw_albums/1045418860270868/000001_488206279_1324201122392639_7414820400872876817_n.jpg', title: 'Boceto de Medianoche', quote: 'Las 3AM son para crear' },
            { img: 'images/raw_albums/1066297131516374/000001_488227480_1325000558979362_8703975246948711254_n.jpg', title: 'El Error Intencional', quote: 'Método, no accidente' },
            { img: 'images/raw_albums/1004454256295953/000003_509326644_30056689770645682_8498957474460490212_n.jpg', title: 'VaiVenes Cromáticos', quote: 'El color tiene memoria' },
        ];
        
        this.secretGallery = document.createElement('div');
        this.secretGallery.className = 'konami-secret-gallery';
        this.secretGallery.innerHTML = `
            <div class="secret-header">
                <h2>🔮 Galería Secreta</h2>
                <p>Obras nunca antes vistas • Experimentos • El Error</p>
                <button class="secret-close">Cerrar ✕</button>
            </div>
            <div class="secret-grid">
                ${secretArtworks.map((art, i) => `
                    <div class="secret-card" data-secret="${i + 1}">
                        <img src="${art.img}" alt="${art.title}" loading="lazy">
                        <div class="secret-overlay">
                            <span class="secret-title">${art.title}</span>
                            <em class="secret-quote">"${art.quote}"</em>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="secret-footer">
                <p>🎮 Gracias por descubrir este secreto • ↑↑↓↓←→←→BA</p>
            </div>
        `;
        
        document.body.appendChild(this.secretGallery);
        
        // Show after unlock animation
        setTimeout(() => {
            this.secretGallery.classList.add('visible');
        }, 2000);
        
        // Close button
        this.secretGallery.querySelector('.secret-close').addEventListener('click', () => {
            this.secretGallery.classList.remove('visible');
        });
    }
    
    addStyles() {
        if (document.getElementById('konami-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'konami-styles';
        style.textContent = `
            /* Konami Progress Bar */
            .konami-progress {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: linear-gradient(90deg, #ff0080, #7928ca, #ff0080);
                background-size: 200% 100%;
                animation: konamiGradient 1s linear infinite;
                z-index: 100000;
                transform: scaleX(0);
                transform-origin: left;
                transition: transform 0.3s ease;
                opacity: 0;
            }
            
            .konami-progress.visible {
                opacity: 1;
                transform: scaleX(1);
            }
            
            @keyframes konamiGradient {
                0% { background-position: 0% 50%; }
                100% { background-position: 200% 50%; }
            }
            
            /* Unlock Overlay */
            .konami-unlock-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 100001;
                opacity: 0;
                transition: opacity 0.5s;
                cursor: pointer;
            }
            
            .konami-unlock-overlay.visible {
                opacity: 1;
            }
            
            .konami-unlock-content {
                text-align: center;
                color: #fff;
                animation: konamiPulse 0.5s ease;
            }
            
            @keyframes konamiPulse {
                0% { transform: scale(0.5); opacity: 0; }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
            }
            
            .konami-icon {
                font-size: 5rem;
                animation: konamiFloat 2s ease-in-out infinite;
            }
            
            @keyframes konamiFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .konami-unlock-content h2 {
                font-size: 2.5rem;
                margin: 1rem 0;
                background: linear-gradient(90deg, #ff0080, #7928ca);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .konami-arrows {
                margin-top: 1rem;
                font-family: monospace;
                font-size: 1.5rem;
                opacity: 0.5;
            }
            
            /* Secret Gallery */
            .konami-secret-gallery {
                position: fixed;
                inset: 0;
                background: #0a0a0a;
                z-index: 99999;
                overflow-y: auto;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s;
            }
            
            .konami-secret-gallery.visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            .secret-header {
                text-align: center;
                padding: 3rem 2rem;
                border-bottom: 1px solid rgba(255, 0, 128, 0.2);
            }
            
            .secret-header h2 {
                color: #fff;
                font-size: 2rem;
                margin: 0;
            }
            
            .secret-header p {
                color: rgba(255, 255, 255, 0.5);
                margin: 0.5rem 0 1.5rem;
            }
            
            .secret-close {
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #fff;
                padding: 0.75rem 1.5rem;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .secret-close:hover {
                border-color: #ff0080;
                color: #ff0080;
            }
            
            .secret-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
                padding: 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }
            
            .secret-card {
                aspect-ratio: 3/4;
                border: 1px solid rgba(255, 0, 128, 0.3);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s;
                cursor: pointer;
                position: relative;
            }
            
            .secret-card img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.5s ease;
            }
            
            .secret-card:hover img {
                transform: scale(1.05);
            }
            
            .secret-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
                padding: 1rem;
                text-align: center;
            }
            
            .secret-card:hover .secret-overlay {
                opacity: 1;
            }
            
            .secret-title {
                color: #fff;
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .secret-quote {
                color: rgba(255, 255, 255, 0.7);
                font-style: italic;
                font-size: 0.9rem;
            }
            
            .secret-card:hover {
                border-color: #ff0080;
                transform: scale(1.02);
                box-shadow: 0 0 30px rgba(255, 0, 128, 0.2);
            }
            
            .secret-placeholder {
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
                color: rgba(255, 255, 255, 0.7);
                gap: 0.5rem;
            }
            
            .secret-icon {
                font-size: 3rem;
            }
            
            .secret-placeholder em {
                font-style: italic;
                opacity: 0.5;
                font-size: 0.85rem;
            }
            
            .secret-footer {
                text-align: center;
                padding: 2rem;
                color: rgba(255, 255, 255, 0.3);
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.konamiCode = new KonamiCode();
    });
} else {
    window.konamiCode = new KonamiCode();
}
