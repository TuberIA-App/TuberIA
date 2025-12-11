# TuberIA

![Status](https://img.shields.io/badge/status-production-green)
![Stack](https://img.shields.io/badge/stack-MERN-blue)

**Plataforma web de resúmenes automáticos de YouTube con IA**

---

## Descripción

**TuberIA** es una plataforma web que utiliza inteligencia artificial para automatizar completamente el seguimiento de canales de YouTube. Los usuarios reciben resúmenes estructurados de los nuevos vídeos sin intervención manual.

El problema que resolvemos: Estudiantes y profesionales pierden tiempo consumiendo vídeos largos o abandonan canales de interés por exceso de contenido. Nuestra solución combina detección automática de vídeos + transcripción + resumen con IA para entregar contenido clave en minutos.

---

## Aplicación Desplegada

**URL Producción:** [https://tuberia.app](https://tuberia.app)

---

## Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, shadcn/ui, Zustand, TanStack Query |
| **Backend** | Node.js, Express.js, JWT, BullMQ |
| **Base de datos** | MongoDB, Redis |
| **Infraestructura** | Docker, Docker Compose, Caddy (reverse proxy), GitHub Actions |
| **APIs externas** | YouTube RSS Feeds, youtube-transcript-plus, OpenRouter AI |

---

## Capturas de Pantalla

<details>
<summary>Ver mockups del diseño</summary>

### Dashboard
![Dashboard](design/mockups/Dashboard.png)

### Búsqueda de Canales
![Búsqueda](design/mockups/Busqueda.png)

### Resumen de Vídeo
![Resumen](design/mockups/Resumen.png)

### Login
![Login](design/mockups/Login.png)

</details>

---

## Instalación Local

### Requisitos previos
- Docker y Docker Compose instalados
- Git

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/TuberIA-App/TuberIA.git
cd TuberIA

# 2. Copiar el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (JWT secrets, OpenRouter API key, etc.)

# 3. Levantar los contenedores
docker compose up -d

# 4. Acceder a la aplicación
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
```

### Desarrollo

```bash
# Frontend (hot-reload)
cd frontend && npm install && npm run dev

# Backend (hot-reload)
cd backend && npm install && npm run dev
```

---

## Equipo

| Miembro | GitHub | Rol Principal |
|---------|--------|---------------|
| **Ezequiel** | [@obezeq](https://github.com/obezeq) | Backend Lead |
| **Natalia** | [@Naleper90](https://github.com/Naleper90) | Frontend Lead |
| **Alfonso** | [@acasmor0802](https://github.com/acasmor0802) | Database Manager |

**Rotación de roles Scrum**: Cada miembro ha rotado entre Product Owner, Scrum Master y Developer durante los 6 sprints.

---

## Documentación

### Wiki del Proyecto

La wiki contiene toda la documentación de gestión del proyecto según metodología SCRUM:

| Sección | Descripción |
|---------|-------------|
| [**HOME - Wiki**](wiki/INDEX.md) | Índice principal con navegación a todas las secciones |
| [**Metodología y Organización**](wiki/organizacion.md) | Criterios de priorización, flujo de trabajo, columnas GitHub Projects |
| [**Planificación de Sprints**](wiki/objetivos/objetivos.md) | 6 sprints con fechas, objetivos y entregables |
| [**Gestión de Recursos y Tiempos**](wiki/gestion-de-recursos-y-tiempo.md) | GitHub Projects, Toggl Track, ceremonias Scrum |

### Documentación del Proyecto (`/docs`)

| Criterio | Documento | Descripción |
|----------|-----------|-------------|
| **1a** | [analisis-competencia.md](docs/analisis-competencia.md) | Clasificación de 5+ empresas del sector |
| **1b** | [estructura-organizativa.md](docs/estructura-organizativa.md) | Organigrama y departamentos |
| **2f** | [presupuesto.md](docs/presupuesto.md) | Presupuesto económico con Toggl Track |
| **2g** | [financiacion.md](docs/financiacion.md) | Necesidades y fuentes de financiación |
| **3c** | [legislacion.md](docs/legislacion.md) | RGPD, cookies, términos de servicio, WCAG |
| **3f** | [recursos.md](docs/recursos.md) | Recursos humanos, materiales y tecnológicos |

### Documentación Técnica (`/docs/dev`)

| Documento | Descripción |
|-----------|-------------|
| [README.md](docs/dev/README.md) | Guía de desarrollo |
| [api-auth.md](docs/dev/api-auth.md) | API de autenticación (login, registro, logout, refresh) |
| [api-videos.md](docs/dev/api-videos.md) | API de vídeos y resúmenes |
| [api-channels.md](docs/dev/api-channels.md) | API de canales |
| [api-users.md](docs/dev/api-users.md) | API de usuarios |
| [DEPLOYMENT.md](docs/dev/DEPLOYMENT.md) | Guía de despliegue |
| [README-DOCKER.md](docs/dev/README-DOCKER.md) | Configuración Docker |
| [README-REDIS.md](docs/dev/README-REDIS.md) | Configuración Redis y BullMQ |

### Propuesta Formal Inicial

La propuesta formal original del proyecto (Fases 1-4) se encuentra en:
- [**docs/propuesta_formal.md**](docs/propuesta_formal.md)

---

## GitHub Projects

**Tablero del proyecto:** [https://github.com/orgs/TuberIA-App/projects/1](https://github.com/orgs/TuberIA-App/projects/1)

### Campos configurados
- Sprint (1-6)
- Prioridad (1-3)
- Estimación (horas)
- Horas Reales
- Categoría (Frontend, Backend, BD, DevOps, Testing, Docs)
- Estado (To Do, In Progress, In Review, Done)
- Assignee

---

## Estructura del Repositorio

```
TuberIA/
├── frontend/              # Aplicación React + Vite
├── backend/               # API Node.js + Express
├── docs/                  # Documentación del proyecto
│   ├── analisis-competencia.md
│   ├── estructura-organizativa.md
│   ├── presupuesto.md
│   ├── financiacion.md
│   ├── legislacion.md
│   ├── recursos.md
│   ├── propuesta_formal.md
│   └── dev/               # Documentación técnica
├── wiki/                  # Wiki del proyecto (SCRUM, sprints, actas)
│   ├── INDEX.md
│   ├── organizacion.md
│   ├── gestion-de-recursos-y-tiempo.md
│   └── objetivos/         # Planificación por sprint
├── design/                # Wireframes y mockups
│   ├── wireframes/
│   ├── mockups/
│   └── styles/
├── .github/workflows/     # CI/CD con GitHub Actions
├── docker-compose.yml
└── README.md
```

---

## CI/CD

El proyecto utiliza **GitHub Actions** para integración y despliegue continuo:

- **Build automático** en cada push a `develop` y `main`
- **Tests automáticos** del backend
- **Despliegue automático** a producción en merge a `main`

---

**TuberIA** | 2025 | Equipo 1 | 2ºDAW - IES Rafael Alberti
