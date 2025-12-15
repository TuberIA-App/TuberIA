/**
 * @fileoverview Transcription worker for processing YouTube video transcriptions.
 * Consumes jobs from the transcription queue, fetches transcripts, and enqueues summarization.
 * @module workers/transcription
 */

import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { getTranscript } from '../services/youtube/videoTranscription.js';
import { summarizationQueue } from '../queues/videoProcessing.queue.js';
import Video from '../model/Video.js';
import logger from '../utils/logger.js';

/**
 * @typedef {Object} TranscriptionJobData
 * @property {string} videoId - YouTube video ID to transcribe
 * @property {string} channelId - MongoDB Channel ID reference
 * @property {string} title - Video title for logging/reference
 */

/**
 * @typedef {Object} TranscriptionJobResult
 * @property {boolean} success - Whether transcription completed successfully
 * @property {string} videoId - The processed video ID
 * @property {number} transcriptLength - Number of transcript segments
 */

/**
 * BullMQ worker for processing transcription jobs.
 * Fetches YouTube transcripts and enqueues summarization jobs on success.
 *
 * Worker configuration:
 * - Concurrency: Configurable via WORKER_CONCURRENCY env var (default: 2)
 * - Rate limit: 10 jobs per minute
 * - Lock duration: 2 minutes per job
 *
 * @type {Worker<TranscriptionJobData, TranscriptionJobResult>}
 */
const transcriptionWorker = new Worker(
  'transcription',
  async (job) => {
    const { videoId, channelId, title } = job.data;

    logger.info('Processing transcription', {
      videoId,
      jobId: job.id
    });

    // Update video status to processing
    await Video.updateOne(
      { videoId },
      {
        status: 'processing',
        processedAt: new Date()
      }
    );

    try {
      // Fetch transcript using existing service
      const transcriptArray = await getTranscript(videoId);

      // Convert transcript array to single string for database storage
      const transcriptionText = transcriptArray
        .map(segment => segment.text)
        .join(' ')
        .trim();

      // Save to database
      await Video.updateOne(
        { videoId },
        { transcription: transcriptionText }
      );

      // Enqueue summarization job
      await summarizationQueue.add(
        'summarize',
        {
          videoId,
          transcriptArray,
          title
        },
        {
          jobId: `summarize-${videoId}`
        }
      );

      logger.info('Transcription completed', {
        videoId,
        segments: transcriptArray.length
      });

      return {
        success: true,
        videoId,
        transcriptLength: transcriptArray.length
      };

    } catch (error) {
      logger.error('Transcription failed', {
        videoId,
        error: error.message
      });

      // Update video with error
      await Video.updateOne(
        { videoId },
        {
          status: 'failed',
          errorInfo: {
            code: error.code || 'TRANSCRIPTION_ERROR',
            message: error.message,
            failedAt: new Date()
          }
        }
      );

      throw error; // BullMQ will handle retry
    }
  },
  {
    connection: redisConnection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 2,
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000 // Per minute
    },
    lockDuration: 120000 // 2 minutes max per job
  }
);

/**
 * Worker event handlers for monitoring and logging.
 */
transcriptionWorker.on('ready', () => {
  logger.info('Transcription worker ready');
});

transcriptionWorker.on('error', (error) => {
  logger.error('Transcription worker error', { error: error.message });
});

export default transcriptionWorker;
