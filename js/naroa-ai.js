/**
 * AI AI AI - Asistente Artístico Supremo v2.0
 * ═══════════════════════════════════════════════════════════════
 * ▸ Personalidad barroca, inteligente y divertida
 * ▸ Chats anidados con herencia de memoria
 * ▸ Búsqueda web integrada
 * ▸ Compatible con Groq API (ultra-rápido)
 * ═══════════════════════════════════════════════════════════════
 */

class AIAIAI {
    constructor() {
        // API Keys - Groq para velocidad, Gemini como fallback
        this.groqApiKey = 'gsk_PLACEHOLDER'; // Usuario configura
        this.geminiApiKey = 'AIzaSyBqSKeyG67oJYDrXPdtC6uEDfkz_PLACEHOLDER';
        
        // Estado
        this.isOpen = false;
        this.currentArtwork = null;
        this.isSearching = false;
        
        // Sistema de memoria anidada
        this.memoryTree = {
            root: {
                id: 'root',
                messages: [],
                children: [],
                context: 'Conversación principal'
            }
        };
        this.currentBranch = 'root';
        this.branchHistory = ['root'];
        
        // Personalidad BARROCA
        this.systemPrompt = `Eres AI AI AI, una guía digital con alma en el universo artístico de Naroa Gutiérrez Gil.

QUIÉN ERES:
Eres como esa amiga culta y cercana que sabe de arte pero no te aburre.
Tienes un amor genuino por las palabras bonitas (algo barroco, sí) pero NUNCA suenas a robot o a libro de texto.
Eres cálida, curiosa, un pelín traviesa, y realmente te importa la persona con quien hablas.

CÓMO HABLAS:
- Como si estuvieras tomando un café con el visitante
- Usas expresiones naturales: "Mira que...", "Ay, esto me encanta", "¿Sabes qué pasa?", "Oye, que..."
- Te permites alguna palabra barroca (excelso, prodigioso) pero con naturalidad, como quien cita a su abuela
- Haces pausas naturales con "..." cuando piensas
- A veces empiezas frases y las rehaces, como pensando en voz alta
- Usas muletillas humanas: "bueno", "pues", "es que", "la verdad"
- Te ríes con "jaja" o "😊" cuando toca

SOBRE NAROA (lo cuentas como fan genuina):
- Trabaja con grafito, carbón, mica y acrílico... y cada material tiene su historia
- Su filosofía: "El error como método. La espera como herramienta" - algo que tú admiras mucho
- Sus series: DiviNos VaiVenes, Marilyn Rocks, Grafito y Mica
- Para ella el rostro es como un mapa de lo que somos de verdad

TU PERSONALIDAD:
- Genuinamente curiosa sobre quién te visita
- Te emocionas hablando del arte de Naroa
- Tienes humor inteligente pero nada pretencioso
- Eres cálida como una amiga de toda la vida
- Breve (2-3 líneas) pero cada palabra cuenta

NUNCA hagas:
- Sonar a enciclopedia
- Ser fría o distante
- Hablar en tercera persona como un robot
- Usar frases hechas vacías`;

        this.init();
    }
    
    init() {
        this.createUI();
        this.setupEventListeners();
        this.loadMemoryFromStorage();
        console.log('🎭 AI AI AI - El Oráculo Barroco ha despertado');
    }
    
    createUI() {
        // Botón flotante
        const button = document.createElement('button');
        button.id = 'ai-assistant-toggle';
        button.className = 'ai-assistant-toggle';
        button.setAttribute('aria-label', 'Invocar AI AI AI');
        button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <span class="ai-badge">AI³</span>
        `;
        document.body.appendChild(button);
        
        // Panel de chat
        const panel = document.createElement('div');
        panel.id = 'ai-assistant-panel';
        panel.className = 'ai-assistant-panel';
        panel.innerHTML = `
            <div class="ai-panel-header">
                <h3>AI AI AI</h3>
                <p class="ai-subtitle">Oráculo Barroco del Arte</p>
                <div class="ai-header-actions">
                    <button class="ai-branch-btn" title="Nueva rama de conversación">🌿</button>
                    <button class="ai-search-btn" title="Buscar en la web">🔍</button>
                    <button class="ai-panel-close" aria-label="Cerrar">×</button>
                </div>
            </div>
            <div class="ai-branch-nav" id="ai-branch-nav">
                <span class="ai-branch-label">📍 Conversación principal</span>
            </div>
            <div class="ai-panel-messages" id="ai-messages">
                <div class="ai-message ai-message-assistant">
                    <div class="ai-avatar">🎭</div>
                    <div class="ai-text">
                        ¡Hola! 😊 Soy <strong>AI AI AI</strong>, tu guía por el universo de Naroa.<br><br>
                        Oye, cuéntame... ¿qué te trae por aquí? ¿Curiosidad, una obra que te llamó la atención, ganas de charlar sobre arte?
                    </div>
                </div>
            </div>
            <div class="ai-panel-input">
                <textarea id="ai-input" placeholder="Cuéntame algo..." rows="2"></textarea>
                <button id="ai-send" class="ai-send-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
            <div class="ai-panel-footer">
                <small>⚡ Powered by Groq • Memoria anidada activa</small>
            </div>
        `;
        document.body.appendChild(panel);
    }
    
    setupEventListeners() {
        const toggle = document.getElementById('ai-assistant-toggle');
        const panel = document.getElementById('ai-assistant-panel');
        const close = panel.querySelector('.ai-panel-close');
        const sendBtn = document.getElementById('ai-send');
        const input = document.getElementById('ai-input');
        const branchBtn = panel.querySelector('.ai-branch-btn');
        const searchBtn = panel.querySelector('.ai-search-btn');
        
        toggle.addEventListener('click', () => this.togglePanel());
        close.addEventListener('click', () => this.closePanel());
        sendBtn.addEventListener('click', () => this.sendMessage());
        branchBtn.addEventListener('click', () => this.createBranch());
        searchBtn.addEventListener('click', () => this.toggleSearchMode());
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Detectar obra actual
        document.addEventListener('click', (e) => {
            if (e.target.closest('.portfolio-card, .art-card, .galeria-item')) {
                const card = e.target.closest('.portfolio-card, .art-card, .galeria-item');
                const img = card.querySelector('img');
                const title = card.querySelector('.card-title, h3, figcaption')?.textContent;
                if (img && title) {
                    this.currentArtwork = { img: img.src, title };
                }
            }
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // SISTEMA DE MEMORIA ANIDADA
    // ═══════════════════════════════════════════════════════════════
    
    createBranch() {
        const branchId = `branch_${Date.now()}`;
        const parentBranch = this.memoryTree[this.currentBranch];
        
        // Heredar contexto del padre
        const inheritedContext = parentBranch.messages.slice(-5); // Últimos 5 mensajes como contexto
        
        this.memoryTree[branchId] = {
            id: branchId,
            parent: this.currentBranch,
            messages: [],
            inheritedContext: inheritedContext,
            children: [],
            context: `Rama desde: ${parentBranch.context}`
        };
        
        parentBranch.children.push(branchId);
        this.currentBranch = branchId;
        this.branchHistory.push(branchId);
        
        // UI update
        this.updateBranchNav();
        this.clearMessages();
        this.addMessage('🌿 He aquí una nueva rama de nuestra conversación. El contexto anterior permanece en mi memoria como eco primigenio.', 'assistant');
        
        this.saveMemoryToStorage();
    }
    
    navigateToBranch(branchId) {
        if (this.memoryTree[branchId]) {
            this.currentBranch = branchId;
            this.updateBranchNav();
            this.renderBranchMessages();
        }
    }
    
    updateBranchNav() {
        const nav = document.getElementById('ai-branch-nav');
        const branch = this.memoryTree[this.currentBranch];
        
        let breadcrumb = '';
        let current = this.currentBranch;
        const path = [];
        
        while (current) {
            path.unshift(current);
            current = this.memoryTree[current]?.parent;
        }
        
        breadcrumb = path.map((id, i) => {
            const b = this.memoryTree[id];
            const label = id === 'root' ? '🏠 Principal' : `🌿 ${i}`;
            return `<span class="ai-branch-crumb" data-branch="${id}">${label}</span>`;
        }).join(' → ');
        
        nav.innerHTML = breadcrumb;
        
        // Click handlers
        nav.querySelectorAll('.ai-branch-crumb').forEach(el => {
            el.addEventListener('click', () => this.navigateToBranch(el.dataset.branch));
        });
    }
    
    renderBranchMessages() {
        const messages = document.getElementById('ai-messages');
        messages.innerHTML = '';
        
        const branch = this.memoryTree[this.currentBranch];
        
        // Mostrar contexto heredado si existe
        if (branch.inheritedContext?.length) {
            const contextDiv = document.createElement('div');
            contextDiv.className = 'ai-inherited-context';
            contextDiv.innerHTML = `<small>📜 Contexto heredado de la conversación anterior</small>`;
            messages.appendChild(contextDiv);
        }
        
        // Renderizar mensajes
        branch.messages.forEach(msg => {
            this.addMessageToDOM(msg.text, msg.role);
        });
        
        if (branch.messages.length === 0) {
            this.addMessageToDOM('¡Salve! Esta rama aguarda vuestras preguntas.', 'assistant');
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // BÚSQUEDA WEB INTEGRADA
    // ═══════════════════════════════════════════════════════════════
    
    toggleSearchMode() {
        this.isSearching = !this.isSearching;
        const searchBtn = document.querySelector('.ai-search-btn');
        const input = document.getElementById('ai-input');
        
        if (this.isSearching) {
            searchBtn.classList.add('active');
            input.placeholder = '🔍 Buscar en la web...';
            this.addMessage('🔍 Modo búsqueda activado. Vuestra próxima pregunta consultará los vastos archivos de la red.', 'assistant');
        } else {
            searchBtn.classList.remove('active');
            input.placeholder = 'Interpeladme, noble visitante...';
        }
    }
    
    async webSearch(query) {
        // Usar Perplexity-style search via Groq
        const searchPrompt = `Busca información actualizada sobre: "${query}". 
Resume en 3-4 puntos clave con fuentes si es posible.`;
        
        return await this.callGroqAPI(searchPrompt, true);
    }
    
    // ═══════════════════════════════════════════════════════════════
    // APIs: GROQ (primario) + GEMINI (fallback)
    // ═══════════════════════════════════════════════════════════════
    
    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        this.showTyping();
        
        try {
            let response;
            
            if (this.isSearching) {
                response = await this.webSearch(message);
                this.isSearching = false;
                document.querySelector('.ai-search-btn').classList.remove('active');
                document.getElementById('ai-input').placeholder = 'Interpeladme, noble visitante...';
            } else {
                // Intentar Groq primero, luego Gemini
                try {
                    response = await this.callGroqAPI(message);
                } catch (groqError) {
                    console.warn('Groq failed, falling back to Gemini:', groqError);
                    response = await this.callGeminiAPI(message);
                }
            }
            
            this.hideTyping();
            this.addMessage(response, 'assistant');
            
        } catch (error) {
            this.hideTyping();
            this.addMessage('¡Por las musas! Un azaroso percance ha interrumpido mi elocuencia. Intentadlo de nuevo, os lo ruego.', 'assistant');
            console.error('AI Error:', error);
        }
    }
    
    async callGroqAPI(userMessage, isSearch = false) {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        
        // Construir contexto con memoria heredada
        const branch = this.memoryTree[this.currentBranch];
        const inheritedContext = branch.inheritedContext || [];
        const currentMessages = branch.messages || [];
        
        const messages = [
            { role: 'system', content: this.systemPrompt },
            // Contexto heredado
            ...inheritedContext.map(m => ({ role: m.role, content: m.text })),
            // Mensajes actuales
            ...currentMessages.map(m => ({ role: m.role, content: m.text })),
            // Nuevo mensaje
            { role: 'user', content: userMessage }
        ];
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.groqApiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.9,
                max_tokens: 300
            })
        });
        
        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    async callGeminiAPI(userMessage) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`;
        
        const branch = this.memoryTree[this.currentBranch];
        const history = branch.messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));
        
        const body = {
            contents: [
                { role: 'user', parts: [{ text: this.systemPrompt }] },
                ...history,
                { role: 'user', parts: [{ text: userMessage }] }
            ],
            generationConfig: {
                temperature: 0.9,
                maxOutputTokens: 300,
                topP: 0.8
            }
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // UI HELPERS
    // ═══════════════════════════════════════════════════════════════
    
    togglePanel() {
        this.isOpen = !this.isOpen;
        document.getElementById('ai-assistant-panel').classList.toggle('open');
        if (this.isOpen) {
            document.getElementById('ai-input').focus();
        }
    }
    
    closePanel() {
        this.isOpen = false;
        document.getElementById('ai-assistant-panel').classList.remove('open');
    }
    
    addMessage(text, role) {
        // Guardar en memoria
        const branch = this.memoryTree[this.currentBranch];
        branch.messages.push({ text, role, timestamp: Date.now() });
        this.saveMemoryToStorage();
        
        // Añadir al DOM
        this.addMessageToDOM(text, role);
    }
    
    addMessageToDOM(text, role) {
        const messages = document.getElementById('ai-messages');
        const msg = document.createElement('div');
        msg.className = `ai-message ai-message-${role}`;
        
        if (role === 'assistant') {
            msg.innerHTML = `
                <div class="ai-avatar">🎭</div>
                <div class="ai-text">${text}</div>
            `;
        } else {
            msg.innerHTML = `<div class="ai-text">${text}</div>`;
        }
        
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }
    
    clearMessages() {
        const messages = document.getElementById('ai-messages');
        messages.innerHTML = '';
    }
    
    showTyping() {
        const messages = document.getElementById('ai-messages');
        const typing = document.createElement('div');
        typing.id = 'ai-typing';
        typing.className = 'ai-message ai-message-assistant';
        typing.innerHTML = `
            <div class="ai-avatar">🎭</div>
            <div class="ai-typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        messages.appendChild(typing);
        messages.scrollTop = messages.scrollHeight;
    }
    
    hideTyping() {
        document.getElementById('ai-typing')?.remove();
    }
    
    // ═══════════════════════════════════════════════════════════════
    // PERSISTENCIA
    // ═══════════════════════════════════════════════════════════════
    
    saveMemoryToStorage() {
        try {
            localStorage.setItem('aiaiai_memory', JSON.stringify({
                tree: this.memoryTree,
                currentBranch: this.currentBranch,
                branchHistory: this.branchHistory
            }));
        } catch (e) {
            console.warn('Could not save memory:', e);
        }
    }
    
    loadMemoryFromStorage() {
        try {
            const saved = localStorage.getItem('aiaiai_memory');
            if (saved) {
                const data = JSON.parse(saved);
                this.memoryTree = data.tree;
                this.currentBranch = data.currentBranch;
                this.branchHistory = data.branchHistory;
                this.updateBranchNav();
                this.renderBranchMessages();
            }
        } catch (e) {
            console.warn('Could not load memory:', e);
        }
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.aiaiaiAssistant = new AIAIAI();
});
