# Sprint 5 - Integración Completa Backend/Frontend, Workers y Operaciones

**Período:** 2025-11-28 - 2025-12-04 (7 días)

## 📊 Resumen Ejecutivo

- **Issues completados:** 18
- **Miembros activos:** obezeq, acasmor0802, Naleper90
- **Áreas principales:** Backend, Frontend, DevOps / Infraestructura, Performance / Caching, Background Workers, Testing
- **Contexto:**  
  Este sprint se centró en completar funcionalidades críticas del backend necesarias para que el frontend tenga un dashboard y gestión de canales operativa (Phase 5), integrar esas funcionalidades en las páginas de canales del frontend, estabilizar la infraestructura de Redis/BullMQ para procesamiento asíncrono, añadir workers permanentes para transcripción y summarization, y aplicar optimizaciones de rendimiento (índices + caché). Además, se realizaron tareas de operaciones: despliegue de Redis en Docker, health checks mejorados, logging y validaciones finales antes de deploy. El alcance fue cerrar los endpoints faltantes, asegurar idempotencia en resúmenes, automatizar polling de RSS para detección de vídeos y proporcionar los elementos del frontend para buscar, seguir y dejar de seguir canales.

---

## 🎯 Objetivos Específicos y Medibles

(A continuación se agrupan los issues por temáticas coherentes. Cada objetivo es SMART — Específico, Medible, Alcanzable, Relevante y Temporal — y se deriva exclusivamente de las acciones y metas descritas en los issues completados en el sprint.)

### 1. Backend: Implementar y exponer endpoints para gestión de canales y feed de usuario (Objetivo SMART)

**Descripción:**  
Implementar los endpoints críticos que completan Phase 5 para permitir al frontend consumir un feed de vídeos personalizado, y habilitar las operaciones de seguir/dejar de seguir canales con actualización de followersCount. El objetivo era entregar controladores y rutas concretas para getMyVideos (feed con paginación), followChannel y unfollowChannel, y asegurar que el endpoint de búsqueda de canales crea/actualiza canales en BD y retorna ObjectId.

**Justificación:**  
Estos endpoints permiten que la interfaz de usuario muestre el feed personalizado y gestione las relaciones usuario–canal, funcionalidades esenciales para la experiencia principal de la aplicación.

**Issues relacionados:**
- #80 (https://github.com/TuberIA-App/TuberIA/issues/80) - Backend User Dashboard & Channel Management Endpoints - Asignado a: obezeq  
- #64 (https://github.com/TuberIA-App/TuberIA/issues/64) - Implementing User Video Feed Endpoint + Pagination - Asignado a: obezeq  
- #63 (https://github.com/TuberIA-App/TuberIA/issues/63) - Implementing Endpoints Follow/Unfollow Channel + Tests + Docs - Asignado a: obezeq  
- #88 (https://github.com/TuberIA-App/TuberIA/issues/88) - Fix Backend Channel Search + Follow Limitation for non existing channels - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Creación del controlador video.controller.js con getMyVideos listo para usar req.user.userId (endpoint GET /api/users/me/videos ya existente y referido en Phase 5).  
- ✅ Creación/actualización de channel.controller.js con followChannel y unfollowChannel expuestos mediante rutas POST /:id/follow y DELETE /:id/unfollow.  
- ✅ Corrección del endpoint GET /api/channels/search para (1) buscar en YouTube RSS, (2) crear/actualizar canal en BD automáticamente y (3) retornar el canal con su MongoDB ObjectId.  
- ✅ Actualización explícita de followersCount del modelo Channel (+1 / -1) ligada a las operaciones follow/unfollow.

**Estado:** ✅ Completado

---

### 2. Frontend: Integración completa de la página de Channel con el backend (Objetivo SMART)

**Descripción:**  
Implementar en el frontend la página completa de canales, integrando las llamadas al backend para mostrar los canales que el usuario sigue, permitir búsqueda de canales, y soportar las acciones de follow y unfollow, mostrando todas las funcionalidades visibles en la UI.

**Justificación:**  
Sin la integración, la UI no puede reflejar el estado real de las relaciones usuario–canal ni permitir interacciones esenciales del usuario logueado.

**Issues relacionados:**
- #77 (https://github.com/TuberIA-App/TuberIA/issues/77) - Frontend FULL Channel Page Implementation with Backend Integration - Asignado a: acasmor0802  
- #86 (https://github.com/TuberIA-App/TuberIA/issues/86) - Frontend FULL Channel Page Implementation Backend Integration - Asignado a: acasmor0802  
- #45 (https://github.com/TuberIA-App/TuberIA/issues/45) - Frontend YouTube Specific Video Summary Page (Without Backend Integration) - Asignado a: acasmor0802  
- #50 (https://github.com/TuberIA-App/TuberIA/issues/50) - Frontend Home Page - YouTube Channel Search Live Demo - Asignado a: Naleper90  
- #51 (https://github.com/TuberIA-App/TuberIA/issues/51) - Fixing Frontend Bugs (Dashboard Redirection, Header) - Asignado a: Naleper90

**Métricas alcanzadas:**
- ✅ Implementación de las cuatro funcionalidades en la página de channels: obtención de canales seguidos, búsqueda de canal, follow y unfollow.  
- ✅ Implementación de una vista de resumen de vídeo específica (página /video-summary) que renderiza resumen en markdown (sin integración backend para el contenido en esta issue, tal como estaba marcado).  
- ✅ Live demo en home page para búsqueda de canales con comportamiento de "monitorizar requiere registro" implementado según documentación pública de APIs.

**Estado:** ✅ Completado

---

### 3. Background Processing: Redis, BullMQ y Workers permanentes (Objetivo SMART)

**Descripción:**  
Configurar el cliente Redis y las colas BullMQ en código (Phase 1 del roadmap), desplegar Redis en Docker, crear las colas, implementar workers permanentes para transcription y summarization con lógica de concurrencia, rate limiting, reintentos y graceful shutdown, y validar la integración mediante tests.

**Justificación:**  
Redis y BullMQ son la base del procesamiento asíncrono (transcripciones y resúmenes). Workers permanentes garantizan el procesamiento continuo de jobs en producción.

**Issues relacionados:**
- #60 (https://github.com/TuberIA-App/TuberIA/issues/60) - Implementing Redis Client + BullMQ Queues + Testing - Asignado a: obezeq  
- #61 (https://github.com/TuberIA-App/TuberIA/issues/61) - Implementing Background Workers (Transcription + Summarization) - Asignado a: obezeq  
- #52 (https://github.com/TuberIA-App/TuberIA/issues/52) - Redis Container + Docker Configuration - Asignado a: acasmor0802

**Métricas alcanzadas:**
- ✅ Integración del cliente Redis en el código y creación de colas BullMQ conforme a Phase 1 del roadmap.  
- ✅ Implementación de dos workers: transcription.worker.js y summarization.worker.js con importación en index.js para asegurar ejecución permanente.  
- ✅ Dockerización: docker-compose.dev.yml (Redis expuesto en 6379) y docker-compose.prod.yml (Redis sin exposición pública, con memory limit 128MB y eviction policy allkeys-lru) añadidos a la infraestructura.  
- ✅ Validación de que Redis es considerado crítico para BullMQ (decisión de infraestructura tomada).

**Estado:** ✅ Completado

---

### 4. Idempotencia y Control de Costes en Summarization (Objetivo SMART)

**Descripción:**  
Implementar una utilidad de idempotency basada en Redis para evitar generar resúmenes duplicados, envolviendo generateVideoSummary con withIdempotency y utilizando una clave basada en título + longitud del transcript o hash, con TTL de 7 días y tests unitarios cubriendo 100% el módulo.

**Justificación:**  
Evitar generar múltiples resúmenes idénticos reduce costes de tokens y garantiza consistencia en los datos.

**Issues relacionados:**
- #66 (https://github.com/TuberIA-App/TuberIA/issues/66) - Add Idempotency para Summarization (evitar resúmenes duplicados) - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Creación del archivo src/utils/idempotency.js siguiendo el roadmap.  
- ✅ Envolvimiento de generateVideoSummary mediante withIdempotency utilizando clave basada en título + longitud del transcript/hash.  
- ✅ TTL configurado en 7 días para la entrada de idempotency.  
- ✅ Tests unitarios con cobertura objetivo: 100% para la utilidad.

**Estado:** ✅ Completado

---

### 5. RSS Polling Automation (Objetivo SMART)

**Descripción:**  
Implementar un service de polling de RSS con node-cron para detectar nuevos vídeos en canales que tienen followersCount > 0, llamado startRSSPolling() desde src/index.js en arranque y stopRSSPolling() en el proceso de shutdown.

**Justificación:**  
Automatizar la detección de nuevos vídeos mediante RSS es necesario para alimentar el feed sin intervención manual.

**Issues relacionados:**
- #62 (https://github.com/TuberIA-App/TuberIA/issues/62) - Implementing RSS Polling Automation con node-cron - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Creación de backend/src/services/youtube/rssPoller.service.js conforme al roadmap.  
- ✅ Integración de startRSSPolling() en src/index.js al arrancar la aplicación.  
- ✅ Inclusión de await stopRSSPolling() en la secuencia de shutdown.

**Estado:** ✅ Completado

---

### 6. Performance: Índices y Cache del feed (Objetivo SMART)

**Descripción:**  
Aplicar índices en modelos clave (Video y UserChannel) y crear una utilidad de caching (src/utils/cache.js) con getOrSet e invalidate. Aplicar caché de 60 segundos al endpoint del feed de vídeos y añadir tests unitarios para la utilidad de cache.

**Justificación:**  
Optimizar consultas de feed y reducir carga de DB en producción para mejorar latencia y escalabilidad.

**Issues relacionados:**
- #67 (https://github.com/TuberIA-App/TuberIA/issues/67) - Performance Optimization (Indexes + Caching) - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Índices añadidos en Video: { channelId: 1, publishedAt: -1 }, { status: 1, createdAt: -1 }, { channelId: 1, status: 1 }.  
- ✅ Índice único en UserChannel: { userId: 1, channelId: 1 } (unique).  
- ✅ Creación de src/utils/cache.js con getOrSet e invalidate.  
- ✅ Aplicación de caché de 60 segundos al endpoint del feed de vídeos.  
- ✅ Implementación de tests unitarios para la utilidad de cache (actividad prevista).

**Estado:** ✅ Completado

---

### 7. Operaciones: Seguridad y Monitoring de Redis (Objetivo SMART)

**Descripción:**  
Asegurar Redis en producción con secret password, integrar lectura de password desde /run/secrets/redis_password en producción, añadir health checks que validen Redis y MongoDB, y crear scripts de monitoring/backup y logging para Redis.

**Justificación:**  
Operaciones robustas y confidencialidad del acceso a Redis son requisitos para producción y para garantizar continuidad operativa del sistema de colas.

**Issues relacionados:**
- #55 (https://github.com/TuberIA-App/TuberIA/issues/55) - Logging & Monitoring Setup - Asignado a: acasmor0802  
- #53 (https://github.com/TuberIA-App/TuberIA/issues/53) - Health Checks Mejorados con Redis - Asignado a: acasmor0802  
- #52 (https://github.com/TuberIA-App/TuberIA/issues/52) - Redis Container + Docker Configuration - Asignado a: acasmor0802  
- #56 (https://github.com/TuberIA-App/TuberIA/issues/56) - Validación Final & Testing Completo - Asignado a: acasmor0802

**Métricas alcanzadas:**
- ✅ Generación de secret para Redis: openssl rand -base64 32 > secrets/redis_password.txt (acción listada).  
- ✅ Actualización de docker-compose.prod.yml para usar --requirepass leyendo de secret y agregar secret en sección correspondiente.  
- ✅ Modificación de backend/src/config/redis.js para leer password de /run/secrets/redis_password en producción.  
- ✅ Mejora de /health para validar Redis (redisClient.ping()) y MongoDB (mongoose.connection.readyState), devolviendo JSON con status y services.  
- ✅ Verificación en testing: desarrollo (PONG, conexión backend, health checks, BullMQ testing) y producción (health checks post-arranque, Redis no expuesto en red pública).

**Estado:** ✅ Completado

---

## 📦 Entregables del Sprint

### Funcionalidades Implementadas
- Feed de usuario con paginación (GET /api/users/me/videos) completado / listo para consumo del frontend.  
- Visualización y gestión de canales en el frontend: obtención de canales seguidos por usuario, búsqueda de canales, follow y unfollow.  
- Endpoint de búsqueda de canales mejorado para crear/actualizar canal a partir de YouTube RSS y retornar ObjectId.  
- Endpoints de follow/unfollow expuestos (POST /:id/follow y DELETE /:id/unfollow) con actualización de followersCount.  
- Live demo en home page para búsqueda de canales con bloqueo para monitorización sin registro.  
- Página de resumen de vídeo específica (vista que renderiza markdown) desarrollada en frontend.

### Componentes Técnicos Desarrollados
- Backend controllers y servicios:
  - backend/src/controllers/video.controller.js (getMyVideos) — creación mencionada en issue.  
  - backend/src/controllers/channel.controller.js (followChannel, unfollowChannel) — creación/actualización mencionada.  
  - backend/src/services/youtube/rssPoller.service.js — servicio de polling RSS con node-cron.  
  - src/utils/cache.js — utilidad con getOrSet e invalidate.  
  - src/utils/idempotency.js — utilidad de idempotency basada en Redis.  
  - Workers: backend/src/workers/transcription.worker.js y backend/src/workers/summarization.worker.js.  
  - Redis client y colas BullMQ integradas en código (Phase 1).

- Docker / DevOps:
  - docker-compose.dev.yml con Redis expuesto en 6379 para debugging.  
  - docker-compose.prod.yml con Redis sin puerto expuesto, memory limit 128MB, eviction policy allkeys-lru, y support para secret redis_password.

### Documentación Generada
- Documentación de rutas y endpoints asociados a follow/unfollow y feed (issue indica actualización de docs).  
- Documentación de APIs públicas utilizada para demo en home page (referida en issue #50).  
- Health checks actualizados y documentación breve sobre comportamiento de /health y servicios validados (api, redis, mongodb).

### Tests Implementados
- Tests unitarios para:
  - Utilidad de idempotency con objetivo de 100% coverage (issue #66).  
  - Utilidad de cache (tests unitarios listados en acciones siguientes de #67).  
  - Validaciones de Redis en entornos de testing (PONG y conexión backend) y pruebas de BullMQ en entorno de desarrollo (issue #56).

---

## Issues relacionados con cada objetivo

(Se listan las relaciones anteriores en el detalle de objetivos SMART; aquí se recapitula por objetivo técnico.)

- Backend endpoints y feed: #80, #64, #63, #88  
- Frontend channel page & integration: #77, #86, #45, #50, #51  
- Background processing, Redis & BullMQ: #60, #61, #52  
- Idempotency: #66  
- RSS Poller: #62  
- Performance (indexes + cache): #67  
- Operations, logging, monitoring, health checks: #55, #53, #56

---

## 👥 Distribución de Trabajo

(Distribución basada en asignaciones presentes en los issues y en las acciones y archivos mencionados en cada issue. Las contribuciones listadas se extraen exclusivamente de los cuerpos de los issues.)

### obezeq
- **Issues completados:** #88, #80, #67, #66, #64, #63, #62, #61, #60
- **Áreas:** Backend, Background Workers, Performance, Integración Redis/BullMQ, RSS Poller, Idempotency
- **Contribuciones principales:**
  - Implementación/ajuste del endpoint GET /api/channels/search para búsqueda en YouTube RSS, creación/actualización de canales en BD y retorno del MongoDB ObjectId (issue #88).  
  - Desarrollo de endpoints y controladores críticos para completar Phase 5: getMyVideos (video.controller.js) para el feed con paginación (issue #64) y endpoints follow/unfollow con actualización de followersCount (issue #63).  
  - Aplicación de optimizaciones de rendimiento: añadir índices en modelos Video y UserChannel, creación de src/utils/cache.js con getOrSet e invalidate, y aplicación de caché de 60 segundos al feed (issue #67).  
  - Implementación de idempotency utility en src/utils/idempotency.js con TTL 7 días y envolvimiento de generateVideoSummary (issue #66).  
  - Implementación de servicio de RSS polling (backend/src/services/youtube/rssPoller.service.js) y llamadas a startRSSPolling/stopRSSPolling en el flujo de arranque/shutdown (issue #62).  
  - Creación e integración de Redis client y colas BullMQ en el código para Phase 1, así como pruebas unitarias asociadas (issue #60).  
  - Implementación de los workers permanentes transcription.worker.js y summarization.worker.js con gestión de concurrency, limiter y graceful shutdown (issue #61).

### acasmor0802
- **Issues completados:** #86, #77, #56, #55, #53, #52
- **Áreas:** Frontend (Integración pages), DevOps / Infraestructura, Monitoring, Health checks
- **Contribuciones principales:**
  - Integración del backend en la página completa de channels en frontend para exponer: obtención de canales seguidos, búsqueda de canal, follow y unfollow (issues #77 y #86).  
  - Configuración y pruebas relacionadas con Redis en Docker (creación y revisión de docker-compose.dev.yml y docker-compose.prod.yml), y cambios de configuración en backend para lectura de secret de Redis en producción (issues #52 y #55).  
  - Implementación de health check mejorado en backend/src/routes/health.routes.js para validar Redis y MongoDB y modificación del Docker health check para reflejar estos controles (issue #53).  
  - Validación final y testing completo de la infraestructura Redis en desarrollo y producción, verificando builds, health checks y aspectos críticos antes del deploy (issue #56).  
  - Generación de secret para Redis y actualización de docker-compose.prod.yml para usar --requirepass leyendo de secret (detalle en #55).

### Naleper90
- **Issues completados:** #51, #50
- **Áreas:** Frontend (UX/flow)
- **Contribuciones principales:**
  - Corrección de redirección en dashboard: asegurar que cuando un usuario autenticado accede a la ruta principal (/) se redirige al DASHBOARD si JWT válido, así como implementación de header en la home page según mock-up (issue #51).  
  - Implementación de live demo en la home page para búsqueda de canales de YouTube con comportamiento que solicita registro para monitorizar canales (issue #50).  
  - Integración con la documentación de APIs públicas para habilitar búsqueda superficial en home page (referida en #50).

---

## 📈 Análisis de Cumplimiento

- **Tasa de completitud:** 100% (18/18 issues cerrados en el periodo del sprint)  
- **Objetivos alcanzados:** 7/7 objetivos SMART definidos para el sprint — todos completados dentro del período (2025-11-28 a 2025-12-04).  
- **Distribución de trabajo:**  
  - El trabajo del sprint se dividió principalmente entre backend e infraestructura (obezeq: 9 issues de backend/workers/performance), frontend e integración/operaciones (acasmor0802: 6 issues incluyendo DevOps/health/monitoring), y ajustes UX/experiencia en home/dashboard (Naleper90: 2 issues).  
  - La carga se concentró en backend (implementación de múltiples módulos y workers) y en asegurar que Redis/BullMQ funcionaran correctamente, con acasmor0802 ejecutando las tareas de hardening y pruebas en ambientes. La distribución fue coherente con los roles asignados por issue.  
- **Calidad técnica:**  
  - Se definieron y ejecutaron tests unitarios para utilidades críticas: idempotency (objetivo 100% coverage), utilidades de cache y pruebas de conectividad Redis/BullMQ en ambiente de desarrollo.  
  - Índices en modelos y caché de 60 segundos fueron aplicados para optimizar consultas de feed y reducir carga en producción.  
  - Health check ampliado garantiza la detección de degradación de servicios (Redis y MongoDB) más allá de la simple disponibilidad de la API.  
- **Tiempo estimado vs real:**  
  - Todas las tareas listadas en los issues se cerraron dentro del lapso del sprint (7 días). No existen en los bodies de los issues registros explícitos de estimaciones en horas/días por tarea; por tanto, no se pueden comparar estimaciones individuales vs tiempo real con precisión. La métrica global es que el sprint alcanzó cierre completo de las tareas previstas en el periodo.

---

## ⚠️ Problemas y Soluciones

(Se detallan problemas encontrados durante el sprint y la resolución aplicada. Para el bug/fix explícito del sprint se describe el problema y la solución implementada conforme al issue #88.)

### Problema 1 — Fix Backend Channel Search + Follow Limitation for non existing channels (Issue #88)
- **Impacto:**  
  El endpoint GET /api/channels/search no cumplía las expectativas operativas: no buscaba canal en YouTube RSS, no creaba/actualizaba el canal en la base de datos si no existía, y no retornaba el documento con su MongoDB ObjectId. Esto impedía que el frontend pudiera integrar búsquedas de canales con creación automática y bloquear la funcionalidad de seguimiento para canales inexistentes o no sincronizados en la BD, provocando una mala experiencia de usuario y errores en las operaciones de follow/unfollow.
- **Solución aplicada:**  
  Se examinó channel.service.js (acción siguiente indicada) y se corrigió la lógica del endpoint GET /api/channels/search para que cumpla las tres acciones requeridas:
  1. Buscar el canal utilizando el feed RSS de YouTube.  
  2. Crear o actualizar el canal en la base de datos automáticamente si no existía.  
  3. Retornar el canal con su MongoDB ObjectId en la respuesta al cliente.  
  La resolución asegura que las operaciones de follow/unfollow ya pueden operar sobre canales existentes en la BD y que la UI recibe el identificador necesario para las siguientes acciones.

### Problema 2 — Necesidad de garantizar no generación de resúmenes duplicados (Issue #66)
- **Impacto:**  
  Sin idempotency, el sistema podría generar resúmenes duplicados para el mismo video en diferentes instancias de procesamiento, aumentando costes en uso de tokens y provocando inconsistencias en los datos de resumen.
- **Solución aplicada:**  
  Implementación de src/utils/idempotency.js, envolviendo generateVideoSummary con withIdempotency y utilizando una clave basada en título + longitud del transcript o hash. Se estableció un TTL de 7 días para las entradas de idempotency en Redis. Además, se desarrollaron tests unitarios con objetivo de 100% de coverage para garantizar comportamiento correcto.

### Problema 3 — Necesidad de asegurar persistencia y seguridad de Redis en producción (Issues #52, #55, #56)
- **Impacto:**  
  Redis es crítico para BullMQ; sin configuración adecuada en producción (password, limits de memoria, política de eviction y sin exposición pública) existen riesgos de seguridad, pérdidas de datos por memoria insuficiente y fallos de jobs en BullMQ.
- **Solución aplicada:**  
  - Añadido Redis en docker-compose.prod.yml con memory limit 128MB y eviction policy allkeys-lru, y expuesto solo internamente (no publish ports).  
  - Generación de secret redis_password.txt y modificación de docker-compose.prod.yml para que Redis Lea --requirepass desde el secret.  
  - Modificación de backend/src/config/redis.js para leer el password de /run/secrets/redis_password en producción.  
  - Pruebas de desarrollo y producción para verificar PONG, health checks y que Redis no esté expuesto públicamente.

### Problema 4 — Rendimiento del feed de vídeos (Issue #67)
- **Impacto:**  
  Consultas sin índices y sin cache al feed podrían originar latencias y cargas de DB innecesarias en producción, impactando la experiencia del usuario en el dashboard.
- **Solución aplicada:**  
  - Añadidos índices recomendados en Video y UserChannel para optimizar las consultas más frecuentes.  
  - Implementación de src/utils/cache.js y aplicación de caché de 60 segundos al endpoint del feed de vídeos para reducir presión sobre la base de datos.

### Problema 5 — Orquestación de trabajo en background y arranque/apagado ordenado (Issues #61, #62)
- **Impacto:**  
  Sin workers permanentes y sin manejo de start/stop para RSS polling y workers, el sistema no procesaría jobs de forma controlada, dejando jobs en cola sin consumo o provocando pérdida de procesos en reinicios.
- **Solución aplicada:**  
  - Implementación de transcription.worker.js y summarization.worker.js con lógica de concurrency, limitadores y reintentos.  
  - Llamada a startRSSPolling() en src/index.js durante arranque y await stopRSSPolling() durante el shutdown para manejo ordenado de polling y workers.

---

## 🔄 Lecciones Aprendidas

1. Mejora en la coordinación backend-frontend: definir contratos (endpoints y payloads) con suficiente exactitud desde el inicio evita correcciones de último minuto como la detectada en GET /api/channels/search. En futuros sprints será útil un checklist de comportamiento requerido por endpoint (por ejemplo: creación si no existe + retorno de ObjectId).
2. Importancia de la idempotencia en procesos que implican coste externo: centralizar la estrategia de idempotency (clave y TTL) permite controlar costes y consistencia de resultados en operaciones con servicios de terceros (p. ej. generación de resúmenes).
3. Operaciones tempranas en infra: desplegar Redis en entorno dev con configuración que refleje producción (eviction, no exposición pública, secrets) y agregar health checks que incluyan Redis y MongoDB elimina sorpresas en el deploy y facilita pruebas de BullMQ.
4. Small wins en performance antes del deploy: aplicar índices y cache de corto TTL (60s) al feed produce mejoras apreciables de latencia sin cambios en el modelo de datos, una práctica aplicable en próximas iteraciones.
5. Testing enfocado en utilidades críticas (idempotency y cache) aporta confianza y facilita la entrega continua, especialmente cuando existen costes asociados a operación (tokens) o potenciales reintentos que consumen recursos.

---

## 📋 Decisiones Técnicas

- **Uso de Redis y BullMQ como núcleo del sistema de colas:** Redis se considera crítico para BullMQ; por tanto, se desplegó como container y se integró en el código para gestionar colas y state de idempotency y jobs (issue #60, #52).
- **Seguridad de Redis en producción mediante secret:** Se decidió no exponer Redis en producción y usar un secret con --requirepass cargado desde /run/secrets/redis_password para reducir la superficie de ataque y garantizar autenticación controlada (issue #55).
- **Índices de base de datos en modelos Video y UserChannel:** Se aplicaron índices concretos para optimizar consultas del feed y operaciones de relación usuario–canal: Video: { channelId: 1, publishedAt: -1 }, { status: 1, createdAt: -1 }, { channelId: 1, status: 1 }; UserChannel: { userId: 1, channelId: 1 } unique (issue #67).
- **Caching de 60 segundos en el feed:** Implementación de src/utils/cache.js con getOrSet e invalidate y puesta en producción de un cache TTL de 60s para el endpoint del feed, equilibrando frescura de datos y reducción de carga (issue #67).
- **Idempotency TTL de 7 días para summaries:** Para evitar duplicidad en summaries y proteger contra costos repetidos en tokens, el TTL de la clave de idempotency se fijó en 7 días (issue #66).
- **RSS Polling limitado a canales con followersCount > 0:** El RSS poller procesará únicamente canales que tengan followersCount > 0, optimizando recursos y evitando polling innecesario (issue #62).
- **Workers permanentes y graceful shutdown:** Los workers para transcription y summarization son permanentes y deben soportar concurrency, limiters y reintentos; además se integran con el ciclo de vida de la app para shutdown ordenado (issue #61).

---

## 📝 Notas Adicionales

- El sprint logró cerrar de manera integral tanto la parte funcional (endpoints y UI) como la infraestructura (Redis, BullMQ, workers y monitoring), lo que habilita la siguiente fase de pruebas end-to-end y preparativos para deploy en ambientes controlados.  
- Se priorizó la eliminación de puntos críticos que bloqueaban la integración frontend-backend (p. ej. búsqueda de canales que no retornaba ObjectId), de forma que la experiencia del usuario logueado sea coherente al interactuar con la página de canales.  
- Los artefactos creados (controllers, servicios, utilidades, workers y docker-compose) están identificados en los issues y pueden ser referenciados para revisión de código y auditoría técnica posterior.
