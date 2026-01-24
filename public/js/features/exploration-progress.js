/**
 * EXPLORATION PROGRESS — Barra de Progreso
 * "Has explorado X% del archivo de Naroa"
 * v1.0.0 - 2026-01-24
 */

class ExplorationProgress {
    constructor() {
        this.storageKey = 'naroa_exploration';
        this.progress = {
            sections: {},
            artworks: {},
            totalViewed: 0,
        };
        this.ui = null;
        
        this.sections = ['home', 'portfolio', 'process', 'bitacora', 'retrato', 'about', 'tienda', 'ritual'];
        this.totalArtworks = 12; // Approximate number of artworks
        
        this.init();
    }
    
    init() {
        this.loadProgress();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    loadProgress() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.progress = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Could not load exploration progress');
        }
    }
    
    saveProgress() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
        } catch (e) {}
    }
    
    setup() {
        this.createUI();
        this.trackNavigation();
        this.trackArtworks();
        this.updateUI();
        
        console.log('📊 Exploration Progress initialized');
    }
    
    createUI() {
        this.ui = document.createElement('div');
        this.ui.className = 'exploration-progress';
        this.ui.innerHTML = `
            <div class="exploration-toggle" title="Tu exploración">
                <span class="exploration-icon">📊</span>
                <span class="exploration-percent">0%</span>
            </div>
            <div class="exploration-panel hidden">
                <div class="exploration-header">
                    <h3>Tu Exploración</h3>
                    <span class="exploration-close">×</span>
                </div>
                <div class="exploration-content">
                    <div class="exploration-main-stat">
                        <div class="exploration-circle">
                            <svg viewBox="0 0 100 100">
                                <circle class="bg" cx="50" cy="50" r="45"/>
                                <circle class="progress" cx="50" cy="50" r="45"/>
                            </svg>
                            <span class="exploration-num">0%</span>
                        </div>
                        <p>del archivo explorado</p>
                    </div>
                    <div class="exploration-details">
                        <div class="exploration-stat">
                            <span class="stat-label">Secciones</span>
                            <div class="stat-bar"><div class="stat-fill sections-fill"></div></div>
                            <span class="stat-value sections-value">0/8</span>
                        </div>
                        <div class="exploration-stat">
                            <span class="stat-label">Obras vistas</span>
                            <div class="stat-bar"><div class="stat-fill artworks-fill"></div></div>
                            <span class="stat-value artworks-value">0</span>
                        </div>
                    </div>
                    <div class="exploration-achievements">
                        <h4>Logros</h4>
                        <div class="achievements-grid"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.ui);
        
        // Toggle panel
        this.ui.querySelector('.exploration-toggle').addEventListener('click', () => {
            this.ui.querySelector('.exploration-panel').classList.toggle('hidden');
        });
        
        this.ui.querySelector('.exploration-close').addEventListener('click', () => {
            this.ui.querySelector('.exploration-panel').classList.add('hidden');
        });
        
        this.addStyles();
    }
    
    trackNavigation() {
        // Track current section
        const trackSection = () => {
            const hash = window.location.hash.replace('#/', '') || 'home';
            const section = hash.split('/')[0];
            
            if (this.sections.includes(section) && !this.progress.sections[section]) {
                this.progress.sections[section] = Date.now();
                this.saveProgress();
                this.updateUI();
                this.checkAchievements();
            }
        };
        
        trackSection();
        window.addEventListener('hashchange', trackSection);
    }
    
    trackArtworks() {
        // Track artwork views
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.dataset.artworkId || 
                               entry.target.querySelector('h3')?.textContent ||
                               entry.target.dataset.title;
                    
                    if (id && !this.progress.artworks[id]) {
                        this.progress.artworks[id] = Date.now();
                        this.progress.totalViewed++;
                        this.saveProgress();
                        this.updateUI();
                        this.checkAchievements();
                    }
                }
            });
        }, { threshold: 0.5 });
        
        // Observe artwork elements
        const observeArtworks = () => {
            document.querySelectorAll('.portfolio-card, .artwork-card, .galeria-item, [data-artwork-id]')
                .forEach(el => observer.observe(el));
        };
        
        observeArtworks();
        window.addEventListener('hashchange', () => setTimeout(observeArtworks, 500));
    }
    
    calculateProgress() {
        const sectionCount = Object.keys(this.progress.sections).length;
        const artworkCount = Object.keys(this.progress.artworks).length;
        
        const sectionPercent = (sectionCount / this.sections.length) * 50; // 50% weight
        const artworkPercent = Math.min(artworkCount / this.totalArtworks, 1) * 50; // 50% weight
        
        return Math.round(sectionPercent + artworkPercent);
    }
    
    updateUI() {
        const percent = this.calculateProgress();
        const sectionCount = Object.keys(this.progress.sections).length;
        const artworkCount = Object.keys(this.progress.artworks).length;
        
        // Update toggle
        this.ui.querySelector('.exploration-percent').textContent = percent + '%';
        
        // Update circle
        const circle = this.ui.querySelector('.progress');
        const circumference = 2 * Math.PI * 45;
        circle.style.strokeDasharray = circumference;
        circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
        
        this.ui.querySelector('.exploration-num').textContent = percent + '%';
        
        // Update stats
        this.ui.querySelector('.sections-fill').style.width = 
            (sectionCount / this.sections.length * 100) + '%';
        this.ui.querySelector('.sections-value').textContent = 
            `${sectionCount}/${this.sections.length}`;
        
        this.ui.querySelector('.artworks-fill').style.width = 
            Math.min(artworkCount / this.totalArtworks * 100, 100) + '%';
        this.ui.querySelector('.artworks-value').textContent = artworkCount;
        
        // Update achievements
        this.updateAchievements();
    }
    
    checkAchievements() {
        const achievements = [
            { id: 'first_visit', name: '👋 Primera Visita', condition: () => true, unlocked: true },
            { id: 'explorer', name: '🧭 Explorador', condition: () => Object.keys(this.progress.sections).length >= 4 },
            { id: 'completionist', name: '🏆 Completista', condition: () => Object.keys(this.progress.sections).length >= 8 },
            { id: 'art_lover', name: '🎨 Amante del Arte', condition: () => Object.keys(this.progress.artworks).length >= 5 },
            { id: 'curator', name: '🖼️ Curador', condition: () => Object.keys(this.progress.artworks).length >= 10 },
            { id: 'ritual', name: '🎲 Ritual Completado', condition: () => this.progress.sections['ritual'] },
        ];
        
        achievements.forEach(a => {
            if (!this.progress[`achievement_${a.id}`] && a.condition()) {
                this.progress[`achievement_${a.id}`] = Date.now();
                this.saveProgress();
                this.showAchievementToast(a.name);
            }
        });
    }
    
    updateAchievements() {
        const grid = this.ui.querySelector('.achievements-grid');
        const achievements = [
            { id: 'first_visit', icon: '👋', name: 'Primera Visita' },
            { id: 'explorer', icon: '🧭', name: 'Explorador' },
            { id: 'completionist', icon: '🏆', name: 'Completista' },
            { id: 'art_lover', icon: '🎨', name: 'Amante del Arte' },
            { id: 'curator', icon: '🖼️', name: 'Curador' },
            { id: 'ritual', icon: '🎲', name: 'Ritual' },
        ];
        
        grid.innerHTML = achievements.map(a => {
            const unlocked = this.progress[`achievement_${a.id}`];
            return `
                <div class="achievement ${unlocked ? 'unlocked' : ''}" title="${a.name}">
                    <span>${a.icon}</span>
                </div>
            `;
        }).join('');
    }
    
    showAchievementToast(name) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `<span>🏅 Logro desbloqueado:</span> ${name}`;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('visible'));
        
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }
    
    addStyles() {
        if (document.getElementById('exploration-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'exploration-styles';
        style.textContent = `
            .exploration-progress {
                position: fixed;
                bottom: 230px;
                right: 20px;
                z-index: 10000;
            }
            
            .exploration-toggle {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2520 100%);
                border: 1px solid rgba(184, 134, 11, 0.3);
                padding: 0.75rem 1rem;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .exploration-toggle:hover {
                border-color: rgba(184, 134, 11, 0.6);
                transform: scale(1.05);
            }
            
            .exploration-icon { font-size: 1.2rem; }
            
            .exploration-percent {
                color: #f4f3f0;
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .exploration-panel {
                position: absolute;
                bottom: 60px;
                right: 0;
                width: 300px;
                background: rgba(26, 26, 26, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(20px);
                overflow: hidden;
                transition: all 0.3s;
            }
            
            .exploration-panel.hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateY(20px);
            }
            
            .exploration-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .exploration-header h3 {
                margin: 0;
                color: #f4f3f0;
                font-size: 1rem;
            }
            
            .exploration-close {
                color: #888;
                font-size: 1.5rem;
                cursor: pointer;
                line-height: 1;
            }
            
            .exploration-content { padding: 1.5rem; }
            
            .exploration-main-stat {
                text-align: center;
                margin-bottom: 1.5rem;
            }
            
            .exploration-circle {
                width: 100px;
                height: 100px;
                margin: 0 auto 0.5rem;
                position: relative;
            }
            
            .exploration-circle svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
            }
            
            .exploration-circle .bg {
                fill: none;
                stroke: rgba(255, 255, 255, 0.1);
                stroke-width: 8;
            }
            
            .exploration-circle .progress {
                fill: none;
                stroke: url(#gradient);
                stroke-width: 8;
                stroke-linecap: round;
                transition: stroke-dashoffset 0.5s ease;
            }
            
            .exploration-num {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 1.5rem;
                font-weight: 700;
                color: #f4f3f0;
            }
            
            .exploration-main-stat p {
                color: rgba(255, 255, 255, 0.5);
                margin: 0;
                font-size: 0.85rem;
            }
            
            .exploration-stat {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 0.75rem;
            }
            
            .stat-label {
                flex: 1;
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.85rem;
            }
            
            .stat-bar {
                width: 80px;
                height: 6px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .stat-fill {
                height: 100%;
                background: linear-gradient(90deg, #b8860b, #daa520);
                border-radius: 3px;
                transition: width 0.5s ease;
            }
            
            .stat-value {
                color: #f4f3f0;
                font-size: 0.85rem;
                min-width: 35px;
                text-align: right;
            }
            
            .exploration-achievements {
                margin-top: 1.5rem;
                padding-top: 1rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .exploration-achievements h4 {
                margin: 0 0 0.75rem;
                color: rgba(255, 255, 255, 0.5);
                font-size: 0.8rem;
                text-transform: uppercase;
            }
            
            .achievements-grid {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            
            .achievement {
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                font-size: 1.2rem;
                opacity: 0.3;
                filter: grayscale(1);
                transition: all 0.3s;
            }
            
            .achievement.unlocked {
                opacity: 1;
                filter: none;
                background: rgba(184, 134, 11, 0.2);
            }
            
            .achievement-toast {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: linear-gradient(135deg, #1a1a1a 0%, #2a2520 100%);
                border: 1px solid rgba(184, 134, 11, 0.5);
                color: #f4f3f0;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                opacity: 0;
                pointer-events: none;
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                z-index: 100000;
            }
            
            .achievement-toast.visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            .achievement-toast span {
                color: #daa520;
            }
            
            @media (max-width: 768px) {
                .exploration-progress { bottom: 210px; }
                .exploration-panel {
                    right: -10px;
                    width: 280px;
                }
            }
        `;
        
        // Add SVG gradient definition
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.innerHTML = `
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#b8860b"/>
                    <stop offset="100%" style="stop-color:#daa520"/>
                </linearGradient>
            </defs>
        `;
        svg.style.position = 'absolute';
        svg.style.width = '0';
        svg.style.height = '0';
        document.body.appendChild(svg);
        
        document.head.appendChild(style);
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.explorationProgress = new ExplorationProgress();
    });
} else {
    window.explorationProgress = new ExplorationProgress();
}
