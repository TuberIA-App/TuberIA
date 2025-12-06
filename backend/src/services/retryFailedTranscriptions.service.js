import cron from 'node-cron';
import Video from '../model/Video.js';
import { transcriptionQueue } from '../queues/videoProcessing.queue.js';
import logger from '../utils/logger.js';

let isRetrying = false;
let retryCronJob = null;

/**
 * Retry failed transcriptions that are older than the threshold
 * @param {number} hoursThreshold - Minimum hours since failure to retry (default 12)
 */
async function retryFailedTranscriptions(hoursThreshold = 12) {
  try {
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - hoursThreshold);

    // Find videos with failed transcriptions older than threshold
    const failedVideos = await Video.find({
      status: 'failed',
      'errorInfo.code': 'TRANSCRIPTION_ERROR',
      'errorInfo.failedAt': { $lte: thresholdDate }
    }).limit(50); // Process max 50 at a time to avoid overload

    if (failedVideos.length === 0) {
      logger.info('No failed transcriptions to retry');
      return { retriedCount: 0 };
    }

    logger.info(`Found ${failedVideos.length} failed transcriptions to retry`, {
      threshold: `${hoursThreshold} hours`,
      oldestFailure: failedVideos[0]?.errorInfo?.failedAt
    });

    let retriedCount = 0;

    for (const video of failedVideos) {
      // Reset video status to pending
      await Video.updateOne(
        { _id: video._id },
        {
          status: 'pending',
          $unset: { errorInfo: 1 } // Remove error info
        }
      );

      // Re-enqueue transcription job
      await transcriptionQueue.add(
        'transcribe',
        {
          videoId: video.videoId,
          channelId: video.channelId,
          title: video.title
        },
        {
          jobId: `transcribe-retry-${video.videoId}-${Date.now()}`,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      );

      retriedCount++;
      logger.info('Failed transcription re-queued', {
        videoId: video.videoId,
        originalFailure: video.errorInfo?.failedAt,
        retryAfterHours: Math.round(
          (new Date() - new Date(video.errorInfo?.failedAt)) / (1000 * 60 * 60)
        )
      });
    }

    logger.info(`Retry cycle completed`, { retriedCount });
    return { retriedCount };

  } catch (error) {
    logger.error('Failed to retry transcriptions', {
      error: error.message
    });
    throw error;
  }
}

/**
 * Start automatic retry cron job (runs every 12 hours by default)
 * Retries transcriptions that failed more than 12 hours ago
 */
export function startTranscriptionRetryScheduler() {
  const retryInterval = parseInt(process.env.RETRY_INTERVAL_HOURS) || 12;
  const retryThreshold = parseInt(process.env.RETRY_THRESHOLD_HOURS) || 12;

  // Run every X hours (default: every 12 hours)
  const cronPattern = `0 */${retryInterval} * * *`;

  retryCronJob = cron.schedule(cronPattern, async () => {
    if (isRetrying) {
      logger.warn('Previous retry cycle still running, skipping...');
      return;
    }

    isRetrying = true;
    logger.info('Transcription retry cycle started', {
      retryThreshold: `${retryThreshold} hours`
    });

    try {
      await retryFailedTranscriptions(retryThreshold);
    } catch (error) {
      logger.error('Retry cycle failed', {
        error: error.message
      });
    } finally {
      isRetrying = false;
    }
  });

  logger.info(
    `Transcription retry scheduler started (runs every ${retryInterval} hours, retries failures older than ${retryThreshold} hours)`
  );
}

/**
 * Stop retry scheduler (graceful shutdown)
 */
export function stopTranscriptionRetryScheduler() {
  if (retryCronJob) {
    retryCronJob.stop();
    logger.info('Transcription retry scheduler stopped');
  }

  // Wait for current retry to finish
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (!isRetrying) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 30000);
  });
}

/**
 * Manually trigger retry for failed transcriptions (immediate)
 */
export async function retryFailedTranscriptionsNow(hoursThreshold = 12) {
  return await retryFailedTranscriptions(hoursThreshold);
}
