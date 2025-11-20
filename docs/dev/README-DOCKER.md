# Docker Configuration Guide

Quick reference for TuberIA's Docker setup with separate development and production configurations.

## 📁 File Structure

```
TuberIA/
├── docker-compose.yml              # Base configuration (shared)
├── docker-compose.override.yml     # Development (auto-loaded)
├── docker-compose.prod.yml         # Production (VPS deployment)
├── backend/
│   ├── Dockerfile                  # Multi-stage: dev + production
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile                  # Multi-stage: dev + build + production
│   ├── nginx.conf                  # Nginx config for production
│   └── .dockerignore
├── mongo/
│   └── Dockerfile
├── secrets/                        # Docker secrets for production
│   ├── .gitignore
│   └── README.md
├── mongo-backups/                  # MongoDB backups
└── DEPLOYMENT.md                   # Full deployment guide
```

## 🚀 Quick Start

### Development

```bash
# Start development environment (auto-loads docker-compose.override.yml)
docker compose up

# Rebuild after dependency changes
docker compose up --build

# Stop services
docker compose down

# Complete cleanup
docker compose down -v
```

**Development URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Production

```bash
# Build production images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Stop production
docker compose -f docker-compose.yml -f docker-compose.prod.yml down
```

## 🔍 Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Command** | `docker compose up` | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |
| **Frontend** | Vite dev server (port 5173) | Nginx serving static build (port 3000) |
| **Backend** | Nodemon with hot reload | Node.js optimized |
| **MongoDB** | Exposed on port 27017 | Internal only (or managed service) |
| **Volumes** | Bind mounts for hot reload | No bind mounts (immutable) |
| **Secrets** | `.env` files | Docker secrets |
| **Ports** | All exposed for debugging | Only 80/443 via Traefik |
| **SSL** | None | Automatic Let's Encrypt |
| **Size** | ~800MB total | ~200MB total |
| **User** | Root (convenience) | Non-root (security) |

## 📦 Multi-Stage Dockerfiles

Both frontend and backend use multi-stage builds:

### Backend Dockerfile Stages
1. **base** - Common dependencies
2. **development** - Dev dependencies + nodemon
3. **production-deps** - Production dependencies only
4. **production** - Optimized final image

### Frontend Dockerfile Stages
1. **base** - Common dependencies
2. **development** - Vite dev server
3. **build** - Create production build
4. **production** - Nginx serving static files

### Build Specific Target

```bash
# Build development target explicitly
docker build --target development -t tuberia-backend:dev ./backend

# Build production target
docker build --target production -t tuberia-backend:prod ./backend
```

## 🔐 Security Features (Production)

- ✅ Non-root users in all containers
- ✅ Read-only filesystems where possible
- ✅ Docker secrets for sensitive data
- ✅ Resource limits (CPU/memory)
- ✅ Network isolation (internal backend network)
- ✅ Minimal attack surface (only 80/443 exposed)
- ✅ Automatic SSL with Let's Encrypt
- ✅ Security headers via Traefik

## 🌐 Networking

### Development Network
```
tuberia-network (bridge)
├── frontend (5173:5173)
├── backend (5000:5000)
└── mongo (27017:27017)
```

### Production Network
```
Internet (:80, :443)
    ↓
Traefik (reverse proxy)
    ↓
tuberia-network (bridge)
├── frontend (:3000 internal)
└── backend (:5000 internal)
    ↓
backend-internal (isolated)
└── mongo (:27017 internal only)
```

## 💾 Volumes

### Development
- `./frontend:/app` - Bind mount for hot reload
- `./backend:/app` - Bind mount for hot reload
- `/app/node_modules` - Anonymous volumes for dependencies
- `mongo_data` - Persistent MongoDB data

### Production
- NO bind mounts (security)
- `mongo_data_prod` - Persistent MongoDB data
- `traefik-letsencrypt` - SSL certificates
- `./mongo-backups` - Backup storage (if using containerized MongoDB)

## 🔧 Common Commands

### Development

```bash
# View logs
docker compose logs -f

# Restart single service
docker compose restart backend

# Execute command in container
docker compose exec backend sh

# View running containers
docker compose ps
```

### Production

```bash
# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend

# Restart service
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend

# Execute command
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec backend sh

# View container stats
docker stats

# Update application
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## 🗄️ MongoDB

### Development
- Containerized MongoDB 7.0
- Exposed on port 27017
- Credentials: mongo/mongo
- Volume: `mongo_data`

### Production Options

**Option 1: MongoDB Atlas (RECOMMENDED)**
- Managed service (free tier available)
- Automatic backups and scaling
- Update `MONGODB_URI` in docker-compose.prod.yml
- Remove `mongo` service from prod config

**Option 2: Containerized**
- Keep current setup
- No port exposure
- Set up backup cron job
- See DEPLOYMENT.md for backup script

## 📊 Health Checks

All services include health checks:

- **Frontend**: `wget http://localhost:3000/` (prod) or `:5173` (dev)
- **Backend**: Custom Node.js health check on `/health` endpoint
- **MongoDB**: `mongosh --eval "db.adminCommand('ping')"`
- **Traefik**: Built-in health check

## 🚨 Troubleshooting

### Development Issues

**Services won't start:**
```bash
docker compose down -v
docker compose up --build
```

**Port already in use:**
```bash
# Change port in docker-compose.override.yml
# Or stop conflicting service
```

**Hot reload not working:**
```bash
# Ensure bind mounts are correct
docker compose down
docker compose up
```

### Production Issues

**SSL not working:**
```bash
# Check domain DNS
dig yourdomain.com

# Check Traefik logs
docker logs traefik

# Verify ports 80/443 are open
```

**Can't connect to MongoDB:**
```bash
# Check MongoDB health
docker ps | grep mongo

# View MongoDB logs
docker logs mongodb-prod

# Test from backend
docker exec tuberia-backend-prod curl http://mongo:27017
```

## 📚 Further Reading

- **Full Deployment Guide**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Secrets Setup**: See [secrets/README.md](secrets/README.md)
- **Docker Docs**: https://docs.docker.com/
- **Traefik Docs**: https://doc.traefik.io/

---

**Need help?** Check [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions and troubleshooting.
