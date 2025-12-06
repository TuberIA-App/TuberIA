import { describe, it, expect, beforeEach, vi } from 'vitest';
import Video from '../../../model/Video.js';
import { transcriptionQueue } from '../../../queues/videoProcessing.queue.js';

// Mock dependencies
vi.mock('../../../model/Video.js');
vi.mock('../../../queues/videoProcessing.queue.js');

describe('Retry Failed Transcriptions Service - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('retryFailedTranscriptionsNow', () => {
    it('should retry failed transcriptions older than threshold', async () => {
      const now = new Date();
      const failedAt = new Date(now.getTime() - 13 * 60 * 60 * 1000); // 13 hours ago

      const mockFailedVideos = [
        {
          _id: 'video1',
          videoId: 'failed-video-1',
          channelId: 'channel1',
          title: 'Failed Video 1',
          status: 'failed',
          errorInfo: {
            code: 'TRANSCRIPTION_ERROR',
            message: 'Transcription not available',
            failedAt
          }
        },
        {
          _id: 'video2',
          videoId: 'failed-video-2',
          channelId: 'channel1',
          title: 'Failed Video 2',
          status: 'failed',
          errorInfo: {
            code: 'TRANSCRIPTION_ERROR',
            message: 'Transcription not available',
            failedAt
          }
        }
      ];

      Video.find.mockReturnValue({
        limit: vi.fn().mockResolvedValue(mockFailedVideos)
      });
      Video.updateOne.mockResolvedValue({ modifiedCount: 1 });
      transcriptionQueue.add.mockResolvedValue({ id: 'job-123' });

      const { retryFailedTranscriptionsNow } = await import(
        '../../../services/retryFailedTranscriptions.service.js'
      );

      const result = await retryFailedTranscriptionsNow(12);

      // Verify correct query was made
      expect(Video.find).toHaveBeenCalledWith({
        status: 'failed',
        'errorInfo.code': 'TRANSCRIPTION_ERROR',
        'errorInfo.failedAt': { $lte: expect.any(Date) }
      });

      // Verify both videos were reset to pending
      expect(Video.updateOne).toHaveBeenCalledTimes(2);
      expect(Video.updateOne).toHaveBeenCalledWith(
        { _id: 'video1' },
        {
          status: 'pending',
          $unset: { errorInfo: 1 }
        }
      );

      // Verify both transcription jobs were re-enqueued
      expect(transcriptionQueue.add).toHaveBeenCalledTimes(2);
      expect(transcriptionQueue.add).toHaveBeenCalledWith(
        'transcribe',
        {
          videoId: 'failed-video-1',
          channelId: 'channel1',
          title: 'Failed Video 1'
        },
        expect.objectContaining({
          jobId: expect.stringContaining('transcribe-retry-failed-video-1-'),
          attempts: 3
        })
      );

      expect(result).toEqual({ retriedCount: 2 });
    });

    it('should not retry failed transcriptions newer than threshold', async () => {
      const now = new Date();
      const recentFailure = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago

      const mockFailedVideos = [];

      Video.find.mockReturnValue({
        limit: vi.fn().mockResolvedValue(mockFailedVideos)
      });

      const { retryFailedTranscriptionsNow } = await import(
        '../../../services/retryFailedTranscriptions.service.js'
      );

      const result = await retryFailedTranscriptionsNow(12);

      // Verify query was made with correct threshold
      expect(Video.find).toHaveBeenCalledWith({
        status: 'failed',
        'errorInfo.code': 'TRANSCRIPTION_ERROR',
        'errorInfo.failedAt': { $lte: expect.any(Date) }
      });

      // Verify no videos were updated
      expect(Video.updateOne).not.toHaveBeenCalled();

      // Verify no jobs were enqueued
      expect(transcriptionQueue.add).not.toHaveBeenCalled();

      expect(result).toEqual({ retriedCount: 0 });
    });

    it('should limit retry to 50 videos at a time', async () => {
      const now = new Date();
      const failedAt = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

      Video.find.mockReturnValue({
        limit: vi.fn().mockResolvedValue([])
      });

      const { retryFailedTranscriptionsNow } = await import(
        '../../../services/retryFailedTranscriptions.service.js'
      );

      await retryFailedTranscriptionsNow(12);

      // Verify limit was applied
      const findMock = Video.find.mock.results[0].value;
      expect(findMock.limit).toHaveBeenCalledWith(50);
    });

    it('should only retry TRANSCRIPTION_ERROR failures', async () => {
      const now = new Date();
      const failedAt = new Date(now.getTime() - 13 * 60 * 60 * 1000);

      Video.find.mockReturnValue({
        limit: vi.fn().mockResolvedValue([])
      });

      const { retryFailedTranscriptionsNow } = await import(
        '../../../services/retryFailedTranscriptions.service.js'
      );

      await retryFailedTranscriptionsNow(12);

      // Verify query filters for TRANSCRIPTION_ERROR only
      expect(Video.find).toHaveBeenCalledWith(
        expect.objectContaining({
          'errorInfo.code': 'TRANSCRIPTION_ERROR'
        })
      );
    });

    it('should handle different threshold values (24 hours)', async () => {
      const now = new Date();
      const failedAt = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago

      const mockFailedVideo = {
        _id: 'video1',
        videoId: 'failed-video',
        channelId: 'channel1',
        title: 'Failed Video',
        status: 'failed',
        errorInfo: {
          code: 'TRANSCRIPTION_ERROR',
          failedAt
        }
      };

      Video.find.mockReturnValue({
        limit: vi.fn().mockResolvedValue([mockFailedVideo])
      });
      Video.updateOne.mockResolvedValue({ modifiedCount: 1 });
      transcriptionQueue.add.mockResolvedValue({ id: 'job-123' });

      const { retryFailedTranscriptionsNow } = await import(
        '../../../services/retryFailedTranscriptions.service.js'
      );

      const result = await retryFailedTranscriptionsNow(24);

      expect(result).toEqual({ retriedCount: 1 });
    });

    it('should remove errorInfo when resetting video status', async () => {
      const now = new Date();
      const failedAt = new Date(now.getTime() - 13 * 60 * 60 * 1000);

      const mockFailedVideo = {
        _id: 'video1',
        videoId: 'failed-video',
        channelId: 'channel1',
        title: 'Failed Video',
        status: 'failed',
        errorInfo: {
          code: 'TRANSCRIPTION_ERROR',
          message: 'Original error message',
          failedAt
        }
      };

      Video.find.mockReturnValue({
        limit: vi.fn().mockResolvedValue([mockFailedVideo])
      });
      Video.updateOne.mockResolvedValue({ modifiedCount: 1 });
      transcriptionQueue.add.mockResolvedValue({ id: 'job-123' });

      const { retryFailedTranscriptionsNow } = await import(
        '../../../services/retryFailedTranscriptions.service.js'
      );

      await retryFailedTranscriptionsNow(12);

      // Verify errorInfo is removed
      expect(Video.updateOne).toHaveBeenCalledWith(
        { _id: 'video1' },
        {
          status: 'pending',
          $unset: { errorInfo: 1 }
        }
      );
    });
  });
});
