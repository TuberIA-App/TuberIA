import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';
import { BadRequestError, NotFoundError, InternalServerError } from '../../utils/errorClasses.util.js';
import logger from '../../utils/logger.js';

const userAgent = new UserAgent();

const axiosInstance = axios.create({
    headers: {
        'User-Agent': userAgent.toString()
    },
    timeout: 15000, // 15 seconds timeout
    validateStatus: () => {
        return true;
    }
});

/**
 * Check YouTube Url
 *
 * @param {string} url
 * @returns {boolean}
 */
const checkUrl = (url) => url.indexOf('youtube.com') !== -1 || url.indexOf('youtu.be') !== -1;

/**
 * Get YouTube Channel ID By Url
 *
 * @param {string} url Channel Url
 * @returns {Promise<string>} Channel ID if successful
 * @throws {BadRequestError} If URL is invalid or not a YouTube URL
 * @throws {NotFoundError} If channel is not found
 * @throws {InternalServerError} If an unexpected error occurs
 */
const channelId = async (url) => {
    // Validate input
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
        logger.error('Invalid URL provided to channelId', { url });
        throw new BadRequestError('Invalid URL provided');
    }

    if (!checkUrl(url)) {
        logger.warn('Non-YouTube URL provided to channelId', { url });
        throw new BadRequestError(`"${url}" is not a YouTube URL`);
    }

    try {
        logger.debug(`Fetching channel ID from URL: ${url}`);
        const ytChannelPageResponse = await axiosInstance.get(url);

        // Check for specific HTTP status codes
        if (ytChannelPageResponse.status === 404) {
            logger.warn(`Channel not found: ${url}`);
            throw new NotFoundError('Channel not found');
        }

        if (ytChannelPageResponse.status === 429) {
            logger.error(`Rate limit exceeded when fetching: ${url}`);
            throw new InternalServerError('YouTube rate limit exceeded. Please try again later.');
        }

        if (ytChannelPageResponse.status >= 500) {
            logger.error(`YouTube server error (${ytChannelPageResponse.status}): ${url}`);
            throw new InternalServerError('YouTube service is currently unavailable. Please try again later.');
        }

        if (ytChannelPageResponse.status >= 400) {
            logger.error(`HTTP error ${ytChannelPageResponse.status} when fetching: ${url}`);
            throw new InternalServerError(`Unable to fetch channel page (HTTP ${ytChannelPageResponse.status})`);
        }

        const $ = cheerio.load(ytChannelPageResponse.data);
        const id = $('meta[itemprop="identifier"]').attr('content');

        if (id) {
            logger.debug(`Successfully extracted channel ID: ${id} from ${url}`);
            return id;
        }

        logger.warn(`Unable to extract channel ID from page: ${url}`);
        throw new NotFoundError('Unable to extract channel ID from the page. The URL may not be a valid channel page.');

    } catch (error) {
        // If it's already one of our custom errors, just rethrow it
        if (error.isOperational) {
            throw error;
        }

        // Log the unexpected error
        logger.error('Error fetching channel ID', {
            url,
            error: error.message,
            code: error.code,
            stack: error.stack
        });

        // Handle axios-specific errors
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new InternalServerError('Request timed out. Please try again later.');
        }

        if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
            throw new InternalServerError('Network error. Please check your connection and try again.');
        }

        // Generic error for anything else
        throw new InternalServerError('An error occurred while fetching the channel ID');
    }
};

/**
 * Get YouTube Video ID By Url
 *
 * @param {string} url Video Url
 * @returns {Promise<string>} Video ID if successful
 * @throws {BadRequestError} If URL is invalid or not a YouTube URL
 * @throws {NotFoundError} If video is not found
 * @throws {InternalServerError} If an unexpected error occurs
 */
const videoId = async (url) => {
    // Validate input
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
        logger.error('Invalid URL provided to videoId', { url });
        throw new BadRequestError('Invalid URL provided');
    }

    if (!checkUrl(url)) {
        logger.warn('Non-YouTube URL provided to videoId', { url });
        throw new BadRequestError(`"${url}" is not a YouTube URL`);
    }

    try {
        logger.debug(`Fetching video ID from URL: ${url}`);
        const ytVideoPageResponse = await axiosInstance.get(url);

        // Check for specific HTTP status codes
        if (ytVideoPageResponse.status === 404) {
            logger.warn(`Video not found: ${url}`);
            throw new NotFoundError('Video not found');
        }

        if (ytVideoPageResponse.status === 429) {
            logger.error(`Rate limit exceeded when fetching: ${url}`);
            throw new InternalServerError('YouTube rate limit exceeded. Please try again later.');
        }

        if (ytVideoPageResponse.status >= 500) {
            logger.error(`YouTube server error (${ytVideoPageResponse.status}): ${url}`);
            throw new InternalServerError('YouTube service is currently unavailable. Please try again later.');
        }

        if (ytVideoPageResponse.status >= 400) {
            logger.error(`HTTP error ${ytVideoPageResponse.status} when fetching: ${url}`);
            throw new InternalServerError(`Unable to fetch video page (HTTP ${ytVideoPageResponse.status})`);
        }

        const $ = cheerio.load(ytVideoPageResponse.data);
        const id = $('meta[itemprop="identifier"]').attr('content');

        if (id) {
            logger.debug(`Successfully extracted video ID: ${id} from ${url}`);
            return id;
        }

        logger.warn(`Unable to extract video ID from page: ${url}`);
        throw new NotFoundError('Unable to extract video ID from the page. The URL may not be a valid video page.');

    } catch (error) {
        // If it's already one of our custom errors, just rethrow it
        if (error.isOperational) {
            throw error;
        }

        // Log the unexpected error
        logger.error('Error fetching video ID', {
            url,
            error: error.message,
            code: error.code,
            stack: error.stack
        });

        // Handle axios-specific errors
        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            throw new InternalServerError('Request timed out. Please try again later.');
        }

        if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
            throw new InternalServerError('Network error. Please check your connection and try again.');
        }

        // Generic error for anything else
        throw new InternalServerError('An error occurred while fetching the video ID');
    }
};

export { channelId, videoId };