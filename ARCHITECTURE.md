# 🏗️ Arquitectura del Proyecto

## 📐 **Principios de Diseño**

### **1. Filosofía "Artivista"**
El sitio refleja la filosofía artística de Naroa:
- **El error como método** - Imperfecciones intencionales en diseño
- **La espera como herramienta** - Lazy loading, animaciones pausadas
- **Ritual digital** - Experiencia ceremonial y contemplativa

### **2. Capas de Experiencia**

```
CAPA 1: HOME
  ↓
CAPA 2: NAVEGACIÓN DIRECTA (Portfolio, Bitácora, Galería, etc.)
  ↓
CAPA 3: RITUAL (Experiencia inmersiva mediante azar)
```

---

## 🎯 **Sistema de Routing**

### **Hash-Based SPA**
```javascript
Router Pattern:
  / → Home
  /#/portfolio → Portfolio curado
  /#/bitacora → Blog
  /#/galeria → Redirección a /galeria.html
  /#/press-kit → Press Kit (container dinámico)
  /#/eventos → Calendario
  /#/catalogo → Catálogo venta
  /#/ritual → Experiencia ritual
```

### **Standalone Pages**
```
/galeria.html → Galería completa (352 imágenes)
/index.html → SPA principal
```

---

## 🧩 **Módulos Principales**

### **Core Systems** (`js/`)

#### **router.js** - Sistema de Rutas
- Hash-based routing
- Parámetros dinámicos
- Navegación programática
- Match patterns con `:param`

#### **app.js** - Inicialización
- Setup de sistemas rituales
- Registro de rutas
- Event listeners globales
- Pre-cache de assets críticos

### **Features** (`js/`)

#### **portfolio.js** - Portfolio Curado
```javascript
class Portfolio {
  - renderGrid()      // Vista grid de obras
  - renderProcess()   // Proceso artístico
  - renderBitacora()  // Blog/reflexiones
  - renderAbout()     // Sobre la artista
}
```

#### **bitacora.js** - Sistema de Blog
```javascript
BitacoraSystem {
  - 3 vistas: List, Grid, Timeline
  - Búsqueda en tiempo real
  - Filtros por tags
  - Pull-out quotes
  - Share buttons
  - Tipografía dinámica
}
```

#### **galeria.js** - Galería Interactiva
```javascript
GaleriaSystem {
  - Masonry grid
  - Lightbox navegable
  - Filtros por álbum
  - Búsqueda
  - Lazy loading
  - 352 imágenes indexadas
}
```

#### **press-kit.js** - Press Kit Digital
```javascript
PressKitSystem {
  - Bio (corta/larga)
  - CV artístico
  - Statement
  - Imágenes HD
  - Descargas
}
```

#### **eventos-obra-dia.js** - Calendario + Obra del Día
```javascript
EventosSystem {
  - Eventos actuales/próximos
  - Google Calendar integration
  - Recordatorios
}

ObraDelDiaSystem {
  - Rotación diaria automática
  - Share en RRSS
  - Link a serie completa
}
```

#### **catalogo.js** - Catálogo de Venta
```javascript
CatalogoSystem {
  - Originales
  - Prints limitados
  - Comisiones
  - Contacto directo (no backend)
  - Modal de detalles
}
```

### **Systems** (`js/`)

#### **ritual-systems.js** - Sistemas Rituales
```javascript
- DayNightCycle     // Ciclo luz/oscuridad
- GlitchText        // Glitch en textos
- WebDecay          // Degradación visual
- RitualHandshake   // Saludo ceremonial
- PigmentTrail      // Rastro de cursor
- HeartbeatCursor   // Pulsación del cursor
```

#### **archive.js** - Juego de la Oca
```javascript
class JuegoOca {
  - Tablero de 42 casillas
  - Dado ceremonial
  - Navegación por azar
  - Sonido ambiente
  - Partículas flotantes
}
```

---

## 🎨 **Sistema de Estilos**

### **Estructura CSS**

```
css/
├── style.css              # Base + variables + home
├── ritual.css             # Estilos del ritual
├── bitacora-premium.css   # Bitácora completa
└── galeria-premium.css    # Galería + lightbox
```

### **Variables CSS Globales**
```css
:root {
  /* Colores */
  --white: #fff;
  --black: #0a0a0a;
  --gray-light: #f5f5f5;
  --gray-medium: #888;
  --gray-dark: #333;
  --accent: #000;
  
  /* Tipografía */
  --font-main: 'Inter', sans-serif;
  --font-display: 'Inter', sans-serif;
  
  /* Espaciado */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
  --space-xl: 6rem;
  
  /* Timing */
  --timing-fast: 200ms;
  --timing-base: 300ms;
  --timing-slow: 600ms;
}
```

---

## 📊 **Gestión de Datos**

### **Estructura JSON**

#### **blog.json** - Posts de Bitácora
```json
{
  "posts": [
    {
      "id": "post-001",
      "title": "Título del post",
      "date": "2026-01-15",
      "excerpt": "Extracto...",
      "content": "Contenido completo...",
      "images": ["url1", "url2"],
      "tags": ["exposición", "bilbao"],
      "wordpress_url": "https://..."
    }
  ]
}
```

#### **album-names.json** - Mapeo de Álbumes
```json
{
  "album_id": "Nombre Legible del Álbum",
  "1004454256295953": "Entre Tantas Flores de Día"
}
```

#### **images-index.json** - Índice de Imágenes
```json
[
  {
    "id": "album_id_index",
    "albumId": "1004454256295953",
    "albumName": "Entre Tantas Flores de Día",
    "filename": "image.jpg",
    "path": "/images/raw_albums/1004454256295953/image.jpg",
    "index": 0
  }
]
```

---

## 🖼️ **Sistema de Imágenes**

### **Estructura de Directorios**
```
images/
├── raw_albums/          # Originales de Facebook
│   └── {album_id}/
│       └── *.jpg
├── optimized/           # WebP optimizadas 1920px
│   └── {album_id}_{filename}.webp
└── thumbnails/          # Thumbs 400px
    └── {album_id}_{filename}.webp
```

### **Workflow de Optimización**
```bash
1. Descarga → raw_albums/
2. Optimización → 
   - Thumbnails (400px, Q80) → thumbnails/
   - Full (1920px, Q85) → optimized/
3. Indexación → images-index.json
```

---

## 🔄 **Flujo de Usuario**

### **Primera Visita**
```
1. Landing (/) → "¿Juegas?"
2. Usuario elige:
   A) Ritual → Experiencia azar
   B) Obras → Portfolio directo
```

### **Navegación Portfolio**
```
Portfolio → Ver obras curadas
Process → Método artístico
Bitácora → Reflexiones
Galería → 352 imágenes completas
Retrato → Encargar obra
About → Contacto
```

### **Experiencia Ritual**
```
1. Intro ceremonial
2. Tirar dado
3. Avanzar casillas
4. Revelar obra
5. Contemplar
6. Repetir o explorar
```

---

## 🚀 **Performance**

### **Optimizaciones Aplicadas**

1. **Assets**
   - Preconnect a Google Fonts
   - Lazy loading de imágenes
   - WebP format
   - Thumbnails para grids

2. **JavaScript**
   - Event delegation
   - RequestIdleCallback para pre-cache
   - Debounce en búsqueda
   - Intersection Observer

3. **CSS**
   - CSS custom properties
   - Transform hardware-accelerated
   - Will-change hints
   - Contenidos modulares

4. **Carga**
   - Critical CSS inline
   - Async scripts
   - Defer non-critical
   - Resource hints

---

## 🔐 **Security & Privacy**

- No cookies
- No tracking
- No analytics externas
- Formularios via mailto:
- API calls solo a Graph API (Facebook)

---

## 🎯 **SEO Strategy**

### **On-Page**
- Schema.org markup (Person, VisualArtwork, BlogPosting)
- OpenGraph tags completos
- Meta descriptions únicas
- Semantic HTML5
- Alt texts descriptivos
- Heading hierarchy

### **Technical**
- Clean URLs (hash routing transparente)
- Sitemap automático (Vercel)
- Robots.txt optimizado
- Canonical tags
- XML sitemap

### **Local SEO**
- Geo tags (Bilbao)
- LocalBusiness schema
- Google My Business ready

---

## 📦 **Deployment**

### **Vercel Configuration**
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

### **Build Process**
- No build step (static site)
- Auto-deploy on git push
- Preview deployments por PR
- Production: main branch

---

## 🧪 **Testing Strategy**

### **Manual Testing**
- Cross-browser (Chrome, Firefox, Safari)
- Mobile devices (iOS, Android)
- Tablet (iPad)
- Desktop (1920px+)

### **Performance**
- Lighthouse score target: 90+
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Cumulative Layout Shift < 0.1

---

## 🔮 **Future Enhancements**

### **Fase 1** (Implementado)
- ✅ Bitácora Premium
- ✅ Galería 352 imágenes
- ✅ Press Kit
- ✅ Calendario Eventos
- ✅ Catálogo

### **Fase 2** (Próximo)
- [ ] Instagram Feed Widget
- [ ] Multiidioma (ES/EU/EN)
- [ ] Búsqueda por color
- [ ] Video testimonials
- [ ] AR preview de obras

### **Fase 3** (Futuro)
- [ ] E-commerce completo
- [ ] Newsletter
- [ ] Blog comments
- [ ] User accounts
- [ ] Private collections

---

**Arquitectura diseñada por:** Antigravity AI  
**Para:** Naroa Gutiérrez Gil  
**Fecha:** 20 Enero 2026  
**Versión:** 2.0.0
