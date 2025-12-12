# Quick Start: YouTube Proxy Configuration

## TL;DR

El servicio de transcripción **SIEMPRE usa user agents rotativos**. El proxy es **opcional**.

### Sin Proxy (Solo User Agents)
```bash
# En tu .env (dev o prod)
YOUTUBE_PROXY_URL=
```

### Con Proxy (Recomendado para VPS de Producción)
```bash
# En tu .env (dev o prod)
YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT
```

---

## Setup para Development (Local)

### Opción 1: Sin Proxy
```bash
# backend/.env
YOUTUBE_PROXY_URL=
```

### Opción 2: Con Proxy
```bash
# backend/.env
YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT
```

Eso es todo. Reinicia tu servidor y listo.

---

## Setup para Production

### En DigitalOcean Droplet (VPS)

**Paso 1:** SSH a tu droplet
```bash
ssh root@your-droplet-ip
```

**Paso 2:** Edita el archivo `.env` en tu servidor
```bash
cd /path/to/TuberIA/backend
nano .env
```

**Paso 3:** Añade la línea
```bash
YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT
```

**Paso 4:** Guarda y reinicia
```bash
# Guardar: Ctrl+X, Y, Enter

# Reiniciar (elige el que uses)
pm2 restart all
# o
systemctl restart your-app
```

### En DigitalOcean App Platform

**Paso 1:** Ve a tu app en el dashboard de DigitalOcean

**Paso 2:** Settings → App-Level Environment Variables

**Paso 3:** Añade variable:
- **Key**: `YOUTUBE_PROXY_URL`
- **Value**: `http://USERNAME:PASSWORD@IP:PORT`

**Paso 4:** Save & Deploy

---

## ¿Cómo funciona?

### Sin Proxy Configurado
```
Tu App → User Agent Aleatorio → YouTube API
```
- ✅ User agents rotativos activos
- ❌ Sin proxy
- Conexión directa a YouTube

### Con Proxy Configurado
```
Tu App → User Agent Aleatorio → Proxy Server → YouTube API
```
- ✅ User agents rotativos activos
- ✅ Proxy activo
- Todas las peticiones van por el proxy

---

## Verificar que está funcionando

### Logs sin proxy:
```
[info]: No YouTube proxy configured, using direct connection with rotative user agent
```

### Logs con proxy:
```
[info]: YouTube proxy configured
{ "proxy": "http://***:***@IP:PORT" }
```

---

## Resumen

| Entorno | Dónde configurar | Qué poner |
|---------|------------------|-----------|
| **Development** | `backend/.env` | `YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT` |
| **Production (Droplet)** | `backend/.env` en el servidor | `YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT` |
| **Production (App Platform)** | DigitalOcean Dashboard → Environment Variables | Key: `YOUTUBE_PROXY_URL`<br>Value: `http://USERNAME:PASSWORD@IP:PORT` |

**Sin proxy**: Dejar `YOUTUBE_PROXY_URL=` vacío o comentado

---

## Seguridad

- ✅ Las credenciales se enmascaran automáticamente en los logs
- ✅ Nunca commitear `.env` a Git (ya está en `.gitignore`)
- ✅ En producción, usar variables de entorno del sistema o dashboard
- ✅ Las credenciales solo están en entorno, no en código

---

## ¿Necesitas proxy?

### Usa proxy si:
- YouTube bloquea tu IP de producción (VPS)
- Recibes errores 429 (rate limit)
- Necesitas evitar detección de bot

### No necesitas proxy si:
- YouTube no está bloqueando tus requests
- Solo quieres user agents rotativos (se activan automáticamente)
- Estás en development local y no tienes problemas

---

Para más detalles técnicos, ver [youtube-proxy-setup.md](./youtube-proxy-setup.md)
