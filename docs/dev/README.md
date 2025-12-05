# TuberIA - API Documentation for Frontend Team

## 🚀 Start Here

**[📋 API INDEX - Complete Reference](./api-index.md)**

This is your main entry point for all API documentation. It contains:
- Complete endpoint list
- Quick start guide
- Example code for all operations
- Common use cases for frontend

---

## 📚 Documentation by Module

| Module | File | Description |
|--------|------|-------------|
| **Index** | [api-index.md](./api-index.md) | 🌟 **START HERE** - Complete API reference |
| **Auth** | [api-auth.md](./api-auth.md) | Login, Register, Token Management |
| **Channels** | [api-channels.md](./api-channels.md) | Search, Follow/Unfollow, Channel Details |
| **Users** | [api-users.md](./api-users.md) | User Stats, Followed Channels |
| **Videos** | [api-videos.md](./api-videos.md) | Video Feed, Video Details with Summaries |
| **Infrastructure** | [api-infrastructure.md](./api-infrastructure.md) | Health Check, System Status |

---

## ⚡ Quick Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require:
```
Authorization: Bearer <accessToken>
```

### Response Format
All endpoints return:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## 🎯 Frontend Integration Checklist

### Phase 5 & 5.5 (Current) - All Implemented ✅

- [x] **Dashboard (UserHome.jsx)**
  - `GET /api/users/me/stats` - User statistics
  - `GET /api/users/me/videos` - Video feed

- [x] **Channels (Dashboard.jsx, ChannelSearch.jsx)**
  - `GET /api/channels/search` - Search channels
  - `GET /api/channels/:id` - Channel details with isFollowing
  - `POST /api/channels/:channelId/follow` - Follow channel
  - `DELETE /api/channels/:channelId/unfollow` - Unfollow channel
  - `GET /api/users/me/channels` - List followed channels

- [x] **Videos (VideoDetail.jsx)**
  - `GET /api/videos/:videoId` - Video details with summary

- [x] **Auth (Login.jsx, Register.jsx)**
  - `POST /api/auth/register` - Register user
  - `POST /api/auth/login` - Login user
  - `POST /api/auth/refresh` - Refresh token
  - `GET /api/auth/me` - Get current user

---

## 🔑 Important Notes

### MongoDB ObjectId vs YouTube Channel ID

**MongoDB ObjectId (for follow/unfollow):**
- Format: 24 hex characters
- Example: `674d8e9f12a3b4c5d6e7f890`
- Used in: `POST /channels/:channelId/follow`

**YouTube Channel ID (for search/details):**
- Format: UCxxxxxx
- Example: `UCX6OQ3DkcsbYNE6H8uQQuVA`
- Used in: `GET /channels/:id`

### Optional Authentication

Some endpoints work without auth but return richer data when authenticated:
- `GET /api/channels/:id` - Returns `isFollowing: false` without auth, actual status with auth

---

## 📖 Additional Resources

- [Docker Deployment](./README-DOCKER.md)
- [Redis Configuration](./README-REDIS.md)
- [Caddy Deployment](./CADDY-DEPLOYMENT.md)
- [General Deployment](./DEPLOYMENT.md)

---

## 🆘 Need Help?

1. Check the [API Index](./api-index.md) first
2. Look at specific module documentation
3. Verify backend is running on port 5000
4. Check MongoDB and Redis are running
5. Review backend logs for errors

---

**Last Updated:** 2025-12-03
**Version:** Phase 5.5 Complete
