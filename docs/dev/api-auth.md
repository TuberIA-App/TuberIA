# API de Autenticación - TuberIA

Documentación completa de los endpoints de autenticación (Login, Registro y JWT) del backend de TuberIA.

## URL Base

```
http://localhost:5000/api/auth
```

**Nota**: El puerto por defecto del backend es `5000` según la configuración en `.env`

## Tabla de Contenidos

- [1. Registro de Usuario](#1-registro-de-usuario)
- [2. Inicio de Sesión](#2-inicio-de-sesión)
- [3. Refrescar Token](#3-refrescar-token)
- [4. Obtener Usuario Actual](#4-obtener-usuario-actual)
- [5. Cerrar Sesión (Logout)](#5-cerrar-sesión-logout)
- [6. Gestión de Tokens JWT](#6-gestión-de-tokens-jwt)
- [7. Token Expiration Handling](#7-token-expiration-handling)
- [8. Manejo de Errores](#8-manejo-de-errores)

---

## 1. Registro de Usuario

Registra un nuevo usuario en el sistema.

### Endpoint

```
POST /api/auth/register
```

### Headers

```
Content-Type: application/json
```

### Body (JSON)

```json
{
  "username": "string",    // Requerido
  "name": "string",        // Opcional
  "email": "string",       // Requerido
  "password": "string"     // Requerido
}
```

### Validaciones

- **username**:
  - Requerido
  - Mínimo 3 caracteres, máximo 30
  - Solo letras y números (alfanumérico)
  - Único en el sistema

- **name**:
  - Opcional
  - Máximo 100 caracteres

- **email**:
  - Requerido
  - Formato de email válido
  - Único en el sistema

- **password**:
  - Requerido
  - Mínimo 8 caracteres
  - Debe contener al menos una letra y un número

### Respuesta Exitosa (201 Created)

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-11-19T12:00:00.000Z",
      "updatedAt": "2025-11-19T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Errores Posibles

**409 Conflict** - Email ya registrado
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**409 Conflict** - Username ya registrado
```json
{
  "success": false,
  "message": "Username already exists"
}
```

**400 Bad Request** - Validación fallida
```json
{
  "success": false,
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

### Ejemplo de uso (JavaScript)

```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'johndoe',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'mypassword123'
  })
});

const data = await response.json();

if (data.success) {
  // Guardar tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  // Guardar usuario
  localStorage.setItem('user', JSON.stringify(data.data.user));
}
```

---

## 2. Inicio de Sesión

Autentica un usuario existente.

### Endpoint

```
POST /api/auth/login
```

### Headers

```
Content-Type: application/json
```

### Body (JSON)

```json
{
  "email": "string",       // Requerido
  "password": "string"     // Requerido
}
```

### Validaciones

- **email**:
  - Requerido
  - Formato de email válido

- **password**:
  - Requerido

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "lastLogin": "2025-11-19T12:00:00.000Z",
      "createdAt": "2025-11-19T10:00:00.000Z",
      "updatedAt": "2025-11-19T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Errores Posibles

**401 Unauthorized** - Credenciales inválidas
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**400 Bad Request** - Validación fallida
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Ejemplo de uso (JavaScript)

```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'mypassword123'
  })
});

const data = await response.json();

if (data.success) {
  // Guardar tokens
  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  // Guardar usuario
  localStorage.setItem('user', JSON.stringify(data.data.user));
}
```

---

## 3. Refrescar Token

Obtiene un nuevo access token usando un refresh token válido.

### Endpoint

```
POST /api/auth/refresh
```

### Headers

```
Content-Type: application/json
```

### Body (JSON)

```json
{
  "refreshToken": "string"  // Requerido - JWT válido
}
```

### Validaciones

- **refreshToken**:
  - Requerido
  - Debe ser un JWT válido
  - No debe estar expirado

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Errores Posibles

**401 Unauthorized** - Token inválido o expirado
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

**401 Unauthorized** - Usuario no encontrado
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 Bad Request** - Formato de token inválido
```json
{
  "success": false,
  "errors": [
    {
      "field": "refreshToken",
      "message": "Invalid token format"
    }
  ]
}
```

### Ejemplo de uso (JavaScript)

```javascript
const refreshToken = localStorage.getItem('refreshToken');

const response = await fetch('http://localhost:5000/api/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});

const data = await response.json();

if (data.success) {
  // Actualizar access token
  localStorage.setItem('accessToken', data.data.accessToken);
}
```

---

## 4. Obtener Usuario Actual

Obtiene la información del usuario autenticado.

### Endpoint

```
GET /api/auth/me
```

### Headers

```
Authorization: Bearer {accessToken}
```

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "name": "John Doe",
      "email": "john@example.com",
      "lastLogin": "2025-11-19T12:00:00.000Z",
      "createdAt": "2025-11-19T10:00:00.000Z",
      "updatedAt": "2025-11-19T12:00:00.000Z"
    }
  }
}
```

### Errores Posibles

**401 Unauthorized** - Token no proporcionado
```json
{
  "success": false,
  "message": "No token provided"
}
```

**401 Unauthorized** - Token inválido
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**401 Unauthorized** - Usuario no encontrado
```json
{
  "success": false,
  "message": "User not found"
}
```

### Ejemplo de uso (JavaScript)

```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:5000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();

if (data.success) {
  console.log('Usuario actual:', data.data.user);
}
```

---

## 5. Cerrar Sesión (Logout)

Revoca los tokens de autenticación del usuario actual, invalidándolos inmediatamente.

### Endpoint

```
POST /api/auth/logout
```

### Headers

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Body (JSON) - Opcional

```json
{
  "refreshToken": "string"  // Opcional - Si se proporciona, también se revocará
}
```

### Descripción

Este endpoint implementa un sistema de revocación de tokens utilizando Redis blacklist con las siguientes características:

- **Token Revocation**: Los tokens se añaden a una blacklist en Redis y son rechazados inmediatamente
- **TTL Automático**: Los tokens en blacklist se eliminan automáticamente cuando expiran (limpieza automática)
- **Revocación Múltiple**: Puedes revocar tanto el access token como el refresh token en una sola llamada
- **Seguridad**: Los tokens se hashean (SHA-256) antes de almacenarlos en Redis para privacidad

### Respuesta Exitosa (200 OK)

```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "success": true,
    "message": "Logout successful"
  }
}
```

### Errores Posibles

**401 Unauthorized** - Token no proporcionado
```json
{
  "success": false,
  "message": "No token provided"
}
```

**401 Unauthorized** - Token inválido
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**401 Unauthorized** - Token expirado
```json
{
  "success": false,
  "message": "Token expired"
}
```

**401 Unauthorized** - Token ya revocado
```json
{
  "success": false,
  "message": "Token has been revoked"
}
```

**500 Internal Server Error** - Error al revocar tokens
```json
{
  "success": false,
  "message": "Error during logout"
}
```

### Ejemplo de uso (JavaScript)

#### Logout básico (solo access token)

```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();

if (data.success) {
  // Eliminar tokens del almacenamiento local
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Redirigir a login
  window.location.href = '/login';
}
```

#### Logout completo (access + refresh token)

```javascript
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

const response = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});

const data = await response.json();

if (data.success) {
  // Eliminar todos los tokens
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Redirigir a login
  window.location.href = '/login';
}
```

#### Función de logout reutilizable

```javascript
async function logout() {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    // Intentar revocar tokens en el backend
    await fetch('http://localhost:5000/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Siempre limpiar el localStorage, incluso si el backend falla
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Redirigir a login
    window.location.href = '/login';
  }
}
```

### Comportamiento de la Blacklist

1. **Revocación Inmediata**: Los tokens revocados son rechazados inmediatamente en todas las peticiones
2. **TTL Dinámico**: Cada token en blacklist tiene un TTL igual al tiempo restante hasta su expiración natural
3. **Limpieza Automática**: Redis elimina automáticamente los tokens cuando expiran (no hay acumulación infinita)
4. **Fail-Open**: Si Redis falla, el middleware permite el acceso temporalmente (prioriza disponibilidad)

### Escenarios de Uso

#### Logout Normal
```javascript
// Usuario hace logout voluntariamente
await logout();
```

#### Logout por Seguridad (Token Comprometido)
```javascript
// Usuario sospecha que su token fue robado
// Revoca ambos tokens inmediatamente
const response = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ refreshToken })
});

// El atacante no podrá usar ninguno de los tokens robados
```

#### Logout desde Múltiples Dispositivos
```javascript
// Cuando el usuario hace logout, TODOS sus tokens actuales se invalidan
// Esto incluye tokens en otros dispositivos si comparten el mismo refresh token
await logout();

// Para implementar "logout desde todos los dispositivos",
// el usuario debe hacer logout desde cada dispositivo
// o se puede implementar un endpoint adicional en el futuro
```

### Notas Importantes

1. **Siempre Limpiar LocalStorage**: Incluso si el logout en el backend falla, limpia los tokens locales
2. **Revocar Ambos Tokens**: Para máxima seguridad, siempre envía el refresh token en el body
3. **Manejo de Errores**: No bloquees el logout si el backend falla, el usuario debe poder limpiar su sesión localmente
4. **No Reutilizar Tokens**: Después de logout, NUNCA intentes reutilizar los tokens antiguos
5. **Refresh Token Invalidado**: Una vez revocado el refresh token, no se pueden obtener nuevos access tokens

### Testing con curl

```bash
# Logout solo con access token
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Logout con ambos tokens
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'

# Intentar usar token revocado (debería fallar con 401)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_REVOKED_ACCESS_TOKEN"
```

### Flujo Completo de Logout

```
Usuario hace click en "Logout"
  ↓
Frontend llama POST /api/auth/logout con access token en header
  ↓
Backend verifica que el token es válido (no expirado)
  ↓
Backend añade token a Redis blacklist con TTL
  ↓
Si se proporcionó refreshToken, también se añade a blacklist
  ↓
Backend responde: 200 "Logout successful"
  ↓
Frontend elimina todos los tokens de localStorage
  ↓
Frontend redirige a /login
  ↓
Si atacante intenta usar token revocado
  ↓
Backend responde: 401 "Token has been revoked"
```

---

## 6. Gestión de Tokens JWT

### Tipos de Tokens

El sistema utiliza dos tipos de tokens JWT:

#### Access Token
- **Duración**: 15 minutos (por defecto)
- **Uso**: Acceso a endpoints protegidos
- **Payload**:
  ```json
  {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "iat": 1700000000,
    "exp": 1700000900,
    "iss": "tuberia-api"
  }
  ```

#### Refresh Token
- **Duración**: 7 días (por defecto)
- **Uso**: Renovar access tokens
- **Payload**:
  ```json
  {
    "userId": "507f1f77bcf86cd799439011",
    "iat": 1700000000,
    "exp": 1700604800,
    "iss": "tuberia-api"
  }
  ```

### Flujo de Autenticación Recomendado

1. **Login/Registro**: Obtener ambos tokens (access + refresh)
2. **Almacenamiento**: Guardar tokens de forma segura
   - `localStorage` o `sessionStorage` para aplicaciones web
   - Almacenamiento seguro para aplicaciones móviles
3. **Uso del Access Token**: Incluir en header `Authorization: Bearer {token}`
4. **Renovación**: Cuando el access token expire (error 401), usar el refresh token para obtener uno nuevo
5. **Logout**:
   - **Paso 1**: Llamar a `POST /api/auth/logout` enviando ambos tokens (access en header, refresh en body)
   - **Paso 2**: Esperar confirmación del backend (tokens añadidos a blacklist)
   - **Paso 3**: Eliminar tokens del almacenamiento local
   - **Paso 4**: Redirigir al usuario a la página de login

### Ejemplo de Interceptor (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Request interceptor - añadir token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - manejar token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró y no hemos intentado refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Reintentar request original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token inválido - redirigir a login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 6. Token Expiration Handling

### Access Token Expiry

- **Duration:** 15 minutes (configurable via `JWT_ACCESS_EXPIRY`)
- **Behavior:** Returns `401 Unauthorized` immediately when expired
- **Response Time:** < 100ms (no hanging requests)
- **Timeout Protection:** All requests have a 30-second timeout to prevent hanging

### Error Responses for JWT Issues

#### Expired Token

When a token has expired, the backend responds immediately:

```http
GET /api/auth/me
Authorization: Bearer <expired_token>

HTTP/1.1 401 Unauthorized
{
  "success": false,
  "message": "Token expired"
}
```

**Important:** The backend will respond within 100ms, not hang indefinitely.

#### Invalid Token

```http
GET /api/auth/me
Authorization: Bearer <invalid_token>

HTTP/1.1 401 Unauthorized
{
  "success": false,
  "message": "Invalid token"
}
```

#### Token Not Active Yet

If a token has a `nbf` (not before) claim in the future:

```http
GET /api/auth/me
Authorization: Bearer <future_token>

HTTP/1.1 401 Unauthorized
{
  "success": false,
  "message": "Token not active yet"
}
```

#### Request Timeout

If a request exceeds the 30-second timeout:

```http
HTTP/1.1 408 Request Timeout
{
  "success": false,
  "message": "Request timeout",
  "error": "The server took too long to respond"
}
```

### Frontend Implementation Guide

When receiving 401 with "Token expired", implement automatic token refresh:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Request interceptor - add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired token
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === 'Token expired' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          { refreshToken }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed - redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export default api;
```

### Best Practices

1. **Client-Side Token Expiry Check**
   - Decode the JWT on the client to check expiry before making requests
   - Use a library like `jwt-decode` to read the `exp` claim
   - Refresh proactively if token expires in < 1 minute

```javascript
import jwtDecode from 'jwt-decode';

function isTokenExpiringSoon(token) {
  try {
    const decoded = jwtDecode(token);
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // Refresh if expires in less than 1 minute
    return timeUntilExpiry < 60000;
  } catch (error) {
    return true; // If can't decode, assume expired
  }
}
```

2. **Automatic Token Refresh**
   - Implement interceptors as shown above
   - Set `_retry` flag to prevent infinite loops
   - Handle refresh token expiration by redirecting to login

3. **Refresh Token Rotation**
   - Consider implementing refresh token rotation for enhanced security
   - Issue a new refresh token each time the access token is refreshed

4. **Logout on Refresh Failure**
   - Always clear all tokens and redirect to login if refresh fails
   - This ensures users can't get stuck in an invalid auth state

5. **Silent Authentication**
   - Refresh tokens in the background without user interaction
   - Show loading states during token refresh

### Token Lifecycle Flow

```
User Login/Register
  ↓
Receive accessToken (15m) + refreshToken (7d)
  ↓
Store tokens in localStorage
  ↓
Make API requests with accessToken
  ↓
[After ~14 minutes]
  ↓
accessToken expires
  ↓
Backend responds: 401 "Token expired" (< 100ms)
  ↓
Frontend intercepts 401
  ↓
Automatically calls /api/auth/refresh with refreshToken
  ↓
Receive new accessToken
  ↓
Retry failed request with new token
  ↓
Continue using app seamlessly
```

### Debugging Token Issues

If you're experiencing authentication issues:

1. **Check Token Validity**
```javascript
const token = localStorage.getItem('accessToken');
console.log('Token:', token);

try {
  const decoded = jwtDecode(token);
  console.log('Decoded:', decoded);
  console.log('Expires:', new Date(decoded.exp * 1000));
  console.log('Is expired:', Date.now() > decoded.exp * 1000);
} catch (error) {
  console.error('Invalid token:', error);
}
```

2. **Monitor Network Requests**
   - Open browser DevTools → Network tab
   - Filter by "Auth" or "api/auth"
   - Check response times (should be < 1 second for 401 errors)
   - Verify 401 responses contain specific error messages

3. **Check Backend Logs**
```bash
docker logs tuberia-backend --tail 100 -f
```

Look for log entries like:
```
Auth middleware error: { errorName: 'TokenExpiredError', errorMessage: 'jwt expired' }
```

---

## 7. Manejo de Errores

### Estructura de Respuesta de Error

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
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
| 200 | OK | Login exitoso, token refrescado, datos obtenidos |
| 201 | Created | Registro exitoso |
| 400 | Bad Request | Errores de validación |
| 401 | Unauthorized | Credenciales inválidas, token inválido/expirado |
| 409 | Conflict | Email o username ya registrado |
| 429 | Too Many Requests | Límite de tasa excedido |
| 500 | Internal Server Error | Error del servidor |

### Rate Limiting

- **Límite**: Configurable (por defecto: 100 peticiones)
- **Ventana**: Configurable (por defecto: 15 minutos)
- **Scope**: Por IP

Si se excede el límite:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

Headers de respuesta:
```
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1700000900
```

---

## Notas Importantes de Seguridad

1. **HTTPS**: En producción, SIEMPRE usar HTTPS
2. **Tokens**: No almacenar tokens en cookies sin las flags apropiadas
3. **Passwords**: Nunca enviar contraseñas sin hash, el backend se encarga del hash
4. **CORS**: El backend está configurado con CORS, asegúrate de que la URL del frontend esté en `FRONTEND_URL`
5. **Validación**: Realizar validación tanto en frontend como backend
6. **Expiración**: Manejar correctamente la expiración de tokens
7. **Logout**: SIEMPRE hacer logout en el backend (POST /api/auth/logout) para revocar tokens, no solo limpiar localStorage
8. **Token Revocation**: Los tokens revocados se rechazan inmediatamente gracias a la blacklist en Redis
9. **Compromiso de Tokens**: Si sospechas que un token fue robado, haz logout inmediatamente enviando ambos tokens

---

## Configuración CORS

El backend acepta peticiones desde:

```
Origin: http://localhost:5173 (configurable en .env)
```

Headers permitidos:
- `Content-Type`
- `Authorization`

Métodos permitidos:
- `GET`
- `POST`
- `PUT`
- `DELETE`

Credentials: `true` (permite envío de cookies)

---

## Variables de Entorno Necesarias

Para que el sistema de autenticación funcione correctamente, el backend necesita estas variables en el archivo `.env`:

```env
# JWT Configuration
JWT_SECRET=tu_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Frontend URL para CORS
FRONTEND_URL=http://localhost:5173
```

---

## Modelo de Usuario

El objeto usuario devuelto por el backend tiene la siguiente estructura:

```typescript
interface User {
  id: string;              // ID único del usuario (MongoDB ObjectId)
  username: string;        // Nombre de usuario (único)
  name?: string;           // Nombre completo (opcional)
  email: string;           // Email (único)
  lastLogin?: Date;        // Última fecha de login
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de última actualización
}
```

**Nota**: El campo `password` NUNCA se devuelve en las respuestas por seguridad.

---

## Testing

Puedes probar los endpoints con herramientas como:

- **Postman**
- **Insomnia**
- **Thunder Client** (VSCode extension)
- **curl**

Ejemplo con curl:

```bash
# Registro
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"johndoe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Obtener usuario actual
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
