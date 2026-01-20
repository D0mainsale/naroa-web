#!/usr/bin/env python3
"""
Extract album dates from file modification times
Uses the oldest image in each album as approximation for album creation date.
"""
import json
import os
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
METADATA_JSON = DATA_DIR / "album-metadata.json"
RAW_ALBUMS_DIR = BASE_DIR / "images" / "raw_albums"

def get_album_date_from_files(album_path):
    """Get the oldest file modification time in the album folder."""
    files = list(album_path.glob("*"))
    if not files:
        return None
    
    # Get modification times
    mtimes = []
    for f in files:
        if f.is_file() and f.stat().st_size > 0:
            mtimes.append(f.stat().st_mtime)
    
    if not mtimes:
        return None
    
    # Use oldest file as album creation date approximation
    oldest_timestamp = min(mtimes)
    dt = datetime.fromtimestamp(oldest_timestamp)
    return dt.strftime('%Y-%m-%d')

def main():
    if not RAW_ALBUMS_DIR.exists():
        print(f"❌ No se encontró el directorio: {RAW_ALBUMS_DIR}")
        return
    
    album_folders = [d for d in RAW_ALBUMS_DIR.iterdir() if d.is_dir()]
    print(f"📁 Encontrados {len(album_folders)} álbumes en {RAW_ALBUMS_DIR}")
    
    album_metadata = {}
    success_count = 0
    fail_count = 0
    
    for album_folder in sorted(album_folders):
        album_id = album_folder.name
        date = get_album_date_from_files(album_folder)
        
        if date:
            album_metadata[album_id] = {
                "date": date,
                "source": "file_mtime"
            }
            print(f"✓ {album_id}: {date}")
            success_count += 1
        else:
            print(f"⚠️ {album_id}: No se pudo determinar fecha")
            fail_count += 1
    
    # Save metadata
    try:
        with open(METADATA_JSON, "w") as f:
            json.dump(album_metadata, f, indent=2)
        print(f"\n💾 Guardados metadatos de {len(album_metadata)} álbumes en {METADATA_JSON}")
        print(f"✅ Éxito: {success_count} | ⚠️ Fallos: {fail_count}")
    except Exception as e:
        print(f"❌ Error guardando metadata: {e}")

if __name__ == "__main__":
    main()
