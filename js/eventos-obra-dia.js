// === CALENDARIO DE EVENTOS SYSTEM ===

class EventosSystem {
    constructor() {
        this.eventos = [];
        this.init();
    }

    async init() {
        await this.loadEventos();
        this.render();
    }

    async loadEventos() {
        // Eventos hardcoded por ahora (futuro: integración Google Calendar)
        this.eventos = [
            {
                id: 'divinos-2026',
                title: 'DiviNos VaiVenes',
                type: 'exposicion',
                fecha: '2026-01-15',
                fechaFin: '2026-02-28',
                lugar: 'Politena, espacio de arte',
                ciudad: 'Bilbao',
                descripcion: 'Muestra individual. Laberinto de espejos donde nuestra alma entra en juego.',
                imagen: 'https://naroagutierrez.wordpress.com/wp-content/uploads/2026/01/1-2.jpg',
                link: 'https://www.naroa.online/#/bitacora/divinos-vaivenes-politena',
                estado: 'activo'
            },
            {
                id: 'recreo-feb-2026',
                title: 'El ReCreo - Encuentro Creativo',
                type: 'taller',
                fecha: '2026-02-15',
                fechaFin: '2026-02-15',
                lugar: 'El ReCreo',
                ciudad: 'Bilbao',
                descripcion: 'Espacio de encuentro artístico. Taller de técnica mixta y retrato.',
                imagen: '/images/eventos/el-recreo.jpg',
                link: '#',
                estado: 'proximo',
                inscripcion: true
            },
            {
                id: 'walking-marzo-2026',
                title: 'Walking Gallery Primavera',
                type: 'intervencion',
                fecha: '2026-03-21',
                fechaFin: '2026-03-21',
                lugar: 'Calles del Casco Viejo',
                ciudad: 'Bilbao',
                descripcion: 'Galería ambulante. El arte sale a la calle en la primera jornada de primavera.',
                imagen: 'https://naroagutierrez.wordpress.com/wp-content/uploads/2022/10/walking-gallery-bilbao.jpg',
                link: '#',
                estado: 'proximo'
            },
            {
                id: 'azoka-mayo-2026',
                title: 'Azoka de Primavera',
                type: 'feria',
                fecha: '2026-05-18',
                fechaFin: '2026-05-18',
                lugar: 'Plaza del Ayuntamiento',
                ciudad: 'Sopelana',
                descripcion: 'Market de Artesanía y Arte. Celebrando la primavera con arte, sol y sal.',
                imagen: '/images/eventos/azoka-sopelana.jpg',
                link: '#',
                estado: 'proximo'
            }
        ];
    }

    render() {
        const container = document.getElementById('eventos-container');
        if (!container) return;

        const eventosActivos = this.eventos.filter(e => e.estado === 'activo');
        const eventosProximos = this.eventos.filter(e => e.estado === 'proximo');
        
        container.innerHTML = `
            <div class="eventos-header">
                <h1>Calendario de Eventos</h1>
                <p>Próximas exposiciones, talleres e intervenciones</p>
            </div>

            ${eventosActivos.length > 0 ? `
                <section class="eventos-section">
                    <h2 class="section-title">
                        <span class="status-badge active">Ahora</span>
                        En Curso
                    </h2>
                    <div class="eventos-grid">
                        ${eventosActivos.map(e => this.renderEvento(e)).join('')}
                    </div>
                </section>
            ` : ''}

            ${eventosProximos.length > 0 ? `
                <section class="eventos-section">
                    <h2 class="section-title">
                        <span class="status-badge upcoming">Próximamente</span>
                        Próximos Eventos
                    </h2>
                    <div class="eventos-grid">
                        ${eventosProximos.map(e => this.renderEvento(e)).join('')}
                    </div>
                </section>
            ` : ''}

            <!-- Subscribe to Calendar -->
            <div class="calendar-subscribe">
                <h3>¿Quieres estar al día?</h3>
                <p>Suscríbete para recibir recordatorios de próximos eventos</p>
                <div class="subscribe-buttons">
                    <button onclick="eventosSystem.subscribeGoogle()">
                        📅 Añadir a Google Calendar
                    </button>
                    <button onclick="eventosSystem.subscribeEmail()">
                        ✉️ Recibir por Email
                    </button>
                </div>
            </div>
        `;
    }

    renderEvento(evento) {
        const fechaInicio = new Date(evento.fecha);
        const fechaFin = evento.fechaFin ? new Date(evento.fechaFin) : null;
        
        const mes = fechaInicio.toLocaleLowerCase('es-ES', { month: 'short' });
        const dia = fechaInicio.getDate();
        
        const tipoIcons = {
            'exposicion': '🎨',
            'taller': '✨',
            'intervencion': '🚶',
            'feria': '🎪'
        };

        return `
            <div class="evento-card ${evento.estado}" data-tipo="${evento.type}">
                <div class="evento-date">
                    <span class="date-month">${mes}</span>
                    <span class="date-day">${dia}</span>
                </div>
                
                <div class="evento-image">
                    <img src="${evento.imagen}" alt="${evento.title}" onerror="this.src='/images/placeholder.jpg'">
                    <span class="evento-tipo-badge">${tipoIcons[evento.type]} ${evento.type}</span>
                </div>
                
                <div class="evento-content">
                    <h3>${evento.title}</h3>
                    <p class="evento-descripcion">${evento.descripcion}</p>
                    
                    <div class="evento-meta">
                        <span class="evento-lugar">📍 ${evento.lugar}, ${evento.ciudad}</span>
                        ${fechaFin && fechaFin.getTime() !== fechaInicio.getTime() ? `
                            <span class="evento-duracion">
                                📅 Hasta ${fechaFin.toLocaleDateString('es-ES')}
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="evento-actions">
                        ${evento.inscripcion ? `
                            <button class="btn-inscribir" onclick="eventosSystem.inscribir('${evento.id}')">
                                Inscribirse
                            </button>
                        ` : ''}
                        <button class="btn-recordar" onclick="eventosSystem.addToCalendar('${evento.id}')">
                            Recordar
                        </button>
                        ${evento.link && evento.link !== '#' ? `
                            <a href="${evento.link}" class="btn-mas-info">Más info</a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    addToCalendar(eventoId) {
        const evento = this.eventos.find(e => e.id === eventoId);
        if (!evento) return;

        // Crear URL de Google Calendar
        const startDate = new Date(evento.fecha).toISOString().replace(/-|:|\.\d\d\d/g, '');
        const endDate = evento.fechaFin 
            ? new Date(evento.fechaFin).toISOString().replace(/-|:|\.\d\d\d/g, '')
            : startDate;
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(evento.descripcion)}&location=${encodeURIComponent(evento.lugar + ', ' + evento.ciudad)}`;
        
        window.open(calendarUrl, '_blank');
    }

    inscribir(eventoId) {
        alert('Sistema de inscripción en desarrollo. Por favor contacta directamente: info@naroa.online');
    }

    subscribeGoogle() {
        alert('Integración con Google Calendar próximamente. Mientras tanto, añade eventos individuales.');
    }

    subscribeEmail() {
        const email = prompt('Introduce tu email para recibir recordatorios:');
        if (email) {
            alert('¡Gracias! Te enviaremos actualizaciones a ' + email);
            // TODO: Integrar con Mailchimp/SendGrid
        }
    }
}

// === OBRA DEL DÍA SYSTEM ===

class ObraDelDiaSystem {
    constructor() {
        this.init();
    }

    init() {
        this.renderObraDelDia();
        this.startRotation();
    }

    async renderObraDelDia() {
        const container = document.getElementById('obra-del-dia-container');
        if (!container) return;

        // Seleccionar obra basada en día del año
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        
        const obras = [
            {
                title: 'Marilyn Rocks',
                serie: 'DiviNos VaiVenes',
                año: 2026,
                tecnica: 'Técnica mixta sobre pizarra',
                descripcion: 'Icono atemporal que trasciende generaciones. Marilyn como símbolo de lo divino en lo humano.',
                imagen: '/images/raw_albums/1041107699297275/000001.jpg',
                albumId: '1041107699297275'
            },
            {
                title: 'Amy Rocks',
                serie: 'DiviNos VaiVenes',
                año: 2026,
                tecnica: 'Técnica mixta sobre pizarra',
                descripcion: 'La voz rota que cantaba verdades. Amy como espejo de nuestras heridas.',
                imagen: '/images/raw_albums/1038960572845321/000001.jpg',
                albumId: '1038960572845321'
            },
            {
                title: 'Flying Dragon',
                serie: 'Walking Gallery',
                año: 2022,
                tecnica: 'Intervención urbana',
                descripcion: 'El arte que vuela por las calles. Libertad en movimiento.',
                imagen: '/images/raw_albums/531476414998451/000003_475449441_1268838811262204_2492729812146607558_n.jpg',
                albumId: '531476414998451'
            }
        ];

        const obraDeHoy = obras[dayOfYear % obras.length];

        container.innerHTML = `
            <div class="obra-dia-wrapper">
                <div class="obra-dia-badge">
                    <span class="badge-icon">✨</span>
                    <span class="badge-text">Obra del Día</span>
                    <span class="badge-date">${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>

                <div class="obra-dia-content">
                    <div class="obra-dia-image">
                        <img src="${obraDeHoy.imagen}" alt="${obraDeHoy.title}" onerror="this.src='/images/placeholder.jpg'">
                    </div>

                    <div class="obra-dia-info">
                        <h2 class="obra-title">${obraDeHoy.title}</h2>
                        <p class="obra-serie">${obraDeHoy.serie} · ${obraDeHoy.año}</p>
                        <p class="obra-tecnica">${obraDeHoy.tecnica}</p>
                        
                        <blockquote class="obra-descripcion">
                            "${obraDeHoy.descripcion}"
                        </blockquote>

                        <div class="obra-actions">
                            <button onclick="obraDelDia.verMasDeSerie('${obraDeHoy.serie}')">
                                Ver más de ${obraDeHoy.serie}
                            </button>
                            <button onclick="obraDelDia.compartir('${obraDeHoy.title}')">
                                Compartir
                            </button>
                        </div>
                    </div>
                </div>

                <div class="obra-dia-footer">
                    <p>Cada día, una obra diferente. Vuelve mañana para descubrir más.</p>
                </div>
            </div>
        `;
    }

    startRotation() {
        // Actualizar a medianoche
        const ahora = new Date();
        const mañana = new Date(ahora);
        mañana.setDate(mañana.getDate() + 1);
        mañana.setHours(0, 0, 0, 0);
        
        const msHastaMañana = mañana - ahora;
        
        setTimeout(() => {
            this.renderObraDelDia();
            this.startRotation();
        }, msHastaMañana);
    }

    verMasDeSerie(serie) {
        window.location.href = `#/galeria?serie=${encodeURIComponent(serie)}`;
    }

    compartir(titulo) {
        const url = window.location.href;
        const texto = `Obra del día: ${titulo} - Naroa Gutiérrez Gil`;
        
        if (navigator.share) {
            navigator.share({
                title: texto,
                url: url
            });
        } else {
            alert('Comparte esta página: ' + url);
        }
    }
}

// Initialize
let eventosSystem, obraDelDia;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('eventos-container')) {
        eventosSystem = new EventosSystem();
    }
    if (document.getElementById('obra-del-dia-container')) {
        obraDelDia = new ObraDelDiaSystem();
    }
});
