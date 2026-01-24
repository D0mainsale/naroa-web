/**
 * BLOCKCHAIN CoA - Certificados de Autenticidad en Blockchain
 * Integración con Zora/Base para certificados NFT
 * v1.0.0
 */
class BlockchainCoA {
    constructor() {
        this.network = 'base'; // 'base' or 'zora'
        this.contractAddress = ''; // Set when deployed
        this.init();
    }
    
    init() {
        this.addStyles();
        window.addEventListener('hashchange', () => this.checkShop());
        setTimeout(() => this.checkShop(), 1000);
        console.log('🔗 Blockchain CoA initialized');
    }
    
    checkShop() {
        if (!window.location.hash.includes('tienda')) return;
        setTimeout(() => this.enhanceProducts(), 500);
    }
    
    enhanceProducts() {
        const products = document.querySelectorAll('.shop-product, .product-card');
        products.forEach(p => {
            if (p.querySelector('.coa-badge')) return;
            const badge = document.createElement('div');
            badge.className = 'coa-badge';
            badge.innerHTML = '🔗 CoA Blockchain';
            badge.title = 'Certificado de Autenticidad en Blockchain';
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showModal(p.dataset.productId || 'demo');
            });
            p.appendChild(badge);
        });
    }
    
    showModal(productId) {
        if (document.getElementById('coa-modal')) return;
        const modal = document.createElement('div');
        modal.id = 'coa-modal';
        modal.innerHTML = `
            <div class="coa-modal-content">
                <button class="coa-close" aria-label="Cerrar">×</button>
                <h2>🔗 Certificado de Autenticidad</h2>
                <div class="coa-info">
                    <p>Cada obra original incluye un <strong>Certificado de Autenticidad (CoA)</strong> acuñado en blockchain.</p>
                    <div class="coa-features">
                        <div class="coa-feature"><span>✓</span> Inmutable y verificable</div>
                        <div class="coa-feature"><span>✓</span> Provenance digital</div>
                        <div class="coa-feature"><span>✓</span> Transferible al comprador</div>
                        <div class="coa-feature"><span>✓</span> Red Base/Zora</div>
                    </div>
                </div>
                <div class="coa-preview">
                    <div class="coa-card">
                        <div class="coa-header">CERTIFICATE OF AUTHENTICITY</div>
                        <div class="coa-artwork">🖼️</div>
                        <div class="coa-details">
                            <div class="coa-row"><span>Artista</span><strong>Naroa Gutiérrez Gil</strong></div>
                            <div class="coa-row"><span>Obra</span><strong>#${productId}</strong></div>
                            <div class="coa-row"><span>Red</span><strong>Base</strong></div>
                            <div class="coa-row"><span>Fecha</span><strong>${new Date().getFullYear()}</strong></div>
                        </div>
                        <div class="coa-signature">✒️ Firmado digitalmente</div>
                    </div>
                </div>
                <p class="coa-note">El CoA se transfiere automáticamente al completar la compra.</p>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.coa-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }
    
    // Future: actual minting function
    async mintCoA(productId, buyerAddress) {
        console.log('Minting CoA for', productId, 'to', buyerAddress);
        // Implementation with viem/wagmi
    }
    
    addStyles() {
        if (document.getElementById('coa-styles')) return;
        const s = document.createElement('style');
        s.id = 'coa-styles';
        s.textContent = `
            .coa-badge{position:absolute;top:8px;left:8px;background:linear-gradient(135deg,#8B5CF6,#6366F1);color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:500;cursor:pointer;z-index:10;transition:all .2s}
            .coa-badge:hover{transform:scale(1.05)}
            #coa-modal{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:1rem}
            .coa-modal-content{background:#fff;border-radius:16px;max-width:420px;width:100%;padding:2rem;position:relative}
            .coa-close{position:absolute;top:12px;right:12px;background:none;border:none;font-size:24px;cursor:pointer}
            .coa-modal-content h2{margin:0 0 1rem}
            .coa-features{display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin:1rem 0}
            .coa-feature{display:flex;gap:6px;font-size:13px}
            .coa-feature span{color:#8B5CF6}
            .coa-preview{margin:1.5rem 0}
            .coa-card{background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;padding:1.5rem;border-radius:12px;text-align:center}
            .coa-header{font-size:10px;letter-spacing:.15em;opacity:.7;margin-bottom:1rem}
            .coa-artwork{font-size:48px;margin:1rem 0}
            .coa-details{text-align:left;font-size:12px}
            .coa-row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.1)}
            .coa-signature{margin-top:1rem;font-size:11px;opacity:.6}
            .coa-note{font-size:12px;color:#666;text-align:center;margin-top:1rem}
        `;
        document.head.appendChild(s);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.blockchainCoA = new BlockchainCoA(); });
} else {
    window.blockchainCoA = new BlockchainCoA();
}
