/**
 * @fileoverview UserChannel model for user-channel subscription relationships.
 * Junction table implementing many-to-many relationship between Users and Channels.
 * @module model/UserChannel
 */

import mongoose from 'mongoose';

/**
 * @typedef {Object} UserChannelDocument
 * @property {mongoose.Types.ObjectId} _id - MongoDB document ID
 * @property {mongoose.Types.ObjectId} userId - Reference to subscribing User
 * @property {mongoose.Types.ObjectId} channelId - Reference to subscribed Channel
 * @property {Date} subscribedAt - When the user followed the channel
 */

/**
 * Mongoose schema for UserChannel junction documents.
 * Tracks which users are following which channels.
 * @type {mongoose.Schema<UserChannelDocument>}
 */
const userChannelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },

    subscribedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

/**
 * Database indexes for optimized queries.
 * - userId + channelId: Unique constraint prevents duplicate follows, fast lookup
 * - channelId: Fast lookup of all users following a channel
 */
userChannelSchema.index({ userId: 1, channelId: 1 }, { unique: true });

userChannelSchema.index({ channelId: 1 });

export default mongoose.model('UserChannel', userChannelSchema);