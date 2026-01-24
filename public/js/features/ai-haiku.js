/**
 * AI HAIKU — Poema Generativo
 * IA escribe un haiku único para cada obra
 * v1.0.0 - 2026-01-24
 */

class AIHaiku {
    constructor() {
        this.haikuCache = {};
        this.isGenerating = false;
        
        // Pre-generated haikus inspired by Naroa's RecreArte philosophy
        // From critical study: "La Resonancia de lo Íntimo y lo Icónico"
        this.fallbackHaikus = {
            'default': [
                'Trazos en silencio\nel error se vuelve luz\nel alma respira',
                'Grafito y mica\nbrillan en la oscuridad\nmundo interior',
                'La espera crea\nlo que la prisa destruye\ntiempo de crear',
                'Rostro en el papel\nespejos del alma misma\nmirada infinita',
                'RecreArte vive\npenicilina del alma\njuego y sanación',
                'Arte no es elite\nes recreo para todos\nNaroa lo sabe',
            ],
            'retrato': [
                'Ojos que hablan\nsin palabras ni silencios\npura presencia',
                'Tu rostro en trazos\ncada línea es un verso\npoema visual',
                'Freddie en mica\nPaul Newman en grafito\níconos del alma',
                'Asúcar dice\nCelia Cruz entre colores\nvibra la alegría',
            ],
            'error': [
                'El error bendito\nrevela lo que escondemos\nverdad en la falla',
                'Glitch de la vida\ndonde fallo, aparezco\nerror como arte',
            ],
            'mica': [
                'Brillo mineral\ncaverna abraza al cielo\nluz en oscuridad',
                'Polvo de estrellas\nsobre papel verjurado\nmica universal',
            ],
            'vaivenes': [
                'DiviNos vaivén\nel movimiento es quietud\ndualidad viva',
                'VaiVenes cromáticos\nel color tiene memoria\ndanza del pigmento',
            ],
            'flores': [
                'Tissukaldeko\nloreak en textura\nintrospección',
                'Flor abstracta nace\nsímbolos de lo interior\nnaturaleza',
            ],
        };
        
        this.init();
    }
    
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.attachToArtworks();
        this.addStyles();
        
        // Re-attach on route changes
        window.addEventListener('hashchange', () => {
            setTimeout(() => this.attachToArtworks(), 500);
        });
        
        console.log('🔮 AI Haiku initialized');
    }
    
    attachToArtworks() {
        const artworkSelectors = [
            '.portfolio-card',
            '.artwork-card',
            '.galeria-item',
            '[data-artwork-id]',
            '.ritual-card',
        ];
        
        document.querySelectorAll(artworkSelectors.join(', ')).forEach(card => {
            if (card.dataset.haikuAttached) return;
            card.dataset.haikuAttached = 'true';
            
            // Add haiku button
            const btn = document.createElement('button');
            btn.className = 'haiku-btn';
            btn.innerHTML = '🔮';
            btn.title = 'Generar haiku';
            btn.setAttribute('aria-label', 'Generar haiku para esta obra');
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showHaiku(card);
            });
            
            card.style.position = 'relative';
            card.appendChild(btn);
        });
    }
    
    async showHaiku(card) {
        // Get artwork info
        const title = card.querySelector('h3, .card-title')?.textContent || 'Sin título';
        const description = card.querySelector('p, .card-desc')?.textContent || '';
        const artworkId = card.dataset.artworkId || this.hashString(title);
        
        // Check cache
        if (this.haikuCache[artworkId]) {
            this.displayHaiku(card, this.haikuCache[artworkId]);
            return;
        }
        
        // Show loading
        this.showLoading(card);
        
        // Generate haiku
        const haiku = await this.generateHaiku(title, description);
        this.haikuCache[artworkId] = haiku;
        
        // Display
        this.displayHaiku(card, haiku);
    }
    
    async generateHaiku(title, description) {
        // Try AI generation first (if Gemini API available)
        if (window.NaroaAI && window.NaroaAI.generateResponse) {
            try {
                const prompt = `Genera un haiku (5-7-5 sílabas) sobre esta obra de arte:
                Título: "${title}"
                Descripción: "${description}"
                
                El haiku debe reflejar la filosofía de Naroa: el error como método, la espera como herramienta.
                Responde SOLO con el haiku, sin explicaciones.`;
                
                const response = await window.NaroaAI.generateResponse(prompt);
                if (response && response.length < 200) {
                    return response;
                }
            } catch (e) {
                console.warn('AI generation failed, using fallback');
            }
        }
        
        // Fallback: smart selection based on keywords
        return this.selectFallbackHaiku(title, description);
    }
    
    selectFallbackHaiku(title, description) {
        const text = (title + ' ' + description).toLowerCase();
        
        // Match keywords to Naroa's series and themes
        if (text.includes('retrato') || text.includes('rostro') || text.includes('mirada') ||
            text.includes('freddie') || text.includes('mercury') || text.includes('newman') ||
            text.includes('celia') || text.includes('azúcar') || text.includes('asucar')) {
            return this.randomFrom(this.fallbackHaikus.retrato);
        }
        if (text.includes('vaiv') || text.includes('divino') || text.includes('cromático')) {
            return this.randomFrom(this.fallbackHaikus.vaivenes);
        }
        if (text.includes('flor') || text.includes('tissukaldeko') || text.includes('loreak') ||
            text.includes('textura') || text.includes('orgánic')) {
            return this.randomFrom(this.fallbackHaikus.flores);
        }
        if (text.includes('error') || text.includes('glitch') || text.includes('falla')) {
            return this.randomFrom(this.fallbackHaikus.error);
        }
        if (text.includes('mica') || text.includes('brillo') || text.includes('luz')) {
            return this.randomFrom(this.fallbackHaikus.mica);
        }
        
        // Default random
        return this.randomFrom(this.fallbackHaikus.default);
    }
    
    randomFrom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }
        return 'haiku_' + Math.abs(hash).toString(36);
    }
    
    showLoading(card) {
        let overlay = card.querySelector('.haiku-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'haiku-overlay';
            card.appendChild(overlay);
        }
        
        overlay.innerHTML = `
            <div class="haiku-loading">
                <span class="haiku-loading-icon">🔮</span>
                <span>Generando poema...</span>
            </div>
        `;
        overlay.classList.add('visible');
    }
    
    displayHaiku(card, haiku) {
        let overlay = card.querySelector('.haiku-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'haiku-overlay';
            card.appendChild(overlay);
        }
        
        // Format haiku (split by newlines or detect pattern)
        const formattedHaiku = this.formatHaiku(haiku);
        
        overlay.innerHTML = `
            <div class="haiku-content">
                <div class="haiku-icon">🔮</div>
                <div class="haiku-text">${formattedHaiku}</div>
                <button class="haiku-close">×</button>
            </div>
        `;
        overlay.classList.add('visible');
        
        // Play subtle sound
        this.playHaikuSound();
        
        // Close button
        overlay.querySelector('.haiku-close').addEventListener('click', (e) => {
            e.stopPropagation();
            overlay.classList.remove('visible');
        });
        
        // Close on outside click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('visible');
            }
        });
    }
    
    formatHaiku(text) {
        // Split by newlines or periods
        let lines = text.split(/[\n\.]+/).filter(l => l.trim());
        
        if (lines.length === 1) {
            // Try to split by syllable pattern (rough)
            const words = text.split(' ');
            lines = [];
            let current = '';
            let syllables = 0;
            const targetSyllables = [5, 7, 5];
            let lineIndex = 0;
            
            words.forEach(word => {
                const wordSyllables = this.countSyllables(word);
                if (syllables + wordSyllables <= targetSyllables[lineIndex]) {
                    current += (current ? ' ' : '') + word;
                    syllables += wordSyllables;
                } else {
                    if (current) lines.push(current);
                    current = word;
                    syllables = wordSyllables;
                    lineIndex = Math.min(lineIndex + 1, 2);
                }
            });
            if (current) lines.push(current);
        }
        
        return lines.slice(0, 3).map(l => `<span>${l.trim()}</span>`).join('');
    }
    
    countSyllables(word) {
        // Rough Spanish syllable count
        word = word.toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
        const vowels = word.match(/[aeiouáéíóúü]+/g);
        return vowels ? vowels.length : 1;
    }
    
    playHaikuSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            
            // Zen chime
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                gain.gain.value = 0;
                gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + i * 0.3 + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 1);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(ctx.currentTime + i * 0.3);
                osc.stop(ctx.currentTime + i * 0.3 + 1.5);
            });
        } catch (e) {}
    }
    
    addStyles() {
        if (document.getElementById('haiku-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'haiku-styles';
        style.textContent = `
            .haiku-btn {
                position: absolute;
                bottom: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.5);
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                font-size: 1.2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
            }
            
            .haiku-btn:hover {
                transform: scale(1.2);
                background: rgba(0, 0, 0, 0.7);
            }
            
            .haiku-overlay {
                position: absolute;
                inset: 0;
                background: rgba(10, 10, 10, 0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.5s ease;
                z-index: 20;
                border-radius: inherit;
            }
            
            .haiku-overlay.visible {
                opacity: 1;
                pointer-events: auto;
            }
            
            .haiku-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.5rem;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .haiku-loading-icon {
                font-size: 2rem;
                animation: haikuPulse 1s ease-in-out infinite;
            }
            
            @keyframes haikuPulse {
                0%, 100% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.1); opacity: 1; }
            }
            
            .haiku-content {
                text-align: center;
                padding: 2rem;
                position: relative;
            }
            
            .haiku-icon {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            
            .haiku-text {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .haiku-text span {
                color: #f4f3f0;
                font-size: 1rem;
                font-style: italic;
                line-height: 1.6;
            }
            
            .haiku-close {
                position: absolute;
                top: 0;
                right: 0;
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.5);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0.5rem;
                line-height: 1;
            }
            
            .haiku-close:hover {
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiHaiku = new AIHaiku();
    });
} else {
    window.aiHaiku = new AIHaiku();
}
