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
- [5. Gestión de Tokens JWT](#5-gestión-de-tokens-jwt)
- [6. Manejo de Errores](#6-manejo-de-errores)

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

## 5. Gestión de Tokens JWT

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

1. **Login/Registro**: Obtener ambos tokens
2. **Almacenamiento**: Guardar tokens de forma segura
   - `localStorage` o `sessionStorage` para aplicaciones web
   - Almacenamiento seguro para aplicaciones móviles
3. **Uso del Access Token**: Incluir en header `Authorization: Bearer {token}`
4. **Renovación**: Cuando el access token expire (error 401), usar el refresh token
5. **Logout**: Eliminar tokens del almacenamiento local

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

## 6. Manejo de Errores

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
7. **Logout**: Limpiar todos los tokens del almacenamiento local

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
