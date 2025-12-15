/**
 * @fileoverview OpenRouter API integration for AI model access.
 * Provides a unified interface to various AI models through OpenRouter.
 * @module services/ai/openrouter
 */

import axios from 'axios';
import { BadRequestError, InternalServerError } from '../../utils/errorClasses.util.js';
import logger from '../../utils/logger.js';

/**
 * Pre-configured Axios client for OpenRouter API.
 * @private
 * @type {import('axios').AxiosInstance}
 */
const openRouterClient = axios.create({
    baseURL: 'https://openrouter.ai/api/v1',
    headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
        'X-Title': 'TuberIA - YouTube AI Summaries'
    },
    timeout: 30000 // 30 seconds per model (4 models × 30s = 120s max, within 180s BullMQ lock)
});

/**
 * Generates AI completion using OpenRouter API
 * 
 * @param {Object} params - Generation parameters
 * @param {string} params.model - Model identifier (e.g., 'z-ai/glm-4.5')
 * @param {Array} params.messages - Array of message objects with role and content
 * @param {number} [params.maxTokens=800] - Maximum tokens to generate
 * @param {number} [params.temperature=0.7] - Temperature for generation (0-1)
 * @returns {Promise<Object>} Generation result with content, tokens used, and model
 * @throws {BadRequestError} If required parameters are missing
 * @throws {InternalServerError} If API call fails
 */
export const generateCompletion = async ({
    model,
    messages,
    maxTokens = 800,
    temperature = 0.7
}) => {
    // Validation
    if (!model || typeof model !== 'string') {
        logger.error('Invalid model provided to generateCompletion', { model });
        throw new BadRequestError('Model is required and must be a string');
    }

    if (!Array.isArray(messages) || messages.length === 0) {
        logger.error('Invalid messages provided to generateCompletion', { messages });
        throw new BadRequestError('Messages array is required and cannot be empty');
    }

    // Validate API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
        logger.error('OPENROUTER_API_KEY not configured');
        throw new InternalServerError('AI service is not properly configured');
    }

    try {
        logger.debug('Calling OpenRouter API', {
            model,
            messageCount: messages.length,
            maxTokens
        });

        const response = await openRouterClient.post('/chat/completions', {
            model,
            messages,
            max_tokens: maxTokens,
            temperature
        });

        // Check response status
        if (response.status !== 200) {
            logger.error('OpenRouter API returned non-200 status', {
                status: response.status,
                data: response.data
            });
            throw new InternalServerError(`OpenRouter API error: ${response.status}`);
        }

        // Validate response structure
        if (!response.data.choices || response.data.choices.length === 0) {
            logger.error('OpenRouter API returned invalid response structure', {
                data: response.data
            });
            throw new InternalServerError('Invalid response from AI service');
        }

        const content = response.data.choices[0].message?.content;

        // First check: content exists
        if (!content) {
            logger.error('OpenRouter API returned null/undefined content');
            throw new InternalServerError('AI service returned empty response');
        }

        // Trim whitespace and validate
        const trimmedContent = content.trim();

        // Second check: content is not empty after trimming
        if (trimmedContent.length === 0) {
            logger.error('OpenRouter API returned whitespace-only content', {
                originalLength: content.length
            });
            throw new InternalServerError('AI service returned empty response');
        }

        // Third check: minimum content length (10 chars ensures it's not just noise)
        if (trimmedContent.length < 10) {
            logger.error('OpenRouter API returned suspiciously short content', {
                contentLength: trimmedContent.length,
                content: trimmedContent
            });
            throw new InternalServerError('AI service returned insufficient content');
        }

        const tokensUsed = response.data.usage?.total_tokens || 0;

        logger.info('OpenRouter completion successful', {
            model: response.data.model || model,
            tokensUsed,
            contentLength: trimmedContent.length
        });

        return {
            content: trimmedContent,
            tokensUsed,
            model: response.data.model || model
        };

    } catch (error) {
        // Re-throw operational errors
        if (error.isOperational) {
            throw error;
        }

        // Handle specific error cases
        if (error.code === 'ECONNABORTED') {
            logger.error('OpenRouter API timeout', { model });
            throw new InternalServerError('AI service timeout. Please try again.');
        }

        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            logger.error('OpenRouter API error response', {
                status,
                error: errorData,
                model
            });

            // Handle specific HTTP errors
            if (status === 401) {
                throw new InternalServerError('AI service authentication failed');
            }

            if (status === 429) {
                throw new InternalServerError('AI service rate limit exceeded. Please try again later.');
            }

            if (status === 402) {
                throw new InternalServerError('AI service credits exhausted');
            }

            if (status >= 500) {
                throw new InternalServerError('AI service is temporarily unavailable');
            }
        }

        // Generic error logging
        logger.error('Unexpected error calling OpenRouter API', {
            error: error.message,
            stack: error.stack,
            model
        });

        throw new InternalServerError('Failed to generate AI completion');
    }
};

/**
 * Validates OpenRouter API connection and credentials.
 * Makes a test request to the /models endpoint.
 * @returns {Promise<boolean>} True if connection is valid and API key is correct
 * @example
 * const isValid = await validateConnection();
 * if (!isValid) {
 *   console.error('OpenRouter API is not configured correctly');
 * }
 */
export const validateConnection = async () => {
    try {
        // Make a minimal test request
        const response = await openRouterClient.get('/models');
        return response.status === 200;
    } catch (error) {
        logger.error('OpenRouter connection validation failed', {
            error: error.message
        });
        return false;
    }
};