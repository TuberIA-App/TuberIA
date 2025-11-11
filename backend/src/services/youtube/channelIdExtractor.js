import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';

const userAgent = new UserAgent();

const axiosInstance = axios.create({
    headers: {
        'User-Agent': userAgent.toString()
    },
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
 * @returns {Promise<string|Object>} Channel ID if successful, or error object { error: 'fetch failed', message: string }
 */
const channelId = async (url) => {
    try {
        if (!checkUrl(url)) {
            return {
                error: 'fetch failed',
                message: `"${url}" is not a YouTube url.`
            };
        }

        const ytChannelPageResponse = await axiosInstance.get(url);

        // Check for HTTP errors
        if (ytChannelPageResponse.status >= 400) {
            return {
                error: 'fetch failed',
                message: `HTTP ${ytChannelPageResponse.status}: Unable to fetch channel page`
            };
        }

        const $ = cheerio.load(ytChannelPageResponse.data);
        const id = $('meta[itemprop="identifier"]').attr('content');

        if (id) {
            return id;
        }

        return {
            error: 'fetch failed',
            message: `Unable to extract channel ID from "${url}"`
        };

    } catch (error) {
        return {
            error: 'fetch failed',
            message: error.message || 'Unknown error occurred while fetching channel ID'
        };
    }
};

/**
 * Get YouTube Video ID By Url
 *
 * @param {string} url Video Url
 * @returns {Promise<string|Object>} Video ID if successful, or error object { error: 'fetch failed', message: string }
 */
const videoId = async (url) => {
    try {
        if (!checkUrl(url)) {
            return {
                error: 'fetch failed',
                message: `"${url}" is not a YouTube url.`
            };
        }

        const ytVideoPageResponse = await axiosInstance.get(url);

        // Check for HTTP errors
        if (ytVideoPageResponse.status >= 400) {
            return {
                error: 'fetch failed',
                message: `HTTP ${ytVideoPageResponse.status}: Unable to fetch video page`
            };
        }

        const $ = cheerio.load(ytVideoPageResponse.data);
        const id = $('meta[itemprop="identifier"]').attr('content');

        if (id) {
            return id;
        }

        return {
            error: 'fetch failed',
            message: `Unable to extract video ID from "${url}"`
        };

    } catch (error) {
        return {
            error: 'fetch failed',
            message: error.message || 'Unknown error occurred while fetching video ID'
        };
    }
};

export { channelId, videoId };