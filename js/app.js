// === APP.JS ===

document.addEventListener('DOMContentLoaded', () => {
    const introScreen = document.getElementById('intro-screen');
    const playBtn = document.getElementById('play-btn');
    const noPlayBtn = document.getElementById('no-play-btn');
    const archiveView = document.getElementById('archive-view');
    const staticView = document.getElementById('static-view');
    const cursor = document.getElementById('cursor');

    // Cursor
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Modo
    playBtn.addEventListener('click', () => startMode('play'));
    noPlayBtn.addEventListener('click', () => startMode('static'));

    function startMode(mode) {
        introScreen.style.opacity = '0';
        setTimeout(() => {
            introScreen.style.display = 'none';
            if (mode === 'play') {
                archiveView.classList.remove('hidden');
                new RitualGame();
            } else {
                loadStaticMode();
            }
        }, 300);
    }

    async function loadStaticMode() {
        staticView.classList.remove('hidden');

        try {
            const response = await fetch('data/gallery.json');
            const data = await response.json();
            const allImages = [];
            if (data.albums) {
                data.albums.forEach(album => {
                    if (album.images) allImages.push(...album.images);
                });
            }

            // Mostrar 6 obras estáticas
            const gallery = document.getElementById('static-gallery');
            const shuffled = allImages.sort(() => Math.random() - 0.5).slice(0, 6);
            
            shuffled.forEach((src, i) => {
                const img = document.createElement('div');
                img.className = 'static-work';
                img.style.backgroundImage = `url('${src}')`;
                img.style.animationDelay = `${i * 0.2}s`;
                gallery.appendChild(img);
            });

            // Imagen principal que cambia lentamente
            const hero = document.getElementById('static-hero');
            let heroIdx = 0;
            const heroImages = allImages.sort(() => Math.random() - 0.5).slice(0, 10);
            
            const changeHero = () => {
                hero.style.opacity = '0';
                setTimeout(() => {
                    hero.style.backgroundImage = `url('${heroImages[heroIdx]}')`;
                    hero.style.opacity = '1';
                    heroIdx = (heroIdx + 1) % heroImages.length;
                }, 1000);
            };
            
            changeHero();
            setInterval(changeHero, 8000);

            // Frases propias de Naroa
            const quotes = [
                "Nada es excluyente. La realidad se complementa.",
                "El problema hecho trampolín.",
                "Puro kintsugi.",
                "Flores que rompen el asfalto.",
                "Nuestras oscuridades contienen chispas de luz.",
                "La esencia divina que anima nuestra carne y huesos.",
                "Complementarios, no contrarios."
            ];
            
            const whisper = document.getElementById('static-whisper');
            let quoteIdx = 0;
            
            const changeQuote = () => {
                whisper.style.opacity = '0';
                setTimeout(() => {
                    whisper.textContent = quotes[quoteIdx];
                    whisper.style.opacity = '0.4';
                    quoteIdx = (quoteIdx + 1) % quotes.length;
                }, 500);
            };
            
            changeQuote();
            setInterval(changeQuote, 6000);

        } catch (e) {
            console.error(e);
        }
    }
});
