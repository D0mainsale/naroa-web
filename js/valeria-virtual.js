/**
 * ═══════════════════════════════════════════════════════════════
 * VALERIA VIRTUAL - Asistente Artística Espectacular v1.0
 * ═══════════════════════════════════════════════════════════════
 * Una guía virtual con personalidad propia para el universo de Naroa
 */

class ValeriaVirtual {
    constructor() {
        this.isOpen = false;
        this.currentContext = null;
        this.personality = {
            name: 'Valeria',
            role: 'Guía del Taller',
            traits: ['cálida', 'sabia', 'juguetona'],
            emoji: '✨'
        };
        
        // Respuestas contextuales
        this.responses = {
            greeting: [
                "✨ ¡Hola! Soy Valeria, tu guía en este taller de luz y sombra. ¿Qué te trae por aquí?",
                "✨ Bienvenida, alma curiosa. Me llamo Valeria y conozco cada rincón de este espacio. ¿Te ayudo?",
                "✨ Hey! Soy Valeria ✨ Este taller está lleno de secretos... ¿exploramos juntos?"
            ],
            portfolio: [
                "Cada obra guarda una historia. ¿Ves cómo el grafito acaricia el papel? Naroa dice que el error es el camino.",
                "Mira estas piezas... Grafito, mica, carbón. No son solo materiales, son voces del alma.",
                "¿Sientes la intensidad? Estos retratos no son reflejos, son presencias."
            ],
            process: [
                "El proceso de Naroa es un vaivén... luz y oscuridad, precisión y accidente.",
                "Aquí todo nace del error. Lo que otros borran, Naroa lo abraza.",
                "La mica brilla sobre el grafito como estrellas en la noche. Así trabaja ella."
            ],
            retrato: [
                "¿Un retrato tuyo? No será una foto. Será una conversación en papel.",
                "Naroa no busca el parecido perfecto. Busca tu esencia, tu pálpito.",
                "Cada retrato lleva semanas. No es prisa, es ceremonia."
            ]
        };
        
        this.contextPrompts = {
            home: "Estás en el inicio. ¿Quieres explorar las obras, conocer el proceso o encargar tu retrato?",
            portfolio: "Estas son las obras más recientes. Haz clic en cualquiera para verla de cerca.",
            process: "Aquí descubres cómo trabaja Naroa: el error como método, la espera como herramienta.",
            retrato: "¿Listo para tu retrato? Es un proceso de conversación, tiempo y materia.",
            ritual: "Has entrado al Ritual... un juego donde cada casilla es un encuentro."
        };
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.setupListeners();
        this.detectContext();
        console.log('✨ Valeria Virtual ha despertado');
    }
    
    createUI() {
        // Panel flotante minimalista
        const panel = document.createElement('div');
        panel.id = 'valeria-panel';
        panel.className = 'valeria-panel';
        panel.innerHTML = `
            <div class="valeria-header">
                <div class="valeria-avatar">✨</div>
                <div class="valeria-identity">
                    <h3>Valeria</h3>
                    <p>Guía del Taller</p>
                </div>
                <button class="valeria-close" aria-label="Cerrar">×</button>
            </div>
            
            <div class="valeria-messages" id="valeria-messages">
                <div class="valeria-message valeria-assistant">
                    <div class="message-bubble">
                        ${this.getRandomResponse('greeting')}
                    </div>
                </div>
            </div>
            
            <div class="valeria-quick-actions">
                <button data-question="obras">Ver Obras</button>
                <button data-question="proceso">El Proceso</button>
                <button data-question="retrato">Encargar</button>
            </div>
            
            <div class="valeria-input-row">
                <input type="text" id="valeria-input" placeholder="Pregúntame lo que quieras..." />
                <button id="valeria-send" class="valeria-send-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(panel);
        
        // Agregar estilos inline (temporal, luego mover a CSS)
        this.injectStyles();
    }
    
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .valeria-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 360px;
                max-height: 600px;
                background: linear-gradient(135deg, rgba(10, 10, 15, 0.95), rgba(20, 20, 30, 0.92));
                -webkit-backdrop-filter: blur(20px);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
                opacity: 0;
                transform: translateY(20px) scale(0.95);
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 10000;
            }
            
            .valeria-panel.open {
                opacity: 1;
                transform: translateY(0) scale(1);
                pointer-events: all;
            }
            
            .valeria-header {
                display: flex;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(255,255,255,0.08);
                gap: 12px;
            }
            
            .valeria-avatar {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
            
            .valeria-identity {
                flex: 1;
            }
            
            .valeria-identity h3 {
                margin: 0;
                font-size: 16px;
                color: #fff;
                font-weight: 600;
            }
            
            .valeria-identity p {
                margin: 0;
                font-size: 12px;
                color: rgba(255,255,255,0.6);
            }
            
            .valeria-close {
                background: transparent;
                border: none;
                color: rgba(255,255,255,0.6);
                font-size: 28px;
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 28px;
                height: 28px;
                transition: color 0.2s;
            }
            
            .valeria-close:hover {
                color: #fff;
            }
            
            .valeria-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .valeria-message {
                display: flex;
                max-width: 85%;
            }
            
            .valeria-assistant {
                align-self: flex-start;
            }
            
            .valeria-user {
                align-self: flex-end;
            }
            
            .message-bubble {
                background: rgba(255,255,255,0.08);
                padding: 12px 16px;
                border-radius: 16px;
                color: rgba(255,255,255,0.9);
                font-size: 14px;
                line-height: 1.5;
            }
            
            .valeria-user .message-bubble {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
            }
            
            .valeria-quick-actions {
                display: flex;
                gap: 8px;
                padding: 0 20px 15px;
            }
            
            .valeria-quick-actions button {
                flex: 1;
                padding: 8px 12px;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                color: rgba(255,255,255,0.8);
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .valeria-quick-actions button:hover {
                background: rgba(255,255,255,0.1);
                color: #fff;
            }
            
            .valeria-input-row {
                display: flex;
                padding: 15px 20px 20px;
                gap: 10px;
                border-top: 1px solid rgba(255,255,255,0.08);
            }
            
            #valeria-input {
                flex: 1;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 12px;
                padding: 10px 14px;
                color: #fff;
                font-size: 14px;
                outline: none;
                transition: all 0.2s;
            }
            
            #valeria-input:focus {
                background: rgba(255,255,255,0.08);
                border-color: rgba(102, 126, 234, 0.5);
            }
            
            .valeria-send-btn {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                border-radius: 12px;
                color: #fff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .valeria-send-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }
            
            @media (max-width: 768px) {
                .valeria-panel {
                    width: calc(100% - 40px);
                    max-height: 500px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    setupListeners() {
        const closeBtn = document.querySelector('.valeria-close');
        const sendBtn = document.getElementById('valeria-send');
        const input = document.getElementById('valeria-input');
        const quickActions = document.querySelectorAll('.valeria-quick-actions button');
        
        closeBtn.addEventListener('click', () => this.close());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        quickActions.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.question;
                this.handleQuickAction(question);
            });
        });
        
        // Detectar cambios de ruta
        window.addEventListener('hashchange', () => this.detectContext());
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('valeria-panel');
        panel.classList.toggle('open', this.isOpen);
        
        if (this.isOpen) {
            document.getElementById('valeria-input').focus();
        }
    }
    
    open() {
        this.isOpen = true;
        document.getElementById('valeria-panel').classList.add('open');
        document.getElementById('valeria-input').focus();
    }
    
    close() {
        this.isOpen = false;
        document.getElementById('valeria-panel').classList.remove('open');
    }
    
    detectContext() {
        const hash = window.location.hash || '#/';
        if (hash.includes('portfolio')) this.currentContext = 'portfolio';
        else if (hash.includes('process')) this.currentContext = 'process';
        else if (hash.includes('retrato')) this.currentContext = 'retrato';
        else if (hash.includes('ritual')) this.currentContext = 'ritual';
        else this.currentContext = 'home';
    }
    
    sendMessage() {
        const input = document.getElementById('valeria-input');
        const message = input.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        // Responder con un delay
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'assistant');
        }, 600);
    }
    
    addMessage(text, role) {
        const container = document.getElementById('valeria-messages');
        const msg = document.createElement('div');
        msg.className = `valeria-message valeria-${role}`;
        msg.innerHTML = `<div class="message-bubble">${text}</div>`;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }
    
    generateResponse(userMessage) {
        const lower = userMessage.toLowerCase();
        
        // Detección de intenciones
        if (lower.includes('obra') || lower.includes('portfolio') || lower.includes('ver')) {
            return this.getRandomResponse('portfolio');
        } else if (lower.includes('proceso') || lower.includes('cómo')) {
            return this.getRandomResponse('process');
        } else if (lower.includes('retrato') || lower.includes('encargar') || lower.includes('precio')) {
            return this.getRandomResponse('retrato');
        } else if (this.currentContext && this.responses[this.currentContext]) {
            return this.getRandomResponse(this.currentContext);
        } else {
            return this.getContextualResponse();
        }
    }
    
    getRandomResponse(category) {
        const options = this.responses[category] || this.responses.greeting;
        return options[Math.floor(Math.random() * options.length)];
    }
    
    getContextualResponse() {
        return this.contextPrompts[this.currentContext] || this.contextPrompts.home;
    }
    
    handleQuickAction(action) {
        switch(action) {
            case 'obras':
                this.addMessage('Ver las obras', 'user');
                setTimeout(() => {
                    this.addMessage(this.getRandomResponse('portfolio'), 'assistant');
                    setTimeout(() => window.location.hash = '/portfolio', 1000);
                }, 400);
                break;
            case 'proceso':
                this.addMessage('Cuéntame sobre el proceso', 'user');
                setTimeout(() => {
                    this.addMessage(this.getRandomResponse('process'), 'assistant');
                    setTimeout(() => window.location.hash = '/process', 1000);
                }, 400);
                break;
            case 'retrato':
                this.addMessage('Quiero encargar un retrato', 'user');
                setTimeout(() => {
                    this.addMessage(this.getRandomResponse('retrato'), 'assistant');
                    setTimeout(() => window.location.hash = '/retrato', 1000);
                }, 400);
                break;
        }
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    window.valeriaVirtual = new ValeriaVirtual();
});
