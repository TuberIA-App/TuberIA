/**
 * @fileoverview BullMQ queue configuration for video processing pipeline.
 * Defines transcription and summarization queues with job options and event monitoring.
 * @module queues/videoProcessing
 */

import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import logger from '../utils/logger.js';

/**
 * Transcription queue for YouTube video transcript extraction.
 *
 * Default job options:
 * - 3 retry attempts with exponential backoff (starting at 2s)
 * - Completed jobs kept for 7 days (max 100)
 * - Failed jobs kept for 30 days (max 500)
 *
 * @type {import('bullmq').Queue}
 */
export const transcriptionQueue = new Queue('transcription', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: {
      age: 7 * 24 * 3600, // 7 days
      count: 100
    },
    removeOnFail: {
      age: 30 * 24 * 3600, // 30 days
      count: 500
    }
  }
});

/**
 * Summarization queue for AI-powered video summary generation.
 *
 * Default job options:
 * - 3 retry attempts with exponential backoff (starting at 2s)
 * - Completed jobs kept for 7 days (max 100)
 *
 * @type {import('bullmq').Queue}
 */
export const summarizationQueue = new Queue('summarization', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: {
      age: 7 * 24 * 3600,
      count: 100
    }
  }
});

/**
 * Queue events listener for transcription job monitoring.
 * Logs job completion and failure events.
 * @type {import('bullmq').QueueEvents}
 * @private
 */
const transcriptionEvents = new QueueEvents('transcription', {
  connection: redisConnection
});

/**
 * Queue events listener for summarization job monitoring.
 * Logs job completion and failure events.
 * @type {import('bullmq').QueueEvents}
 * @private
 */
const summarizationEvents = new QueueEvents('summarization', {
  connection: redisConnection
});

transcriptionEvents.on('completed', ({ jobId }) => {
  logger.info('Transcription job completed', { jobId });
});

transcriptionEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error('Transcription job failed', { jobId, failedReason });
});

summarizationEvents.on('completed', ({ jobId }) => {
  logger.info('Summarization job completed', { jobId });
});

summarizationEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error('Summarization job failed', { jobId, failedReason });
});
