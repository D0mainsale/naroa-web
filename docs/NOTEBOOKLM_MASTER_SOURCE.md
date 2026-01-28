# 📚 NAROA WEB - DOCUMENTACIÓN TÉCNICA CONSOLIDADA
## Para NotebookLM Research

**Proyecto:** naroa.online  
**Versión:** v5.0+ "Renacimiento Táctil"  
**Fecha:** Enero 2026  
**Arquitecto:** Antigravity AI

---

# PARTE 1: ARQUITECTURA DEL SISTEMA

## 📐 Principios de Diseño

### Filosofía "Artivista"
- **El error como método** - Imperfecciones intencionales
- **La espera como herramienta** - Lazy loading, animaciones pausadas
- **Ritual digital** - Experiencia ceremonial y contemplativa

### Capas de Experiencia
```
CAPA 1: HOME (Landing ceremonial)
CAPA 2: NAVEGACIÓN DIRECTA (Portfolio, Bitácora, Galería)
CAPA 3: RITUAL (Experiencia inmersiva mediante azar)
```

---

## 🎯 Sistema de Routing (Hash-Based SPA)

```javascript
Router Pattern:
  / → Home
  /#/portfolio → Portfolio curado
  /#/bitacora → Blog
  /#/galeria → Galería completa (352 imágenes)
  /#/press-kit → Press Kit digital
  /#/eventos → Calendario
  /#/catalogo → Catálogo venta
  /#/ritual → Experiencia ritual
  /#/process → Proceso artístico
  /#/retrato → Encargos
  /#/about → Sobre la artista
```

---

## 🧩 Módulos Principales

### Core Systems (`js/core/`)
- **router.js** - Hash-based routing, parámetros dinámicos
- **app.js** - Inicialización, registro de rutas, pre-cache

### Features (`js/features/`)
- **portfolio.js** - Grid de obras, proceso artístico
- **bitacora.js** - Blog con 3 vistas (List, Grid, Timeline)
- **galeria.js** - Masonry grid, lightbox, 352 imágenes
- **press-kit.js** - Bio, CV, Statement, descargas
- **eventos-obra-dia.js** - Calendario + Obra del Día
- **catalogo.js** - Originales, Prints, Comisiones

### Systems (`js/systems/`)
- **ritual-systems.js** - DayNightCycle, GlitchText, WebDecay, PigmentTrail
- **modo-dual.js** - Atmósfera Luz/Tiniebla con ciclo circadiano
- **mica-reactive.js** - Efecto mineral reactivo al cursor

---

## 🎨 Sistema de Estilos

### Variables CSS Globales (v5.0 "Renacimiento Táctil")
```css
:root {
  /* Paleta Cloud Dancer (Luz) */
  --cloud-dancer: #F0EDE5;
  --sombra-calida: rgba(139, 90, 43, 0.15);
  
  /* Paleta Carbón Profundo (Tiniebla) */
  --carbon-profundo: #1a1a1a;
  --mica-brillo: rgba(255, 248, 220, 0.08);
  
  /* Tipografía */
  --font-main: 'Inter', sans-serif;
  --font-display: 'Playfair Display', serif;
  
  /* Espaciado */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  
  /* Timing (respiración orgánica) */
  --timing-slow: 600ms;
  --timing-ritual: 1200ms;
  --easing-organic: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Modo Dual Atmosférico
- **Luz (día)**: Paleta Cloud Dancer, texturas papel escaneado
- **Tiniebla (noche)**: Carbón Profundo, cursor spotlight
- **Transición**: Circadiano automático + toggle manual gestual

---

## 📊 Gestión de Datos

### JSON de Configuración
- **blog.json** - Posts de Bitácora con imágenes WordPress
- **album-names.json** - Mapeo de 211 álbumes Facebook
- **images-index.json** - Índice de 352+ imágenes optimizadas

### Estructura de Imágenes
```
images/
├── raw_albums/          → Originales de Facebook
│   └── {album_id}/
├── optimized/           → WebP 1920px
│   └── {album_id}_{filename}.webp
└── thumbnails/          → WebP 400px
    └── {album_id}_{filename}.webp
```

---

# PARTE 2: FEATURES IMPLEMENTADAS (v2.0)

## ✅ Galería Interactiva de Álbums
- Grid masonry responsive
- Filtros por álbum/serie
- Búsqueda por nombre
- Lightbox con navegación
- Lazy loading
- 211 álbumes integrados

## ✅ Series Temáticas
- DiviNos VaiVenes
- Vaivenes
- Espejos del Alma
- Walking Gallery
- Cards interactivos con metadata

## ✅ Timeline Artístico Visual
- Scroll vertical por años (2026, 2025, 2022, 2019)
- Imágenes de cada exposición
- Layout alternado (zigzag)

## ✅ Press Kit Digital
- Bio profesional (corta/larga)
- CV artístico completo
- Artist Statement
- Imágenes HD para prensa

## ✅ Calendario de Eventos
- Exposiciones, talleres, intervenciones
- Integración Google Calendar
- Sistema de recordatorios

## ✅ Obra del Día
- Rotación automática diaria
- Compartir en RRSS
- Link a serie completa

## ✅ Catálogo de Venta
- Originales + Prints + Comisiones
- Precios visibles
- Contacto directo (Email + WhatsApp)

---

# PARTE 3: WORKFLOW DE DESARROLLO

## Comandos Disponibles

### Servidor Local
```bash
python3 -m http.server 8889
# o
npx serve . -l 8889
```

### Optimización de Imágenes
```bash
node scripts/images/optimize-images.js
node scripts/images/generate-images-index.js
```

### Deploy a Producción
```bash
git add -A
git commit -m "fix: descripción"
git push origin main  # Auto-deploy en Vercel
```

## URLs del Proyecto
| Entorno | URL |
|---------|-----|
| **Producción** | https://naroa.online |
| **Preview** | https://naroa-web.vercel.app |
| **Local** | http://localhost:8889 |

---

# PARTE 4: LORE Y COSMOGONÍA

## Génesis: El Primer Trazo
*Del silencio emergió MICA, la Primera Chispa. Donde tocó, el blanco se convirtió en gris, y del gris nació la CAVERNA.*

## Los Tres Reinos
1. **La Caverna (Grafito)** - Los trazos profundos, "El error como método"
2. **El Cielo (Mica)** - Los brillos que rompen la forma, "La espera como herramienta"
3. **El Vaivén** - El péndulo eterno, "Nada es excluyente"

## Los Cuatro Rituales Sagrados
1. **Materia y Mica** - Reconocer que somos polvo consciente
2. **El Glitch** - Celebrar el accidente como puerta
3. **Repetición** - El camino circular hasta olvidar
4. **Pálpito** - Escuchar el ritmo interno del material

## Glosario del Lore
| Término | Significado |
|---------|-------------|
| **VaiVén** | Movimiento pendular entre estados de ser |
| **DiviNos** | Habitantes del espacio intermedio |
| **Glitch** | El error sagrado |
| **Mica** | Mineral de la consciencia |
| **Grafito** | Sustancia de la profundidad |
| **ReCreo** | Crear a través de la destrucción |

---

# PARTE 5: CONFIGURACIÓN VERCEL

```json
{
  "rewrites": [
    { "source": "/galeria", "destination": "/galeria.html" }
  ],
  "headers": [
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000" }
      ]
    }
  ]
}
```

---

# PARTE 6: CHECKLIST PRE-DEPLOY

1. [ ] Verificar localhost funciona
2. [ ] Probar rutas: `/`, `/#/portfolio`, `/#/bitacora`
3. [ ] Lighthouse score > 90
4. [ ] Consola sin errores
5. [ ] git status limpio
6. [ ] git push origin main
7. [ ] Verificar https://naroa.online tras 2 min

---

**Documento generado para investigación con NotebookLM**  
**Proyecto:** Naroa Gutiérrez Gil - Portafolio Digital  
**Arquitecto:** Antigravity AI  
**Última actualización:** 27 Enero 2026
