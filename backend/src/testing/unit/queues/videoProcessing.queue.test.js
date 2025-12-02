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
    await job.remove();
  });
});
