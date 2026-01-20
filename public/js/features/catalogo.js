// === CATÁLOGO DE OBRA DISPONIBLE (SIN BACKEND) ===

class CatalogoSystem {
    constructor() {
        this.obras = [];
        this.init();
    }

    async init() {
        await this.loadObras();
        this.render();
        this.initFilters();
    }

    async loadObras() {
        // Catálogo de obra disponible para venta
        this.obras = [
            {
                id: 'divinos-01',
                title: 'Marilyn Rocks',
                serie: 'DiviNos VaiVenes',
                año: 2026,
                tipo: 'original',
                tecnica: 'Técnica mixta sobre pizarra',
                dimensiones: '60x80 cm',
                precio: 1200,
                disponible: true,
                imagen: '/images/obras/marilyn-rocks.jpg',
                descripcion: 'Icono del cine clásico reinterpretado en pizarra. Obra única.'
            },
            {
                id: 'divinos-02',
                title: 'Amy Rocks',
                serie: 'DiviNos VaiVenes',
                año: 2026,
                tipo: 'original',
                tecnica: 'Técnica mixta sobre pizarra',
                dimensiones: '60x80 cm',
                precio: 1200,
                disponible: true,
                imagen: '/images/obras/amy-rocks.jpg',
                descripcion: 'Homenaje a Amy Winehouse. Alma y música en cada trazo.'
            },
            {
                id: 'espejos-01',
                title: 'Retrato Alma #3',
                serie: 'Espejos del Alma',
                año: 2018,
                tipo: 'original',
                tecnica: 'Óleo sobre lienzo',
                dimensiones: '50x70 cm',
                precio: 800,
                disponible: true,
                imagen: '/images/obras/espejos-03.jpg',
                descripcion: 'De la serie clásica Espejos del Alma. Mirada profunda.'
            },
            {
                id: 'print-divinos',
                title: 'Print: DiviNos Collection',
                serie: 'DiviNos VaiVenes',
                año: 2026,
                tipo: 'print',
                tecnica: 'Impresión Giclée sobre papel fine art',
                dimensiones: '40x60 cm',
                precio: 80,
                disponible: true,
                edicion: 'Edición limitada 50 copias',
                imagen: '/images/prints/divinos-collection.jpg',
                descripcion: 'Colección completa de iconos DiviNos. Numerado y firmado.'
            },
            {
                id: 'print-vaivenes',
                title: 'Print: VAIVENES',
                serie: 'Vaivenes',
                año: 2019,
                tipo: 'print',
                tecnica: 'Impresión Giclée sobre papel fine art',
                dimensiones: '30x40 cm',
                precio: 50,
                disponible: true,
                edicion: 'Edición limitada 100 copias',
                imagen: '/images/prints/vaivenes.jpg',
                descripcion: 'Obra icónica de la serie Vaivenes. Numerado y firmado.'
            },
            {
                id: 'comision',
                title: 'Retrato por Encargo',
                serie: 'Comisiones',
                año: 2026,
                tipo: 'comision',
                tecnica: 'Técnica a consultar',
                dimensiones: 'A consultar',
                precio: 'Desde 600€',
                disponible: true,
                imagen: '/images/obras/comision-ejemplo.jpg',
                descripcion: 'Retrato personalizado. Proceso colaborativo. Plazo: 2-3 meses.'
            }
        ];
    }

    render() {
        const container = document.getElementById('catalogo-container');
        if (!container) return;

        const originales = this.obras.filter(o => o.tipo === 'original');
        const prints = this.obras.filter(o => o.tipo === 'print');
        const comisiones = this.obras.filter(o => o.tipo === 'comision');

        container.innerHTML = `
            <div class="catalogo-header">
                <h1>Obra Disponible</h1>
                <p>Originales, prints de edición limitada y comisiones</p>
            </div>

            <!-- Filtros -->
            <div class="catalogo-filters">
                <button class="filter-btn active" data-tipo="all">Todos</button>
                <button class="filter-btn" data-tipo="original">Originales (${originales.length})</button>
                <button class="filter-btn" data-tipo="print">Prints (${prints.length})</button>
                <button class="filter-btn" data-tipo="comision">Comisiones</button>
            </div>

            <!-- Originales -->
            ${originales.length > 0 ? `
                <section class="catalogo-section" data-tipo="original">
                    <h2>Obras Originales</h2>
                    <div class="catalogo-grid">
                        ${originales.map(o => this.renderObra(o)).join('')}
                    </div>
                </section>
            ` : ''}

            <!-- Prints -->
            ${prints.length > 0 ? `
                <section class="catalogo-section" data-tipo="print">
                    <h2>Prints de Edición Limitada</h2>
                    <p class="section-subtitle">Impresiones Giclée de alta calidad, numeradas y firmadas</p>
                    <div class="catalogo-grid">
                        ${prints.map(o => this.renderObra(o)).join('')}
                    </div>
                </section>
            ` : ''}

            <!-- Comisiones -->
            ${comisiones.length > 0 ? `
                <section class="catalogo-section" data-tipo="comision">
                    <h2>Comisiones y Encargos</h2>
                    <p class="section-subtitle">Retratos personalizados y proyectos especiales</p>
                    <div class="catalogo-grid">
                        ${comisiones.map(o => this.renderObra(o)).join('')}
                    </div>
                </section>
            ` : ''}

            <!-- Info de Compra -->
            <div class="catalogo-info">
                <h3>Información de Compra</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-icon">📦</span>
                        <h4>Envío</h4>
                        <p>Envío asegurado a toda España. Internacional disponible.</p>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🎨</span>
                        <h4>Certificado</h4>
                        <p>Todas las obras incluyen certificado de autenticidad.</p>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">💬</span>
                        <h4>Consultas</h4>
                        <p>¿Preguntas? Contacta directamente para más información.</p>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🖼️</span>
                        <h4>Enmarcado</h4>
                        <p>Opciones de enmarcado profesional disponibles.</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderObra(obra) {
        const precioDisplay = typeof obra.precio === 'number' 
            ? `${obra.precio}€` 
            : obra.precio;

        return `
            <div class="obra-card ${obra.tipo}" data-id="${obra.id}">
                <div class="obra-image">
                    <img src="${obra.imagen}" alt="${obra.title}" onerror="this.src='/images/placeholder.jpg'">
                    ${!obra.disponible ? '<span class="sold-badge">Vendido</span>' : ''}
                    ${obra.tipo === 'print' ? '<span class="type-badge">Print</span>' : ''}
                </div>

                <div class="obra-info">
                    <h3>${obra.title}</h3>
                    <p class="obra-serie">${obra.serie} · ${obra.año}</p>
                    <p class="obra-tecnica">${obra.tecnica}</p>
                    <p class="obra-dimensiones">${obra.dimensiones}</p>
                    ${obra.edicion ? `<p class="obra-edicion">${obra.edicion}</p>` : ''}
                    
                    <div class="obra-precio-section">
                        <span class="obra-precio">${precioDisplay}</span>
                        ${obra.disponible ? `
                            <button class="btn-contactar" onclick="catalogoSystem.contactarObra('${obra.id}')">
                                ${obra.tipo === 'comision' ? 'Solicitar Info' : 'Contactar para Comprar'}
                            </button>
                        ` : `
                            <span class="no-disponible">No disponible</span>
                        `}
                    </div>
                </div>

                <button class="btn-ver-detalle" onclick="catalogoSystem.verDetalle('${obra.id}')">
                    Ver detalles →
                </button>
            </div>
        `;
    }

    initFilters() {
        document.querySelectorAll('.catalogo-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Filter sections
                const tipo = e.target.dataset.tipo;
                document.querySelectorAll('.catalogo-section').forEach(section => {
                    if (tipo === 'all' || section.dataset.tipo === tipo) {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                });
            });
        });
    }

    contactarObra(obraId) {
        const obra = this.obras.find(o => o.id === obraId);
        if (!obra) return;

        const subject = `Consulta sobre: ${obra.title}`;
        const body = `Hola Naroa,\n\nEstoy interesado/a en la obra "${obra.title}" (${obra.serie}).\n\n` +
                    `Me gustaría recibir más información sobre:\n` +
                    `- Disponibilidad\n` +
                    `- Opciones de pago\n` +
                    `- Envío\n\n` +
                    `Gracias!`;

        // Opciones de contacto
        const opciones = confirm(
            `¿Cómo prefieres contactar?\n\n` +
            `OK = Email\n` +
            `Cancelar = WhatsApp`
        );

        if (opciones) {
            // Email
            window.location.href = `mailto:info@naroa.online?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        } else {
            // WhatsApp
            const mensaje = `Hola! Estoy interesado/a en "${obra.title}" (${obra.serie})`;
            window.open(`https://wa.me/34600000000?text=${encodeURIComponent(mensaje)}`, '_blank');
        }
    }

    verDetalle(obraId) {
        const obra = this.obras.find(o => o.id === obraId);
        if (!obra) return;

        // Crear modal de detalle
        const modal = document.createElement('div');
        modal.className = 'obra-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.closest('.obra-modal').remove()">✕</button>
                
                <div class="modal-grid">
                    <div class="modal-image">
                        <img src="${obra.imagen}" alt="${obra.title}">
                    </div>
                    
                    <div class="modal-info">
                        <h2>${obra.title}</h2>
                        <p class="modal-serie">${obra.serie} · ${obra.año}</p>
                        
                        <div class="modal-details">
                            <p><strong>Técnica:</strong> ${obra.tecnica}</p>
                            <p><strong>Dimensiones:</strong> ${obra.dimensiones}</p>
                            ${obra.edicion ? `<p><strong>Edición:</strong> ${obra.edicion}</p>` : ''}
                            <p><strong>Precio:</strong> ${typeof obra.precio === 'number' ? obra.precio + '€' : obra.precio}</p>
                        </div>
                        
                        <div class="modal-descripcion">
                            <p>${obra.descripcion}</p>
                        </div>
                        
                        ${obra.disponible ? `
                            <button class="btn-contactar primary" onclick="catalogoSystem.contactarObra('${obra.id}')">
                                ${obra.tipo === 'comision' ? 'Solicitar Presupuesto' : 'Comprar Ahora'}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }
}

// Initialize
let catalogoSystem;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('catalogo-container')) {
        catalogoSystem = new CatalogoSystem();
    }
});
