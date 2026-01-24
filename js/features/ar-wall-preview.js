/**
 * AR Wall Preview - Ve cómo queda la obra en TU pared
 * Usa la cámara del dispositivo para visualizar arte en tu espacio
 */
class ARWallPreview {
  constructor() {
    this.stream = null;
    this.currentArtwork = null;
    this.artworkElement = null;
    this.init();
  }

  init() {
    this.injectStyles();
    this.addARButtons();
    console.log('📷 AR Wall Preview ready');
  }

  addARButtons() {
    // Añadir botón AR a cada obra del portfolio
    document.querySelectorAll('.portfolio-card, .portfolio-item, .artwork-card, .obra-card').forEach(item => {
      const img = item.querySelector('img');
      if (!img) return;
      
      const btn = document.createElement('button');
      btn.className = 'ar-preview-btn';
      btn.innerHTML = '📷 Ver en mi pared';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openARView(img.src, img.alt);
      });
      
      item.style.position = 'relative';
      item.appendChild(btn);
    });
  }

  async openARView(artworkSrc, artworkTitle) {
    this.currentArtwork = { src: artworkSrc, title: artworkTitle };
    
    // Crear modal AR
    const modal = document.createElement('div');
    modal.id = 'ar-modal';
    modal.className = 'ar-modal';
    modal.innerHTML = `
      <div class="ar-container">
        <video id="ar-video" autoplay playsinline></video>
        <img id="ar-artwork" src="${artworkSrc}" alt="${artworkTitle}" draggable="true">
        <div class="ar-controls">
          <div class="ar-header">
            <h3>📷 Vista AR: ${artworkTitle || 'Obra'}</h3>
            <button class="ar-close" onclick="window.arWallPreview.closeAR()">×</button>
          </div>
          <div class="ar-instructions">
            <p>👆 Arrastra la obra para posicionarla</p>
            <p>🔍 Usa los controles para ajustar el tamaño</p>
          </div>
          <div class="ar-size-controls">
            <button onclick="window.arWallPreview.resize(-0.1)">➖</button>
            <span id="ar-size">100%</span>
            <button onclick="window.arWallPreview.resize(0.1)">➕</button>
          </div>
          <button class="ar-capture" onclick="window.arWallPreview.capture()">📸 Capturar</button>
        </div>
      </div>`;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('open'), 10);
    
    // Iniciar cámara
    await this.startCamera();
    this.setupDrag();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      const video = document.getElementById('ar-video');
      if (video) video.srcObject = this.stream;
    } catch (err) {
      console.error('Camera error:', err);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  }

  setupDrag() {
    const artwork = document.getElementById('ar-artwork');
    if (!artwork) return;
    
    this.artworkElement = artwork;
    let isDragging = false;
    let startX, startY, offsetX = 0, offsetY = 0;
    
    const onStart = (e) => {
      isDragging = true;
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX - offsetX;
      startY = point.clientY - offsetY;
      artwork.style.cursor = 'grabbing';
    };
    
    const onMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const point = e.touches ? e.touches[0] : e;
      offsetX = point.clientX - startX;
      offsetY = point.clientY - startY;
      artwork.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${this.scale || 1})`;
    };
    
    const onEnd = () => {
      isDragging = false;
      artwork.style.cursor = 'grab';
    };
    
    artwork.addEventListener('mousedown', onStart);
    artwork.addEventListener('touchstart', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
    
    this.scale = 1;
  }

  resize(delta) {
    this.scale = Math.max(0.3, Math.min(2, (this.scale || 1) + delta));
    const artwork = document.getElementById('ar-artwork');
    const sizeLabel = document.getElementById('ar-size');
    if (artwork) {
      const current = artwork.style.transform.match(/translate\([^)]+\)/) || ['translate(0px, 0px)'];
      artwork.style.transform = `${current[0]} scale(${this.scale})`;
    }
    if (sizeLabel) sizeLabel.textContent = `${Math.round(this.scale * 100)}%`;
  }

  async capture() {
    const video = document.getElementById('ar-video');
    const artwork = document.getElementById('ar-artwork');
    if (!video || !artwork) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Dibujar video
    ctx.drawImage(video, 0, 0);
    
    // Dibujar artwork en posición relativa
    const artRect = artwork.getBoundingClientRect();
    const vidRect = video.getBoundingClientRect();
    const scaleX = canvas.width / vidRect.width;
    const scaleY = canvas.height / vidRect.height;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(
        img,
        (artRect.left - vidRect.left) * scaleX,
        (artRect.top - vidRect.top) * scaleY,
        artRect.width * scaleX,
        artRect.height * scaleY
      );
      
      // Descargar
      const link = document.createElement('a');
      link.download = 'mi-pared-con-arte.jpg';
      link.href = canvas.toDataURL('image/jpeg', 0.9);
      link.click();
    };
    img.src = artwork.src;
  }

  closeAR() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    const modal = document.getElementById('ar-modal');
    if (modal) {
      modal.classList.remove('open');
      setTimeout(() => modal.remove(), 300);
    }
  }

  injectStyles() {
    if (document.getElementById('ar-css')) return;
    const css = document.createElement('style');
    css.id = 'ar-css';
    css.textContent = `
      .ar-preview-btn{position:absolute;bottom:10px;right:10px;padding:8px 16px;background:rgba(0,0,0,.7);color:#fff;border:1px solid rgba(212,175,55,.5);border-radius:20px;font-size:.85rem;cursor:pointer;opacity:0;transition:all .3s;z-index:10}
      .portfolio-card:hover .ar-preview-btn,.portfolio-item:hover .ar-preview-btn,.artwork-card:hover .ar-preview-btn,.obra-card:hover .ar-preview-btn{opacity:1}
      .ar-preview-btn:hover{background:#d4af37;color:#000}
      .ar-modal{position:fixed;inset:0;z-index:10000;background:#000;opacity:0;transition:opacity .3s}
      .ar-modal.open{opacity:1}
      .ar-container{width:100%;height:100%;position:relative}
      #ar-video{width:100%;height:100%;object-fit:cover}
      #ar-artwork{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);max-width:50%;max-height:50%;box-shadow:0 10px 40px rgba(0,0,0,.5);border:8px solid #d4af37;border-radius:4px;cursor:grab;transition:box-shadow .3s}
      #ar-artwork:active{cursor:grabbing;box-shadow:0 15px 50px rgba(0,0,0,.7)}
      .ar-controls{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.9));padding:1.5rem;color:#fff}
      .ar-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem}
      .ar-header h3{margin:0;font-size:1.1rem}
      .ar-close{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:1.5rem;cursor:pointer}
      .ar-instructions{display:flex;gap:1rem;font-size:.85rem;color:rgba(255,255,255,.7);margin-bottom:1rem;flex-wrap:wrap}
      .ar-instructions p{margin:0}
      .ar-size-controls{display:flex;align-items:center;gap:1rem;margin-bottom:1rem}
      .ar-size-controls button{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:1.2rem;cursor:pointer}
      .ar-size-controls button:hover{background:rgba(212,175,55,.3)}
      #ar-size{min-width:50px;text-align:center}
      .ar-capture{width:100%;padding:1rem;background:#d4af37;color:#000;border:none;border-radius:10px;font-size:1rem;font-weight:600;cursor:pointer}
      .ar-capture:hover{background:#e5c349}
    `;
    document.head.appendChild(css);
  }
}

window.addEventListener('DOMContentLoaded', () => { 
  setTimeout(() => { window.arWallPreview = new ARWallPreview(); }, 1000);
});
