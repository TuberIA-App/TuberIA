import { asyncHandler } from '../middlewares/asyncHandler.middleware.js';
import UserChannel from '../model/UserChannel.js';
import Video from '../model/Video.js';
import { successResponse } from '../utils/response.util.js';

/**
 * @desc    Get user statistics for dashboard
 * @route   GET /api/users/me/stats
 * @access  Private
 */
export const getUserStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Count followed channels
    const followedChannels = await UserChannel.countDocuments({ userId });

    // Get followed channel IDs
    const userChannels = await UserChannel.find({ userId }).select('channelId');
    const followedChannelIds = userChannels.map(uc => uc.channelId);

    // Count completed videos from followed channels
    const completedVideos = await Video.countDocuments({
        channelId: { $in: followedChannelIds },
        status: 'completed'
    });

    // Calculate time saved (rough estimate: 10 min video = 2 min to read summary)
    // Time saved per video: 10 - 2 = 8 minutes
    const totalMinutesSaved = completedVideos * 8;
    const hours = Math.floor(totalMinutesSaved / 60);
    const minutes = totalMinutesSaved % 60;
    const timeSaved = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    successResponse(res, {
        summariesRead: completedVideos,
        timeSaved,
        followedChannels
    }, 'User stats retrieved successfully', 200);
});
