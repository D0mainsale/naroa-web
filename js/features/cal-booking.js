/**
 * CAL.COM INTEGRATION - Sistema de Citas Online
 * Embed de Cal.com para agendar sesiones de retrato
 * v1.0.0
 */
class CalBooking {
    constructor() {
        this.calUsername = 'naroa-artista'; // Change to actual Cal.com username
        this.eventTypeSlug = 'retrato-session';
        this.init();
    }
    
    init() {
        this.addStyles();
        this.createFloatingButton();
        this.injectIntoRetrato();
        console.log('📅 Cal.com Booking initialized');
    }
    
    createFloatingButton() {
        const btn = document.createElement('button');
        btn.className = 'cal-floating-btn';
        btn.innerHTML = '📅 Agendar';
        btn.title = 'Agendar sesión de retrato';
        btn.addEventListener('click', () => this.openModal());
        document.body.appendChild(btn);
    }
    
    injectIntoRetrato() {
        // Watch for retrato view
        const observer = new MutationObserver(() => {
            const retratoView = document.getElementById('retrato-view');
            if (retratoView && !retratoView.classList.contains('hidden') && !retratoView.querySelector('.cal-embed-section')) {
                this.injectCalSection(retratoView);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    }
    
    injectCalSection(container) {
        const section = document.createElement('section');
        section.className = 'cal-embed-section retrato-section';
        section.innerHTML = `
            <h2>Agenda tu sesión</h2>
            <p>Elige día y hora para nuestra conversación inicial.</p>
            <div class="cal-embed-wrapper">
                <div id="cal-inline-embed"></div>
            </div>
        `;
        const footer = container.querySelector('.portfolio-footer');
        if (footer) footer.insertAdjacentElement('beforebegin', section);
        
        this.loadCalEmbed('#cal-inline-embed');
    }
    
    loadCalEmbed(selector) {
        // Load Cal.com embed script
        if (!window.Cal) {
            const script = document.createElement('script');
            script.src = 'https://app.cal.com/embed/embed.js';
            script.onload = () => this.initCal(selector);
            document.head.appendChild(script);
        } else {
            this.initCal(selector);
        }
    }
    
    initCal(selector) {
        if (window.Cal) {
            Cal('init', { origin: 'https://cal.com' });
            Cal('inline', {
                elementOrSelector: selector,
                calLink: `${this.calUsername}/${this.eventTypeSlug}`,
                layout: 'month_view'
            });
        }
    }
    
    openModal() {
        if (document.getElementById('cal-modal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'cal-modal';
        modal.innerHTML = `
            <div class="cal-modal-content">
                <button class="cal-modal-close" aria-label="Cerrar">×</button>
                <h2>📅 Agenda tu Retrato</h2>
                <p>Selecciona un día para nuestra primera conversación.</p>
                <div id="cal-modal-embed"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        modal.querySelector('.cal-modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
        
        this.loadCalEmbed('#cal-modal-embed');
    }
    
    addStyles() {
        if (document.getElementById('cal-booking-styles')) return;
        const s = document.createElement('style');
        s.id = 'cal-booking-styles';
        s.textContent = `
            .cal-floating-btn{position:fixed;bottom:80px;right:24px;z-index:10001;background:linear-gradient(135deg,#0066CC,#004499);color:#fff;border:none;padding:12px 20px;border-radius:30px;font-size:14px;font-weight:500;cursor:pointer;box-shadow:0 4px 20px rgba(0,102,204,.3);transition:all .3s ease}
            .cal-floating-btn:hover{transform:scale(1.05);box-shadow:0 6px 30px rgba(0,102,204,.4)}
            .cal-embed-section{margin:2rem 0;padding:2rem;background:rgba(0,102,204,.03);border-radius:12px;border:1px solid rgba(0,102,204,.1)}
            .cal-embed-section h2{margin:0 0 .5rem;color:#0066CC}
            .cal-embed-wrapper{margin-top:1rem;min-height:400px;border-radius:8px;overflow:hidden}
            #cal-modal{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem}
            .cal-modal-content{background:#fff;border-radius:16px;max-width:500px;width:100%;max-height:90vh;overflow:auto;padding:2rem;position:relative}
            .cal-modal-close{position:absolute;top:12px;right:12px;background:none;border:none;font-size:24px;cursor:pointer;color:#666}
            .cal-modal-content h2{margin:0 0 .5rem}
            #cal-modal-embed{margin-top:1rem;min-height:350px}
            @media(max-width:768px){.cal-floating-btn{bottom:70px;right:10px;padding:10px 16px;font-size:12px}}
        `;
        document.head.appendChild(s);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.calBooking = new CalBooking(); });
} else {
    window.calBooking = new CalBooking();
}
