const mongoose = require('mongoose');

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

userChannelSchema.index({ userId: 1, channelId: 1 }, { unique: true });

userChannelSchema.index({ channelId: 1 });

module.exports = mongoose.model('UserChannel', userChannelSchema);