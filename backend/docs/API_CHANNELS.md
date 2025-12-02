# Channels API Documentation

## Base URL
```
/api/channels
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

### 1. Search Channel

Search for a YouTube channel by username or URL.

**Endpoint:** `GET /api/channels/search`

**Access:** Public

**Query Parameters:**
- `q` (string, required) - Channel username (with or without @) or YouTube URL

**Success Response (200):**
```json
{
  "success": true,
  "message": "Channel found successfully",
  "data": {
    "channelId": "UCX6OQ3DkcsbYNE6H8uQQuVA",
    "name": "MrBeast",
    "username": "MrBeast",
    "thumbnail": "https://...",
    "description": null
  }
}
```

**Error Responses:**
- `400` - Missing or invalid query parameter
- `404` - Channel not found
- `500` - Server error

**Example:**
```bash
curl "http://localhost:5000/api/channels/search?q=@MrBeast"
```

---

### 2. Follow Channel

Follow a YouTube channel to receive updates.

**Endpoint:** `POST /api/channels/:channelId/follow`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `channelId` (string, required) - MongoDB ObjectId of the channel

**Success Response (200):**
```json
{
  "success": true,
  "message": "Channel followed successfully",
  "data": {
    "channel": {
      "_id": "674d8e9f12a3b4c5d6e7f890",
      "channelId": "UCX6OQ3DkcsbYNE6H8uQQuVA",
      "name": "MrBeast",
      "username": "MrBeast",
      "thumbnail": "https://...",
      "followersCount": 42
    }
  }
}
```

**Error Responses:**
- `400` - Invalid channel ID format
- `401` - Not authenticated
- `404` - Channel not found
- `409` - Already following this channel
- `500` - Server error

**Example:**
```bash
curl -X POST \
  "http://localhost:5000/api/channels/674d8e9f12a3b4c5d6e7f890/follow" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 3. Unfollow Channel

Unfollow a previously followed channel.

**Endpoint:** `DELETE /api/channels/:channelId/unfollow`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `channelId` (string, required) - MongoDB ObjectId of the channel

**Success Response (200):**
```json
{
  "success": true,
  "message": "Successfully unfollowed channel",
  "data": null
}
```

**Error Responses:**
- `400` - Invalid channel ID format
- `401` - Not authenticated
- `404` - Channel not found or not following
- `500` - Server error

**Example:**
```bash
curl -X DELETE \
  "http://localhost:5000/api/channels/674d8e9f12a3b4c5d6e7f890/unfollow" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 4. Get Followed Channels

Get all channels followed by the authenticated user.

**Endpoint:** `GET /api/channels/user/followed`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Followed channels retrieved successfully",
  "data": {
    "channels": [
      {
        "_id": "674d8e9f12a3b4c5d6e7f890",
        "channelId": "UCX6OQ3DkcsbYNE6H8uQQuVA",
        "name": "MrBeast",
        "username": "MrBeast",
        "thumbnail": "https://...",
        "description": "...",
        "followersCount": 42,
        "lastChecked": "2025-12-02T18:30:00.000Z",
        "subscribedAt": "2025-12-01T10:00:00.000Z"
      },
      {
        "_id": "674d8e9f12a3b4c5d6e7f891",
        "channelId": "UCam8T03EOFBsNdR0thrFHdQ",
        "name": "Vegetta777",
        "username": "vegetta777",
        "thumbnail": "https://...",
        "description": "...",
        "followersCount": 15,
        "lastChecked": "2025-12-02T18:25:00.000Z",
        "subscribedAt": "2025-11-30T14:30:00.000Z"
      }
    ],
    "count": 2
  }
}
```

**Error Responses:**
- `401` - Not authenticated
- `500` - Server error

**Example:**
```bash
curl "http://localhost:5000/api/channels/user/followed" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Data Models

### Channel
```typescript
{
  _id: ObjectId,
  channelId: string,        // YouTube channel ID (unique)
  name: string,             // Channel name
  username: string,         // @username
  thumbnail: string,        // Avatar URL
  description: string | null,
  followersCount: number,   // Number of app users following
  isActive: boolean,
  lastChecked: Date | null, // Last RSS poll timestamp
  createdAt: Date,
  updatedAt: Date
}
```

### UserChannel (Relationship)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,         // Reference to User
  channelId: ObjectId,      // Reference to Channel
  subscribedAt: Date,       // When user followed
  createdAt: Date,
  updatedAt: Date
}
```

---

## Business Logic

### Follow Operation
1. Validates channel exists
2. Checks if already following (idempotency)
3. Creates UserChannel relationship
4. Increments channel.followersCount
5. Operations are atomic (MongoDB transactions)

### Unfollow Operation
1. Validates channel exists
2. Checks if currently following
3. Deletes UserChannel relationship
4. Decrements channel.followersCount (minimum 0)
5. Operations are atomic (MongoDB transactions)

### RSS Polling
- Channels with `followersCount > 0` are polled every 30 minutes
- New videos are automatically detected and processed
- Transcription and summarization jobs are enqueued

---

## Error Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| 400 | Bad Request | Invalid channel ID format, missing parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 404 | Not Found | Channel doesn't exist, not following channel |
| 409 | Conflict | Already following channel |
| 500 | Server Error | Database error, unexpected error |

---

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

To obtain a token:
1. Register: `POST /api/auth/register`
2. Login: `POST /api/auth/login`

See [AUTH_API.md](./AUTH_API.md) for authentication details.

---

## Rate Limiting

- Search endpoint: 100 requests per 15 minutes per IP
- Follow/Unfollow: 20 requests per minute per user
- Get followed channels: 60 requests per minute per user

---

## Notes

- Channel `followersCount` represents app users following, not YouTube subscribers
- Following a channel enables automatic RSS polling and video processing
- Channels with zero followers are not actively polled
- All timestamps are in ISO 8601 format (UTC)
- ObjectIds are 24-character hexadecimal strings

---

**Last Updated:** 2025-12-02
**API Version:** 1.0.0
