import mongoose from 'mongoose';

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

videoSchema.index({ videoId: 1 }, { unique: true });
videoSchema.index({ channelId: 1, publishedAt: -1 });
videoSchema.index({ status: 1 });

export default mongoose.model('Video', videoSchema);