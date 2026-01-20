import json
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
IMAGES_DIR = BASE_DIR / "images" / "raw_albums"
OUTPUT_FILE = BASE_DIR / "data" / "gallery.json"

def generate_manifest():
    gallery = []
    
    if not IMAGES_DIR.exists():
        print(f"❌ No image directory found at {IMAGES_DIR}")
        return

    print(f"📂 Scanning {IMAGES_DIR}...")
    
    # Get all album folders
    album_folders = [f for f in IMAGES_DIR.iterdir() if f.is_dir()]
    
    for album in album_folders:
        album_id = album.name
        images = []
        
        # Scan images in album
        for img in album.iterdir():
            if img.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
                # Create relative path for frontend
                rel_path = f"images/raw_albums/{album_id}/{img.name}"
                images.append(rel_path)
        
        if images:
            gallery.append({
                "albumId": album_id,
                "images": sorted(images)
            })
            
    # Save to JSON
    with open(OUTPUT_FILE, "w") as f:
        json.dump({"albums": gallery}, f, indent=2)
        
    print(f"✅ Generated manifest with {len(gallery)} albums at {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_manifest()
