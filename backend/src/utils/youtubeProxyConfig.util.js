/**
 * @fileoverview YouTube transcript fetching configuration with proxy and user agent rotation.
 * Provides configurable fetch functions for bypassing rate limits and IP blocks.
 * @module utils/youtubeProxyConfig
 */

import UserAgent from 'user-agents';
import { HttpsProxyAgent } from 'https-proxy-agent';
import logger from './logger.js';

/**
 * @typedef {Object} YoutubeTranscriptConfig
 * @property {string} userAgent - Rotated browser user agent string
 * @property {Function} [videoFetch] - Custom fetch for video page requests (if proxy enabled)
 * @property {Function} [playerFetch] - Custom fetch for YouTube Innertube API (if proxy enabled)
 * @property {Function} [transcriptFetch] - Custom fetch for transcript data (if proxy enabled)
 */

/**
 * Creates a configuration object for youtube-transcript-plus library.
 * Includes a fresh random user agent for each call and optional proxy support.
 *
 * When YOUTUBE_PROXY_URL environment variable is set, all requests are routed
 * through the proxy with custom fetch functions for video, player, and transcript requests.
 *
 * @returns {YoutubeTranscriptConfig} Configuration object for fetchTranscript
 * @example
 * import { createYoutubeTranscriptConfig } from './utils/youtubeProxyConfig.util.js';
 * import { fetchTranscript } from 'youtube-transcript-plus';
 *
 * const config = createYoutubeTranscriptConfig();
 * const transcript = await fetchTranscript(videoId, config);
 */
export const createYoutubeTranscriptConfig = () => {
    // Always create a fresh random user agent for each transcript request
    const userAgent = new UserAgent();
    const userAgentString = userAgent.toString();

    // Get proxy URL from environment variables (optional)
    const proxyUrl = process.env.YOUTUBE_PROXY_URL;

    // Base configuration with rotative user agent (mandatory)
    const config = {
        userAgent: userAgentString
    };

    // Add proxy support if configured
    if (proxyUrl && proxyUrl.trim() !== '') {
        logger.info('YouTube proxy configured', {
            proxy: proxyUrl.replace(/\/\/.*@/, '//***:***@') // Hide credentials in logs
        });

        // Create proxy agent
        const proxyAgent = new HttpsProxyAgent(proxyUrl);

        /**
         * Custom fetch function for video page requests (GET)
         * This is called when fetching the YouTube video page
         */
        config.videoFetch = async ({ url, lang, userAgent }) => {
            logger.debug('Fetching video page via proxy', { url });

            return fetch(url, {
                headers: {
                    ...(lang && { 'Accept-Language': lang }),
                    'User-Agent': userAgent,
                },
                // @ts-ignore - TypeScript doesn't recognize agent in fetch, but Node.js does
                agent: url.startsWith('https') ? proxyAgent : undefined
            });
        };

        /**
         * Custom fetch function for YouTube Innertube API requests (POST)
         * This is called when fetching caption tracks from YouTube's internal API
         */
        config.playerFetch = async ({ url, method, body, headers, lang, userAgent }) => {
            logger.debug('Fetching player data via proxy', { url, method });

            return fetch(url, {
                method,
                headers: {
                    ...(lang && { 'Accept-Language': lang }),
                    'User-Agent': userAgent,
                    ...headers,
                },
                body,
                // @ts-ignore - TypeScript doesn't recognize agent in fetch, but Node.js does
                agent: url.startsWith('https') ? proxyAgent : undefined
            });
        };

        /**
         * Custom fetch function for transcript data requests (GET)
         * This is called when downloading the actual transcript XML/data
         */
        config.transcriptFetch = async ({ url, lang, userAgent }) => {
            logger.debug('Fetching transcript data via proxy', { url });

            return fetch(url, {
                headers: {
                    ...(lang && { 'Accept-Language': lang }),
                    'User-Agent': userAgent,
                },
                // @ts-ignore - TypeScript doesn't recognize agent in fetch, but Node.js does
                agent: url.startsWith('https') ? proxyAgent : undefined
            });
        };
    } else {
        logger.debug('No YouTube proxy configured, using direct connection with rotative user agent');
    }

    logger.debug('YouTube transcript config created', {
        userAgent: userAgentString.substring(0, 50) + '...', // Log partial user agent
        proxyEnabled: !!proxyUrl
    });

    return config;
};

/**
 * Validates that a proxy URL has a valid format.
 * Checks for http/https protocol and valid hostname.
 *
 * @param {string} proxyUrl - The proxy URL to validate
 * @returns {boolean} True if valid URL with http/https protocol, false otherwise
 * @example
 * validateProxyUrl('http://proxy.example.com:8080'); // true
 * validateProxyUrl('http://user:pass@proxy.com:8080'); // true
 * validateProxyUrl('invalid-url'); // false
 * validateProxyUrl('ftp://proxy.com'); // false (not http/https)
 */
export const validateProxyUrl = (proxyUrl) => {
    if (!proxyUrl || typeof proxyUrl !== 'string') {
        return false;
    }

    try {
        const url = new URL(proxyUrl);
        // Must be http or https protocol
        if (!['http:', 'https:'].includes(url.protocol)) {
            return false;
        }
        // Must have a hostname
        if (!url.hostname) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
};
