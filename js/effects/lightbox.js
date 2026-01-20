/**
 * Premium Lightbox & Interactive Gallery Zoom
 * Handles high-res image viewing and metadata display.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Lightbox Implementation
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-close">&times;</div>
        <div class="lightbox-content">
            <img src="" alt="" class="lightbox-image">
            <div class="lightbox-caption">
                <h3 class="lightbox-title"></h3>
                <p class="lightbox-desc"></p>
            </div>
        </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxDesc = lightbox.querySelector('.lightbox-desc');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    const openLightbox = (imgSrc, title, desc) => {
        lightboxImg.src = imgSrc;
        lightboxTitle.textContent = title;
        lightboxDesc.textContent = desc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.style.transform = ''; // Reset parallax on close
        }, 400);
    };

    // Event Delegation for Work Images
    document.addEventListener('click', (e) => {
        if (e.target.closest('.work-image') || e.target.closest('.view-work')) {
            const card = e.target.closest('.work-card');
            const img = card.querySelector('img');
            const title = card.querySelector('.work-title').textContent;
            const desc = card.querySelector('.work-description').textContent;
            openLightbox(img.src, title, desc);
        }
        if (e.target === lightbox || e.target === closeBtn) {
            closeLightbox();
        }
    });

    // 2. 3D Tilt Effect for Work Cards
    const cards = document.querySelectorAll('.work-card');
    cards.forEach(card => {
        const container = card.querySelector('.work-image-container');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        card.addEventListener('mouseleave', () => {
            container.style.transform = 'rotateX(0) rotateY(0)';
        });
    });

    // 3. Language Switching Logic (Simplified for 18-JAN update)
    const langBtns = document.querySelectorAll('.lang-btn');
    const translatableElements = document.querySelectorAll('[data-en]');

    const setLanguage = (lang) => {
        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        translatableElements.forEach(el => {
            if (lang === 'en') {
                if (!el.dataset.es) el.dataset.es = el.textContent;
                el.textContent = el.dataset.en;
            } else {
                el.textContent = el.dataset.es;
            }
        });
        
        localStorage.setItem('naroa-prefix-lang', lang);
    };

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // 4. Immersive Parallax & Touch Interaction
    lightbox.addEventListener('mousemove', (e) => {
        if (!lightbox.classList.contains('active')) return;
        const x = (e.clientX - window.innerWidth / 2) / 40;
        const y = (e.clientY - window.innerHeight / 2) / 40;
        lightboxImg.style.transform = `translate(${-x}px, ${-y}px)`;
    });

    let touchStartY = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchmove', (e) => {
        const touchY = e.touches[0].clientY;
        const diff = touchY - touchStartY;
        if (Math.abs(diff) > 150) { // Swipe threshold
            closeLightbox();
        }
    }, { passive: true });

    // Check saved preference
    const savedLang = localStorage.getItem('naroa-prefix-lang');
    if (savedLang) setLanguage(savedLang);
});
