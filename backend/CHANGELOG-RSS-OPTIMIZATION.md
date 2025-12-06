# RSS Polling Optimization & Auto-Retry Implementation

**Date:** 2025-12-06
**Status:** ✅ Completed

## Summary

Implemented two critical improvements to the video processing pipeline:
1. **RSS Poller Optimization** - Process only latest video instead of all 15
2. **Automatic Retry Mechanism** - Retry failed transcriptions after 12-24 hours

---

## 1. RSS Poller Optimization

### Problem
When adding a new channel, the system processed ALL 15 videos from the RSS feed, resulting in:
- 15x transcription jobs queued immediately
- 15x AI summarization requests (expensive)
- Poor scalability (100 channels = 1,500 videos on first add)
- Not industry best practice

### Solution
Modified RSS poller to process **only the latest (first) video** from feed.

### Files Changed
- `backend/src/services/youtube/rssPoller.service.js`

### Behavior Changes

**Before:**
```
Add channel → Process 15 videos → 15 transcriptions → 15 AI summaries
```

**After:**
```
Add channel → Process 1 video → 1 transcription → 1 AI summary
Every 30 mins → Check latest video → Process if new
```

### Why This is Best Practice
- RSS feeds are for **NEW content detection**, not historical backfilling
- Matches industry standard (YouTube subscriptions, Feedly, newsletters)
- Sustainable and cost-effective
- Users expect to see NEW videos, not old ones

### Configuration
No environment variables needed - works out of the box.

---

## 2. Automatic Retry for Failed Transcriptions

### Problem
When transcription jobs fail (e.g., "Transcription not available"), they fail permanently after 3 attempts with no automatic retry mechanism. Some videos may have transcriptions available later.

### Solution
Implemented automatic retry scheduler that:
- Runs every 12 hours (configurable)
- Finds videos with failed transcriptions older than 12 hours (configurable)
- Resets status to `'pending'` and removes error info
- Re-enqueues transcription jobs with fresh retry attempts
- Processes max 50 videos per cycle to avoid overload

### Files Created
- `backend/src/services/retryFailedTranscriptions.service.js`

### Files Modified
- `backend/src/index.js` (integrated into server startup/shutdown)

### Configuration

Add to `.env` (optional - these are the defaults):

```bash
# How often the retry scheduler runs (in hours)
RETRY_INTERVAL_HOURS=12

# Minimum hours since failure before retry
RETRY_THRESHOLD_HOURS=12
```

### Query Details

The retry service finds failed videos using:
```javascript
{
  status: 'failed',
  'errorInfo.code': 'TRANSCRIPTION_ERROR',
  'errorInfo.failedAt': { $lte: thresholdDate }
}
```

Only retries **transcription errors**, not summarization errors.

---

## 3. Test Coverage

### New Test Files

**A. RSS Poller Tests**
`backend/src/testing/unit/services/rssPoller.service.test.js`
- ✅ Only processes first (latest) video from 15-video feed
- ✅ Skips processing if latest video already exists
- ✅ Handles empty RSS feeds gracefully
- ✅ Handles single video feeds
- ✅ Updates channel lastChecked even on errors

**B. Retry Service Tests**
`backend/src/testing/unit/services/retryFailedTranscriptions.service.test.js`
- ✅ Retries failures older than threshold (12h, 24h)
- ✅ Ignores failures newer than threshold
- ✅ Only retries TRANSCRIPTION_ERROR failures
- ✅ Limits to 50 videos per cycle
- ✅ Removes errorInfo when resetting status
- ✅ Re-enqueues jobs with fresh attempts

### Running Tests

```bash
# Run RSS poller tests
docker exec tuberia-backend npm test -- rssPoller.service.test.js

# Run retry service tests
docker exec tuberia-backend npm test -- retryFailedTranscriptions.service.test.js

# Run all tests
docker exec tuberia-backend npm test
```

---

## Complete Video Processing Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. RSS Polling (Every 30 minutes)                           │
│    - Fetch RSS feed (15 videos)                             │
│    - Process ONLY latest video                              │
│    - Skip if already exists                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Transcription Queue                                      │
│    - Fetch YouTube transcript                               │
│    - Convert array to string                                │
│    - Save to database                                       │
│    - 3 retry attempts with exponential backoff             │
└─────────────────────────┬───────────────────────────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
                SUCCESS       FAIL
                    │           │
                    ▼           ▼
┌─────────────────────────┐  ┌──────────────────────────────┐
│ 3. Summarization Queue  │  │ 4. Failed Status             │
│    - Generate AI summary│  │    - status: 'failed'        │
│    - Save summary       │  │    - errorInfo saved         │
│    - status: 'completed'│  │    - Wait 12+ hours          │
└─────────────────────────┘  └──────┬───────────────────────┘
                                    │
                                    ▼
                          ┌──────────────────────────────────┐
                          │ 5. Retry Scheduler (Every 12h)   │
                          │    - Find failures > 12h old     │
                          │    - Reset to 'pending'          │
                          │    - Re-queue transcription      │
                          │    - Max 50 per cycle            │
                          └──────────────────────────────────┘
```

---

## Performance Impact

### Cost Reduction
- **Before:** 15 videos × AI summary cost = 15x cost per channel
- **After:** 1 video × AI summary cost = 1x cost per channel
- **Savings:** ~93% reduction in AI costs on channel addition

### Resource Usage
- **Before:** 150 jobs queued when adding 10 channels
- **After:** 10 jobs queued when adding 10 channels
- **Reduction:** ~93% fewer jobs on initial channel add

### Scalability
- Can now handle hundreds of channel additions without overwhelming the system
- Retry mechanism ensures transcription failures are automatically recovered

---

## Migration Notes

### No Database Migration Needed
The changes are backward compatible. Existing videos in database are unaffected.

### Existing Failed Videos
The retry scheduler will automatically pick up any existing failed transcriptions older than 12 hours on next scheduled run.

### No Breaking Changes
All existing functionality remains intact. The changes only optimize the RSS polling behavior and add automatic retry capability.

---

## Monitoring

### Logs to Watch

**RSS Polling:**
```
[info]: New video detected and queued
[debug]: Latest video already processed
[warn]: No videos found in RSS feed
```

**Retry Scheduler:**
```
[info]: Transcription retry scheduler started
[info]: Found X failed transcriptions to retry
[info]: Failed transcription re-queued
[info]: Retry cycle completed
```

### Key Metrics

Monitor these in production:
- Number of videos processed per RSS poll cycle (should be ≤1 per channel)
- Number of failed transcriptions retried per cycle
- Transcription success rate after retry
- AI summarization costs (should decrease by ~93%)

---

## Future Improvements (Optional)

1. **Manual History Import** - Add API endpoint to backfill channel history on demand
2. **Retry Backoff** - Increase retry delay after each cycle (12h → 24h → 48h)
3. **Selective Retry** - Retry only specific error types (not all TRANSCRIPTION_ERROR)
4. **Metrics Dashboard** - Track retry success rates and cost savings

---

## References

- [RSS Poller Service](./src/services/youtube/rssPoller.service.js)
- [Retry Service](./src/services/retryFailedTranscriptions.service.js)
- [Server Integration](./src/index.js)
- [RSS Poller Tests](./src/testing/unit/services/rssPoller.service.test.js)
- [Retry Service Tests](./src/testing/unit/services/retryFailedTranscriptions.service.test.js)
