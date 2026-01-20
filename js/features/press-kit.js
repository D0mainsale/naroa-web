// === PRESS KIT / DOSSIER DIGITAL SYSTEM ===

class PressKitSystem {
    constructor() {
        this.init();
    }

    init() {
        this.renderPressKit();
        this.initDownloadButtons();
    }

    renderPressKit() {
        const container = document.getElementById('press-kit-container');
        if (!container) return;

        container.innerHTML = `
            <div class="press-kit-header">
                <h1>Press Kit</h1>
                <p>Material de prensa y recursos para galerías, curadores y medios</p>
            </div>

            <!-- Bio Profesional -->
            <section class="press-section">
                <h2>Biografía</h2>
                <div class="press-content">
                    <div class="bio-versions">
                        <div class="bio-version">
                            <h3>Versión Corta (100 palabras)</h3>
                            <p>Naroa Gutiérrez Gil (Bilbao, 1990) es artista plástica especializada en retratos y técnica mixta. Su obra explora la dualidad como complementariedad, creando "espejos del alma" que reflejan la esencia humana. Ha expuesto en espacios como el Copper Deli Museo, Politena y diversas galerías del País Vasco. Creadora de "Walking Gallery", intervenciones urbanas que transforman el espacio público. Su trabajo combina tradición pictórica con innovación conceptual, siempre desde una perspectiva "artivista" comprometida con la comunidad.</p>
                            <button class="download-btn" onclick="pressKit.downloadBio('short')">Descargar TXT</button>
                        </div>

                        <div class="bio-version">
                            <h3>Versión Larga (500 palabras)</h3>
                            <p>Naroa Gutiérrez Gil es una artista plástica vasca cuya obra trasciende la mera representación visual para convertirse en un diálogo profundo entre el observador y lo observado. Nacida en Bilbao en 1990, su formación autodidacta y su constante experimentación la han llevado a desarrollar un lenguaje plástico único que combina técnicas tradicionales con enfoques contemporáneos.</p>
                            <p>Su serie emblemática "Espejos del Alma" (2015-2020) establece su firma estética: retratos que no buscan capturar el parecido físico sino la esencia interior del sujeto. A través de la pizarra como soporte y la técnica mixta como medio, Naroa crea superficies texturadas que invitan al tacto visual y a la reflexión metafísica.</p>
                            <p>En 2019, la exposición "VAIVENES" en el Copper Deli Museo marca un punto de inflexión en su trayectoria. La muestra explora la polaridad no como oposición sino como complementariedad, un tema recurrente que desarrollará en trabajos posteriores como "DiviNos VaiVenes" (2026).</p>
                            <button class="download-btn" onclick="pressKit.downloadBio('long')">Descargar TXT</button>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CV Artístico -->
            <section class="press-section">
                <h2>Curriculum Vitae</h2>
                <div class="press-content cv-content">
                    <div class="cv-section">
                        <h3>Exposiciones Individuales</h3>
                        <ul>
                            <li><strong>2026</strong> - "DiviNos VaiVenes", Politena espacio de arte, Bilbao</li>
                            <li><strong>2019</strong> - "VAIVENES", Copper Deli Museo, Bilbao</li>
                            <li><strong>2015</strong> - "Espejos del Alma", ICASV, Bilbao</li>
                        </ul>
                    </div>

                    <div class="cv-section">
                        <h3>Exposiciones Colectivas (Selección)</h3>
                        <ul>
                            <li><strong>2025</strong> - Azoka en Lataska, Sopela</li>
                            <li><strong>2025</strong> - Udaberriko Jaia, Meñakoz Kultur Elkartea, Sopelana</li>
                            <li><strong>2022</strong> - "Bwall GIRLS - Emakumeen arteaN", Bilbao</li>
                            <li><strong>2022</strong> - "Repóker de Reinas", SIARTE, Bilbao</li>
                            <li><strong>2021</strong> - Fair Saturday, Bilbao</li>
                            <li><strong>2020</strong> - "ICONOS POP", Bilbao</li>
                        </ul>
                    </div>

                    <div class="cv-section">
                        <h3>Intervenciones Urbanas</h3>
                        <ul>
                            <li><strong>2022</strong> - Walking Gallery Bilbao (Octubre)</li>
                            <li><strong>2021</strong> - Flying Walking Gallery</li>
                        </ul>
                    </div>

                    <div class="cv-section">
                        <h3>Proyectos Culturales</h3>
                        <ul>
                            <li><strong>Fundadora</strong> - "El ReCreo", espacio de encuentro artístico</li>
                            <li><strong>Colaboradora</strong> - Meñakoz Kultur Elkartea</li>
                        </ul>
                    </div>

                    <button class="download-btn" onclick="pressKit.downloadCV()">Descargar CV Completo (PDF)</button>
                </div>
            </section>

            <!-- Artist Statement -->
            <section class="press-section">
                <h2>Artist Statement</h2>
                <div class="press-content statement-content">
                    <blockquote class="statement-quote">
                        "La realidad que habitamos, más que contradecirse, se complementa. 
                        Mi obra es un laberinto de espejos donde el alma entra en juego."
                    </blockquote>
                    
                    <p>Mi trabajo artístico nace de la pregunta: ¿Cómo afectaría a nuestro día a día si, en lugar de referirnos a las polaridades como "contrarios", lo hiciéramos como "complementarios"?</p>
                    
                    <p>A través del retrato y la técnica mixta, creo espacios de encuentro entre lo divino y lo humano, lo público y lo íntimo, lo tradicional y lo contemporáneo. Cada obra es una invitación a vernos reflejados no en nuestras diferencias, sino en nuestra esencial complementariedad.</p>
                    
                    <p>La pizarra como soporte no es casual: representa la posibilidad de borrar y reescribir, de transformar lo establecido. Es en esa superficie donde iconos pop, retratos cotidianos y símbolos culturales dialogan sin jerarquías.</p>
                    
                    <button class="download-btn" onclick="pressKit.downloadStatement()">Descargar Statement (PDF)</button>
                </div>
            </section>

            <!-- High-Res Images -->
            <section class="press-section">
                <h2>Imágenes de Prensa (Alta Resolución)</h2>
                <div class="press-content">
                    <div class="press-images-grid">
                        <div class="press-image-item">
                            <img src="https://naroagutierrez.wordpress.com/wp-content/uploads/2026/01/1-2.jpg" alt="DiviNos VaiVenes">
                            <div class="press-image-info">
                                <h4>DiviNos VaiVenes</h4>
                                <p>2026 · Técnica mixta sobre pizarra</p>
                                <button onclick="pressKit.downloadImage('divinos')">Descargar JPG (300dpi)</button>
                            </div>
                        </div>

                        <div class="press-image-item">
                            <img src="https://naroagutierrez.wordpress.com/wp-content/uploads/2019/11/vaivenes-sin-inauguracic3b3n.jpg" alt="VAIVENES">
                            <div class="press-image-info">
                                <h4>VAIVENES (Cartel)</h4>
                                <p>2019 · Copper Deli Museo</p>
                                <button onclick="pressKit.downloadImage('vaivenes')">Descargar JPG (300dpi)</button>
                            </div>
                        </div>

                        <div class="press-image-item">
                            <img src="https://naroagutierrez.wordpress.com/wp-content/uploads/2022/10/walking-gallery-bilbao.jpg" alt="Walking Gallery">
                            <div class="press-image-info">
                                <h4>Walking Gallery Bilbao</h4>
                                <p>2022 · Intervención urbana</p>
                                <button onclick="pressKit.downloadImage('walking')">Descargar JPG (300dpi)</button>
                            </div>
                        </div>

                        <div class="press-image-item">
                            <img src="https://naroagutierrez.wordpress.com/wp-content/uploads/2015/05/expo-a-la-vista.jpg" alt="Espejos del Alma">
                            <div class="press-image-info">
                                <h4>Espejos del Alma (Expo)</h4>
                                <p>2015 · ICASV</p>
                                <button onclick="pressKit.downloadImage('espejos')">Descargar JPG (300dpi)</button>
                            </div>
                        </div>
                    </div>
                    
                    <button class="download-btn primary" onclick="pressKit.downloadAllImages()">
                        Descargar TODAS las imágenes (ZIP)
                    </button>
                </div>
            </section>

            <!-- Contacto de Prensa -->
            <section class="press-section">
                <h2>Contacto de Prensa</h2>
                <div class="press-content contact-content">
                    <div class="contact-info">
                        <div class="contact-item">
                            <strong>Email:</strong>
                            <a href="mailto:info@naroa.online">info@naroa.online</a>
                        </div>
                        <div class="contact-item">
                            <strong>Instagram:</strong>
                            <a href="https://instagram.com/naroa_art" target="_blank">@naroa_art</a>
                        </div>
                        <div class="contact-item">
                            <strong>Facebook:</strong>
                            <a href="https://facebook.com/naroagutierrezgil.art" target="_blank">Naroa Gutiérrez Gil</a>
                        </div>
                        <div class="contact-item">
                            <strong>Ubicación:</strong>
                            Bilbao, País Vasco, España
                        </div>
                    </div>
                </div>
            </section>

            <!-- Download Complete Press Kit -->
            <div class="press-kit-footer">
                <button class="download-btn complete-kit" onclick="pressKit.downloadCompleteKit()">
                    📦 Descargar Press Kit Completo (ZIP)
                </button>
                <p>Incluye: Bio, CV, Statement, Imágenes HD, Logo y Documentos PDF</p>
            </div>
        `;
    }

    initDownloadButtons() {
        // Placeholder para funcionalidad de descarga
        console.log('Download buttons initialized');
    }

    downloadBio(version) {
        console.log(`Downloading bio: ${version}`);
        // TODO: Implementar descarga de texto
        alert('Función de descarga en desarrollo. Puedes copiar el texto directamente.');
    }

    downloadCV() {
        console.log('Downloading CV');
        alert('PDF del CV en preparación. Por favor contacta directamente.');
    }

    downloadStatement() {
        console.log('Downloading statement');
        alert('PDF del Statement en preparación. Por favor contacta directamente.');
    }

    downloadImage(imageId) {
        console.log(`Downloading image: ${imageId}`);
        alert('Descarga de imágenes HD disponible próximamente. Contacta para acceso inmediato.');
    }

    downloadAllImages() {
        console.log('Downloading all images');
        alert('ZIP de todas las imágenes en preparación. Por favor contacta directamente.');
    }

    downloadCompleteKit() {
        console.log('Downloading complete press kit');
        alert('Press Kit completo disponible próximamente. Por favor contacta directamente para recibirlo por email.');
    }
}

// Initialize
let pressKit;
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('press-kit-container')) {
        pressKit = new PressKitSystem();
    }
});
