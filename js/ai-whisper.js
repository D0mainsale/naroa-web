/**
 * AI Whisper System - Susurros cada 42 segundos
 * La IA te dice cosas bonitas mientras navegas
 */

class AIWhisper {
  constructor() {
    this.enabled = true; // Activado por defecto
    this.interval = 42000; // 42 segundos (número áureo × 26)
    this.timer = null;
    this.synth = window.speechSynthesis;
    this.voice = null;
    
    // Mensajes poéticos y contemplativos (multilingual: ES, EN, EU, NL)
    this.whispers = [
      // Castellano - Poesía visual
      "Cada trazo es un universo",
      "El arte respira en el silencio",
      "Hay belleza en la pausa",
      "El color es vibración, es alma",
      "Contemplar es crear",
      "La luz encuentra su camino",
      "Cada imagen es un instante eterno",
      "El arte no explica, revela",
      "Hay poesía en cada fragmento",
      "La creación es un acto de fe",
      "Mira despacio, hay mundos ocultos",
      "El arte es tiempo suspendido",
      "Cada obra es un portal",
      "La belleza habita en los detalles",
      "Tu mirada completa la obra",
      
      // English - Visual poetry
      "Serendipity dwells in every brushstroke",
      "Ephemeral moments captured in colour",
      "Luminescence speaks without words",
      "Whispers of beauty linger here",
      "Ineffable grace in every line",
      "Petrichor of imagination",
      "Mellifluous silence between shapes",
      "Iridescent dreams on canvas",
      "Elysian visions await your gaze",
      "Aurora of creativity unfolds",
      
      // Euskera - Artearen mintzoa
      "Argia bihotzean dantza",
      "Margoak ametsen hizkuntza dira",
      "Ederrak harritu egiten du",
      "Irudia amets eta arima da",
      "Koloreak bizia pizten du",
      "Artea bihotzaren oihartzuna da",
      "Begira, eta ezagutu",
      "Ikusiak arima erakusten du",
      "Margoak mundu berriak irekitzen ditu",
      
      // Nederlands - Schoonheid in stilte
      "Schoonheid fluistert in de stilte",
      "Geborgenheid woont in kleuren",
      "Verbeelding danst op doek",
      "Weemoed kleurt de wereld zacht",
      "Schemering draagt dromen",
      "Zachtheid spreekt zonder woorden",
      "Betovering leeft in detail",
      "Schittering wacht op je blik",
      
      // Multilingual fusion
      "Art is serendipity · Arte es serendipia",
      "Argia · Light · Luz · Licht",
      "Beauty · Belleza · Ederra · Schoonheid",
      "Whisper · Susurro · Xuxurla · Fluistering",
      "Dream · Sueño · Amets · Droom",
      "Soul · Alma · Arima · Ziel"
    ];
    
    this.lastWhisperIndex = -1;
    this.init();
  }

  /**
   * Initialize the whisper system
   */
  init() {
    // Load voice preferences
    this.loadPreferences();
    
    // Setup voices when available
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.setupVoice();
    }
    this.setupVoice();
    
    // Create UI toggle
    this.createToggle();
    
    // Auto-start if enabled
    if (this.enabled) {
      this.start();
    }
  }

  /**
   * Setup voice (voz humana dulce y suave)
   * Prioriza voces conocidas por ser cálidas y naturales
   */
  setupVoice() {
    const voices = this.synth.getVoices();
    
    // Voces premium conocidas por ser dulces y humanas
    const sweetVoiceNames = [
      'Mónica', 'Monica',           // macOS/iOS - muy cálida
      'Paulina',                     // macOS/iOS - dulce mexicana
      'Lucía', 'Lucia',              // Google - suave y clara
      'Elena',                       // Windows - agradable
      'Conchita',                    // Amazon Polly style
      'Penélope', 'Penelope',        // Suave
      'Lupe',                        // macOS - mexicana cálida
      'Marisol',                     // Natural
      'Google español',              // Neural voice
      'Microsoft Helena',            // Windows neural
      'Sabina'                       // Natural española
    ];
    
    // 1. Buscar voces premium dulces en español
    this.voice = voices.find(v => 
      v.lang.startsWith('es') && 
      sweetVoiceNames.some(name => v.name.toLowerCase().includes(name.toLowerCase()))
    );
    
    // 2. Si no hay premium, buscar cualquier voz neural/natural en español
    if (!this.voice) {
      this.voice = voices.find(v => 
        v.lang.startsWith('es') && 
        (v.name.includes('Neural') || v.name.includes('natural') || v.name.includes('Premium'))
      );
    }
    
    // 3. Fallback: cualquier voz femenina en español (evitar las robóticas)
    if (!this.voice) {
      this.voice = voices.find(v => 
        v.lang.startsWith('es') && 
        !v.name.includes('Jorge') && !v.name.includes('Diego') && !v.name.includes('Carlos')
      );
    }
    
    // 4. Último recurso: primera voz en español disponible
    if (!this.voice) {
      this.voice = voices.find(v => v.lang.startsWith('es')) || voices[0];
    }
    
    console.log('🎙️ AI Whisper voice (dulce y suave):', this.voice?.name);
  }

  /**
   * Get random whisper message (sin repetir el último)
   */
  getRandomWhisper() {
    let index;
    do {
      index = Math.floor(Math.random() * this.whispers.length);
    } while (index === this.lastWhisperIndex && this.whispers.length > 1);
    
    this.lastWhisperIndex = index;
    return this.whispers[index];
  }

  /**
   * Speak whisper
   */
  speak(text) {
    if (!this.synth) return;
    
    // Cancel any ongoing speech
    this.synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Voice settings: dulce, suave y humana
    utterance.voice = this.voice;
    utterance.volume = 0.75;  // Suave pero audible (íntimo, no grita)
    utterance.rate = 0.65;    // Más lento (cálido y contemplativo)
    utterance.pitch = 1.15;   // Tono más alto (dulce y femenino)
    utterance.lang = 'es-ES';
    
    // Visual feedback
    this.showWhisperNotification(text);
    
    // Speak
    this.synth.speak(utterance);
    
    console.log('💬 AI Whisper:', text);
  }

  /**
   * Show visual notification of whisper
   */
  showWhisperNotification(text) {
    const notification = document.createElement('div');
    notification.className = 'ai-whisper-notification';
    notification.textContent = text;
    
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Fade out and remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 600);
    }, 4000);
  }

  /**
   * Start whisper cycle
   */
  start() {
    if (this.timer) return; // Already running
    
    this.enabled = true;
    this.savePreferences();
    
    // First whisper after 5 seconds
    setTimeout(() => {
      this.speak(this.getRandomWhisper());
    }, 5000);
    
    // Then every 42 seconds
    this.timer = setInterval(() => {
      this.speak(this.getRandomWhisper());
    }, this.interval);
    
    console.log('🎙️ AI Whisper system started (every 42s)');
  }

  /**
   * Stop whisper cycle
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.enabled = false;
    this.savePreferences();
    
    // Cancel any ongoing speech
    if (this.synth) {
      this.synth.cancel();
    }
    
    console.log('🔇 AI Whisper system stopped');
  }

  /**
   * Toggle whisper system
   */
  toggle() {
    if (this.enabled) {
      this.stop();
    } else {
      this.start();
    }
    
    this.updateToggleUI();
  }

  /**
   * Create toggle UI
   */
  createToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'ai-whisper-toggle';
    toggle.id = 'ai-whisper-toggle';
    toggle.setAttribute('aria-label', 'Activar susurros de IA');
    toggle.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
      <span class="toggle-label">Susurros</span>
    `;
    
    toggle.addEventListener('click', () => this.toggle());
    
    document.body.appendChild(toggle);
    this.updateToggleUI();
  }

  /**
   * Update toggle UI state
   */
  updateToggleUI() {
    const toggle = document.getElementById('ai-whisper-toggle');
    if (toggle) {
      if (this.enabled) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-label', 'Desactivar susurros de IA');
      } else {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-label', 'Activar susurros de IA');
      }
    }
  }

  /**
   * Save preferences to localStorage
   */
  savePreferences() {
    localStorage.setItem('ai-whisper-enabled', this.enabled.toString());
  }

  /**
   * Load preferences from localStorage
   */
  loadPreferences() {
    const saved = localStorage.getItem('ai-whisper-enabled');
    this.enabled = saved === 'true';
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  window.aiWhisper = new AIWhisper();
});
