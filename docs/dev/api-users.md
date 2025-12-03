# Users API Documentation

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

### 1. Get User Stats

Get dashboard statistics for the authenticated user.

**Endpoint:** `GET /api/users/me/stats`

**Access:** Private (requires authentication)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User stats retrieved successfully",
  "data": {
    "summariesRead": 42,
    "timeSaved": "5h 36m",
    "followedChannels": 8
  }
}
```

**Response Fields:**
- `summariesRead` (number) - Total number of completed video summaries viewed
- `timeSaved` (string) - Estimated time saved by reading summaries instead of watching full videos
- `followedChannels` (number) - Total number of channels the user is following

**Time Saved Calculation:**
- Average video length: 10 minutes
- Average summary read time: 2 minutes
- Time saved per video: 8 minutes
- Formula: `(summariesRead × 8) minutes`

**Error Responses:**
- `401` - Not authenticated
- `500` - Server error

**Examples:**

```bash
# Get user stats
curl "http://localhost:5000/api/users/me/stats" \
  -H "Authorization: Bearer TOKEN"
```

---

### 2. Get My Channels

Get list of all channels followed by the authenticated user.

**Endpoint:** `GET /api/users/me/channels`

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
        "id": "674d8e9f12a3b4c5d6e7f890",
        "channelId": "UCX6OQ3DkcsbYNE6H8uQQuVA",
        "name": "MrBeast",
        "username": "MrBeast",
        "description": "Channel description text",
        "avatar": "https://yt3.ggpht.com/ytc/...",
        "followersCount": 15234,
        "subscribedAt": "2025-01-15T10:30:00.000Z",
        "isFollowing": true
      }
    ],
    "count": 1
  }
}
```

**Response Fields:**
- `id` (string) - MongoDB ObjectId of the channel
- `channelId` (string) - YouTube channel ID (UCxxxxxx format)
- `name` (string) - Channel display name
- `username` (string) - Channel username/handle
- `description` (string|null) - Channel description
- `avatar` (string) - Channel avatar/thumbnail URL (placeholder if not available)
- `followersCount` (number) - Number of followers in our system
- `subscribedAt` (date) - When user followed this channel
- `isFollowing` (boolean) - Always `true` for this endpoint

**Sorting:**
- Channels are sorted by `subscribedAt` descending (most recently followed first)

**Error Responses:**
- `401` - Not authenticated
- `500` - Server error

**Examples:**

```bash
# Get followed channels
curl "http://localhost:5000/api/users/me/channels" \
  -H "Authorization: Bearer TOKEN"
```

---

## Business Logic

### User Stats Calculation

1. **Summaries Read**: Count of videos with status `completed` from all followed channels
2. **Time Saved**: Calculated as `summariesRead × 8 minutes`, formatted as hours and minutes
3. **Followed Channels**: Count of UserChannel relationships for the user

### Followed Channels Query

1. Get all UserChannel relationships where `userId` matches
2. Populate channel details from Channel model
3. Filter out any null/deleted channels
4. Enrich with frontend-friendly data (avatar, isFollowing flag)
5. Sort by subscribedAt descending

---

## Data Models

### User Stats
```typescript
{
  summariesRead: number,      // Count of completed videos
  timeSaved: string,          // Format: "Xh Ym" or "Ym"
  followedChannels: number    // Count of followed channels
}
```

### Channel (in /users/me/channels)
```typescript
{
  id: string,                 // MongoDB ObjectId
  channelId: string,          // YouTube channel ID (UCxxxxxx)
  name: string,               // Channel name
  username: string,           // Channel username/handle
  description: string | null, // Channel description
  avatar: string,             // Thumbnail URL or placeholder
  followersCount: number,     // Number of followers
  subscribedAt: Date,         // When user followed
  isFollowing: boolean        // Always true in this endpoint
}
```

---

## Notes

- Both endpoints require authentication via JWT Bearer token
- Empty results return empty arrays/zero counts (not errors)
- Avatar uses placeholder if channel thumbnail not available: `https://via.placeholder.com/150?text=ChannelName`
- All timestamps are in ISO 8601 format (UTC)
- Channels list is sorted by most recently followed first

---

**Last Updated:** 2025-12-03
**API Version:** 1.0.0
