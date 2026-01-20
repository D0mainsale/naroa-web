# Benchmarks: Webs de Artistas Internacionales
> Análisis de referencia para naroa.online  
> Fecha: 20 enero 2026

---

## 🎯 RESUMEN EJECUTIVO

| Artista | Web | Tipo | Elemento Destacado |
|---------|-----|------|-------------------|
| Olafur Eliasson | olafureliasson.net | Archivo interactivo | WebGL "Your uncertain archive" |
| Rafael Lozano-Hemmer | lozano-hemmer.com | Repositorio institucional | Rigor documental exhaustivo |
| Cristina Iglesias | cristinaiglesias.com | Menú conceptual | Navegación por temas, no cronología |
| Jaume Plensa | jaumeplensa.com | Enciclopedia | Mapa global + archivo completo |
| Beatriz Milhazes | beatrizmilhazes.com | Dossier profesional | Sección técnica (monotransferencia) |
| Adriana Varejão | adrianavarejao.net | Catálogo razonado | Obras por medios |
| Mercedes Pimiento | mercedespimiento.com | Portfolio emergente | Statement + CV completo |
| Mónica Mays | monicamays.com | Visual inmersivo | Imagen como puerta de entrada |
| Caroline Denervaud | carolinedenervaud.com | Awwwards winner | Video de fondo, paleta neutra |
| Cai Guo-Qiang | caiguoqiang.com | Centro de prensa | Blog de noticias actualizado |
| Chiharu Shiota | chiharu-shiota.com | Inmersivo | Carrusel fullscreen + statement |
| El Anatsui | elanatsui.art | Legado institucional | Statement en portada |
| Yinka Shonibare | yinkashonibare.com | Catálogo completo | Filtro por categoría |
| Marina Abramović | mai.art | Instituto | Plataforma educativa |

---

## 🏆 PATRONES DE DISEÑO IDENTIFICADOS

### 1. Estructura de Navegación

| Patrón | Artistas | Aplicación para Naroa |
|--------|----------|----------------------|
| **Menú conceptual** | Cristina Iglesias | Series por tema (Vaivenes, El ReCreo) |
| **Menú jerárquico** | Plensa, Lozano-Hemmer | Works → Paintings → Series |
| **Menú minimal** | Denervaud, Mays | Home, Work, About, Contact |

### 2. Presentación de Obras

| Patrón | Artistas | Descripción |
|--------|----------|-------------|
| **Grid masonry** | Shonibare, Milhazes | Mosaico de miniaturas con filtros |
| **Fullscreen carrusel** | Shiota, Eliasson | Imágenes a pantalla completa |
| **Fichas detalladas** | Varejão, Anatsui | Título, año, técnica, dimensiones, colección |

### 3. Paleta de Colores

| Patrón | Artistas | Aplicación |
|--------|----------|------------|
| **Blanco galería** | 90% de los sitios | Fondo #FFFFFF o #EBE8E5 |
| **Texto negro** | 100% de los sitios | #000000 o #28282A |
| **Sin acento** | Mayoría | Dejar que la obra aporte color |

### 4. Tipografía

| Patrón | Artistas | Descripción |
|--------|----------|-------------|
| **Sans-serif clean** | Eliasson, Denervaud | Inter, Helvetica, Arial |
| **Serif editorial** | Iglesias, Shiota | Para statements y textos largos |
| **Monospace datos** | Lozano-Hemmer | Para fechas, dimensiones técnicas |

---

## 🌟 ELEMENTOS CLAVE PARA NAROA

### Imprescindibles (Ya implementados o fáciles)

- [x] **Fondo blanco galería**
- [x] **Tipografía serif/sans limpia**
- [x] **Navegación minimal**
- [x] **Hero fullscreen**
- [ ] **Artist Statement visible**
- [ ] **CV descargable en PDF**

### Recomendados (Próximo sprint)

| Elemento | Inspiración | Prioridad |
|----------|-------------|-----------|
| Menú conceptual (Series) | Cristina Iglesias | Alta |
| Fichas de obra detalladas | Varejão, Anatsui | Alta |
| Sección "El ReCreo" (taller) | Mercedes Pimiento | Media |
| Sección Prensa/Press | Lozano-Hemmer | Media |
| Biografía expandida | Milhazes | Media |

### Avanzados (Futuro)

| Elemento | Inspiración | Complejidad |
|----------|-------------|-------------|
| Archivo interactivo WebGL | Eliasson | Alta |
| Video de fondo | Denervaud | Media |
| Mapa de obras global | Plensa | Alta |
| Blog/Noticias integrado | Cai Guo-Qiang | Media |

---

## 📐 ESPECIFICACIONES TÉCNICAS COMUNES

### CSS Variables (estándar observado)

```css
:root {
  --bg: #ffffff;
  --text: #1a1a1a;
  --muted: #666666;
  --border: #e5e5e5;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-sans: 'Inter', Helvetica, sans-serif;
  --font-mono: 'SF Mono', Monaco, monospace;
}
```

### Estructura de página típica

```
HEADER
├── Logo (izquierda)
└── Nav (derecha): Works | Exhibitions | About | Contact

MAIN
├── Hero / Featured Work
├── Grid de obras
└── Statement / Texto curatorial

FOOTER
├── Copyright
├── Redes sociales
└── Contacto
```

### Secciones estándar

1. **Works / Obras** - Grid o lista de proyectos
2. **Exhibitions / Exposiciones** - Cronología inversa
3. **About / Bio** - Statement + CV
4. **Press / Prensa** - Enlaces a artículos
5. **Contact / Contacto** - Email, redes, galerías

---

## 💡 IDEAS PARA NAROA.ONLINE

### Inspiración directa

| De | Idea | Implementación |
|----|------|----------------|
| **Iglesias** | Menú por temas | "Vaivenes", "DiviNos", "El ReCreo" |
| **Shiota** | Statement en portada | Cita sobre "collage orgánico" |
| **Pimiento** | Portfolio emergente serio | CV completo + statement claro |
| **Denervaud** | Video proceso | Clip de pintura en acción |
| **Milhazes** | Técnica explicada | Sección sobre técnica mixta |

### Diferenciadores posibles

1. **"El ReCreo" como sección única** - Ningún benchmarks tiene taller artístico integrado
2. **Collage orgánico como filosofía** - Explicar la técnica distintiva
3. **Presencia euskera/bilingüe** - Conexión con territorio (como Iglesias)

---

## 📚 FUENTES

- olafureliasson.net
- lozano-hemmer.com
- cristinaiglesias.com
- jaumeplensa.com
- beatrizmilhazes.com
- adrianavarejao.net
- mercedespimiento.com
- monicamays.com
- carolinedenervaud.com (Awwwards Honorable Mention)
- caiguoqiang.com
- chiharu-shiota.com
- elanatsui.art
- yinkashonibare.com
- mai.art

---

*Documento de referencia para el rediseño institucional de naroa.online*
