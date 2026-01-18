/**
 * @fileoverview Summarization worker for AI-powered video summary generation.
 * Consumes jobs from the summarization queue and generates summaries using AI models.
 * Includes Sentry integration for job monitoring and error tracking.
 * @module workers/summarization
 */

import { Worker } from 'bullmq';
import * as Sentry from '@sentry/node';
import { redisConnection } from '../config/redis.js';
import { generateVideoSummary } from '../services/ai/summary.service.js';
import Video from '../model/Video.js';
import { setJobContext, captureJobFailure } from '../utils/sentryHelpers.js';
import logger from '../utils/logger.js';

/**
 * @typedef {Object} TranscriptSegment
 * @property {string} text - Transcript segment text
 * @property {number} [start] - Start time in seconds
 * @property {number} [duration] - Duration in seconds
 */

/**
 * @typedef {Object} SummarizationJobData
 * @property {string} videoId - YouTube video ID
 * @property {TranscriptSegment[]} transcriptArray - Array of transcript segments
 * @property {string} title - Video title for context
 */

/**
 * @typedef {Object} SummarizationJobResult
 * @property {boolean} success - Whether summarization completed successfully
 * @property {string} videoId - The processed video ID
 */

/**
 * BullMQ worker for processing summarization jobs.
 * Generates AI-powered summaries and key points from video transcripts.
 * Includes Sentry span tracking for job monitoring.
 *
 * Worker configuration:
 * - Concurrency: Configurable via WORKER_CONCURRENCY env var (default: 2)
 * - Rate limit: 5 jobs per minute (conservative for AI API)
 * - Lock duration: 3 minutes per job (AI can be slow)
 *
 * Validation checks:
 * - Summary must be a non-empty string with minimum 50 characters
 * - Key points must be a non-empty array without fallback messages
 *
 * @type {Worker<SummarizationJobData, SummarizationJobResult>}
 */
const summarizationWorker = new Worker(
  'summarization',
  async (job) => {
    const { videoId, transcriptArray, title } = job.data;

    // Set Sentry context for this job
    setJobContext(job, 'summarization');

    logger.info('Processing summarization', {
      videoId,
      jobId: job.id
    });

    // Create Sentry span for job processing
    return await Sentry.startSpan({
      name: 'process_job summarization',
      op: 'queue.process',
      attributes: {
        'job.id': job.id,
        'job.video_id': videoId,
        'job.attempts': job.attemptsMade,
        'job.queue': 'summarization',
      }
    }, async (jobSpan) => {
      try {
        // Generate summary using existing service
        // Note: Service now throws errors instead of returning error objects
        const result = await generateVideoSummary({
          transcriptArray,
          videoTitle: title
        });

        // CRITICAL VALIDATION: Ensure summary is not empty
        if (!result.summary || typeof result.summary !== 'string') {
          logger.error('Summary service returned invalid summary type', {
            videoId,
            summaryType: typeof result.summary,
            summaryExists: !!result.summary
          });
          throw new Error('AI service returned invalid summary format');
        }

        const trimmedSummary = result.summary.trim();
        if (trimmedSummary.length === 0) {
          logger.error('Summary service returned empty summary', {
            videoId,
            originalLength: result.summary.length
          });
          throw new Error('AI service returned empty summary');
        }

        // Validate minimum summary length (50 chars = ~10 words minimum)
        if (trimmedSummary.length < 50) {
          logger.error('Summary service returned suspiciously short summary', {
            videoId,
            summaryLength: trimmedSummary.length,
            summaryPreview: trimmedSummary
          });
          throw new Error('AI service returned insufficient summary content');
        }

        // Validate keyPoints (should not contain fallback messages)
        if (!Array.isArray(result.keyPoints) || result.keyPoints.length === 0) {
          logger.error('Summary service returned invalid keyPoints', {
            videoId,
            keyPointsType: typeof result.keyPoints,
            keyPointsLength: result.keyPoints?.length
          });
          throw new Error('AI service returned invalid key points');
        }

        // Check for fallback messages that indicate parsing failures
        const hasFallbackMessage = result.keyPoints.some(point =>
          point.includes('Resumen generado exitosamente') ||
          point.includes('Error parsing key points')
        );

        if (hasFallbackMessage) {
          logger.error('Summary service returned fallback keyPoints (parsing failed)', {
            videoId,
            keyPoints: result.keyPoints
          });
          throw new Error('AI service failed to parse key points properly');
        }

        // Log cache behavior for monitoring
        if (result.fromCache) {
          logger.info('Summary retrieved from cache (idempotency hit)', {
            videoId,
            tokensUsed: result.tokensConsumed,
            summaryLength: trimmedSummary.length,
            keyPointsCount: result.keyPoints.length
          });
        } else {
          logger.info('Summary generated fresh (idempotency miss)', {
            videoId,
            tokensUsed: result.tokensConsumed,
            summaryLength: trimmedSummary.length,
            keyPointsCount: result.keyPoints.length
          });
        }

        // Save to database
        await Video.updateOne(
          { videoId },
          {
            summary: result.summary,
            keyPoints: result.keyPoints,
            aiModel: result.aiModel,
            tokensConsumed: result.tokensConsumed,
            status: 'completed',
            completedAt: new Date()
          }
        );

        // Record success metrics on span
        jobSpan.setAttribute('job.status', 'completed');
        jobSpan.setAttribute('job.tokens_used', result.tokensConsumed);
        jobSpan.setAttribute('job.summary_length', trimmedSummary.length);
        jobSpan.setAttribute('job.key_points_count', result.keyPoints.length);
        jobSpan.setAttribute('job.cache_hit', result.fromCache || false);

        logger.info('Summarization completed', {
          videoId,
          tokensUsed: result.tokensConsumed,
          cacheHit: result.fromCache || false
        });

        return {
          success: true,
          videoId
        };

      } catch (error) {
        // Record failure on span
        jobSpan.setAttribute('job.status', 'failed');
        jobSpan.setAttribute('job.error', error.message);

        logger.error('Summarization failed', {
          videoId,
          error: error.message
        });

        await Video.updateOne(
          { videoId },
          {
            status: 'failed',
            errorInfo: {
              code: 'SUMMARIZATION_ERROR',
              message: error.message,
              failedAt: new Date()
            }
          }
        );

        // Capture to Sentry with full job context
        captureJobFailure(error, job, 'summarization', { videoId, title });

        throw error;
      }
    });
  },
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 2,
    limiter: {
      max: 5, // More conservative for AI API
      duration: 60000
    },
    lockDuration: 180000 // 3 minutes (AI can be slow)
  }
);

/**
 * Worker event handlers for monitoring and logging.
 */
summarizationWorker.on('ready', () => {
  logger.info('Summarization worker ready');
});

summarizationWorker.on('error', (error) => {
  logger.error('Summarization worker error', { error: error.message });
  Sentry.captureException(error, {
    tags: { worker: 'summarization', event: 'worker_error' }
  });
});

export default summarizationWorker;
