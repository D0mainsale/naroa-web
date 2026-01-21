#!/usr/bin/env node
/**
 * Notion CMS Fetcher for Naroa Portfolio
 * Fetches artwork data from Notion database and saves to JSON
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.NOTION_DB_ID;
const OUTPUT_FILE = path.join(__dirname, '../data/notion-artworks.json');

// Notion API version
const NOTION_VERSION = '2022-06-28';
const ENDPOINT = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

/**
 * Parse Notion property value based on type
 */
function parseProperty(property) {
  if (!property) return null;
  
  switch (property.type) {
    case 'title':
      return property.title[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text[0]?.plain_text || '';
    case 'number':
      return property.number;
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select.map(s => s.name);
    case 'date':
      return property.date?.start || null;
    case 'files':
      return property.files[0]?.file?.url || property.files[0]?.external?.url || '';
    case 'url':
      return property.url || '';
    default:
      return null;
  }
}

/**
 * Fetch artworks from Notion database
 */
async function fetchNotionArtworks() {
  if (!NOTION_TOKEN || !DATABASE_ID) {
    console.error('❌ Error: NOTION_TOKEN and NOTION_DB_ID must be set in .env file');
    console.log('\nCreate a .env file with:');
    console.log('NOTION_TOKEN=your_integration_token');
    console.log('NOTION_DB_ID=your_database_id\n');
    process.exit(1);
  }

  try {
    console.log('🔍 Fetching artworks from Notion...');
    
    // Use dynamic import for node-fetch v3
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page_size: 100,
        sorts: [
          {
            property: 'Year',
            direction: 'descending'
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Notion API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    // Transform Notion pages to artwork objects
    const artworks = data.results.map(page => {
      const props = page.properties;
      
      return {
        id: page.id,
        title: parseProperty(props.Name || props.Título || props.Title),
        year: parseProperty(props.Year || props.Año),
        medium: parseProperty(props.Medium || props.Técnica || props.Medio),
        dimensions: parseProperty(props.Dimensions || props.Dimensiones),
        image: parseProperty(props.Image || props.Imagen),
        description: parseProperty(props.Description || props.Descripción),
        category: parseProperty(props.Category || props.Categoría),
        featured: parseProperty(props.Featured || props.Destacado) || false,
        album: parseProperty(props.Album || props.Álbum),
        tags: parseProperty(props.Tags || props.Etiquetas) || [],
        created_at: page.created_time,
        updated_at: page.last_edited_time
      };
    });

    console.log(`✅ Fetched ${artworks.length} artworks from Notion`);
    
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write to JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(artworks, null, 2), 'utf-8');
    console.log(`💾 Saved to ${OUTPUT_FILE}`);
    
    return artworks;
  } catch (error) {
    console.error('❌ Error fetching from Notion:', error.message);
    process.exit(1);
  }
}

// Run the fetcher
fetchNotionArtworks()
  .then(artworks => {
    console.log('\n📊 Summary:');
    console.log(`   Total artworks: ${artworks.length}`);
    console.log(`   With images: ${artworks.filter(a => a.image).length}`);
    console.log(`   Featured: ${artworks.filter(a => a.featured).length}`);
    console.log('\n✨ Done!\n');
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
