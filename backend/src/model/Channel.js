const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    channelId: {
        type: String,
        required: [true, 'El YouTube Channel ID es obligatorio'],
        trim: true
    },

    name: {
        type: String,
        required: [true, 'El nombre del canal es obligatorio'],
        trim: true
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

channelSchema.index({ owner: 1 });
channelSchema.index({ channelId: 1 }, { unique: true });
channelSchema.index({ lastChecked: 1 });

module.exports = mongoose.model('Channel', channelSchema);