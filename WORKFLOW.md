# 🔄 Workflow de Desarrollo — naroa-web

## Estructura del Proyecto

```
naroa-web/
├── js/
│   ├── core/           → Router, App, Nav
│   ├── features/       → Portfolio, Bitácora, Galería...
│   ├── systems/        → Ritual, Juego de la Oca
│   ├── effects/        → Premium, Ultra-premium, Lightbox
│   └── utils/          → Slider, Material, WP fetcher
├── scripts/
│   ├── facebook/       → Descarga de álbumes
│   ├── images/         → Optimización y indexación
│   ├── data/           → Validación y extracción
│   └── cleanup/        → Limpieza de galería
└── data/               → JSON de configuración
```

---

## Comandos Disponibles

### Servidor Local
```bash
# Opción 1: Python simple server
python3 -m http.server 8080

# Opción 2: Node.js (si tienes npm)
npx serve .
```

### Optimización de Imágenes
```bash
node scripts/images/optimize-images.js
node scripts/images/generate-images-index.js
```

### Descarga de Facebook
```bash
cd scripts/facebook
python3 download_albums.py  # Script principal
```

---

## Flujo de Trabajo Típico

### 1. Añadir Nueva Imagen
1. Colocar en `images/raw_albums/{album_id}/`
2. `node scripts/images/optimize-images.js`
3. `node scripts/images/generate-images-index.js`
4. Verificar localmente
5. `git push` (auto-deploy Vercel)

### 2. Modificar Feature
1. Editar en `js/features/{feature}.js`
2. Verificar en localhost
3. Commit + Push

### 3. Deploy a Producción
```bash
git add -A
git commit -m "fix: descripción"
git push origin main  # Auto-deploy en Vercel
```

---

## URLs

| Entorno | URL |
|---------|-----|
| **Producción** | https://naroa.online |
| **Preview** | https://naroa-web.vercel.app |
| **Local** | http://localhost:8080 |
