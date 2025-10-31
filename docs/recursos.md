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
