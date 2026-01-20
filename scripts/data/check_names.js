const fs = require('fs');
const path = require('path');

const galleryPath = path.join(__dirname, '../data/gallery.json');
const namesPath = path.join(__dirname, '../data/album-names.json');

try {
    const gallery = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
    const names = JSON.parse(fs.readFileSync(namesPath, 'utf8'));

    console.log('Total albums in gallery:', gallery.albums.length);
    console.log('Total names in map:', Object.keys(names).length);

    const missing = [];
    gallery.albums.forEach(album => {
        if (!names[album.albumId]) {
            missing.push(album.albumId);
        }
    });

    if (missing.length > 0) {
        console.log('\n❌ Missing Names for Album IDs:');
        missing.forEach(id => console.log(`- ${id}`));
    } else {
        console.log('\n✅ All albums have names!');
    }

} catch (e) {
    console.error('Error:', e);
}
