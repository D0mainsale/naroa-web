/**
 * ═══════════════════════════════════════════════════════════════
 * PORTFOLIO DYNAMIC CONTROLS - Sistema de Filtros en Tiempo Real
 * ═══════════════════════════════════════════════════════════════
 */

class PortfolioDynamicControls {
    constructor(portfolio) {
        this.portfolio = portfolio;
        this.searchInput = null;
        this.materialFilter = null;
        this.sortSelect = null;
        this.countDisplay = null;
        this.init();
    }
    
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Obtener elementos
        this.searchInput = document.getElementById('obras-search');
        this.materialFilter = document.getElementById('material-filter');
        this.sortSelect = document.getElementById('obras-sort');
        this.countDisplay = document.getElementById('obras-count');
        
        if (!this.searchInput) return; // No estamos en la página de portfolio
        
        // Event listeners
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.materialFilter.addEventListener('change', (e) => this.handleFilter(e));
        this.sortSelect.addEventListener('change', (e) => this.handleSort(e));
    }
    
    handleSearch(e) {
        const searchTerm = e.target.value.trim().toLowerCase();
        this.filterAndRender(searchTerm);
    }
    
    handleFilter(e) {
        const material = e.target.value;
        this.filterAndRender('', material);
    }
    
    handleSort(e) {
        const sortType = e.target.value;
        this.sortObras(sortType);
    }
    
    filterAndRender(searchTerm = '', material = 'all') {
        if (!this.portfolio || !this.portfolio.obras) return;
        
        const currentSearch = searchTerm || this.searchInput.value.trim().toLowerCase();
        const currentMaterial = material || this.materialFilter.value;
        
        let filtered = [...this.portfolio.obras];
        
        // Filtrar por búsqueda
        if (currentSearch) {
            filtered = filtered.filter(obra => 
                obra.titulo.toLowerCase().includes(currentSearch)
            );
        }
        
        // Filtrar por material
        if (currentMaterial !== 'all') {
            filtered = filtered.filter(obra => {
                const tituloLower = obra.titulo.toLowerCase();
                return tituloLower.includes(currentMaterial);
            });
        }
        
        // Actualizar contador
        this.updateCount(filtered.length);
        
        // Re-renderizar
        this.portfolio.filteredObras = filtered.slice(0, 40);
        this.portfolio.renderGrid();
    }
    
    sortObras(sortType) {
        if (!this.portfolio || !this.portfolio.filteredObras) return;
        
        const obras = [...this.portfolio.filteredObras];
        
        switch(sortType) {
            case 'title-asc':
                obras.sort((a, b) => a.titulo.localeCompare(b.titulo));
                break;
            case 'title-desc':
                obras.sort((a, b) => b.titulo.localeCompare(a.titulo));
                break;
            case 'default':
            default:
                // Volver al orden original
                this.filterAndRender();
                return;
        }
        
        this.portfolio.filteredObras = obras;
        this.portfolio.renderGrid();
    }
    
    updateCount(count) {
        if (this.countDisplay) {
            this.countDisplay.textContent = `${count} obra${count !== 1 ? 's' : ''}`;
        }
    }
}

// Inicializar cuando el portfolio esté listo
window.addEventListener('load', () => {
    if (window.portfolio) {
        window.portfolioDynamicControls = new PortfolioDynamicControls(window.portfolio);
    }
});
