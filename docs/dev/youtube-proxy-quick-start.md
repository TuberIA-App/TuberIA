# Quick Start: YouTube Proxy Configuration

## TL;DR

El servicio de transcripción incluye:
- ✅ **User agents rotativos** (SIEMPRE activos - cada request usa un user agent diferente)
- ✅ **Sistema de reintentos** (3 intentos por defecto, cada uno con **nuevo user agent**)
- ✅ **Exponential backoff** (espera progresiva: 1s, 2s, 4s entre reintentos)
- ✅ **Proxy opcional** (configurable)

### Sin Proxy (User Agents Rotativos + Reintentos)
```bash
# En tu .env (dev o prod)
YOUTUBE_PROXY_URL=
```

### Con Proxy (Recomendado para VPS de Producción)
```bash
# En tu .env (dev o prod)
YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT
```

### Configurar Reintentos (Opcional)
```bash
# Número de intentos (default: 3)
YOUTUBE_TRANSCRIPT_MAX_RETRIES=3
# Delay inicial entre intentos en ms (default: 1000)
# Se usa exponential backoff: 1s, 2s, 4s, 8s...
YOUTUBE_TRANSCRIPT_RETRY_DELAY=1000
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

### Sistema de Reintentos con Rotación de User Agents

**Cada intento usa un USER AGENT DIFERENTE:**

```
Intento 1 → User Agent A → [Falla con error de red]
   ↓ Espera 1s (exponential backoff)
Intento 2 → User Agent B → [Falla con rate limit 429]
   ↓ Espera 2s (exponential backoff)
Intento 3 → User Agent C → ✅ Éxito
```

**Errores que activan reintentos:**
- ❌ Network errors (ECONNRESET, ETIMEDOUT)
- ❌ Timeouts
- ❌ Rate limits (429)
- ❌ Server errors (500, 502, 503, 504)

**Errores que NO activan reintentos (fallan inmediatamente):**
- ❌ Video no existe
- ❌ Transcripción deshabilitada
- ❌ Transcripción no disponible

### Sin Proxy Configurado
```
Tu App → User Agent Aleatorio (rotativo) → YouTube API
```
- ✅ User agents rotativos activos
- ✅ Reintentos con rotación de user agent
- ❌ Sin proxy
- Conexión directa a YouTube

### Con Proxy Configurado
```
Tu App → User Agent Aleatorio (rotativo) → Proxy Server → YouTube API
```
- ✅ User agents rotativos activos
- ✅ Reintentos con rotación de user agent
- ✅ Proxy activo
- Todas las peticiones van por el proxy

---

## Verificar que está funcionando

### Logs sin proxy:
```
[info]: No YouTube proxy configured, using direct connection with rotative user agent
[debug]: Fetching transcript for video: dQw4w9WgXcQ (attempt 1/3)
[info]: Successfully fetched transcript for video: dQw4w9WgXcQ on attempt 1
```

### Logs con proxy:
```
[info]: YouTube proxy configured
{ "proxy": "http://***:***@IP:PORT" }
[debug]: Fetching transcript for video: dQw4w9WgXcQ (attempt 1/3)
[info]: Successfully fetched transcript for video: dQw4w9WgXcQ on attempt 1
```

### Logs con reintentos (si falla el primer intento):
```
[debug]: Fetching transcript for video: dQw4w9WgXcQ (attempt 1/3)
[warn]: Retryable error on attempt 1/3 for video dQw4w9WgXcQ: { error: "network timeout", willRetry: true }
[debug]: Waiting 1000ms before retry 2...
[debug]: Fetching transcript for video: dQw4w9WgXcQ (attempt 2/3)
[info]: Successfully fetched transcript for video: dQw4w9WgXcQ on attempt 2
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
