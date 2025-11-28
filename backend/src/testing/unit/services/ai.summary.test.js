import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateVideoSummary, generateSummaryFromText } from '../../../services/ai/summary.service.js';
import * as openRouterService from '../../../services/ai/openrouter.service.js';

describe('AI Summary Service', () => {
    // Reset all mocks before each test
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateVideoSummary', () => {
        const mockTranscript = [
            { text: 'Hello everyone,', duration: 2, offset: 0, lang: 'en' },
            { text: 'today we will talk about AI technology', duration: 3, offset: 2, lang: 'en' },
            { text: 'and how it works in modern applications.', duration: 2, offset: 5, lang: 'en' },
            { text: 'AI is very powerful and transformative', duration: 3, offset: 7, lang: 'en' },
            { text: 'with many real-world applications across industries.', duration: 3, offset: 10, lang: 'en' }
        ];

        it('should generate summary successfully with valid transcript array', async () => {
            // Mock the generateCompletion function to avoid real API calls
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'This video provides an introduction to AI technology and its applications in modern software. The speaker discusses how AI is transforming various industries with powerful capabilities.',
                    tokensUsed: 50,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: '- AI is transforming modern applications\n- Powerful technology with real-world impact\n- Applications span across multiple industries',
                    tokensUsed: 30,
                    model: 'z-ai/glm-4.5'
                });

            const result = await generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Introduction to AI Technology',
                model: 'z-ai/glm-4.5'
            });

            // Verify success result structure
            expect(result.error).toBeUndefined();
            expect(result.summary).toBeDefined();
            expect(result.summary).toBe('This video provides an introduction to AI technology and its applications in modern software. The speaker discusses how AI is transforming various industries with powerful capabilities.');

            // Verify key points
            expect(result.keyPoints).toBeInstanceOf(Array);
            expect(result.keyPoints.length).toBe(3);
            expect(result.keyPoints[0]).toBe('AI is transforming modern applications');
            expect(result.keyPoints[1]).toBe('Powerful technology with real-world impact');
            expect(result.keyPoints[2]).toBe('Applications span across multiple industries');

            // Verify metadata
            expect(result.tokensConsumed).toBe(80);
            expect(result.aiModel).toBe('z-ai/glm-4.5');
            expect(result.transcriptSegments).toBe(5);
            expect(result.transcriptLength).toBeGreaterThan(0);

            // Verify generateCompletion was called twice
            expect(openRouterService.generateCompletion).toHaveBeenCalledTimes(2);
        });

        it('should work without video title', async () => {
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'Test summary without title',
                    tokensUsed: 20,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: '- Point 1\n- Point 2',
                    tokensUsed: 10,
                    model: 'z-ai/glm-4.5'
                });

            const result = await generateVideoSummary({
                transcriptArray: mockTranscript
                // No videoTitle provided
            });

            expect(result.error).toBeUndefined();
            expect(result.summary).toBeDefined();
            expect(result.keyPoints).toBeInstanceOf(Array);
        });

        it('should return error for empty transcript array', async () => {
            const result = await generateVideoSummary({
                transcriptArray: [],
                videoTitle: 'Test Video'
            });

            expect(result.error).toBe('bad_request');
            expect(result.message).toContain('Invalid transcript');
        });

        it('should return error for invalid transcript format (not array)', async () => {
            const result = await generateVideoSummary({
                transcriptArray: 'not an array',
                videoTitle: 'Test Video'
            });

            expect(result.error).toBe('bad_request');
            expect(result.message).toContain('Invalid transcript');
        });

        it('should return error for transcript array with missing text fields', async () => {
            const invalidTranscript = [
                { duration: 2, offset: 0 }, // Missing 'text' field
                { duration: 3, offset: 2 }
            ];

            const result = await generateVideoSummary({
                transcriptArray: invalidTranscript,
                videoTitle: 'Test Video'
            });

            expect(result.error).toBe('bad_request');
            expect(result.message).toContain('Invalid transcript');
        });

        it('should return error when processed transcript is too short', async () => {
            const shortTranscript = [
                { text: 'Hi', duration: 1, offset: 0, lang: 'en' }
            ];

            const result = await generateVideoSummary({
                transcriptArray: shortTranscript,
                videoTitle: 'Test Video'
            });

            expect(result.error).toBe('bad_request');
            expect(result.message).toContain('too short');
        });

        it('should handle OpenRouter API errors gracefully', async () => {
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockRejectedValueOnce(new Error('API connection failed'));

            const result = await generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Test Video'
            });

            expect(result.error).toBe('server_error');
            expect(result.message).toBe('API connection failed');
        });

        it('should handle operational errors from OpenRouter service', async () => {
            const operationalError = new Error('AI service timeout');
            operationalError.isOperational = true;

            vi.spyOn(openRouterService, 'generateCompletion')
                .mockRejectedValueOnce(operationalError);

            const result = await generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Test Video'
            });

            expect(result.error).toBe('server_error');
            expect(result.message).toContain('AI service timeout');
        });

        it('should truncate very long transcripts', async () => {
            // Create a very long transcript (simulate 100k characters)
            const longText = 'This is a very long sentence that will be repeated many times. '.repeat(2000);
            const longTranscript = [{ text: longText, duration: 1000, offset: 0, lang: 'en' }];

            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'Summary of long content',
                    tokensUsed: 100,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: '- Key point 1',
                    tokensUsed: 20,
                    model: 'z-ai/glm-4.5'
                });

            const result = await generateVideoSummary({
                transcriptArray: longTranscript,
                videoTitle: 'Long Video'
            });

            expect(result.error).toBeUndefined();
            expect(result.summary).toBeDefined();
            // Verify the transcript was truncated (max 50000 chars)
            expect(result.transcriptLength).toBeLessThanOrEqual(50003); // 50000 + '...'
        });

        it('should parse key points with different bullet formats', async () => {
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'Test summary',
                    tokensUsed: 20,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: '- Point with dash\n• Point with bullet\n* Point with asterisk\n1. Point with number\n2. Another numbered point',
                    tokensUsed: 30,
                    model: 'z-ai/glm-4.5'
                });

            const result = await generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Test'
            });

            expect(result.keyPoints).toHaveLength(5);
            expect(result.keyPoints[0]).toBe('Point with dash');
            expect(result.keyPoints[1]).toBe('Point with bullet');
            expect(result.keyPoints[2]).toBe('Point with asterisk');
            expect(result.keyPoints[3]).toBe('Point with number');
            expect(result.keyPoints[4]).toBe('Another numbered point');
        });

        it('should handle empty key points response with fallback', async () => {
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'Test summary',
                    tokensUsed: 20,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: 'No bullet points here, just plain text',
                    tokensUsed: 15,
                    model: 'z-ai/glm-4.5'
                });

            const result = await generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Test'
            });

            expect(result.keyPoints).toHaveLength(1);
            expect(result.keyPoints[0]).toBe('Resumen generado exitosamente');
        });

        it('should limit key points to maximum 10', async () => {
            const manyPoints = Array.from({ length: 15 }, (_, i) => `- Point ${i + 1}`).join('\n');

            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'Test summary',
                    tokensUsed: 20,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: manyPoints,
                    tokensUsed: 50,
                    model: 'z-ai/glm-4.5'
                });

            const result = await generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Test'
            });

            expect(result.keyPoints).toHaveLength(10);
            expect(result.keyPoints[0]).toBe('Point 1');
            expect(result.keyPoints[9]).toBe('Point 10');
        });
    });

    describe('generateSummaryFromText', () => {
        it('should generate summary from raw text successfully', async () => {
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'Summary of the provided text about technology and innovation.',
                    tokensUsed: 40,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: '- Technology is advancing rapidly\n- Innovation drives progress\n- Digital transformation is key',
                    tokensUsed: 25,
                    model: 'z-ai/glm-4.5'
                });

            const longText = 'This is a comprehensive text about technology and innovation in the modern world. '.repeat(10);

            const result = await generateSummaryFromText({
                transcriptText: longText,
                videoTitle: 'Tech Talk',
                model: 'z-ai/glm-4.5'
            });

            expect(result.error).toBeUndefined();
            expect(result.summary).toBeDefined();
            expect(result.summary).toContain('technology');
            expect(result.keyPoints).toBeInstanceOf(Array);
            expect(result.keyPoints.length).toBe(3);
            expect(result.tokensConsumed).toBe(65);
        });

        it('should return error for empty text', async () => {
            const result = await generateSummaryFromText({
                transcriptText: '',
                videoTitle: 'Test'
            });

            expect(result.error).toBe('bad_request');
            expect(result.message).toContain('required');
        });

        it('should return error for undefined text', async () => {
            const result = await generateSummaryFromText({
                transcriptText: undefined,
                videoTitle: 'Test'
            });

            expect(result.error).toBe('bad_request');
            expect(result.message).toContain('required');
        });

        it('should return error for non-string text', async () => {
            const result = await generateSummaryFromText({
                transcriptText: 12345, // Number instead of string
                videoTitle: 'Test'
            });

            expect(result.error).toBe('bad_request');
            expect(result.message).toContain('required');
        });

        it('should return error for text that is too short', async () => {
            const result = await generateSummaryFromText({
                transcriptText: 'Too short',
                videoTitle: 'Test'
            });

            expect(result.error).toBe('bad_request');
            expect(result.message).toContain('minimum 50 characters');
        });

        it('should work without video title', async () => {
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'Summary without title',
                    tokensUsed: 25,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: '- Point 1\n- Point 2',
                    tokensUsed: 15,
                    model: 'z-ai/glm-4.5'
                });

            const result = await generateSummaryFromText({
                transcriptText: 'This is a sufficiently long text for testing purposes. '.repeat(5)
                // No videoTitle provided
            });

            expect(result.error).toBeUndefined();
            expect(result.summary).toBeDefined();
        });

        it('should handle errors from generateVideoSummary', async () => {
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockRejectedValueOnce(new Error('Network error'));

            const result = await generateSummaryFromText({
                transcriptText: 'Valid text that is long enough for processing. '.repeat(5),
                videoTitle: 'Test'
            });

            expect(result.error).toBe('server_error');
            expect(result.message).toBeDefined();
        });
    });
});
