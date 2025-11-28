import logger from '../../utils/logger.js';

/**
 * Processes transcript array into clean text format
 * 
 * @param {Array} transcriptArray - Array of transcript objects from youtube-transcript-plus
 * @returns {string} Formatted transcript text
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
 * Validates transcript array structure
 * 
 * @param {Array} transcriptArray - Transcript array to validate
 * @returns {boolean} True if valid
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