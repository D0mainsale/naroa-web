#!/usr/bin/env node

/**
 * OPTIMIZADOR DE IMÁGENES PARA GALERÍA NAROA
 * 
 * Optimiza las imágenes de los álbumes:
 * - Convierte a WebP (mejor compresión)
 * - Genera thumbnails para la galería
 * - Mantiene originales como backup
 * - Crea versiones optimizadas
 * 
 * Uso: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ALBUMS_DIR = path.join(__dirname, '../images/raw_albums');
const OPTIMIZED_DIR = path.join(__dirname, '../images/optimized');
const THUMBS_DIR = path.join(__dirname, '../images/thumbnails');

// Configuración
const CONFIG = {
    thumbWidth: 400,      // Ancho de thumbnails para galería
    thumbQuality: 80,     // Calidad thumbnails (0-100)
    fullWidth: 1920,      // Ancho máximo imagen completa
    fullQuality: 85,      // Calidad imagen completa
    format: 'webp'        // Formato de salida
};

function checkDependencies() {
    console.log('🔍 Verificando dependencias...\n');
    
    try {
        execSync('which convert', { stdio: 'pipe' });
        console.log('✅ ImageMagick instalado');
        return 'imagemagick';
    } catch {
        console.log('⚠️  ImageMagick no encontrado');
    }
    
    try {
        execSync('which ffmpeg', { stdio: 'pipe' });
        console.log('✅ FFmpeg instalado (puede convertir imágenes)');
        return 'ffmpeg';
    } catch {
        console.log('⚠️  FFmpeg no encontrado');
    }
    
    try {
        const sharp = require('sharp');
        console.log('✅ Sharp (Node.js) disponible');
        return 'sharp';
    } catch {
        console.log('⚠️  Sharp no instalado');
    }
    
    console.log('\n❌ No hay herramientas de optimización disponibles');
    console.log('\n📦 Instala una de estas opciones:\n');
    console.log('  Opción 1 - ImageMagick (recomendado):');
    console.log('    brew install imagemagick\n');
    console.log('  Opción 2 - Sharp (Node.js):');
    console.log('    npm install sharp\n');
    console.log('  Opción 3 - FFmpeg:');
    console.log('    brew install ffmpeg\n');
    
    return null;
}

function createDirectories() {
    [OPTIMIZED_DIR, THUMBS_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

function optimizeWithImageMagick(inputPath, outputPath, width, quality) {
    const cmd = `convert "${inputPath}" -resize ${width}x -quality ${quality} -strip "${outputPath}"`;
    execSync(cmd, { stdio: 'pipe' });
}

function optimizeWithFFmpeg(inputPath, outputPath, width, quality) {
    const cmd = `ffmpeg -i "${inputPath}" -vf scale=${width}:-1 -q:v ${Math.floor((100-quality)/10)} "${outputPath}" -y`;
    execSync(cmd, { stdio: 'pipe' });
}

async function optimizeWithSharp(inputPath, outputPath, width, quality) {
    const sharp = require('sharp');
    await sharp(inputPath)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality })
        .toFile(outputPath);
}

async function processImage(albumId, filename, tool) {
    const inputPath = path.join(ALBUMS_DIR, albumId, filename);
    const baseName = path.parse(filename).name;
    
    // Paths de salida
    const thumbPath = path.join(THUMBS_DIR, `${albumId}_${baseName}.${CONFIG.format}`);
    const fullPath = path.join(OPTIMIZED_DIR, `${albumId}_${baseName}.${CONFIG.format}`);
    
    // Skip si ya existen
    if (fs.existsSync(thumbPath) && fs.existsSync(fullPath)) {
        return { skipped: true };
    }
    
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;
    
    try {
        // Generar thumbnail
        if (!fs.existsSync(thumbPath)) {
            switch (tool) {
                case 'imagemagick':
                    optimizeWithImageMagick(inputPath, thumbPath, CONFIG.thumbWidth, CONFIG.thumbQuality);
                    break;
                case 'ffmpeg':
                    optimizeWithFFmpeg(inputPath, thumbPath, CONFIG.thumbWidth, CONFIG.thumbQuality);
                    break;
                case 'sharp':
                    await optimizeWithSharp(inputPath, thumbPath, CONFIG.thumbWidth, CONFIG.thumbQuality);
                    break;
            }
        }
        
        // Generar versión completa optimizada
        if (!fs.existsSync(fullPath)) {
            switch (tool) {
                case 'imagemagick':
                    optimizeWithImageMagick(inputPath, fullPath, CONFIG.fullWidth, CONFIG.fullQuality);
                    break;
                case 'ffmpeg':
                    optimizeWithFFmpeg(inputPath, fullPath, CONFIG.fullWidth, CONFIG.fullQuality);
                    break;
                case 'sharp':
                    await optimizeWithSharp(inputPath, fullPath, CONFIG.fullWidth, CONFIG.fullQuality);
                    break;
            }
        }
        
        const thumbSize = fs.existsSync(thumbPath) ? fs.statSync(thumbPath).size : 0;
        const fullSize = fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0;
        
        return {
            success: true,
            originalSize,
            thumbSize,
            fullSize,
            savings: originalSize - fullSize
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function optimizeAllImages() {
    const tool = checkDependencies();
    if (!tool) {
        process.exit(1);
    }
    
    console.log(`\n🎨 Usando: ${tool}\n`);
    console.log('📁 Creando directorios...');
    createDirectories();
    
    console.log('\n🖼️  Optimizando imágenes...\n');
    
    const albumDirs = fs.readdirSync(ALBUMS_DIR)
        .filter(name => fs.statSync(path.join(ALBUMS_DIR, name)).isDirectory());
    
    let totalProcessed = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const albumId of albumDirs) {
        const albumPath = path.join(ALBUMS_DIR, albumId);
        const files = fs.readdirSync(albumPath)
            .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
        
        console.log(`📁 ${albumId}: ${files.length} imágenes`);
        
        for (const file of files) {
            const result = await processImage(albumId, file, tool);
            
            if (result.skipped) {
                totalSkipped++;
            } else if (result.success) {
                totalProcessed++;
                totalOriginalSize += result.originalSize;
                totalOptimizedSize += result.fullSize;
                
                const savingsPercent = ((result.savings / result.originalSize) * 100).toFixed(1);
                process.stdout.write(`  ✓ ${file} (-${savingsPercent}%)\r`);
            } else {
                totalErrors++;
                console.log(`  ✗ ${file}: ${result.error}`);
            }
        }
        console.log(''); // Nueva línea después del álbum
    }
    
    console.log('\n📊 RESUMEN:');
    console.log(`  Procesadas: ${totalProcessed}`);
    console.log(`  Omitidas: ${totalSkipped}`);
    console.log(`  Errores: ${totalErrors}`);
    console.log(`  Tamaño original: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Tamaño optimizado: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Ahorro: ${(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100).toFixed(1)}%`);
    
    console.log('\n✅ Optimización completada');
    console.log(`📂 Thumbnails: ${THUMBS_DIR}`);
    console.log(`📂 Optimizadas: ${OPTIMIZED_DIR}`);
}

// Ejecutar
optimizeAllImages().catch(console.error);
