import mongoose from 'mongoose';
import Channel from '../model/Channel.js';
import logger from '../utils/logger.js';
import { config } from 'dotenv';

config();

/**
 * Migration script: Fix isActive on existing channels
 *
 * Updates all channels so that:
 * - isActive: true if followersCount > 0
 * - isActive: false if followersCount === 0
 *
 * Usage:
 *   node src/scripts/fixChannelIsActive.js
 */
async function fixChannelIsActive() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI environment variable is not set');
    }

    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB', { uri: mongoUri.replace(/\/\/.*@/, '//***@') });

    // Find channels with inconsistent state
    const inconsistentChannels = await Channel.find({
      $or: [
        { followersCount: 0, isActive: true },   // Case 1: No followers but active
        { followersCount: { $gt: 0 }, isActive: false }  // Case 2: Has followers but inactive
      ]
    });

    logger.info(`Found ${inconsistentChannels.length} channels with inconsistent state`);

    if (inconsistentChannels.length > 0) {
      // Display channels that will be updated
      inconsistentChannels.forEach(channel => {
        logger.info('Inconsistent channel:', {
          channelId: channel.channelId,
          name: channel.name,
          followersCount: channel.followersCount,
          currentIsActive: channel.isActive,
          shouldBeActive: channel.followersCount > 0
        });
      });
    }

    // Bulk update
    const bulkOps = inconsistentChannels.map(channel => ({
      updateOne: {
        filter: { _id: channel._id },
        update: {
          $set: {
            isActive: channel.followersCount > 0
          }
        }
      }
    }));

    if (bulkOps.length > 0) {
      const result = await Channel.bulkWrite(bulkOps);
      logger.info(`Updated ${result.modifiedCount} channels`, {
        matched: result.matchedCount,
        modified: result.modifiedCount
      });
    }

    // Verify result
    const stillInconsistent = await Channel.countDocuments({
      $or: [
        { followersCount: 0, isActive: true },
        { followersCount: { $gt: 0 }, isActive: false }
      ]
    });

    if (stillInconsistent === 0) {
      logger.info('✅ All channels now have consistent isActive state');
    } else {
      logger.warn(`⚠️ ${stillInconsistent} channels still inconsistent`);
    }

    // Display final summary
    const stats = await Channel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactive: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          withFollowers: {
            $sum: { $cond: [{ $gt: ['$followersCount', 0] }, 1, 0] }
          },
          withoutFollowers: {
            $sum: { $cond: [{ $eq: ['$followersCount', 0] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length > 0) {
      logger.info('Channel statistics:', stats[0]);
    }

    await mongoose.connection.close();
    logger.info('Migration completed successfully');
    process.exit(0);

  } catch (error) {
    logger.error('Migration failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

fixChannelIsActive();
