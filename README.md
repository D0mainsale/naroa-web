# 🚀 Deploy trigger


Portfolio web profesional de la artista plástica Naroa Gutiérrez Gil, con galería interactiva de 352 obras, bitácora editorial y sistemas premium.

## 🌐 **Live Site**
- **Producción:** https://www.naroa.online
- **Vercel:** https://naroa-web.vercel.app

## 🚀 **Quick Start**

```bash
# Desarrollo local
npx serve -p 3000

# Visitar
http://localhost:3000
```

## 📂 **Estructura del Proyecto**

```
naroa-web/
├── css/                     # Estilos
│   ├── style.css           # Estilos base
│   ├── ritual.css          # Sistema ritual
│   ├── bitacora-premium.css # Bitácora
│   └── galeria-premium.css  # Galería
├── js/                      # JavaScript
│   ├── core/
│   │   ├── router.js       # Sistema de rutas
│   │   └── app.js          # Inicialización
│   ├── features/
│   │   ├── portfolio.js    # Portfolio curado
│   │   ├── bitacora.js     # Blog/Bitácora
│   │   ├── galeria.js      # Galería 352 imágenes
│   │   ├── press-kit.js    # Press kit digital
│   │   ├── eventos-obra-dia.js # Calendario
│   │   └── catalogo.js     # Catálogo de venta
│   └── systems/
│       ├── ritual-systems.js # Sistemas rituales
│       └── archive.js       # Archivo
├── images/                  # Imágenes
│   ├── raw_albums/         # 211 álbumes originales (352 imgs)
│   ├── optimized/          # WebP optimizadas
│   └── thumbnails/         # Thumbnails 400px
├── data/                    # Datos JSON
│   ├── blog.json           # 12 posts bitácora
│   ├── album-names.json    # 211 álbumes mapeados
│   └── images-index.json   # Índice de 352 imágenes
├── scripts/                 # Utilidades
│   ├── generate-images-index.js
│   ├── optimize-images.js
│   └── download_facebook_albums.py
├── index.html              # Página principal
├── galeria.html            # Galería standalone
└── vercel.json             # Config deployment
```

## ✨ **Features**

### **1. Portfolio Curado**
- Obras seleccionadas con metadatos
- Vista grid responsive
- Schema.org markup para SEO

### **2. Bitácora Premium** (15 features)
- 12 posts con imágenes auténticas de WordPress
- 3 vistas: List, Grid, Timeline
- Búsqueda y filtros por tags
- Pull-out quotes visuales
- Share buttons (X, Facebook, WhatsApp)

### **3. Galería Interactiva** (NUEVA)
- **352 imágenes** de 53 álbumes de Facebook
- Grid masonry responsive
- Filtros por álbum/serie
- Búsqueda en tiempo real
- Lightbox con navegación
- Lazy loading

### **4. Series Temáticas**
- DiviNos VaiVenes (2026)
- Vaivenes (2019-2023)
- Espejos del Alma (2015-2020)
- Walking Gallery (2021-2023)

### **5. Timeline Visual**
- Trayectoria artística 2015-2026
- Exposiciones individuales y colectivas
- Intervenciones urbanas
- Layout zigzag alternado

### **6. Press Kit Digital**
- Bio profesional (versión corta/larga)
- CV artístico completo
- Artist Statement
- Imágenes alta resolución
- Contacto de prensa

### **7. Calendario de Eventos**
- Eventos actuales y próximos
- Integración Google Calendar
- Sistema de recordatorios
- Tipos: exposiciones, talleres, ferias

### **8. Obra del Día**
- Rotación automática diaria
- Compartir en RRSS
- Links a serie completa

### **9. Catálogo de Venta**
- Originales + Prints + Comisiones
- Contacto directo Email/WhatsApp
- Modal de detalles
- Info de envío

### **10. Sistema Ritual**
- Juego de la Oca para explorar obra
- Partículas flotantes
- Atmósfera inmersiva
- Modo silencio

## 🛠️ **Scripts Disponibles**

```bash
# Generar índice de imágenes
node scripts/generate-images-index.js

# Optimizar imágenes (WebP + thumbnails)
node scripts/optimize-images.js

# Descargar álbumes de Facebook (requiere token)
export FB_ACCESS_TOKEN='tu_token'
python3 scripts/download_facebook_albums.py
```

## 📊 **Optimización**

- **352 imágenes** optimizadas a WebP
- Thumbnails 400px para galería
- Lazy loading de imágenes
- Preconnect a Google Fonts
- Service Worker ready

## 🎯 **SEO & Performance**

- Schema.org markup completo
- Open Graph tags
- JSON-LD para artista
- Meta tags optimizados
- Responsive images
- Geolocalización (Bilbao)

## 📱 **Responsive Design**

- Mobile-first approach
- Breakpoints: 768px, 1024px, 1400px
- Touch-friendly interactions
- Optimized for all devices

## 🔧 **Tecnologías**

- **Frontend:** Vanilla JS (ES6+)
- **Estilos:** CSS3 con variables
- **Routing:** Hash-based SPA
- **Build:** None (static site)
- **Deploy:** Vercel
- **Optimización:** ImageMagick, Sharp

## 📝 **Datos**

- **211 álbumes** descargados de Facebook
- **147 álbumes** mapeados con nombres descriptivos
- **352 imágenes** indexadas y optimizadas
- **12 posts** en Bitácora con imágenes WordPress

## 🚢 **Deployment**

```bash
# Auto-deploy con git push
git add .
git commit -m "Update"
git push

# Vercel detecta automáticamente y despliega
```

## 🏗️ **Development**

```bash
# Clonar
git clone https://github.com/D0mainsale/naroa-web.git
cd naroa-web

# Servir localmente
npx serve -p 3000

# Ver en navegador
open http://localhost:3000
```

## 📖 **Documentación Adicional**

- [EXPANSION-SUMMARY.md](./EXPANSION-SUMMARY.md) - Resumen de features implementadas
- [/knowledge/naroa_bitacora_upgrade_2026/](./knowledge/) - Knowledge Items

## 👤 **Artista**

**Naroa Gutiérrez Gil**
- 📍 Bilbao, País Vasco
- 🎨 Artista Plástica
- 🖌️ Especialidad: Retratos, Técnica Mixta
- 📧 naroa@naroa.eu
- 🌐 [naroa.online](https://www.naroa.online)

## 📄 **Licencia**

© 2026 Naroa Gutiérrez Gil. All rights reserved.

---

**Última actualización:** 20 Enero 2026  
**Versión:** 2.0.0  
**Total líneas de código:** ~5,000+  
**Status:** ✅ Production Ready
