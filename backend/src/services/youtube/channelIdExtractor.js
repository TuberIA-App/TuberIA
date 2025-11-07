const axios = require('axios');
const cheerio = require('cheerio');
const UserAgent = require('user-agents')

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
 * @returns {Promise<string>} Channel ID
 */
const channelId = async (url) => {
    if (checkUrl(url)) {
        const ytChannelPageResponse = await axiosInstance.get(url);
        const $ = cheerio.load(ytChannelPageResponse.data);

        const id = $('meta[itemprop="identifier"]').attr('content');
        if (id) return id;
    } else {
        throw Error(`"${url}" is not a YouTube url.`);
    }

    throw Error(`Unable to get "${url}" channel id.`);
};

/**
 * Get YouTube Video ID By Url
 *
 * @param {string} url Video Url
 * @returns {Promise<string>} Video ID
 */
const videoId = async (url) => {
    if (checkUrl(url)) {
        const ytChannelPageResponse = await axiosInstance.get(url);
        const $ = cheerio.load(ytChannelPageResponse.data);

        const id = $('meta[itemprop="identifier"]').attr('content');
        if (id) return id;
    } else {
        throw Error(`"${url}" is not a YouTube url.`);
    }

    throw Error(`Unable to get "${url}" video id.`);
};

module.exports = {
    channelId,
    videoId
};