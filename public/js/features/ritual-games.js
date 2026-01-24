/**
 * RITUAL GAMES - Sistema de Juegos Interactivos para el Ritual
 * Pregunta edad y adapta los juegos disponibles
 * 
 * Grupos de edad:
 * - Peques (5-12): Juegos coloridos y simples
 * - Jóvenes (13-17): Juegos más complejos
 * - Adultos (18+): Experiencias artísticas profundas
 */

class RitualGames {
    constructor() {
        this.ageGroup = localStorage.getItem('naroa_age_group');
        this.currentGame = null;
        
        // Games categorized by age
        this.games = {
            kids: [
                { id: 'colorea', name: '🎨 Colorea el Retrato', icon: '🖌️' },
                { id: 'memoria', name: '🧠 Memoria de Cuadros', icon: '🃏' },
                { id: 'puzzle', name: '🧩 Puzzle Artístico', icon: '🖼️' },
                { id: 'oca', name: '🦆 Juego de la Oca del Arte', icon: '🎲' }
            ],
            teens: [
                { id: 'quiz', name: '❓ Quiz del Arte', icon: '🎯' },
                { id: 'detective', name: '🔍 Detective de Obras', icon: '🕵️' },
                { id: 'remix', name: '🎭 Remix Artístico', icon: '✂️' },
                { id: 'oca', name: '🦆 Juego de la Oca', icon: '🎲' },
                { id: 'tarot', name: '🔮 Tarot del Artista', icon: '🌙' }
            ],
            adults: [
                { id: 'tarot', name: '🔮 Tarot del Artista', icon: '🌙' },
                { id: 'meditacion', name: '🧘 Meditación Visual', icon: '👁️' },
                { id: 'oca', name: '🦆 Juego de la Oca Ritual', icon: '🎲' },
                { id: 'cadaver', name: '✍️ Cadáver Exquisito', icon: '📝' },
                { id: 'reverso', name: '🔄 El Reverso Oculto', icon: '🖼️' },
                { id: 'silencio', name: '🤫 Contemplación Silente', icon: '◯' }
            ],
            seniors: [
                { id: 'meditacion', name: '🧘 Meditación Visual', icon: '👁️' },
                { id: 'tarot', name: '🔮 Tarot del Artista', icon: '🌙' },
                { id: 'oca', name: '🦆 Juego de la Oca Clásico', icon: '🎲' },
                { id: 'memoria', name: '🧠 Memoria de Cuadros', icon: '🃏' },
                { id: 'silencio', name: '🤫 Contemplación Silente', icon: '◯' },
                { id: 'colorea', name: '🎨 Colorea el Retrato', icon: '🖌️' }
            ]
        };
        
        this.init();
    }
    
    init() {
        // Only activate in ritual view
        if (!window.location.hash.includes('ritual')) {
            window.addEventListener('hashchange', () => {
                if (window.location.hash.includes('ritual')) {
                    this.showGamesInterface();
                }
            });
            return;
        }
        
        this.showGamesInterface();
    }
    
    showGamesInterface() {
        // Wait for ritual view to be visible
        setTimeout(() => {
            if (!this.ageGroup) {
                this.askAge();
            } else {
                this.showGameSelector();
            }
        }, 500);
    }
    
    askAge() {
        const modal = document.createElement('div');
        modal.className = 'ritual-age-modal';
        modal.innerHTML = `
            <div class="age-modal-content">
                <div class="age-icon">🎨</div>
                <h2>Bienvenid@ al Ritual</h2>
                <p>Para ofrecerte la mejor experiencia, ¿cuántos años tienes?</p>
                
                <div class="age-options">
                    <button class="age-btn" data-group="kids" data-ages="5-12">
                        <span class="age-emoji">🦋</span>
                        <span class="age-range">5-12 años</span>
                        <span class="age-label">Peques</span>
                    </button>
                    <button class="age-btn" data-group="teens" data-ages="13-17">
                        <span class="age-emoji">🌟</span>
                        <span class="age-range">13-17 años</span>
                        <span class="age-label">Jóvenes</span>
                    </button>
                    <button class="age-btn" data-group="adults" data-ages="18-44">
                        <span class="age-emoji">🌙</span>
                        <span class="age-range">18-44 años</span>
                        <span class="age-label">Adultos</span>
                    </button>
                    <button class="age-btn" data-group="seniors" data-ages="45+">
                        <span class="age-emoji">🌿</span>
                        <span class="age-range">+45 años</span>
                        <span class="age-label">Experiencia</span>
                    </button>
                </div>
                
                <p class="age-note">Tu elección se guardará para futuras visitas</p>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.addAgeModalStyles();
        
        // Animate in
        requestAnimationFrame(() => modal.classList.add('visible'));
        
        // Handle selection
        modal.querySelectorAll('.age-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.dataset.group;
                this.setAgeGroup(group);
                modal.classList.remove('visible');
                setTimeout(() => {
                    modal.remove();
                    this.showGameSelector();
                }, 400);
            });
        });
    }
    
    setAgeGroup(group) {
        this.ageGroup = group;
        localStorage.setItem('naroa_age_group', group);
        console.log(`🎭 Ritual Games: Age group set to ${group}`);
    }
    
    showGameSelector() {
        // Remove existing if any
        const existing = document.querySelector('.ritual-games-panel');
        if (existing) existing.remove();
        
        const games = this.games[this.ageGroup] || this.games.adults;
        
        const panel = document.createElement('div');
        panel.className = 'ritual-games-panel';
        
        const ageLabel = {
            kids: '🦋 Peques',
            teens: '🌟 Jóvenes', 
            adults: '🌙 Adultos',
            seniors: '🌿 Experiencia'
        }[this.ageGroup];
        
        panel.innerHTML = `
            <div class="games-header">
                <h3>🎮 Juegos del Ritual</h3>
                <span class="games-age-badge">${ageLabel}</span>
                <button class="games-change-age" title="Cambiar edad">⚙️</button>
            </div>
            <div class="games-grid">
                ${games.map(game => `
                    <button class="game-card" data-game="${game.id}">
                        <span class="game-icon">${game.icon}</span>
                        <span class="game-name">${game.name}</span>
                    </button>
                `).join('')}
            </div>
            <button class="games-toggle">🎮</button>
        `;
        
        document.body.appendChild(panel);
        this.addGamePanelStyles();
        
        // Toggle panel
        const toggle = panel.querySelector('.games-toggle');
        toggle.addEventListener('click', () => {
            panel.classList.toggle('open');
        });
        
        // Change age
        panel.querySelector('.games-change-age').addEventListener('click', () => {
            localStorage.removeItem('naroa_age_group');
            panel.remove();
            this.ageGroup = null;
            this.askAge();
        });
        
        // Game buttons
        panel.querySelectorAll('.game-card').forEach(btn => {
            btn.addEventListener('click', () => {
                this.launchGame(btn.dataset.game);
            });
        });
    }
    
    launchGame(gameId) {
        console.log(`🎮 Launching game: ${gameId}`);
        
        switch(gameId) {
            case 'oca':
                this.launchOca();
                break;
            case 'memoria':
                this.launchMemoria();
                break;
            case 'colorea':
                this.launchColorea();
                break;
            case 'puzzle':
                this.launchPuzzle();
                break;
            case 'tarot':
                this.launchTarot();
                break;
            case 'meditacion':
                this.launchMeditacion();
                break;
            case 'quiz':
                this.launchQuiz();
                break;
            case 'detective':
                this.launchDetective();
                break;
            case 'remix':
                this.launchRemix();
                break;
            case 'cadaver':
                this.launchCadaver();
                break;
            case 'reverso':
                this.launchReverso();
                break;
            case 'silencio':
                this.launchSilencio();
                break;
            default:
                this.showComingSoon(gameId);
        }
    }
    
    // ═══════════════════════════════════════════════════════════
    // JUEGO DE LA OCA ARTÍSTICO - Usa la clase JuegoOca v3
    // ═══════════════════════════════════════════════════════════
    launchOca() {
        // El juego de la oca usa la clase completa JuegoOca 
        // que está en /js/systems/archive.js
        // Incluye: 63 casillas con cuadros de Naroa, sistema de logros,
        // efectos de sonido, frases poéticas, y más
        
        if (typeof JuegoOca === 'undefined') {
            console.error('JuegoOca class not loaded. Loading...');
            const script = document.createElement('script');
            script.src = '/js/systems/archive.js';
            script.onload = () => {
                this.currentGame = new JuegoOca();
            };
            document.head.appendChild(script);
        } else {
            this.currentGame = new JuegoOca();
        }
    }
    
    findNextOca(currentPos, casillas) {
        for (let i = currentPos + 1; i < casillas.length; i++) {
            if (casillas[i].special === 'oca') return i;
        }
        return casillas.length - 1;
    }

    
    // ═══════════════════════════════════════════════════════════
    // MEMORIA DE CUADROS
    // ═══════════════════════════════════════════════════════════
    launchMemoria() {
        const overlay = this.createGameOverlay('Memoria de Cuadros', '🃏');
        const content = overlay.querySelector('.game-content');
        
        // Create pairs
        const symbols = ['🎨', '🖼️', '👤', '💎', '🌙', '🦆', '🌺', '✨'];
        const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
        
        let flipped = [];
        let matched = 0;
        let moves = 0;
        
        content.innerHTML = `
            <div class="memoria-stats">
                <span>Movimientos: <strong id="moves">0</strong></span>
                <span>Parejas: <strong id="matched">0</strong>/8</span>
            </div>
            <div class="memoria-grid">
                ${cards.map((symbol, i) => `
                    <button class="memoria-card" data-index="${i}" data-symbol="${symbol}">
                        <span class="card-back">🎴</span>
                        <span class="card-front">${symbol}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        const moveCounter = content.querySelector('#moves');
        const matchCounter = content.querySelector('#matched');
        
        content.querySelectorAll('.memoria-card').forEach(card => {
            card.addEventListener('click', () => {
                if (flipped.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;
                
                card.classList.add('flipped');
                flipped.push(card);
                
                if (flipped.length === 2) {
                    moves++;
                    moveCounter.textContent = moves;
                    
                    const [card1, card2] = flipped;
                    if (card1.dataset.symbol === card2.dataset.symbol) {
                        // Match!
                        setTimeout(() => {
                            card1.classList.add('matched');
                            card2.classList.add('matched');
                            matched++;
                            matchCounter.textContent = matched;
                            flipped = [];
                            
                            if (matched === 8) {
                                setTimeout(() => {
                                    alert(`🎉 ¡Ganaste en ${moves} movimientos!`);
                                }, 300);
                            }
                        }, 300);
                    } else {
                        // No match
                        setTimeout(() => {
                            card1.classList.remove('flipped');
                            card2.classList.remove('flipped');
                            flipped = [];
                        }, 1000);
                    }
                }
            });
        });
        
        this.addMemoriaStyles();
    }
    
    // ═══════════════════════════════════════════════════════════
    // TAROT DEL ARTISTA
    // ═══════════════════════════════════════════════════════════
    launchTarot() {
        const overlay = this.createGameOverlay('Tarot del Artista', '🔮');
        const content = overlay.querySelector('.game-content');
        
        const cartas = [
            { name: 'La Artista', meaning: 'Creatividad infinita. Confía en tu visión interior.', icon: '👩‍🎨' },
            { name: 'El Lienzo', meaning: 'Nuevos comienzos. El espacio en blanco es posibilidad pura.', icon: '🖼️' },
            { name: 'El Retrato', meaning: 'Introspección. Mira dentro de ti.', icon: '👤' },
            { name: 'La Materia', meaning: 'Conexión con lo físico. Toca, siente, crea.', icon: '🪨' },
            { name: 'El Glitch', meaning: 'Abraza lo imperfecto. El error es maestro.', icon: '⚡' },
            { name: 'La Repetición', meaning: 'Práctica y ritual. La constancia transforma.', icon: '🔄' },
            { name: 'El Pálpito', meaning: 'Sigue tu intuición. El corazón sabe.', icon: '❤️' },
            { name: 'La Mica', meaning: 'Brillo oculto. Hay luz en lo ordinario.', icon: '💎' },
            { name: 'El Silencio', meaning: 'Pausa necesaria. En el vacío surge la idea.', icon: '🤫' },
            { name: 'La Oca', meaning: 'Juego y azar. Déjate llevar por el camino.', icon: '🦆' }
        ];
        
        content.innerHTML = `
            <p class="tarot-intro">Concéntrate en una pregunta sobre tu camino creativo...</p>
            <div class="tarot-deck">
                ${cartas.map((_, i) => `
                    <div class="tarot-card" data-index="${i}">
                        <div class="tarot-back">🌙</div>
                    </div>
                `).join('')}
            </div>
            <div class="tarot-reading"></div>
        `;
        
        // Shuffle for this session
        const shuffled = [...cartas].sort(() => Math.random() - 0.5);
        
        content.querySelectorAll('.tarot-card').forEach((card, i) => {
            card.addEventListener('click', () => {
                if (card.classList.contains('revealed')) return;
                
                card.classList.add('revealed');
                const carta = shuffled[i];
                
                card.innerHTML = `
                    <div class="tarot-front">
                        <span class="tarot-icon">${carta.icon}</span>
                        <span class="tarot-name">${carta.name}</span>
                    </div>
                `;
                
                const reading = content.querySelector('.tarot-reading');
                reading.innerHTML = `
                    <div class="reading-card">
                        <h4>${carta.icon} ${carta.name}</h4>
                        <p>${carta.meaning}</p>
                    </div>
                `;
            });
        });
        
        this.addTarotStyles();
    }
    
    // ═══════════════════════════════════════════════════════════
    // COLOREA EL RETRATO (Kids)
    // ═══════════════════════════════════════════════════════════
    launchColorea() {
        const overlay = this.createGameOverlay('Colorea el Retrato', '🖌️');
        const content = overlay.querySelector('.game-content');
        
        content.innerHTML = `
            <div class="colorea-palette">
                ${['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#1A1A1A'].map(color => `
                    <button class="color-btn" style="background: ${color}" data-color="${color}"></button>
                `).join('')}
                <button class="color-btn eraser" data-color="#FFFFFF">🧹</button>
            </div>
            <canvas id="colorea-canvas" width="400" height="400"></canvas>
            <div class="colorea-controls">
                <button class="colorea-clear">🗑️ Borrar todo</button>
                <button class="colorea-save">💾 Guardar</button>
            </div>
        `;
        
        const canvas = content.querySelector('#colorea-canvas');
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let currentColor = '#FF6B6B';
        let brushSize = 10;
        
        // Draw outline of a face
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 400, 400);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(200, 200, 120, 150, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Eyes
        ctx.beginPath();
        ctx.ellipse(160, 170, 20, 15, 0, 0, Math.PI * 2);
        ctx.ellipse(240, 170, 20, 15, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Nose
        ctx.beginPath();
        ctx.moveTo(200, 190);
        ctx.lineTo(190, 230);
        ctx.lineTo(210, 230);
        ctx.stroke();
        // Mouth
        ctx.beginPath();
        ctx.arc(200, 270, 30, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        
        // Color selection
        content.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                content.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentColor = btn.dataset.color;
            });
        });
        
        // Drawing
        canvas.addEventListener('mousedown', () => isDrawing = true);
        canvas.addEventListener('mouseup', () => isDrawing = false);
        canvas.addEventListener('mouseleave', () => isDrawing = false);
        canvas.addEventListener('mousemove', (e) => {
            if (!isDrawing) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ctx.fillStyle = currentColor;
            ctx.beginPath();
            ctx.arc(x, y, brushSize, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Clear
        content.querySelector('.colorea-clear').addEventListener('click', () => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 400, 400);
        });
        
        // Save
        content.querySelector('.colorea-save').addEventListener('click', () => {
            const link = document.createElement('a');
            link.download = 'mi-retrato-naroa.png';
            link.href = canvas.toDataURL();
            link.click();
        });
        
        this.addColoreaStyles();
    }
    
    // ═══════════════════════════════════════════════════════════
    // MEDITACIÓN VISUAL
    // ═══════════════════════════════════════════════════════════
    launchMeditacion() {
        const overlay = this.createGameOverlay('Meditación Visual', '🧘');
        const content = overlay.querySelector('.game-content');
        
        content.innerHTML = `
            <div class="meditacion-instructions">
                <p>Respira profundamente y observa...</p>
            </div>
            <div class="meditacion-circle"></div>
            <div class="meditacion-breath">
                <span class="breath-text">Inhala...</span>
            </div>
        `;
        
        const breathText = content.querySelector('.breath-text');
        const circle = content.querySelector('.meditacion-circle');
        
        // 4-7-8 breathing
        const breathCycle = () => {
            // Inhale (4s)
            breathText.textContent = 'Inhala...';
            circle.style.transform = 'scale(1.5)';
            circle.style.transition = 'transform 4s ease-in';
            
            setTimeout(() => {
                // Hold (7s)
                breathText.textContent = 'Mantén...';
                
                setTimeout(() => {
                    // Exhale (8s)
                    breathText.textContent = 'Exhala...';
                    circle.style.transform = 'scale(1)';
                    circle.style.transition = 'transform 8s ease-out';
                    
                    setTimeout(breathCycle, 8000);
                }, 7000);
            }, 4000);
        };
        
        breathCycle();
        this.addMeditacionStyles();
    }
    
    // ═══════════════════════════════════════════════════════════
    // QUIZ DEL ARTE
    // ═══════════════════════════════════════════════════════════
    launchQuiz() {
        const overlay = this.createGameOverlay('Quiz del Arte', '❓');
        const content = overlay.querySelector('.game-content');
        
        const questions = [
            {
                q: '¿Qué significa "óleo" en pintura?',
                options: ['Tipo de pincel', 'Pintura con base de aceite', 'Un color', 'Técnica de dibujo'],
                correct: 1
            },
            {
                q: '¿Dónde vive y trabaja Naroa?',
                options: ['Madrid', 'Barcelona', 'Bilbao', 'Sevilla'],
                correct: 2
            },
            {
                q: '¿Qué es un retrato?',
                options: ['Paisaje', 'Representación de una persona', 'Bodegón', 'Escultura'],
                correct: 1
            },
            {
                q: '¿Qué es la mica en el arte?',
                options: ['Un mineral brillante', 'Un pincel', 'Un estilo', 'Una galería'],
                correct: 0
            },
            {
                q: '¿Qué es un "glitch" en el arte?',
                options: ['Error perfecto', 'Color brillante', 'Técnica clásica', 'Tipo de galería'],
                correct: 0
            }
        ];
        
        let currentQ = 0;
        let score = 0;
        
        const showQuestion = () => {
            const q = questions[currentQ];
            content.innerHTML = `
                <div class="quiz-progress">${currentQ + 1}/${questions.length}</div>
                <div class="quiz-question">${q.q}</div>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option" data-index="${i}">${opt}</button>
                    `).join('')}
                </div>
                <div class="quiz-score">Puntos: ${score}</div>
            `;
            
            content.querySelectorAll('.quiz-option').forEach(btn => {
                btn.addEventListener('click', () => {
                    const selected = parseInt(btn.dataset.index);
                    if (selected === q.correct) {
                        score++;
                        btn.classList.add('correct');
                    } else {
                        btn.classList.add('incorrect');
                        content.querySelectorAll('.quiz-option')[q.correct].classList.add('correct');
                    }
                    
                    setTimeout(() => {
                        currentQ++;
                        if (currentQ < questions.length) {
                            showQuestion();
                        } else {
                            content.innerHTML = `
                                <div class="quiz-final">
                                    <h3>🎉 ¡Quiz completado!</h3>
                                    <p>Puntuación: ${score}/${questions.length}</p>
                                    <p>${score >= 4 ? '¡Excelente! Eres un experto.' : score >= 2 ? 'Bien hecho. ¡Sigue aprendiendo!' : '¡Sigue explorando el arte!'}</p>
                                </div>
                            `;
                        }
                    }, 1500);
                });
            });
        };
        
        showQuestion();
        this.addQuizStyles();
    }
    
    // ═══════════════════════════════════════════════════════════
    // PUZZLE ARTÍSTICO
    // ═══════════════════════════════════════════════════════════
    launchPuzzle() {
        const overlay = this.createGameOverlay('Puzzle Artístico', '🧩');
        const content = overlay.querySelector('.game-content');
        
        // Simple sliding puzzle
        const tiles = [1, 2, 3, 4, 5, 6, 7, 8, null];
        const shuffled = [...tiles].sort(() => Math.random() - 0.5);
        
        const renderPuzzle = () => {
            content.innerHTML = `
                <div class="puzzle-grid">
                    ${shuffled.map((tile, i) => `
                        <button class="puzzle-tile ${tile === null ? 'empty' : ''}" 
                                data-index="${i}" 
                                data-value="${tile}">
                            ${tile || ''}
                        </button>
                    `).join('')}
                </div>
                <p class="puzzle-hint">Ordena los números del 1 al 8</p>
            `;
            
            content.querySelectorAll('.puzzle-tile').forEach(tile => {
                tile.addEventListener('click', () => {
                    const index = parseInt(tile.dataset.index);
                    const emptyIndex = shuffled.indexOf(null);
                    
                    // Check if adjacent
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    const emptyRow = Math.floor(emptyIndex / 3);
                    const emptyCol = emptyIndex % 3;
                    
                    const isAdjacent = (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
                    
                    if (isAdjacent) {
                        // Swap
                        [shuffled[index], shuffled[emptyIndex]] = [shuffled[emptyIndex], shuffled[index]];
                        renderPuzzle();
                        
                        // Check win
                        const isSolved = shuffled.slice(0, 8).every((v, i) => v === i + 1);
                        if (isSolved) {
                            setTimeout(() => alert('🎉 ¡Puzzle resuelto!'), 300);
                        }
                    }
                });
            });
        };
        
        renderPuzzle();
        this.addPuzzleStyles();
    }
    
    // ═══════════════════════════════════════════════════════════
    // PLACEHOLDER GAMES
    // ═══════════════════════════════════════════════════════════
    launchDetective() { this.showComingSoon('Detective de Obras'); }
    launchRemix() { this.showComingSoon('Remix Artístico'); }
    launchCadaver() { this.showComingSoon('Cadáver Exquisito'); }
    launchReverso() { this.showComingSoon('El Reverso Oculto'); }
    launchSilencio() { 
        // This one works - just silence mode
        document.body.classList.add('silence-mode');
        setTimeout(() => alert('🤫 Modo silencio activado. Haz clic en ◯ para desactivar.'), 500);
    }
    
    showComingSoon(name) {
        const overlay = this.createGameOverlay(name, '🔧');
        overlay.querySelector('.game-content').innerHTML = `
            <div class="coming-soon">
                <span class="cs-icon">🎨</span>
                <h3>Próximamente</h3>
                <p>Este juego está en desarrollo.</p>
                <p>¡Vuelve pronto!</p>
            </div>
        `;
    }
    
    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════
    createGameOverlay(title, icon) {
        // Remove any existing game overlay
        document.querySelectorAll('.game-overlay').forEach(o => o.remove());
        
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        overlay.innerHTML = `
            <div class="game-modal">
                <div class="game-header">
                    <h2>${icon} ${title}</h2>
                    <button class="game-close">✕</button>
                </div>
                <div class="game-content"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Animate in
        requestAnimationFrame(() => overlay.classList.add('visible'));
        
        // Close button
        overlay.querySelector('.game-close').addEventListener('click', () => {
            overlay.classList.remove('visible');
            setTimeout(() => overlay.remove(), 300);
        });
        
        // Close on backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('visible');
                setTimeout(() => overlay.remove(), 300);
            }
        });
        
        this.addBaseGameStyles();
        return overlay;
    }
    
    // ═══════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════
    addAgeModalStyles() {
        if (document.getElementById('age-modal-styles')) return;
        const style = document.createElement('style');
        style.id = 'age-modal-styles';
        style.textContent = `
            .ritual-age-modal {
                position: fixed;
                inset: 0;
                z-index: 100000;
                background: rgba(10, 10, 15, 0.95);
                -webkit-backdrop-filter: blur(20px);
                backdrop-filter: blur(20px);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.4s ease;
            }
            .ritual-age-modal.visible { opacity: 1; }
            .age-modal-content {
                text-align: center;
                max-width: 500px;
                padding: 3rem;
            }
            .age-icon { font-size: 4rem; margin-bottom: 1rem; }
            .age-modal-content h2 {
                font-family: 'Playfair Display', serif;
                font-size: 2rem;
                margin-bottom: 0.5rem;
                color: white;
            }
            .age-modal-content p { color: rgba(255,255,255,0.7); margin-bottom: 2rem; }
            .age-options { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
            .age-btn {
                background: rgba(255,255,255,0.1);
                border: 2px solid rgba(255,255,255,0.2);
                border-radius: 16px;
                padding: 1.5rem 2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 140px;
            }
            .age-btn:hover {
                background: rgba(255,255,255,0.2);
                border-color: rgba(255,255,255,0.4);
                transform: translateY(-4px);
            }
            .age-emoji { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; }
            .age-range { display: block; color: white; font-weight: 600; }
            .age-label { display: block; color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-top: 0.25rem; }
            .age-note { font-size: 0.75rem !important; color: rgba(255,255,255,0.4) !important; margin-top: 2rem !important; }
        `;
        document.head.appendChild(style);
    }
    
    addGamePanelStyles() {
        if (document.getElementById('game-panel-styles')) return;
        const style = document.createElement('style');
        style.id = 'game-panel-styles';
        style.textContent = `
            .ritual-games-panel {
                position: fixed;
                bottom: 24px;
                left: 24px;
                z-index: 10001;
                background: rgba(20, 18, 15, 0.95);
                -webkit-backdrop-filter: blur(20px);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 0;
                max-height: 60px;
                overflow: hidden;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .ritual-games-panel.open {
                max-height: 500px;
                padding: 1.5rem;
            }
            .games-toggle {
                position: absolute;
                bottom: 12px;
                left: 12px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: linear-gradient(135deg, #FF6B6B, #4ECDC4);
                border: none;
                font-size: 18px;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            .ritual-games-panel.open .games-toggle { display: none; }
            .games-toggle:hover { transform: scale(1.1); }
            .games-header {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .games-header h3 { color: white; margin: 0; font-size: 1rem; }
            .games-age-badge {
                background: rgba(255,255,255,0.1);
                padding: 0.25rem 0.75rem;
                border-radius: 20px;
                font-size: 0.75rem;
                color: rgba(255,255,255,0.7);
            }
            .games-change-age {
                margin-left: auto;
                background: none;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                opacity: 0.5;
                transition: opacity 0.2s;
            }
            .games-change-age:hover { opacity: 1; }
            .games-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 0.75rem;
            }
            .game-card {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }
            .game-card:hover {
                background: rgba(255,255,255,0.1);
                transform: translateY(-2px);
            }
            .game-icon { font-size: 1.5rem; display: block; margin-bottom: 0.5rem; }
            .game-name { font-size: 0.75rem; color: rgba(255,255,255,0.8); display: block; }
        `;
        document.head.appendChild(style);
    }
    
    addBaseGameStyles() {
        if (document.getElementById('base-game-styles')) return;
        const style = document.createElement('style');
        style.id = 'base-game-styles';
        style.textContent = `
            .game-overlay {
                position: fixed;
                inset: 0;
                z-index: 100001;
                background: rgba(10, 10, 15, 0.95);
                -webkit-backdrop-filter: blur(20px);
                backdrop-filter: blur(20px);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .game-overlay.visible { opacity: 1; }
            .game-modal {
                background: rgba(30, 28, 25, 0.98);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 24px;
                width: 90%;
                max-width: 600px;
                max-height: 85vh;
                overflow: auto;
            }
            .game-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .game-header h2 { color: white; margin: 0; font-size: 1.25rem; }
            .game-close {
                background: none;
                border: none;
                color: rgba(255,255,255,0.5);
                font-size: 1.5rem;
                cursor: pointer;
                transition: color 0.2s;
            }
            .game-close:hover { color: white; }
            .game-content { padding: 1.5rem; }
            .coming-soon { text-align: center; padding: 3rem; }
            .cs-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
            .coming-soon h3 { color: white; }
            .coming-soon p { color: rgba(255,255,255,0.6); }
        `;
        document.head.appendChild(style);
    }
    
    addOcaStyles() {
        if (document.getElementById('oca-styles')) return;
        const style = document.createElement('style');
        style.id = 'oca-styles';
        style.textContent = `
            .oca-board {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                margin-bottom: 1.5rem;
                position: relative;
            }
            .oca-casilla {
                aspect-ratio: 1;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 0.6rem;
                color: rgba(255,255,255,0.6);
            }
            .casilla-icon { font-size: 1.25rem; margin-bottom: 0.25rem; }
            .casilla-num { font-size: 0.5rem; opacity: 0.5; }
            .special-oca { background: rgba(255, 215, 0, 0.2); border-color: gold; }
            .special-calavera { background: rgba(255, 0, 0, 0.2); }
            .special-puente { background: rgba(0, 100, 255, 0.2); }
            .special-posada { background: rgba(0, 255, 100, 0.2); }
            .oca-ficha {
                position: absolute;
                font-size: 1.5rem;
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                top: calc((var(--pos) / 5) * (100% / 4));
                left: calc((var(--pos) % 5) * (100% / 5) + 10%);
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            }
            .oca-controls { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
            .oca-dice {
                background: linear-gradient(135deg, #4ECDC4, #44A3AA);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 1rem 2rem;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .oca-dice:hover:not(:disabled) { transform: scale(1.05); }
            .oca-dice:disabled { opacity: 0.5; cursor: not-allowed; }
            .oca-dice.rolling { animation: shake 0.5s ease; }
            @keyframes shake {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-15deg); }
                75% { transform: rotate(15deg); }
            }
            .oca-result { font-size: 1.5rem; color: white; }
            .oca-message {
                background: rgba(255,255,255,0.05);
                border-radius: 12px;
                padding: 1rem;
                color: rgba(255,255,255,0.8);
                min-height: 80px;
            }
            .oca-message strong { color: white; display: block; margin-bottom: 0.5rem; }
            .special-action { color: gold; font-style: italic; margin-top: 0.5rem; }
        `;
        document.head.appendChild(style);
    }
    
    addMemoriaStyles() {
        if (document.getElementById('memoria-styles')) return;
        const style = document.createElement('style');
        style.id = 'memoria-styles';
        style.textContent = `
            .memoria-stats { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 1rem;
                color: rgba(255,255,255,0.7);
            }
            .memoria-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 12px;
            }
            .memoria-card {
                aspect-ratio: 1;
                background: linear-gradient(135deg, #2a2825, #1a1815);
                border: 2px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                font-size: 2rem;
                cursor: pointer;
                position: relative;
                transition: all 0.3s ease;
            }
            .memoria-card:hover { transform: scale(1.05); }
            .card-back, .card-front {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.3s ease;
            }
            .card-front { opacity: 0; }
            .memoria-card.flipped .card-back { opacity: 0; }
            .memoria-card.flipped .card-front { opacity: 1; }
            .memoria-card.matched {
                background: linear-gradient(135deg, #4ECDC4, #44A3AA);
                border-color: #4ECDC4;
            }
        `;
        document.head.appendChild(style);
    }
    
    addTarotStyles() {
        if (document.getElementById('tarot-styles')) return;
        const style = document.createElement('style');
        style.id = 'tarot-styles';
        style.textContent = `
            .tarot-intro { text-align: center; color: rgba(255,255,255,0.7); margin-bottom: 1.5rem; font-style: italic; }
            .tarot-deck {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                justify-content: center;
                margin-bottom: 1.5rem;
            }
            .tarot-card {
                width: 60px;
                height: 90px;
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid rgba(255, 215, 0, 0.3);
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }
            .tarot-card:hover:not(.revealed) { 
                transform: translateY(-8px); 
                border-color: gold;
                box-shadow: 0 8px 20px rgba(255, 215, 0, 0.2);
            }
            .tarot-back { font-size: 2rem; }
            .tarot-card.revealed {
                background: linear-gradient(135deg, #2a1a4e, #1a0a3e);
                border-color: gold;
            }
            .tarot-front { text-align: center; }
            .tarot-icon { font-size: 1.5rem; display: block; }
            .tarot-name { font-size: 0.5rem; color: rgba(255,255,255,0.7); }
            .tarot-reading { 
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 12px;
                padding: 1.5rem;
                text-align: center;
            }
            .reading-card h4 { color: gold; margin: 0 0 0.5rem 0; }
            .reading-card p { color: rgba(255,255,255,0.8); margin: 0; font-style: italic; }
        `;
        document.head.appendChild(style);
    }
    
    addColoreaStyles() {
        if (document.getElementById('colorea-styles')) return;
        const style = document.createElement('style');
        style.id = 'colorea-styles';
        style.textContent = `
            .colorea-palette { display: flex; gap: 8px; justify-content: center; margin-bottom: 1rem; flex-wrap: wrap; }
            .color-btn {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                border: 3px solid transparent;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .color-btn:hover, .color-btn.active { border-color: white; transform: scale(1.15); }
            .eraser { background: white !important; font-size: 14px; }
            #colorea-canvas {
                display: block;
                margin: 0 auto 1rem;
                border-radius: 12px;
                cursor: crosshair;
                background: white;
            }
            .colorea-controls { display: flex; gap: 1rem; justify-content: center; }
            .colorea-controls button {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                padding: 0.75rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .colorea-controls button:hover { background: rgba(255,255,255,0.2); }
        `;
        document.head.appendChild(style);
    }
    
    addMeditacionStyles() {
        if (document.getElementById('meditacion-styles')) return;
        const style = document.createElement('style');
        style.id = 'meditacion-styles';
        style.textContent = `
            .meditacion-instructions { text-align: center; color: rgba(255,255,255,0.6); margin-bottom: 2rem; }
            .meditacion-circle {
                width: 200px;
                height: 200px;
                margin: 0 auto 2rem;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(78, 205, 196, 0.3), transparent);
                border: 2px solid rgba(78, 205, 196, 0.5);
            }
            .meditacion-breath { text-align: center; }
            .breath-text { 
                font-size: 1.5rem; 
                color: rgba(255,255,255,0.8);
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
    
    addQuizStyles() {
        if (document.getElementById('quiz-styles')) return;
        const style = document.createElement('style');
        style.id = 'quiz-styles';
        style.textContent = `
            .quiz-progress { text-align: right; color: rgba(255,255,255,0.5); margin-bottom: 1rem; }
            .quiz-question { 
                font-size: 1.25rem; 
                color: white; 
                margin-bottom: 1.5rem;
                text-align: center;
            }
            .quiz-options { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
            .quiz-option {
                background: rgba(255,255,255,0.05);
                border: 2px solid rgba(255,255,255,0.1);
                color: white;
                padding: 1rem;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: left;
            }
            .quiz-option:hover { background: rgba(255,255,255,0.1); }
            .quiz-option.correct { background: rgba(0, 200, 100, 0.3); border-color: #00c864; }
            .quiz-option.incorrect { background: rgba(255, 100, 100, 0.3); border-color: #ff6464; }
            .quiz-score { text-align: center; color: rgba(255,255,255,0.6); }
            .quiz-final { text-align: center; padding: 2rem; }
            .quiz-final h3 { color: white; }
            .quiz-final p { color: rgba(255,255,255,0.7); }
        `;
        document.head.appendChild(style);
    }
    
    addPuzzleStyles() {
        if (document.getElementById('puzzle-styles')) return;
        const style = document.createElement('style');
        style.id = 'puzzle-styles';
        style.textContent = `
            .puzzle-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                max-width: 300px;
                margin: 0 auto 1rem;
            }
            .puzzle-tile {
                aspect-ratio: 1;
                background: linear-gradient(135deg, #4ECDC4, #44A3AA);
                border: none;
                border-radius: 12px;
                font-size: 2rem;
                color: white;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .puzzle-tile:hover:not(.empty) { transform: scale(0.95); }
            .puzzle-tile.empty { 
                background: rgba(255,255,255,0.05);
                cursor: default;
            }
            .puzzle-hint { text-align: center; color: rgba(255,255,255,0.5); }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ritualGames = new RitualGames();
    });
} else {
    window.ritualGames = new RitualGames();
}

// Reset function for testing
window.resetRitualGames = () => {
    localStorage.removeItem('naroa_age_group');
    console.log('Ritual Games reset. Refresh to see age selector again.');
};
