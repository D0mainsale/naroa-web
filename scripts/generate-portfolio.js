/**
 * Script to generate expanded portfolio from local images
 * Maps Facebook album structure to notion-artworks.json format
 */

const fs = require('fs');
const path = require('path');

// Album ID to Name mapping (extracted from Facebook)
const albumMapping = {
  // These IDs were found in local images - we'll assign series names based on the structure
};

// Read all images from optimized folder
const optimizedDir = '/Users/borjafernandezangulo/game/naroa-web/images/optimized';
const files = fs.readdirSync(optimizedDir).filter(f => f.endsWith('.webp'));

// Group files by album ID (first part of filename)
const albumGroups = {};
files.forEach(file => {
  const parts = file.split('_');
  const albumId = parts[0];
  if (!albumGroups[albumId]) {
    albumGroups[albumId] = [];
  }
  albumGroups[albumId].push(file);
});

// Sort each album's files by sequence number
Object.keys(albumGroups).forEach(albumId => {
  albumGroups[albumId].sort((a, b) => {
    const seqA = parseInt(a.split('_')[1]) || 0;
    const seqB = parseInt(b.split('_')[1]) || 0;
    return seqA - seqB;
  });
});

// Print album summary
console.log('\n=== ALBUM ID SUMMARY ===\n');
const albumIds = Object.keys(albumGroups).sort();
albumIds.forEach(id => {
  console.log(`Album ${id}: ${albumGroups[id].length} images`);
});
console.log(`\nTotal Albums: ${albumIds.length}`);
console.log(`Total Images: ${files.length}`);

// Load existing notion-artworks.json to preserve structure
const existingPath = '/Users/borjafernandezangulo/game/naroa-web/data/notion-artworks.json';
let existingData = { artworks: [] };
try {
  const data = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  existingData = data && data.artworks ? data : { artworks: [] };
} catch (e) {
  console.log('No existing artworks file found, creating new one');
}

console.log(`\nExisting artworks: ${existingData.artworks?.length || 0}`);

// Generate artworks array from all images
const artworks = [];
let id = 1;

albumIds.forEach(albumId => {
  const images = albumGroups[albumId];
  images.forEach((file, index) => {
    artworks.push({
      id: `img-${id++}`,
      title: `Obra ${albumId.slice(-4)}-${String(index + 1).padStart(2, '0')}`,
      image: `/images/optimized/${file}`,
      year: 2024,
      technique: "Técnica mixta",
      dimensions: "",
      series: `Serie ${albumId.slice(-6)}`,
      albumId: albumId,
      available: true
    });
  });
});

console.log(`\nGenerated ${artworks.length} artwork entries`);

// Write expanded artworks
const outputPath = '/Users/borjafernandezangulo/game/naroa-web/data/notion-artworks-expanded.json';
fs.writeFileSync(outputPath, JSON.stringify({ artworks }, null, 2));
console.log(`\nWritten to: ${outputPath}`);
