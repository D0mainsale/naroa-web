import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
GALLERY_JSON = BASE_DIR / "data" / "gallery.json"
MIN_FILE_SIZE = 10000  # 10KB mínimo

print(f"📖 Eliminando archivos corruptos y actualizando JSON...")

with open(GALLERY_JSON, "r") as f:
    data = json.load(f)

original_count = sum(len(album["images"]) for album in data["albums"])
removed_count = 0

# Validar cada imagen (tamaño y existencia)
for album in data["albums"]:
    valid_images = []
    for img_path in album["images"]:
        file_path = BASE_DIR / img_path.lstrip('/')
        
        try:
            if file_path.exists() and file_path.stat().st_size > MIN_FILE_SIZE:
                valid_images.append(img_path)
            else:
                removed_count += 1
                print(f"🗑️  Eliminando: {file_path.name} ({file_path.stat().st_size if file_path.exists() else 0} bytes)")
                # Eliminar archivo corrupto del disco
                if file_path.exists():
                    file_path.unlink()
        except Exception as e:
            removed_count += 1
            print(f"❌ Error con {file_path.name}: {e}")
    
    album["images"] = valid_images

# Filtrar álbumes vacíos
data["albums"] = [album for album in data["albums"] if album["images"]]

final_count = sum(len(album["images"]) for album in data["albums"])

# Guardar JSON limpio
with open(GALLERY_JSON, "w") as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Limpieza completa:")
print(f"   Original: {original_count} imágenes")
print(f"   Eliminadas: {removed_count} (corruptas/pequeñas)")
print(f"   Final: {final_count} imágenes válidas")
print(f"   Álbumes: {len(data['albums'])}")
