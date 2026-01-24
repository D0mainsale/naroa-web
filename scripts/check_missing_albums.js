const fs = require('fs');
const path = require('path');

// Paths
const IMAGES_INDEX_PATH = path.join(__dirname, '../data/images-index.json');
const ALBUM_NAMES_PATH = path.join(__dirname, '../data/album-names.json');

try {
    // Load data
    const images = JSON.parse(fs.readFileSync(IMAGES_INDEX_PATH, 'utf8'));
    let namedAlbums = {};
    if (fs.existsSync(ALBUM_NAMES_PATH)) {
        namedAlbums = JSON.parse(fs.readFileSync(ALBUM_NAMES_PATH, 'utf8'));
    }

    // Extract unique albums from images
    const albumStats = {};
    images.forEach(img => {
        if (!albumStats[img.albumId]) {
            albumStats[img.albumId] = {
                id: img.albumId,
                count: 0,
                currentName: img.albumName
            };
        }
        albumStats[img.albumId].count++;
    });

    // Check against named list
    const missing = [];
    const present = [];

    Object.values(albumStats).forEach(album => {
        if (namedAlbums[album.id]) {
            present.push({
                id: album.id,
                name: namedAlbums[album.id],
                count: album.count
            });
        } else {
            missing.push({
                id: album.id,
                currentName: album.currentName,
                count: album.count
            });
        }
    });

    // Report
    console.log('=== ALBUM NAME STATUS ===');
    console.log(`✅ Named Albums: ${present.length}`);
    console.log(`⚠️  Missing Names: ${missing.length}`);
    console.log('=========================');

    if (missing.length > 0) {
        console.log('\nTop 10 Albums needing names (by image count):');
        missing.sort((a, b) => b.count - a.count).slice(0, 10).forEach(a => {
            console.log(`- ID: ${a.id} | Images: ${a.count} | Current: "${a.currentName}"`);
        });
        
        console.log(`\nTo fix these, run the extracting script or edit data/album-names.json manually.`);
    } else {
        console.log('🎉 All albums have names!');
    }

} catch (e) {
    console.error('Error:', e.message);
}
