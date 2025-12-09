# 🚀 TuberIA Production Deployment Guide

Complete guide for deploying TuberIA to production on a VPS.

## 📋 Prerequisites

- Ubuntu/Debian VPS with Docker installed
- Domain name (optional, can use IP for testing)
- At least 2GB RAM
- SSH access to the server

## 🔧 Step 1: Server Setup

### Install Docker and Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group (avoid using sudo)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

## 📦 Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-username/TuberIA.git
cd TuberIA
```

## 🔐 Step 3: Configure Secrets

### Create Backend Secrets

All sensitive credentials go in the `secrets/` directory:

```bash
cd ~/TuberIA/secrets

# Generate JWT secrets (32+ characters random strings)
openssl rand -base64 32 > jwt_secret.txt
openssl rand -base64 32 > jwt_refresh_secret.txt

# Add your OpenRouter API key
echo "sk-or-v1-YOUR-ACTUAL-KEY-HERE" > openrouter_api_key.txt

# Verify files were created
ls -la
```

### Create Environment File

Create `.env` in the project root for Docker Compose configuration:

```bash
cd ~/TuberIA

# Option A: With a domain name
cat > .env << 'EOF'
DOMAIN_NAME=tuberia.app
SSL_EMAIL=your-email@example.com
EOF

# Option B: Using server IP (for testing)
MY_IP=$(curl -s ifconfig.me)
cat > .env << EOF
DOMAIN_NAME=$MY_IP
SSL_EMAIL=admin@example.com
EOF
```

### Verify Configuration

```bash
# Check .env exists
cat .env

# Check secrets exist (don't show content)
ls -la secrets/*.txt

# Verify secret lengths (should be 32+ characters)
wc -c secrets/jwt_secret.txt
wc -c secrets/jwt_refresh_secret.txt
```

## 🌐 Step 4: DNS Configuration (if using domain)

If using a domain name, configure DNS records:

1. Go to your domain registrar (Namecheap, Cloudflare, etc.)
2. Add an A record:
   - **Host:** `@` (or your subdomain)
   - **Type:** `A`
   - **Value:** Your server's IP address
   - **TTL:** 300 (or automatic)

3. Wait for DNS propagation (can take 5-60 minutes)

4. Verify DNS:
   ```bash
   dig tuberia.app +short
   # Should show your server IP
   ```

## 🏗️ Step 5: Build and Deploy

```bash
cd ~/TuberIA

# Build all containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start all services in detached mode
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## ✅ Step 6: Verify Deployment

### Check Container Status

```bash
# All containers should show "healthy" status
docker ps

# Expected output:
# - tuberia-backend-prod (healthy)
# - tuberia-frontend-prod (healthy)
# - mongodb-prod (healthy)
# - tuberia-redis-prod (healthy)
# - caddy (healthy)
```

### Check Logs

```bash
# Backend logs
docker logs tuberia-backend-prod

# Should show:
# ✓ Environment variables validated
# ✓ MongoDB connected successfully
# ✓ Redis connected
# ✓ Server running on port 5000
# ✓ Workers ready and listening
# ✓ RSS polling scheduler started

# Frontend logs
docker logs tuberia-frontend-prod

# Caddy logs (reverse proxy)
docker logs caddy

# If errors, check:
docker logs tuberia-backend-prod | grep -i error
```

### Test Endpoints

```bash
# Test backend health (from server)
curl http://localhost/api/health

# Test frontend (from server)
curl -I http://localhost

# Test from outside (replace with your domain/IP)
curl https://tuberia.app/api/health
```

## 🌍 Step 7: Access Your Application

### If using domain:
- **Frontend:** `https://tuberia.app`
- **API:** `https://tuberia.app/api`

### If using IP:
- **Frontend:** `http://YOUR_IP` (Caddy will redirect to HTTPS)
- **API:** `http://YOUR_IP/api`

**Note:** First HTTPS access may take a few seconds while Caddy obtains SSL certificate from Let's Encrypt.

## 🔄 Updating the Application

When you make changes and need to redeploy:

```bash
cd ~/TuberIA

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs to confirm update
docker logs -f tuberia-backend-prod
```

## 🛠️ Common Operations

### View Logs
```bash
# Follow backend logs in real-time
docker logs -f tuberia-backend-prod

# View last 50 lines
docker logs --tail 50 tuberia-backend-prod

# View all container logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs
```

### Restart Services
```bash
# Restart specific service
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart backend

# Restart all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

### Stop Services
```bash
# Stop all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Stop and remove volumes (⚠️ deletes data!)
docker compose -f docker-compose.yml -f docker-compose.prod.yml down -v
```

### Database Backup
```bash
# Backup MongoDB
docker exec mongodb-prod mongodump --out=/backups/backup-$(date +%Y%m%d)

# Copy backup to host
docker cp mongodb-prod:/backups ./mongo-backups
```

## 🐛 Troubleshooting

### Backend not starting

```bash
# Check backend logs
docker logs tuberia-backend-prod

# Common issues:
# 1. Missing secrets → Check secrets/*.txt files exist
# 2. MongoDB not ready → Wait 30s and check again
# 3. Redis not ready → Check docker logs tuberia-redis-prod
```

### Frontend shows blank page

```bash
# Check if frontend container is running
docker ps | grep frontend

# Check nginx logs
docker logs tuberia-frontend-prod

# Test if frontend responds internally
docker exec tuberia-frontend-prod wget -O- http://localhost:3000/health
```

### Cannot access via domain

```bash
# 1. Check DNS
dig your-domain.com +short

# 2. Check Caddy logs
docker logs caddy | tail -30

# 3. Verify .env has correct DOMAIN_NAME
cat .env

# 4. Check firewall allows ports 80 and 443
sudo ufw status
```

### SSL Certificate Issues

```bash
# Check Caddy logs for certificate errors
docker logs caddy | grep -i "certificate"

# Verify email is correct in .env
cat .env | grep SSL_EMAIL

# Restart Caddy to retry certificate
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart caddy
```

### High Memory Usage

```bash
# Check container memory usage
docker stats

# If Redis is using too much memory, check logs
docker logs tuberia-redis-prod

# Restart services to clear memory
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

## 📊 Monitoring

### Check Resource Usage
```bash
# Real-time stats
docker stats

# Disk usage
docker system df
```

### Health Checks
```bash
# Backend health
curl http://localhost/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "...",
#   "services": {
#     "redis": "healthy",
#     "mongodb": "healthy"
#   }
# }
```

## 🔒 Security Recommendations

1. **Change default MongoDB credentials** in production
2. **Use strong secrets** (32+ random characters)
3. **Enable firewall** and allow only ports 80, 443, 22
   ```bash
   sudo ufw enable
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```
4. **Rotate secrets regularly**
5. **Keep Docker images updated**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

## 📝 Environment Variables Reference

### `.env` (Docker Compose variables)
```bash
DOMAIN_NAME=your-domain.com    # Your domain or server IP
SSL_EMAIL=your-email@gmail.com # Email for Let's Encrypt notifications
```

### `secrets/` (Backend sensitive data)
- `jwt_secret.txt` - JWT access token secret (32+ chars)
- `jwt_refresh_secret.txt` - JWT refresh token secret (32+ chars)
- `openrouter_api_key.txt` - OpenRouter API key for AI summaries

### Container Environment (set in docker-compose.prod.yml)
- `NODE_ENV=production`
- `PORT=5000`
- `MONGODB_URI=mongodb://mongo:mongo@mongo:27017/tuberia?authSource=admin`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `WORKER_CONCURRENCY=2`
- `RSS_POLL_INTERVAL=30`
- `LOG_LEVEL=info`

## 🎯 Production Checklist

- [ ] Docker and Docker Compose installed
- [ ] Repository cloned to `~/TuberIA`
- [ ] Secrets created in `secrets/` directory (jwt_secret.txt, jwt_refresh_secret.txt, openrouter_api_key.txt)
- [ ] `.env` file created with DOMAIN_NAME and SSL_EMAIL
- [ ] DNS configured (if using domain)
- [ ] Firewall configured (ports 80, 443, 22)
- [ ] Containers built and running
- [ ] All containers showing "healthy" status
- [ ] Backend accessible at `/api/health`
- [ ] Frontend loading in browser
- [ ] SSL certificate obtained (HTTPS working)

---

**Need help?** Check the logs first:
```bash
docker logs tuberia-backend-prod
docker logs tuberia-frontend-prod
docker logs caddy
```