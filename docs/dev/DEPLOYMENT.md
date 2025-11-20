# TuberIA - Deployment Guide

Complete guide for deploying TuberIA to a VPS (Virtual Private Server) with production-ready configuration.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development vs Production](#development-vs-production)
- [Local Development Setup](#local-development-setup)
- [Production Deployment](#production-deployment)
- [MongoDB Options](#mongodb-options)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Development Architecture
```
Browser (:5173) → Vite Dev Server (Frontend)
Browser (:5000) → Express API (Backend) → MongoDB (:27017)
```

### Production Architecture
```
Internet (:80/443) → Traefik (Reverse Proxy + SSL)
  ├→ Frontend (Nginx serving static build)
  └→ Backend API → MongoDB Atlas (Managed) or Containerized MongoDB
```

---

## 🔄 Development vs Production

| Component | Development | Production |
|-----------|-------------|------------|
| **Frontend** | Vite dev server (hot reload) | Static build served by Nginx |
| **Backend** | Nodemon (hot reload) | Node.js (optimized) |
| **MongoDB** | Containerized (local) | **Managed service recommended** |
| **Reverse Proxy** | None | Traefik with auto SSL |
| **Secrets** | `.env` files | Docker secrets |
| **Port Exposure** | All exposed | Only 80/443 |
| **Image Size** | ~800MB | ~200MB |
| **Security** | Basic | Hardened (non-root users, read-only FS) |

---

## 💻 Local Development Setup

### Prerequisites
- Docker Desktop installed
- Git installed
- Code editor (VS Code recommended)

### Quick Start

```bash
# Clone repository
git clone <your-repo-url>
cd TuberIA

# Copy environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your settings (MongoDB URI is already correct for Docker)

# Start development environment
docker compose up

# Application will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:5000
# - MongoDB: localhost:27017 (for debugging tools)
```

### Development Commands

```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Rebuild after code changes
docker compose up --build

# Complete cleanup (removes volumes)
docker compose down -v
```

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Edit files in `./frontend/src/` - browser auto-refreshes
- **Backend**: Edit files in `./backend/src/` - nodemon restarts server

---

## 🚀 Production Deployment

### Prerequisites

1. **VPS Requirements**
   - Ubuntu 22.04 LTS or similar
   - Minimum 2GB RAM (4GB recommended)
   - 20GB storage
   - Public IP address
   - Domain name pointing to your VPS

2. **VPS Providers** (Recommended)
   - DigitalOcean ($6-12/month)
   - Linode/Akamai
   - Vultr
   - Hetzner
   - AWS Lightsail

### Step 1: VPS Initial Setup

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version

# Create deployment user (optional but recommended)
adduser deployer
usermod -aG docker deployer
su - deployer
```

### Step 2: Clone Repository

```bash
# Clone your repository
git clone <your-repo-url> tuberia
cd tuberia
```

### Step 3: Configure Secrets

```bash
# Create secret files
cd secrets

# Generate JWT secrets
openssl rand -base64 32 > jwt_secret.txt
openssl rand -base64 32 > jwt_refresh_secret.txt

# Add your OpenRouter API key
echo "your-openrouter-api-key" > openrouter_api_key.txt

# Verify secrets were created
ls -la
cd ..
```

### Step 4: Configure Environment Variables

```bash
# Set your domain name
export DOMAIN_NAME=yourdomain.com
export SSL_EMAIL=your-email@example.com

# Or create a .env file in project root
cat > .env << EOF
DOMAIN_NAME=yourdomain.com
SSL_EMAIL=your-email@example.com
EOF
```

### Step 5: Configure MongoDB

#### Option A: MongoDB Atlas (RECOMMENDED)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/tuberia`)
4. Update `docker-compose.prod.yml`:

```yaml
backend:
  environment:
    - MONGODB_URI=mongodb+srv://YOUR_CONNECTION_STRING_HERE
```

5. **Remove mongo service** from `docker-compose.prod.yml` if using Atlas

#### Option B: Containerized MongoDB

Keep the current configuration in `docker-compose.prod.yml`. See [MongoDB Options](#mongodb-options) section below for backup setup.

### Step 6: Build and Deploy

```bash
# Build production images
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Check service status
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

### Step 7: Verify Deployment

```bash
# Check Traefik dashboard
# Visit: https://traefik.yourdomain.com
# Default credentials: admin / change_this_password
# CHANGE THESE IMMEDIATELY!

# Check application
# Visit: https://yourdomain.com

# Check API health
curl https://yourdomain.com/api/health
```

### Step 8: Secure Traefik Dashboard

```bash
# Generate new password hash
apt install apache2-utils -y
htpasswd -nb admin your_new_password

# Copy the output (admin:$apr1$...)
# Update docker-compose.prod.yml traefik labels:
# - "traefik.http.middlewares.auth.basicauth.users=YOUR_HASH_HERE"

# Restart Traefik
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart traefik
```

---

## 🗄️ MongoDB Options

### Option 1: MongoDB Atlas (RECOMMENDED)

**Pros:**
- ✅ Free tier available (512MB)
- ✅ Automatic backups
- ✅ High availability
- ✅ Automatic scaling
- ✅ No maintenance

**Cons:**
- ❌ External dependency
- ❌ Requires internet connection

**Setup:**
1. Create Atlas account
2. Create cluster (free M0 tier)
3. Whitelist VPS IP or use `0.0.0.0/0` (less secure)
4. Create database user
5. Get connection string
6. Update `MONGODB_URI` in production compose file

### Option 2: Containerized MongoDB

**Pros:**
- ✅ Full control
- ✅ Data stays on your server
- ✅ No external dependencies

**Cons:**
- ❌ You manage backups
- ❌ You manage scaling
- ❌ Single point of failure

**Backup Setup (if using containerized):**

```bash
# Create backup script
cat > /root/backup-mongo.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/tuberia/mongo-backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec mongodb mongodump --out=/backups/backup_$DATE
find $BACKUP_DIR -type d -name "backup_*" -mtime +7 -exec rm -rf {} \;
EOF

chmod +x /root/backup-mongo.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /root/backup-mongo.sh
```

---

## 🔒 SSL Certificate Setup

Traefik automatically obtains SSL certificates from Let's Encrypt via ACME protocol.

### Requirements
- Domain pointing to your VPS IP (A record)
- Ports 80 and 443 open
- Valid email address

### Automatic SSL

Let's Encrypt certificates are automatically:
- ✅ Obtained when first accessed
- ✅ Renewed before expiration (90 days)
- ✅ Stored in `traefik-letsencrypt` volume

### Manual SSL Verification

```bash
# Check certificate status
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs traefik | grep acme

# Test SSL
curl -I https://yourdomain.com
```

### Troubleshooting SSL

If SSL fails:
1. Verify domain DNS is pointing to VPS IP: `dig yourdomain.com`
2. Check firewall: `ufw status` (ports 80, 443 must be open)
3. Check Traefik logs: `docker logs traefik`
4. Verify email in docker-compose.prod.yml

---

## 📊 Monitoring & Maintenance

### Check Service Health

```bash
# View all containers
docker ps

# Check specific service logs
docker logs tuberia-backend-prod
docker logs tuberia-frontend-prod
docker logs traefik

# Follow logs in real-time
docker logs -f tuberia-backend-prod

# Check resource usage
docker stats
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# View rolling update
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

### Database Backups

```bash
# Manual backup (if using containerized MongoDB)
docker exec mongodb mongodump --out=/backups/manual_backup_$(date +%Y%m%d)

# Restore from backup
docker exec mongodb mongorestore /backups/backup_20240115
```

### Resource Monitoring

```bash
# Install monitoring tools (optional)
docker run -d \
  --name=netdata \
  -p 19999:19999 \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  netdata/netdata

# Visit: http://your-vps-ip:19999
```

---

## 🔧 Troubleshooting

### Services Not Starting

```bash
# Check service status
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# View logs for errors
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs

# Restart specific service
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker logs mongodb-prod

# Test connection from backend container
docker exec tuberia-backend-prod curl http://mongo:27017
```

### SSL Certificate Issues

```bash
# Check Traefik logs
docker logs traefik | grep -i error

# Verify domain DNS
dig yourdomain.com

# Check firewall
ufw status

# Restart Traefik
docker restart traefik
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker system
docker system prune -a --volumes

# Remove old images
docker image prune -a
```

### High Memory Usage

```bash
# Check container resource usage
docker stats

# Restart high-memory container
docker restart tuberia-backend-prod

# Adjust resource limits in docker-compose.prod.yml
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change Traefik dashboard password
- [ ] Generate strong JWT secrets
- [ ] Use MongoDB Atlas or secure containerized MongoDB
- [ ] Enable firewall (ufw) - only ports 22, 80, 443
- [ ] Set up automatic security updates
- [ ] Configure backup strategy
- [ ] Use strong passwords everywhere
- [ ] Review all exposed ports
- [ ] Enable Docker logging
- [ ] Set up monitoring

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Traefik Documentation](https://doc.traefik.io/traefik/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [DigitalOcean Community Tutorials](https://www.digitalocean.com/community/tutorials)

---

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker logs: `docker compose logs`
3. Check Traefik dashboard for routing issues
4. Verify DNS and SSL configuration
5. Review security settings and firewall rules

---

**Happy Deploying! 🚀**
