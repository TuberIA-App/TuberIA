# Sprint 4 - Integración de UI autenticada y estabilización del backend

**Período:** 2025-11-21 - 2025-11-27 (7 días)

## 📊 Resumen Ejecutivo

- **Issues completados:** 5
- **Miembros activos:** Naleper90, obezeq, acasmor0802
- **Áreas principales:** Frontend (UI y experiencia autenticada), Backend (features de búsqueda y estabilidad), DevOps/Despliegue (corrección de automatización Docker)
- **Contexto:** Este sprint tuvo un enfoque claro y acotado: integrar la experiencia de usuario autenticada en el frontend (componentes de layout y rutas protegidas, incluyendo dashboard y página de búsqueda de canales), complementar el backend con una funcionalidad de búsqueda de canales de YouTube por nombre o URL que entregue datos relevantes para presentación en la UI, y corregir un fallo crítico en la automatización del backend relacionado con la instalación de dependencias y la preparación de archivos Docker para despliegue. En conjunto, las tareas se orientaron a estabilizar la base de plataforma (infraestructura y API) y a habilitar las vistas y componentes que dependen de la autenticación (dashboard, header/footer, y buscador de canales), para permitir iteraciones posteriores con integración completa.

---

## 🎯 Objetivos Específicos y Medibles

### 1. Frontend: Implementar dashboard principal protegido en la ruta raíz (/)

**Descripción:**  
Implementar e integrar el dashboard principal de la aplicación en la ruta raíz (/) de la interfaz web de manera que el dashboard sustituya a la home page únicamente cuando exista una sesión iniciada. El control de sesión debe validar la presencia de un access JWT válido; si el access token ha expirado, debe intentar obtener un nuevo token mediante el flujo de refresh token; si el refresh token también ha expirado, la sesión deberá cerrarse y el usuario deberá ser redirigido a la home page pública.

**Justificación:**  
Proporcionar una experiencia de entrada inmediata al contenido principal para usuarios autenticados reduce fricción y asegura que los usuarios con sesión activa accedan directamente a las funcionalidades relevantes sin navegar manualmente. Además, gestionar correctamente la expiración de tokens y los intentos de refresh mantiene la seguridad y continuidad de la sesión sin obligar a reautenticación innecesaria.

**Issues relacionados:**
- [#44](https://github.com/TuberIA-App/TuberIA/issues/44) - Frontend Dashboard Implementation - Asignado a: Naleper90

**Métricas alcanzadas:**
- ✅ 1/1: Dashboard integrado en la ruta raíz (/) y condicionado a la existencia de sesión activa.  
- ✅ 1/1: Lógica de validación de access JWT añadida para mostrar o no el dashboard.  
- ✅ 1/1: Flujo de intento de refresh token implementado como mecanismo de continuidad de sesión; acción de cierre de sesión y redirección a home cuando el refresh token también ha expirado.

**Estado:** ✅ Completado

Análisis adicional: la implementación del dashboard en la ruta raíz implica que la aplicación ahora distingue de forma determinística entre una home pública y una vista personalizada para usuarios autenticados. El criterio de aceptación para este objetivo —sustituir la home page por el dashboard cuando exista sesión válida y manejar el refresh/cierre de sesión cuando corresponda— ha sido cumplido según el cierre del issue asignado.

---

### 2. Frontend: Integración global de header y footer en vistas autenticadas

**Descripción:**  
Diseñar, crear e integrar componentes de header y footer que se muestren en todas las vistas accesibles tras iniciar sesión. Asegurar que los componentes sean reutilizables, correctos en estilos y funcionalidad y que las rutas vinculadas en el header conduzcan a las páginas previstas, incluidas rutas planeadas a futuro.

**Justificación:**  
Un header y footer consistentes en vistas autenticadas proporcionan navegación estable y previsibilidad en la experiencia de usuario, además de centralizar elementos de navegación y estados de sesión (por ejemplo, enlaces a dashboard, canales, perfil). Esto facilita el desarrollo incremental de nuevas vistas que reutilicen la misma estructura de layout.

**Issues relacionados:**
- [#43](https://github.com/TuberIA-App/TuberIA/issues/43) - Frontend Header & Footer Implementation - Asignado a: Naleper90

**Métricas alcanzadas:**
- ✅ 1/1: Componentes de header y footer creados y verificados para su presentación en vistas autenticadas.  
- ✅ 1/1: Integración de los componentes mediante composición en páginas protegidas tras inicio de sesión.  
- ✅ 1/1: Rutas desde el header configuradas para navegar a los destinos actuales y preparadas para futuras rutas.

**Estado:** ✅ Completado

Análisis adicional: la entrega asegura la consistencia de la navegación una vez iniciada la sesión. La verificación consistió en asegurar que los componentes rendericen correctamente y que las rutas en el header ejecuten navegación hacia los destinos configurados dentro de la aplicación.

---

### 3. Frontend: Página de búsqueda de canales (UI y estilos, sin integración backend)

**Descripción:**  
Desarrollar la página de búsqueda de canales en la ruta /channels con diseño y componentes que muestren listas de canales (todos los canales y canales seguidos), funcionalidad de seguir/no seguir mediante controles de UI, y barra de búsqueda para buscar nuevos canales. Esta tarea comprende exclusivamente la parte visual y de componentes sin integración con el backend. Mantener la protección de rutas y visibilidad de la página solo para sesiones autenticadas.

**Justificación:**  
Contar con la página y sus componentes listos permite avanzar en paralelo con la integración del backend y facilita pruebas de interacción, estilos y comportamiento de la UI. Separar la implementación visual de la integración de servicios posibilita iteraciones más ágiles y reduce dependencias entre equipos.

**Issues relacionados:**
- [#34](https://github.com/TuberIA-App/TuberIA/issues/34) - Frontend Search Channel Page (without backend integration) - Asignado a: acasmor0802

**Métricas alcanzadas:**
- ✅ 1/1: Página /channels creada con componentes y estilos.  
- ✅ 1/1: Interfaces para listas de canales (todos y seguidos) implementadas en UI.  
- ✅ 1/1: Controles de seguir/no seguir y barra de búsqueda implementados en la parte visual.  
- ✅ 1/1: Página asegurada mediante rutas protegidas y preparada para recibir datos cuando se integre el backend.

**Estado:** ✅ Completado

Análisis adicional: la página está lista para recibir datos de servicios y para integrarse posteriormente con la funcionalidad de búsqueda y seguimiento real. La preparación de la ruta protegida reduce trabajo de integración posterior, ya que la gestión de visualización basada en sesión está en su lugar.

---

### 4. Backend: Integrar servicios para búsqueda de canal de YouTube por username o URL y exponer información relevante

**Descripción:**  
Integrar en la API los servicios existentes encargados de extraer el ID de canal de YouTube (YouTube Channel ID extractor) y de extraer el feed a partir del Channel ID (YouTube Feed Extractor). Cuando un canal sea encontrado, la API debe devolver información relevante para el frontend: nombre (name), miniatura (thumbnail), descripción (description), número de seguidores (followersCount) y cualquier otra información de interés para mostrar en la UI.

**Justificación:**  
Permitir que el frontend obtenga datos ricos de canales de YouTube posibilita funcionalidades de descubrimiento y seguimiento dentro de la aplicación. Integrar los servicios de extracción facilita la presentación coherente de información y habilita futuras operaciones como seguimiento, análisis o visualización de contenido de canales.

**Issues relacionados:**
- [#40](https://github.com/TuberIA-App/TuberIA/issues/40) - Backend - Search YouTube channel from username or url - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ 1/1: Integración de servicios para obtener Channel ID a partir de username/URL y extraer feed.  
- ✅ 1/1: API preparada para devolver campos clave: name, thumbnail, description, followersCount (u otros campos relevantes).

**Estado:** ✅ Completado

Análisis adicional: la integración de estos servicios convierte solicitudes de búsqueda por nombre o URL en respuestas con datos consistentes para la UI. La API ahora actúa como capa de orquestación entre extractores y la interfaz, devolviendo un paquete de metadatos que permite mostrar tarjetas de canal y listados en el frontend.

---

### 5. DevOps / Backend: Corregir automatización de instalación de dependencias y preparar despliegues Docker

**Descripción:**  
Resolver el error que provoca que en el contenedor tuberia-backend no se instalen automáticamente los módulos al ejecutar docker-compose up -d. Implementar correcciones para que la API del backend funcione correctamente, y crear los archivos Docker necesarios para producción y para desarrollo (se mantendrá el actual para dev), además de asegurar el proceso de despliegue.

**Justificación:**  
La falta de instalación automatizada de dependencias impide el arranque consistente del contenedor backend y pone en riesgo el despliegue de la API. Asegurar la automatización de instalación y disponer de Dockerfiles/compose apropiados para entornos de desarrollo y producción garantiza reproducibilidad y reduce la carga operativa al desplegar nuevas versiones.

**Issues relacionados:**
- [#35](https://github.com/TuberIA-App/TuberIA/issues/35) - Backend - FIX Automation & Prepare Deployment - Asignado a: obezeq (etiqueta: bug)

**Métricas alcanzadas:**
- ✅ 1/1: Identificación y corrección del fallo que impedía la instalación automática de módulos en tuberia-backend.  
- ✅ 1/1: Generación de archivos Docker para producción y confirmación de la existencia de archivos para desarrollo (actual).  
- ✅ 1/1: Asegurado el flujo de despliegue para la API del backend.

**Estado:** ✅ Completado

Análisis adicional: la corrección de la automatización es crítica para la estabilidad operacional. Con la creación/ajuste de archivos Docker para los entornos pertinentes, el equipo reduce el riesgo de fallos por discrepancias en entornos y facilita la puesta en marcha de la API.

---

## 📦 Entregables del Sprint

Este sprint entregó un conjunto coherente de funcionalidades orientadas a la experiencia autenticada, capacidades de búsqueda y estabilidad del backend.

### Funcionalidades Implementadas
- Dashboard principal integrado en la ruta raíz y mostrado solo para sesiones autenticadas (incluye gestión básica de expiración de access JWT y flujo de refresh token).
- Header y footer integrados en las vistas tras iniciar sesión, con navegación configurada hacia las rutas actuales y preparada para futuras rutas.
- Página de búsqueda de canales en /channels con interfaz para listar canales (todos y seguidos), controles de seguir/no seguir y barra de búsqueda (implementación UI-only).
- Endpoint/backend orquestador para búsqueda de canales de YouTube a partir de username o URL que devuelve metadatos relevantes (name, thumbnail, description, followersCount, etc.).
- Corrección de automatización en el contenedor tuberia-backend y archivos Docker generados/preparados para producción y para el entorno de desarrollo.

### Componentes Técnicos Desarrollados
- Componente Dashboard con lógica condicional de renderizado según sesión/JWT.
- Componentes de Layout: Header y Footer reutilizables para vistas autenticadas.
- Página y componentes de UI para /channels: lista de canales, elementos de canal con controles de seguimiento, barra de búsqueda.
- Servicios backend integrados que combinan Channel ID extractor y Feed extractor para construir la respuesta de búsqueda de canal.
- Archivos Docker (para producción y/o ajustes en los existentes) y mejora de la automatización de instalación de dependencias del backend.

### Documentación Generada
- Documentación operativa y notas de corrección relacionadas con la automatización del backend y la preparación de despliegue (documentación técnica de la corrección y de los archivos Docker generados).
- Documentación de uso y verificación de los componentes de frontend (instrucciones de integración de header/footer y de la página de canales) para desarrolladores del equipo.
Nota: Los issues describen el trabajo realizado y las acciones esperadas; los entregables se corresponden con las integraciones y componentes efectivamente creados durante el sprint.

### Tests Implementados
- Se realizan tests automatizados en cada funcionalidad del backend como siempre. En cada parte del backend.
- Se ha mantenido el desarrollo de tests unitarios, y de cualquier tipo en el backend y documentado con todas sus referencias de backend para que el equipo de frontend pueda obtener información facil sin tener que consultar el código del backend.

---

## 👥 Distribución de Trabajo

La asignación y contribución durante el sprint estuvo distribuida en función de los issues asignados.

### Naleper90
- **Issues completados:** #44, #43 (2 issues)
- **Áreas:** Frontend (UI, autenticación, layout)
- **Contribuciones principales:**
  - Integración del dashboard principal en la ruta raíz con lógica para mostrarlo solo en sesiones autenticadas.
  - Implementación de la lógica relacionada con la validación del access JWT y el intento de refresh token; definición de comportamiento de cierre de sesión y redirección a home cuando procede.
  - Diseño, creación y verificación de componentes de Header y Footer destinados a las vistas autenticadas.
  - Integración de header/footer en las páginas protegidas y configuración de navegación desde el header hacia rutas previstas.

Análisis de carga: Naleper90 asumió la totalidad de las tareas relacionadas con layout y gestión de vistas autenticadas, realizando dos entregables completos (dashboard y header/footer).

### obezeq
- **Issues completados:** #40, #35 (2 issues)
- **Áreas:** Backend, DevOps
- **Contribuciones principales:**
  - Integración de servicios para búsqueda de canal de YouTube: orquestación del extractor de Channel ID y del extractor de feed para devolver datos de canal útiles para el frontend (name, thumbnail, description, followersCount).
  - Identificación y corrección del bug crítico en el contenedor tuberia-backend relacionado con la no instalación automática de módulos en docker-compose up -d.
  - Preparación de archivos Docker para producción y ajuste/creación de artefactos para desarrollo, además de asegurar el flujo de despliegue para la API.

Análisis de carga: obezeq combinó tareas de feature (búsqueda) y de mantenimiento crítico de infraestructura, lo que implicó trabajo tanto de integración de servicios como de acciones operacionales para garantizar despliegue reproducible.

### acasmor0802
- **Issues completados:** #34 (1 issue)
- **Áreas:** Frontend (UI components, estilos)
- **Contribuciones principales:**
  - Desarrollo de la página de búsqueda de canales (/channels) enfocada en la parte visual: estilos, componentes, listados de canales y controles de seguimiento (sin integración backend).
  - Aseguramiento de que la página esté disponible en la ruta /channels y protegida mediante la configuración de rutas para sesiones autenticadas.

Análisis de carga: acasmor0802 se centró en la experiencia visual y de interacción de la página de canales, completando la parte de UI requerida para futuras integraciones con la API.

Balance general: la carga fue distribuida en tres miembros con dos personas cubriendo tanto backend como devops/infra y frontend core, y un miembro dedicado a la UI de búsqueda. La distribución permitió cerrar 5 issues en el periodo de 7 días con responsabilidades claras por área.

---

## 📈 Análisis de Cumplimiento

- **Tasa de completitud:** 100% (5/5 issues cerrados)
- **Objetivos alcanzados:** 5/5 objetivos definidos en el sprint completados tal como fueron planteados.
- **Distribución de trabajo:**  
  - Frontend: 3 issues (dashboard, header/footer, search page) — 2 desarrolladores (Naleper90 y acasmor0802).  
  - Backend/DevOps: 2 issues (search service, fix & deployment) — 1 desarrollador principal (obezeq).
  - La distribución reflejó concentración en frontend para experiencia autenticada y en backend para estabilidad y servicios.
- **Calidad técnica:**  
  - Se entregaron componentes reutilizables (header/footer) y páginas preparadas para integración posterior.  
  - La API incorpora orquestación de servicios de extracción de datos de canales, devolviendo campos clave para la UI.  
  - Se corrigió un fallo de automatización crítico en el entorno de backend, mejorando la confiabilidad del despliegue.  
  - No se documenta la incorporación de tests automatizados en este ciclo; esto supone una oportunidad de mejora en la cobertura de calidad.
- **Tiempo estimado vs real:**  
  - El sprint cumplió en el plazo planificado (7 días), con los cinco issues cerrados dentro del período. No se reportan desviaciones temporales en los issues cerrados.

---

## ⚠️ Problemas y Soluciones

### Problema 1: Fallo en la automatización de instalación de dependencias del backend
- **Impacto:**  
  - El contenedor tuberia-backend no instalaba los módulos automáticamente al ejecutar docker-compose up -d, lo que provocaba errores de arranque de la API del backend y prevenía un despliegue funcional y reproducible del servicio backend.
  - Este fallo afectó la capacidad de poner en marcha entornos de desarrollo y despliegue, incrementando la fricción operacional y bloqueando potencialmente integraciones que dependieran de la API estable.
- **Solución:**  
  - Se identificó y corrigió la causa de la instalación no automática de módulos en el contenedor tuberia-backend; se ajustó la automatización para que, al iniciar con docker-compose up -d, los módulos necesarios queden instalados y el servicio pueda arrancar correctamente.
  - Se añadieron/ajustaron archivos Docker orientados a producción y se mantuvieron los artefactos de desarrollo actuales, asegurando así que existen definiciones para ambos entornos.
  - Se verificó el flujo de despliegue para la API, garantizando que con las correcciones realizadas la API pueda desplegarse y ejecutarse de forma reproducible.

Este problema y la corrección asociada fueron abordados en el issue #35 (etiqueta bug), y su resolución fue prioritaria por su impacto en la capacidad de entrega y despliegue de la plataforma.

### Problema 2: Gestión de sesión y expiración de tokens en la UI (riesgo detectado y mitigado)
- **Impacto:**  
  - Sin una lógica consistente de validación de access JWT y manejo de refresh token, los usuarios con tokens expirados podrían quedar en estados inconsistentes (por ejemplo, ver home pública pese a tener sesión parcial) o experimentar errores de acceso inesperados al dashboard.
- **Solución:**  
  - Se implementó la lógica para que la ruta raíz muestre el dashboard únicamente cuando exista una sesión iniciada con un access JWT válido.  
  - En caso de expiración del access token, la UI intenta un refresh token para obtener un nuevo access token. Si el refresh también ha expirado, la sesión se cierra y el usuario es devuelto a la home pública.  
  - Estas decisiones reducen la posibilidad de estados inconsistentes y permiten una experiencia más fluida para usuarios autenticados.

Nota: Ambas tareas fueron resueltas dentro de sus respectivos issues (#44 para dashboard y #35 para la automatización del backend), permitiendo que la UI dependa de una API estabilizada y que exista un flujo de sesión robusto en el cliente.

---

## 🔄 Lecciones Aprendidas

1. Importancia de la separación entre UI y lógica de integración: desarrollar la UI de búsqueda de canales sin integración backend permitió avanzar en paralelismo y dejó preparada la ruta protegida y componentes para una integración posterior sin bloquear el avance del backend.

2. Priorizar estabilidad operativa para permitir desarrollo continuo: la corrección de la automatización en el backend fue crítica para asegurar despliegues reproducibles; los problemas de infraestructura impactan de forma transversal la capacidad de todo el equipo.

3. Implementar mecanismos de sesión robustos desde etapas tempranas: asegurar la validez del access JWT y disponer de un flujo de refresh evita estados inconsistentes en el frontend y mejora la experiencia de usuario.

4. Reutilización de componentes de layout (header/footer) mejora la consistencia y reduce trabajo futuro: centralizar el header y footer asegura que nuevas vistas autenticadas hereden navegación y comportamiento común sin duplicación.

5. Documentar cambios operacionales al realizar correcciones de despliegue: los ajustes en Docker y la automatización deben acompañarse de notas operativas claras para facilitar la replicación del entorno por otros miembros o por CI/CD.

---

## 📋 Decisiones Técnicas

- **Mostrar dashboard en / solo con sesión válida:** Se adoptó la decisión de condicionar la visualización del dashboard en la ruta raíz a la existencia de un access JWT válido, con intento de refresh y cierre de sesión en caso de expiración del refresh token. Esta estrategia prioriza la experiencia inmediata del usuario autenticado y evita mostrar contenido sensible a sesiones no autorizadas.

- **Centralizar header y footer para vistas autenticadas:** Se decidió integrar header y footer como componentes reutilizables que se instancian en todas las vistas tras iniciar sesión, manteniendo consistencia en la navegación y reduciendo trabajo duplicado al añadir nuevas rutas.

- **Separación del trabajo UI y backend para velocidad de entrega:** La página de búsqueda de canales fue implementada en la parte visual sin integración backend para permitir que tanto el equipo frontend como el backend trabajen en paralelo y con entregables parciales verificables.

- **Preparación de Docker para entornos dev y prod y corrección de automatización:** Se priorizó la creación/ajuste de archivos Docker para producción y la corrección de la instalación automática de dependencias en el contenedor tuberia-backend para garantizar despliegues reproducibles y estables.

---

## 📝 Notas Adicionales

- Alcance y priorización del sprint: las tareas priorizaron la creación de experiencia autenticada en el frontend y la estabilización del backend para soportar despliegues y futuras integraciones. La combinación de tareas de UI, feature backend y corrección infra permitió cerrar el sprint con entregables funcionales y operativamente estables.

- Recomendaciones para próximos sprints:
  - Completar la integración del frontend con el endpoint de búsqueda de canales (con la página /channels ya lista) para habilitar la experiencia completa de búsqueda y seguimiento.
  - Formalizar un procedimiento de despliegue documentado que incluya pasos de verificación post-despliegue, para asegurar que los ajustes en Docker y automatización se mantengan en CI/CD.
