import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { generateVideoSummary } from '../services/ai/summary.service.js';
import Video from '../model/Video.js';
import logger from '../utils/logger.js';

const summarizationWorker = new Worker(
  'summarization',
  async (job) => {
    const { videoId, transcriptArray, title } = job.data;

    logger.info('Processing summarization', {
      videoId,
      jobId: job.id
    });

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

      throw error;
    }
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

summarizationWorker.on('ready', () => {
  logger.info('Summarization worker ready');
});

summarizationWorker.on('error', (error) => {
  logger.error('Summarization worker error', { error: error.message });
});

export default summarizationWorker;
