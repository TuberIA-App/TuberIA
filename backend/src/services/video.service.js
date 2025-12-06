import Video from '../model/Video.js';
import UserChannel from '../model/UserChannel.js';
import logger from '../utils/logger.js';

/**
 * Get personalized video feed for a user
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Videos per page (default: 20, max: 100)
 * @param {string} options.status - Filter by status (optional)
 * @returns {Promise<Object>} Videos with pagination metadata
 */
export const getUserVideoFeed = async (userId, options = {}) => {
  try {
    // Extract and validate options
    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit) || 20));
    const skip = (page - 1) * limit;
    const status = options.status;

    // Step 1: Get user's followed channels
    const userChannels = await UserChannel.find({ userId })
      .select('channelId')
      .lean();

    const followedChannelIds = userChannels.map(uc => uc.channelId);

    // If user follows no channels, return empty
    if (followedChannelIds.length === 0) {
      logger.info('User has no followed channels', { userId });
      return {
        success: true,
        videos: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalCount: 0,
          limit,
          hasNextPage: false,
          hasPreviousPage: false
        }
      };
    }

    // Step 2: Build query
    const query = {
      channelId: { $in: followedChannelIds }
    };

    // Optional status filter
    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
      query.status = status;
    }

    // Step 3: Get videos with pagination (using efficient indexes)
    const videos = await Video.find(query)
      .sort({ publishedAt: -1 })  // Newest first (uses index: { channelId: 1, publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('videoId title url channelId publishedAt status thumbnail durationSeconds viewsCount createdAt')
      .lean();

    // Step 4: Get total count for pagination metadata
    const totalCount = await Video.countDocuments(query);

    // Step 5: Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    logger.info('Video feed retrieved successfully', {
      userId,
      videosReturned: videos.length,
      totalCount,
      page,
      limit
    });

    return {
      success: true,
      videos,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPreviousPage
      }
    };

  } catch (error) {
    logger.error('Error retrieving video feed', {
      userId,
      error: error.message
    });

    return {
      error: 'server_error',
      message: 'An error occurred while retrieving the video feed'
    };
  }
};

/**
 * Get a single video by ID (with access control)
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<Object>} Video details or error
 */
export const getVideoById = async (userId, videoId) => {
  try {
    // Find video
    const video = await Video.findOne({ videoId })
      .select('videoId title url channelId publishedAt status summary keyPoints transcription aiModel tokensConsumed thumbnail durationSeconds viewsCount createdAt')
      .lean();

    if (!video) {
      return {
        error: 'not_found',
        message: 'Video not found'
      };
    }

    // Check if user follows this channel (access control)
    const hasAccess = await UserChannel.findOne({
      userId,
      channelId: video.channelId
    });

    if (!hasAccess) {
      return {
        error: 'forbidden',
        message: 'You must follow this channel to view this video'
      };
    }

    logger.info('Video retrieved successfully', {
      userId,
      videoId
    });

    return {
      success: true,
      video
    };

  } catch (error) {
    logger.error('Error retrieving video', {
      userId,
      videoId,
      error: error.message
    });

    return {
      error: 'server_error',
      message: 'An error occurred while retrieving the video'
    };
  }
};
