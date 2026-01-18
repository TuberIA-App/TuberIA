/**
 * @fileoverview YouTube video transcript fetching service with retry mechanism.
 * Fetches transcripts using youtube-transcript-plus with user agent rotation
 * and optional proxy support.
 * @module services/youtube/videoTranscription
 */

import { fetchTranscript } from 'youtube-transcript-plus';
import { BadRequestError, NotFoundError, InternalServerError } from '../../utils/errorClasses.util.js';
import logger from '../../utils/logger.js';
import { createYoutubeTranscriptConfig } from '../../utils/youtubeProxyConfig.util.js';

/**
 * Maximum number of retry attempts for transcript fetching.
 * Configurable via YOUTUBE_TRANSCRIPT_MAX_RETRIES env variable.
 * @private
 * @constant {number}
 */
const MAX_RETRIES = parseInt(process.env.YOUTUBE_TRANSCRIPT_MAX_RETRIES || '3', 10);

/**
 * Base delay in milliseconds between retry attempts (exponential backoff applied).
 * Configurable via YOUTUBE_TRANSCRIPT_RETRY_DELAY env variable.
 * @private
 * @constant {number}
 */
const RETRY_DELAY = parseInt(process.env.YOUTUBE_TRANSCRIPT_RETRY_DELAY || '1000', 10);

/**
 * Pauses execution for specified duration.
 * @private
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Determines if an error is retryable (network/timeout issues).
 * Retryable errors include network failures, timeouts, and HTTP 5xx errors.
 * @private
 * @param {Error} error - The error to check
 * @returns {boolean} True if the error should trigger a retry
 */
const isRetryableError = (error) => {
    const errorMessage = error.message || '';

    // Retry on network issues, timeouts, rate limits, or server errors
    return (
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('429') || // Rate limit
        errorMessage.includes('500') || // Server error
        errorMessage.includes('502') || // Bad gateway
        errorMessage.includes('503') || // Service unavailable
        errorMessage.includes('504')    // Gateway timeout
    );
};

/**
 * Fetches the transcript for a YouTube video with retry mechanism
 * Each retry uses a NEW rotated user agent
 *
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<Array>} Returns the transcript array if successful
 * @throws {BadRequestError} If videoId is invalid
 * @throws {NotFoundError} If transcript is not available for the video
 * @throws {InternalServerError} If an unexpected error occurs
 */
const getTranscript = async (videoId) => {
    // Validate input
    if (!videoId || typeof videoId !== 'string' || videoId.trim().length === 0) {
        logger.error('Invalid video ID provided to getTranscript', { videoId });
        throw new BadRequestError('Invalid video ID provided');
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let lastError;

    // Retry loop
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            logger.debug(`Fetching transcript for video: ${videoId} (attempt ${attempt}/${MAX_RETRIES})`);

            // Create NEW config with a FRESH rotated user agent for each attempt
            const config = createYoutubeTranscriptConfig();

            // Fetch transcript with custom configuration
            const transcript = await fetchTranscript(videoUrl, config);

            // Validate that we actually got a transcript
            if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
                logger.warn(`No transcript data returned for video: ${videoId}`);
                throw new NotFoundError('No transcript available for this video');
            }

            logger.info(`Successfully fetched transcript for video: ${videoId} on attempt ${attempt}`, {
                segmentCount: transcript.length,
                attempts: attempt
            });

            return transcript;

        } catch (error) {
            lastError = error;

            // If it's a non-retryable operational error, throw immediately
            if (error.isOperational) {
                logger.warn(`Non-retryable operational error for video ${videoId}:`, {
                    error: error.message,
                    attempt
                });
                throw error;
            }

            // Handle specific non-retryable error cases from youtube-transcript-plus
            const errorMessage = error.message || '';

            // These errors are permanent, don't retry
            if (errorMessage.includes('not available') ||
                errorMessage.includes('disabled') ||
                errorMessage.includes('Transcript is disabled')) {
                logger.warn(`Transcript permanently unavailable for video ${videoId}`);
                throw new NotFoundError('Transcript is not available for this video');
            }

            if (errorMessage.includes('Invalid video') ||
                errorMessage.includes('Video unavailable')) {
                logger.warn(`Video not found: ${videoId}`);
                throw new NotFoundError('Video not found or unavailable');
            }

            // Check if error is retryable (network issues, timeouts, rate limits)
            if (isRetryableError(error)) {
                logger.warn(`Retryable error on attempt ${attempt}/${MAX_RETRIES} for video ${videoId}:`, {
                    error: error.message,
                    willRetry: attempt < MAX_RETRIES
                });

                // If we have more attempts, wait and retry with exponential backoff
                if (attempt < MAX_RETRIES) {
                    const backoffDelay = RETRY_DELAY * Math.pow(2, attempt - 1);
                    logger.debug(`Waiting ${backoffDelay}ms before retry ${attempt + 1}...`);
                    await sleep(backoffDelay);
                    continue; // Try again with new user agent
                }
            } else {
                // Non-retryable unexpected error
                logger.error('Non-retryable error fetching transcript', {
                    videoId,
                    error: error.message,
                    stack: error.stack,
                    attempt
                });
                throw new InternalServerError('An error occurred while fetching the transcript');
            }
        }
    }

    // All retries exhausted
    logger.error(`All ${MAX_RETRIES} attempts failed for video ${videoId}`, {
        lastError: lastError?.message,
        stack: lastError?.stack
    });

    throw new InternalServerError(
        `Unable to fetch transcript after ${MAX_RETRIES} attempts. Please try again later.`
    );
};

export { getTranscript };