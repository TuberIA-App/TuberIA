# API de Canales de YouTube - TuberIA

Documentación completa de los endpoints de canales de YouTube del backend de TuberIA.

## URL Base

```
http://localhost:5000/api/channels
```

**Nota**: El puerto por defecto del backend es `5000` según la configuración en `.env`

## Tabla de Contenidos

- [1. Búsqueda de Canal](#1-búsqueda-de-canal)
- [2. Seguir Canal](#2-seguir-canal)
- [3. Dejar de Seguir Canal](#3-dejar-de-seguir-canal)
- [4. Obtener Canales Seguidos](#4-obtener-canales-seguidos)
- [5. Modelo de Datos del Canal](#5-modelo-de-datos-del-canal)
- [6. Manejo de Errores](#6-manejo-de-errores)
- [7. Ejemplos de Implementación](#7-ejemplos-de-implementación)
- [8. Rate Limiting](#8-rate-limiting)
- [9. Consideraciones Técnicas](#9-consideraciones-técnicas)

---

## Autenticación

La API de canales incluye endpoints públicos y privados:

### Endpoints Públicos (Sin autenticación)

- `GET /api/channels/search` - Búsqueda de canales

Estos endpoints no requieren token de autenticación.

### Endpoints Privados (Requieren autenticación)

- `POST /api/channels/:channelId/follow` - Seguir canal
- `DELETE /api/channels/:channelId/unfollow` - Dejar de seguir canal
- `GET /api/channels/user/followed` - Obtener canales seguidos

Estos endpoints requieren incluir el token JWT en el header `Authorization`:

```
Authorization: Bearer <access_token>
```

### Obtener Token de Acceso

Para usar los endpoints protegidos, primero debes autenticarte:

1. **Registrar usuario**: `POST /api/auth/register`
2. **Iniciar sesión**: `POST /api/auth/login`
3. El login retorna un `accessToken` que debes incluir en todas las peticiones protegidas

Ver [api-auth.md](./api-auth.md) para más detalles sobre autenticación.

### Ejemplo de uso con Token

```javascript
// Obtener token
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
});
const { accessToken } = await loginResponse.json();

// Usar token en endpoint protegido
const response = await fetch('http://localhost:5000/api/channels/user/followed', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

---

## 1. Búsqueda de Canal

Busca un canal de YouTube y retorna su información básica a partir de un username o URL.

### Endpoint

```
GET /api/channels/search
```

### Tipo de Acceso

**🌐 Público** - No requiere autenticación

Este endpoint es público para permitir que los usuarios exploren canales antes de registrarse. El acceso está protegido por rate limiting (100 requests por IP cada 15 minutos).

**Nota**: Las operaciones de seguimiento/guardado de canales (`/follow`, `/unfollow`, `/user/followed`) sí requieren autenticación.

### Rate Limiting

Este endpoint está protegido por rate limiting global:
- **Límite**: 100 requests por IP
- **Ventana**: 15 minutos
- **Scope**: Por dirección IP (no por usuario)

Si excedes el límite, recibirás:
- **Status**: 429 Too Many Requests
- **Headers**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

**Recomendaciones para Frontend**:
- Implementa debounce de 500-1000ms en el search input
- Cachea resultados de búsqueda en localStorage/sessionStorage
- Muestra mensaje amigable si se recibe 429

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `q` | string | ✅ Sí | Username o URL del canal de YouTube |

### Validaciones del Query Parameter `q`

- **Requerido**: Debe estar presente
- **Longitud mínima**: 2 caracteres
- **Tipo**: String
- **Trim automático**: Se eliminan espacios al inicio y final

### Formatos Aceptados para `q`

El parámetro `q` acepta varios formatos:

1. **Username con @**:
   ```
   @vegetta777
   ```

2. **Username sin @** (se agrega automáticamente):
   ```
   vegetta777
   ```

3. **URL completa del canal**:
   ```
   https://youtube.com/@vegetta777
   https://www.youtube.com/@vegetta777
   http://youtube.com/@vegetta777
   ```

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "Channel found successfully",
  "data": {
    "channelId": "UCam8T03EOFBsNdR0thrFHdQ",
    "name": "Vegetta777",
    "username": "@vegetta777",
    "thumbnail": "https://yt3.ggpht.com/ytc/AOPolaSdq...",
    "description": null
  }
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción | Siempre presente |
|-------|------|-------------|------------------|
| `channelId` | string | ID único del canal de YouTube | ✅ Sí |
| `name` | string | Nombre del canal | ✅ Sí |
| `username` | string \| null | Username del canal con @ | ⚠️ Puede ser null |
| `thumbnail` | string \| null | URL de la imagen del canal | ⚠️ Puede ser null |
| `description` | null | Descripción del canal (no disponible actualmente) | ❌ Siempre null |

**Importante**:
- `description` siempre es `null` porque el RSS feed de YouTube no incluye la descripción del canal
- `thumbnail` se extrae del primer video del canal; si el canal no tiene videos, será `null`
- `username` puede ser `null` si no se pudo extraer del feed RSS

### Errores Posibles

#### 400 Bad Request - Query parameter faltante

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "q",
      "message": "Search query is required"
    }
  ]
}
```

#### 400 Bad Request - Query muy corto

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "q",
      "message": "Search query must be at least 2 characters long"
    }
  ]
}
```

#### 400 Bad Request - URL no es de YouTube

```json
{
  "success": false,
  "message": "\"https://notayoutubeurl.com\" is not a YouTube URL"
}
```

#### 404 Not Found - Canal no existe

```json
{
  "success": false,
  "message": "Channel not found"
}
```

#### 500 Internal Server Error - YouTube rate limit

```json
{
  "success": false,
  "message": "YouTube rate limit exceeded. Please try again later."
}
```

#### 500 Internal Server Error - Timeout

```json
{
  "success": false,
  "message": "Request timed out. Please try again later."
}
```

#### 500 Internal Server Error - YouTube no disponible

```json
{
  "success": false,
  "message": "YouTube service is currently unavailable. Please try again later."
}
```

### Ejemplo de uso (JavaScript Fetch)

```javascript
// Con username
const searchChannel = async (query) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/channels/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (data.success) {
      console.log('Canal encontrado:', data.data);
      return data.data;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al buscar canal:', error);
    throw error;
  }
};

// Uso
const channel = await searchChannel('@vegetta777');
console.log(channel.channelId); // UCam8T03EOFBsNdR0thrFHdQ
```

### Ejemplo de uso (Axios)

```javascript
import axios from 'axios';

const searchChannel = async (query) => {
  try {
    const response = await axios.get('http://localhost:5000/api/channels/search', {
      params: { q: query }
    });

    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    if (error.response) {
      // El servidor respondió con un error
      console.error('Error del servidor:', error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.request) {
      // No hubo respuesta del servidor
      console.error('No hay respuesta del servidor');
      throw new Error('No se pudo conectar con el servidor');
    } else {
      // Error en la configuración de la petición
      console.error('Error:', error.message);
      throw error;
    }
  }
};

// Uso
const channel = await searchChannel('vegetta777');
```

### Ejemplo de uso (React Hook)

```typescript
import { useState } from 'react';

interface Channel {
  channelId: string;
  name: string;
  username: string | null;
  thumbnail: string | null;
  description: null;
}

interface UseChannelSearchReturn {
  channel: Channel | null;
  loading: boolean;
  error: string | null;
  searchChannel: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useChannelSearch = (): UseChannelSearchReturn => {
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchChannel = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setError('El término de búsqueda debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setChannel(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/channels/search?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (data.success) {
        setChannel(data.data);
      } else {
        setError(data.message || 'Error al buscar el canal');
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return { channel, loading, error, searchChannel, clearError };
};

// Uso en componente
const ChannelSearchComponent = () => {
  const { channel, loading, error, searchChannel } = useChannelSearch();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchChannel(query);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="@username o URL del canal"
          minLength={2}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {channel && (
        <div className="channel-info">
          <h2>{channel.name}</h2>
          {channel.thumbnail && (
            <img src={channel.thumbnail} alt={channel.name} />
          )}
          <p>Username: {channel.username || 'No disponible'}</p>
          <p>ID: {channel.channelId}</p>
        </div>
      )}
    </div>
  );
};
```

---

## 2. Seguir Canal

Permite a un usuario autenticado seguir un canal de YouTube para recibir notificaciones de nuevos videos.

### Endpoint

```
POST /api/channels/:channelId/follow
```

### Tipo de Acceso

**🔒 Privado** - Requiere autenticación

Debes incluir el token de acceso en el header `Authorization`.

### Parámetros de URL

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `channelId` | string | ✅ Sí | MongoDB ObjectId del canal a seguir |

### Headers Requeridos

```
Authorization: Bearer <access_token>
```

### Validaciones

- El `channelId` debe ser un ObjectId válido de MongoDB (24 caracteres hexadecimales)
- El canal debe existir en la base de datos
- El usuario no debe estar siguiendo ya el canal (idempotencia)

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "Channel followed successfully",
  "data": {
    "channel": {
      "_id": "674d8e9f12a3b4c5d6e7f890",
      "channelId": "UCam8T03EOFBsNdR0thrFHdQ",
      "name": "Vegetta777",
      "username": "@vegetta777",
      "thumbnail": "https://yt3.ggpht.com/ytc/AOPolaSdq...",
      "followersCount": 42
    }
  }
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | string | MongoDB ObjectId del canal |
| `channelId` | string | ID único del canal de YouTube |
| `name` | string | Nombre del canal |
| `username` | string | Username del canal con @ |
| `thumbnail` | string \| null | URL de la imagen del canal |
| `followersCount` | number | Número actualizado de seguidores en TuberIA (no de YouTube) |

### Errores Posibles

#### 400 Bad Request - channelId inválido

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "channelId",
      "message": "Invalid MongoDB ObjectId"
    }
  ]
}
```

#### 401 Unauthorized - Token faltante o inválido

```json
{
  "success": false,
  "message": "No token provided"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 404 Not Found - Canal no existe

```json
{
  "success": false,
  "message": "Channel not found"
}
```

#### 409 Conflict - Ya sigues este canal

```json
{
  "success": false,
  "message": "You are already following this channel"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "An error occurred while following the channel"
}
```

### Ejemplo de uso (JavaScript Fetch)

```javascript
const followChannel = async (channelId, accessToken) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/channels/${channelId}/follow`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('Canal seguido:', data.data.channel);
      return data.data.channel;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al seguir canal:', error);
    throw error;
  }
};

// Uso
const channel = await followChannel('674d8e9f12a3b4c5d6e7f890', userToken);
```

### Ejemplo de uso (Axios)

```javascript
import axios from 'axios';

const followChannel = async (channelId, accessToken) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/channels/${channelId}/follow`,
      {}, // No body needed
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (response.data.success) {
      return response.data.data.channel;
    }
  } catch (error) {
    if (error.response) {
      // Manejo específico de errores
      switch (error.response.status) {
        case 401:
          throw new Error('No estás autenticado. Por favor inicia sesión');
        case 404:
          throw new Error('Canal no encontrado');
        case 409:
          throw new Error('Ya sigues este canal');
        default:
          throw new Error(error.response.data.message || 'Error al seguir el canal');
      }
    }
    throw error;
  }
};
```

### Ejemplo de uso (React Hook)

```typescript
import { useState } from 'react';

interface ChannelInfo {
  _id: string;
  channelId: string;
  name: string;
  username: string;
  thumbnail: string | null;
  followersCount: number;
}

interface UseFollowChannelReturn {
  followChannel: (channelId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  followedChannel: ChannelInfo | null;
}

export const useFollowChannel = (accessToken: string): UseFollowChannelReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followedChannel, setFollowedChannel] = useState<ChannelInfo | null>(null);

  const followChannel = async (channelId: string) => {
    setLoading(true);
    setError(null);
    setFollowedChannel(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/channels/${channelId}/follow`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setFollowedChannel(data.data.channel);
      } else {
        // Manejo de errores específicos
        if (response.status === 409) {
          setError('Ya sigues este canal');
        } else if (response.status === 404) {
          setError('Canal no encontrado');
        } else if (response.status === 401) {
          setError('Debes iniciar sesión');
        } else {
          setError(data.message || 'Error al seguir el canal');
        }
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { followChannel, loading, error, followedChannel };
};

// Uso en componente
const FollowButton: React.FC<{ channelId: string; accessToken: string }> = ({
  channelId,
  accessToken
}) => {
  const { followChannel, loading, error, followedChannel } = useFollowChannel(accessToken);

  const handleFollow = () => {
    followChannel(channelId);
  };

  return (
    <div>
      <button onClick={handleFollow} disabled={loading}>
        {loading ? 'Siguiendo...' : 'Seguir Canal'}
      </button>

      {error && <div className="error">{error}</div>}

      {followedChannel && (
        <div className="success">
          Ahora sigues a {followedChannel.name}
          ({followedChannel.followersCount} seguidores en TuberIA)
        </div>
      )}
    </div>
  );
};
```

### Notas Importantes

1. **Autenticación Requerida**: Debes obtener el token mediante login (`POST /api/auth/login`)
2. **channelId es MongoDB ObjectId**: No confundir con el `channelId` de YouTube. Este es el `_id` del documento en la base de datos
3. **Idempotencia**: Si intentas seguir un canal que ya sigues, recibirás un error 409
4. **followersCount**: Es el número de usuarios de TuberIA que siguen el canal, no los suscriptores de YouTube
5. **Operación Atómica**: Se crea la relación UserChannel y se incrementa el contador en una sola transacción

---

## 3. Dejar de Seguir Canal

Permite a un usuario autenticado dejar de seguir un canal de YouTube.

### Endpoint

```
DELETE /api/channels/:channelId/unfollow
```

### Tipo de Acceso

**🔒 Privado** - Requiere autenticación

Debes incluir el token de acceso en el header `Authorization`.

### Parámetros de URL

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `channelId` | string | ✅ Sí | MongoDB ObjectId del canal a dejar de seguir |

### Headers Requeridos

```
Authorization: Bearer <access_token>
```

### Validaciones

- El `channelId` debe ser un ObjectId válido de MongoDB
- El canal debe existir en la base de datos
- El usuario debe estar siguiendo el canal actualmente

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "Successfully unfollowed channel",
  "data": null
}
```

### Errores Posibles

#### 400 Bad Request - channelId inválido

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "channelId",
      "message": "Invalid MongoDB ObjectId"
    }
  ]
}
```

#### 401 Unauthorized - Token faltante o inválido

```json
{
  "success": false,
  "message": "No token provided"
}
```

#### 404 Not Found - Canal no existe

```json
{
  "success": false,
  "message": "Channel not found"
}
```

#### 404 Not Found - No sigues este canal

```json
{
  "success": false,
  "message": "You are not following this channel"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "An error occurred while unfollowing the channel"
}
```

### Ejemplo de uso (JavaScript Fetch)

```javascript
const unfollowChannel = async (channelId, accessToken) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/channels/${channelId}/unfollow`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log('Canal dejado de seguir exitosamente');
      return true;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al dejar de seguir canal:', error);
    throw error;
  }
};

// Uso
await unfollowChannel('674d8e9f12a3b4c5d6e7f890', userToken);
```

### Ejemplo de uso (Axios)

```javascript
import axios from 'axios';

const unfollowChannel = async (channelId, accessToken) => {
  try {
    const response = await axios.delete(
      `http://localhost:5000/api/channels/${channelId}/unfollow`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (response.data.success) {
      return true;
    }
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error('No estás autenticado');
        case 404:
          if (error.response.data.message.includes('not following')) {
            throw new Error('No estás siguiendo este canal');
          }
          throw new Error('Canal no encontrado');
        default:
          throw new Error(error.response.data.message || 'Error al dejar de seguir');
      }
    }
    throw error;
  }
};
```

### Ejemplo de uso (React Hook)

```typescript
import { useState } from 'react';

interface UseUnfollowChannelReturn {
  unfollowChannel: (channelId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useUnfollowChannel = (accessToken: string): UseUnfollowChannelReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const unfollowChannel = async (channelId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `http://localhost:5000/api/channels/${channelId}/unfollow`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        if (response.status === 404 && data.message.includes('not following')) {
          setError('No estás siguiendo este canal');
        } else {
          setError(data.message || 'Error al dejar de seguir');
        }
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { unfollowChannel, loading, error, success };
};

// Uso en componente
const UnfollowButton: React.FC<{ channelId: string; accessToken: string }> = ({
  channelId,
  accessToken
}) => {
  const { unfollowChannel, loading, error, success } = useUnfollowChannel(accessToken);

  const handleUnfollow = () => {
    if (confirm('¿Estás seguro de que quieres dejar de seguir este canal?')) {
      unfollowChannel(channelId);
    }
  };

  return (
    <div>
      <button onClick={handleUnfollow} disabled={loading}>
        {loading ? 'Procesando...' : 'Dejar de Seguir'}
      </button>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Has dejado de seguir este canal</div>}
    </div>
  );
};
```

### Notas Importantes

1. **Operación Irreversible**: Si dejas de seguir un canal, tendrás que volver a seguirlo manualmente
2. **Decremento Automático**: El `followersCount` del canal se decrementa automáticamente
3. **No se eliminan datos históricos**: Los videos y resúmenes del canal permanecen en la base de datos
4. **Polling RSS**: Si el canal llega a 0 seguidores, dejará de ser monitoreado por el sistema de RSS

---

## 4. Obtener Canales Seguidos

Obtiene la lista completa de canales que sigue el usuario autenticado.

### Endpoint

```
GET /api/channels/user/followed
```

### Tipo de Acceso

**🔒 Privado** - Requiere autenticación

Debes incluir el token de acceso en el header `Authorization`.

### Headers Requeridos

```
Authorization: Bearer <access_token>
```

### Query Parameters

Ninguno. El endpoint usa el `userId` del token JWT automáticamente.

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "Followed channels retrieved successfully",
  "data": {
    "channels": [
      {
        "_id": "674d8e9f12a3b4c5d6e7f890",
        "channelId": "UCam8T03EOFBsNdR0thrFHdQ",
        "name": "Vegetta777",
        "username": "@vegetta777",
        "thumbnail": "https://yt3.ggpht.com/ytc/AOPolaSdq...",
        "description": "Canal de gaming y entretenimiento",
        "followersCount": 42,
        "lastChecked": "2025-12-02T18:30:00.000Z",
        "subscribedAt": "2025-12-01T10:00:00.000Z"
      },
      {
        "_id": "674d8e9f12a3b4c5d6e7f891",
        "channelId": "UCX6OQ3DkcsbYNE6H8uQQuVA",
        "name": "MrBeast",
        "username": "@MrBeast",
        "thumbnail": "https://yt3.ggpht.com/ytc/...",
        "description": null,
        "followersCount": 150,
        "lastChecked": "2025-12-02T18:25:00.000Z",
        "subscribedAt": "2025-11-30T14:30:00.000Z"
      }
    ],
    "count": 2
  }
}
```

### Campos de la Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `channels` | array | Lista de canales seguidos por el usuario |
| `count` | number | Número total de canales seguidos |

### Campos de cada Canal

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `_id` | string | MongoDB ObjectId del canal |
| `channelId` | string | ID único del canal de YouTube |
| `name` | string | Nombre del canal |
| `username` | string | Username del canal con @ |
| `thumbnail` | string \| null | URL de la imagen del canal |
| `description` | string \| null | Descripción del canal |
| `followersCount` | number | Número de seguidores en TuberIA |
| `lastChecked` | string \| null | Última vez que se verificó el canal (ISO 8601) |
| `subscribedAt` | string | Fecha en que el usuario siguió el canal (ISO 8601) |

### Ordenamiento

Los canales se devuelven ordenados por **fecha de suscripción** (más recientes primero).

### Errores Posibles

#### 401 Unauthorized - Token faltante o inválido

```json
{
  "success": false,
  "message": "No token provided"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "message": "An error occurred while fetching followed channels"
}
```

### Ejemplo de uso (JavaScript Fetch)

```javascript
const getFollowedChannels = async (accessToken) => {
  try {
    const response = await fetch(
      'http://localhost:5000/api/channels/user/followed',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const data = await response.json();

    if (data.success) {
      console.log(`Sigues ${data.data.count} canales:`, data.data.channels);
      return data.data;
    } else {
      console.error('Error:', data.message);
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error al obtener canales seguidos:', error);
    throw error;
  }
};

// Uso
const { channels, count } = await getFollowedChannels(userToken);
channels.forEach(channel => {
  console.log(`- ${channel.name} (${channel.username})`);
});
```

### Ejemplo de uso (Axios)

```javascript
import axios from 'axios';

const getFollowedChannels = async (accessToken) => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/channels/user/followed',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('No estás autenticado. Por favor inicia sesión');
    }
    throw new Error(error.response?.data?.message || 'Error al obtener canales');
  }
};
```

### Ejemplo de uso (React Hook)

```typescript
import { useState, useEffect } from 'react';

interface Channel {
  _id: string;
  channelId: string;
  name: string;
  username: string;
  thumbnail: string | null;
  description: string | null;
  followersCount: number;
  lastChecked: string | null;
  subscribedAt: string;
}

interface UseFollowedChannelsReturn {
  channels: Channel[];
  count: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFollowedChannels = (accessToken: string): UseFollowedChannelsReturn => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChannels = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'http://localhost:5000/api/channels/user/followed',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (data.success) {
        setChannels(data.data.channels);
        setCount(data.data.count);
      } else {
        setError(data.message || 'Error al cargar canales');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchChannels();
    }
  }, [accessToken]);

  return { channels, count, loading, error, refetch: fetchChannels };
};

// Uso en componente
const FollowedChannelsList: React.FC<{ accessToken: string }> = ({ accessToken }) => {
  const { channels, count, loading, error, refetch } = useFollowedChannels(accessToken);

  if (loading) {
    return <div>Cargando canales seguidos...</div>;
  }

  if (error) {
    return (
      <div className="error">
        Error: {error}
        <button onClick={refetch}>Reintentar</button>
      </div>
    );
  }

  if (count === 0) {
    return <div>No sigues ningún canal todavía</div>;
  }

  return (
    <div>
      <h2>Canales Seguidos ({count})</h2>
      <button onClick={refetch}>Actualizar</button>

      <div className="channels-grid">
        {channels.map(channel => (
          <div key={channel._id} className="channel-card">
            {channel.thumbnail && (
              <img src={channel.thumbnail} alt={channel.name} />
            )}
            <h3>{channel.name}</h3>
            <p>{channel.username}</p>
            <p className="description">{channel.description || 'Sin descripción'}</p>
            <p className="meta">
              {channel.followersCount} seguidores en TuberIA
            </p>
            <p className="date">
              Siguiendo desde: {new Date(channel.subscribedAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Servicio API Completo (Recomendado)

```typescript
// services/channelApi.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Channel {
  _id: string;
  channelId: string;
  name: string;
  username: string;
  thumbnail: string | null;
  description: string | null;
  followersCount: number;
  lastChecked: string | null;
  subscribedAt: string;
}

export interface FollowedChannelsResponse {
  channels: Channel[];
  count: number;
}

export class ChannelApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ChannelApiError';
  }
}

export const channelApi = {
  /**
   * Obtiene todos los canales seguidos por el usuario
   */
  async getFollowedChannels(accessToken: string): Promise<FollowedChannelsResponse> {
    const url = `${API_BASE_URL}/channels/user/followed`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();

      if (!data.success) {
        throw new ChannelApiError(
          data.message || 'Error al obtener canales',
          response.status,
          response.status === 401 ? 'UNAUTHORIZED' : 'SERVER_ERROR'
        );
      }

      return data.data;

    } catch (error) {
      if (error instanceof ChannelApiError) {
        throw error;
      }
      throw new ChannelApiError(
        'Error de conexión',
        0,
        'NETWORK_ERROR'
      );
    }
  }
};

// Uso
try {
  const { channels, count } = await channelApi.getFollowedChannels(userToken);
  console.log(`Tienes ${count} canales seguidos`);
} catch (error) {
  if (error instanceof ChannelApiError) {
    if (error.code === 'UNAUTHORIZED') {
      // Redirigir a login
      window.location.href = '/login';
    } else {
      alert('Error al cargar canales');
    }
  }
}
```

### Notas Importantes

1. **Paginación**: Actualmente no implementada. Devuelve todos los canales seguidos
2. **Ordenamiento**: Por fecha de suscripción (más recientes primero)
3. **Canales Eliminados**: Se filtran automáticamente si el canal fue eliminado de la base de datos
4. **Cache**: Considera implementar caché en el frontend para evitar peticiones innecesarias
5. **Refetch**: Llama a este endpoint después de seguir/dejar de seguir un canal para actualizar la lista

---

## 5. Modelo de Datos del Canal

### TypeScript Interface

```typescript
interface YouTubeChannel {
  channelId: string;        // ID único del canal de YouTube (ej: "UCam8T03EOFBsNdR0thrFHdQ")
  name: string;             // Nombre del canal (ej: "Vegetta777")
  username: string | null;  // Username con @ (ej: "@vegetta777") o null
  thumbnail: string | null; // URL de la imagen del canal o null si no tiene videos
  description: null;        // Siempre null (no disponible en RSS feed)
}
```

### Ejemplo de Datos Reales

```json
{
  "channelId": "UCam8T03EOFBsNdR0thrFHdQ",
  "name": "Vegetta777",
  "username": "@vegetta777",
  "thumbnail": "https://yt3.ggpht.com/ytc/AOPolaSdqx...",
  "description": null
}
```

### Relación con el Modelo de Base de Datos

El endpoint de búsqueda **NO guarda** el canal en la base de datos. Solo retorna información en tiempo real de YouTube.

Para guardar el canal y seguirlo, usa el endpoint `POST /api/channels/:channelId/follow`.

El modelo `Channel` en la base de datos tiene estos campos adicionales:
- `owner`: Usuario que agregó el canal (opcional)
- `followersCount`: Número de usuarios de TuberIA que siguen este canal (no subs de YouTube)
- `lastChecked`: Última vez que se verificó el canal mediante RSS
- `isActive`: Estado del canal

### Modelo UserChannel (Relación de Seguimiento)

```typescript
interface UserChannel {
  _id: ObjectId;
  userId: ObjectId;       // Referencia al usuario
  channelId: ObjectId;    // Referencia al canal
  subscribedAt: Date;     // Fecha en que empezó a seguir
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 6. Manejo de Errores

### Estructura de Respuesta de Error

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [  // Opcional, solo para errores de validación
    {
      "field": "nombre_del_campo",
      "message": "Mensaje específico del error"
    }
  ]
}
```

### Códigos de Estado HTTP

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Canal encontrado exitosamente |
| 400 | Bad Request | Validación fallida, URL inválida, input incorrecto |
| 404 | Not Found | Canal no existe o no se pudo encontrar |
| 429 | Too Many Requests | Rate limit del servidor o de YouTube |
| 500 | Internal Server Error | Error de YouTube, timeout, problemas de red |

### Manejo de Errores Recomendado

```javascript
const searchChannelWithErrorHandling = async (query) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/channels/search?q=${encodeURIComponent(query)}`
    );

    const data = await response.json();

    if (!data.success) {
      // Manejo específico por código de estado
      switch (response.status) {
        case 400:
          return {
            error: 'INPUT_INVALID',
            message: data.message || 'Entrada inválida',
            userMessage: 'Por favor verifica el username o URL del canal'
          };

        case 404:
          return {
            error: 'CHANNEL_NOT_FOUND',
            message: data.message,
            userMessage: 'No se encontró el canal. Verifica que el username sea correcto'
          };

        case 429:
          return {
            error: 'RATE_LIMIT',
            message: data.message,
            userMessage: 'Demasiadas búsquedas. Por favor espera un momento'
          };

        case 500:
          return {
            error: 'SERVER_ERROR',
            message: data.message,
            userMessage: 'Error del servidor. Por favor intenta de nuevo más tarde'
          };

        default:
          return {
            error: 'UNKNOWN_ERROR',
            message: data.message,
            userMessage: 'Ocurrió un error inesperado'
          };
      }
    }

    return { data: data.data };

  } catch (error) {
    return {
      error: 'NETWORK_ERROR',
      message: error.message,
      userMessage: 'Error de conexión. Verifica tu internet'
    };
  }
};

// Uso
const result = await searchChannelWithErrorHandling('@vegetta777');

if (result.error) {
  console.error('Error:', result.error);
  alert(result.userMessage);
} else {
  console.log('Canal encontrado:', result.data);
}
```

---

## 7. Ejemplos de Implementación

### Componente de Búsqueda Completo (React)

```typescript
import React, { useState } from 'react';

interface Channel {
  channelId: string;
  name: string;
  username: string | null;
  thumbnail: string | null;
  description: null;
}

const ChannelSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim().length < 2) {
      setError('El término de búsqueda debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);
    setError(null);
    setChannel(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/channels/search?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (data.success) {
        setChannel(data.data);
      } else {
        // Manejo de errores según el status
        if (response.status === 404) {
          setError('Canal no encontrado. Verifica el username o URL');
        } else if (response.status === 400) {
          setError(data.message || 'Entrada inválida');
        } else if (response.status === 429) {
          setError('Demasiadas búsquedas. Por favor espera un momento');
        } else {
          setError(data.message || 'Error al buscar el canal');
        }
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta de nuevo.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="channel-search">
      <h2>Buscar Canal de YouTube</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="@username o URL del canal"
          minLength={2}
          disabled={loading}
        />
        <button type="submit" disabled={loading || query.trim().length < 2}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {channel && (
        <div className="channel-result">
          <div className="channel-header">
            {channel.thumbnail ? (
              <img
                src={channel.thumbnail}
                alt={channel.name}
                className="channel-thumbnail"
              />
            ) : (
              <div className="channel-thumbnail-placeholder">
                Sin imagen
              </div>
            )}
            <div className="channel-info">
              <h3>{channel.name}</h3>
              {channel.username && (
                <p className="channel-username">{channel.username}</p>
              )}
              <p className="channel-id">ID: {channel.channelId}</p>
            </div>
          </div>
          <button onClick={() => handleFollowChannel(channel)}>
            Seguir Canal
          </button>
        </div>
      )}
    </div>
  );
};

const handleFollowChannel = (channel: Channel) => {
  // Implementar lógica para seguir el canal
  console.log('Seguir canal:', channel);
};

export default ChannelSearch;
```

### Servicio API (para organizar mejor el código)

```typescript
// services/channelApi.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Channel {
  channelId: string;
  name: string;
  username: string | null;
  thumbnail: string | null;
  description: null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export class ChannelApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ChannelApiError';
  }
}

export const channelApi = {
  /**
   * Busca un canal de YouTube por username o URL
   * @param query Username (@vegetta777) o URL del canal
   * @returns Información del canal
   * @throws ChannelApiError si hay un error
   */
  async searchChannel(query: string): Promise<Channel> {
    if (!query || query.trim().length < 2) {
      throw new ChannelApiError(
        'El término de búsqueda debe tener al menos 2 caracteres',
        400,
        'INVALID_INPUT'
      );
    }

    const url = `${API_BASE_URL}/channels/search?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(url);
      const data: ApiResponse<Channel> = await response.json();

      if (!data.success) {
        const errorCode = this.getErrorCode(response.status);
        throw new ChannelApiError(
          data.message || 'Error al buscar el canal',
          response.status,
          errorCode
        );
      }

      if (!data.data) {
        throw new ChannelApiError(
          'No se recibieron datos del servidor',
          500,
          'NO_DATA'
        );
      }

      return data.data;

    } catch (error) {
      if (error instanceof ChannelApiError) {
        throw error;
      }

      // Error de red
      throw new ChannelApiError(
        'Error de conexión. Verifica tu internet',
        0,
        'NETWORK_ERROR'
      );
    }
  },

  getErrorCode(status: number): string {
    switch (status) {
      case 400: return 'INVALID_INPUT';
      case 404: return 'CHANNEL_NOT_FOUND';
      case 429: return 'RATE_LIMIT';
      case 500: return 'SERVER_ERROR';
      default: return 'UNKNOWN_ERROR';
    }
  }
};

// Uso del servicio
import { channelApi, ChannelApiError } from './services/channelApi';

try {
  const channel = await channelApi.searchChannel('@vegetta777');
  console.log('Canal encontrado:', channel);
} catch (error) {
  if (error instanceof ChannelApiError) {
    console.error(`Error ${error.code}:`, error.message);

    // Manejo específico por código
    switch (error.code) {
      case 'CHANNEL_NOT_FOUND':
        alert('Canal no encontrado');
        break;
      case 'RATE_LIMIT':
        alert('Demasiadas búsquedas, espera un momento');
        break;
      default:
        alert('Error al buscar el canal');
    }
  }
}
```

---

## 8. Rate Limiting

### Límites por Endpoint

Los límites varían según el endpoint y si requiere autenticación:

| Endpoint | Límite | Ventana | Scope |
|----------|--------|---------|-------|
| `GET /api/channels/search` | 100 requests | 15 min | Por IP |
| `POST /api/channels/:id/follow` | 20 requests | 1 min | Por usuario |
| `DELETE /api/channels/:id/unfollow` | 20 requests | 1 min | Por usuario |
| `GET /api/channels/user/followed` | 60 requests | 1 min | Por usuario |

### Límites del Servidor (Públicos)

**Endpoint de búsqueda** (`GET /api/channels/search`):
- **Límite**: 100 peticiones por IP
- **Ventana**: 15 minutos
- **Scope**: Por dirección IP

Si se excede el límite del servidor:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

Headers de respuesta cuando hay rate limiting:
```
RateLimit-Limit: 100
RateLimit-Remaining: 5
RateLimit-Reset: 1700000900
```

### Límites por Usuario (Autenticados)

**Endpoints protegidos** (follow, unfollow, followed):
- Los límites se aplican por usuario autenticado, no por IP
- Más generosos que los límites públicos
- El token JWT identifica al usuario

### Límites de YouTube

YouTube puede aplicar rate limiting si se hacen demasiadas peticiones. El backend maneja esto con:

- **User-Agent rotativo**: Para evitar detección
- **Timeout**: 15 segundos por petición
- **Retry logic**: No implementado actualmente

Si YouTube aplica rate limit:

```json
{
  "success": false,
  "message": "YouTube rate limit exceeded. Please try again later."
}
```

### Recomendaciones

1. **Debounce en el frontend**: Espera 500-1000ms después de que el usuario deje de escribir
2. **Caché local**: Guarda resultados de búsqueda en localStorage/sessionStorage
3. **Evitar búsquedas duplicadas**: No buscar el mismo canal múltiples veces

Ejemplo de debounce:

```typescript
import { useState, useEffect } from 'react';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Uso
const ChannelSearchWithDebounce = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchChannel(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Buscar canal..."
    />
  );
};
```

---

## 9. Consideraciones Técnicas

### Timeout y Performance

- **Timeout del request**: 15 segundos
- **Tiempo promedio de respuesta**: 2-5 segundos
- **Máximo esperado**: 15 segundos

Recomendación: Mostrar un loading indicator después de 1 segundo de espera.

```typescript
const searchWithTimeout = async (query: string, timeoutMs: number = 20000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `http://localhost:5000/api/channels/search?q=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La búsqueda tardó demasiado');
    }
    throw error;
  }
};
```

### Datos Null o Ausentes

Algunos campos pueden ser `null`:

- `username`: Si no se pudo extraer del feed RSS
- `thumbnail`: Si el canal no tiene videos
- `description`: Siempre `null` (no disponible)

Manejo recomendado:

```typescript
// Verificar antes de usar
if (channel.thumbnail) {
  <img src={channel.thumbnail} alt={channel.name} />
} else {
  <div className="no-thumbnail">Sin imagen</div>
}

// Usar valores por defecto
const displayUsername = channel.username || 'Username no disponible';
```

### CORS

El backend está configurado con CORS abierto (`origin: '*'`) para desarrollo.

En producción, asegúrate de que tu dominio frontend esté configurado en el backend.

### Testing del Endpoint

Puedes probar el endpoint con:

**curl**:
```bash
# Con username
curl "http://localhost:5000/api/channels/search?q=@vegetta777"

# Con URL (URL encode necesario)
curl "http://localhost:5000/api/channels/search?q=https%3A%2F%2Fyoutube.com%2F%40vegetta777"
```

**Postman/Thunder Client**:
```
GET http://localhost:5000/api/channels/search?q=@vegetta777
```

---

## Notas Importantes

1. **No se guarda en la base de datos**: Este endpoint solo busca y retorna información, no guarda nada
2. **Datos en tiempo real**: La información viene del RSS feed de YouTube en tiempo real
3. **Limitaciones del RSS feed**:
   - No incluye descripción del canal
   - No incluye número de suscriptores de YouTube
   - Thumbnail se extrae del primer video
4. **Acceso público**: Por ahora no requiere autenticación (puede cambiar en el futuro)
5. **Rate limiting**: Ten en cuenta los límites de YouTube y del servidor

---

## Endpoints Implementados

### ✅ Completados

- ✅ `GET /api/channels/search` - Búsqueda de canal por username o URL
- ✅ `POST /api/channels/:channelId/follow` - Seguir un canal
- ✅ `DELETE /api/channels/:channelId/unfollow` - Dejar de seguir un canal
- ✅ `GET /api/channels/user/followed` - Obtener canales que sigue el usuario

### 🚧 Próximos Endpoints (Roadmap)

Endpoints planificados para futuras versiones:

- `GET /api/channels/:channelId/videos` - Obtener videos de un canal seguido
- `GET /api/channels/:channelId` - Obtener información detallada de un canal guardado
- `GET /api/channels/:channelId/is-following` - Verificar si sigues un canal específico
- `GET /api/channels/popular` - Obtener canales más seguidos en TuberIA

---

## Contacto y Soporte

Si encuentras algún problema o tienes preguntas sobre la API:

- Revisa los logs del backend para más detalles sobre errores
- Verifica que MongoDB esté corriendo
- Asegúrate de que el backend esté en el puerto correcto (5000)
- Consulta los tests de integración en `backend/src/testing/integration/routes/channel.routes.test.js`

---

## Changelog

### v2.0.0 (2025-12-03)
- ✅ Endpoint de seguir canal implementado (`POST /api/channels/:channelId/follow`)
- ✅ Endpoint de dejar de seguir canal implementado (`DELETE /api/channels/:channelId/unfollow`)
- ✅ Endpoint de obtener canales seguidos implementado (`GET /api/channels/user/followed`)
- ✅ Sistema de relaciones UserChannel
- ✅ Contador automático de seguidores por canal
- ✅ Autenticación requerida para operaciones de seguimiento
- ✅ Tests de integración completos para follow/unfollow
- ✅ Documentación completa con ejemplos de React Hooks

### v1.0.0 (2025-11-26)
- ✅ Endpoint de búsqueda de canales implementado (`GET /api/channels/search`)
- ✅ Soporte para username y URL
- ✅ Validaciones completas
- ✅ Manejo de errores robusto
- ✅ Tests unitarios e integración
- ✅ Documentación completa
