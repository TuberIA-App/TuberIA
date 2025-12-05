import { generateCompletion } from './openrouter.service.js';
import { processTranscript, validateTranscript } from './transcriptionProcessor.js';
import { SUMMARY_PROMPT, KEY_POINTS_PROMPT } from './prompts.js';
import { withIdempotency } from '../../utils/idempotency.js';
import logger from '../../utils/logger.js';

/**
 * Generates a comprehensive summary of a YouTube video from its transcript
 *
 * @param {Object} params - Summary generation parameters
 * @param {Array} params.transcriptArray - Transcript array from youtube-transcript-plus
 * @param {string} [params.videoTitle] - Optional video title for context
 * @param {string} [params.model='z-ai/glm-4.5'] - AI model to use
 * @returns {Promise<Object>} Summary result or error object
 */
export const generateVideoSummary = async ({
    transcriptArray,
    videoTitle = '',
    model = 'z-ai/glm-4.5'
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
            return {
                error: 'bad_request',
                message: 'Invalid transcript format. Expected array of transcript objects.'
            };
        }

        // Process transcript array into text
        const transcriptText = processTranscript(transcriptArray);

        if (!transcriptText || transcriptText.length < 50) {
            logger.warn('Processed transcript is too short', {
                length: transcriptText.length
            });
            return {
                error: 'bad_request',
                message: 'Transcript is too short to generate a meaningful summary'
            };
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

        logger.info('Starting video summary generation', {
            transcriptLength: truncatedTranscript.length,
            segments: transcriptArray.length,
            model
        });

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
            maxTokens: 600,
            temperature: 0.7
        });

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

        // Parse key points
        const keyPoints = parseKeyPoints(keyPointsResult.content);

        const totalTokens = summaryResult.tokensUsed + keyPointsResult.tokensUsed;

        logger.info('Video summary generated successfully', {
            summaryLength: summaryResult.content.length,
            keyPointsCount: keyPoints.length,
            tokensUsed: totalTokens,
            model: summaryResult.model
        });

                // Return success result
                return {
                    summary: summaryResult.content,
                    keyPoints,
                    aiModel: summaryResult.model,
                    tokensConsumed: totalTokens,
                    transcriptSegments: transcriptArray.length,
                    transcriptLength: truncatedTranscript.length
                };

            } catch (error) {
                // Log the error
                logger.error('Error generating video summary', {
                    error: error.message,
                    stack: error.stack,
                    isOperational: error.isOperational
                });

                // Return error object (service pattern in this project)
                return {
                    error: 'server_error',
                    message: error.message || 'Failed to generate video summary'
                };
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
            logger.warn('No key points parsed, using fallback');
            return ['Resumen generado exitosamente'];
        }

        return points.slice(0, 10); // Max 10 points

    } catch (error) {
        logger.error('Error parsing key points', { error: error.message });
        return ['Error parsing key points'];
    }
};

/**
 * Generates summary from raw transcript text (alternative method)
 * 
 * @param {Object} params - Parameters
 * @param {string} params.transcriptText - Raw transcript text
 * @param {string} [params.videoTitle] - Optional video title
 * @param {string} [params.model] - AI model to use
 * @returns {Promise<Object>} Summary result or error object
 */
export const generateSummaryFromText = async ({
    transcriptText,
    videoTitle = '',
    model = 'z-ai/glm-4.5'
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
            videoTitle,
            model
        });

    } catch (error) {
        logger.error('Error in generateSummaryFromText', { error: error.message });
        return {
            error: 'server_error',
            message: 'Failed to generate summary from text'
        };
    }
};