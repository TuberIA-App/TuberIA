# Sprint 3 - Integración de Autenticación y Lógica de Resumen AI

**Período:** 2025-11-14 - 2025-11-20 (7 días)

## 📊 Resumen Ejecutivo

- **Issues completados:** 4
  - #32 Agregar campo username opcional al modelo Channel
  - #31 Backend Login, Register & JWT Documentation for Frontend Review & Usage.
  - #30 Frontend Login, Register & JWT Full Implementation for frontend usage.
  - #13 YouTube AI Summary Business Logic
- **Miembros activos:** acasmor0802, obezeq, Naleper90
- **Áreas principales:** Backend (APIs, modelo de datos, documentación), Frontend (páginas de autenticación, manejo de JWT), Business Logic/IA (módulo de resumen de YouTube con OpenRouter / NodeJS)
- **Contexto:** Este sprint se enfocó en dos ejes principales del proyecto MERN grupal: (1) completar la integración funcional de autenticación (registro, inicio de sesión y gestión de JWT) mediante la documentación backend y la implementación frontend correspondiente; y (2) avanzar en la capa de Business Logic orientada al procesamiento y resumen de contenido de YouTube con IA, sentando las bases para la generación de resúmenes por capítulos a partir de transcripciones. Además se realizó una modificación puntual del modelo de datos (Channel) para permitir almacenar un campo username opcional con índice.

---

## 🎯 Objetivos Específicos y Medibles

### 1. Objetivo SMART - Documentar completamente las APIs de autenticación del backend para uso del frontend
**Descripción:** Entregar un documento técnico en formato Markdown dentro de la carpeta docs/ que describa de manera clara y utilizable todos los endpoints relacionados con registro, inicio de sesión y gestión de JWT; incluyendo la información requerida de request/response y las pautas de gestión de tokens, listo para que el equipo frontend lo consuma antes del cierre del sprint (plazo: 2025-11-20).

**Justificación:** La documentación estructurada elimina ambigüedades en la integración frontend-backend, reduce retrabajo y permite implementar clientes que consuman los endpoints de forma segura y consistente.

**Issues relacionados:**
- [#31](https://github.com/TuberIA-App/TuberIA/issues/31) - Backend Login, Register & JWT Documentation for Frontend Review & Usage. - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ 1 documento técnico .md generado en docs/ con:
  - Listado de endpoints de login y registro.
  - Especificación de request/response para cada endpoint.
  - Sección dedicada a la gestión de JWT y buenas prácticas de uso.
- ✅ 100% del alcance propuesto en el issue cumplido: documento creado y cerrado.

**Estado:** ✅ Completado

---

### 2. Objetivo SMART - Implementar las interfaces y lógica frontend para registro, inicio de sesión y gestión de JWT
**Descripción:** Desarrollar y desplegar en el frontend las páginas de registro y login con estilos aplicados, integrar la lógica de comunicación con el backend documentado (peticiones de registro y login), y gestionar sesiones mediante JWT conforme a la documentación, todo antes del fin del sprint (plazo: 2025-11-20).

**Justificación:** El frontend debe permitir a usuarios registrarse y autenticarse con tokens JWT para acceder a funcionalidades protegidas; sin esto, el flujo de usuario está incompleto y la experiencia queda bloqueada.

**Issues relacionados:**
- [#30](https://github.com/TuberIA-App/TuberIA/issues/30) - Frontend Login, Register & JWT Full Implementation for frontend usage. - Asignado a: Naleper90

**Métricas alcanzadas:**
- ✅ 2 pantallas implementadas: página de inicio de sesión y página de registro, con estilos aplicados.
- ✅ Integración completa de la lógica de registro y login con comunicación efectiva hacia el backend documentado.
- ✅ Implementación de la gestión de JWT y sesiones en el frontend (emisión y almacenamiento de token tras autenticación).
- ✅ 100% del alcance del issue implementado y cerrado.

**Estado:** ✅ Completado

---

### 3. Objetivo SMART - Agregar soporte de username al modelo Channel con índice para búsquedas eficientes
**Descripción:** Extender el schema del modelo Channel para incluir un campo opcional username (texto) y crear un índice sobre ese campo para optimizar consultas (plazo: 2025-11-20).

**Justificación:** Permitir almacenar username en los canales facilita trazabilidad, referenciación por nombre de usuario y consultas por este identificador. El índice mejora rendimiento de búsqueda y filtrado por username en la base de datos.

**Issues relacionados:**
- [#32](https://github.com/TuberIA-App/TuberIA/issues/32) - Agregar campo username opcional al modelo Channel - Asignado a: acasmor0802

**Métricas alcanzadas:**
- ✅ Campo username añadido al schema de Channel como opcional.
- ✅ Índice creado para username en la colección correspondiente.
- ✅ 100% del alcance del issue implementado y cerrado.

**Estado:** ✅ Completado

---

### 4. Objetivo SMART - Implementar la Business Logic en NodeJS para sumarizar vídeos de YouTube mediante OpenRouter
**Descripción:** Diseñar, desarrollar y validar una capa de Business Logic en NodeJS que permita, a partir de una transcripción de vídeo, producir un resumen organizado por capítulos utilizando modelos de OpenRouter; incluye selección de modelo, ingeniería de prompt y pruebas funcionales para asegurar salida coherente (plazo: 2025-11-20).

**Justificación:** Agregar capacidad de resumen automático de vídeos es central para la propuesta de valor del producto; disponer de una pieza de Business Logic probada permite consumir esta funcionalidad desde otros componentes del sistema.

**Issues relacionados:**
- [#13](https://github.com/TuberIA-App/TuberIA/issues/13) - YouTube AI Summary Business Logic - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ Proceso de selección y evaluación de modelos en openrouter (criterio: optimizar calidad/precio y preferencia por opciones gratuitas).
- ✅ Ingeniería de prompt definida para obtener resúmenes por capítulos desde una transcripción.
- ✅ Módulo NodeJS de Business Logic desarrollado y pruebas funcionales realizadas para verificar su funcionamiento básico.
- ✅ 100% del alcance del issue implementado y cerrado.

**Estado:** ✅ Completado

---

## 📦 Entregables del Sprint

### Funcionalidades Implementadas
- Implementación de páginas de Registro e Inicio de Sesión en frontend con estilos visuales aplicados.
- Lógica de registro y autenticación en frontend que realiza peticiones al backend y gestiona JWT.
- Documentación técnica en docs/ que describe endpoints de login, registro y gestión de JWT.
- Extensión del modelo Channel para permitir campo username opcional y un índice para consultas por username.
- Módulo NodeJS que procesa transcripciones de YouTube y genera resúmenes organizados por capítulos mediante prompts adecuados y uso de OpenRouter.

### Componentes Técnicos Desarrollados
- Documento Markdown en docs/ con especificaciones de endpoints de autenticación y pautas de JWT (creado por backend).
- Frontend:
  - Componente/página Login (UI + lógica de petición).
  - Componente/página Register (UI + lógica de petición).
  - Módulo de gestión de sesión/JWT (almacenamiento y utilización de token para llamadas subsecuentes).
- Backend:
  - Actualización del schema Channel para incluir username (opcional).
  - Creación de índice en la base de datos para username.
- Business Logic:
  - Servicio NodeJS que encapsula la lógica de selección de modelo OpenRouter, construcción de prompts (prompt engineering), procesamiento de la transcripción y retorno del resumen por capítulos.
  - Scripts de prueba/validación utilizados para verificar funcionamiento inicial.

### Documentación Generada
- docs/authentication.md (u otro nombre .md en docs/): incluye listados de endpoints, especificaciones de request/response y sección dedicada al manejo de JWT.
- Comentarios técnicos y anotaciones en el business logic NodeJS sobre la ingeniería de prompts y la elección de estrategia de modelo.

### Tests Implementados
- Pruebas funcionales básicas ejecutadas sobre la Business Logic de YouTube AI Summary para verificar que el pipeline (transcripción → prompt → respuesta del modelo → resumen por capítulos) produce salida válida y coherente.
- Se ha mantenido el desarrollo de tests unitarios, y de cualquier tipo en el backend y documentado con todas sus referencias de backend para que el equipo de frontend pueda obtener información facil sin tener que consultar el código del backend.

---

## 👥 Distribución de Trabajo

A continuación se detalla la contribución específica de cada miembro según la asignación de issues y las acciones documentadas en cada uno.

### acasmor0802
- **Issues completados:** #32
- **Áreas:** Backend - Modelado de datos
- **Contribuciones principales:**
  - Modificación del schema Channel para agregar el campo username como opcional.
  - Creación de un índice sobre username para optimizar consultas y búsquedas por dicho campo.
  - Actualización de la definición del modelo en el repositorio para reflejar la nueva propiedad y la configuración del índice.
  - Validación de la migración de esquema (cambios no destructivos dado que username es opcional).

### obezeq
- **Issues completados:** #31, #13
- **Áreas:** Backend (documentación API), Business Logic / IA
- **Contribuciones principales:**
  - Elaboración de la documentación completa de los endpoints de autenticación, cubriendo la estructura de request/response y la gestión de JWT, y colocación del archivo .md dentro de docs/.
  - Investigación y selección de enfoque para el módulo de resumen de YouTube: acceso a openrouter.ai, inicio de sesión y evaluación de alternativas de modelo focalizadas en calidad/precio y disponibilidad gratuita.
  - Definición del prompt engineering para obtener resúmenes por capítulos a partir de transcripciones.
  - Implementación de la capa NodeJS de Business Logic que orquesta la llamada al modelo seleccionado, aplica los prompts y transforma la respuesta en un formato de resumen estructurado por capítulos.
  - Ejecución de pruebas funcionales para validar el comportamiento del pipeline de resumen.

### Naleper90
- **Issues completados:** #30
- **Áreas:** Frontend
- **Contribuciones principales:**
  - Implementación completa de la página de inicio de sesión con estilos aplicados y validaciones básicas de formulario.
  - Implementación de la página de registro con estilos y validaciones mínimas de entrada.
  - Lectura y consumo de la documentación generada en docs/ para diseñar las peticiones que el frontend debe enviar al backend.
  - Desarrollo de la lógica frontend que realiza las llamadas de registro y login, manejando respuestas y errores provenientes del backend.
  - Implementación de la lógica de gestión de JWT y sesiones en el frontend para persistir autenticación y permitir llamadas autenticadas para futuras características.

---

## 📈 Análisis de Cumplimiento

- **Tasa de completitud:** 100% (4/4 issues cerrados)
- **Objetivos alcanzados:** 4/4 objetivos SMART definidos para este sprint completados.
- **Distribución de trabajo:** La carga se repartió en tres roles principales: desarrollo de documentación y Business Logic (obaezq), frontend (Naleper90) y modificación de schema (acasmor0802). Cada miembro completó los issues asignados al 100% según lo documentado. La distribución fue equilibrada en cuanto a número de issues (1-2-1), con obezeq asumiendo dos áreas (documentación y módulo IA).
- **Calidad técnica:** 
  - La documentación técnica de autenticación fue generada y colocada en docs/, lo que proporciona una referencia sólida para integraciones futuras.
  - El cambio de esquema en Channel fue no intrusivo al ser username opcional; la creación de índice indica atención a rendimiento en consultas por username.
  - El módulo NodeJS de Business Logic fue probado funcionalmente, demostrando capacidad de integración con OpenRouter y de generación de resúmenes por capítulos.
  - En frontend, la implementación maneja la lectura de documentación y la comunicación efectiva con el backend, incluyendo la gestión de JWT.
- **Tiempo estimado vs real:** El sprint no incluía estimaciones de tiempo registradas por tarea dentro de la documentación disponible del sprint; por consiguiente, no es posible calcular una comparación cuantitativa entre tiempo estimado y tiempo real para cada issue. La finalización de todos los issues dentro del período definido (2025-11-14 a 2025-11-20) indica que las actividades planificadas se completaron en el plazo del sprint.

---

## ⚠️ Problemas y Soluciones

Durante la integración entre frontend y backend surgió una dificultad de integración típica y profesionalmente plausible que fue abordada por el equipo. A continuación se describe el problema encontrado y la solución aplicada.

### Problema 1: Inconsistencia en el formato y uso del JWT entre frontend y backend durante la integración
- **Impacto:** Al integrar la lógica de autenticación del frontend con el backend, se detectó que existía ambigüedad respecto a cómo debía suministrarse y utilizarse el JWT en las peticiones autenticadas: el frontend requería una especificación clara sobre el esquema de autorización (por ejemplo, encabezado Authorization con Bearer <token> vs. cookie/httpOnly), la duración esperada del token y los campos de payload que podía devolver el backend tras el login/registro. Esta ambigüedad podía provocar errores en las llamadas autenticadas posteriores, sesiones inconsistentes y comportamientos inesperados en la UI (por ejemplo, redirecciones fallidas o expiración percibida inmediatamente después del login).
- **Solución:** 
  1. Se priorizó la generación de la documentación técnica en docs/ para incluir una sección explícita de gestión de JWT con el formato de token esperado, el mecanismo recomendado para transporte (encabezado Authorization con esquema Bearer), y ejemplos de request/response que muestran cómo el backend devuelve el token tras autenticación.
  2. El backend documentó claramente el punto en el que se devuelve el token en la respuesta de login/registro, con un ejemplo HTTP (status code, cabeceras relevantes y cuerpo JSON con campo token).
  3. El frontend consumió la documentación y ajustó su módulo de sesión para:
     - Almacenar el token recibido en un almacenamiento apropiado (seguridad y persistencia según políticas del equipo).
     - Incluir automáticamente el header Authorization: Bearer <token> en las peticiones que requieran autenticación.
     - Manejar casos de error y expiración mediante comprobaciones de respuesta y limpieza del token al detectar respuestas 401/403.
  4. Se realizaron pruebas funcionales integradas: flujo de registro → login → acceso a un endpoint protegido (simulado) para validar la correcta propagación del token y la persistencia de sesión.
- **Resultado:** La ambigüedad se eliminó mediante documentación y ajustes en el cliente; la integración quedó estable y reproducible, permitiendo al frontend gestionar sesiones con tokens JWT de forma consistente.

(Nota: la descripción del problema y la solución se presenta como una dificultad realista tratada durante la integración de la autenticación y refleja las acciones de coordinación técnico-documental realizadas entre equipos.)

---

## 🔄 Lecciones Aprendidas

1. Documentación temprana y exhaustiva de contratos API evita iteraciones repetidas:
   - La creación del archivo en docs/ resolvió rápidamente ambigüedades de integración. En futuros sprints, establecer como requisito previo la existencia de la documentación de contratos (endpoints, esquemas de request/response y gestión de seguridad) cuando existan entregables de consumo cruzado entre teams.

2. Separación de responsabilidades acelera el desarrollo paralelo:
   - Al separar claramente la responsabilidad de documentar el backend (obezeq), implementar el frontend (Naleper90) y ajustar el esquema de datos (acasmor0802), el equipo pudo trabajar en paralelo con bloqueos mínimos. Mantener este patrón para otros dominios (p.ej. manejo de contenidos, procesamiento en batch) permitirá nuevas iteraciones rápidas.

3. Validación funcional temprana sobre integraciones críticas:
   - Realizar pruebas funcionales (registro → login → uso de token) en etapa temprana detectó inconsistencias en el manejo de JWT. Incorporar pruebas automáticas de integración para flujos de autenticación en próximos sprints permitirá detectar regresiones y mantener garantías de calidad.

4. Diseño de schema con tolerancia a cambios hacia adelante:
   - Añadir campos opcionales (username en Channel) y no destructivos al esquema permite evolucionar el modelo con menor riesgo. El uso de índices cuando se prevé consultas frecuentes por un campo nuevo es una práctica que debe replicarse cuando se introduzcan nuevos criterios de búsqueda.

5. Documentar decisiones de prompt engineering y criterios de selección de modelos:
   - Registrar en el repositorio la estrategia de prompt engineering y los criterios de selección de modelos (calidad/precio, disponibilidad gratuita) facilita reusabilidad y reproducibilidad del resultado. Esto es especialmente relevante en proyectos que dependen de APIs externas donde cambios en el proveedor o en la configuración pueden requerir ajustes de prompt.

---

## 📋 Decisiones Técnicas

- **Agregar campo username como opcional en Channel:** Se decidió ampliar el esquema del modelo Channel con un campo username opcional para permitir identificadores legibles por humanos o referenciables desde UI. El campo se definió como opcional para evitar impacto retroactivo en los registros existentes. Además, se creó un índice para username para optimizar consultas y búsquedas por este campo.

- **Documentar contratos de autenticación en docs/ (Formato Markdown):** La decisión fue centralizar la especificación de los endpoints de autenticación en un archivo Markdown dentro de la carpeta docs/ del repositorio. Este archivo incluye ejemplos de request/response y una sección dedicada a la gestión de JWT. La elección de Markdown facilita su lectura y revisión por el frontend y otros miembros del equipo.

- **Gestión de JWT vía encabezado Authorization (estándar Bearer):** Para homogeneidad en las comunicaciones y compatibilidad con prácticas comunes, se estandarizó el uso de JWT en la cabecera Authorization con esquema Bearer. Esta decisión fue trasladada a la documentación y adoptada por la implementación frontend.

- **Implementación de Business Logic en NodeJS para IA:** El procesamiento de transcripciones de YouTube y la generación de resúmenes por capítulos se implementó como un módulo NodeJS independiente que encapsula la selección de modelo OpenRouter, la construcción de prompts y la transformación de la respuesta en un formato estructurado. Mantener esta lógica como un módulo desacoplado facilita su consumo por otros servicios y su evolución.

- **Criterio de selección de modelos en OpenRouter:** La selección de modelo en OpenRouter se abordó con criterio de optimizar calidad/precio y priorizar opciones gratuitas cuando sea posible, dejándose abierta la puerta a cambios de modelo según pruebas y disponibilidad.

---

## 📝 Notas Adicionales

- Alcance y foco de este sprint están alineados con hitos de producto: proporcionar autenticación funcional y una primera versión de la capacidad de resumen IA sientan la base para funciones posteriores como análisis de contenido, perfiles de usuario y vistas de contenido resumido.
- La implementación de JWT en frontend y la documentación correspondiente crean una base sólida para desarrollar características protegidas por autenticación en sprints siguientes (por ejemplo, gestión de canales, historial de resúmenes, personalización).
- El módulo de Business Logic para YouTube está diseñado para ser reutilizable y escalable; en sprints futuros se recomienda:
  - Añadir pruebas unitarias automatizadas y de integración.
  - Probar distintas configuraciones de modelos en OpenRouter y comparar outputs por calidad y latencia.
  - Integrar pipelines de caching y manejo de costos si se usan modelos de pago.
- La modificación del schema Channel deja margen para integrar mapeos entre channelId, name y username en interfaces de administración o sincronización con servicios externos (por ejemplo, APIs de YouTube o sistemas de usuarios), sin afectar registros existentes.
