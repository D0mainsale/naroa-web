/**
 * BEFORE/AFTER SLIDER - Slider Antes/Después
 * v1.0.0
 */
class BeforeAfterSlider {
    constructor() {
        this.sliders = [];
        this.activeSlider = null;
        this.init();
    }
    
    init() {
        this.addStyles();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.findSliders());
        } else {
            this.findSliders();
        }
        window.addEventListener('hashchange', () => setTimeout(() => this.findSliders(), 500));
        console.log('🔄 Before/After Slider initialized');
    }
    
    findSliders() {
        document.querySelectorAll('[data-before-after]').forEach(c => {
            if (c.dataset.sliderInit) return;
            c.dataset.sliderInit = 'true';
            this.initSlider(c);
        });
    }
    
    initSlider(container) {
        const before = container.querySelector('[data-before]');
        const after = container.querySelector('[data-after]');
        if (!before || !after) return;
        
        container.classList.add('ba-slider');
        const bWrap = document.createElement('div');
        bWrap.className = 'ba-before';
        before.parentNode.insertBefore(bWrap, before);
        bWrap.appendChild(before);
        
        const aWrap = document.createElement('div');
        aWrap.className = 'ba-after';
        after.parentNode.insertBefore(aWrap, after);
        aWrap.appendChild(after);
        
        const handle = document.createElement('div');
        handle.className = 'ba-handle';
        handle.innerHTML = '<div class="ba-line"></div><div class="ba-circle">◀▶</div><div class="ba-line"></div>';
        container.appendChild(handle);
        
        const slider = { container, before: bWrap, handle, position: 50 };
        this.sliders.push(slider);
        
        handle.addEventListener('mousedown', () => { this.activeSlider = slider; });
        document.addEventListener('mousemove', (e) => { if (this.activeSlider === slider) this.move(slider, e.clientX); });
        document.addEventListener('mouseup', () => { this.activeSlider = null; });
        container.addEventListener('click', (e) => { if (!e.target.closest('.ba-handle')) this.move(slider, e.clientX); });
        
        this.updatePosition(slider, 50);
    }
    
    move(slider, x) {
        const rect = slider.container.getBoundingClientRect();
        this.updatePosition(slider, Math.max(0, Math.min(100, ((x - rect.left) / rect.width) * 100)));
    }
    
    updatePosition(slider, pos) {
        slider.position = pos;
        slider.before.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
        slider.handle.style.left = `${pos}%`;
    }
    
    addStyles() {
        if (document.getElementById('ba-styles')) return;
        const s = document.createElement('style');
        s.id = 'ba-styles';
        s.textContent = `
            .ba-slider{position:relative;overflow:hidden;border-radius:12px;cursor:col-resize}
            .ba-slider img{display:block;width:100%;pointer-events:none}
            .ba-before{position:absolute;inset:0;z-index:2;clip-path:inset(0 50% 0 0)}
            .ba-before img{width:100%;height:100%;object-fit:cover}
            .ba-after{position:relative;z-index:1}
            .ba-handle{position:absolute;top:0;bottom:0;left:50%;width:4px;z-index:10;display:flex;flex-direction:column;align-items:center;transform:translateX(-50%)}
            .ba-line{flex:1;width:3px;background:#fff;box-shadow:0 0 10px rgba(0,0,0,.3)}
            .ba-circle{width:40px;height:40px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;box-shadow:0 2px 10px rgba(0,0,0,.2)}
        `;
        document.head.appendChild(s);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.beforeAfterSlider = new BeforeAfterSlider(); });
} else {
    window.beforeAfterSlider = new BeforeAfterSlider();
}
