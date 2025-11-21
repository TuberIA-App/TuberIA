# Caddy Deployment Guide for TuberIA

This guide covers deploying TuberIA with **Caddy** as the reverse proxy for automatic HTTPS.

## Why Caddy?

✅ **Automatic HTTPS** - Zero configuration, just works
✅ **Simpler than Traefik** - 20 lines vs 100+ lines
✅ **More Secure** - No Docker socket access needed
✅ **Better Defaults** - HTTP/2, HTTP/3, compression built-in
✅ **Easier Debugging** - Single config file, clear logs

---

## Prerequisites

Same as before:

1. **VPS with Ubuntu/Debian** (tested on Ubuntu 22.04+)
2. **Docker & Docker Compose** installed
3. **Domain name** pointing to your VPS IP
   ```bash
   # Verify DNS:
   nslookup tuberia.app
   # Should return your VPS IP address
   ```
4. **Ports 80 and 443** open in firewall

---

## Deployment Steps

### 1. Prepare the VPS

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Navigate to project directory
cd /opt/tuberia

# Pull latest code
git pull origin main
```

### 2. Verify Configuration Files

Ensure these files exist:

```bash
# Check Caddyfile exists
ls -la Caddyfile

# Check .env file has correct values
cat .env
# Should contain:
# DOMAIN_NAME=tuberia.app
# SSL_EMAIL=your-email@example.com
```

**Important**: Your `.env` file should have:
```env
DOMAIN_NAME=tuberia.app
SSL_EMAIL=admin@tuberia.app
NODE_ENV=production
```

### 3. Create Required Directories

```bash
# Create logs directory for Caddy
mkdir -p logs/caddy

# Verify secrets exist
ls -la secrets/
# Should show:
# - jwt_secret.txt
# - jwt_refresh_secret.txt
# - openrouter_api_key.txt
```

### 4. Stop Existing Traefik (if running)

```bash
# Stop all containers
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Optional: Remove Traefik volume (backup first if needed)
docker volume ls | grep traefik
# docker volume rm tuberia_traefik-letsencrypt
```

### 5. Deploy with Caddy

```bash
# Start all services with Caddy
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify all containers are running
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Expected output:
# NAME                    STATUS              PORTS
# caddy                   Up (healthy)        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# tuberia-frontend-prod   Up (healthy)        3000/tcp
# tuberia-backend-prod    Up (healthy)        5000/tcp
# mongodb-prod            Up (healthy)        27017/tcp
```

### 6. Monitor SSL Certificate Acquisition

Caddy will automatically obtain SSL certificates. Watch the logs:

```bash
# Follow Caddy logs
docker logs -f caddy

# You should see something like:
# {"level":"info","msg":"certificate obtained successfully","domain":"tuberia.app"}
# {"level":"info","msg":"serving initial configuration"}
```

**This typically takes 10-30 seconds.** Caddy will:
1. Start HTTP server on port 80
2. Receive request from Let's Encrypt
3. Validate domain ownership (HTTP-01 challenge)
4. Obtain certificate
5. Enable HTTPS on port 443

### 7. Verify Deployment

```bash
# Test HTTP (should redirect to HTTPS)
curl -I http://tuberia.app
# Expected: HTTP/1.1 308 Permanent Redirect
#           Location: https://tuberia.app/

# Test HTTPS
curl -I https://tuberia.app
# Expected: HTTP/2 200 OK

# Test API endpoint
curl https://tuberia.app/api/health
# Expected: {"status":"ok","message":"Server is running"}

# Test frontend
curl https://tuberia.app
# Expected: HTML content from React app
```

### 8. Verify SSL Certificate

```bash
# Check certificate details
echo | openssl s_client -connect tuberia.app:443 -servername tuberia.app 2>/dev/null | openssl x509 -noout -dates

# Should show:
# notBefore=...
# notAfter=...   (90 days from now)
```

Or visit in browser: https://tuberia.app and check the padlock icon.

---

## Troubleshooting

### Issue 1: "Failed to obtain certificate"

**Error in logs:**
```
{"level":"error","msg":"challenge failed","domain":"tuberia.app"}
```

**Solutions:**

1. **Verify DNS is correct:**
   ```bash
   nslookup tuberia.app
   # Must return your VPS IP
   ```

2. **Check port 80 is open:**
   ```bash
   curl -I http://tuberia.app/.well-known/acme-challenge/test
   # Should get a 404, not connection refused
   ```

3. **Ensure no other service is using port 80/443:**
   ```bash
   sudo netstat -tlnp | grep ':80\|:443'
   # Should only show docker-proxy for Caddy
   ```

### Issue 2: "404 Page Not Found"

**Symptoms:** HTTPS works but shows 404

**Solutions:**

1. **Check if backend/frontend are healthy:**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

   # All should show "Up (healthy)"
   # If not, check container logs:
   docker logs tuberia-backend-prod
   docker logs tuberia-frontend-prod
   ```

2. **Verify containers are on the same network:**
   ```bash
   docker network inspect tuberia_tuberia-network

   # Should list: caddy, tuberia-frontend-prod, tuberia-backend-prod
   ```

3. **Test internal connectivity:**
   ```bash
   # Test if Caddy can reach frontend
   docker exec caddy wget -q -O- http://frontend:3000

   # Test if Caddy can reach backend
   docker exec caddy wget -q -O- http://backend:5000/api/health
   ```

### Issue 3: "Connection Refused"

**Symptoms:** Cannot access site at all

**Solutions:**

1. **Check Caddy is running:**
   ```bash
   docker logs caddy

   # Should NOT show errors like:
   # - "bind: address already in use"
   # - "no such file or directory: /etc/caddy/Caddyfile"
   ```

2. **Verify Caddyfile syntax:**
   ```bash
   docker exec caddy caddy validate --config /etc/caddy/Caddyfile

   # Should output: "Valid configuration"
   ```

3. **Check firewall:**
   ```bash
   sudo ufw status

   # Should show:
   # 80/tcp    ALLOW
   # 443/tcp   ALLOW
   ```

### Issue 4: "Mixed Content Errors" in Browser Console

**Symptoms:** Some resources load over HTTP instead of HTTPS

**Solution:**
- Verify your frontend `.env` has `VITE_API_URL=https://tuberia.app/api`
- Rebuild frontend: `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend`

---

## Useful Commands

### View Logs

```bash
# Caddy logs (access logs)
docker exec caddy cat /var/log/caddy/access.log | tail -20

# Caddy system logs
docker logs caddy

# Backend logs
docker logs tuberia-backend-prod

# Frontend logs
docker logs tuberia-frontend-prod
```

### Reload Caddy Configuration

If you modify the Caddyfile:

```bash
# Reload without downtime
docker exec caddy caddy reload --config /etc/caddy/Caddyfile

# Or restart container
docker restart caddy
```

### Check Certificate Status

```bash
# List all certificates
docker exec caddy caddy list-certificates

# View certificate details
docker exec caddy ls -lh /data/caddy/certificates/
```

### Force Certificate Renewal

```bash
# Force Caddy to renew certificates (if needed)
docker exec caddy caddy reload --force
```

### Clean Restart

```bash
# Stop all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Remove volumes (certificates will be re-obtained)
docker volume rm tuberia_caddy_data tuberia_caddy_config

# Start fresh
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Monitoring

### Check Service Health

```bash
# Check all containers health status
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

# Check specific service
docker inspect --format='{{.State.Health.Status}}' caddy
docker inspect --format='{{.State.Health.Status}}' tuberia-backend-prod
docker inspect --format='{{.State.Health.Status}}' tuberia-frontend-prod
```

### Monitor Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### SSL Certificate Expiry

Caddy automatically renews certificates 30 days before expiration. You can check:

```bash
# Get expiry date
docker exec caddy sh -c "ls -la /data/caddy/certificates/acme-v02.api.letsencrypt.org-directory/tuberia.app/"
```

---

## Rollback to Traefik (if needed)

If you need to rollback:

1. **Restore old docker-compose.prod.yml from git:**
   ```bash
   git checkout HEAD~1 -- docker-compose.prod.yml
   ```

2. **Stop Caddy and start Traefik:**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml down
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

---

## Performance Tuning (Optional)

### Enable HTTP/3 (QUIC)

Already enabled! Caddy serves HTTP/3 by default on UDP port 443.

Test: https://http3check.net/?host=tuberia.app

### Enable Compression

Already enabled in Caddyfile (`encode gzip zstd`)

### Increase Rate Limits

Edit Caddyfile and modify:
```caddyfile
rate_limit {
    zone api {
        key {remote_host}
        events 100  # Change to higher value
        window 1m
    }
}
```

Then reload: `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`

---

## Security Best Practices

✅ **No Docker socket exposure** - Caddy doesn't need Docker API access
✅ **HSTS enabled** - Forces HTTPS for 1 year
✅ **Security headers** - X-Frame-Options, X-Content-Type-Options, etc.
✅ **Automatic certificate renewal** - Prevents expired certificates
✅ **HTTP/3 support** - Better performance and security

### Additional Security Hardening

1. **Restrict SSH access:**
   ```bash
   # Edit /etc/ssh/sshd_config
   PasswordAuthentication no
   PermitRootLogin no
   ```

2. **Enable UFW firewall:**
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **Set up automatic security updates:**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```

---

## Backup

### What to Backup

1. **SSL Certificates** (automatic backups recommended)
   ```bash
   docker run --rm -v tuberia_caddy_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/caddy-certs-$(date +%Y%m%d).tar.gz -C /data .
   ```

2. **MongoDB Data**
   ```bash
   docker exec mongodb-prod mongodump --out /backups/$(date +%Y%m%d)
   ```

3. **Configuration Files**
   ```bash
   tar czf config-backup-$(date +%Y%m%d).tar.gz Caddyfile docker-compose.prod.yml .env secrets/
   ```

---

## Maintenance

### Regular Tasks

1. **Monitor logs weekly:**
   ```bash
   docker logs caddy | grep -i error
   docker logs tuberia-backend-prod | grep -i error
   ```

2. **Check disk space:**
   ```bash
   df -h
   docker system df
   ```

3. **Update Docker images monthly:**
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

4. **Verify certificates are renewing:**
   ```bash
   docker logs caddy | grep -i "renew"
   ```

---

## Comparison: Caddy vs Traefik

| Feature | Caddy | Traefik (previous) |
|---------|-------|-------------------|
| Config complexity | 20 lines | 100+ lines |
| Auto HTTPS config | 0 lines | 10+ lines |
| Docker socket needed | No ✅ | Yes ⚠️ |
| Configuration location | Single file | Distributed labels |
| Debugging difficulty | Easy | Hard |
| Certificate storage | Directory | Single JSON file |
| HTTP/3 support | Stable ✅ | Experimental |
| Dashboard | Optional | Always present |
| Learning curve | Low | High |

---

## Support

If you encounter issues:

1. **Check logs:** `docker logs caddy`
2. **Validate config:** `docker exec caddy caddy validate --config /etc/caddy/Caddyfile`
3. **Test connectivity:** `curl -v https://tuberia.app`
4. **Review this guide** for troubleshooting steps

For Caddy-specific questions, see: https://caddyserver.com/docs/

---

## Next Steps

✅ Deployment complete!
✅ Your site should now be accessible at https://tuberia.app
✅ SSL certificates will automatically renew

Consider:
- Setting up monitoring (e.g., Uptime Robot, Sentry)
- Configuring MongoDB Atlas (recommended over containerized MongoDB)
- Setting up automated backups
- Adding staging environment

---

**Congratulations! Your TuberIA application is now deployed with Caddy and automatic HTTPS!** 🎉
