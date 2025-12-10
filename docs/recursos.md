# Fase 4

## 1. Recursos humanos:

### Definid roles dentro del equipo (Frontend Lead, Backend Lead, Database Manager, etc.).

#### Website Designer

Será el responsable de definir la estructura visual y funcional de la página web mediante wireframes y prototipos de baja fidelidad.

● Diseñará la distribución de los componentes principales (menú, dashboard, área de usuario, etc.).

● Definirá el flujo de interacción del usuario, priorizando la simplicidad y la conversión.

● Supervisará la coherencia visual, la usabilidad y la consistencia entre las diferentes secciones.

● Colaborará estrechamente con el Frontend Lead para garantizar que el diseño sea técnicamente viable y fiel a la visión del producto.

#### Frontend Lead

Responsable de la implementación de la interfaz de usuario y la experiencia de usuario (UX) general del sistema.

● Desarrollará componentes reutilizables y mantenibles utilizando tecnologías modernas (React + Tailwind CSS).

● Asegurará la calidad del código, siguiendo buenas prácticas y estándares de accesibilidad web.

● Garantizará un rendimiento óptimo en la carga de la página y en la renderización de los vídeos y resúmenes.

● Se encargará de la integración visual con el backend a través de API REST, gestionando correctamente los estados y la interacción en tiempo real.

● Trabajará con el Website Designer para ajustar los diseños y validar la coherencia visual final.

#### Backend Lead

Responsable del diseño, desarrollo y mantenimiento de la lógica del servidor y la comunicación con APIs externas.

● Desarrollará la API principal del sistema utilizando Node.js, Express y servicios de integración con YouTube y modelos de IA.

● Implementará mecanismos de autenticación (JWT), control de errores y logs de rendimiento.

● Gestionará el procesamiento asíncrono de tareas mediante Redis y Bull, optimizando el flujo de transcripciones y resúmenes.

● Velará por la seguridad de los datos y la eficiencia de las operaciones con la base de datos.

● Colaborará con el Database Manager para definir esquemas y garantizar integridad y consistencia de la información.

#### Database Manager

Encargado de la gestión y administración de la base de datos MongoDB, asegurando la integridad, rendimiento y seguridad de los datos almacenados.

● Diseñará los modelos de datos para usuarios, canales, vídeos y resúmenes.

● Implementará índices y optimizaciones para acelerar las consultas más frecuentes.

● Gestionará los backups automáticos y restauraciones en caso de fallo del servidor.

● Supervisará la coherencia entre los datos del backend y las respuestas de la API de YouTube.

● Propondrá estrategias de escalabilidad y mantenimiento de datos antiguos para evitar sobrecarga del sistema.

### Asignad responsabilidades por módulos/funcionalidades.

| Módulo / Funcionalidad | Responsable principal | Colaboradores |
|------------------------|----------------------|---------------|
| Diseño de interfaz y wireframes | Website Designer | Frontend Lead |
| Registro e inicio de sesión de usuarios (JWT) | Backend Lead | Database Manager |
| Integración con YouTube API y obtención de transcripciones | Backend Lead | Database Manager |
| Procesamiento y resumen con IA | Backend Lead | Frontend Lead |
| Gestión de base de datos y backups | Database Manager | Backend Lead |
| Panel de usuario y visualización de vídeos resumidos | Frontend Lead | Website Designer |
| Despliegue en VPS y configuración de Docker | Backend Lead | Database Manager, Frontend Lead |
| Pruebas de usabilidad y diseño final | Website Designer | Frontend Lead |

### Estableced un sistema de comunicación (Discord, Slack, Telegram, etc.).

El equipo utilizará **Discord** como plataforma principal de comunicación, debido a su versatilidad y facilidad de organización por canales.

Además, se programarán reuniones semanales (vía Discord o Google Meet) para revisar avances, asignar nuevas tareas y detectar posibles bloqueos.

Las decisiones técnicas importantes se documentarán en GitHub mediante issues y pull requests, manteniendo así un registro formal del progreso.


## 2. Recursos materiales y tecnológicos:

### Librerías y frameworks específicos

#### Frontend:

| Librería | Descripción |
|----------|-------------|
| react@latest | Framework principal para construir la UI |
| react-router-dom@latest | Enrutamiento cliente (SPA) |
| @tanstack/react-query@latest | Gestión de estado del servidor, caché automático |
| zustand@latest | Gestión de estado global del cliente (auth, UI) |
| axios@latest | Cliente HTTP para comunicación con backend |
| react-hook-form@latest | Gestión de formularios con validación |
| zod@latest | Validación de schemas type-safe |
| shadcn/ui@latest | Componentes UI accesibles y personalizables |
| lucide-react@latest | Biblioteca de iconos |
| sonner@latest | Sistema de notificaciones toast |
| react-markdown@latest | Renderizado de resúmenes en formato markdown |
| vite@latest | Build tool y dev server |

#### Backend:

| Librería | Descripción |
|----------|-------------|
| express@latest | Framework web para Node.js |
| mongoose@latest | ODM para MongoDB |
| bull@latest | Sistema de colas para procesamiento asíncrono |
| ioredis@latest | Cliente Redis para Bull |
| jsonwebtoken@latest | Generación y verificación de tokens JWT |
| bcryptjs@latest | Hash de contraseñas |
| express-validator@latest | Validación de requests HTTP |
| cors@latest | Middleware CORS |
| helmet@latest | Middleware de seguridad (headers HTTP) |
| express-rate-limit@latest | Rate limiting para prevenir abuso |
| dotenv@latest | Gestión de variables de entorno |
| youtube-transcript-plus@latest | Extracción de transcripciones de YouTube |
| rss-parser@latest | Parser de RSS feeds |
| axios@latest | Cliente HTTP para llamadas a APIs externas |
| morgan@latest | Logger HTTP para desarrollo/producción |
| nodemon@latest | Auto-restart en desarrollo |

#### DevOps y Deployment:

| Librería | Descripción |
|----------|-------------|
| docker@latest | Contenedorización de servicios |
| docker-compose@latest | Orquestación de múltiples contenedores |
| nginx@latest | Reverse proxy y servidor web |

### Servicios de hosting y bases de datos

| Servicio | Especificaciones | Plan | Coste Mensual |
|----------|------------------|------|---------------|
| DigitalOcean Droplet | 1 vCPU, 2 GiB RAM, 50 GiB SSD, 2000 GiB Transfer | Basic Droplet | $12/mes (cubierto por crédito estudiantil $200) |
| MongoDB | Contenedor Docker en VPS, 10GB storage dedicado | Self-hosted | Incluido en VPS |
| Redis | Contenedor Docker en VPS, 512MB memoria | Self-hosted | Incluido en VPS |
| Nginx | Reverse proxy + SSL. | Self-hosted | Incluido en VPS |
| Cloudflare | CDN, DNS, protección DDoS, caché estático | Free Tier | $0 |
| GitHub | Repositorio privado + GitHub Actions CI/CD | Free for Students | $0 |
| Docker Hub | Registry para imágenes Docker (public) | Free Tier | $0 |

#### Todos los servicios en un único VPS mediante Docker Compose

- Frontend: React build servido por Nginx (puerto 3000 interno)
- Backend: Node.js + Express (puerto 5000 interno)
- MongoDB: Base de datos (puerto 27017 interno)
- Redis: Colas Bull (puerto 6379 interno)
- Nginx: Reverse proxy (puertos 80/443 público)

#### Volúmenes persistentes en VPS:

● /var/docker/mongodb - Datos de base de datos (10GB)

● /var/docker/redis - Persistencia de colas (1GB)

● /var/log/app - Logs de aplicación

● /var/ssl - Certificados gratuitos SSL de Let's Encrypt, o se añade un certificado automático con la librería python cert bot que te configura el SSL automáticamente, lo único que tienes que estar renovando automáticamente. O si no como alternativa, podemos delegar esta funcionalidad SSL y seguridad a Cloudflare.

### APIs externas (y sus limitaciones de uso gratuito)

| API | Límite Gratuito | Límite de Pago | Coste | Uso en el MVP |
|-----|-----------------|----------------|-------|---------------|
| YouTube RSS Feeds | Ilimitado | N/A | Gratis | Polling cada 15 min por canal activo |
| youtube-transcript-plus | Ilimitado | N/A | Gratis | 1-3 requests por vídeo nuevo |
| OpenRouter API | Limitado | Por uso | Ver tabla abajo | 1 request por vídeo (resumen) |
| YouTube Data API v3 | 10,000 unidades/día | N/A | Gratis | ~100 unidades por búsqueda de canal |

#### Detalles de APIs:

**YouTube RSS Feeds**

● URL: https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}

● Límite: Sin límites, servicio público de YouTube

● Autenticación: No requiere API key

● Datos retornados: Últimos 15 vídeos del canal (título, ID, fecha publicación)

● Tasa de actualización: YouTube actualiza cada ~5-15 minutos

● Coste: $0

**youtube-transcript-plus (Librería Node.js)**

● Tipo: Librería de código abierto

● Límite: Sin límites oficiales, pero susceptible a rate limiting de YouTube, aunque se ha realizado un testeo de 1000 solicitudes en menos de un minuto para testear los límites y no ha realizado ningún tipo de problema. En caso que haya problemas de límites se implementaría user agents y proxies rotativos.

● Autenticación: No requiere

● Datos retornados: Transcripción completa del vídeo en JSON.

● Idiomas soportados: Detección automática o especificar (en, es, fr, etc.)

● Coste: $0

**Testeo de la librería de youtube-transcript-plus:**

Utilizaremos una librería de NodeJS llamada "youtube-transcript-plus" (https://github.com/ericmmartin/youtube-transcript-plus) que se comunica con la API pública de YouTube para obtener las transcripciones de los vídeos de YouTube. Hemos puesto la librería al limite para ver si habría limitaciones de rate limit, pero no ha habido problema.

Para probarlo hemos hecho una simulación con hilos en NodeJS para ejecutar el máximo número de peticiones en el menor tiempo posible utilizando la librería de transcripciones de YouTube. Hemos probado con 1000 peticiones en menos de 1 minuto y ha funcionado sin ningún problema. Enlace del repositorio donde se muestra el código utilizado para hacer la simulación:
https://github.com/TuberIA-App/libraries_apis_testing

![youtube-transcript-plus Library Testing Screenshot](https://raw.githubusercontent.com/TuberIA-App/propuesta_formal/refs/heads/main/docs/images/youtube-transcript-plus-testing-screenshot.png)

A la hora de hacer el test, hemos distinguido entre peticiones exitosas y con error, a la vez que en caso de "éxito" hemos hecho un double check comprobando que efectivamente estamos obteniendo una "trascripción" como respuesta para evitar falsos positivos, de esta forma vemos las peticiones que de verdad nos han dado las transcripciones sin falsos positivos.

En caso que algún momento haya problemas de rate limit con esta librería, se procedería a integrar user agent rotativos para simular distintos dispositivos y si hubiera problemas de IP se procedería a utilizar proxies rotativos.

**OpenRouter API (Acceso a modelos de IA)**

- **Descripción:** Vamos a utilizar la plataforma de OpenRouter debido a que nos permite utilizar cualquier modelo que queramos de forma muy fácil, y migrar de uno a otro de forma muy sencilla, además que tienen IA gratuitas que podemos probar para el desarrollo o incluso para ofrecer planes gratuitos para los primeros usuarios de la aplicación. Testeamos cual es mejor modelo a utilizar y mediante prompt engineering, idearemos el mejor prompt para que el LLM haga la funcionalidad que queremos.

● Autenticación: API Key requerida

● Límite gratuito: Existe una IA gratuita que se utilizará a la hora de el development, aunque a veces tiene límites, en tal caso si falla, se cambiaría para esa solicitud a un modelo de reserva de pago.

● Modelos disponibles: Llama, GPT, Claude, Mistral, etc.

● Coste por modelo:

| Modelo | Input (por 1M tokens) | Output (por 1M tokens) | Contexto | Opción gratuita |
|--------|----------------------|------------------------|----------|-----------------|
| Z.AI: GLM 4.5 Air | $0.13 | $0.85 | 131,072 | Si |
| Meta Llama 3.1 70B | $0.35 | $0.40 | 131,072 | No |
| GPT-4o mini | $0.15 | $0.60 | 128,000 | No |
| Meta Llama 3.1 8B | $0.02 | $0.02 | 16,384 | No |

**Recomendación para MVP:** Se realizará un análisis y pruebas con prompt engineering para ver cual es el mejor modelo para el MVP, pero se intentará que se seleccione un modelo gratuito el cual tenga su alternativa de pago para asegurar siempre la misma calidad.

**YouTube Data API v3**

● Autenticación: API Key (en proceso de obtención)

● Límite gratuito: 10,000 unidades/día (quota)

● Coste de operaciones:
  - Búsqueda de canales: ~100 unidades
  - Obtener info de canal: 1 unidad
  - Obtener info de vídeo: 1 unidad

● Uso en MVP:
  - Búsqueda de canales por nombre/handle (~100 operaciones/día máximo)
  - Obtener Channel ID desde username (backup si web scraping falla)

● Límite práctico: ~100 búsquedas de canales por día

● Coste: $0 (dentro del límite gratuito)

● Alternativa: En caso de no ser aceptados por la API oficial de YouTube Data API v3 para obtener el channel id de cualquier canal de YouTube, se procedería a realizar un web scraping legítimo de páginas públicas de YouTube.

### Herramientas de desarrollo (Git, IDE, testing, etc.).

- **Git** (vamos a trabajar en ramas, haciendo commits y pull request de forma organizada como equipo, así tendremos nuestra rama the development, donde iremos pusheando pull request de ramas de trabajo (feature), y cuando tengamos ya la primera versión del proyecto en la rama development, realizaremos un push a la rama main.)

- Los **IDEs** a utilizar es cuestión de preferencias personales, pero vamos a utilizar principalmente Visual Studio Code, debido a que es de lo más flexibles en el desarrollo full-stack. Como vamos a trabajar tanto de frontend como de backend, las extensiones de Visual Studio Code nos permiten integrar "snippets" útiles para todos los ámbitos del desarrollo (React Snippets, HTML Snippets, etc…) que nos facilitarán el desarrollo a parte de su gran uso en el mundo real por la facilidad que presenta.

- Vamos a realizar **tests unitarios** sobre todo en la parte del backend para facilitar un desarrollo seguro, probar las APIs y que efectivamente retornen lo que debería. Esto es esencial al trabajar en equipo, debido a que si algún miembro hace algún cambio notable y falla en los tests unitarios, significa que se ha cambiado algo que está afectando a un endpoint anterior, lo cual es muy útil porque al hacer los tests unitarios tendremos siempre la seguridad de saber si lo que hemos construido se sigue manteniendo para cambios futuros.

---

## 4. Recursos humanos

### Roles rotativos del equipo

Para fomentar el aprendizaje integral y evitar la sobrecarga de responsabilidad en un solo miembro, el equipo de TuberIA implementa un **sistema de rotación de roles** a lo largo de los 6 sprints del proyecto.

#### Roles principales:

1. **Product Owner (PO)**
   - Responsable de definir y priorizar el Product Backlog
   - Toma decisiones sobre el alcance de cada sprint
   - Valida que las funcionalidades cumplan los requisitos de negocio
   - Punto de contacto con stakeholders (en este caso, profesores/evaluadores)

2. **Scrum Master (SM)**
   - Facilita las ceremonias Scrum (Sprint Planning, Daily Standups, Sprint Review, Sprint Retrospective)
   - Elimina impedimentos que bloqueen al equipo
   - Mantiene actualizado el tablero de GitHub Projects
   - Asegura que se respete la metodología ágil

3. **Developer (Dev)**
   - Implementa las funcionalidades asignadas (Frontend, Backend, BD, DevOps)
   - Realiza code reviews de los Pull Requests
   - Participa activamente en las estimaciones de tareas
   - Mantiene la calidad del código y la documentación técnica

#### Distribución de roles por sprint:

| Sprint | Fechas | Product Owner | Scrum Master | Developers |
|--------|--------|---------------|--------------|------------|
| Sprint 1 | 31 Oct - 06 Nov 2025 | Natalia | Ezequiel | Alfonso |
| Sprint 2 | 07 Nov - 13 Nov 2025 | Ezequiel | Alfonso | Natalia |
| Sprint 3 | 14 Nov - 20 Nov 2025 | Natalia | Alfonso | Ezequiel |
| Sprint 4 | 21 Nov - 27 Nov 2025 | Alfonso | Natalia | Ezequiel |
| Sprint 5 | 28 Nov - 04 Dic 2025 | Alfonso | Ezequiel | Natalia |
| Sprint 6 | 05 Dic - 11 Dic 2025 | Ezequiel | Natalia | Alfonso |


#### Beneficios de la rotación:

- **Visión holística**: Todos los miembros experimentan diferentes perspectivas del proyecto
- **Desarrollo de habilidades blandas**: Liderazgo, facilitación, negociación
- **Prevención de burnout**: Ningún miembro está permanentemente en un rol de alta presión
- **Bus factor reducido**: El conocimiento se distribuye, evitando dependencias críticas de una sola persona
- **Empatía entre roles**: Entender las responsabilidades de cada rol mejora la colaboración

### Herramientas de gestión de tiempo

Para medir con precisión las horas invertidas y mejorar las estimaciones futuras, el equipo utiliza:

#### Toggl Track

- **URL**: https://toggl.com/track/
- **Propósito**: Registro de tiempo real invertido en cada tarea
- **Integración**: Vinculado con issues de GitHub mediante tags

**Flujo de trabajo con Toggl Track:**

1. **Inicio de tarea**:
   - Abrir issue en GitHub Projects
   - Iniciar timer en Toggl Track con el nombre del issue (ej: `#123 - Implementar autenticación JWT`)
   - Añadir tag del tipo de tarea

2. **Durante el trabajo**:
   - Pausar timer al hacer descansos, cambiar de tarea o interrupciones
   - Añadir comentario en el issue de GitHub explicando el progreso

3. **Fin de tarea**:
   - Detener timer en Toggl Track
   - Registrar horas totales en el campo "Horas Reales" del issue en GitHub Projects
   - Comparar con la estimación inicial

4. **Análisis semanal**:
   - El Scrum Master exporta el reporte semanal de Toggl Track
   - Se comparan horas estimadas vs. horas reales por categoría
   - Se ajustan estimaciones para el siguiente sprint basándose en la velocidad real del equipo

#### GitHub Projects

- **URL**: https://github.com/orgs/TuberIA-App/projects/1
- **Propósito**: Tablero Kanban para visualizar el estado de todas las tareas
- **Campos personalizados**:
  - **Sprint**: Sprint 1, Sprint 2, ..., Sprint 6
  - **Prioridad**: 1 (máxima) a 3 (baja)
  - **Estimación (horas)**: Horas estimadas antes de comenzar
  - **Horas Reales**: Horas realmente invertidas (extraídas de Toggl Track)
  - **Categoría**: Frontend, Backend, BD, Testing, Documentación
  - **Estado**: To Do, In Progress, In Review, Done
  - **Asignado a**: Miembro responsable

### Comunicación del equipo

El equipo mantiene comunicación constante mediante:

- **Discord**: Canal principal para comunicación diaria, dudas rápidas, pair programming
- **Daily Standup** (15 min, cada mañana):
  - ¿Qué hice ayer?
  - ¿Qué haré hoy?
  - ¿Tengo algún impedimento?
- **Sprint Planning** (inicio de cada sprint): Planificación del trabajo de la semana
- **Sprint Review** (final de sprint): Demo de funcionalidades completadas
- **Sprint Retrospective** (final de sprint): ¿Qué salió bien? ¿Qué mejorar?

---

## 5. Recursos materiales adicionales

Esta sección complementa la información de la **sección 2. Recursos materiales y tecnológicos** con detalles adicionales sobre gestión de credenciales y monitorización.

### Gestión de credenciales y secretos

Para manejar de forma segura las credenciales compartidas del equipo (API keys, contraseñas de bases de datos, tokens de acceso), utilizamos:

#### Bitwarden

**Credenciales almacenadas:**

| Servicio | Credencial | Ubicación en 1Password | Acceso |
|----------|------------|------------------------|--------|
| DigitalOcean Droplet | SSH Key + Root Password | `/DevOps/DigitalOcean` | Backend Lead, DevOps |
| MongoDB | Admin Username/Password | `/Backend/MongoDB` | Backend Lead, Database Manager |
| Redis | Password (si se configura) | `/Backend/Redis` | Backend Lead |
| OpenRouter API | API Key | `/Backend/OpenRouter` | Backend Lead |
| Toggl Track | Team Workspace | `/Team/Toggl` | Todos |

**Buenas prácticas:**
- ✅ Nunca commitear credenciales en el repositorio (usar `.env` en `.gitignore`)
- ✅ Rotar credenciales cada 3 meses o al finalizar el proyecto
- ✅ Usar credenciales diferentes para desarrollo y producción
- ✅ Acceso basado en roles (principio de mínimo privilegio)

### Variables de entorno

**Desarrollo local** (`.env.example` commiteado al repo):
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tuberia_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_dev_jwt_secret_here
OPENROUTER_API_KEY=your_openrouter_key
YOUTUBE_API_KEY=your_youtube_key
```

**Producción** (configurado en el servidor VPS):
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://mongodb:27017/tuberia_prod
REDIS_URL=redis://redis:6379
JWT_SECRET=<strong_random_secret_from_1password>
OPENROUTER_API_KEY=<api_key_from_1password>
YOUTUBE_API_KEY=<api_key_from_1password>
```

### Monitorización y logs

#### Backups automáticos

**Redis**:
✅ **Ya implementado** - Scripts disponibles en `/scripts/`:
- `backup-redis.sh` / `backup-redis.ps1`
- `monitor-redis.sh` / `monitor-redis.ps1`

Redis persiste automáticamente en `/var/docker/redis/dump.rdb`

### Límites de recursos del VPS

Monitorización del uso de recursos para evitar saturación:

| Recurso | Límite VPS | Uso estimado MVP | Alerta en | Acción |
|---------|-----------|------------------|-----------|--------|
| CPU | 1 vCPU | ~40% promedio | >80% | Optimizar queries, caching |
| RAM | 2 GB | ~1.2 GB | >1.8 GB | Analizar memory leaks, reiniciar servicios |
| Disco | 50 GB | ~15 GB (10 GB BD + 5 GB logs/backups) | >40 GB | Limpiar logs antiguos, comprimir backups |
| Ancho de banda | 2000 GB/mes | ~200 GB/mes | >1800 GB/mes | Optimizar assets, CDN |

**Herramientas de monitorización:**
- `htop`: Uso de CPU y RAM en tiempo real
- `df -h`: Uso de disco
- `docker stats`: Uso de recursos por contenedor

### Costes materiales totales (actualización)

| Categoría | Servicio/Herramienta | Coste mensual | Coste 6 meses (MVP) |
|-----------|---------------------|---------------|---------------------|
| **Infraestructura** | DigitalOcean Droplet | $12 | $72 (cubierto por crédito estudiantil) |
| **Dominio** | Dominio | $1-2 | $12 |
| **IA** | OpenRouter (modelos gratuitos en dev) | $0-5 | $0-30 |
| **Total** | | **$13-19/mes** | **$84-114 (6 meses)** |

**Conclusión**: El coste material del proyecto es muy bajo gracias a:
- Crédito educativo de DigitalOcean ($200)
- Uso de herramientas open source
- Modelos de IA gratuitos en fase MVP
- Self-hosting de todos los servicios

El **coste real** se centra principalmente en las **horas de desarrollo del equipo**, lo cual se detalla en `/docs/presupuesto.md`.
