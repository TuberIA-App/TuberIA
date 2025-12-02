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

  it('should enqueue transcription job correctly', async () => {
    // Enqueue job
    const job = await transcriptionQueue.add('transcribe', {
      videoId: 'test-video-123',
      channelId: 'test-channel',
      title: 'Test Video'
    }, {
      jobId: 'test-job-123'
    });

    // Verify job was created with correct data
    expect(job.id).toBe('test-job-123');
    expect(job.data.videoId).toBe('test-video-123');
    expect(job.data.title).toBe('Test Video');

    // Verify job is in the queue
    const jobState = await job.getState();
    expect(['waiting', 'active', 'delayed']).toContain(jobState);

    // Verify video exists in database with pending status
    const video = await Video.findOne({ videoId: 'test-video-123' });
    expect(video).toBeDefined();
    expect(video.status).toBe('pending');
    expect(video.title).toBe('Test Video');
  });

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
