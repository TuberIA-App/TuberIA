import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateVideoSummary, generateSummaryFromText } from '../../../services/ai/summary.service.js';
import * as openRouterService from '../../../services/ai/openrouter.service.js';
import { redisClient } from '../../../config/redis.js';

describe('AI Summary Service', () => {
    // Reset all mocks and clear Redis cache before each test
    beforeEach(async () => {
        vi.clearAllMocks();
        // Clear Redis cache to prevent idempotency cache hits between tests
        await redisClient.flushdb();
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
                videoTitle: 'Introduction to AI Technology'
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
                    content: 'This is a comprehensive test summary without a video title that is long enough to pass validation checks.',
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

            expect(result.summary).toBeDefined();
            expect(result.keyPoints).toBeInstanceOf(Array);
        });

        it('should throw error for empty transcript array', async () => {
            await expect(generateVideoSummary({
                transcriptArray: [],
                videoTitle: 'Test Video'
            })).rejects.toThrow('Invalid transcript format');
        });

        it('should throw error for invalid transcript format (not array)', async () => {
            await expect(generateVideoSummary({
                transcriptArray: 'not an array',
                videoTitle: 'Test Video'
            })).rejects.toThrow('Invalid transcript format');
        });

        it('should throw error for transcript array with missing text fields', async () => {
            const invalidTranscript = [
                { duration: 2, offset: 0 }, // Missing 'text' field
                { duration: 3, offset: 2 }
            ];

            await expect(generateVideoSummary({
                transcriptArray: invalidTranscript,
                videoTitle: 'Test Video'
            })).rejects.toThrow('Invalid transcript format');
        });

        it('should throw error when processed transcript is too short', async () => {
            const shortTranscript = [
                { text: 'Hi', duration: 1, offset: 0, lang: 'en' }
            ];

            await expect(generateVideoSummary({
                transcriptArray: shortTranscript,
                videoTitle: 'Test Video'
            })).rejects.toThrow('too short');
        });

        it('should throw error when OpenRouter API fails for all models', async () => {
            // Mock all 4 models in the fallback chain to fail
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockRejectedValueOnce(new Error('API connection failed'))
                .mockRejectedValueOnce(new Error('API connection failed'))
                .mockRejectedValueOnce(new Error('API connection failed'))
                .mockRejectedValueOnce(new Error('API connection failed'));

            await expect(generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Test Video'
            })).rejects.toThrow('API connection failed');
        });

        it('should throw operational errors from OpenRouter service when all models fail', async () => {
            const operationalError = new Error('AI service timeout');
            operationalError.isOperational = true;

            // Mock all 4 models to fail with the same operational error
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockRejectedValueOnce(operationalError)
                .mockRejectedValueOnce(operationalError)
                .mockRejectedValueOnce(operationalError)
                .mockRejectedValueOnce(operationalError);

            await expect(generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Test Video'
            })).rejects.toThrow('AI service timeout');
        });

        it('should truncate very long transcripts', async () => {
            // Create a very long transcript (simulate 100k characters)
            const longText = 'This is a very long sentence that will be repeated many times. '.repeat(2000);
            const longTranscript = [{ text: longText, duration: 1000, offset: 0, lang: 'en' }];

            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'This is a comprehensive summary of the very long content that has been truncated to meet API limits.',
                    tokensUsed: 100,
                    model: 'z-ai/glm-4.5'
                })
                .mockResolvedValueOnce({
                    content: '- Key point 1\n- Key point 2',
                    tokensUsed: 20,
                    model: 'z-ai/glm-4.5'
                });

            const result = await generateVideoSummary({
                transcriptArray: longTranscript,
                videoTitle: 'Long Video'
            });

            expect(result.summary).toBeDefined();
            // Verify the transcript was truncated (max 50000 chars)
            expect(result.transcriptLength).toBeLessThanOrEqual(50003); // 50000 + '...'
        });

        it('should parse key points with different bullet formats', async () => {
            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'This is a comprehensive test summary that is long enough to pass all validation checks.',
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

        it('should throw error when key points parsing fails for all models', async () => {
            // All 4 models succeed in generating summary but fail to parse key points
            vi.spyOn(openRouterService, 'generateCompletion')
                // Model 1: summary ok, key points invalid
                .mockResolvedValueOnce({ content: 'This is a comprehensive test summary that is long enough to pass all validation checks.', tokensUsed: 20, model: 'z-ai/glm-4.5' })
                .mockResolvedValueOnce({ content: 'No bullet points here, just plain text', tokensUsed: 15, model: 'z-ai/glm-4.5' })
                // Model 2: summary ok, key points invalid
                .mockResolvedValueOnce({ content: 'Another comprehensive test summary that is long enough to pass all validation checks.', tokensUsed: 20, model: 'amazon/nova-2-lite-v1:free' })
                .mockResolvedValueOnce({ content: 'Still no bullets', tokensUsed: 15, model: 'amazon/nova-2-lite-v1:free' })
                // Model 3: summary ok, key points invalid
                .mockResolvedValueOnce({ content: 'Yet another comprehensive test summary that is long enough to pass all validation checks.', tokensUsed: 20, model: 'amazon/nova-2-lite-v1' })
                .mockResolvedValueOnce({ content: 'No bullets again', tokensUsed: 15, model: 'amazon/nova-2-lite-v1' })
                // Model 4: summary ok, key points invalid
                .mockResolvedValueOnce({ content: 'Final comprehensive test summary that is long enough to pass all validation checks.', tokensUsed: 20, model: 'google/gemini-flash-1.5' })
                .mockResolvedValueOnce({ content: 'No bullets whatsoever', tokensUsed: 15, model: 'google/gemini-flash-1.5' });

            await expect(generateVideoSummary({
                transcriptArray: mockTranscript,
                videoTitle: 'Test'
            })).rejects.toThrow('Failed to parse key points');
        });

        it('should limit key points to maximum 10', async () => {
            const manyPoints = Array.from({ length: 15 }, (_, i) => `- Point ${i + 1}`).join('\n');

            vi.spyOn(openRouterService, 'generateCompletion')
                .mockResolvedValueOnce({
                    content: 'This is a comprehensive test summary that is long enough to pass all validation checks.',
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

        describe('Model fallback behavior', () => {
            it('should use first model if it succeeds', async () => {
                vi.spyOn(openRouterService, 'generateCompletion')
                    .mockResolvedValueOnce({ content: 'Valid summary content that is long enough to pass validation checks.', tokensUsed: 50, model: 'z-ai/glm-4.5' })
                    .mockResolvedValueOnce({ content: '- Point 1\n- Point 2', tokensUsed: 20, model: 'z-ai/glm-4.5' });

                const result = await generateVideoSummary({
                    transcriptArray: mockTranscript,
                    videoTitle: 'Test'
                });

                expect(result.aiModel).toBe('z-ai/glm-4.5');
                expect(openRouterService.generateCompletion).toHaveBeenCalledTimes(2); // Only first model
            });

            it('should fallback to second model if first fails', async () => {
                vi.spyOn(openRouterService, 'generateCompletion')
                    // First model fails
                    .mockRejectedValueOnce(new Error('AI service returned empty response'))
                    // Second model succeeds
                    .mockResolvedValueOnce({ content: 'Valid summary from Nova model that is long enough to pass all validation.', tokensUsed: 60, model: 'amazon/nova-2-lite-v1:free' })
                    .mockResolvedValueOnce({ content: '- Nova point 1\n- Nova point 2', tokensUsed: 25, model: 'amazon/nova-2-lite-v1:free' });

                const result = await generateVideoSummary({
                    transcriptArray: mockTranscript,
                    videoTitle: 'Test'
                });

                expect(result.aiModel).toBe('amazon/nova-2-lite-v1:free');
                expect(result.summary).toContain('Nova');
                expect(openRouterService.generateCompletion).toHaveBeenCalledTimes(3); // 1 fail + 2 success
            });

            it('should try all models and throw if all fail', async () => {
                vi.spyOn(openRouterService, 'generateCompletion')
                    .mockRejectedValue(new Error('AI service returned empty response'));

                await expect(generateVideoSummary({
                    transcriptArray: mockTranscript,
                    videoTitle: 'Test'
                })).rejects.toThrow('AI service returned empty response');

                // Should have tried all 4 models (each fails on first API call - summary generation)
                expect(openRouterService.generateCompletion).toHaveBeenCalledTimes(4);
            });

            it('should fallback if summary validation fails', async () => {
                vi.spyOn(openRouterService, 'generateCompletion')
                    // First model returns too short summary
                    .mockResolvedValueOnce({ content: 'Too short', tokensUsed: 5, model: 'z-ai/glm-4.5' })
                    // Second model succeeds
                    .mockResolvedValueOnce({ content: 'This is a proper length summary that will pass all validation checks successfully.', tokensUsed: 55, model: 'amazon/nova-2-lite-v1:free' })
                    .mockResolvedValueOnce({ content: '- Point 1\n- Point 2', tokensUsed: 20, model: 'amazon/nova-2-lite-v1:free' });

                const result = await generateVideoSummary({
                    transcriptArray: mockTranscript,
                    videoTitle: 'Test'
                });

                expect(result.aiModel).toBe('amazon/nova-2-lite-v1:free');
                expect(openRouterService.generateCompletion).toHaveBeenCalledTimes(3); // 1 fail + 2 success
            });

            it('should fallback if key points parsing fails', async () => {
                vi.spyOn(openRouterService, 'generateCompletion')
                    // First model: summary succeeds but key points have no bullets
                    .mockResolvedValueOnce({ content: 'Valid summary content that is long enough to pass validation checks.', tokensUsed: 50, model: 'z-ai/glm-4.5' })
                    .mockResolvedValueOnce({ content: 'No bullets here', tokensUsed: 10, model: 'z-ai/glm-4.5' })
                    // Second model: both succeed
                    .mockResolvedValueOnce({ content: 'Another valid summary content that is long enough to pass validation checks.', tokensUsed: 55, model: 'amazon/nova-2-lite-v1:free' })
                    .mockResolvedValueOnce({ content: '- Good point 1\n- Good point 2', tokensUsed: 20, model: 'amazon/nova-2-lite-v1:free' });

                const result = await generateVideoSummary({
                    transcriptArray: mockTranscript,
                    videoTitle: 'Test'
                });

                expect(result.aiModel).toBe('amazon/nova-2-lite-v1:free');
                expect(result.keyPoints).toHaveLength(2);
                expect(openRouterService.generateCompletion).toHaveBeenCalledTimes(4); // 2 (first model) + 2 (second model)
            });

            it('should try third model if first two fail', async () => {
                vi.spyOn(openRouterService, 'generateCompletion')
                    // First model fails
                    .mockRejectedValueOnce(new Error('Timeout'))
                    // Second model fails
                    .mockRejectedValueOnce(new Error('Rate limit'))
                    // Third model succeeds
                    .mockResolvedValueOnce({ content: 'Valid summary from third model that passes all validation checks completely.', tokensUsed: 70, model: 'amazon/nova-2-lite-v1' })
                    .mockResolvedValueOnce({ content: '- Third model point 1\n- Third model point 2', tokensUsed: 30, model: 'amazon/nova-2-lite-v1' });

                const result = await generateVideoSummary({
                    transcriptArray: mockTranscript,
                    videoTitle: 'Test'
                });

                expect(result.aiModel).toBe('amazon/nova-2-lite-v1');
                expect(openRouterService.generateCompletion).toHaveBeenCalledTimes(4); // 1 + 1 + 2
            });
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
                videoTitle: 'Tech Talk'
            });

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
                    content: 'This is a comprehensive summary without a video title that is long enough to pass validation.',
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
