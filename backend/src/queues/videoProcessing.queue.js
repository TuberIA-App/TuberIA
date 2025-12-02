import { Queue, QueueEvents } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import logger from '../utils/logger.js';

// Transcription Queue
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

// Summarization Queue
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

// Queue Events for Monitoring
const transcriptionEvents = new QueueEvents('transcription', {
  connection: redisConnection
});

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
