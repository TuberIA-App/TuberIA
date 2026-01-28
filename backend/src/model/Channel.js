/**
 * @fileoverview Channel model definition for YouTube channel data.
 * Stores channel metadata and tracks polling status.
 * @module model/Channel
 */

import mongoose from 'mongoose';

/**
 * @typedef {Object} ChannelDocument
 * @property {mongoose.Types.ObjectId} _id - MongoDB document ID
 * @property {mongoose.Types.ObjectId} [owner] - Reference to User who first added the channel
 * @property {string} channelId - YouTube channel ID (UC... format)
 * @property {string} name - Channel display name
 * @property {string} [username] - Channel username/handle (@username)
 * @property {string} [thumbnail] - Channel thumbnail URL
 * @property {string} [description] - Channel description
 * @property {Date} [lastChecked] - Last RSS feed poll timestamp
 * @property {number} followersCount - Number of users following this channel in the app
 * @property {boolean} isActive - Whether the channel is actively being polled
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document last update timestamp
 */

/**
 * Mongoose schema for Channel documents.
 * Stores YouTube channel information for RSS feed polling.
 * @type {mongoose.Schema<ChannelDocument>}
 */
const channelSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    channelId: {
        type: String,
        required: [true, 'YouTube Channel ID is required'],
        trim: true
    },

    name: {
        type: String,
        required: [true, 'Channel name is required'],
        trim: true
    },

    username: {
        type: String,
        trim: true,
        default: null
    },

    thumbnail: {
        type: String
    },

    description: {
        type: String
    },

    lastChecked: {
        type: Date,
        default: null
    },

    followersCount: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true 
});

/**
 * Database indexes for optimized queries.
 * - owner: Fast lookup of channels by creator
 * - channelId: Unique constraint and fast YouTube ID lookups
 * - username: Fast lookup by channel handle
 * - lastChecked: Efficient polling queue ordering
 */
channelSchema.index({ owner: 1 });
channelSchema.index({ channelId: 1 }, { unique: true });
channelSchema.index({ username: 1 });
channelSchema.index({ lastChecked: 1 });

export default mongoose.model('Channel', channelSchema);