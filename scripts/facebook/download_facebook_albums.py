#!/usr/bin/env python3
"""
Facebook Album Mass Downloader para Naroa Gutiérrez Gil
Descarga todas las imágenes de álbumes especificados desde Facebook
"""

import os
import json
import time
import requests
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import concurrent.futures
from datetime import datetime

# Configuración
BASE_DIR = Path("/Users/borjafernandezangulo/game/naroa-web/images/facebook_albums")
ALBUM_IDS_FILE = Path("/Users/borjafernandezangulo/game/naroa-web/data/facebook-albums.json")
NAMES_FILE = Path("/Users/borjafernandezangulo/game/naroa-web/data/album-names.json")
MAX_WORKERS = 5  # Descarga paralela
DELAY_BETWEEN_ALBUMS = 2  # segundos
RETRY_ATTEMPTS = 3

# Facebook Graph API (requiere access token)
FB_ACCESS_TOKEN = os.getenv("FB_ACCESS_TOKEN", "")

class FacebookAlbumDownloader:
    def __init__(self, access_token):
        self.access_token = access_token
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        })
        
    def extract_album_id(self, url):
        """Extrae el album ID desde la URL"""
        parsed = urlparse(url)
        params = parse_qs(parsed.query)
        if 'set' in params:
            set_value = params['set'][0]
            if set_value.startswith('a.'):
                return set_value[2:]
        return None
    
    def get_album_photos(self, album_id):
        """Obtiene URLs de todas las fotos de un álbum usando Graph API"""
        if not self.access_token:
            print(f"⚠️  No access token\n available. Using public scraping fallback...")
            return self.scrape_album_photos(album_id)
        
        photos = []
        url = f"https://graph.facebook.com/v18.0/{album_id}/photos"
        params = {
            'fields': 'id,images,created_time',
            'access_token': self.access_token,
            'limit': 100
        }
        
        while url:
            try:
                response = self.session.get(url, params=params if params else None)
                response.raise_for_status()
                data = response.json()
                
                for photo in data.get('data', []):
                    images = photo.get('images', [])
                    if images:
                        # Usar la imagen de mayor resolución
                        best_image = max(images, key=lambda x: x.get('width', 0) * x.get('height', 0))
                        photos.append({
                            'id': photo['id'],
                            'url': best_image['source'],
                            'created_time': photo.get('created_time', '')
                        })
                
                url = data.get('paging', {}).get('next')
                params = None  # Los parámetros ya están en la URL de next
                
                if url:
                    time.sleep(0.5)  # Rate limiting
                    
            except Exception as e:
                print(f"❌ Error fetching album {album_id}: {e}")
                break
        
        return photos
    
    def scrape_album_photos(self, album_id):
        """Fallback: intenta scraping del HTML público (limitado)"""
        print(f"⚠️  Method limitation: requiere acceso manual a Facebook")
        return []
    
    def download_image(self, url, filepath, retries=RETRY_ATTEMPTS):
        """Descarga una imagen con reintentos"""
        for attempt in range(retries):
            try:
                response = self.session.get(url, timeout=30)
                response.raise_for_status()
                
                filepath.parent.mkdir(parents=True, exist_ok=True)
                
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                
                return True
                
            except Exception as e:
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    print(f"❌ Failed to download {url}: {e}")
                    return False
    
    def download_album(self, album_url, album_name="Unnamed Album"):
        """Descarga todas las fotos de un álbum"""
        album_id = self.extract_album_id(album_url)
        if not album_id:
            print(f"❌ Invalid album URL: {album_url}")
            return 0
        
        # Crear directorio para el álbum
        safe_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in album_name)
        album_dir = BASE_DIR / f"{album_id}_{safe_name}"
        
        print(f"\n📁 Album: {album_name} (ID: {album_id})")
        print(f"   Path: {album_dir}")
        
        # Obtener fotos
        photos = self.get_album_photos(album_id)
        
        if not photos:
            print(f"   ⚠️  No photos found (may require authentication)")
            return 0
        
        print(f"   📸 Found {len(photos)} photos")
        
        # Descargar en paralelo
        downloaded = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = []
            for i, photo in enumerate(photos, 1):
                filename = f"{photo['id']}_{i:04d}.jpg"
                filepath = album_dir / filename
                
                if filepath.exists():
                    print(f"   ⏭️  Skip {i}/{len(photos)}: {filename} (exists)")
                    downloaded += 1
                    continue
                
                future = executor.submit(self.download_image, photo['url'], filepath)
                futures.append((future, i, len(photos), filename))
            
            for future, i, total, filename in futures:
                if future.result():
                    downloaded += 1
                    print(f"   ✅ {i}/{total}: {filename}")
                else:
                    print(f"   ❌ {i}/{total}: {filename}")
        
        print(f"   ✨ Downloaded {downloaded}/{len(photos)} photos")
        return downloaded

def main():
    print("🎨 Naroa Facebook Album Downloader")
    print("=" * 50)
    
    # Cargar lista de álbumes
    if not ALBUM_IDS_FILE.exists():
        print(f"❌ Album list not found: {ALBUM_IDS_FILE}")
        return
    
    with open(ALBUM_IDS_FILE) as f:
        album_data = json.load(f)
    
    # Cargar nombres de álbumes
    album_names = {}
    if NAMES_FILE.exists():
        with open(NAMES_FILE) as f:
            album_names = json.load(f)
        print(f"✅ Loaded {len(album_names)} album names\n")
    else:
        print(f"⚠️  No album names file found, using IDs as names\n")
    
    # Inicializar downloader
    downloader = FacebookAlbumDownloader(FB_ACCESS_TOKEN)
    if not FB_ACCESS_TOKEN:
        print("⚠️  FB_ACCESS_TOKEN not set. Limited functionality.")
        print("   To get full access, set environment variable: export FB_ACCESS_TOKEN='your_token'\n")
    
    # Procesar cada álbum
    albums = album_data.get('albums', [])
    total_photos = 0
    
    print(f"📦 Processing {len(albums)} albums...")
    print(f"📁 Download directory: {BASE_DIR}\n")
    
    start_time = datetime.now()
    
    for i, album_url in enumerate(albums, 1):
        album_id = downloader.extract_album_id(album_url)
        album_name = album_names.get(album_id, f"Album_{album_id}")
        
        print(f"\n[{i}/{len(albums)}] Processing: {album_name}")
        
        photos_downloaded = downloader.download_album(album_url, album_name)
        total_photos += photos_downloaded
        
        if i < len(albums):
            time.sleep(DELAY_BETWEEN_ALBUMS)
    
    elapsed = datetime.now() - start_time
    print(f"\n{'='*50}")
    print(f"✨ COMPLETED")
    print(f"   Albums processed: {len(albums)}")
    print(f"   Total photos downloaded: {total_photos}")
    print(f"   Time elapsed: {elapsed}")
    print(f"   Download directory: {BASE_DIR}")

if __name__ == "__main__":
    main()
