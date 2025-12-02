import { describe, it, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';
import { transcriptionQueue, summarizationQueue } from '../../../queues/videoProcessing.queue.js';
import { QueueEvents } from 'bullmq';
import { redisConnection } from '../../../config/redis.js';
import Video from '../../../model/Video.js';
import Channel from '../../../model/Channel.js';
import mongoose from 'mongoose';

describe('Transcription Worker Integration', () => {
  let queueEvents;
  let testChannelId;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      const testMongoUri = process.env.MONGODB_TEST_URI || 'mongodb://mongo:mongo@localhost:27017/tuberia-test-workers?authSource=admin';
      await mongoose.connect(testMongoUri);
    }

    // Create QueueEvents for listening to job completion
    queueEvents = new QueueEvents('transcription', {
      connection: redisConnection
    });

    // Create test channel
    const testChannel = await Channel.create({
      channelId: 'UCtest-channel-123',
      name: 'Test Channel',
      username: 'testchannel',
      owner: new mongoose.Types.ObjectId()
    });
    testChannelId = testChannel._id;
  });

  beforeEach(async () => {
    // Create test video
    await Video.create({
      videoId: 'test-video-123',
      channelId: testChannelId,
      title: 'Test Video',
      url: 'https://youtube.com/watch?v=test-video-123',
      status: 'pending'
    });
  });

  it('should process transcription job successfully', async () => {
    // Enqueue job
    const job = await transcriptionQueue.add('transcribe', {
      videoId: 'test-video-123',
      channelId: 'test-channel',
      title: 'Test Video'
    }, {
      jobId: 'test-job-123'
    });

    // Wait for completion (with timeout)
    await job.waitUntilFinished(queueEvents, 60000);

    // Verify video updated
    const video = await Video.findOne({ videoId: 'test-video-123' });
    expect(video.status).toBe('processing'); // Moves to 'completed' after summarization
    expect(video.transcription).toBeDefined();
    expect(Array.isArray(video.transcription)).toBe(true);
  }, 70000); // 70 second timeout

  afterEach(async () => {
    await Video.deleteMany({ videoId: 'test-video-123' });
    // Clean up test jobs
    await transcriptionQueue.obliterate({ force: true });
    await summarizationQueue.obliterate({ force: true });
  });

  afterAll(async () => {
    await queueEvents.close();
    // Clean up test channel
    await Channel.deleteMany({ channelId: 'UCtest-channel-123' });
    await mongoose.connection.close();
  });
});
