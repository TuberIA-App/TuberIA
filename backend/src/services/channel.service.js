import Channel from '../model/Channel.js';
import UserChannel from '../model/UserChannel.js';
import logger from '../utils/logger.js';
import mongoose from 'mongoose';

/**
 * Follow a channel
 * @param {string} userId - MongoDB ObjectId of the user
 * @param {string} channelId - MongoDB ObjectId of the channel
 * @returns {Promise<Object>} Success or error object
 */
export const followChannel = async (userId, channelId) => {
  try {
    // Check if channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return {
        error: 'not_found',
        message: 'Channel not found'
      };
    }

    // Check if already following (idempotency)
    const existingFollow = await UserChannel.findOne({
      userId,
      channelId
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
      channelId,
      subscribedAt: new Date()
    });

    // Increment followersCount
    await Channel.findByIdAndUpdate(
      channelId,
      { $inc: { followersCount: 1 } }
    );

    logger.info('User followed channel', {
      userId,
      channelId: channel.channelId,
      channelName: channel.name
    });

    return {
      success: true,
      channel: {
        _id: channel._id,
        channelId: channel.channelId,
        name: channel.name,
        username: channel.username,
        thumbnail: channel.thumbnail,
        followersCount: channel.followersCount + 1
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

    // Decrement followersCount (but not below 0)
    const updatedChannel = await Channel.findById(channelId);
    const newCount = Math.max(0, updatedChannel.followersCount - 1);
    await Channel.findByIdAndUpdate(
      channelId,
      { followersCount: newCount }
    );

    logger.info('User unfollowed channel', {
      userId,
      channelId: channel.channelId,
      channelName: channel.name
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

    // Filter out any null channels (deleted channels)
    const validChannels = followedChannels
      .filter(fc => fc.channelId !== null)
      .map(fc => ({
        ...fc.channelId.toObject(),
        subscribedAt: fc.subscribedAt
      }));

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
