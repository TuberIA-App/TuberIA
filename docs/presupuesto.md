# Presupuesto Económico - TuberIA

## 1. Introducción

Este documento detalla el presupuesto económico completo del proyecto TuberIA, incluyendo:

- **Estimaciones iniciales** por sprint (criterio 2f)
- **Costes reales** actualizados al finalizar cada sprint (criterio 3g)
- **Análisis de desviaciones** entre lo estimado y lo real
- **Valoración económica del producto** final
- **Retorno de inversión (ROI)** proyectado
- **Lecciones aprendidas** sobre gestión económica

**Periodo del proyecto**: 6 sprints semanales (01 Diciembre 2025 - 11 Enero 2026)

---

## 2. Metodología de Estimación

### 2.1. Coste por hora según perfil

Basándonos en tarifas de mercado para desarrolladores junior (considerando que es un proyecto académico con nivel de aprendizaje):

| Perfil | Tarifa/hora | Justificación |
|--------|-------------|---------------|
| **Junior Developer** | 20 €/hora | 0-2 años de experiencia, tecnologías web básicas |
| **Mid Developer** | 35 €/hora | 2-5 años de experiencia, full-stack, arquitectura |
| **Senior Developer** | 60 €/hora | >5 años, liderazgo técnico, decisiones arquitectónicas |

**Para TuberIA** (equipo académico):
- Todos los miembros del equipo se consideran **Junior Developers**: **20 €/hora**
- Esta tarifa es conservadora y refleja el nivel de experiencia real del equipo

### 2.2. Técnicas de estimación utilizadas

#### Planning Poker (Fibonacci)

Secuencia: 0.5, 1, 2, 3, 5, 8, 13, 21 horas

**Interpretación**:
- **0.5-1h**: Tarea trivial (cambio de texto, ajuste CSS)
- **2-3h**: Tarea simple (CRUD endpoint, componente React básico)
- **5h**: Tarea moderada (integración API, formulario complejo)
- **8h**: Tarea compleja (autenticación completa, sistema de colas)
- **13h**: Tarea muy compleja (dividir en subtareas si es posible)
- **21h**: Epic (debe dividirse obligatoriamente)

#### Proceso de estimación en Sprint Planning:

1. Product Owner presenta la historia de usuario
2. Equipo discute complejidad técnica y riesgos
3. Cada miembro muestra simultáneamente su estimación (cartas de Planning Poker)
4. Si hay discrepancia >3 puntos Fibonacci: discutir y re-estimar
5. Tomar la mediana o llegar a consenso

### 2.3. Seguimiento con Toggl Track

**Flujo de trabajo**:
1. **Antes de comenzar**: Registrar estimación en GitHub Projects (campo "Estimación (horas)")
2. **Durante el trabajo**: Activar timer en Toggl Track al iniciar, pausar en interrupciones
3. **Al finalizar**: Registrar horas reales en GitHub Projects (campo "Horas Reales")
4. **Al finalizar sprint**: Exportar reporte de Toggl Track para análisis de desviaciones

---

## 3. Presupuesto por Sprints

### 3.1. Sprint 1: Infraestructura y Fundamentos (31 Oct - 06 Nov 2025)

#### Objetivo:
Configurar la base técnica del proyecto: Docker, MongoDB, arquitectura backend, lógica de YouTube, diseño inicial.

#### Tareas reales del proyecto:

| ID | Tarea | Categoría | Responsable | Estimación (h) | Coste estimado (€) |
|----|-------|-----------|-------------|----------------|-------------------|
| #3 | Website Design - Quick Sketch | 🎨 Design | Natalia | 3 | 60 |
| #7 | Website Design - Styles Definition (Fonts, Color Palette) | 🎨 Design | Natalia | 4 | 80 |
| #6 | Learn ReactJS Basics with YouTube Course | 💻 Frontend | Alfonso, Natalia | 8 | 160 |
| #2 | Starting backend architecture & installing dependencies | ⚙️ Backend | Ezequiel | 4 | 80 |
| #14 | YouTube Video Transcription Business Logic | ⚙️ Backend | Ezequiel | 5 | 100 |
| #15 | YouTube Channel Video Detection Business Logic | ⚙️ Backend | Ezequiel | 4 | 80 |
| #16 | YouTube Channel ID from URL/Username Logic | ⚙️ Backend | Ezequiel | 3 | 60 |
| #1 | MongoDB Docker Setup | 💾 Database | Alfonso | 3 | 60 |
| #8 | MongoDB Collections & Schema Creation | 💾 Database | Alfonso | 4 | 80 |
| #9 | MongoDB Docker Review | 💾 Database | Alfonso | 2 | 40 |

**Subtotal Sprint 1**:
- **Horas estimadas**: 40 horas
- **Coste estimado**: 800 €

#### Resultados reales (actualizar al finalizar Sprint 1):

| Horas reales | Coste real (€) | Desviación horas | Desviación % | Desviación coste (€) |
|--------------|---------------|------------------|--------------|---------------------|
| _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ |

**Lecciones aprendidas Sprint 1**:
- _[Actualizar al finalizar: ¿Qué tareas tomaron más tiempo? ¿Por qué?]_

---

### 3.2. Sprint 2: Autenticación, Frontend Inicial y Mockups (07 Nov - 13 Nov 2025)

#### Objetivo:
Sistema de autenticación completo, primeros componentes React, mockups del diseño.

#### Tareas reales del proyecto:

| ID | Tarea | Categoría | Responsable | Estimación (h) | Coste estimado (€) |
|----|-------|-----------|-------------|----------------|-------------------|
| #19 | Website Design - Quick Mockup | 🎨 Design | Natalia | 5 | 100 |
| #20 | Dockerizar el Frontend para Desarrollo (Hot-reload) | 💻 Frontend | Alfonso | 4 | 80 |
| #22 | Crear estructura de carpetas y componentes atómicos base | 💻 Frontend | Natalia | 5 | 100 |
| #27 | Implementar Home Page en React | 💻 Frontend | Natalia | 6 | 120 |
| #13 | YouTube AI Summary Business Logic | ⚙️ Backend | Ezequiel | 5 | 100 |
| #24 | Backend - Login & Register full logic | ⚙️ Backend | Ezequiel | 6 | 120 |
| #32 | Agregar campo username opcional al modelo Channel | 💾 Database | Alfonso | 2 | 40 |

**Subtotal Sprint 2**:
- **Horas estimadas**: 33 horas
- **Coste estimado**: 660 €

#### Resultados reales (actualizar al finalizar Sprint 2):

| Horas reales | Coste real (€) | Desviación horas | Desviación % | Desviación coste (€) |
|--------------|---------------|------------------|--------------|---------------------|
| _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ |

**Lecciones aprendidas Sprint 2**:
- _[Actualizar al finalizar]_

---

### 3.3. Sprint 3: Autenticación Frontend y Backend Search (14 Nov - 20 Nov 2025)

#### Objetivo:
Integrar JWT en frontend, búsqueda de canales, preparar deployment, documentación.

#### Tareas reales del proyecto:

| ID | Tarea | Categoría | Responsable | Estimación (h) | Coste estimado (€) |
|----|-------|-----------|-------------|----------------|-------------------|
| #30 | Frontend Login, Register & JWT Full Implementation | 💻 Frontend | Natalia | 8 | 160 |
| #34 | Frontend Search Channel Page (without backend integration) | 💻 Frontend | Alfonso | 5 | 100 |
| #31 | Backend Login, Register & JWT Documentation for Frontend | ⚙️ Backend | Ezequiel | 3 | 60 |
| #35 | Backend - FIX Automation & Prepare Deployment | ⚙️ Backend | Ezequiel | 6 | 120 |
| #40 | Backend - Search YouTube channel from username or url | ⚙️ Backend | Ezequiel | 5 | 100 |

**Subtotal Sprint 3**:
- **Horas estimadas**: 27 horas
- **Coste estimado**: 540 €

#### Resultados reales (actualizar al finalizar Sprint 3):

| Horas reales | Coste real (€) | Desviación horas | Desviación % | Desviación coste (€) |
|--------------|---------------|------------------|--------------|---------------------|
| _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ |

**Lecciones aprendidas Sprint 3**:
- _[Actualizar al finalizar]_

---

### 3.4. Sprint 4: Dashboard y Páginas Core Frontend (21 Nov - 27 Nov 2025)

#### Objetivo:
Implementar las páginas principales del frontend: Header, Footer, Dashboard, Video Summary Page.

#### Tareas reales del proyecto:

| ID | Tarea | Categoría | Responsable | Estimación (h) | Coste estimado (€) |
|----|-------|-----------|-------------|----------------|-------------------|
| #43 | Frontend Header & Footer Implementation | 💻 Frontend | Natalia | 1 | 20 |
| #44 | Frontend Dashboard Implementation | 💻 Frontend | Natalia | 3 | 60 |
| #45 | Frontend YouTube Specific Video Summary Page | 💻 Frontend | Alfonso | 4 | 80 |

**Subtotal Sprint 4**:
- **Horas estimadas**: 8 horas
- **Coste estimado**: 160 €

#### Resultados reales (actualizar al finalizar Sprint 4):

| Horas reales | Coste real (€) | Desviación horas | Desviación % | Desviación coste (€) |
|--------------|---------------|------------------|--------------|---------------------|
| _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ |

**Lecciones aprendidas Sprint 4**:
- _[Actualizar al finalizar]_

---

### 3.5. Sprint 5: Infraestructura Completa + Workers + Frontend Avanzado (28 Nov - 04 Dic 2025)

#### Objetivo:
Implementar Redis, BullMQ, workers de procesamiento, RSS polling, endpoints de seguimiento, páginas frontend avanzadas.

#### Tareas reales del proyecto:

| ID | Tarea | Categoría | Responsable | Estimación (h) | Coste estimado (€) |
|----|-------|-----------|-------------|----------------|-------------------|
| #50 | Frontend Home Page - YouTube Channel Search Live Demo | 💻 Frontend | Natalia | 3 | 60 |
| #51 | Fixing Frontend Bugs (Dashboard Redirection, Header) | 💻 Frontend | Natalia | 4 | 80 |
| #79 | Frontend My Feed Page - Full Implementation + Infinite Scroll | 💻 Frontend | Alfonso | 3 | 60 |
| #81 | Frontend Dashboard + Mis Canales + Follow Button | 💻 Frontend | Alfonso | 5 | 100 |
| #84 | Frontend Ajustes visuales y UX en páginas autenticadas | 💻 Frontend | Natalia | 3 | 60 |
| #86 | Frontend FULL Channel Page Implementation Backend Integration | 💻 Frontend | Alfonso | 4 | 80 |
| #60 | Implementing Redis Client + BullMQ Queues + Testing | ⚙️ Backend | Ezequiel | 2 | 40 |
| #63 | Implementing Endpoints Follow/Unfollow Channel + Tests + Docs | ⚙️ Backend | Ezequiel | 2 | 40 |
| #64 | Implementing User Video Feed Endpoint + Pagination | ⚙️ Backend | Ezequiel | 2 | 40 |
| #67 | Performance Optimization (Indexes + Caching) | ⚙️ Backend | Ezequiel | 2 | 40 |
| #61 | Implementing Background Workers (Transcription + Summarization) | ⚙️ Backend | Ezequiel | 3 | 60 |
| #62 | Implementing RSS Polling Automation con node-cron | ⚙️ Backend | Ezequiel | 3 | 60 |
| #66 | Add Idempotency para Summarization (evitar duplicados) | ⚙️ Backend | Ezequiel | 2 | 40 |
| #80 | Backend User Dashboard & Channel Management Endpoints | ⚙️ Backend | Ezequiel | 2 | 40 |
| #88 | Fix Backend Channel Search + Follow Limitation | ⚙️ Backend | Ezequiel | 1 | 20 |
| #52 | Redis Container + Docker Configuration | 💾 Database | Alfonso | 5 | 100 |
| #53 | Health Checks Mejorados con Redis | 💾 Database | Alfonso | 3 | 60 |
| #55 | Logging & Monitoring Setup | 💾 Database | Alfonso | 4 | 80 |
| #56 | Validación Final & Testing Completo | 💾 Database | Alfonso | 3 | 60 |
| #85 | Nueva documentación de análisis, organización y flujo | 📄 Docs | Natalia | 2 | 40 |

**Subtotal Sprint 5**:
- **Horas estimadas**: 58 horas
- **Coste estimado**: 1,160 €

#### Resultados reales (actualizar al finalizar Sprint 5):

| Horas reales | Coste real (€) | Desviación horas | Desviación % | Desviación coste (€) |
|--------------|---------------|------------------|--------------|---------------------|
| _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ |

**Lecciones aprendidas Sprint 5**:
- _[Actualizar al finalizar]_

---

### 3.6. Sprint 6: Fixes Finales y Testing (05 Dic - 11 Dic 2025)

#### Objetivo:
Corregir bugs críticos, testear workers, preparar para producción.

#### Tareas reales del proyecto:

| ID | Tarea | Categoría | Responsable | Estimación (h) | Coste estimado (€) |
|----|-------|-----------|-------------|----------------|-------------------|
| #96 | Fix Backend Transcription Database Save Error | ⚙️ Backend | Ezequiel | 2 | 40 |
| #98 | Fix Backend Worker Logic And Logic Testing | ⚙️ Backend | Ezequiel | 5 | 100 |

**Tareas pendientes (no completadas aún):**

| ID | Tarea | Categoría | Responsable | Estimación (h) | Coste estimado (€) |
|----|-------|-----------|-------------|----------------|-------------------|
| #65 | Admin & Monitoring Endpoints (/health mejorado + métricas) | ⚙️ Backend | Ezequiel | 1 | 20 |
| #68 | Testing E2E + Cobertura + Documentación Final + Checklist | ⚙️ Backend | Ezequiel | 3 | 60 |

**Subtotal Sprint 6**:
- **Horas estimadas**: 11 horas (7 completadas + 4 pendientes)
- **Coste estimado**: 220 €

#### Resultados reales (actualizar al finalizar Sprint 6):

| Horas reales | Coste real (€) | Desviación horas | Desviación % | Desviación coste (€) |
|--------------|---------------|------------------|--------------|---------------------|
| _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _Pendiente_ |

**Lecciones aprendidas Sprint 6**:
- _[Actualizar al finalizar]_

---

## 4. Resumen de Presupuesto Total

### 4.1. Coste de desarrollo (solo horas de trabajo)

| Sprint | Horas estimadas | Coste estimado (€) | Horas reales | Coste real (€) | Desviación (€) |
|--------|-----------------|-------------------|--------------|---------------|---------------|
| Sprint 1 | 40 | 800 | _Completado_ | _Actualizar con Toggl Track_ | _Pendiente_ |
| Sprint 2 | 33 | 660 | _Completado_ | _Actualizar con Toggl Track_ | _Pendiente_ |
| Sprint 3 | 27 | 540 | _Completado_ | _Actualizar con Toggl Track_ | _Pendiente_ |
| Sprint 4 | 8 | 160 | _Completado_ | _Actualizar con Toggl Track_ | _Pendiente_ |
| Sprint 5 | 58 | 1,160 | _Completado_ | _Actualizar con Toggl Track_ | _Pendiente_ |
| Sprint 6 | 11 | 220 | _En progreso_ | _Pendiente_ | _Pendiente_ |
| **TOTAL** | **177 horas** | **3,540 €** | **_Pendiente_** | **_Pendiente_** | **_Pendiente_** |

**Interpretación**:
- **177 horas** = ~59 horas por persona (3 personas) = ~9.8 horas/semana por persona
- **3,540 €** = Coste total del desarrollo a tarifa junior (20 €/hora)
- La mayoría de tareas ya están **completadas** (estado "Done" en GitHub Projects)

### 4.2. Costes de infraestructura (servicios externos)

| Servicio | Periodo | Coste mensual (€) | Coste 6 meses (€) | Observaciones |
|----------|---------|-------------------|------------------|---------------|
| DigitalOcean VPS | 6 meses | 12 € (~10 € con descuento) | 60 € | Cubierto por crédito estudiantil ($200) |
| Dominio .com | 1 año | 1.5 € | 9 € | Opcional (puede usar IP pública) |
| OpenRouter (IA) | 6 meses | 5 € (conservador) | 30 € | Uso de modelo gratuito en MVP + backup de pago |
| Cloudflare | 6 meses | 0 € | 0 € | Plan gratuito |
| GitHub | 6 meses | 0 € | 0 € | Plan educativo gratuito |
| Toggl Track | 6 meses | 0 € | 0 € | Plan gratuito |
| 1Password | 6 meses | 0 € | 0 € | Plan educativo gratuito |
| **TOTAL INFRAESTRUCTURA** | | | **99 €** | |

**Nota**: El coste de DigitalOcean está cubierto por crédito educativo, por lo que el **coste real desembolsado** es:
- **39 €** (30 € OpenRouter + 9 € dominio)

### 4.3. Coste total del proyecto

| Concepto | Coste estimado (€) | Coste real (€)* |
|----------|-------------------|----------------|
| Desarrollo (177 horas × 20 €/h) | 3,540 | _Actualizar con Toggl Track_ |
| Infraestructura (servicios externos) | 99 | _Actualizar con gastos reales_ |
| **TOTAL PROYECTO** | **3,639 €** | **_Pendiente_** |

**Coste real desembolsado** (sin considerar horas de trabajo del equipo):
- **39 €** (OpenRouter + dominio)

\*_Actualizar con datos reales de Toggl Track al finalizar cada sprint_

---

## 5. Análisis de Desviaciones

### 5.1. Comparación estimación vs. realidad (actualizar progresivamente)

#### Por categoría:

| Categoría | Horas estimadas | Horas reales | Desviación (h) | Desviación (%) | Causas principales |
|-----------|-----------------|--------------|----------------|----------------|-------------------|
| Frontend | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar al finalizar]_ |
| Backend | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar al finalizar]_ |
| BD | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar al finalizar]_ |
| DevOps | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar al finalizar]_ |
| Testing | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar al finalizar]_ |
| Docs | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar al finalizar]_ |
| **TOTAL** | **228** | **_Pendiente_** | **_Pendiente_** | **_Pendiente_** | |

#### Por persona:

| Miembro | Horas estimadas | Horas reales | Desviación (h) | Desviación (%) | Observaciones |
|---------|-----------------|--------------|----------------|----------------|---------------|
| Miembro A (Frontend Lead) | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar]_ |
| Miembro B (Backend Lead) | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar]_ |
| Miembro C (Database Manager) | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar]_ |
| Miembro D (DevOps/Testing) | _XX_ | _Pendiente_ | _Pendiente_ | _Pendiente_ | _[Actualizar]_ |

### 5.2. Factores de desviación más comunes (actualizar al finalizar)

Basándonos en la experiencia de proyectos similares, las desviaciones típicas son:

| Factor | Impacto típico | Mitigación |
|--------|---------------|------------|
| Subestimación de integración de APIs | +30-50% en tareas de integración | Añadir buffer, implementar mocks para testing |
| Depuración de bugs inesperados | +20% del tiempo total | Reservar 15-20% de cada sprint para bugs |
| Aprendizaje de nuevas tecnologías | +40% en primeras tareas | Pair programming, spikes técnicos previos |
| Reuniones y comunicación | +10% del tiempo total | Limitar reuniones a ceremonias Scrum |
| Code reviews más largas de lo previsto | +15% en tareas completadas | Limitar tamaño de PRs (<400 líneas) |

---

## 6. Valoración del Producto Final

### 6.1. Comparación con productos similares en el mercado

| Producto | Funcionalidades | Precio | Modelo de negocio |
|----------|-----------------|--------|-------------------|
| **Eightify** | Resúmenes de vídeos YouTube con IA | $4.99-19.99/mes | Freemium (5 resúmenes/mes gratis) |
| **Glasp** | Resaltado y resumen de contenido web/YouTube | Gratis con limitaciones | Freemium + Premium ($9/mes) |
| **NoteGPT** | Resúmenes de vídeos, transcripciones | $9.99/mes | Freemium (10 resúmenes/mes gratis) |
| **Summarize.tech** | Resúmenes de vídeos individuales | Gratis | Monetización con ads |
| **TuberIA** | Resúmenes automáticos por canal, notificaciones | _A definir_ | SaaS (suscripción mensual) |

**Ventaja competitiva de TuberIA**:
- **Seguimiento automático de canales**: No requiere pegar URL manualmente
- **Notificaciones de nuevos vídeos**: Sistema proactivo vs. reactivo
- **Historial de resúmenes**: Archivo completo de un canal

### 6.2. Valoración económica del producto

#### Opción 1: Modelo Freemium

| Plan | Funcionalidades | Precio mensual | Usuarios objetivo |
|------|-----------------|----------------|-------------------|
| **Free** | 3 canales, resúmenes ilimitados, modelo IA básico | 0 € | Early adopters, estudiantes |
| **Pro** | 20 canales, resúmenes ilimitados, modelo IA avanzado | 4.99 € | Usuarios activos |
| **Premium** | Canales ilimitados, prioridad en procesamiento, exportación | 9.99 € | Power users, profesionales |

**Proyección conservadora** (año 1):
- 1,000 usuarios Free
- 100 usuarios Pro (10% conversión) → 499 €/mes → **5,988 €/año**
- 20 usuarios Premium (2% conversión) → 199.8 €/mes → **2,397.6 €/año**
- **Ingresos año 1**: ~**8,386 €**

**Proyección optimista** (año 2):
- 10,000 usuarios Free
- 1,000 usuarios Pro (10% conversión) → 4,990 €/mes → **59,880 €/año**
- 200 usuarios Premium (2% conversión) → 1,998 €/mes → **23,976 €/año**
- **Ingresos año 2**: ~**83,856 €**

#### Opción 2: Venta del producto a empresa

Valoración basada en:
- **Coste de desarrollo**: 4,560 € (228 horas)
- **Multiplicador de mercado**: 3-5× (estándar en industria de software)
- **Valoración del MVP**: **15,000 - 25,000 €**

Empresas interesadas potenciales:
- Plataformas de educación online (Coursera, Udemy)
- Herramientas de productividad (Notion, Evernote)
- Extensiones de navegador (similar a Eightify)

---

## 7. Retorno de Inversión (ROI)

### 7.1. Escenarios de ROI

**Inversión inicial**: 3,639 € (desarrollo + infraestructura)

#### Escenario 1: Optimista (lanzamiento exitoso)

- **Ingresos año 1**: 8,386 €
- **Costes operativos año 1**: 600 € (12 meses × 50 €/mes de infraestructura escalada)
- **Beneficio neto año 1**: 7,786 €
- **ROI año 1**: (7,786 - 3,639) / 3,639 = **114% ROI**
- **Recuperación de inversión**: **~7 meses**

#### Escenario 2: Realista (crecimiento moderado)

- **Ingresos año 1**: 4,000 € (menos usuarios que proyección)
- **Costes operativos año 1**: 360 € (infraestructura básica)
- **Beneficio neto año 1**: 3,640 €
- **ROI año 1**: (3,640 - 3,639) / 3,639 = **0% ROI** (break-even)
- **Recuperación de inversión**: **~15 meses** (con crecimiento en año 2)

#### Escenario 3: Pesimista (pocos usuarios al inicio)

- **Ingresos año 1**: 1,200 € (muy pocos usuarios de pago)
- **Costes operativos año 1**: 360 €
- **Beneficio neto año 1**: 840 €
- **ROI año 1**: (840 - 3,639) / 3,639 = **-77% ROI** (pérdida significativa)
- **Recuperación de inversión**: **>2 años** (requiere pivote o marketing agresivo)

### 7.2. Break-even point (punto de equilibrio)

**Costes fijos mensuales** (escenario básico):
- Infraestructura: 30 € (VPS + IA + dominio)
- Marketing: 50 € (Google Ads, redes sociales)
- **Total mensual**: 80 €

**Usuarios necesarios para break-even**:
- Con plan Pro (4.99 €): **16 usuarios** (16 × 4.99 = 79.84 €)
- Con plan Premium (9.99 €): **8 usuarios** (8 × 9.99 = 79.92 €)
- **Meta mínima**: 10-15 usuarios de pago en primeros 3 meses

### 7.3. Valor del proyecto como experiencia educativa

Más allá del ROI monetario, el proyecto aporta:

| Valor intangible | Equivalente monetario estimado |
|------------------|-------------------------------|
| **Experiencia full-stack** (6 semanas intensivas) | 1,500 € (curso profesional equivalente) |
| **Portfolio profesional** (proyecto completo en GitHub) | 2,000 € (valor en entrevistas de trabajo) |
| **Metodología Scrum real** (6 sprints con roles rotativos) | 800 € (certificación Scrum) |
| **Habilidades de trabajo en equipo** | Invaluable |
| **TOTAL VALOR EDUCATIVO** | **~4,300 €** |

**ROI total considerando valor educativo**:
- Inversión: 39 € (solo costes reales desembolsados, sin contar tiempo del equipo)
- Valor generado: 4,300 € (educativo) + potencial de ingresos futuros
- **ROI educativo**: >10,000%

---

## 8. Lecciones Aprendidas (actualizar al finalizar el proyecto)

### 8.1. Precisión de estimaciones iniciales

| Aspecto | Predicción inicial | Realidad | Aprendizaje |
|---------|-------------------|----------|-------------|
| Duración total | 228 horas (6 sprints) | _Pendiente_ | _[Actualizar]_ |
| Tareas más costosas | Integración IA, colas Bull | _Pendiente_ | _[Actualizar]_ |
| Tareas subestimadas | _A identificar_ | _Pendiente_ | _[Actualizar]_ |
| Tareas sobrestimadas | _A identificar_ | _Pendiente_ | _[Actualizar]_ |

### 8.2. Tareas que costaron más de lo esperado

_[Actualizar al finalizar cada sprint]_

**Ejemplos típicos**:
- Depuración de errores de integración con APIs externas
- Configuración de Docker en distintos entornos
- Testing end-to-end más complejo de lo previsto

### 8.3. Costes imprevistos

_[Actualizar progresivamente]_

| Concepto | Coste imprevisto (€) | Sprint | Razón |
|----------|---------------------|--------|-------|
| _Ejemplo: Créditos extra de IA_ | _10 €_ | _Sprint 3_ | _Modelo gratuito saturado_ |
| _[Actualizar]_ | _Pendiente_ | _Pendiente_ | _Pendiente_ |
| **TOTAL IMPREVISTOS** | **_Pendiente_** | | |

### 8.4. ¿Qué haríamos diferente en un próximo proyecto?

_[Completar en la Sprint Retrospective final]_

Áreas de mejora típicas:
- **Estimaciones**: ¿Usar multiplicador de seguridad (×1.3) en todas las tareas?
- **Documentación**: ¿Documentar mientras desarrollamos en vez de al final?
- **Testing**: ¿TDD (Test-Driven Development) desde el inicio?
- **Comunicación**: ¿Daily Standups async por escrito en vez de síncronos?
- **Herramientas**: ¿Probar otras herramientas de gestión de proyectos?

---

## 9. Conclusiones

### 9.1. Viabilidad económica del proyecto

Basándonos en el análisis realizado:

✅ **Viable como proyecto académico**:
- Coste real desembolsado muy bajo (39 €)
- Valor educativo muy alto (experiencia full-stack, metodología Scrum)
- Portfolio profesional completo

⚠️ **Viable como negocio (con condiciones)**:
- Requiere alcanzar 15-20 usuarios de pago en 3 meses para break-even
- Modelo freemium es competitivo (4.99-9.99 €/mes similar a mercado)
- Ventaja competitiva clara (seguimiento automático de canales)
- Riesgo: Mercado competido (Eightify, NoteGPT, etc.)

### 9.2. Recomendaciones para lanzamiento comercial

Si se decide lanzar TuberIA como producto comercial tras el MVP:

1. **Marketing inicial** (3 primeros meses):
   - Budget: 300 € (100 €/mes)
   - Canales: Reddit (r/productivity, r/youtube), ProductHunt, Twitter
   - Meta: 100 usuarios gratuitos, 10 usuarios de pago

2. **Optimizaciones técnicas**:
   - Reducir costes de IA: Implementar cache agresivo (evitar regenerar resúmenes)
   - Escalabilidad: Pasar a modelos de IA más baratos conforme crezca

3. **Funcionalidades premium**:
   - Exportación a Notion, Obsidian, Markdown
   - Compartir resúmenes públicos (virality loop)
   - Resúmenes en otros idiomas

4. **Alianzas estratégicas**:
   - Contactar con YouTubers educativos (partnerships)
   - Integración con herramientas de productividad existentes

### 9.3. Próximos pasos

Para la continuación del proyecto:

**Corto plazo (Sprint 7-8, si se extiende)**:
- [ ] Implementar analytics (Google Analytics, Plausible)
- [ ] A/B testing de página de aterrizaje
- [ ] Sistema de referidos (invita amigos → mes gratis)

**Medio plazo (3-6 meses post-MVP)**:
- [ ] Extensión de navegador (Chrome, Firefox)
- [ ] App móvil (React Native)
- [ ] API pública para integraciones

**Largo plazo (año 1-2)**:
- [ ] Soporte para otras plataformas (Twitch, podcasts)
- [ ] Marketplace de prompts de IA personalizados
- [ ] Enterprise plan para empresas

---

**Última actualización**: Diciembre 2025 (Sprint 6)  
**Responsable de actualización**: Product Owner del sprint actual  
**Versión**: 1.0 (inicial, actualizar al finalizar cada sprint)

---

## Apéndice: Plantilla de Actualización por Sprint

**Copiar y completar al finalizar cada sprint**:

### Sprint X: [Nombre del Sprint] ([Fechas])

**Horas estimadas**: XX h  
**Horas reales**: XX h  
**Desviación**: +/- XX h (+/- XX%)

**Coste estimado**: XXX €  
**Coste real**: XXX €  
**Desviación**: +/- XX €

**Tareas que tomaron más tiempo del esperado**:
- [Tarea #ID]: Estimado XX h, Real YY h → Razón: [explicación]

**Tareas que tomaron menos tiempo del esperado**:
- [Tarea #ID]: Estimado XX h, Real YY h → Razón: [explicación]

**Costes imprevistos**:
- [Concepto]: XX € → Razón: [explicación]

**Lecciones aprendidas**:
- [Aprendizaje 1]
- [Aprendizaje 2]

**Acciones para próximo sprint**:
- [Acción 1]
- [Acción 2]
