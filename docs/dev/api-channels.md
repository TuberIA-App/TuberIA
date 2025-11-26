# API de Canales de YouTube - TuberIA

Documentación completa del endpoint de búsqueda de canales de YouTube del backend de TuberIA.

## URL Base

```
http://localhost:5000/api/channels
```

**Nota**: El puerto por defecto del backend es `5000` según la configuración en `.env`

## Tabla de Contenidos

- [1. Búsqueda de Canal](#1-búsqueda-de-canal)
- [2. Modelo de Datos del Canal](#2-modelo-de-datos-del-canal)
- [3. Manejo de Errores](#3-manejo-de-errores)
- [4. Ejemplos de Implementación](#4-ejemplos-de-implementación)
- [5. Rate Limiting](#5-rate-limiting)
- [6. Consideraciones Técnicas](#6-consideraciones-técnicas)

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

**Nota**: Las operaciones de seguimiento/guardado de canales (endpoints futuros como `/follow` o `/unfollow`) sí requerirán autenticación.

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

## 2. Modelo de Datos del Canal

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

Si necesitas guardar el canal para seguirlo, deberás usar el endpoint de "seguir canal" (cuando se implemente).

El modelo `Channel` en la base de datos tiene estos campos adicionales:
- `owner`: Usuario que agregó el canal (opcional)
- `followersCount`: Número de usuarios de TuberIA que siguen este canal (no subs de YouTube)
- `lastChecked`: Última vez que se verificó el canal
- `isActive`: Estado del canal

---

## 3. Manejo de Errores

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

## 4. Ejemplos de Implementación

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

## 5. Rate Limiting

### Límites del Servidor

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

## 6. Consideraciones Técnicas

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

## Próximos Endpoints (Roadmap)

Endpoints que se implementarán en el futuro:

- `POST /api/channels/:channelId/follow` - Seguir un canal
- `DELETE /api/channels/:channelId/unfollow` - Dejar de seguir un canal
- `GET /api/channels/following` - Obtener canales que sigue el usuario
- `GET /api/channels/:channelId/videos` - Obtener videos de un canal
- `GET /api/channels/:channelId` - Obtener información detallada de un canal guardado

---

## Contacto y Soporte

Si encuentras algún problema o tienes preguntas sobre la API:

- Revisa los logs del backend para más detalles sobre errores
- Verifica que MongoDB esté corriendo
- Asegúrate de que el backend esté en el puerto correcto (5000)
- Consulta los tests de integración en `backend/src/testing/integration/routes/channel.routes.test.js`

---

## Changelog

### v1.0.0 (2025-11-26)
- ✅ Endpoint de búsqueda de canales implementado
- ✅ Soporte para username y URL
- ✅ Validaciones completas
- ✅ Manejo de errores robusto
- ✅ Tests unitarios e integración
- ✅ Documentación completa
