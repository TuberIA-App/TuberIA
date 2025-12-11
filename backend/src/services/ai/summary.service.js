import { generateCompletion } from './openrouter.service.js';
import { processTranscript, validateTranscript } from './transcriptionProcessor.js';
import { SUMMARY_PROMPT, KEY_POINTS_PROMPT } from './prompts.js';
import { withIdempotency } from '../../utils/idempotency.js';
import { SUMMARIZATION_MODELS } from './modelConfig.js';
import logger from '../../utils/logger.js';

/**
 * Attempt summary generation with a specific model (private helper)
 * @private
 */
const attemptSummaryWithModel = async (model, transcriptText, truncatedTranscript, videoTitle, transcriptArray) => {
    // Step 1: Generate summary
    const summaryMessages = [
        { role: 'system', content: SUMMARY_PROMPT },
        {
            role: 'user',
            content: videoTitle
                ? `Título del video: ${videoTitle}\n\nTranscripción:\n${truncatedTranscript}`
                : `Transcripción:\n${truncatedTranscript}`
        }
    ];

    const summaryResult = await generateCompletion({
        model,
        messages: summaryMessages,
        maxTokens: 2000,
        temperature: 0.7
    });

    // Validate summary content immediately after generation
    if (!summaryResult.content || summaryResult.content.trim().length < 50) {
        logger.error('AI generated invalid or too short summary', {
            contentLength: summaryResult.content?.length || 0,
            trimmedLength: summaryResult.content?.trim().length || 0
        });
        throw new Error('AI service generated insufficient summary content');
    }

    // Step 2: Generate key points from summary
    const keyPointsMessages = [
        { role: 'system', content: KEY_POINTS_PROMPT },
        { role: 'user', content: summaryResult.content }
    ];

    const keyPointsResult = await generateCompletion({
        model,
        messages: keyPointsMessages,
        maxTokens: 300,
        temperature: 0.6
    });

    // Validate key points content immediately after generation
    if (!keyPointsResult.content || keyPointsResult.content.trim().length < 10) {
        logger.error('AI generated invalid or too short key points', {
            contentLength: keyPointsResult.content?.length || 0,
            trimmedLength: keyPointsResult.content?.trim().length || 0
        });
        throw new Error('AI service generated insufficient key points content');
    }

    // Parse key points (this will throw if parsing fails)
    const keyPoints = parseKeyPoints(keyPointsResult.content);

    const totalTokens = summaryResult.tokensUsed + keyPointsResult.tokensUsed;

    return {
        summary: summaryResult.content,
        keyPoints,
        aiModel: summaryResult.model,
        tokensConsumed: totalTokens,
        transcriptSegments: transcriptArray.length,
        transcriptLength: truncatedTranscript.length
    };
};

/**
 * Generates a comprehensive summary of a YouTube video from its transcript
 *
 * @param {Object} params - Summary generation parameters
 * @param {Array} params.transcriptArray - Transcript array from youtube-transcript-plus
 * @param {string} [params.videoTitle] - Optional video title for context
 * @returns {Promise<Object>} Summary result or error object
 */
export const generateVideoSummary = async ({
    transcriptArray,
    videoTitle = ''
}) => {
    // Generate unique key based on transcript characteristics
    const transcriptLength = Array.isArray(transcriptArray)
        ? transcriptArray.length
        : 0;
    const uniqueKey = `summarize:${videoTitle}:${transcriptLength}`;

    return await withIdempotency(
        uniqueKey,
        7 * 24 * 3600, // 7 days in seconds (604800)
        async () => {
            try {
                // Validation: Check transcript array
                if (!validateTranscript(transcriptArray)) {
                    logger.error('Invalid transcript array provided to generateVideoSummary', {
                        isArray: Array.isArray(transcriptArray),
                        length: transcriptArray?.length
                    });
                    throw new Error('Invalid transcript format. Expected array of transcript objects.');
                }

                // Process transcript array into text
                const transcriptText = processTranscript(transcriptArray);

                if (!transcriptText || transcriptText.length < 50) {
                    logger.warn('Processed transcript is too short', {
                        length: transcriptText.length
                    });
                    throw new Error('Transcript is too short to generate a meaningful summary');
                }

                // Check transcript length (OpenRouter has limits)
                const MAX_TRANSCRIPT_LENGTH = 50000; // ~50k chars
                const truncatedTranscript = transcriptText.length > MAX_TRANSCRIPT_LENGTH
                    ? transcriptText.substring(0, MAX_TRANSCRIPT_LENGTH) + '...'
                    : transcriptText;

                if (transcriptText.length > MAX_TRANSCRIPT_LENGTH) {
                    logger.warn('Transcript truncated due to length', {
                        original: transcriptText.length,
                        truncated: MAX_TRANSCRIPT_LENGTH
                    });
                }

                logger.info('Starting video summary generation with fallback chain', {
                    transcriptLength: truncatedTranscript.length,
                    segments: transcriptArray.length,
                    totalModels: SUMMARIZATION_MODELS.length
                });

                // TRY EACH MODEL IN SEQUENCE
                let lastError;
                for (let i = 0; i < SUMMARIZATION_MODELS.length; i++) {
                    const model = SUMMARIZATION_MODELS[i];

                    try {
                        logger.info('Attempting summary generation with model', {
                            model,
                            attemptNumber: i + 1,
                            totalModels: SUMMARIZATION_MODELS.length,
                            transcriptLength: truncatedTranscript.length
                        });

                        // Try this model
                        const result = await attemptSummaryWithModel(
                            model,
                            transcriptText,
                            truncatedTranscript,
                            videoTitle,
                            transcriptArray
                        );

                        // SUCCESS - log and return
                        logger.info('Video summary generated successfully', {
                            model: result.aiModel,
                            attemptNumber: i + 1,
                            fallbackUsed: i > 0,
                            summaryLength: result.summary.length,
                            keyPointsCount: result.keyPoints.length,
                            tokensUsed: result.tokensConsumed
                        });

                        return result;

                    } catch (error) {
                        lastError = error;
                        const isLastModel = i === SUMMARIZATION_MODELS.length - 1;

                        logger.warn('Model failed to generate summary', {
                            model,
                            attemptNumber: i + 1,
                            error: error.message,
                            remainingModels: SUMMARIZATION_MODELS.length - i - 1,
                            willRetry: !isLastModel
                        });

                        // If this was the last model, throw the error
                        if (isLastModel) {
                            logger.error('All models failed to generate summary', {
                                videoTitle,
                                triedModels: SUMMARIZATION_MODELS,
                                lastError: error.message,
                                totalAttempts: SUMMARIZATION_MODELS.length
                            });
                            throw error;
                        }

                        // Otherwise, continue to next model
                    }
                }

                // Should never reach here, but TypeScript safety
                throw lastError || new Error('Unknown error in model fallback');

            } catch (error) {
                // Log the error with full context
                logger.error('Error generating video summary', {
                    error: error.message,
                    stack: error.stack,
                    isOperational: error.isOperational
                });

                // Throw error to trigger BullMQ retry mechanism
                // This ensures failed summaries are retried up to 3 times
                throw error;
            }
        }
    );
};

/**
 * Parses key points from AI-generated text
 * 
 * @param {string} text - Text containing bullet points
 * @returns {Array<string>} Array of key points
 */
const parseKeyPoints = (text) => {
    try {
        const points = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => {
                // Match lines starting with -, •, *, or numbers like 1., 2.
                return /^[-•*]/.test(line) || /^\d+\./.test(line);
            })
            .map(line => {
                // Remove bullet markers and numbers
                return line
                    .replace(/^[-•*]\s*/, '')
                    .replace(/^\d+\.\s*/, '')
                    .trim();
            })
            .filter(line => line.length > 0 && line.length < 200); // Sanity check

        logger.debug('Parsed key points', { count: points.length });

        // Ensure we have at least 1 and at most 10 points
        if (points.length === 0) {
            logger.error('Failed to parse any key points from AI response', {
                responseLength: text?.length,
                responsePreview: text?.substring(0, 200)
            });
            // Throw error instead of returning misleading fallback
            // This will trigger BullMQ retry mechanism
            throw new Error('Failed to parse key points from AI response. Response may be in unexpected format.');
        }

        return points.slice(0, 10); // Max 10 points

    } catch (error) {
        logger.error('Error parsing key points', {
            error: error.message,
            stack: error.stack
        });
        // Re-throw to propagate the error up
        throw error;
    }
};

/**
 * Generates summary from raw transcript text (alternative method)
 *
 * @param {Object} params - Parameters
 * @param {string} params.transcriptText - Raw transcript text
 * @param {string} [params.videoTitle] - Optional video title
 * @returns {Promise<Object>} Summary result or error object
 */
export const generateSummaryFromText = async ({
    transcriptText,
    videoTitle = ''
}) => {
    try {
        // Validation
        if (!transcriptText || typeof transcriptText !== 'string' || transcriptText.trim().length < 50) {
            logger.error('Invalid transcript text provided');
            return {
                error: 'bad_request',
                message: 'Valid transcript text is required (minimum 50 characters)'
            };
        }

        // Use the main function by creating a fake transcript array
        const fakeTranscriptArray = [{ text: transcriptText }];

        return await generateVideoSummary({
            transcriptArray: fakeTranscriptArray,
            videoTitle
        });

    } catch (error) {
        logger.error('Error in generateSummaryFromText', { error: error.message });
        return {
            error: 'server_error',
            message: error.message || 'Failed to generate summary from text'
        };
    }
};