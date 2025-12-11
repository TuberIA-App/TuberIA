import Channel from '../model/Channel.js';
import UserChannel from '../model/UserChannel.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';
import { pollChannelNow } from './youtube/rssPoller.service.js';

/**
 * Find or create a channel by YouTube channelId
 * @param {Object} channelData - Channel information from YouTube
 * @returns {Promise<Object>} Channel document
 */
export const findOrCreateChannel = async (channelData) => {
  try {
    // Try to find existing channel by YouTube channelId
    let channel = await Channel.findOne({ channelId: channelData.channelId });

    if (!channel) {
      // Create new channel if it doesn't exist
      channel = await Channel.create({
        channelId: channelData.channelId,
        name: channelData.name,
        username: channelData.username || null,
        thumbnail: channelData.thumbnail || null,
        description: channelData.description || null,
        followersCount: 0
      });

      logger.info('Created new channel', {
        channelId: channel.channelId,
        name: channel.name
      });
    } else {
      // Update channel info if it exists (in case data changed)
      channel.name = channelData.name;
      channel.username = channelData.username || channel.username;
      channel.thumbnail = channelData.thumbnail || channel.thumbnail;
      await channel.save();

      logger.info('Updated existing channel', {
        channelId: channel.channelId,
        name: channel.name
      });
    }

    return channel;
  } catch (error) {
    logger.error('Error finding or creating channel', {
      channelData,
      error: error.message
    });
    throw error;
  }
};

/**
 * Follow a channel
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} channelId - MongoDB ObjectId of the channel OR YouTube channelId
 * @param {Object} channelData - Optional channel data for creation if using YouTube channelId
 * @returns {Promise<Object>} Success or error object
 */
export const followChannel = async (userId, channelId, channelData = null) => {
  try {
    let channel;

    // Check if channelId is a MongoDB ObjectId or YouTube channelId
    if (mongoose.Types.ObjectId.isValid(channelId) && channelId.length === 24) {
      // It's a MongoDB ObjectId
      channel = await Channel.findById(channelId);
      if (!channel) {
        return {
          error: 'not_found',
          message: 'Channel not found'
        };
      }
    } else if (channelData) {
      // It's a YouTube channelId and we have channel data, find or create
      channel = await findOrCreateChannel(channelData);
    } else {
      // Invalid format
      return {
        error: 'invalid_id',
        message: 'Invalid channel ID format'
      };
    }

    // Check if already following (idempotency)
    const existingFollow = await UserChannel.findOne({
      userId,
      channelId: channel._id
    });

    if (existingFollow) {
      return {
        error: 'already_following',
        message: 'You are already following this channel'
      };
    }

    // Create UserChannel relationship
    await UserChannel.create({
      userId,
      channelId: channel._id,
      subscribedAt: new Date()
    });

    // Increment followersCount and reactivate channel
    const updatedChannel = await Channel.findByIdAndUpdate(
      channel._id,
      {
        $inc: { followersCount: 1 },
        $set: { isActive: true }  // Reactivate channel if it was inactive
      },
      { new: true }
    );

    logger.info('User followed channel', {
      userId,
      channelId: channel.channelId,
      channelName: channel.name,
      newFollowersCount: updatedChannel.followersCount,
      isActive: true
    });

    // Trigger immediate RSS poll for the latest video (don't await - runs in background)
    pollChannelNow(channel.channelId, 'new_follow')
      .then(() => logger.info('Immediate poll triggered for new channel follow', { channelId: channel.channelId }))
      .catch(err => logger.error('Failed to trigger immediate poll', { channelId: channel.channelId, error: err.message }));

    return {
      success: true,
      channel: {
        _id: channel._id,
        channelId: channel.channelId,
        name: channel.name,
        username: channel.username,
        thumbnail: channel.thumbnail,
        followersCount: updatedChannel.followersCount
      }
    };

  } catch (error) {
    logger.error('Error following channel', {
      userId,
      channelId,
      error: error.message
    });

    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return {
        error: 'already_following',
        message: 'You are already following this channel'
      };
    }

    return {
      error: 'server_error',
      message: 'An error occurred while following the channel'
    };
  }
};

/**
 * Unfollow a channel
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @returns {Promise<Object>} Success or error object
 */
export const unfollowChannel = async (userId, channelId) => {
  try {
    // Check if channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return {
        error: 'not_found',
        message: 'Channel not found'
      };
    }

    // Check if following
    const existingFollow = await UserChannel.findOne({
      userId,
      channelId
    });

    if (!existingFollow) {
      return {
        error: 'not_following',
        message: 'You are not following this channel'
      };
    }

    // Delete UserChannel relationship
    await UserChannel.deleteOne({ userId, channelId });

    // Decrement followersCount atomically and update isActive
    // Uses MongoDB aggregation pipeline for complete atomicity (no race conditions)
    const updatedChannel = await Channel.findByIdAndUpdate(
      channelId,
      [
        {
          $set: {
            followersCount: {
              $max: [0, { $subtract: ["$followersCount", 1] }]
            }
          }
        },
        {
          $set: {
            isActive: { $gt: ["$followersCount", 0] }
          }
        }
      ],
      { new: true }
    );

    logger.info('User unfollowed channel', {
      userId,
      channelId: channel.channelId,
      channelName: channel.name,
      newFollowersCount: updatedChannel.followersCount,
      isActive: updatedChannel.isActive
    });

    return {
      success: true,
      message: 'Successfully unfollowed channel'
    };

  } catch (error) {
    logger.error('Error unfollowing channel', {
      userId,
      channelId,
      error: error.message
    });

    return {
      error: 'server_error',
      message: 'An error occurred while unfollowing the channel'
    };
  }
};

/**
 * Get all channels followed by a user
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<Object>} Success with channels array or error object
 */
export const getFollowedChannels = async (userId) => {
  try {
    // Get all UserChannel relationships for this user
    const followedChannels = await UserChannel.find({ userId })
      .populate({
        path: 'channelId',
        select: 'channelId name username thumbnail description followersCount lastChecked'
      })
      .sort({ subscribedAt: -1 }); // Most recently followed first

    // Filter out any null channels (deleted channels) and enrich with frontend-friendly data
    const validChannels = followedChannels
      .filter(fc => fc.channelId !== null)
      .map(fc => {
        const channel = fc.channelId.toObject();
        return {
          id: channel._id,
          channelId: channel.channelId,
          name: channel.name,
          username: channel.username,
          description: channel.description || null,
          avatar: channel.thumbnail || `https://via.placeholder.com/150?text=${encodeURIComponent(channel.name)}`,
          followersCount: channel.followersCount,
          subscribedAt: fc.subscribedAt,
          isFollowing: true // Always true since these are followed channels
        };
      });

    logger.info('Fetched followed channels', {
      userId,
      count: validChannels.length
    });

    return {
      success: true,
      channels: validChannels,
      count: validChannels.length
    };

  } catch (error) {
    logger.error('Error fetching followed channels', {
      userId,
      error: error.message
    });

    return {
      error: 'server_error',
      message: 'An error occurred while fetching followed channels'
    };
  }
};

/**
 * Check if user is following a channel
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @returns {Promise<boolean>} True if following, false otherwise
 */
export const isChannelFollowed = async (userId, channelId) => {
  try {
    const follow = await UserChannel.findOne({ userId, channelId });
    return follow !== null;
  } catch (error) {
    logger.error('Error checking if channel is followed', {
      userId,
      channelId,
      error: error.message
    });
    return false;
  }
};

/**
 * Get channel by channelId (YouTube ID) with optional isFollowing status
 * @param {string} channelId - YouTube channel ID (UCxxxxxx format)
 * @param {string|undefined} userId - Optional MongoDB ObjectId of the user
 * @returns {Promise<Object>} Success with channel data or error object
 */
export const getChannelById = async (channelId, userId = null) => {
  try {
    // Find channel by channelId (YouTube ID)
    const channel = await Channel.findOne({ channelId }).lean();

    if (!channel) {
      return {
        error: 'not_found',
        message: 'Channel not found'
      };
    }

    // Check if user is following this channel (if userId provided)
    let isFollowing = false;
    if (userId) {
      const relation = await UserChannel.findOne({
        userId,
        channelId: channel._id
      });
      isFollowing = !!relation;
    }

    // Enrich with frontend-friendly data
    const enrichedChannel = {
      id: channel._id,
      channelId: channel.channelId,
      name: channel.name,
      username: channel.username,
      description: channel.description || null,
      avatar: channel.thumbnail || `https://via.placeholder.com/150?text=${encodeURIComponent(channel.name)}`,
      followersCount: channel.followersCount,
      lastChecked: channel.lastChecked,
      isFollowing
    };

    logger.info('Fetched channel by ID', {
      channelId,
      userId: userId || 'anonymous',
      isFollowing
    });

    return {
      success: true,
      channel: enrichedChannel
    };

  } catch (error) {
    logger.error('Error fetching channel by ID', {
      channelId,
      userId,
      error: error.message
    });

    return {
      error: 'server_error',
      message: 'An error occurred while fetching the channel'
    };
  }
};
