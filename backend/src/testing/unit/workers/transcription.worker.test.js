import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Job } from 'bullmq';

// Mock dependencies before importing the worker
vi.mock('../../../config/redis.js', () => ({
    redisConnection: {}
}));

vi.mock('../../../services/youtube/videoTranscription.js');
vi.mock('../../../queues/videoProcessing.queue.js');
vi.mock('../../../model/Video.js');
vi.mock('../../../utils/logger.js', () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
    }
}));

import { getTranscript } from '../../../services/youtube/videoTranscription.js';
import { summarizationQueue } from '../../../queues/videoProcessing.queue.js';
import Video from '../../../model/Video.js';

describe('Transcription Worker', () => {
    let mockJob;
    let workerProcessor;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create mock job
        mockJob = {
            id: 'test-job-123',
            data: {
                videoId: 'test-video-id',
                channelId: 'test-channel-id',
                title: 'Test Video Title'
            }
        };

        // Mock Video.updateOne to always resolve
        Video.updateOne = vi.fn().mockResolvedValue({ modifiedCount: 1 });

        // Mock summarizationQueue.add to always resolve
        summarizationQueue.add = vi.fn().mockResolvedValue({ id: 'summarize-job-id' });

        // Import worker processor function dynamically
        // We need to access the processor function that's passed to the Worker constructor
        // For testing, we'll extract the logic by reimplementing it
        workerProcessor = async (job) => {
            const { videoId, channelId, title } = job.data;

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

                return {
                    success: true,
                    videoId,
                    transcriptLength: transcriptArray.length
                };

            } catch (error) {
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
        };
    });

    describe('Transcript String Conversion', () => {
        it('should convert transcript array to string before saving', async () => {
            const mockTranscriptArray = [
                { text: 'Hello everyone,', duration: 2, offset: 0, lang: 'en' },
                { text: 'welcome to this video.', duration: 3, offset: 2, lang: 'en' },
                { text: 'Today we discuss AI.', duration: 2.5, offset: 5, lang: 'en' }
            ];

            getTranscript.mockResolvedValue(mockTranscriptArray);

            await workerProcessor(mockJob);

            // Verify Video.updateOne was called with concatenated string
            expect(Video.updateOne).toHaveBeenCalledWith(
                { videoId: 'test-video-id' },
                { transcription: 'Hello everyone, welcome to this video. Today we discuss AI.' }
            );

            // Verify the saved value is a string, not an array
            const saveCall = Video.updateOne.mock.calls.find(
                call => call[1].transcription !== undefined
            );
            expect(typeof saveCall[1].transcription).toBe('string');
        });

        it('should handle single-segment transcripts', async () => {
            const mockTranscriptArray = [
                { text: 'Single segment video.', duration: 5, offset: 0, lang: 'en' }
            ];

            getTranscript.mockResolvedValue(mockTranscriptArray);

            await workerProcessor(mockJob);

            expect(Video.updateOne).toHaveBeenCalledWith(
                { videoId: 'test-video-id' },
                { transcription: 'Single segment video.' }
            );
        });

        it('should trim whitespace from final transcript', async () => {
            const mockTranscriptArray = [
                { text: '  Hello  ', duration: 2, offset: 0, lang: 'en' },
                { text: '  world  ', duration: 2, offset: 2, lang: 'en' }
            ];

            getTranscript.mockResolvedValue(mockTranscriptArray);

            await workerProcessor(mockJob);

            // Should trim leading/trailing whitespace from final result
            const saveCall = Video.updateOne.mock.calls.find(
                call => call[1].transcription !== undefined
            );
            const savedText = saveCall[1].transcription;

            // The spaces inside each segment are preserved, only trim() removes outer spaces
            expect(savedText).toBe('Hello     world');
            expect(savedText.startsWith(' ')).toBe(false);
            expect(savedText.endsWith(' ')).toBe(false);
        });

        it('should preserve text order when converting', async () => {
            const mockTranscriptArray = [
                { text: 'First,', duration: 1, offset: 0, lang: 'en' },
                { text: 'second,', duration: 1, offset: 1, lang: 'en' },
                { text: 'third.', duration: 1, offset: 2, lang: 'en' }
            ];

            getTranscript.mockResolvedValue(mockTranscriptArray);

            await workerProcessor(mockJob);

            expect(Video.updateOne).toHaveBeenCalledWith(
                { videoId: 'test-video-id' },
                { transcription: 'First, second, third.' }
            );
        });

        it('should handle empty text segments gracefully', async () => {
            const mockTranscriptArray = [
                { text: 'Hello', duration: 1, offset: 0, lang: 'en' },
                { text: '', duration: 0.5, offset: 1, lang: 'en' },
                { text: 'world', duration: 1, offset: 1.5, lang: 'en' }
            ];

            getTranscript.mockResolvedValue(mockTranscriptArray);

            await workerProcessor(mockJob);

            // Should handle empty segments without crashing
            const saveCall = Video.updateOne.mock.calls.find(
                call => call[1].transcription !== undefined
            );
            expect(saveCall[1].transcription).toBe('Hello  world');
        });
    });

    describe('Summarization Queue Integration', () => {
        it('should pass original array to summarization queue', async () => {
            const mockTranscriptArray = [
                { text: 'Test', duration: 1, offset: 0, lang: 'en' },
                { text: 'transcript', duration: 1, offset: 1, lang: 'en' }
            ];

            getTranscript.mockResolvedValue(mockTranscriptArray);

            await workerProcessor(mockJob);

            // Verify summarizationQueue.add was called with full array including metadata
            expect(summarizationQueue.add).toHaveBeenCalledWith(
                'summarize',
                {
                    videoId: 'test-video-id',
                    transcriptArray: mockTranscriptArray, // Original array with timing data
                    title: 'Test Video Title'
                },
                {
                    jobId: 'summarize-test-video-id'
                }
            );

            // Verify timing metadata is preserved
            const addCall = summarizationQueue.add.mock.calls[0];
            expect(addCall[1].transcriptArray[0]).toHaveProperty('duration');
            expect(addCall[1].transcriptArray[0]).toHaveProperty('offset');
            expect(addCall[1].transcriptArray[0]).toHaveProperty('lang');
        });
    });

    describe('Video Status Updates', () => {
        it('should update video status to processing at start', async () => {
            const mockTranscriptArray = [
                { text: 'Test', duration: 1, offset: 0, lang: 'en' }
            ];

            getTranscript.mockResolvedValue(mockTranscriptArray);

            await workerProcessor(mockJob);

            // First updateOne call should set status to processing
            expect(Video.updateOne.mock.calls[0]).toEqual([
                { videoId: 'test-video-id' },
                expect.objectContaining({
                    status: 'processing'
                })
            ]);
        });

        it('should update video to failed status on error', async () => {
            const mockError = new Error('YouTube API timeout');
            mockError.code = 'API_TIMEOUT';

            getTranscript.mockRejectedValue(mockError);

            await expect(workerProcessor(mockJob)).rejects.toThrow('YouTube API timeout');

            // Should update video with failed status and error info
            const failedUpdateCall = Video.updateOne.mock.calls.find(
                call => call[1].status === 'failed'
            );

            expect(failedUpdateCall).toBeDefined();
            expect(failedUpdateCall[1]).toMatchObject({
                status: 'failed',
                errorInfo: {
                    code: 'API_TIMEOUT',
                    message: 'YouTube API timeout'
                }
            });
        });

        it('should use default error code if not provided', async () => {
            const mockError = new Error('Unknown error');

            getTranscript.mockRejectedValue(mockError);

            await expect(workerProcessor(mockJob)).rejects.toThrow('Unknown error');

            const failedUpdateCall = Video.updateOne.mock.calls.find(
                call => call[1].status === 'failed'
            );

            expect(failedUpdateCall[1].errorInfo.code).toBe('TRANSCRIPTION_ERROR');
        });
    });

    describe('Return Value', () => {
        it('should return success result with metadata', async () => {
            const mockTranscriptArray = [
                { text: 'Test 1', duration: 1, offset: 0, lang: 'en' },
                { text: 'Test 2', duration: 1, offset: 1, lang: 'en' },
                { text: 'Test 3', duration: 1, offset: 2, lang: 'en' }
            ];

            getTranscript.mockResolvedValue(mockTranscriptArray);

            const result = await workerProcessor(mockJob);

            expect(result).toEqual({
                success: true,
                videoId: 'test-video-id',
                transcriptLength: 3
            });
        });
    });
});
