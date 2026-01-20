// ============================================
// SCRIPT DE EXTRACCIÓN DE ÁLBUMES DE FACEBOOK
// ============================================
// 
// INSTRUCCIONES:
// 1. Abre https://www.facebook.com/naroa.artista.plastica/photos_albums
// 2. Desplázate hacia abajo para cargar TODOS los álbumes
// 3. Abre la consola del navegador (F12 → Console)
// 4. Copia y pega TODO este script
// 5. Presiona Enter
// 6. El resultado se copiará automáticamente al portapapeles
// 7. Pégalo en data/album-names.json
//
// ============================================

(function() {
    const albumMap = {};
    let extractedCount = 0;
    
    // Buscar todos los enlaces de álbumes
    const albumLinks = document.querySelectorAll('a[href*="/media/set/?set=a."]');
    
    console.log(`🔍 Encontrados ${albumLinks.length} álbumes...`);
    
    albumLinks.forEach((link) => {
        try {
            // Extraer album ID del href
            const match = link.href.match(/set=a\.(\d+)/);
            if (!match) return;
            
            const albumId = match[1];
            
            // Buscar el nombre del álbum (puede estar en varios lugares)
            let albumName = null;
            
            // Opción 1: aria-label del link
            if (link.getAttribute('aria-label')) {
                albumName = link.getAttribute('aria-label');
            }
            
            // Opción 2: Texto dentro del link
            if (!albumName) {
                const textContent = link.textContent.trim();
                if (textContent && textContent.length > 0 && textContent.length < 100) {
                    albumName = textContent;
                }
            }
            
            // Opción 3: Buscar en elementos cercanos
            if (!albumName) {
                const parent = link.closest('[role="article"]') || link.closest('div');
                if (parent) {
                    const spans = parent.querySelectorAll('span');
                    for (const span of spans) {
                        const text = span.textContent.trim();
                        if (text && text.length > 3 && text.length < 100 && !text.includes('foto')) {
                            albumName = text;
                            break;
                        }
                    }
                }
            }
            
            if (albumName && albumName.length > 0) {
                // Limpiar el nombre
                albumName = albumName
                    .replace(/^\d+\s+fotos?$/i, '') // Remover "X fotos"
                    .replace(/Ver álbum completo/gi, '')
                    .trim();
                
                if (albumName.length > 0) {
                    albumMap[albumId] = albumName;
                    extractedCount++;
                    console.log(`✅ ${albumId}: "${albumName}"`);
                }
            }
        } catch (e) {
            console.warn('Error procesando álbum:', e);
        }
    });
    
    console.log(`\n✨ Extracción completa: ${extractedCount} álbumes con nombre`);
    console.log('\n📋 JSON generado:\n');
    
    const jsonOutput = JSON.stringify(albumMap, null, 2);
    console.log(jsonOutput);
    
    // Copiar al portapapeles
    if (navigator.clipboard) {
        navigator.clipboard.writeText(jsonOutput).then(() => {
            console.log('\n✅ ¡JSON copiado al portapapeles! Pégalo en data/album-names.json');
        }).catch(err => {
            console.error('❌ Error copiando al portapapeles:', err);
            console.log('\n👉 Copia manualmente el JSON de arriba');
        });
    } else {
        console.log('\n👉 Copia manualmente el JSON de arriba y pégalo en data/album-names.json');
    }
    
    return albumMap;
})();
