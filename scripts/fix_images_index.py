#!/usr/bin/env python3
"""Regenera images-index.json usando rutas de /images/optimized/"""
import os
import json
import re

# Cargar album names
album_names = {}
try:
    with open('data/album-names.json', 'r') as f:
        album_names = json.load(f)
except:
    print("Warning: album-names.json not found")

# Escanear optimized
optimized_dir = 'public/images/optimized'
images = []

for filename in sorted(os.listdir(optimized_dir)):
    if not filename.endswith('.webp'):
        continue
    
    # Extraer albumId del nombre (formato: albumId_000001_...)
    match = re.match(r'^(\d+)_(\d{6})_(.+)\.webp$', filename)
    if not match:
        continue
    
    album_id = match.group(1)
    index_str = match.group(2)
    index = int(index_str)
    
    # Path correcto para producción
    path = f"/images/optimized/{filename}"
    
    # Nombre del album
    album_name = album_names.get(album_id, f"Album {album_id}")
    
    images.append({
        "id": f"{album_id}_{index}",
        "albumId": album_id,
        "albumName": album_name,
        "filename": filename,
        "path": path,
        "index": index
    })

print(f"Generated {len(images)} image entries")

# Guardar
with open('data/images-index.json', 'w') as f:
    json.dump(images, f, indent=2)

print("✅ data/images-index.json updated")
