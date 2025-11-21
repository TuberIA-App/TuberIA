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
Internet (:80/443) → Caddy (Reverse Proxy + Auto SSL)
  ├→ Frontend (Nginx serving static build)
  └→ Backend API → MongoDB Atlas (Managed) or Containerized MongoDB
```

**Note:** We migrated from Traefik to Caddy for simpler automatic HTTPS configuration. See [CADDY-DEPLOYMENT.md](../../CADDY-DEPLOYMENT.md) for detailed Caddy setup guide.

---

## 🔄 Development vs Production

| Component | Development | Production |
|-----------|-------------|------------|
| **Frontend** | Vite dev server (hot reload) | Static build served by Nginx |
| **Backend** | Nodemon (hot reload) | Node.js (optimized) |
| **MongoDB** | Containerized (local) | **Managed service recommended** |
| **Reverse Proxy** | None | Caddy with auto SSL |
| **Secrets** | `.env` files | Docker secrets |
| **Port Exposure** | All exposed | Only 80/443 |
| **Image Size** | ~800MB | ~200MB |
| **Security** | Basic | Hardened (non-root users, read-only FS) |
| **API URL** | `http://localhost:5000/api` | `/api` (relative path) |

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
# Create secrets directory if it doesn't exist
mkdir -p secrets
cd secrets

# Generate JWT secrets (32+ characters required)
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

### Step 6: Create Logs Directory

```bash
# Create logs directory for Caddy
mkdir -p logs/caddy
```

**Important:** This directory must exist before starting Caddy, or the container will fail to mount the volume.

### Step 7: Build and Deploy

```bash
# Build production images (includes frontend with VITE_API_URL=/api)
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Check service status
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Expected output:
# NAME                    STATUS              PORTS
# caddy                   Up (healthy)        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# tuberia-frontend-prod   Up (healthy)        3000/tcp
# tuberia-backend-prod    Up (healthy)        5000/tcp
# mongodb-prod            Up (healthy)        27017/tcp
```

**Note:** Caddy will automatically obtain SSL certificates from Let's Encrypt. This typically takes 10-30 seconds on first startup.

### Step 8: Verify Deployment

```bash
# Monitor Caddy obtaining SSL certificates
docker logs -f caddy
# Look for: {"level":"info","msg":"certificate obtained successfully","domain":"yourdomain.com"}

# Test HTTP redirect to HTTPS
curl -I http://yourdomain.com
# Should return: 308 Permanent Redirect → https://yourdomain.com/

# Test HTTPS
curl -I https://yourdomain.com
# Should return: HTTP/2 200 OK

# Test API health
curl https://yourdomain.com/api/health
# Should return: {"status":"ok","message":"Server is running"}

# Test registration/login (should use /api, not localhost)
# Visit: https://yourdomain.com
# Try registering a user - should work without localhost errors
```

### Step 9: Verify SSL Certificate

```bash
# Check certificate details
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates

# Should show certificate valid for 90 days
# Caddy automatically renews 30 days before expiration
```

---

## 🔌 Frontend API Configuration

### How API URLs Work

The frontend needs to know where to send API requests. This is configured differently for development and production:

| Environment | API URL | How It's Set |
|-------------|---------|--------------|
| **Development** | `http://localhost:5000/api` | `VITE_API_URL` in `docker-compose.override.yml` |
| **Production** | `/api` (relative path) | `VITE_API_URL` build arg in `docker-compose.prod.yml` |

### Why Relative Path in Production?

In production, we use `/api` instead of `https://yourdomain.com/api` because:

✅ **Works automatically** - Browser makes requests to same domain + `/api`
✅ **No CORS issues** - Same origin (Caddy routes internally)
✅ **Environment-agnostic** - Works in dev, staging, production without changes
✅ **Simpler** - No need to configure full URLs or domain names

**Flow:**
```
1. User visits: https://tuberia.app
2. Frontend makes request to: /api/auth/register
3. Browser resolves to: https://tuberia.app/api/auth/register
4. Caddy routes /api/* to backend:5000
5. Backend processes and returns response
```

### Build-Time vs Runtime Configuration

**Important:** Vite (the frontend build tool) bakes environment variables into the JavaScript bundle at **BUILD TIME**, not runtime.

This means:
- Environment variables must be available when running `npm run build`
- The Dockerfile accepts `VITE_API_URL` as a build argument
- The `docker-compose.prod.yml` passes `/api` during the build stage
- Once built, the API URL cannot be changed without rebuilding

### Troubleshooting "localhost" API Errors

**Problem:** Frontend makes requests to `http://localhost:5000/api` in production

**Symptoms:**
```
POST http://localhost:5000/api/auth/register net::ERR_CONNECTION_REFUSED
```

**Cause:** Frontend was built without `VITE_API_URL` set, so it used the default fallback (`http://localhost:5000/api`).

**Solution:**
```bash
# Rebuild frontend with correct API URL
docker compose -f docker-compose.yml -f docker-compose.prod.yml build frontend

# Restart frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend

# Verify in browser dev tools that requests go to /api, not localhost
```

**Verify Fix:**
1. Open browser dev tools (F12)
2. Go to Network tab
3. Try registering a user
4. Check the request URL - should be `https://yourdomain.com/api/auth/register`, not `localhost`

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

Caddy automatically obtains SSL certificates from Let's Encrypt with **zero configuration**. This is one of Caddy's biggest advantages over other reverse proxies.

### Requirements
- Domain pointing to your VPS IP (A record)
- Ports 80 and 443 open
- Valid email address in `.env` file (`SSL_EMAIL`)

### How Caddy Automatic HTTPS Works

1. **Caddy starts** and reads the `Caddyfile`
2. **Detects public domain** (e.g., `tuberia.app`) in configuration
3. **Starts HTTP server** on port 80 for ACME validation
4. **Requests certificate** from Let's Encrypt automatically
5. **Validates ownership** via HTTP-01 challenge (Let's Encrypt connects to port 80)
6. **Obtains certificate** and stores in `caddy_data` volume
7. **Enables HTTPS** on port 443 with the new certificate
8. **Redirects HTTP to HTTPS** automatically

**Total configuration needed:** 0 lines! Just specify your domain in `Caddyfile`.

### Automatic Certificate Renewal

Caddy automatically renews certificates:
- ✅ Checks every 12 hours if certificates need renewal
- ✅ Renews 30 days before expiration (certificates valid for 90 days)
- ✅ Zero downtime during renewal (uses OCSP stapling)
- ✅ Automatic retry with exponential backoff on failure
- ✅ Certificates stored in `caddy_data` Docker volume

### Manual SSL Verification

```bash
# Check Caddy logs for certificate acquisition
docker logs caddy | grep -i certificate
# Look for: "certificate obtained successfully"

# Test HTTPS connection
curl -I https://yourdomain.com
# Should return: HTTP/2 200 OK

# Check certificate expiry date
echo | openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates

# List all certificates managed by Caddy
docker exec caddy caddy list-certificates

# Check certificate files (stored in volume)
docker exec caddy ls -lh /data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/
```

### Troubleshooting SSL

#### Issue 1: Certificate Not Obtained

**Symptoms:**
```
Error: challenge failed
```

**Solutions:**

1. **Verify DNS is correct:**
```bash
nslookup yourdomain.com
dig yourdomain.com
# Must return your VPS IP address
```

2. **Check port 80 is accessible:**
```bash
# Test from external machine
curl -I http://yourdomain.com/.well-known/acme-challenge/test
# Should get 404, not connection refused
```

3. **Check firewall:**
```bash
sudo ufw status
# Ports 80 and 443 must be ALLOW
```

4. **Verify email in .env:**
```bash
cat .env | grep SSL_EMAIL
# Must be a valid email address
```

#### Issue 2: Caddy Keeps Restarting

**Check logs:**
```bash
docker logs caddy
# Look for configuration errors or file permission issues
```

**Common causes:**
- `logs/caddy` directory doesn't exist → Create with `mkdir -p logs/caddy`
- Caddyfile syntax error → Validate with `docker exec caddy caddy validate --config /etc/caddy/Caddyfile`
- Port 80/443 already in use → Check with `sudo netstat -tlnp | grep ':80\|:443'`

#### Issue 3: "Mixed Content" Warnings in Browser

**Cause:** Some resources loading over HTTP instead of HTTPS.

**Solution:**
- Verify `FRONTEND_URL` in backend uses `https://`
- Rebuild frontend: `docker compose -f docker-compose.yml -f docker-compose.prod.yml build frontend`

### SSL Certificate Storage

Certificates are stored in the `caddy_data` Docker volume:

```bash
# Backup certificates (recommended)
docker run --rm -v tuberia_caddy_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/caddy-certs-$(date +%Y%m%d).tar.gz -C /data .

# Restore certificates (if needed)
docker run --rm -v tuberia_caddy_data:/data -v $(pwd)/backups:/backup alpine tar xzf /backup/caddy-certs-20240115.tar.gz -C /data
```

### Force Certificate Renewal (Manual)

```bash
# Reload Caddy configuration (triggers certificate check)
docker exec caddy caddy reload --config /etc/caddy/Caddyfile

# Or restart Caddy container
docker restart caddy
```

### Caddy vs Let's Encrypt Certbot

| Feature | Caddy | Certbot (manual) |
|---------|-------|------------------|
| Configuration | 0 lines | 20+ lines |
| Initial setup | Automatic | Manual commands |
| Renewal | Automatic | Cron job needed |
| Restart on renewal | No (graceful) | Yes (nginx reload) |
| Certificate storage | Organized folders | Single file |
| Error handling | Auto-retry | Manual intervention |
| Difficulty | Easy | Medium-Hard |

---

## 📊 Monitoring & Maintenance

### Check Service Health

```bash
# View all containers
docker ps

# Check specific service logs
docker logs tuberia-backend-prod
docker logs tuberia-frontend-prod
docker logs caddy

# Follow logs in real-time
docker logs -f tuberia-backend-prod

# Check Caddy access logs
docker exec caddy cat /var/log/caddy/access.log | tail -20

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

# Check specific service
docker logs caddy
docker logs tuberia-frontend-prod
docker logs tuberia-backend-prod
docker logs mongodb-prod

# Restart specific service
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

### Frontend Shows "localhost" API Errors

**Problem:** Requests going to `http://localhost:5000/api` instead of `/api`

**Solution:**
```bash
# Rebuild frontend with correct VITE_API_URL
docker compose -f docker-compose.yml -f docker-compose.prod.yml build frontend

# Restart frontend
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d frontend

# Verify in browser: Network tab should show requests to /api, not localhost
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker logs mongodb-prod

# Test connection from backend container
docker exec tuberia-backend-prod node -e "console.log(process.env.MONGODB_URI)"

# Test MongoDB from backend network
docker exec tuberia-backend-prod curl -v http://mongo:27017
```

### Caddy Configuration Errors

```bash
# Validate Caddyfile syntax
docker exec caddy caddy validate --config /etc/caddy/Caddyfile

# Check Caddy logs for errors
docker logs caddy | grep -i error

# Reload Caddy configuration
docker exec caddy caddy reload --config /etc/caddy/Caddyfile

# Restart Caddy
docker restart caddy
```

### SSL Certificate Issues

```bash
# Check Caddy logs for certificate errors
docker logs caddy | grep -i certificate

# Verify domain DNS
dig yourdomain.com
nslookup yourdomain.com

# Check firewall (ports 80 and 443 must be open)
sudo ufw status

# Test port accessibility from external machine
curl -I http://yourdomain.com

# Force certificate renewal
docker exec caddy caddy reload --config /etc/caddy/Caddyfile

# Restart Caddy
docker restart caddy
```

### Backend JWT Secret Errors

**Problem:** "Missing required environment variables: JWT_SECRET"

**Cause:** Docker secrets not created or not readable

**Solution:**
```bash
# Check secrets exist
ls -la secrets/
# Should show: jwt_secret.txt, jwt_refresh_secret.txt, openrouter_api_key.txt

# Verify secrets have content
wc -l secrets/*.txt
# Each should have at least 1 line

# Regenerate if missing
cd secrets
openssl rand -base64 32 > jwt_secret.txt
openssl rand -base64 32 > jwt_refresh_secret.txt
cd ..

# Restart backend
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend
```

### Logs Directory Permission Issues

**Problem:** Caddy fails with "permission denied" for /var/log/caddy

**Solution:**
```bash
# Create logs directory
mkdir -p logs/caddy

# Set proper permissions
chmod 755 logs/caddy

# Restart Caddy
docker restart caddy
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

- [ ] Generate strong JWT secrets (32+ characters, use `openssl rand -base64 32`)
- [ ] Set secure `SSL_EMAIL` in `.env` file
- [ ] Create `logs/caddy` directory with proper permissions
- [ ] Use MongoDB Atlas or secure containerized MongoDB
- [ ] Enable firewall (ufw) - only ports 22, 80, 443
- [ ] Set up automatic security updates
- [ ] Configure backup strategy (MongoDB + Caddy certificates)
- [ ] Use strong MongoDB passwords (change from default `mongo:mongo`)
- [ ] Review all exposed ports (`docker ps` should only show 80/443)
- [ ] Enable Docker logging
- [ ] Set up monitoring (optional: Netdata, Uptime Robot)
- [ ] Verify frontend uses `/api` (not localhost) - check browser Network tab
- [ ] Test SSL certificate validity at https://www.ssllabs.com/ssltest/

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Caddy Deployment Guide (Detailed)](../../CADDY-DEPLOYMENT.md) - Comprehensive Caddy setup guide
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [DigitalOcean Community Tutorials](https://www.digitalocean.com/community/tutorials)

---

## 🆘 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker logs: `docker compose logs` or `docker logs caddy`
3. Validate Caddyfile: `docker exec caddy caddy validate --config /etc/caddy/Caddyfile`
4. Verify DNS points to VPS: `dig yourdomain.com`
5. Check SSL certificate: `docker logs caddy | grep certificate`
6. Test frontend API URL: Open browser Network tab, verify requests go to `/api` not `localhost`
7. Review security settings and firewall rules: `sudo ufw status`

### Quick Diagnosis Commands

```bash
# Full health check
docker ps  # All containers should be "Up (healthy)"
docker logs caddy | tail -20  # Check for errors
curl -I https://yourdomain.com  # Test HTTPS
curl https://yourdomain.com/api/health  # Test API

# If anything fails, check specific service logs
docker logs caddy
docker logs tuberia-backend-prod
docker logs tuberia-frontend-prod
```

---

**Happy Deploying! 🚀**
