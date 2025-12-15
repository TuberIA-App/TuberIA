/**
 * @fileoverview Video model definition for YouTube video data and AI processing.
 * Stores video metadata, transcription, AI-generated summaries, and processing status.
 * @module model/Video
 */

import mongoose from 'mongoose';

/**
 * @typedef {Object} VideoErrorInfo
 * @property {string} [code] - Error code identifier
 * @property {string} [message] - Human-readable error message
 */

/**
 * @typedef {Object} VideoDocument
 * @property {mongoose.Types.ObjectId} _id - MongoDB document ID
 * @property {mongoose.Types.ObjectId} channelId - Reference to parent Channel
 * @property {string} videoId - YouTube video ID
 * @property {string} title - Video title
 * @property {string} url - Full YouTube video URL
 * @property {string} [thumbnail] - Video thumbnail URL
 * @property {number} [durationSeconds] - Video duration in seconds
 * @property {Date} [publishedAt] - Original publish date on YouTube
 * @property {'pending'|'processing'|'completed'|'failed'} status - Processing status
 * @property {string} [transcription] - Full video transcription text
 * @property {string} [summary] - AI-generated summary
 * @property {string[]} keyPoints - AI-generated key points array
 * @property {string} [aiModel] - AI model used for summarization
 * @property {number} tokensConsumed - Total tokens used for AI processing
 * @property {number} viewsCount - View count in the application
 * @property {VideoErrorInfo} [errorInfo] - Error details if processing failed
 * @property {Date} createdAt - Document creation timestamp
 * @property {Date} updatedAt - Document last update timestamp
 */

/**
 * Mongoose schema for Video documents.
 * Tracks YouTube videos through the transcription and summarization pipeline.
 * @type {mongoose.Schema<VideoDocument>}
 */
const videoSchema = new mongoose.Schema({
    channelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },

    videoId: {
        type: String,
        required: [true, 'YouTube Video ID es obligatorio'],
        trim: true
    },

    title: {
        type: String,
        required: [true, 'El titulo del video es obligatorio'],
        trim: true
    },

    url: {
        type: String,
        required: [true, 'La URL del video es obligatoria']
    },

    thumbnail: {
        type: String
    },

    durationSeconds: {
        type: Number
    },

    publishedAt: {
        type: Date
    },

    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },

    transcription: {
        type: String
    },

    summary: {
        type: String
    },

    keyPoints: {
        type: [String],
        default: []
    },

    aiModel: {
        type: String
    },

    tokensConsumed: {
        type: Number,
        default: 0
    },

    viewsCount: {
        type: Number,
        default: 0
    },

    errorInfo: {
        code: { type: String },
        message: { type: String }
    }
}, {
    timestamps: true 
});

/**
 * Database indexes for optimized queries.
 * - videoId: Unique constraint and fast YouTube ID lookups
 * - channelId + publishedAt: Feed queries sorted by publish date
 * - status: Processing queue queries
 * - status + createdAt: Ordered processing queue
 * - channelId + status: Channel-specific status filtering
 */
videoSchema.index({ videoId: 1 }, { unique: true });
videoSchema.index({ channelId: 1, publishedAt: -1 });
videoSchema.index({ status: 1 });
videoSchema.index({ status: 1, createdAt: -1 });
videoSchema.index({ channelId: 1, status: 1 });

export default mongoose.model('Video', videoSchema);