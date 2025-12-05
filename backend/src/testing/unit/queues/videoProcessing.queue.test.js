import { describe, it, expect } from 'vitest';
import { transcriptionQueue, summarizationQueue } from '../../../queues/videoProcessing.queue.js';

describe('Video Processing Queues', () => {
  it('should create transcription queue', () => {
    expect(transcriptionQueue.name).toBe('transcription');
  });

  it('should create summarization queue', () => {
    expect(summarizationQueue.name).toBe('summarization');
  });

  it('should enqueue a job with correct options', async () => {
    const job = await transcriptionQueue.add('test', {
      videoId: 'test123',
      channelId: 'channel123'
    }, {
      jobId: 'test-job-123'
    });

    expect(job.id).toBe('test-job-123');
    expect(job.data.videoId).toBe('test123');

    // Clean up - wait for job to be processed or failed before removing
    try {
      const jobState = await job.getState();
      if (jobState === 'active' || jobState === 'waiting') {
        // Wait a bit for worker to pick it up
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Try to remove, but don't fail if it's already processed
      await job.remove().catch(() => {});
    } catch (error) {
      // Job may already be processed/removed
    }
  });
});
