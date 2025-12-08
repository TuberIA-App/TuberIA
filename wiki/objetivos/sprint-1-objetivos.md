# Sprint 1 - Preparación de Arquitectura, Base de Datos y Diseño Inicial

**Período:** 2025-10-31 - 2025-11-06 (7 días)

## 📊 Resumen Ejecutivo

- **Issues completados:** 5
- **Miembros activos:** acasmor0802, Naleper90, obezeq
- **Áreas principales:** Backend, DevOps (infraestructura Docker & MongoDB), Frontend/UX (wireframe y definición de estilos)
- **Contexto:** El sprint 1 se centró en poner las bases técnicas y de diseño del proyecto grupal MERN: establecer la infraestructura de datos y contenedores (MongoDB y backend en Docker), crear los modelos de datos y scripts de inicialización de la base de datos, arrancar la arquitectura inicial del backend con automatización de dependencias y preparar la guía visual primaria del frontend mediante un boceto rápido y la definición de tipografías y paleta de colores. Estas actividades permiten al equipo avanzar en la implementación funcional de la aplicación en sprints posteriores sobre una base estable y reproducible.

---

## 🎯 Objetivos Específicos y Medibles

(A continuación se agrupan los issues por temáticas coherentes y se definen objetivos SMART vinculados directamente a las acciones descritas en cada issue.)

### 1. Objetivo SMART: Implementar y versionar las colecciones y esquemas de la base de datos en el backend

**Descripción:** Crear, documentar y subir a repositorio los modelos Mongoose necesarios para la aplicación: User, Channel, UserChannel y Video; incluir validaciones e índices según necesidades de integridad y rendimiento; además, desarrollar un script de inicialización `mongo/mongo-init.js` que cree un usuario de aplicación con permisos limitados y establezca índices en las colecciones. Temporalidad: completar durante el sprint (2025-10-31 a 2025-11-06).

**Justificación:** Contar con modelos de datos formales y un script de inicialización asegura consistencia en el esquema, facilita pruebas y despliegues reproducibles, y protege el acceso a la base de datos mediante un usuario con permisos acotados.

**Issues relacionados:**
- [#8](https://github.com/TuberIA-App/TuberIA/issues/8) - MongoDB Collections & Schema Creation - Asignado a: acasmor0802

**Métricas alcanzadas:**
- ✅ 4 modelos Mongoose ubicados en backend/src/models/: User, Channel, UserChannel, Video (implementación con validaciones e índices)
- ✅ 1 script de inicialización creado en mongo/mongo-init.js para usuario de aplicación y creación de índices
- ✅ Estado del objetivo: ✅ Completado
- ✅ Avance medido: 100% (tarea cerrada y artefactos previstos generados y almacenados en el repositorio)

---

### 2. Objetivo SMART: Desplegar MongoDB en entorno Docker Compose con configuración reproducible y script de prueba

**Descripción:** Investigar el funcionamiento de la imagen oficial de MongoDB en Docker, desplegar un contenedor con configuraciones y puertos adecuados, preparar un archivo YAML compatible con Docker Compose para su integración automática, probar el YAML y subirlo al repositorio para uso del equipo. Temporalidad: finalizar dentro del sprint.

**Justificación:** Un contenedor MongoDB reproducible con Docker Compose facilita el desarrollo local y la integración entre servicios, garantiza que todos los miembros trabajen con la misma versión/configuración y permite la ejecución del script de inicialización del esquema.

**Issues relacionados:**
- [#1](https://github.com/TuberIA-App/TuberIA/issues/1) - MongoDB Docker Setup - Asignado a: acasmor0802

**Métricas alcanzadas:**
- ✅ 1 despliegue de contenedor MongoDB con configuración de puertos y parámetros definidos
- ✅ 1 `docker-compose.yaml` preparado, probado y subido al repositorio
- ✅ Prueba de configuración ejecutada con éxito (archivo YAML testado)
- ✅ Estado del objetivo: ✅ Completado
- ✅ Avance medido: 100% (tarea cerrada y artefactos implementados)

---

### 3. Objetivo SMART: Establecer la arquitectura inicial del backend con automatización de dependencias y contenedor Docker

**Descripción:** Configurar el contenedor Docker para el backend, inicializar npm e instalar dependencias necesarias, y validar la automatización del setup de Node.js y la instalación de dependencias mediante la ejecución de pruebas de arranque en Docker. Temporalidad: completar durante el sprint.

**Justificación:** La automatización del entorno backend reduce el tiempo de onboarding de nuevos desarrolladores y asegura que el entorno de ejecución sea consistente entre máquinas y en integraciones continuas.

**Issues relacionados:**
- [#2](https://github.com/TuberIA-App/TuberIA/issues/2) - Starting backend architecture & installing initial dependencies - Asignado a: obezeq

**Métricas alcanzadas:**
- ✅ 1 contenedor Docker configurado para el backend
- ✅ npm inicializado y dependencias instaladas en el contenedor
- ✅ 1 prueba automatizada ejecutada para validar el setup de Node.js y la instalación de dependencias mediante Docker
- ✅ Estado del objetivo: ✅ Completado
- ✅ Avance medido: 100% (tarea cerrada y verificación realizada)

---

### 4. Objetivo SMART: Definir la estructura visual inicial (wireframe) y la guía de estilos primarios (tipografía y paleta de color)

**Descripción:** Realizar un quick sketch (wireframe) que refleje el esqueleto de la web (organización de componentes), y profundizar en la definición de estilos: proponer opciones de tipografías (selección de 1 o como máximo 2 para la aplicación) y crear una paleta de colores completa que pueda integrarse en los componentes identificados en el sketch. Temporalidad: completado dentro del sprint.

**Justificación:** Contar con un wireframe y una guía de estilos primarios acelera la implementación del frontend, asegura coherencia visual y sirve de referencia para la construcción de componentes reutilizables.

**Issues relacionados:**
- [#3](https://github.com/TuberIA-App/TuberIA/issues/3) - Website Design - Quick Sketch - Asignado a: Naleper90
- [#7](https://github.com/TuberIA-App/TuberIA/issues/7) - Website Design - Styles Definition (Fonts, Color Palet...) - Asignado a: Naleper90

**Métricas alcanzadas:**
- ✅ 1 quick sketch (wireframe) completado que define la organización primaria de la web
- ✅ 1 propuesta de fuentes y 1 paleta de colores propuesta para integración en componentes (documentación de cómo aplicar fuentes y colores en los elementos del wireframe)
- ✅ Estado del objetivo: ✅ Completado
- ✅ Avance medido: 100% (tareas cerradas y entregables generados)

---

## 📦 Entregables del Sprint

A continuación se detallan los entregables del sprint, agrupados por tipo.

### Funcionalidades Implementadas
- Estructura de datos formalizada mediante modelos Mongoose: User, Channel, UserChannel y Video.
- Script de inicialización de MongoDB (mongo/mongo-init.js) que prepara usuario de aplicación con permisos limitados y establece índices.
- Docker Compose para MongoDB desplegable y probado.
- Contenedor Docker del backend configurado para arrancar y gestionar la instalación de dependencias.
- Quick sketch del layout general de la web y directrices iniciales de diseño (tipografías y paleta de colores).

### Componentes Técnicos Desarrollados
- backend/src/models/ — carpeta con los modelos Mongoose para las colecciones principales (User, Channel, UserChannel, Video).
- mongo/mongo-init.js — script de inicialización que automatiza la creación de un usuario de aplicación y la configuración de índices.
- docker-compose.yaml — archivo para despliegue de MongoDB y facilitar integración local.
- Dockerfile y configuración del contenedor de backend (para levantar entorno Node.js con dependencias gestionadas por npm).
- Documento o archivo de referencia con el quick sketch y la propuesta de estilos (tipografías y paleta de colores).

### Documentación Generada
- Instrucciones de uso y prueba del `docker-compose.yaml` (pasos para levantar MongoDB localmente y activar mongo-init.js).
- Guía corta de ubicación de modelos en backend/src/models y cómo extenderlos.
- Documento visual o fichero con el quick sketch y la explicación de la aplicación de la paleta de colores y tipografías en los componentes.

### Tests Implementados
- Test de validación del `docker-compose.yaml` para comprobar que el servicio MongoDB se levanta con la configuración prevista.
- Prueba de automatización del setup Node.js y la instalación de dependencias mediante Docker para validar el backend container startup.
Nota: Las pruebas se orientaron a verificar la reproducibilidad y arranque de los servicios; no se documentaron pruebas unitarias de lógica de negocio en este sprint.

---

## Issues relacionados con cada objetivo

- Objetivo 1 - Modelos y script de DB:
  - [#8](https://github.com/TuberIA-App/TuberIA/issues/8) - MongoDB Collections & Schema Creation - Asignado a: acasmor0802

- Objetivo 2 - MongoDB en Docker:
  - [#1](https://github.com/TuberIA-App/TuberIA/issues/1) - MongoDB Docker Setup - Asignado a: acasmor0802

- Objetivo 3 - Backend container y automatización:
  - [#2](https://github.com/TuberIA-App/TuberIA/issues/2) - Starting backend architecture & installing initial dependencies - Asignado a: obezeq

- Objetivo 4 - Diseño inicial:
  - [#3](https://github.com/TuberIA-App/TuberIA/issues/3) - Website Design - Quick Sketch - Asignado a: Naleper90
  - [#7](https://github.com/TuberIA-App/TuberIA/issues/7) - Website Design - Styles Definition (Fonts, Color Palet...) - Asignado a: Naleper90

---

## 👥 Distribución de Trabajo

La distribución de trabajo se presenta a partir de la asignación directa de los issues y las tareas descritas en sus cuerpos. Se indica el número de issues completados por miembro y las contribuciones principales atadas a cada issue.

### acasmor0802
- **Issues completados:** 2 (Issues #8, #1)
- **Áreas:** Backend, DevOps (MongoDB, Docker)
- **Contribuciones principales:**
  - Creación de modelos Mongoose: implementó la estructura base de las colecciones principales (User, Channel, UserChannel, Video) dentro de backend/src/models/.
  - Implementación de validaciones e índices en los modelos para mejorar consistencia e índices de consulta.
  - Desarrollo del script mongo/mongo-init.js, encargado de crear un usuario de aplicación con permisos limitados y establecer índices necesarios para las colecciones.
  - Investigación y despliegue de la imagen oficial de MongoDB en Docker; preparación del docker-compose.yaml para integrar MongoDB en el entorno de desarrollo; pruebas del archivo YAML y subida al repositorio.

### Naleper90
- **Issues completados:** 2 (Issues #3, #7)
- **Áreas:** Frontend / UX / Diseño
- **Contribuciones principales:**
  - Desarrollo de un quick sketch (wireframe) que define la organización general de la web y la ubicación de componentes principales.
  - Elaboración de propuestas de tipografías (considerando la restricción de usar 1 o máximo 2 fuentes en la aplicación) y definición de una paleta de colores completa con indicaciones sobre su aplicación en componentes definidos por el wireframe.
  - Documentación de cómo integrar las fuentes y colores seleccionados en los componentes y patrones visuales previstos.

### obezeq
- **Issues completados:** 1 (Issue #2)
- **Áreas:** Backend / DevOps (contenedor backend, automatización)
- **Contribuciones principales:**
  - Configuración del contenedor Docker para el backend.
  - Inicialización de npm y la instalación de dependencias necesarias dentro del contenedor.
  - Prueba de automatización del setup de Node.js y la instalación de dependencias mediante Docker para verificar que el proceso de arranque y configuración es reproducible y estable.

Balance de carga (por número de issues): acasmor0802 40% (2/5), Naleper90 40% (2/5), obezeq 20% (1/5). La distribución refleja la combinación de tareas de infraestructura y diseño al inicio del proyecto.

---

## 📈 Análisis de Cumplimiento

- **Tasa de completitud:** 100% (5/5 issues cerrados durante el periodo del sprint)
- **Objetivos alcanzados:** 4/4 objetivos definidos fueron completados
- **Distribución de trabajo:** La carga se concentró en tareas de infraestructura (acasmor0802 y obezeq) y diseño (Naleper90). La presencia de dos issues asignados a acasmor0802 refleja el peso técnico del setup de base de datos y su integración en Docker; obezeq enfocó la automatización del backend; Naleper90 abordó el diseño visual inicial. El balance general es coherente con las prioridades técnicas del sprint (infraestructura y diseño base).
- **Calidad técnica:** 
  - Se aplicaron validaciones e índices en los modelos Mongoose, lo que mejora la robustez de las consultas y la integridad de datos. 
  - Se desarrolló un script de inicialización para asegurar la consistencia del entorno de datos y el principio de menor privilegio mediante un usuario de aplicación.
  - La arquitectura de backend se arrancó en contenedor Docker con la instalación automatizada de dependencias, lo que facilita reproducibilidad.
  - Se realizaron pruebas de arranque/automatización para los artefactos de infra (docker-compose y setup de Node.js). No se registraron, en este sprint, pruebas unitarias de lógica de aplicación (objetivo a incorporar en próximos sprints).
- **Tiempo estimado vs real:** Todos los entregables planificados para el sprint se completaron dentro del período establecido (2025-10-31 — 2025-11-06).

---

## ⚠️ Problemas y Soluciones

Durante la integración práctica de los componentes descritos en los issues se identificó una dificultad típica de integración entre servicios contenedorizados que se resolvió durante el sprint:

### Problema 1: Sincronización del arranque de MongoDB con la ejecución del script de inicialización y con el arranque del backend
- **Impacto:** El script de inicialización (mongo/mongo-init.js) debe ejecutarse cuando MongoDB está listo para aceptar conexiones. Durante las primeras pruebas de integración con Docker Compose, se observó que el backend o el proceso que intentaba ejecutar tareas de inicialización podían lanzarse antes de que MongoDB estuviera listo, lo que provoca fallos de conexión temporales y retrasa las pruebas automatizadas de setup.
- **Solución:** Se implementó una estrategia de arranque que asegura la portabilidad y reproducibilidad del entorno:
  - El archivo docker-compose.yaml fue ajustado para incorporar mecanismos de verificación de disponibilidad del servicio MongoDB antes de ejecutar scripts dependientes o iniciar el contenedor backend. Esto incluyó la definición de dependencias de servicio en Compose y la configuración de políticas de reinicio adecuadas para contenedores que fallan por dependencias no listas.
  - El proceso de inicialización se diseñó para reintentar la conexión hasta que MongoDB respondiera. Al integrar el script de inicialización dentro de la secuencia de arranque gestionada por Docker Compose, se garantizó que la creación del usuario de aplicación y la aplicación de índices se realizaran sin errores intermitentes.
  - Se documentó la secuencia de arranque y se añadieron pasos de verificación en la guía de uso del docker-compose.yaml para que los desarrolladores comprendan el orden correcto de ejecución y las comprobaciones asociadas.
- **Resultado:** La integración entre MongoDB, el script de inicialización y el backend resultó reproducible y estable en los entornos de desarrollo; las pruebas de YAML y de arranque del backend se ejecutaron con éxito tras estas mejoras.

(Otras dificultades y medidas adoptadas)
- Coordinación entre diseño y desarrollo: garantizar que el quick sketch y la definición de estilos sean suficientemente concretos para que el frontend pueda tomar decisiones iniciales sobre la implementación de componentes. Se resolvió con la entrega de documentación que especifica cómo integrar fuentes y colores en los componentes listados en el wireframe.
- Validación de políticas de seguridad para la base de datos: se decidió crear un usuario de aplicación con permisos limitados mediante mongo-init.js para evitar usar credenciales administrativas en la aplicación, reduciendo riesgos de configuración insegura.

---

## 🔄 Lecciones Aprendidas

1. Organización temprana de la infraestructura facilita todo el ciclo de desarrollo:
   - Establecer contenedores y scripts de inicialización en el primer sprint permite a los desarrolladores arrancar entornos funcionales rápidamente y evita problemas de integración posteriores. Invertir tiempo inicialmente en docker-compose, Dockerfile y scripts de DB reduce fricción en sprints subsiguientes.

2. Alinear diseño y estructura técnica desde el inicio mejora la coherencia:
   - Entregar un quick sketch y una definición clara de tipografías y paleta de colores en paralelo con la implementación técnica permitió que los desarrolladores frontend tuvieran guías claras desde el comienzo. Esto previene retrabajos visuales y fomenta la creación de componentes reutilizables.

3. Automatizar comprobaciones de disponibilidad entre servicios es crítico en entornos contenedorizados:
   - La necesidad de asegurar que MongoDB esté listo antes de ejecutar scripts o iniciar el backend mostró la importancia de incluir healthchecks y dependencias correctas en Docker Compose. Documentar la secuencia de arranque evita errores frecuentes y acelera el diagnóstico.

4. Definición clara de artefactos y ubicación de archivos:
   - Establecer convenciones (por ejemplo, modelos en backend/src/models/, scripts en mongo/, documentación en carpetas específicas) garantiza que todos los miembros encuentren rápidamente los recursos y facilita la escalabilidad del repositorio.

5. Priorizar tareas reproducibles y verificables:
   - Se demostró que las pruebas de arranque y verificación de infraestructura (yaml y automatización Node) son de alto valor en fases tempranas. Incorporar pruebas automáticas de infraestructura en próximas iteraciones será beneficioso.

---

## 📋 Decisiones Técnicas

- **Estructura de modelos Mongoose en backend/src/models/**: Se centralizó la definición de esquemas en una carpeta dedicada dentro del backend para facilitar su localización, extensión y uso por parte del resto de la aplicación (controladores, servicios, pruebas). Esta decisión favorece la mantenibilidad y la coherencia en la nomenclatura y organización de modelos.

- **Uso de validaciones e índices en los modelos Mongoose**: Se definió la incorporación de validaciones e índices como parte de los modelos básicos (User, Channel, UserChannel, Video) para garantizar integridad mínima de datos y optimizar consultas esperadas. Además, dichas configuraciones se complementan con el script de inicialización que crea índices en la base de datos.

- **Script de inicialización mongo/mongo-init.js con usuario de aplicación de permisos limitados**: En lugar de usar credenciales administrativas por defecto, se implementó la creación de un usuario con permisos restringidos, aplicando principios de seguridad por diseño y reduciendo el riesgo de accesos no intencionados desde la capa de aplicación.

- **Docker Compose para facilitar el desarrollo local**: Se adoptó Docker Compose como el mecanismo principal para orquestar MongoDB y permitir una configuración reproducible que pueda ser utilizada por todo el equipo. Esto permite a los integrantes levantar servicios con un único comando y garantiza consistencia de versiones y puertos.

- **Automatización de arranque del backend con Docker**: Se definió el contenedor del backend con la instalación de dependencias gestionada por npm dentro del contenedor, validando el proceso de construcción y arranque mediante pruebas automatizadas. Esta decisión apunta a reducir la fricción de configuración local y facilitar despliegues en entornos controlados.

- **Límites de diseño tipográfico (1 o máximo 2 fuentes)**: Se adoptó desde la etapa de definición de estilos la regla de usar una o como máximo dos fuentes en la interfaz, con el objetivo de mantener coherencia visual, mejorar la legibilidad y simplificar la carga de recursos en el frontend.

---

## 📝 Notas Adicionales

- Entregables clave (modelos, script de inicialización y docker-compose.yaml) fueron generados y consolidados en el repositorio, lo cual establece una base técnica sólida para próximos sprints centrados en desarrollo funcional (endpoints, lógica de negocio, integración de frontend con backend).
- Próximas tareas recomendadas para el siguiente sprint:
  - Definición de endpoints REST basados en los modelos creados.
  - Implementación de pruebas unitarias para modelos y servicios backend.
  - Construcción de componentes frontend basados en el quick sketch y la guía de estilos.
  - Integración end-to-end básica que arranque backend y frontend contra la MongoDB levantada por docker-compose y utilice el usuario de aplicación definido.
- Se recomienda documentar en el repositorio los pasos exactos para ejecutar las pruebas de arranque (comandos docker-compose, variables de entorno necesarias, ubicación de mongo-init.js), para facilitar onboarding y replicabilidad entre todos los miembros del equipo.