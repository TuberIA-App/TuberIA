# TuberIA - API Documentation Index

**Última actualización:** 2025-12-03
**Versión:** 1.0.0 (Phase 5.5 Complete)

Esta es la documentación completa de la API del backend de TuberIA para el equipo de frontend.

---

## 📋 Tabla de Contenidos

1. [Autenticación (Auth)](#autenticación)
2. [Canales (Channels)](#canales)
3. [Usuarios (Users)](#usuarios)
4. [Videos](#videos)
5. [Infraestructura](#infraestructura)
6. [Quick Start](#quick-start)

---

## 🔐 Autenticación

**Archivo:** [api-auth.md](./api-auth.md)

### Endpoints Disponibles

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/refresh` | Renovar access token | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |

### Ejemplo Rápido

```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { accessToken, refreshToken, user } = (await response.json()).data;
```

**Ver documentación completa:** [api-auth.md](./api-auth.md)

---

## 📺 Canales

**Archivo:** [api-channels.md](./api-channels.md)

### Endpoints Disponibles

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/channels/search` | Buscar canal por username/URL | No |
| POST | `/api/channels/:channelId/follow` | Seguir canal | Sí |
| DELETE | `/api/channels/:channelId/unfollow` | Dejar de seguir canal | Sí |
| GET | `/api/channels/user/followed` | Obtener canales seguidos | Sí |
| GET | `/api/channels/:id` | Obtener detalles de canal | No* |

*\* Acepta autenticación opcional para incluir campo `isFollowing`*

### Ejemplo Rápido

```javascript
// Buscar canal
const response = await fetch('http://localhost:5000/api/channels/search?q=@vegetta777');
const { data } = await response.json();
console.log(data.channelId); // UCam8T03EOFBsNdR0thrFHdQ

// Seguir canal
await fetch(`http://localhost:5000/api/channels/${mongoId}/follow`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Obtener canal por ID de YouTube (con isFollowing)
const response = await fetch('http://localhost:5000/api/channels/UCX6OQ3DkcsbYNE6H8uQQuVA', {
  headers: { 'Authorization': `Bearer ${accessToken}` } // Opcional
});
```

**Ver documentación completa:** [api-channels.md](./api-channels.md)

---

## 👤 Usuarios

**Archivo:** [api-users.md](./api-users.md)

### Endpoints Disponibles

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me/stats` | Estadísticas del dashboard | Sí |
| GET | `/api/users/me/channels` | Lista de canales seguidos | Sí |

### Ejemplo Rápido

```javascript
// Obtener estadísticas del usuario
const response = await fetch('http://localhost:5000/api/users/me/stats', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const { summariesRead, timeSaved, followedChannels } = (await response.json()).data;
// summariesRead: 42
// timeSaved: "5h 36m"
// followedChannels: 8

// Obtener canales seguidos con detalles enriquecidos
const response = await fetch('http://localhost:5000/api/users/me/channels', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const { channels, count } = (await response.json()).data;
// channels: [{ id, channelId, name, username, avatar, description, followersCount, subscribedAt, isFollowing }]
```

**Ver documentación completa:** [api-users.md](./api-users.md)

---

## 🎥 Videos

**Archivo:** [api-videos.md](./api-videos.md)

### Endpoints Disponibles

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me/videos` | Feed de videos personalizado | Sí |
| GET | `/api/videos/:videoId` | Detalles de video individual | Sí |

### Query Parameters (Feed)

- `page` (opcional, default: 1) - Número de página
- `limit` (opcional, default: 20, max: 100) - Videos por página
- `status` (opcional) - Filtrar por: `pending`, `processing`, `completed`, `failed`, `all`

### Ejemplo Rápido

```javascript
// Feed de videos (paginado)
const response = await fetch('http://localhost:5000/api/users/me/videos?page=1&limit=20', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const { videos, pagination } = (await response.json()).data;
// videos: [{ videoId, title, url, status, summary, keyPoints, thumbnail, ... }]
// pagination: { currentPage, totalPages, totalCount, hasNextPage, hasPreviousPage }

// Detalles de video con transcripción completa
const response = await fetch('http://localhost:5000/api/videos/dQw4w9WgXcQ', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const { video } = (await response.json()).data;
// Incluye campo adicional: transcription (array completo)
```

**Ver documentación completa:** [api-videos.md](./api-videos.md)

---

## 🏗️ Infraestructura

**Archivo:** [api-infrastructure.md](./api-infrastructure.md)

### Endpoints Disponibles

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check del sistema | No |

### Ejemplo Rápido

```javascript
// Verificar estado del servidor
const response = await fetch('http://localhost:5000/health');
const { status, timestamp, services } = await response.json();
// status: "ok"
// services: { mongodb: "connected", redis: "connected" }
```

**Ver documentación completa:** [api-infrastructure.md](./api-infrastructure.md)

---

## 🚀 Quick Start

### 1. Configuración Base

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Configurar Axios (recomendado)
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para añadir token automáticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 2. Flujo de Autenticación

```javascript
// 1. Login
const { data } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// 2. Guardar tokens
localStorage.setItem('accessToken', data.data.accessToken);
localStorage.setItem('refreshToken', data.data.refreshToken);
localStorage.setItem('user', JSON.stringify(data.data.user));

// 3. Usar API protegida
const stats = await api.get('/users/me/stats');
const channels = await api.get('/users/me/channels');
const videos = await api.get('/users/me/videos?page=1&limit=20');
```

### 3. Estructura de Respuesta Estándar

Todas las respuestas siguen este formato:

**Éxito:**
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Mensaje de error",
  "errors": [
    {
      "field": "campo",
      "message": "Descripción del error"
    }
  ]
}
```

### 4. Códigos de Estado HTTP

| Código | Significado | Uso Común |
|--------|-------------|-----------|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado (registro) |
| 400 | Bad Request | Validación fallida |
| 401 | Unauthorized | Token inválido/faltante |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Duplicado (email, username) |
| 500 | Server Error | Error interno |

---

## 📊 Resumen de Endpoints por Fase

### ✅ Fase 5 (Completada)
- Video feed con paginación
- Detalles de video individual

### ✅ Fase 5.5 (Completada - Nueva)
- Estadísticas de usuario (dashboard)
- Lista enriquecida de canales seguidos
- Detalles de canal por ID de YouTube con `isFollowing`

### 📋 Datos Enriquecidos (Fase 5.5)

Los siguientes endpoints ahora retornan datos adicionales para el frontend:

**Canales:**
- `id` (MongoDB ObjectId)
- `avatar` (URL o placeholder)
- `description` (puede ser null)
- `isFollowing` (boolean) - Solo en `/channels/:id` con auth

**Videos:**
- `thumbnail` (URL de thumbnail)
- `durationSeconds` (duración en segundos)
- `viewsCount` (número de vistas)

---

## 🔍 Casos de Uso del Frontend

### Dashboard Principal (UserHome.jsx)

```javascript
// Obtener estadísticas
const { summariesRead, timeSaved, followedChannels } =
  await api.get('/users/me/stats').then(r => r.data.data);

// Obtener feed de videos
const { videos, pagination } =
  await api.get('/users/me/videos?limit=10&status=completed').then(r => r.data.data);
```

### Página de Canales (Dashboard.jsx)

```javascript
// Obtener lista de canales seguidos
const { channels, count } =
  await api.get('/users/me/channels').then(r => r.data.data);

// Cada canal incluye: id, channelId, name, username, avatar, description,
// followersCount, subscribedAt, isFollowing
```

### Búsqueda de Canales (ChannelSearch.jsx)

```javascript
// Buscar canal
const channel = await api.get('/channels/search?q=@username').then(r => r.data.data);

// Obtener detalles con isFollowing
const { channel } = await api.get(`/channels/${channel.channelId}`).then(r => r.data.data);

// Seguir canal
await api.post(`/channels/${channel.id}/follow`);
```

### Detalle de Video (VideoDetail.jsx)

```javascript
// Obtener video con transcripción completa
const { video } = await api.get(`/videos/${videoId}`).then(r => r.data.data);

// video incluye: videoId, title, url, status, summary, keyPoints,
// transcription (array completo), thumbnail, durationSeconds, viewsCount
```

---

## 🎯 Diferencias Clave: MongoDB ObjectId vs YouTube ID

**IMPORTANTE para el frontend:**

### MongoDB ObjectId (`_id` o `id`)
- **Formato:** 24 caracteres hexadecimales (ej: `674d8e9f12a3b4c5d6e7f890`)
- **Uso:** Seguir/Dejar de seguir canal
- **Endpoints:**
  - `POST /api/channels/:channelId/follow` ← Usa MongoDB `_id`
  - `DELETE /api/channels/:channelId/unfollow` ← Usa MongoDB `_id`

### YouTube Channel ID (`channelId`)
- **Formato:** UCxxxxxx (ej: `UCX6OQ3DkcsbYNE6H8uQQuVA`)
- **Uso:** Buscar/Ver detalles de canal
- **Endpoints:**
  - `GET /api/channels/:id` ← Usa YouTube `channelId`

### Ejemplo de Flujo Completo

```javascript
// 1. Buscar canal (retorna YouTube channelId)
const searchResult = await api.get('/channels/search?q=@vegetta777');
// searchResult.data.channelId = "UCam8T03EOFBsNdR0thrFHdQ" (YouTube ID)

// 2. Obtener detalles (usa YouTube channelId)
const channelDetails = await api.get('/channels/UCam8T03EOFBsNdR0thrFHdQ');
// channelDetails.data.channel.id = "674d8e9f12a3b4c5d6e7f890" (MongoDB ObjectId)

// 3. Seguir canal (usa MongoDB ObjectId)
await api.post('/channels/674d8e9f12a3b4c5d6e7f890/follow');
```

---

## 📝 Notas Importantes

### Autenticación
- Todos los endpoints marcados con "Sí" en la columna "Auth" requieren el header:
  ```
  Authorization: Bearer <accessToken>
  ```
- El access token expira en 15 minutos
- Usa el refresh token para renovar el access token

### Paginación
- Default: `page=1`, `limit=20`
- Máximo: `limit=100`
- Siempre retorna metadata de paginación:
  ```json
  {
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 98,
      "limit": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
  ```

### Filtros de Status (Videos)
- `pending` - Videos en cola
- `processing` - Transcripción en progreso
- `completed` - Procesados con resumen
- `failed` - Error en procesamiento
- `all` - Todos los videos (sin filtro)

### Placeholders
- Avatares sin imagen: `https://via.placeholder.com/150?text=NombreCanal`
- Campos que pueden ser `null`: `description`, `thumbnail`, `username`

---

## 🔗 Enlaces Útiles

- [Documentación de Auth](./api-auth.md)
- [Documentación de Canales](./api-channels.md)
- [Documentación de Usuarios](./api-users.md)
- [Documentación de Videos](./api-videos.md)
- [Documentación de Infraestructura](./api-infrastructure.md)
- [Despliegue con Docker](./README-DOCKER.md)
- [Configuración Redis](./README-REDIS.md)

---

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Verifica que MongoDB esté corriendo
2. Verifica que Redis esté corriendo (para Background Jobs)
3. Revisa los logs del backend
4. Asegúrate de que el puerto 5000 esté libre
5. Verifica las variables de entorno en `.env`

---

**Última actualización:** 2025-12-03
**Mantenido por:** Equipo Backend TuberIA
