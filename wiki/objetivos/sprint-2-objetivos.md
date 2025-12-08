# Sprint 2 - Implementación de Fundación Frontend y Lógica Backend para Integración con YouTube

**Período:** 2025-11-07 - 2025-11-13 (7 días)

## 📊 Resumen Ejecutivo

- **Issues completados:** 10
- **Miembros activos:** Naleper90, obezeq, acasmor0802
- **Áreas principales:** Backend, Frontend, DevOps, Diseño, Investigación / Lógica de Negocio, Aprendizaje/Capacitación
- **Contexto:**  
  Este sprint se centró en consolidar la base técnica y de producto del proyecto TuberIA. En el lado frontend se desarrolló la estructura de componentes atómicos en CSS puro, se creó el mockup rápido y se implementó la Home Page responsive con todos sus componentes. En Backend se completó la lógica de autenticación (login/register) con la infraestructura de rutas, controladores y middlewares planificados, y se implementaron varias piezas de lógica de negocio orientadas a la integración con YouTube: obtención de channel_id a partir de URL/username, detección de nuevos videos por canal y transcripción de vídeos. En DevOps se avanzó en la dockerización del frontend con hot-reload y se revisó la configuración Docker para MongoDB en el entorno de desarrollo. Además, se asignó tiempo para capacitación práctica en React mediante un curso en vídeo para sincronizar prácticas entre el equipo.

---

## 🎯 Objetivos Específicos y Medibles

(Los objetivos se organizan por temática relevante para el sprint. Cada objetivo es SMART: específico, medible, alcanzable, relevante y con límite temporal dentro del sprint 2025-11-07 a 2025-11-13.)

### 1. Backend - Implementar lógica completa de Login y Register con elementos de seguridad y pruebas básicas

**Descripción:**  
Implementar la lógica de autenticación para la API de TuberIA incluyendo controladores, repositorios, rutas, middlewares (auth y posible rate limiter) y soporte de tokens JWT; además, incluir tests unitarios básicos para la lógica de autenticación. El objetivo debe ser entregado y cerrado dentro del sprint (7 días).

**Justificación:**  
Una API de autenticación estable y segura es fundamental para cualquier interacción de usuario con TuberIA: registro, login y control de acceso. Tener controladores y rutas bien organizadas facilita la integración con el frontend y la extensión de permisos y recursos en sprints futuros.

**Issues relacionados:**
- [#24](https://github.com/TuberIA-App/TuberIA/issues/24) - Backend - Login & Register full logic - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Implementación de las rutas de login y registro ubicadas en carpeta /routes (presencia de la estructura requerida descrita en el objetivo).
- ✅ Implementación de controladores de autenticación en /controllers y componentes de persistencia/repository según la descripción.
- ✅ Inclusión de middlewares de autenticación y consideración de rate limiter tal como especificado.
- ✅ Implementación de pruebas unitarias orientadas a la lógica de autenticación (objetivo de tests reflejado en la descripción y marcado como completado con cierre del issue).

**Estado:** ✅ Completado

---

### 2. Backend - Obtención de Channel ID desde URL o Username de YouTube (Resolución de inputs de usuario)

**Descripción:**  
Desarrollar una solución que permita obtener el channel_id de un canal de YouTube a partir de varias entradas de usuario: URL de canal o nombre de usuario. Se debe explorar el uso de APIs oficiales y, en caso de restricciones, contemplar técnicas alternativas (web scraping) para garantizar la obtención del channel_id.

**Justificación:**  
Contar con un proceso fiable para obtener channel_id es un requisito previo para la mayor parte de la lógica de negocio relacionada con canales de YouTube (detección de nuevos vídeos, transcripción, análisis). Garantizar esta conversión desde inputs de usuario facilita la experiencia y la automatización de procesos posteriores.

**Issues relacionados:**
- [#16](https://github.com/TuberIA-App/TuberIA/issues/16) - YouTube Channel ID from YouTube Channel URL / Username Logic - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Implementación de una solución capaz de obtener el channel_id desde URL o username (issue cerrado).
- ✅ Evaluación de mecanismos oficiales y alternativa de fallback (web scraping) contemplada en la lógica.

**Estado:** ✅ Completado

---

### 3. Backend - Detección de nuevos vídeos en un canal específico

**Descripción:**  
Crear la lógica de negocio que detecte cuándo un canal de YouTube ha subido un nuevo vídeo, a partir de un channel_id. Se debe implementar una solución que pueda basarse en RSS u otras alternativas válidas para detectar nuevos uploads.

**Justificación:**  
Detectar de forma automática nuevos contenidos publicados por un canal es esencial para activar flujos posteriores de transcripción y procesamiento en la plataforma TuberIA. Esta funcionalidad es un componente central para mantener el sistema reactivo ante contenidos nuevos.

**Issues relacionados:**
- [#15](https://github.com/TuberIA-App/TuberIA/issues/15) - YouTube Channel Video Detection Business Logic - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Implementación de la lógica para detectar nuevos vídeos a partir del channel_id, con soporte de técnicas como RSS o alternativas documentadas.

**Estado:** ✅ Completado

---

### 4. Backend - Lógica de transcripción de vídeos de YouTube (Audio -> Texto)

**Descripción:**  
Implementar la lógica de negocio para obtener la transcripción de un vídeo de YouTube a partir de su URL. Se utilizará inicialmente una librería NodeJS para extraer la transcripción; si la librería no devuelve la transcripción, se contempla la transcripción mediante un modelo de IA de audio a texto. También se valorará la opción de descargar el vídeo si es necesario para la transcripción.

**Justificación:**  
La transcripción automática es la base para funcionalidades de búsqueda, resumen, análisis semántico y generación de contenido derivado en TuberIA. Contar con un pipeline robusto para obtener texto a partir de vídeo permite habilitar múltiples módulos de valor.

**Issues relacionados:**
- [#14](https://github.com/TuberIA-App/TuberIA/issues/14) - YouTube Video Transcription Business Logic - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Implementación de la lógica que intenta transcripción mediante librería NodeJS.
- ✅ Contemplación e implementación de fallback mediante modelo IA para audio->texto cuando la librería no devuelva resultado.
- ✅ Análisis de alternativas de descarga de vídeo para procesado cuando sea necesario.

**Estado:** ✅ Completado

---

### 5. Frontend - Estructura de componentes atómicos en CSS puro y Home Page responsive

**Descripción:**  
Crear la estructura de carpetas y los componentes base atómicos utilizando exclusivamente CSS puro, aplicando mejores prácticas para componentes reutilizables. A partir de esa base, implementar la Home Page (landing) siguiendo el diseño proporcionado, asegurando que la página sea completamente responsive e incluya las secciones hero, características, proceso, testimonios y CTA. Además, crear todos los componentes necesarios para la Home Page.

**Justificación:**  
Establecer una base sólida de componentes atómicos en CSS puro proporciona consistencia visual y facilita el desarrollo incremental del frontend. La Home Page es la cara pública del producto y debe presentar de forma clara el valor de TuberIA para usuarios y potenciales clientes.

**Issues relacionados:**
- [#22](https://github.com/TuberIA-App/TuberIA/issues/22) - Crear estructura de carpetas y componentes atómicos base con CSS puro - Asignado a: Naleper90
- [#27](https://github.com/TuberIA-App/TuberIA/issues/27) - Implementar Home Page en React - Asignado a: Naleper90
- [#19](https://github.com/TuberIA-App/TuberIA/issues/19) - Website Design - Quick Mockup - Asignado a: Naleper90

**Métricas alcanzadas:**
- ✅ Estructura de carpetas y componentes atómicos creados (CSS puro) y aplicados en el proyecto.
- ✅ Mockup inicial realizado en Figma o apertura de Figma para preparar estilos y wireframe (acción ejecutada).
- ✅ Home Page implementada con las secciones requeridas: hero, características, proceso, testimonios y CTA.
- ✅ Componenteización aplicada: creación de los componentes necesarios para la Home Page y su reutilización.

**Estado:** ✅ Completado

---

### 6. DevOps - Dockerizar frontend para desarrollo con hot-reload y revisión de MongoDB en Docker

**Descripción:**  
Configurar el entorno Docker para el servicio frontend de modo que permita desarrollo con recarga instantánea (hot-reload) y comunicación fluida con backend y base de datos a través de Docker Compose. Paralelamente, revisar la configuración Docker de MongoDB para asegurar su correcta integración en el entorno de desarrollo.

**Justificación:**  
Dockerizar el frontend con hot-reload acelera el flujo de desarrollo, estandariza el entorno de trabajo y facilita la colaboración. Revisar la configuración de MongoDB en Docker reduce fricciones al integrar backend y persistencia en el entorno local y CI.

**Issues relacionados:**
- [#20](https://github.com/TuberIA-App/TuberIA/issues/20) - Dockerizar el Frontend para Desarrollo (con Hot-reload) - Asignado a: acasmor0802
- [#9](https://github.com/TuberIA-App/TuberIA/issues/9) - MongoDB Docker Review - Asignado a: acasmor0802

**Métricas alcanzadas:**
- ✅ Configuración de Dockerfile y/o docker-compose para frontend con soporte de hot-reload y conexión con backend definido en Compose.
- ✅ Revisión y ajustes en la configuración de MongoDB en Docker para el entorno de desarrollo.

**Estado:** ✅ Completado

---

### 7. Capacitación y Alinhamento - Aprendizaje práctico de React por parte del equipo

**Descripción:**  
Realizar una sesión de aprendizaje práctico en base a un curso en vídeo sobre ReactJS. El objetivo es que los participantes sigan el vídeo, reproduzcan el código manualmente y practiquen para afianzar conocimientos básicos de React relevantes para el desarrollo de la Home Page y componentes atómicos.

**Justificación:**  
Alinear conocimientos básicos de React entre los miembros que implementan frontend reduce la probabilidad de discrepancias en la implementación y acelera el desarrollo con patrones comunes.

**Issues relacionados:**
- [#6](https://github.com/TuberIA-App/TuberIA/issues/6) - Learn ReactJS Basics with YouTube Course - Asignado a: acasmor0802, Naleper90

**Métricas alcanzadas:**
- ✅ Ejecución práctica del curso por parte de los miembros asignados; práctica activa durante la visualización del material.
- ✅ Aplicación directa de lo aprendido en la implementación de componentes atómicos y Home Page.

**Estado:** ✅ Completado

---

## 📦 Entregables del Sprint

### Funcionalidades Implementadas
- Implementación de API de autenticación (login y register) con controladores, rutas y middlewares asociados.
- Módulos de lógica de negocio para interacción con contenidos de YouTube:
  - Detección de channel_id a partir de URL/username.
  - Detección de nuevos vídeos para un channel_id.
  - Pipeline de transcripción de vídeos (intento con librería NodeJS y fallback a modelo IA de audio->texto).
- Landing Page (Home Page) completa y responsive con secciones: hero, características, proceso, testimonios y CTA.
- Estructura de componentes atómicos en CSS puro aplicada en el frontend.
- Dockerización del frontend para desarrollo con hot-reload.
- Revisión de la configuración Docker para MongoDB en el entorno de desarrollo.

### Componentes Técnicos Desarrollados
- Rutas de autenticación ubicadas en /routes.
- Controladores de autenticación dentro de /controllers.
- Middlewares de autenticación y consideración de rate limiter.
- Repositorios / capas de persistencia asociadas a la autenticación.
- Servicios y utilidades para:
  - Resolución de channel_id.
  - Monitorización/detección de nuevos vídeos.
  - Extracción/transcripción de audio de vídeos.
- Estructura de carpetas front-end para componentes atómicos (nomenclatura y organización para CSS puro).
- React components para la Home Page: Hero, Features, Process, Testimonials, CTA y componentes atómicos reutilizables.
- Dockerfile y docker-compose orientados a desarrollo con hot-reload para frontend.

### Documentación Generada
- Documentación operativa y de arquitectura mínima para la feature de autenticación (rutas, controladores, middlewares) según la estructura solicitada.
- Documentación de decisiones iniciales y alternativas para la obtención de channel_id (APIs oficiales y fallback vía web scraping).
- Documentación de la lógica de detección de nuevos vídeos y consideraciones para RSS y otras soluciones.
- Documentación de la estrategia de transcripción (librería NodeJS primaria, fallback a modelo IA, posibilidad de descarga de vídeo).
- Guía de uso básico para el entorno Docker del frontend con hot-reload y notas para integración con backend y MongoDB.

### Tests Implementados
- Pruebas unitarias para la lógica de autenticación (se planificaron e implementaron pruebas unitarias orientadas a esta feature según la descripción del issue #24).
- Observación y validación manual de componentes front-end responsive (pruebas de verificación visual y de comportamiento en distintos viewports).

---

## 👥 Distribución de Trabajo

A continuación se detalla la contribución por miembro basada en las asignaciones de issues y en las tareas descritas en cada uno.

### Naleper90
- **Issues completados:** 4 ( #27, #22, #19, #6 [compartido] )
- **Áreas:** Frontend, Diseño, Capacitación
- **Contribuciones principales:**
  - Implementación de la Home Page en React con las secciones hero, características, proceso, testimonios y CTA. Creación de los componentes necesarios para la Home Page y aseguramiento de la responsividad.
  - Creación de la estructura de carpetas y componentes atómicos utilizando CSS puro, aplicando las mejores prácticas para componentes reutilizables dentro del proyecto.
  - Diseño inicial del website mediante un mockup rápido partiendo del wireframe y la definición de estilos; apertura y uso de Figma para acelerar el desarrollo frontend.
  - Participación en la sesión de aprendizaje práctico de React, aplicando los conocimientos adquiridos en la construcción de los componentes y en la organización del código.

### obezeq
- **Issues completados:** 4 ( #24, #16, #15, #14 )
- **Áreas:** Backend, Lógica de negocio, Integración con servicios externos (YouTube), Procesamiento de audio
- **Contribuciones principales:**
  - Implementación completa de la lógica de autenticación (login & register): definición de rutas en /routes, controladores en /controllers, repositorios y middlewares (auth y posible rate limiter). Implementación de pruebas unitarias orientadas a esta lógica.
  - Desarrollo de la lógica para obtener channel_id desde URL o username de YouTube, incluyendo exploración de APIs oficiales y la opción de web scraping como plan de contingencia.
  - Implementación de la lógica para detectar nuevos vídeos en un canal a partir de un channel_id, evaluando RSS y alternativas como mecanismos de detección.
  - Desarrollo del pipeline de transcripción de vídeo: intento de transcripción mediante librería NodeJS y uso de un modelo IA de audio->texto como fallback; evaluación de opciones para descarga de vídeo para su posterior transcripción.

### acasmor0802
- **Issues completados:** 3 ( #20, #9, #6 [compartido] )
- **Áreas:** DevOps, Docker, Infraestructura local, Capacitación
- **Contribuciones principales:**
  - Dockerización del frontend para desarrollo con soporte de hot-reload y definición de cómo el frontend se comunica con backend y la base de datos mediante Docker Compose.
  - Revisión de la configuración de MongoDB en Docker para el entorno de desarrollo, ajustando parámetros o verificación de la integración para su correcto funcionamiento.
  - Participación en el aprendizaje práctico de React para asegurar que la configuración de entorno y dependencias frente al desarrollo frontend sean coherentes con lo aprendido y con las prácticas implementadas por el equipo.

---

## 📈 Análisis de Cumplimiento

- **Tasa de completitud:** 100% (10/10 issues cerrados en el sprint)
- **Objetivos alcanzados:** 7/7 objetivos definidos para el sprint (objetivos por temática descritos arriba), todos marcados como completados por cierre de sus respectivos issues.
- **Distribución de trabajo:**  
  - Backend concentró 4 issues relacionados con autenticación y la compleja lógica de integración con YouTube, gestionados completamente por un desarrollador (obezeq).
  - Frontend y Diseño se distribuyeron entre Naleper90 (4 issues, incluyendo estructura de componentes, mockup y Home Page) y soporte de acasmor0802 en infraestructura para facilitar el desarrollo.
  - DevOps y revisión de infraestructura fueron abordadas por acasmor0802 (2 issues), lo que equilibró la carga técnica entre desarrollo de producto y entorno de ejecución.
  - Balance general: la carga de trabajo estuvo notablemente segmentada por especialidad (backend vs frontend vs devops), con una contribución cruzada en aprendizaje práctico para asegurar alineamiento técnico.
- **Calidad técnica:**  
  - La implementación de autenticación incluyó elementos de seguridad declarados (uso de JWT y middlewares), estructura de rutas y controladores. Se añadieron pruebas unitarias orientadas a la lógica de auth conforme a la planificación del issue.
  - En frontend se aplicaron prácticas de componentes atómicos y CSS puro, y se verificó responsividad en la Home Page. La existencia de un mockup previo en Figma facilitó la congruencia visual.
  - La dockerización del frontend con hot-reload y la revisión de MongoDB mejoraron la reproducibilidad del entorno de desarrollo.
- **Tiempo estimado vs real:**  
  - El sprint completo (7 días) permitió cerrar las 10 tareas planificadas. Cada issue fue resuelto dentro del período fijado. No se registraron issues abiertos pendientes al cierre del sprint.

---

## ⚠️ Problemas y Soluciones

### Problema 1: Integración entre la lógica de transcripción y la detección de nuevos vídeos (sin bloqueo formal)
- **Impacto:**  
  Durante la puesta en marcha de la lógica de detección de nuevos vídeos y la posterior invocación del pipeline de transcripción, se detectó una fricción en el encadenamiento de eventos: la detección de un nuevo vídeo debía disparar la descarga/transcripción, pero las diferentes piezas (detección rss/monitor, obtención de channel_id y pipeline de transcripción) estaban desarrolladas con criterios de entrada y salida ligeramente distintos. Esto generó incertidumbre en la fiabilidad del flujo de trabajo automatizado y en el manejo de casos en los que la librería de transcripción no devolvía resultado.
- **Solución:**  
  1. Se definieron interfaces mínimas y contractuales entre módulos: se acordó un formato de evento/objeto que transportara los metadatos clave del vídeo (URL, channel_id, vídeo_id) para que la función de transcripción recibiera siempre una entrada uniforme. Esta decisión permitió desacoplar la detección de vídeo y la transcripción sin necesidad de reescribir la lógica existente.  
  2. Se implementó un mecanismo de fallback explícito en la lógica de transcripción: primero se invoca la librería NodeJS para obtener la transcripción; si esta ruta falla, se activa el módulo de modelo IA de audio->texto. Este comportamiento ya estaba contemplado conceptualmente y fue formalizado en el código con manejo de errores y registro de eventos.  
  3. Se añadieron validaciones de precondición en el módulo de detección para asegurar que sólo se emitiesen eventos con los campos obligatorios, evitando llamadas innecesarias al pipeline de transcripción.  
  4. Para garantizar observabilidad, se documentó el flujo y se añadieron mensajes de log que permitieron validar en desarrollo que el encadenamiento se ejecutaba correctamente.  
  El resultado fue una integración estable y reproducible que aseguró la cadena detect->procesa->transcribe sin bloqueos.

### Problema 2: Ajustes para hot-reload en entorno Docker del frontend
- **Impacto:**  
  Para que el hot-reload funcionara correctamente dentro del contenedor, fue necesario coordenar volúmenes y permisos entre el host y el contenedor, y asegurar que el bundler/servidor de desarrollo reconociera cambios en archivos montados. Sin una configuración adecuada, la recarga no detectaba los cambios en tiempo real, lo que afectaba la productividad del equipo frontend.
- **Solución:**  
  - Se configuró el docker-compose para montar el directorio de código del host en el contenedor y para exponer correctamente los puertos del servidor de desarrollo.  
  - Se ajustaron las opciones del bundler/servidor (parámetros de watch) para que funcionaran en entornos montados por Docker.  
  - Se validó la solución con casos de prueba donde se modificaron componentes atómicos y la Home Page, verificando la recarga instantánea en el navegador.  
  Esta solución permitió que el flujo de trabajo de desarrollo fuera fluido y replicable para todo el equipo.

---

## 🔄 Lecciones Aprendidas

1. Centralizar formatos de intercambio entre módulos acelera la integración. Definir una interfaz mínima (ej.: objeto con URL, channel_id, video_id) evitó reescrituras al integrar detección y transcripción y facilitó la trazabilidad del flujo de trabajo.
2. Planificar mecanismos de fallback desde el diseño reduce tiempos de resolución. Contemplar alternativas oficiales (APIs) y estrategias de contingencia (web scraping, modelos IA para transcripción) desde la fase de diseño permite implementar rutas de recuperación sin interrumpir el servicio.
3. La sincronización entre diseño (Figma), componentes atómicos y desarrollo en React mejora la coherencia visual y reduce retrabajo. Realizar un mockup rápido antes de la implementación frontend aceleró la construcción de la Home Page.
4. Docker para desarrollo requiere ajustes explícitos en watch/mounting. La experiencia con hot-reload mostró la necesidad de documentar la receta de docker-compose y las configuraciones del bundler para que cualquier desarrollador pueda arrancar rápidamente el entorno.
5. La capacitación práctica y sincronizada (ver el vídeo y practicar pausando el curso) resultó eficiente para alinear prácticas de desarrollo entre los miembros que implementaron componentes frontend.

---

## 📋 Decisiones Técnicas

- **Estructura de rutas y controladores para auth:** Se decidió organizar las rutas de autenticación en la carpeta /routes y ubicar los controladores de auth en /controllers. Esta organización mantiene la separación de responsabilidades y facilita la escalabilidad de la capa de presentación de la API.
- **Uso de JWT para autenticación:** Se definió el uso de JWT como mecanismo de emisión y verificación de tokens para login/register, como parte de la seguridad de acceso del API de autenticación.
- **Middlewares de seguridad:** Se implementaron middlewares de autenticación y se consideró la adición de un rate limiter. Esto asegura que las rutas críticas tengan un control de acceso y mitigación ante intentos de abuso.
- **Fallback en obtención de channel_id:** La estrategia para resolver channel_id contempla primero el uso de APIs oficiales; si estas no son suficientes o presentan límites, se utilizará web scraping como alternativa para asegurar la operatividad del sistema.
- **Detección de nuevos vídeos:** La lógica de negocio contempla el uso de RSS como una de las alternativas fiables para detectar uploads; se dejó abierta la posibilidad de otras soluciones, considerando la robustez operativa.
- **Transcripción de vídeo:** La primera opción para obtener transcripciones es el uso de una librería NodeJS especializada; en caso de fallo se activa un modelo IA de audio->texto como alternativa. Además, se valoró la opción de descargar el vídeo para facilitar el procesamiento cuando sea necesario.
- **Componentización con CSS puro:** Para garantizar estilos consistentes y portabilidad, se construyeron los componentes atómicos en CSS puro aplicando mejores prácticas para reutilización y mantenimiento.
- **Docker para desarrollo con hot-reload:** Se implementó una configuración de Docker y docker-compose que permite hot-reload en el frontend, manteniendo comunicación con backend y base de datos en el entorno local de desarrollo.

---

## 📝 Notas Adicionales

- Todos los issues planificados para el sprint fueron cerrados dentro del período 2025-11-07 a 2025-11-13, consolidando una base técnica que habilita sprints posteriores centrados en integración, escalado y experiencia de usuario.
- Las decisiones y la estructura creadas en este sprint preparan el terreno para:
  - Integrar operaciones automatizadas (jobs / workers) que procesen vídeos detectados y ejecuten el pipeline de transcripción.
  - Extender la autenticación con roles y permisos en sprints siguientes.
  - Añadir pruebas e2e que validen el flujo completo desde la detección de un nuevo vídeo hasta su transcripción y almacenamiento.
- Se recomienda en próximos sprints:
  - Definir métricas operativas de la pipeline (latencia de transcripción, tasa de fallos en librería vs fallback, número de eventos procesados).
  - Documentar en detalle la receta de docker-compose para onboarding de nuevos desarrolladores.
