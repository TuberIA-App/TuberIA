const axios = require('axios');
const UserAgent = require('user-agents');
const { XMLParser } = require('fast-xml-parser');

const userAgent = new UserAgent();

const axiosInstance = axios.create({
    headers: { 'User-Agent': userAgent.toString() },
    validateStatus: () => true
});

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
});

/**
 * 
 * @param {string} channelId 
 * @return {Promise<Object>} JSON feed
 */
const channelFeedExtractor = async (channelId) => {
    
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    const response = await axiosInstance.get(url);
    
    const parsed = parser.parse(response.data);

    return parsed.feed;

}

module.exports = {
    channelFeedExtractor
};