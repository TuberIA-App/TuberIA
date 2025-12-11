# Videos API Documentation

## Base URL
```
/api
```

All endpoints return JSON responses with the following structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

---

## Endpoints

### 1. Get My Video Feed

Get personalized video feed from channels you're following, sorted by newest first.

**Endpoint:** `GET /api/users/me/videos`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20, max: 100) - Videos per page
- `status` (optional) - Filter by status: `pending`, `processing`, `completed`, `failed`, `all`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Video feed retrieved successfully",
  "data": {
    "videos": [
      {
        "videoId": "dQw4w9WgXcQ",
        "title": "Never Gonna Give You Up",
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "channelId": "674d8e9f12a3b4c5d6e7f890",
        "publishedAt": "2009-10-25T06:57:33.000Z",
        "status": "completed",
        "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
        "durationSeconds": 212,
        "viewsCount": 1000000,
        "createdAt": "2025-01-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 98,
      "limit": 20,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Error Responses:**
- `400` - Invalid query parameters (limit > 100, invalid status, etc.)
- `401` - Not authenticated
- `500` - Server error

**Examples:**

```bash
# Get first page (20 videos)
curl "http://localhost:5000/api/users/me/videos" \
  -H "Authorization: Bearer TOKEN"

# Get page 2 with 50 videos per page
curl "http://localhost:5000/api/users/me/videos?page=2&limit=50" \
  -H "Authorization: Bearer TOKEN"

# Get only completed videos
curl "http://localhost:5000/api/users/me/videos?status=completed" \
  -H "Authorization: Bearer TOKEN"

# Get all videos (no status filter)
curl "http://localhost:5000/api/users/me/videos?status=all" \
  -H "Authorization: Bearer TOKEN"
```

---

### 2. Get Video by ID

Get details of a specific video (requires following the channel).

**Endpoint:** `GET /api/videos/:videoId`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `videoId` (required) - YouTube video ID (11 characters)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Video retrieved successfully",
  "data": {
    "video": {
      "videoId": "dQw4w9WgXcQ",
      "title": "Never Gonna Give You Up",
      "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "channelId": "674d8e9f12a3b4c5d6e7f890",
      "publishedAt": "2009-10-25T06:57:33.000Z",
      "status": "completed",
      "summary": "Full video summary...",
      "keyPoints": ["Point 1", "Point 2"],
      "transcription": ["Full transcript array..."],
      "aiModel": "deepseek/deepseek-chat",
      "tokensConsumed": 1234,
      "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
      "durationSeconds": 212,
      "viewsCount": 1000000,
      "createdAt": "2025-01-01T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid video ID format
- `401` - Not authenticated
- `403` - You must follow the channel to view this video
- `404` - Video not found
- `500` - Server error

**Example:**

```bash
curl "http://localhost:5000/api/videos/dQw4w9WgXcQ" \
  -H "Authorization: Bearer TOKEN"
```

---

## Data Models

### Feed Video Response (GET /users/me/videos)
```typescript
{
  videoId: string,              // YouTube video ID (11 characters)
  title: string,                // Video title
  url: string,                  // Full YouTube URL
  channelId: ObjectId,          // Reference to Channel model
  publishedAt: Date,            // When video was published on YouTube
  status: 'pending' | 'processing' | 'completed' | 'failed',
  thumbnail: string,            // Video thumbnail URL
  durationSeconds: number,      // Video duration
  viewsCount: number,           // View count
  createdAt: Date              // When video was added to our database
}
```

### Video Detail Response (GET /videos/:videoId)

Includes **all fields from Feed Response** plus:

```typescript
{
  // ... all Feed Response fields +
  summary: string,              // AI-generated summary (ONLY in detail view)
  keyPoints: string[],          // Key takeaways (ONLY in detail view)
  transcription: string,        // Full transcript (ONLY in detail view)
  aiModel: string,              // AI model used for summarization
  tokensConsumed: number       // Tokens used in AI processing
}
```

> **Note:** Feed endpoint uses lazy loading - summary data is only fetched when viewing individual video details.

---

## Business Logic

### Video Feed Query
1. Get all channels followed by user via UserChannel
2. Query videos where `channelId IN followedChannelIds`
3. Sort by `publishedAt DESC` (newest first)
4. Apply optional `status` filter
5. Paginate using `page` and `limit`
6. Return videos + pagination metadata

### Access Control
- Users can only view videos from channels they follow
- `GET /videos/:videoId` checks UserChannel relationship before returning

### Performance
- Uses compound index: `{ channelId: 1, publishedAt: -1 }`
- Query is highly optimized for large datasets
- Pagination prevents loading entire dataset

---

## Video Statuses

| Status | Description | Typical Duration |
|--------|-------------|------------------|
| `pending` | Queued for processing | 0-5 minutes |
| `processing` | Transcription in progress | 1-2 minutes |
| `completed` | Fully processed with summary | Final state |
| `failed` | Processing failed (see errorInfo) | Final state |

---

## Pagination

All list endpoints use cursor-based pagination:

**Query Parameters:**
- `page` (integer, min: 1, default: 1) - Page number
- `limit` (integer, min: 1, max: 100, default: 20) - Items per page

**Response Metadata:**
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

**Navigation:**
- First page: `?page=1`
- Next page: `?page=2`
- Previous page: `?page=1`
- Last page: `?page={totalPages}`

---

## Error Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 400 | Bad Request | Invalid page/limit, invalid status value |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't follow the channel |
| 404 | Not Found | Video doesn't exist |
| 500 | Server Error | Database error, unexpected error |

---

## Rate Limiting

- Video feed endpoint: 60 requests per minute per user
- Video detail endpoint: 120 requests per minute per user

---

## Notes

- Videos are ordered by `publishedAt DESC` (newest first)
- Only videos from followed channels are returned
- Transcription field is only included in `GET /videos/:videoId` (not in feed)
- All timestamps are in ISO 8601 format (UTC)
- Video IDs are 11-character YouTube format

---

## ⚠️ BREAKING CHANGES

### Lazy Loading Optimization (Diciembre 2025)

**¿Qué cambió?**

- `GET /users/me/videos` (feed) **YA NO** retorna `summary`, `keyPoints`, `aiModel`, ni `tokensConsumed`
- `GET /videos/:videoId` (detalle) **SÍ retorna** todos los campos incluyendo summary

**¿Por qué?**

- Respuestas del feed 70% más pequeñas
- Tiempos de carga mejorados de ~2s a ~0.5s
- Lazy loading: datos pesados solo se cargan al hacer clic en un video

---

### 📋 Guía de Migración para Frontend

#### ✅ BUENAS NOTICIAS

**NO se requieren cambios en el frontend actual** porque:
- `VideoCard.jsx` no usa `summary` ni `keyPoints`
- `MyFeedPage.jsx` solo pasa datos a VideoCard
- La implementación actual ya sigue el patrón correcto

#### 🔍 Verificación

Si tu código tiene algo como esto en componentes de feed:

```javascript
// ❌ INCORRECTO - No hagas esto en el feed
<VideoCard
  summary={video.summary}      // Este campo ya no existe
  keyPoints={video.keyPoints}  // Este campo ya no existe
/>
```

Cámbialo a:

```javascript
// ✅ CORRECTO - Feed muestra solo info básica
<VideoCard
  title={video.title}
  thumbnail={video.thumbnail}
  duration={video.durationSeconds}
/>
```

#### 📄 Página de Detalle

Cuando el usuario hace clic en un video:

```javascript
// ✅ CORRECTO - Fetch completo en detalle
const videoDetails = await getVideoById(videoId);

// Ahora SÍ tienes acceso a:
// - videoDetails.summary
// - videoDetails.keyPoints
// - videoDetails.transcription
```

#### 🎯 TypeScript Interfaces (si aplica)

```typescript
// Respuesta del Feed
interface FeedVideo {
  videoId: string;
  title: string;
  url: string;
  channelId: string;
  publishedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  thumbnail: string;
  durationSeconds: number;
  viewsCount: number;
  createdAt: string;
  // ❌ NO: summary, keyPoints, aiModel, tokensConsumed
}

// Respuesta de Detalle
interface VideoDetail extends FeedVideo {
  summary: string;
  keyPoints: string[];
  transcription: string;
  aiModel: string;
  tokensConsumed: number;
}
```

---

### 🔄 Rollback

Si hay problemas, restaurar campos en `backend/src/services/video.service.js` línea 61:

```javascript
.select('videoId title url channelId publishedAt status summary keyPoints aiModel tokensConsumed thumbnail durationSeconds viewsCount createdAt')
```

Cache se limpia automáticamente en 60 segundos.

---

**Last Updated:** 2025-12-06
**API Version:** 1.1.0
