import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
GALLERY_JSON = BASE_DIR / "data" / "gallery.json"

print(f"📖 Validando existencia de archivos...")

with open(GALLERY_JSON, "r") as f:
    data = json.load(f)

original_count = sum(len(album["images"]) for album in data["albums"])
missing_count = 0

# Validar cada imagen
for album in data["albums"]:
    valid_images = []
    for img_path in album["images"]:
        # Convertir ruta web a ruta del sistema
        file_path = BASE_DIR / img_path.lstrip('/')
        
        if file_path.exists():
            valid_images.append(img_path)
        else:
            missing_count += 1
            print(f"❌ No existe: {img_path}")
    
    album["images"] = valid_images

# Filtrar álbumes vacíos
data["albums"] = [album for album in data["albums"] if album["images"]]

final_count = sum(len(album["images"]) for album in data["albums"])

# Guardar
with open(GALLERY_JSON, "w") as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Validación completa:")
print(f"   Original: {original_count} imágenes")
print(f"   Eliminadas: {missing_count} (no existen)")
print(f"   Final: {final_count} imágenes")
print(f"   Álbumes: {len(data['albums'])}")
