// === JUEGO DE LA OCA v2 - COMPLETO ===

class JuegoOca {
    constructor() {
        this.state = this.loadState();
        this.records = this.loadRecords();
        this.allImages = [];
        this.diceValue = 0;
        this.isRolling = false;
        this.audioCtx = null;
        this.turnosEspera = 0;
        
        // Casillas especiales
        this.OCAS = [5, 9, 14, 18, 23, 27, 32, 36, 41, 45, 50, 54, 59];
        this.PUENTE_1 = 6;
        this.PUENTE_2 = 12;
        this.POSADA = 19;
        this.POZO = 31;
        this.LABERINTO = 42;
        this.PRISION = 52;
        this.CALAVERA = 58;
        this.FINAL = 63;
        
        // Zonas de color
        this.ZONES = [
            { start: 1, end: 15, color: '#e8f5e9', name: 'Inicio' },
            { start: 16, end: 30, color: '#e3f2fd', name: 'Camino' },
            { start: 31, end: 45, color: '#fff3e0', name: 'Pruebas' },
            { start: 46, end: 63, color: '#fce4ec', name: 'Final' }
        ];
        
        // Frases poéticas de Naroa
        this.FRASES = [
            "Nada es excluyente. La realidad se complementa.",
            "El problema hecho trampolín.",
            "Puro kintsugi.",
            "Flores que rompen el asfalto.",
            "Nuestras oscuridades contienen chispas de luz.",
            "La esencia divina que anima nuestra carne y huesos.",
            "Complementarios, no contrarios.",
            "Belleza en la imperfección.",
            "Lo roto también brilla.",
            "El arte es un espejo del alma.",
            "Cada grieta cuenta una historia.",
            "La materia tiene memoria.",
            "Transformar el dolor en color.",
            "Somos polvo de estrellas.",
            "El caos también tiene orden.",
            "En las sombras hay reflejos.",
            "La fragilidad es fortaleza.",
            "Todo fluye, todo vuelve.",
            "El silencio también habla.",
            "Renacer de las cenizas."
        ];
        
        this.init();
    }

    loadState() {
        const saved = localStorage.getItem('naroa_oca');
        return saved ? JSON.parse(saved) : {
            position: 1,
            visited: [1],
            totalRolls: 0,
            gameComplete: false
        };
    }

    loadRecords() {
        const saved = localStorage.getItem('naroa_records');
        return saved ? JSON.parse(saved) : {
            bestRolls: null,
            gamesPlayed: 0,
            allVisited: []
        };
    }

    saveState() {
        localStorage.setItem('naroa_oca', JSON.stringify(this.state));
    }

    saveRecords() {
        localStorage.setItem('naroa_records', JSON.stringify(this.records));
    }

    resetGame() {
        localStorage.removeItem('naroa_oca');
        location.reload();
    }

    // === AUDIO ===
    initAudio() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playSound(type) {
        if (!this.audioCtx) this.initAudio();
        const ctx = this.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const sounds = {
            roll: () => {
                osc.frequency.setValueAtTime(200, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
                osc.start(); osc.stop(ctx.currentTime + 0.12);
            },
            move: () => {
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                gain.gain.setValueAtTime(0.06, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
                osc.start(); osc.stop(ctx.currentTime + 0.04);
            },
            oca: () => {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start(); osc.stop(ctx.currentTime + 0.35);
            },
            bad: () => {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
                gain.gain.setValueAtTime(0.12, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.start(); osc.stop(ctx.currentTime + 0.25);
            },
            win: () => {
                osc.type = 'sine';
                [523, 659, 784, 1047].forEach((f, i) => {
                    osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.12);
                });
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
                osc.start(); osc.stop(ctx.currentTime + 0.6);
            }
        };
        if (sounds[type]) sounds[type]();
    }

    async init() {
        try {
            const response = await fetch('data/gallery.json');
            const data = await response.json();
            if (data.albums) {
                data.albums.forEach(album => {
                    if (album.images) album.images.forEach(src => this.allImages.push(src));
                });
            }
            this.allImages = this.shuffle(this.allImages);
            this.renderBoard();
            this.createUI();
            this.setupSecretContact();
        } catch (e) {
            console.error(e);
        }
    }

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    getZoneColor(pos) {
        const zone = this.ZONES.find(z => pos >= z.start && pos <= z.end);
        return zone ? zone.color : '#f4f3f0';
    }

    getSpecialType(pos) {
        if (this.OCAS.includes(pos)) return 'oca';
        if (pos === this.PUENTE_1 || pos === this.PUENTE_2) return 'puente';
        if (pos === this.POSADA) return 'posada';
        if (pos === this.POZO) return 'pozo';
        if (pos === this.LABERINTO) return 'laberinto';
        if (pos === this.PRISION) return 'prision';
        if (pos === this.CALAVERA) return 'calavera';
        if (pos === this.FINAL) return 'final';
        return null;
    }

    getSpecialEmoji(type) {
        return { oca: '🦆', puente: '🌉', posada: '🏨', pozo: '🕳️', 
                 laberinto: '🌀', prision: '⛓️', calavera: '💀', final: '🏆' }[type] || '';
    }

    // Cálculo de posición serpiente (zigzag)
    getSerpentinePosition(pos) {
        const cols = 9;
        const row = Math.floor((pos - 1) / cols);
        const colInRow = (pos - 1) % cols;
        const col = row % 2 === 0 ? colInRow : (cols - 1 - colInRow);
        return { row, col };
    }

    renderBoard() {
        const gallery = document.getElementById('archive-gallery');
        gallery.innerHTML = '';
        gallery.style.display = 'grid';
        gallery.style.gridTemplateColumns = 'repeat(9, 1fr)';
        
        // Crear array de 63 posiciones
        const tiles = [];
        for (let i = 1; i <= 63; i++) {
            const { row, col } = this.getSerpentinePosition(i);
            tiles.push({ pos: i, row, col });
        }
        
        // Ordenar por fila y columna para renderizado
        tiles.sort((a, b) => a.row - b.row || a.col - b.col);
        
        tiles.forEach(({ pos }) => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.pos = pos;
            tile.style.backgroundColor = this.getZoneColor(pos);
            
            const specialType = this.getSpecialType(pos);
            if (specialType) tile.classList.add(`special-${specialType}`);

            const imgSrc = this.allImages[(pos - 1) % this.allImages.length];
            const img = document.createElement('img');
            img.src = imgSrc;
            img.loading = pos < 20 ? 'eager' : 'lazy';

            const number = document.createElement('span');
            number.className = 'tile-number';
            number.textContent = pos;

            if (specialType) {
                const emoji = document.createElement('span');
                emoji.className = 'tile-emoji';
                emoji.textContent = this.getSpecialEmoji(specialType);
                tile.appendChild(emoji);
            }

            if (!this.state.visited.includes(pos)) {
                tile.classList.add('hidden-tile');
            }

            tile.appendChild(img);
            tile.appendChild(number);
            gallery.appendChild(tile);
            
            // Guardar en records
            if (this.state.visited.includes(pos) && !this.records.allVisited.includes(pos)) {
                this.records.allVisited.push(pos);
                this.saveRecords();
            }
        });

        this.updatePosition();
        this.createLightbox();
    }

    createLightbox() {
        if (document.getElementById('main-lightbox')) return;
        
        const lightbox = document.createElement('div');
        lightbox.id = 'main-lightbox';
        lightbox.className = 'gallery-lightbox';
        lightbox.innerHTML = '<img src="" alt=""><span class="lightbox-close">✕</span>';
        document.body.appendChild(lightbox);
        
        // Click en tiles revelados para ampliar
        document.querySelectorAll('.tile:not(.hidden-tile)').forEach(tile => {
            tile.style.cursor = 'pointer';
            tile.addEventListener('click', (e) => {
                if (e.target.closest('.dice')) return;
                const img = tile.querySelector('img');
                if (img) {
                    lightbox.querySelector('img').src = img.src;
                    lightbox.classList.add('visible');
                }
            });
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target.classList.contains('lightbox-close') || e.target === lightbox) {
                lightbox.classList.remove('visible');
            }
        });
    }

    createUI() {
        // Dado
        const dice = document.createElement('div');
        dice.id = 'dice';
        dice.className = 'dice';
        dice.innerHTML = `
            <div class="dice-inner">
                <div class="dice-face">🎲</div>
                <div class="dice-value"></div>
            </div>
            <div class="dice-label">TIRAR</div>
        `;
        document.body.appendChild(dice);
        dice.addEventListener('click', () => this.roll());

        // HUD
        const hud = document.createElement('div');
        hud.id = 'game-hud';
        hud.className = 'game-hud';
        const bestText = this.records.bestRolls ? `🏆 ${this.records.bestRolls}` : '-';
        hud.innerHTML = `
            <div class="hud-row">
                <div class="hud-item">
                    <span class="hud-label">Casilla</span>
                    <span id="hud-pos" class="hud-value">${this.state.position}</span>
                    <span class="hud-total">/ 63</span>
                </div>
                <div class="hud-item">
                    <span class="hud-label">Tiradas</span>
                    <span id="hud-rolls" class="hud-value">${this.state.totalRolls}</span>
                </div>
                <div class="hud-item">
                    <span class="hud-label">Récord</span>
                    <span id="hud-best" class="hud-value">${bestText}</span>
                </div>
            </div>
            <div class="hud-buttons">
                <button id="gallery-btn" class="hud-btn">🎨 Galería</button>
                <button id="reset-btn" class="hud-btn">🔄 Nueva</button>
            </div>
        `;
        document.body.appendChild(hud);
        
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('gallery-btn').addEventListener('click', () => this.showGallery());
    }

    roll() {
        if (this.isRolling || this.state.gameComplete) return;
        
        if (this.turnosEspera > 0) {
            this.turnosEspera--;
            this.showWhisper(`⏳ Pierdes turno. Te quedan ${this.turnosEspera} más.`);
            return;
        }
        
        this.isRolling = true;
        this.playSound('roll');

        const dice = document.getElementById('dice');
        const face = dice.querySelector('.dice-face');
        const valueEl = dice.querySelector('.dice-value');
        
        dice.classList.add('rolling');
        const diceSymbols = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

        // Animate dice rolling
        let ticks = 0;
        const rollInterval = setInterval(() => {
            face.textContent = diceSymbols[Math.floor(Math.random() * 6)];
            ticks++;
            if (ticks > 10) {
                clearInterval(rollInterval);
                
                // 10% chance of golden ratio result
                const isGoldenRoll = Math.random() < 0.1;
                
                if (isGoldenRoll) {
                    // φ⁻¹ = 0.618
                    this.diceValue = 0.618;
                    face.textContent = 'φ⁻¹';
                    face.style.fontSize = 'var(--font-lg)';
                    valueEl.textContent = '+0.618';
                    valueEl.style.color = 'var(--ritual-gold, #ffd700)';
                } else {
                    // Normal 1-6 result
                    this.diceValue = Math.floor(Math.random() * 6) + 1;
                    face.textContent = diceSymbols[this.diceValue - 1];
                    face.style.fontSize = '';
                    valueEl.textContent = `+${this.diceValue}`;
                    valueEl.style.color = '';
                }
                
                dice.classList.remove('rolling');
                this.state.totalRolls++; // Keep this line from original
                setTimeout(() => this.move(), 500);
            }
        }, 100); // Changed interval time
    }

    move() { // Renamed from movePlayer
        const oldPos = this.state.position; // Changed from this.currentPos
        let newPos = oldPos + this.diceValue;
        
        if (newPos > 63) {
            newPos = 63 - (newPos - 63);
            this.showWhisper('↩️ ¡Rebote!');
        }

        this.animateMovement(oldPos, newPos);
    }

    animateMovement(from, to) {
        let current = from;
        const direction = to > from ? 1 : -1;
        
        const step = () => {
            if ((direction > 0 && current < to) || (direction < 0 && current > to)) {
                current += direction;
                this.highlightTile(current);
                this.playSound('move');
                setTimeout(step, 100);
            } else {
                this.state.position = to;
                this.revealTile(to);
                this.updatePosition();
                this.updateHUD();
                this.saveState();
                setTimeout(() => {
                    this.checkSpecialTile(to);
                    this.isRolling = false;
                }, 200);
            }
        };
        step();
    }

    highlightTile(pos) {
        document.querySelectorAll('.tile.stepping').forEach(t => t.classList.remove('stepping'));
        const tile = document.querySelector(`.tile[data-pos="${pos}"]`);
        if (tile) tile.classList.add('stepping');
    }

    revealTile(pos) {
        const tile = document.querySelector(`.tile[data-pos="${pos}"]`);
        if (tile) {
            tile.classList.remove('hidden-tile');
            
            // Si es primera vez que visita, mostrar frase
            if (!this.state.visited.includes(pos)) {
                this.state.visited.push(pos);
                
                // Mostrar frase poética aleatoria
                const frase = this.FRASES[Math.floor(Math.random() * this.FRASES.length)];
                this.showQuote(frase);
                
                if (!this.records.allVisited.includes(pos)) {
                    this.records.allVisited.push(pos);
                    this.saveRecords();
                }
            }
        }
    }
    
    showQuote(text) {
        let quote = document.getElementById('naroa-quote');
        if (!quote) {
            quote = document.createElement('div');
            quote.id = 'naroa-quote';
            document.body.appendChild(quote);
        }
        quote.textContent = `"${text}"`;
        quote.classList.add('visible');
        setTimeout(() => quote.classList.remove('visible'), 4000);
    }

    updatePosition() {
        document.querySelectorAll('.tile.current, .tile.stepping').forEach(t => {
            t.classList.remove('current', 'stepping');
        });
        const currentTile = document.querySelector(`.tile[data-pos="${this.state.position}"]`);
        if (currentTile) {
            currentTile.classList.add('current');
            currentTile.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateHUD() {
        document.getElementById('hud-pos').textContent = this.state.position;
        document.getElementById('hud-rolls').textContent = this.state.totalRolls;
    }

    checkSpecialTile(pos) {
        const type = this.getSpecialType(pos);
        if (!type) {
            const tile = document.querySelector(`.tile[data-pos="${pos}"]`);
            if (tile) {
                tile.classList.add('expanded');
                setTimeout(() => tile.classList.remove('expanded'), 2000);
            }
            return;
        }

        const actions = {
            oca: () => {
                this.playSound('oca');
                this.showWhisper('🦆 ¡De oca a oca y tiro!');
                setTimeout(() => this.roll(), 1200);
            },
            puente: () => {
                this.playSound('oca');
                const dest = pos === 6 ? 12 : 6;
                this.showWhisper(`🌉 ¡De puente a puente!`);
                setTimeout(() => {
                    this.state.position = dest;
                    this.revealTile(dest);
                    this.updatePosition();
                    this.saveState();
                    setTimeout(() => this.roll(), 500);
                }, 800);
            },
            posada: () => {
                this.playSound('bad');
                this.turnosEspera = 1;
                this.showWhisper('🏨 Posada. Pierdes 1 turno.');
            },
            pozo: () => {
                this.playSound('bad');
                this.turnosEspera = 2;
                this.showWhisper('🕳️ ¡Pozo! Pierdes 2 turnos.');
            },
            laberinto: () => {
                this.playSound('bad');
                this.showWhisper('🌀 ¡Laberinto! Vuelves a 30.');
                setTimeout(() => {
                    this.state.position = 30;
                    this.revealTile(30);
                    this.updatePosition();
                    this.saveState();
                }, 800);
            },
            prision: () => {
                this.playSound('bad');
                this.turnosEspera = 3;
                this.showWhisper('⛓️ ¡Prisión! 3 turnos.');
            },
            calavera: () => {
                this.playSound('bad');
                this.showWhisper('💀 ¡Muerte! Vuelves al inicio...');
                setTimeout(() => {
                    this.state.position = 1;
                    this.updatePosition();
                    this.saveState();
                }, 1200);
            },
            final: () => {
                this.playSound('win');
                this.state.gameComplete = true;
                this.records.gamesPlayed++;
                if (!this.records.bestRolls || this.state.totalRolls < this.records.bestRolls) {
                    this.records.bestRolls = this.state.totalRolls;
                    this.showWhisper('🏆 ¡NUEVO RÉCORD!');
                } else {
                    this.showWhisper('🏆 ¡VICTORIA!');
                }
                this.saveRecords();
                this.saveState();
                document.getElementById('dice').classList.add('disabled');
                document.getElementById('hud-best').textContent = `🏆 ${this.records.bestRolls}`;
                this.showConfetti();
                setTimeout(() => this.showVictoryModal(), 2000);
            }
        };
        if (actions[type]) actions[type]();
    }

    showConfetti() {
        const container = document.createElement('div');
        container.id = 'confetti';
        document.body.appendChild(container);
        
        const colors = ['#c93030', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#FFD700'];
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            container.appendChild(confetti);
        }
        setTimeout(() => container.remove(), 5000);
    }

    showVictoryModal() {
        const modal = document.createElement('div');
        modal.id = 'victory-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>🏆 ¡Victoria!</h2>
                <p>Casillas: <strong>63</strong></p>
                <p>Tiradas: <strong>${this.state.totalRolls}</strong></p>
                <p>Obras descubiertas: <strong>${this.records.allVisited.length}</strong> / 63</p>
                <p>Mejor récord: <strong>${this.records.bestRolls}</strong> tiradas</p>
                <div class="modal-buttons">
                    <button id="share-btn">📤 Compartir</button>
                    <button id="play-again-btn">🔄 Jugar otra vez</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('visible'), 50);
        
        document.getElementById('share-btn').addEventListener('click', () => this.shareResult());
        document.getElementById('play-again-btn').addEventListener('click', () => this.resetGame());
    }

    shareResult() {
        const rolls = this.state.totalRolls;
        const discovered = this.records.allVisited.length;
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`🦆 ¡Completé el Juego de la Oca de Naroa!\n🏆 ${rolls} tiradas\n🎨 ${discovered}/63 obras descubiertas\n\n👉 Juega tú también:`);
        const rawText = `🦆 ¡Completé el Juego de la Oca de Naroa!\n🏆 ${rolls} tiradas\n🎨 ${discovered}/63 obras descubiertas\n\n👉 ${window.location.href}`;
        
        // Create share modal
        const shareModal = document.createElement('div');
        shareModal.id = 'share-modal';
        shareModal.className = 'share-modal';
        shareModal.innerHTML = `
            <div class="share-content">
                <h3>📤 Compartir resultado</h3>
                <div class="share-preview">
                    <p>🦆 ¡Completé el Juego de la Oca de Naroa!</p>
                    <p>🏆 <strong>${rolls}</strong> tiradas · 🎨 <strong>${discovered}</strong>/63 obras</p>
                </div>
                <div class="share-buttons">
                    <button class="share-option twitter" data-url="https://twitter.com/intent/tweet?text=${text}&url=${url}">
                        <span>𝕏</span> Twitter
                    </button>
                    <button class="share-option whatsapp" data-url="https://wa.me/?text=${text}%20${url}">
                        <span>💬</span> WhatsApp
                    </button>
                    <button class="share-option facebook" data-url="https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}">
                        <span>📘</span> Facebook
                    </button>
                    <button class="share-option copy" data-text="${rawText}">
                        <span>📋</span> Copiar
                    </button>
                </div>
                <button class="share-close">Cerrar</button>
            </div>
        `;
        document.body.appendChild(shareModal);
        setTimeout(() => shareModal.classList.add('visible'), 50);
        
        // Platform buttons
        shareModal.querySelectorAll('.share-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('copy')) {
                    navigator.clipboard.writeText(rawText);
                    this.showWhisper('📋 ¡Copiado!');
                } else {
                    window.open(btn.dataset.url, '_blank', 'width=600,height=400');
                }
                shareModal.classList.remove('visible');
                setTimeout(() => shareModal.remove(), 300);
            });
        });
        
        // Close button
        shareModal.querySelector('.share-close').addEventListener('click', () => {
            shareModal.classList.remove('visible');
            setTimeout(() => shareModal.remove(), 300);
        });
    }

    showGallery() {
        const modal = document.createElement('div');
        modal.id = 'gallery-modal';
        
        const discovered = this.records.allVisited.length;
        const total = 63;
        const percent = Math.round((discovered / total) * 100);
        
        let galleryHTML = `
            <div class="gallery-stats">
                <div class="gallery-progress">
                    <div class="gallery-progress-bar" style="width: ${percent}%"></div>
                </div>
                <div class="gallery-stat-row">
                    <span><strong>${discovered}</strong> descubiertas</span>
                    <span><strong>${total - discovered}</strong> por descubrir</span>
                    <span><strong>${percent}%</strong> completado</span>
                </div>
            </div>
        `;
        
        galleryHTML += '<div class="gallery-grid">';
        for (let i = 1; i <= 63; i++) {
            const isDiscovered = this.records.allVisited.includes(i);
            const imgSrc = this.allImages[(i - 1) % this.allImages.length];
            const specialType = this.getSpecialType(i);
            const emoji = specialType ? this.getSpecialEmoji(specialType) : '';
            
            galleryHTML += `
                <div class="gallery-item ${isDiscovered ? 'discovered' : 'locked'}" data-src="${imgSrc}" data-pos="${i}">
                    ${isDiscovered ? `<img src="${imgSrc}" alt="Obra ${i}">` : `<span class="lock-icon">🔒</span>`}
                    <span class="gallery-num">${i}</span>
                    ${emoji ? `<span class="gallery-emoji">${emoji}</span>` : ''}
                </div>
            `;
        }
        galleryHTML += '</div>';
        galleryHTML += '<div id="gallery-lightbox" class="gallery-lightbox"><img src="" alt=""><span class="lightbox-close">✕</span></div>';
        
        modal.innerHTML = `
            <div class="modal-content gallery-content">
                <h2>🎨 Colección de Naroa</h2>
                ${galleryHTML}
                <button id="close-gallery">Cerrar galería</button>
            </div>
        `;
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('visible'), 50);
        
        // Click to expand
        modal.querySelectorAll('.gallery-item.discovered').forEach(item => {
            item.addEventListener('click', () => {
                const lightbox = document.getElementById('gallery-lightbox');
                lightbox.querySelector('img').src = item.dataset.src;
                lightbox.classList.add('visible');
            });
        });
        
        // Close lightbox
        document.getElementById('gallery-lightbox').addEventListener('click', (e) => {
            if (e.target.classList.contains('lightbox-close') || e.target.classList.contains('gallery-lightbox')) {
                e.currentTarget.classList.remove('visible');
            }
        });
        
        document.getElementById('close-gallery').addEventListener('click', () => {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        });
    }

    setupSecretContact() {
        let typed = '';
        document.addEventListener('keydown', (e) => {
            typed += e.key.toLowerCase();
            typed = typed.slice(-10);
            if (typed.includes('hola')) {
                this.revealContact();
                typed = '';
            }
        });
    }

    revealContact() {
        let contact = document.getElementById('secret-contact');
        if (contact) {
            contact.classList.toggle('visible');
            return;
        }
        contact = document.createElement('div');
        contact.id = 'secret-contact';
        contact.innerHTML = `
            <div class="contact-whisper">Me encontraste.</div>
            <div class="contact-info">
                <a href="mailto:naroa@naroa.eu">naroa@naroa.eu</a>
                <a href="https://instagram.com/naroagutierrezgil" target="_blank">@naroagutierrezgil</a>
                <span>Bilbao</span>
            </div>
            <button onclick="this.parentElement.classList.remove('visible')">Cerrar</button>
        `;
        document.body.appendChild(contact);
        setTimeout(() => contact.classList.add('visible'), 50);
    }

    showWhisper(text) {
        let whisper = document.getElementById('whisper');
        if (!whisper) {
            whisper = document.createElement('div');
            whisper.id = 'whisper';
            document.body.appendChild(whisper);
        }
        whisper.textContent = text;
        whisper.classList.add('visible');
        setTimeout(() => whisper.classList.remove('visible'), 3000);
    }
}

window.RitualGame = JuegoOca;
