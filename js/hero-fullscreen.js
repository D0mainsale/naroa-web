/**
 * Hero Fullscreen Manager
 * Gestiona el hero visual de impacto inicial
 */

class HeroFullscreen {
  constructor(heroId = 'hero-fullscreen') {
    this.hero = document.getElementById(heroId);
    if (!this.hero) return;
    
    this.currentIndex = 0;
    this.images = [];
    this.autoRotate = true;
    this.rotationInterval = null;
    
    this.init();
  }

  init() {
    // Get featured artworks for hero
    this.loadHeroImages();
    
    // Setup parallax on scroll
    this.setupParallax();
    
    // Setup scroll indicator click
    this.setupScrollIndicator();
    
    // Setup image lazy loading
    this.setupImageLoading();
    
    // Optional: auto-rotation
    if (this.autoRotate && this.images.length > 1) {
      this.startRotation(8000); // Change every 8 seconds
    }
  }

  /**
   * Load hero images (from featured artworks or curated list)
   */
  async loadHeroImages() {
    try {
      // Option 1: Load from images index
      const response = await fetch('/data/images-index.json');
      if (response.ok) {
        const allImages = await response.json();
        
        // Select high-quality hero images
        // Prioritize specific albums or use first images from albums
        this.images = this.selectHeroImages(allImages);
      } else {
        // Fallback: use predefined hero images
        this.images = this.getFallbackHeroImages();
      }
      
      if (this.images.length > 0) {
        this.setHeroImage(0);
      }
    } catch (error) {
      console.error('Error loading hero images:', error);
      this.images = this.getFallbackHeroImages();
      this.setHeroImage(0);
    }
  }

  /**
   * Select best images for hero from all images
   */
  selectHeroImages(allImages) {
    // Priority albums for hero (curated by quality/impact)
    const heroAlbums = [
      'My Tiny Face',
      'Amy Rocks',
      'Beatriz de Pandora',
      'El Poblema (Cortometraje, 2025)',
      'Entre Tantas Flores de Día'
    ];
    
    const heroImages = [];
    
    // Get first image from each priority album
    heroAlbums.forEach(albumName => {
      const albumImage = allImages.find(img => 
        img.albumName === albumName && img.index === 0
      );
      if (albumImage) {
        heroImages.push(albumImage);
      }
    });
    
    // If not enough, add more from other albums
    if (heroImages.length < 5) {
      const additionalImages = allImages
        .filter(img => img.index === 0 && !heroImages.includes(img))
        .slice(0, 5 - heroImages.length);
      heroImages.push(...additionalImages);
    }
    
    return heroImages;
  }

  /**
   * Fallback hero images (hardcoded)
   */
  getFallbackHeroImages() {
    return [
      {
        path: '/images/raw_albums/1112397760239644/000001_488633569_1326500505496034_1381147627022751779_n.jpg',
        albumName: 'My Tiny Face',
        title: 'Retrato íntimo'
      },
      {
        path: '/images/raw_albums/1038960572845321/000001_509606201_30064484719866187_616299634168736457_n.jpg',
        albumName: 'Amy Rocks',
        title: 'Fragmentación visual'
      },
      {
        path: '/images/raw_albums/1111052607040826/000001_488801818_1326493758830042_9047190515717355076_n.jpg',
        albumName: 'Beatriz de Pandora',
        title: 'Mirada directa'
      }
    ];
  }

  /**
   * Set hero image
   */
  setHeroImage(index) {
    if (index < 0 || index >= this.images.length) return;
    
    this.currentIndex = index;
    const imageData = this.images[index];
    
    const img = this.hero.querySelector('.hero-fullscreen__image');
    const title = this.hero.querySelector('.hero-fullscreen__title');
    const subtitle = this.hero.querySelector('.hero-fullscreen__subtitle');
    
    if (img) {
      img.classList.add('loading');
      img.src = imageData.path;
      img.alt = imageData.albumName || imageData.title || 'Obra de Naroa Gutiérrez Gil';
      
      img.onload = () => {
        img.classList.remove('loading');
        img.classList.add('loaded');
      };
    }
    
    if (title) {
      title.textContent = imageData.albumName || imageData.title || 'Naroa Gutiérrez Gil';
    }
    
    if (subtitle) {
      subtitle.textContent = 'Artista Plástica · Bilbao';
    }
    
    // Update carousel dots
    this.updateCarouselDots();
  }

  /**
   * Setup parallax effect on scroll
   */
  setupParallax() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const img = this.hero?.querySelector('.hero-fullscreen__image');
          
          if (img && scrolled < window.innerHeight) {
            // Parallax: move slower than scroll
            img.style.transform = `translateY(${scrolled * 0.5}px) scale(1)`;
            img.style.filter = `brightness(${0.85 - (scrolled / window.innerHeight) * 0.3})`;
          }
          
          // Add scrolled class
          if (scrolled > 50) {
            this.hero?.classList.add('scrolled');
          } else {
            this.hero?.classList.remove('scrolled');
          }
          
          ticking = false;
        });
        
        ticking = true;
      }
    });
  }

  /**
   * Setup scroll indicator
   */
  setupScrollIndicator() {
    const indicator = this.hero?.querySelector('.hero-fullscreen__scroll-indicator');
    if (indicator) {
      indicator.addEventListener('click', () => {
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      });
    }
  }

  /**
   * Setup image lazy loading
   */
  setupImageLoading() {
    const img = this.hero?.querySelector('.hero-fullscreen__image');
    if (img && 'loading' in HTMLImageElement.prototype) {
      img.loading = 'eager'; // Load hero image immediately
    }
  }

  /**
   * Update carousel navigation dots
   */
  updateCarouselDots() {
    const dots = this.hero?.querySelectorAll('.carousel-dot');
    dots?.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  /**
   * Start auto-rotation of images
   */
  startRotation(interval = 8000) {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
    
    this.rotationInterval = setInterval(() => {
      const nextIndex = (this.currentIndex + 1) % this.images.length;
      this.setHeroImage(nextIndex);
    }, interval);
  }

  /**
   * Stop auto-rotation
   */
  stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }

  /**
   * Manual navigation
   */
  next() {
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.setHeroImage(nextIndex);
    this.stopRotation(); // Stop auto-rotation on manual control
  }

  previous() {
    const prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.setHeroImage(prevIndex);
    this.stopRotation();
  }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  window.heroFullscreen = new HeroFullscreen();
});
