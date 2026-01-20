#!/usr/bin/env node

/**
 * GENERADOR DE ÍNDICE DE IMÁGENES
 * 
 * Escanea /images/raw_albums/ y genera un JSON con todas las imágenes
 * para ser usado por la galería interactiva.
 * 
 * Uso: node scripts/generate-images-index.js
 */

const fs = require('fs');
const path = require('path');

const ALBUMS_DIR = path.join(__dirname, '../images/raw_albums');
const ALBUM_NAMES_PATH = path.join(__dirname, '../data/album-names.json');
const OUTPUT_PATH = path.join(__dirname, '../data/images-index.json');

function generateImagesIndex() {
    console.log('🖼️  Generando índice de imágenes...\n');
    
    // Cargar nombres de álbumes
    let albumNames = {};
    try {
        albumNames = JSON.parse(fs.readFileSync(ALBUM_NAMES_PATH, 'utf8'));
        console.log(`✅ ${Object.keys(albumNames).length} nombres de álbumes cargados`);
    } catch (error) {
        console.error('❌ Error al cargar album-names.json:', error.message);
        return;
    }
    
    // Escanear directorios de álbumes
    const imagesIndex = [];
    let totalImages = 0;
    
    try {
        const albumDirs = fs.readdirSync(ALBUMS_DIR)
            .filter(name => fs.statSync(path.join(ALBUMS_DIR, name)).isDirectory());
        
        console.log(`📁 ${albumDirs.length} álbumes encontrados\n`);
        
        albumDirs.forEach(albumId => {
            const albumPath = path.join(ALBUMS_DIR, albumId);
            const albumName = albumNames[albumId] || `Álbum ${albumId}`;

            
            try {
                const files = fs.readdirSync(albumPath)
                    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
                    .sort();
                
                files.forEach((file, index) => {
                    imagesIndex.push({
                        id: `${albumId}_${index}`,
                        albumId,
                        albumName,
                        filename: file,
                        path: `/images/raw_albums/${albumId}/${file}`,
                        index
                    });
                });
                
                totalImages += files.length;
                console.log(`  ${albumName}: ${files.length} imágenes`);
            } catch (error) {
                console.error(`  ❌ Error procesando ${albumId}:`, error.message);
            }
        });
        
    } catch (error) {
        console.error('❌ Error al leer directorio de álbumes:', error.message);
        return;
    }
    
    // Guardar índice
    try {
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(imagesIndex, null, 2), 'utf8');
        console.log(`\n✅ Índice generado: ${OUTPUT_PATH}`);
        console.log(`📊 Total: ${totalImages} imágenes en ${imagesIndex.length} entradas`);
    } catch (error) {
        console.error('❌ Error al guardar índice:', error.message);
    }
}

// Ejecutar
generateImagesIndex();
