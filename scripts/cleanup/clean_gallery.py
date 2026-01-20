import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
GALLERY_JSON = BASE_DIR / "data" / "gallery.json"

# Imagen placeholder de Facebook (indica imagen eliminada/privada)
PLACEHOLDER_IMAGE = "237690363_344567687022659_8404992880571450365_n.jpg"

print(f"📖 Limpiando {GALLERY_JSON}...")

with open(GALLERY_JSON, "r") as f:
    data = json.load(f)

original_count = sum(len(album["images"]) for album in data["albums"])

# Filtrar imágenes rotas
for album in data["albums"]:
    album["images"] = [
        img for img in album["images"] 
        if PLACEHOLDER_IMAGE not in img
    ]

# Filtrar álbumes vacíos
data["albums"] = [album for album in data["albums"] if album["images"]]

cleaned_count = sum(len(album["images"]) for album in data["albums"])

# Guardar
with open(GALLERY_JSON, "w") as f:
    json.dump(data, f, indent=2)

print(f"✅ Limpiado: {original_count} → {cleaned_count} imágenes")
print(f"🗑️  Eliminadas {original_count - cleaned_count} imágenes placeholder")
