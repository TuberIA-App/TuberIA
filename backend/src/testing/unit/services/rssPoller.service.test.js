import { describe, it, expect, beforeEach, vi } from 'vitest';
import { channelFeedExtractor } from '../../../services/youtube/channelFeedExtractor.js';
import { transcriptionQueue } from '../../../queues/videoProcessing.queue.js';
import Channel from '../../../model/Channel.js';
import Video from '../../../model/Video.js';

// Mock dependencies
vi.mock('../../../services/youtube/channelFeedExtractor.js');
vi.mock('../../../queues/videoProcessing.queue.js');
vi.mock('../../../model/Channel.js');
vi.mock('../../../model/Video.js');

describe('RSS Poller Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processChannelVideos - Latest Video Only', () => {
    it('should only process the first (latest) video from RSS feed', async () => {
      // Mock channel
      const mockChannel = {
        _id: 'channel123',
        channelId: 'UCam8T03EOFBsNdR0thrFHdQ',
        name: 'Test Channel'
      };

      // Mock RSS feed with 15 videos
      const mockFeed = {
        entry: [
          {
            'yt:videoId': 'latest-video-id',
            title: 'Latest Video',
            published: '2025-12-06T10:00:00Z',
            'yt:channelId': 'UCam8T03EOFBsNdR0thrFHdQ'
          },
          {
            'yt:videoId': 'old-video-id-1',
            title: 'Old Video 1',
            published: '2025-12-05T10:00:00Z',
            'yt:channelId': 'UCam8T03EOFBsNdR0thrFHdQ'
          },
          {
            'yt:videoId': 'old-video-id-2',
            title: 'Old Video 2',
            published: '2025-12-04T10:00:00Z',
            'yt:channelId': 'UCam8T03EOFBsNdR0thrFHdQ'
          }
          // ... imagine 12 more videos
        ]
      };

      Channel.findOne.mockResolvedValue(mockChannel); // Mock channel lookup
      channelFeedExtractor.mockResolvedValue(mockFeed);
      Video.findOne.mockResolvedValue(null); // No existing video
      Video.create.mockResolvedValue({ videoId: 'latest-video-id' });
      transcriptionQueue.add.mockResolvedValue({ id: 'job-123' });
      Channel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      // Import and execute the function
      const { pollChannelNow } = await import('../../../services/youtube/rssPoller.service.js');
      await pollChannelNow(mockChannel.channelId);

      // Verify only ONE video was checked
      expect(Video.findOne).toHaveBeenCalledTimes(1);
      expect(Video.findOne).toHaveBeenCalledWith({
        videoId: 'latest-video-id'
      });

      // Verify only ONE video was created
      expect(Video.create).toHaveBeenCalledTimes(1);
      expect(Video.create).toHaveBeenCalledWith({
        videoId: 'latest-video-id',
        title: 'Latest Video',
        url: 'https://www.youtube.com/watch?v=latest-video-id',
        channelId: mockChannel._id,
        publishedAt: new Date('2025-12-06T10:00:00Z'),
        status: 'pending',
        createdAt: expect.any(Date)
      });

      // Verify only ONE transcription job was enqueued
      expect(transcriptionQueue.add).toHaveBeenCalledTimes(1);
      expect(transcriptionQueue.add).toHaveBeenCalledWith(
        'transcribe',
        {
          videoId: 'latest-video-id',
          channelId: mockChannel.channelId,
          title: 'Latest Video'
        },
        expect.objectContaining({
          jobId: 'transcribe-latest-video-id',
          attempts: 3
        })
      );
    });

    it('should not process any videos if latest video already exists', async () => {
      const mockChannel = {
        _id: 'channel123',
        channelId: 'UCam8T03EOFBsNdR0thrFHdQ'
      };

      const mockFeed = {
        entry: [
          {
            'yt:videoId': 'existing-video',
            title: 'Already Processed',
            published: '2025-12-06T10:00:00Z',
            'yt:channelId': 'UCam8T03EOFBsNdR0thrFHdQ'
          },
          // ... more old videos
        ]
      };

      Channel.findOne.mockResolvedValue(mockChannel); // Mock channel lookup
      channelFeedExtractor.mockResolvedValue(mockFeed);
      Video.findOne.mockResolvedValue({ videoId: 'existing-video' }); // Video exists
      Channel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const { pollChannelNow } = await import('../../../services/youtube/rssPoller.service.js');
      await pollChannelNow(mockChannel.channelId);

      // Verify only latest video was checked
      expect(Video.findOne).toHaveBeenCalledTimes(1);

      // Verify NO new videos were created
      expect(Video.create).not.toHaveBeenCalled();

      // Verify NO transcription jobs were enqueued
      expect(transcriptionQueue.add).not.toHaveBeenCalled();
    });

    it('should handle empty RSS feed gracefully', async () => {
      const mockChannel = {
        _id: 'channel123',
        channelId: 'UCemptyChannel'
      };

      const mockFeed = {
        entry: [] // Empty feed
      };

      Channel.findOne.mockResolvedValue(mockChannel); // Mock channel lookup
      channelFeedExtractor.mockResolvedValue(mockFeed);
      Channel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const { pollChannelNow } = await import('../../../services/youtube/rssPoller.service.js');
      await pollChannelNow(mockChannel.channelId);

      // Verify no videos were processed
      expect(Video.findOne).not.toHaveBeenCalled();
      expect(Video.create).not.toHaveBeenCalled();
      expect(transcriptionQueue.add).not.toHaveBeenCalled();

      // Verify channel lastChecked was still updated
      expect(Channel.updateOne).toHaveBeenCalledWith(
        { channelId: mockChannel.channelId },
        { lastChecked: expect.any(Date) }
      );
    });

    it('should handle single video in RSS feed', async () => {
      const mockChannel = {
        _id: 'channel123',
        channelId: 'UCsingleVideo'
      };

      // Single entry (not array)
      const mockFeed = {
        entry: {
          'yt:videoId': 'single-video',
          title: 'Only Video',
          published: '2025-12-06T10:00:00Z',
          'yt:channelId': 'UCsingleVideo'
        }
      };

      Channel.findOne.mockResolvedValue(mockChannel); // Mock channel lookup
      channelFeedExtractor.mockResolvedValue(mockFeed);
      Video.findOne.mockResolvedValue(null);
      Video.create.mockResolvedValue({ videoId: 'single-video' });
      transcriptionQueue.add.mockResolvedValue({ id: 'job-123' });
      Channel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const { pollChannelNow } = await import('../../../services/youtube/rssPoller.service.js');
      await pollChannelNow(mockChannel.channelId);

      // Verify the single video was processed
      expect(Video.findOne).toHaveBeenCalledTimes(1);
      expect(Video.create).toHaveBeenCalledTimes(1);
      expect(transcriptionQueue.add).toHaveBeenCalledTimes(1);
    });

    it('should update channel lastChecked timestamp even on error', async () => {
      const mockChannel = {
        _id: 'channel123',
        channelId: 'UCerrorChannel'
      };

      Channel.findOne.mockResolvedValue(mockChannel); // Mock channel lookup
      channelFeedExtractor.mockRejectedValue(new Error('RSS fetch failed'));
      Channel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const { pollChannelNow } = await import('../../../services/youtube/rssPoller.service.js');

      // Should not throw
      await expect(pollChannelNow(mockChannel.channelId)).resolves.toBeDefined();

      // Verify lastChecked was still updated
      expect(Channel.updateOne).toHaveBeenCalledWith(
        { channelId: mockChannel.channelId },
        { lastChecked: expect.any(Date) }
      );
    });
  });
});
