/**
 * @fileoverview Transcript processing utilities for AI summarization.
 * Transforms raw transcript arrays into clean text suitable for AI consumption.
 * @module services/ai/transcriptionProcessor
 */

import logger from '../../utils/logger.js';

/**
 * Processes a transcript array into clean, concatenated text.
 * Extracts text from each segment, normalizes whitespace, and joins.
 * @param {Array<{text: string, start?: number, duration?: number}>} transcriptArray - Transcript segments from youtube-transcript-plus
 * @returns {string} Cleaned and concatenated transcript text, or empty string on error
 * @example
 * const text = processTranscript([
 *   { text: 'Hello ', start: 0 },
 *   { text: 'world!', start: 1 }
 * ]);
 * // Returns: 'Hello world!'
 */
export const processTranscript = (transcriptArray) => {
    if (!Array.isArray(transcriptArray) || transcriptArray.length === 0) {
        logger.warn('Empty or invalid transcript array provided');
        return '';
    }

    try {
        // Extract text from each transcript segment and join
        const fullText = transcriptArray
            .map(segment => segment.text)
            .filter(text => text && text.trim().length > 0)
            .join(' ')
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        logger.debug('Transcript processed successfully', {
            segments: transcriptArray.length,
            textLength: fullText.length
        });

        return fullText;

    } catch (error) {
        logger.error('Error processing transcript', {
            error: error.message,
            segmentCount: transcriptArray.length
        });
        return '';
    }
};

/**
 * Validates that a transcript array has the expected structure.
 * Checks that input is a non-empty array with objects containing text properties.
 * @param {*} transcriptArray - Value to validate
 * @returns {boolean} True if array has valid transcript structure
 * @example
 * validateTranscript([{ text: 'Hello' }]); // true
 * validateTranscript([]); // false
 * validateTranscript('not an array'); // false
 */
export const validateTranscript = (transcriptArray) => {
    if (!Array.isArray(transcriptArray)) {
        return false;
    }

    if (transcriptArray.length === 0) {
        return false;
    }

    // Check first few items have expected structure
    const sampleSize = Math.min(5, transcriptArray.length);
    for (let i = 0; i < sampleSize; i++) {
        const segment = transcriptArray[i];
        if (!segment || typeof segment.text !== 'string') {
            return false;
        }
    }

    return true;
};