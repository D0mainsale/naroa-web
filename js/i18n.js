// === INTERNATIONALIZATION SYSTEM (i18n) ===
// Handles language switching without page reload

class I18nSystem {
    constructor() {
        this.currentLang = localStorage.getItem('naroa_lang') || 'es';
        this.translations = {};
        this.init();
    }

    async init() {
        // Load default language immediately
        await this.loadLanguage(this.currentLang);
        
        // Render language switcher
        this.renderSwitcher();
        
        // Global access
        window.changeLanguage = (lang) => this.setLanguage(lang);
    }

    async loadLanguage(lang) {
        try {
            const res = await fetch(`locales/${lang}.json`);
            this.translations[lang] = await res.json();
            this.updateDOM(lang);
            document.documentElement.lang = lang;
        } catch (e) {
            console.error(`Error loading locale ${lang}:`, e);
        }
    }

    async setLanguage(lang) {
        if (this.currentLang === lang) return;
        
        this.currentLang = lang;
        localStorage.setItem('naroa_lang', lang);
        
        if (!this.translations[lang]) {
            await this.loadLanguage(lang);
        } else {
            this.updateDOM(lang);
            document.documentElement.lang = lang;
        }
        
        // Udpate active state in switcher
        this.updateSwitcherState();
    }

    updateDOM(lang) {
        const t = this.translations[lang];
        if (!t) return;

        // Recursive function to traverse nested keys
        // Flat keys map to data-i18n attributes: "nav.obras" -> t.nav.obras
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            const value = this.getNestedValue(t, key);
            
            if (value) {
                if (el.tagName === 'INPUT' && el.type === 'placeholder') {
                    el.placeholder = value;
                } else {
                    el.innerHTML = value; // Use innerHTML to allow simple formatting like <strong>
                }
            }
        });
    }

    getNestedValue(obj, keyPath) {
        return keyPath.split('.').reduce((prev, curr) => {
            return prev ? prev[curr] : null;
        }, obj);
    }

    renderSwitcher() {
        const nav = document.querySelector('.main-nav') || document.body;
        
        // Create switcher if doesn't exist
        if (!document.getElementById('lang-switcher')) {
            const switcher = document.createElement('div');
            switcher.id = 'lang-switcher';
            switcher.className = 'lang-switcher';
            switcher.innerHTML = `
                <button class="lang-btn" onclick="changeLanguage('es')" data-lang="es">ES</button>
                <span class="lang-sep">/</span>
                <button class="lang-btn" onclick="changeLanguage('eu')" data-lang="eu">EU</button>
                <span class="lang-sep">/</span>
                <button class="lang-btn" onclick="changeLanguage('en')" data-lang="en">EN</button>
            `;
            
            // Append to nav usually top right
            // If main-nav exists, append there. Else fixed position.
            if (document.querySelector('.nav-links')) {
                 document.querySelector('.nav-links').appendChild(switcher);
            } else {
                 document.body.appendChild(switcher);
            }
        }
        
        this.updateSwitcherState();
    }
    
    updateSwitcherState() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18nSystem();
});
