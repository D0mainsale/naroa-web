/**
 * Notion CMS Frontend Loader
 * Loads artwork data from notion-artworks.json and renders it dynamically
 */

class NotionCMS {
  constructor() {
    this.artworks = [];
    this.loaded = false;
  }

  /**
   * Load artworks from JSON file
   */
  async load() {
    try {
      const response = await fetch('/data/notion-artworks.json');
      if (!response.ok) {
        console.warn('⚠️ Notion artworks file not found, using fallback data');
        return false;
      }
      
      this.artworks = await response.json();
      this.loaded = true;
      console.log(`✅ Loaded ${this.artworks.length} artworks from Notion CMS`);
      return true;
    } catch (error) {
      console.error('❌ Error loading Notion artworks:', error);
      return false;
    }
  }

  /**
   * Get all artworks
   */
  getAll() {
    return this.artworks;
  }

  /**
   * Get featured artworks
   */
  getFeatured() {
    return this.artworks.filter(art => art.featured);
  }

  /**
   * Get artworks by category
   */
  getByCategory(category) {
    return this.artworks.filter(art => art.category === category);
  }

  /**
   * Get artworks by year
   */
  getByYear(year) {
    return this.artworks.filter(art => art.year === year);
  }

  /**
   * Get artworks by tag
   */
  getByTag(tag) {
    return this.artworks.filter(art => 
      art.tags && art.tags.includes(tag)
    );
  }

  /**
   * Search artworks by title or description
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.artworks.filter(art => 
      art.title.toLowerCase().includes(lowerQuery) ||
      (art.description && art.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Render portfolio cards from Notion data
   */
  renderPortfolio(containerId = 'portfolio') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    if (!this.loaded || this.artworks.length === 0) {
      console.warn('No artworks loaded from Notion CMS');
      return;
    }

    // Clear existing content
    container.innerHTML = '';

    // Render each artwork as a card
    this.artworks.forEach((art, index) => {
      const card = this.createCard(art, index);
      container.appendChild(card);
    });

    console.log(`🎨 Rendered ${this.artworks.length} portfolio cards`);
    
    // Dispatch custom event for other systems (e.g., GSAP animations)
    window.dispatchEvent(new CustomEvent('notion:portfolio-rendered', {
      detail: { count: this.artworks.length }
    }));
  }

  /**
   * Create a portfolio card element
   */
  createCard(artwork, index) {
    const card = document.createElement('div');
    card.className = 'portfolio-card notion-artwork';
    card.dataset.index = index;
    card.dataset.year = artwork.year || '';
    card.dataset.category = artwork.category || '';
    
    // Add featured class if applicable
    if (artwork.featured) {
      card.classList.add('featured');
    }

    // Card HTML structure
    card.innerHTML = `
      <div class="card-image-wrapper">
        ${artwork.image ? `
          <img 
            src="${artwork.image}" 
            alt="${artwork.title}"
            loading="lazy"
            class="card-image"
          >
        ` : `
          <div class="card-placeholder">
            <span class="placeholder-text">${artwork.title.charAt(0)}</span>
          </div>
        `}
        <div class="card-overlay">
          <div class="card-info">
            <h3 class="card-title">${artwork.title}</h3>
            ${artwork.year ? `<p class="card-year">${artwork.year}</p>` : ''}
            ${artwork.medium ? `<p class="card-medium">${artwork.medium}</p>` : ''}
            ${artwork.dimensions ? `<p class="card-dimensions">${artwork.dimensions}</p>` : ''}
          </div>
        </div>
      </div>
      ${artwork.description ? `
        <div class="card-description">
          <p>${artwork.description}</p>
        </div>
      ` : ''}
    `;

    // Add click handler to view full artwork
    card.addEventListener('click', () => {
      this.showArtworkDetail(artwork);
    });

    return card;
  }

  /**
   * Show artwork detail modal
   */
  showArtworkDetail(artwork) {
    // Dispatch event for lightbox or detail view
    window.dispatchEvent(new CustomEvent('notion:artwork-selected', {
      detail: { artwork }
    }));
    
    // You can integrate this with existing lightbox.js
    if (window.lightbox && artwork.image) {
      window.lightbox.open(artwork.image, artwork.title);
    }
  }

  /**
   * Render bitácora entries from Notion data
   */
  renderBitacora(containerId = 'bitacora-entries') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Sort by date (newest first)
    const sorted = [...this.artworks].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    container.innerHTML = '';

    sorted.forEach(art => {
      const entry = document.createElement('article');
      entry.className = 'bitacora-entry';
      entry.innerHTML = `
        <div class="entry-date">${this.formatDate(art.created_at)}</div>
        <h3>${art.title}</h3>
        ${art.description ? `<p>${art.description}</p>` : ''}
        ${art.image ? `<img src="${art.image}" alt="${art.title}" loading="lazy">` : ''}
        <div class="entry-meta">
          ${art.year ? `<span class="year">${art.year}</span>` : ''}
          ${art.medium ? `<span class="medium">${art.medium}</span>` : ''}
        </div>
      `;
      container.appendChild(entry);
    });
  }

  /**
   * Format date for display
   */
  formatDate(isoDate) {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
}

// Initialize and export global instance
window.notionCMS = new NotionCMS();

// Auto-load on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  const loaded = await window.notionCMS.load();
  
  // If portfolio page, auto-render
  if (loaded && window.location.hash.includes('portfolio')) {
    window.notionCMS.renderPortfolio();
  }
  
  // If bitácora page, auto-render
  if (loaded && window.location.hash.includes('bitacora')) {
    window.notionCMS.renderBitacora();
  }
});

// Listen for route changes (SPA navigation)
window.addEventListener('hashchange', async () => {
  if (!window.notionCMS.loaded) {
    await window.notionCMS.load();
  }
  
  if (window.location.hash.includes('portfolio')) {
    window.notionCMS.renderPortfolio();
  } else if (window.location.hash.includes('bitacora')) {
    window.notionCMS.renderBitacora();
  }
});
