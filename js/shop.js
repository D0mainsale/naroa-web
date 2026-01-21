/**
 * Naroa Shop - Tienda de Ilustraciones Numeradas
 * Sistema de venta de ediciones limitadas numeradas
 */

class NaroaShop {
  constructor() {
    this.products = [];
    this.cart = [];
    this.loaded = false;
    
    // Load cart from localStorage
    this.loadCart();
  }

  /**
   * Load shop products from JSON
   */
  async load() {
    try {
      const response = await fetch('/data/shop-products.json');
      if (!response.ok) {
        console.warn('⚠️ Shop products file not found');
        return false;
      }
      
      this.products = await response.json();
      this.loaded = true;
      console.log(`🛒 Loaded ${this.products.length} shop products`);
      return true;
    } catch (error) {
      console.error('❌ Error loading shop products:', error);
      return false;
    }
  }

  /**
   * Get all products
   */
  getProducts() {
    return this.products;
  }

  /**
   * Get available products (with stock)
   */
  getAvailable() {
    return this.products.filter(p => p.stock > 0 && p.available);
  }

  /**
   * Get product by ID
   */
  getProduct(id) {
    return this.products.find(p => p.id === id);
  }

  /**
   * Add product to cart
   */
  addToCart(productId, edition = null) {
    const product = this.getProduct(productId);
    if (!product) {
      console.error('Product not found:', productId);
      return false;
    }

    if (product.stock <= 0) {
      console.warn('Product out of stock:', product.title);
      return false;
    }

    // For numbered editions, check if specific edition is available
    if (product.numbered && edition) {
      const alreadyInCart = this.cart.some(
        item => item.productId === productId && item.edition === edition
      );
      if (alreadyInCart) {
        console.warn('Edition already in cart:', edition);
        return false;
      }
    }

    const cartItem = {
      productId,
      edition: edition || null,
      title: product.title,
      price: product.price,
      image: product.image,
      numbered: product.numbered,
      addedAt: Date.now()
    };

    this.cart.push(cartItem);
    this.saveCart();
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('shop:cart-updated', {
      detail: { cart: this.cart, item: cartItem }
    }));

    console.log('✅ Added to cart:', cartItem);
    return true;
  }

  /**
   * Remove product from cart
   */
  removeFromCart(index) {
    if (index >= 0 && index < this.cart.length) {
      const removed = this.cart.splice(index, 1)[0];
      this.saveCart();
      
      window.dispatchEvent(new CustomEvent('shop:cart-updated', {
        detail: { cart: this.cart, removed }
      }));
      
      return true;
    }
    return false;
  }

  /**
   * Clear cart
   */
  clearCart() {
    this.cart = [];
    this.saveCart();
    window.dispatchEvent(new CustomEvent('shop:cart-updated', {
      detail: { cart: [] }
    }));
  }

  /**
   * Get cart
   */
  getCart() {
    return this.cart;
  }

  /**
   * Get cart total
   */
  getTotal() {
    return this.cart.reduce((sum, item) => sum + item.price, 0);
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    localStorage.setItem('naroa-shop-cart', JSON.stringify(this.cart));
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    try {
      const saved = localStorage.getItem('naroa-shop-cart');
      if (saved) {
        this.cart = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.cart = [];
    }
  }

  /**
   * Render shop page
   */
  renderShop(containerId = 'shop-products') {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Container #${containerId} not found`);
      return;
    }

    if (!this.loaded || this.products.length === 0) {
      container.innerHTML = '<p class="shop-empty">No hay productos disponibles</p>';
      return;
    }

    container.innerHTML = '';

    this.products.forEach(product => {
      const card = this.createProductCard(product);
      container.appendChild(card);
    });

    console.log(`🎨 Rendered ${this.products.length} shop products`);
  }

  /**
   * Create product card
   */
  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'shop-product-card';
    card.dataset.id = product.id;
    
    if (product.stock === 0 || !product.available) {
      card.classList.add('sold-out');
    }

    const stockInfo = product.numbered 
      ? `Edición ${product.editionFrom}/${product.editionTo} - ${product.stock} disponibles`
      : `${product.stock} en stock`;

    card.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        ${product.numbered ? '<span class="numbered-badge">Numerada</span>' : ''}
        ${product.stock === 0 ? '<span class="sold-out-badge">Agotado</span>' : ''}
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
        <div class="product-details">
          <p class="product-medium">${product.medium}</p>
          <p class="product-size">${product.size}</p>
          ${product.numbered ? `<p class="product-stock">${stockInfo}</p>` : ''}
        </div>
        <div class="product-footer">
          <span class="product-price">${this.formatPrice(product.price)}</span>
          ${product.stock > 0 && product.available ? `
            <button class="add-to-cart-btn" data-product="${product.id}">
              Añadir al carrito
            </button>
          ` : ''}
        </div>
      </div>
    `;

    // Add click handler for add to cart
    const addBtn = card.querySelector('.add-to-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (product.numbered) {
          this.showEditionSelector(product);
        } else {
          this.addToCart(product.id);
        }
      });
    }

    // Click on card to show detail
    card.addEventListener('click', () => {
      this.showProductDetail(product);
    });

    return card;
  }

  /**
   * Show edition selector modal for numbered editions
   */
  showEditionSelector(product) {
    const modal = document.createElement('div');
    modal.className = 'edition-selector-modal';
    
    const availableEditions = [];
    for (let i = product.editionFrom; i <= product.editionTo; i++) {
      // Check if edition is not sold (you would track this in the product data)
      if (!product.soldEditions || !product.soldEditions.includes(i)) {
        availableEditions.push(i);
      }
    }

    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">&times;</button>
        <h3>Selecciona una edición</h3>
        <p>${product.title}</p>
        <div class="edition-grid">
          ${availableEditions.map(num => `
            <button class="edition-btn" data-edition="${num}">
              ${num}/${product.editionTo}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Edition selection
    modal.querySelectorAll('.edition-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const edition = parseInt(btn.dataset.edition);
        this.addToCart(product.id, edition);
        modal.remove();
        this.showCartNotification();
      });
    });
  }

  /**
   * Show product detail
   */
  showProductDetail(product) {
    window.dispatchEvent(new CustomEvent('shop:product-selected', {
      detail: { product }
    }));
  }

  /**
   * Show cart notification
   */
  showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = '✓ Añadido al carrito';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  /**
   * Format price
   */
  formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  /**
   * Initiate checkout (Stripe integration placeholder)
   */
  async checkout() {
    if (this.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    console.log('🛒 Iniciando checkout...', {
      cart: this.cart,
      total: this.getTotal()
    });

    // TODO: Integrate with Stripe or payment provider
    alert('Sistema de pago en desarrollo. Total: ' + this.formatPrice(this.getTotal()));
  }
}

// Initialize global instance
window.naroaShop = new NaroaShop();

// Auto-load on DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  await window.naroaShop.load();
  
  if (window.location.hash.includes('shop') || window.location.hash.includes('tienda')) {
    window.naroaShop.renderShop();
  }
});

// Listen for route changes
window.addEventListener('hashchange', async () => {
  if (!window.naroaShop.loaded) {
    await window.naroaShop.load();
  }
  
  if (window.location.hash.includes('shop') || window.location.hash.includes('tienda')) {
    window.naroaShop.renderShop();
  }
});
