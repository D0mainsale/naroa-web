# Transformación Institucional Completa - naroa.online
## Plan de Implementación Profesional

**Objetivo:** Convertir el sitio en una presencia digital de nivel museístico que cumpla estándares curatoriales internacionales.

---

## FASE 1: CONTENIDO INSTITUCIONAL CRÍTICO

### 1.1 Sección EXHIBICIONES (Prioridad MÁXIMA)
Basado en WordPress de Naroa, crear cronología completa:

#### **Exposiciones Individuales:**
- **2026** - "DiviNos VaiVenes" | Politena Espacio de Arte, Bilbao | 30 enero - [fecha cierre]
- **2022** - "Repóker de Reinas (Vaivenes)" | Siarte Leku, Bilbao | Abril 2022
- **2020** - "Vaivenes" | Haika de Sodupe
- **2019** - "Vaivenes" | Copper Deli Museo

#### **Exposiciones Colectivas:**
- **2022** - "Emakumeen arteaN" | Muestra colectiva | Diciembre 2022
- **2022** - "GIRLS" | Bwall Collective | The Dock, Bilbao | Noviembre 2022
- **2022** - "Por Amor al Arte" | Walking Gallery Bilbao | Octubre 2022
- **2021** - Walking Gallery Bilbao Fair Saturday
- **2020** - "ICONOS POP" | Muestra Colectiva de Retratos | Septiembre 2020

#### **Ferias y Mercados de Arte:**
- **2025** - Azoka en Lataska, Sopela | 25 Mayo
- **2025** - Udaberriko Jaia Market, Sopelana | 18 Mayo

#### **Proyectos Especiales:**
- **2024** - "El ReCreo" | Espacio de Creación Comunitario | En curso

**Implementación:**
- Crear `exhibitions.html` con diseño cronológico limpio
- Versión bilingüe ES/EN
- Incluir imágenes de montaje cuando sea posible
- Enlaces a cobertura de prensa

---

### 1.2 ARTIST STATEMENT Ampliado

**Extraído de su filosofía en WordPress (DiviNos VaiVenes post):**

> "El 2026 quiero que sea un año de abrazos: abrazar a seres queridos, acoger a nuevos amigos y conciliar a mis luces y tinieblas, para que de ellas emerjan mágicas sinergias.
>
> A veces me pregunto cómo afectaría a nuestro día a día si, en lugar de referirnos a las polaridades como "contrarios", lo hiciéramos de la manera en la que nombramos la relación entre los colores: "complementarios". Al fin y al cabo, en este plano vital, nada es excluyente. La realidad que habitamos, más que contradecirse, se complementa.
>
> Durante la pandemia, mientras creaba la obra 'Cantinflowers', me vi sumida en una ardua lucha entre el acrílico y la cola, la transparencia y la grieta. En lugar de claudicar, comienzo a rascar sobre una base que no me permitía difuminar y ¡premio!, encuentro una textura inédita.
>
> Una actitud que es como las flores que rompen el asfalto y brotan de sus fisuras; puro 'kintsugi', el problema hecho trampolín."

**Implementación:**
- Añadir a `bio.html` como sección separada
- Versión EN traducida profesionalmente
- Formato elegante con cita destacada

---

### 1.3 CV Descargable (PDF)

**Estructura del CV:**

**NAROA GUTIÉRREZ GIL**
Artista Plástica | Pintora Contemporánea

**FORMACIÓN**
- [A completar con datos reales]

**EXPOSICIONES INDIVIDUALES**
- [Lista completa de 1.1]

**EXPOSICIONES COLECTIVAS**
- [Lista completa de 1.1]

**PROYECTOS Y RESIDENCIAS**
- El ReCreo - Espacio de Creación (2024-presente)

**COLECCIONES**
- [A investigar]

**PRENSA Y PUBLICACIONES**
- [A añadir según se encuentre]

**Implementación:**
- Crear PDF profesional con diseño mínimo
- Incluir en `/assets/naroa-cv.pdf`
- Actualizar botón en bio.html

---

## FASE 2: REORGANIZACIÓN POR SERIES

### 2.1 Estructura de Series Documentadas

#### **Serie DiviNos** (2025-2026)
**Concepto:** Retratos de iconos en pizarra natural. Dicotomías blanco/negro y rojo/dorado representando naturaleza dual.
**Técnica:** Pintura acrílica, lápices de colores, mineral de mica sobre pizarra
**Obras conocidas:** [A documentar con imágenes reales]

#### **Serie Vaivenes** (2019-2024)
**Concepto:** Vaivenes emocionales plasmados a través de retratos de celebridades. Collage y elementos reciclados como metáfora de lo eterno.
**Técnica:** Técnica mixta, collage, elementos reciclados
**Obras:**
- Sueños Acuáticos (2024)
- Amsterdam Dreams (2023)
- Azúcar - Homenaje a Celia Cruz (2022)
- El Peso del Tiempo (2022)
- Guerrero Inocente (2021)
- Geisha Contemporánea (2021)

#### **Serie Cantinflowers** (2020-2021)
**Concepto:** Flores que rompen el asfalto. Textura inédita descubierta durante pandemia.
**Técnica:** Acrílico con técnica de raspado

**Implementación:**
- Crear `series.html` con navegación por proyecto
- Cada serie con: título, año, concepto, técnica, galería de obras
- Versión bilingüe

---

## FASE 3: SECCIÓN PRENSA

### 3.1 Cobertura Mediática Detectada
- WordPress posts funcionan como archivo de prensa
- Walking Gallery apariciones
- Documentación de inauguraciones

**Implementación:**
- Crear `press.html`
- Incluir extractos de artículos
- Enlaces a cobertura externa
- Sección de "Testimonios" si hay quotes de curadores

---

## FASE 4: BILINGÜE ES/EN

### 4.1 Estrategia de Internacionalización

**Toggle de idioma:** Botón discreto en header
**URLs limpias:** 
- `/bio` y `/en/bio`
- O sistema de parámetro `?lang=en`

**Traducciones prioritarias:**
1. Bio completa
2. Artist Statement
3. Títulos de obras
4. Descripciones de series
5. Textos de exhibiciones

**Implementación:**
- Sistema de i18n ligero (JSON o data attributes)
- Traducciones profesionales (NO automáticas)
- Meta tags `hreflang` para SEO

---

## FASE 5: SEO PROFESIONAL

### 5.1 Meta Tags Optimizados

**Title principal:**
"Naroa Gutiérrez Gil | Artista Plástica Contemporánea - Bilbao"

**Meta description:**
"Obra de Naroa Gutiérrez Gil: pintora contemporánea especializada en técnica mixta y retratos. Exposiciones en Bilbao y colecciones privadas."

**Open Graph para redes:**
- og:image con obra destacada
- og:type = "profile"
- Structured data JSON-LD para artista

### 5.2 Optimizaciones Técnicas
- Sitemap.xml generado
- robots.txt configurado
- Canonical URLs
- Alt text descriptivo en TODAS las imágenes
- Schema.org markup para Person/Artist

---

## FASE 6: MEJORAS UX INSTITUCIONAL

### 6.1 Flujos de Usuario Optimizados

**Para Curadores:**
Home → Exhibiciones → Serie específica → Contacto

**Para Público:**
Home → Obra → Bio/Statement → Redes sociales

**Para Prensa:**
Home → Prensa → CV descargable → Contacto

### 6.2 Interacciones Profesionales
- Formulario de contacto con opciones: "Propuesta curatorial", "Prensa", "Venta/Consulta", "General"
- Descarga de dossier completo en PDF
- Opción de suscripción a newsletter de exposiciones

---

## CRONOGRAMA DE IMPLEMENTACIÓN

### Sprint 1 (Hoy - 2 horas)
- ✅ Crear exhibitions.html con datos reales
- ✅ Expandir bio.html con Artist Statement
- ✅ Generar CV.pdf básico
- ✅ Añadir contexto a obra actual

### Sprint 2 (Mañana - 3 horas)
- ✅ Crear series.html con reorganización
- ✅ Implementar press.html básico
- ✅ Añadir más obras con imágenes reales

### Sprint 3 (Esta semana - 4 horas)
- ✅ Sistema bilingüe completo
- ✅ SEO profesional
- ✅ Optimizaciones técnicas finales

### Sprint 4 (Cierre - 2 horas)
- ✅ Testing completo
- ✅ Despliegue a producción
- ✅ Documentación para mantenimiento

---

## MÉTRICAS DE ÉXITO

**Cumplimiento Institucional:**
- [ ] Toda la información crítica accesible en <3 clics
- [ ] CV descargable funcionando
- [ ] Historial completo de exhibiciones
- [ ] Versión inglés al 100%
- [ ] Carga <2s en móvil
- [ ] Accesibilidad WCAG AA
- [ ] SEO score >90 en Lighthouse

**Presencia Curatorial:**
- [ ] Artist Statement claro y profundo
- [ ] Organización por series conceptuales
- [ ] Contexto de cada obra
- [ ] Material de prensa disponible

---

## RECURSOS NECESARIOS

**Contenido a solicitar a Naroa:**
1. CV completo (formación, premios, colecciones)
2. Fotos adicionales de obras (series DiviNos, Cantinflowers)
3. Fotos de montaje de exposiciones
4. Cualquier artículo de prensa o menciones
5. Autorización para usar textos de WordPress

**Herramientas:**
- Generador PDF (Prince, wkhtmltopdf, o diseño en Figma)
- Traductor profesional para EN (presupuesto ~200€)
- Optimización de imágenes (ya hecho con WebP)

---

**INICIO:** Fase 1.1 - Crear página de Exhibiciones ahora
