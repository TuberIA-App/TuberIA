# TuberIA

![Status](https://img.shields.io/badge/status-production-green)
![Stack](https://img.shields.io/badge/stack-MERN-blue)
![License](https://img.shields.io/badge/license-PolyForm%20NC-red)
![Node](https://img.shields.io/badge/node-20.x-brightgreen)
![React](https://img.shields.io/badge/react-18.x-61DAFB)
![Docker](https://img.shields.io/badge/docker-ready-2496ED)

**AI-powered YouTube video summarization platform**

---

## Table of Contents

- [Description](#description)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## Description

**TuberIA** is a web platform that uses artificial intelligence to automate YouTube channel monitoring. Users receive structured summaries of new videos without manual intervention.

The problem we solve: Students and professionals waste time watching long videos or abandon channels of interest due to content overload. Our solution combines automatic video detection + transcription + AI summarization to deliver key content in minutes.

---

## Live Demo

**Production URL:** [https://tuberia.app](https://tuberia.app)

---

## Features

- **Automatic Channel Monitoring** - Follow YouTube channels and get notified of new videos
- **AI-Powered Summaries** - Get concise summaries of video content using OpenRouter AI
- **Key Points Extraction** - Quickly understand video highlights with bullet points
- **Personal Dashboard** - Organize and track your followed channels in one place
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Processing** - Videos are processed automatically via background jobs with BullMQ
- **Secure Authentication** - JWT-based auth with refresh token rotation

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Context API |
| **Backend** | Node.js 20, Express 5.1, JWT, BullMQ |
| **Database** | MongoDB 8, Redis 7 |
| **Infrastructure** | Docker, Docker Compose, Caddy (reverse proxy), GitHub Actions |
| **Monitoring** | Sentry (frontend + backend), Winston logging |
| **External APIs** | YouTube RSS Feeds, youtube-transcript-plus, OpenRouter AI |

---

## Screenshots

<details>
<summary>View mockups</summary>

### Dashboard
![Dashboard](design/mockups/Dashboard.png)

### Channel Search
![Search](design/mockups/Busqueda.png)

### Video Summary
![Summary](design/mockups/Resumen.png)

### Login
![Login](design/mockups/Login.png)

</details>

---

## Installation

### Prerequisites

- Docker and Docker Compose v2.20+
- Node.js 24+ and pnpm 11+ (`npm install -g pnpm`)
- Git

### Quick Start

```bash
# 1. Clone
git clone https://github.com/TuberIA-App/TuberIA.git
cd TuberIA

# 2. Configure
cp .env.example .env                   # ports, project name, domain
cp backend/.env.example backend/.env   # JWT secrets, OpenRouter API key

# 3. Check the port block is free on your machine
./scripts/check-ports.sh

# 4. Start (builds images, enables hot reload)
pnpm dev

# 5. Open
# Frontend:    http://127.0.0.1:7100
# Backend API: http://127.0.0.1:7101/api
```

TuberIA uses the port block **7100-7105**, bound to `127.0.0.1`, so it runs
alongside your other Docker projects without collisions. Every port is an
`.env` variable — see [Docker Configuration](docs/dev/README-DOCKER.md) to move
the block.

---

## Development

Dependencies are managed with **pnpm workspaces**: one lockfile at the root
covers both `backend/` and `frontend/`.

```bash
pnpm install            # install everything
pnpm dev                # full stack in Docker, with hot reload
pnpm dev:down           # stop
pnpm dev:logs           # follow logs
pnpm ports              # check for port collisions
```

### Running tests

The backend suite talks to a real MongoDB and Redis, so run it inside the
Docker network:

```bash
docker compose exec backend ./node_modules/.bin/vitest run --project unit
docker compose exec backend ./node_modules/.bin/vitest run --project integration
```

`unit` is deterministic and gates CI. `integration` reaches the public internet
(YouTube, OpenRouter), so it is kept out of the required gate.

```bash
pnpm lint               # ESLint across the workspace
pnpm build              # production build of the frontend
```

### Docker commands

```bash
docker compose up -d --watch     # start with file sync
docker compose logs -f backend
docker compose exec backend sh
docker compose down              # stop  (add -v to wipe volumes)
```

---

## API Documentation

Full API documentation is available in the `/docs/dev` directory:

| Endpoint | Documentation |
|----------|---------------|
| Authentication | [api-auth.md](docs/dev/api-auth.md) |
| Videos | [api-videos.md](docs/dev/api-videos.md) |
| Channels | [api-channels.md](docs/dev/api-channels.md) |
| Users | [api-users.md](docs/dev/api-users.md) |

Additional documentation:
- [Deployment Guide](DEPLOYMENT.md) — VPS setup, CI/CD, rollback, resource budget
- [Docker Configuration](docs/dev/README-DOCKER.md) — local dev, ports, images
- [Redis & BullMQ](docs/dev/README-REDIS.md)

---

## Project Structure

```
TuberIA/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React Context providers
│   │   ├── services/      # API service layer
│   │   └── config/        # Configuration (Sentry, etc.)
│   └── Dockerfile
├── backend/               # Node.js + Express API
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── model/         # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Express middlewares
│   │   ├── workers/       # BullMQ workers
│   │   ├── queues/        # Job queue definitions
│   │   └── utils/         # Utility functions
│   └── Dockerfile
├── docs/dev/                       # Technical documentation
├── design/                         # Wireframes and mockups
├── scripts/                        # deployment.sh, check-ports.sh, backups
├── .github/workflows/              # ci.yml, deploy.yml, security-scan.yml
├── pnpm-workspace.yaml             # pnpm workspace definition
├── pnpm-lock.yaml                  # single lockfile for both packages
├── docker-compose.yml              # base topology (no ports, no container names)
├── docker-compose.dev.yml          # dev overlay: watch + loopback ports
├── docker-compose.prod.yml         # prod overlay: GHCR images, Caddy, hardening
├── docker-compose.local-prod.yml   # run the prod stack locally to verify it
├── Caddyfile                       # TLS termination and reverse proxy
└── README.md
```

---

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up the development environment
- Code style guidelines
- Commit message conventions
- Pull request process

---

## Team

| Member | GitHub | Role |
|--------|--------|------|
| **Ezequiel** | [@obezeq](https://github.com/obezeq) | Backend Lead |
| **Natalia** | [@Naleper90](https://github.com/Naleper90) | Frontend Lead |
| **Alfonso** | [@acasmor0802](https://github.com/acasmor0802) | Database Manager |

---

## License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). This license allows personal, educational, and noncommercial use only. Commercial use is not permitted.

---

## Troubleshooting

### Docker containers won't start

```bash
docker compose down -v
docker compose up --build
```

### MongoDB connection errors

- Ensure MongoDB is running: `docker compose ps`
- Check MONGODB_URI in your .env file
- Verify network connectivity between containers

### API rate limits

- The app uses YouTube RSS feeds (no API key required for basic usage)
- OpenRouter has usage limits based on your plan

### Environment variables not loading

- Ensure .env file exists in the root directory
- Check that all required variables are set (see .env.example)
- Restart containers after .env changes
