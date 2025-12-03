# Infrastructure Setup

## Redis Configuration
- **Host:** Configurable via `REDIS_HOST`
- **Port:** Default 6379
- **Purpose:** Job queue backend + caching
- **Connection:** Two clients (BullMQ + general)
- **Docker:** Redis 7 Alpine with 128MB memory limit

## Queue System
- **Transcription Queue:** Handles video transcription jobs
- **Summarization Queue:** Handles AI summarization jobs
- **Retry Policy:** 3 attempts with exponential backoff
- **Cleanup:** Completed jobs kept 7 days, failed jobs kept 30 days

## Docker Setup
- **Redis Container:** `tuberia-redis-prod` with persistence
- **Memory Limit:** 128MB with LRU eviction policy
- **Health Check:** Redis ping every 10 seconds

## Environment Variables

### Redis
```env
REDIS_HOST=redis          # Hostname (use 'redis' for Docker, 'localhost' for local)
REDIS_PORT=6379           # Port (default)
REDIS_PASSWORD=           # Optional password (production)
```

### Workers (Phase 2)
```env
WORKER_CONCURRENCY=2      # Number of concurrent jobs per worker
RSS_POLL_INTERVAL=30      # RSS polling interval in minutes
```

## Testing

Run Redis tests:
```bash
npm run test -- config/redis.test.js
```

Run queue tests:
```bash
npm run test -- queues/videoProcessing.queue.test.js
```

## Usage

### Import Queues
```javascript
import { transcriptionQueue, summarizationQueue } from './queues/videoProcessing.queue.js';
```

### Add Job to Queue
```javascript
await transcriptionQueue.add('transcribe', {
  videoId: 'abc123',
  channelId: 'channel123',
  title: 'Video Title'
}, {
  jobId: `transcribe-abc123`, // Prevents duplicates
  attempts: 3
});
```

### Monitor Queue Status
```javascript
const waiting = await transcriptionQueue.getWaitingCount();
const active = await transcriptionQueue.getActiveCount();
const completed = await transcriptionQueue.getCompletedCount();
const failed = await transcriptionQueue.getFailedCount();
```

## Next Steps (Phase 2)

- Implement transcription worker
- Implement summarization worker
- Integrate workers with index.js
- Add graceful shutdown for workers
