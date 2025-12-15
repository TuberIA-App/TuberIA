/**
 * @fileoverview RSS polling scheduler for discovering new YouTube videos.
 * Periodically checks followed channels' RSS feeds for new videos and queues them for processing.
 * @module services/youtube/rssPoller
 */

import cron from 'node-cron';
import { channelFeedExtractor } from './channelFeedExtractor.js';
import { transcriptionQueue } from '../../queues/videoProcessing.queue.js';
import Channel from '../../model/Channel.js';
import Video from '../../model/Video.js';
import logger from '../../utils/logger.js';

/**
 * Flag to prevent concurrent polling cycles.
 * @private
 * @type {boolean}
 */
let isPolling = false;

/**
 * Reference to the current cron job for graceful shutdown.
 * @private
 * @type {import('node-cron').ScheduledTask|null}
 */
let currentCronJob = null;

/**
 * Processes new videos from a channel's RSS feed.
 * Checks only the latest video for new content (RSS best practice).
 * @private
 * @param {Object} channel - Channel document from MongoDB
 * @param {string} channel.channelId - YouTube channel ID
 * @param {import('mongoose').Types.ObjectId} channel._id - MongoDB ObjectId
 * @returns {Promise<void>}
 */
async function processChannelVideos(channel) {
  try {
    logger.info('Polling RSS feed', { channelId: channel.channelId });

    // Fetch RSS feed using existing extractor
    const feed = await channelFeedExtractor(channel.channelId);

    // Extract videos from feed
    const entries = feed.entry || [];
    const videos = Array.isArray(entries) ? entries : [entries];

    // Only process the latest (most recent) video - best practice for RSS feeds
    // RSS is for NEW content detection, not historical backfilling
    const latestVideo = videos[0];

    if (!latestVideo) {
      logger.warn('No videos found in RSS feed', { channelId: channel.channelId });
      await Channel.updateOne(
        { channelId: channel.channelId },
        { lastChecked: new Date() }
      );
      return;
    }

    // Extract thumbnail URL from media:group.media:thumbnail
    const thumbnail = latestVideo['media:group']?.['media:thumbnail']?.url || null;

    const videoData = {
      videoId: latestVideo['yt:videoId'],
      title: latestVideo.title,
      publishedAt: new Date(latestVideo.published),
      channelId: latestVideo['yt:channelId'],
      url: `https://www.youtube.com/watch?v=${latestVideo['yt:videoId']}`,
      thumbnail
    };

    // Check if video already exists (deduplication)
    const existingVideo = await Video.findOne({
      videoId: videoData.videoId
    });

    if (!existingVideo) {
      // Create video document
      await Video.create({
        videoId: videoData.videoId,
        title: videoData.title,
        url: videoData.url,
        channelId: channel._id,
        publishedAt: videoData.publishedAt,
        thumbnail: videoData.thumbnail,
        status: 'pending',
        createdAt: new Date()
      });

      // Enqueue transcription job
      await transcriptionQueue.add(
        'transcribe',
        {
          videoId: videoData.videoId,
          channelId: channel.channelId,
          title: videoData.title
        },
        {
          jobId: `transcribe-${videoData.videoId}`,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      );

      logger.info('New video detected and queued', {
        videoId: videoData.videoId,
        title: videoData.title,
        channelId: channel.channelId
      });
    } else {
      logger.debug('Latest video already processed', {
        videoId: videoData.videoId,
        channelId: channel.channelId
      });
    }

    // Update channel last checked timestamp
    await Channel.updateOne(
      { channelId: channel.channelId },
      {
        lastChecked: new Date()
      }
    );

  } catch (error) {
    logger.error('RSS polling error', {
      channelId: channel.channelId,
      error: error.message
    });

    // Update channel with error but don't throw
    await Channel.updateOne(
      { channelId: channel.channelId },
      {
        lastChecked: new Date()
      }
    );
  }
}

/**
 * Starts the RSS polling cron job.
 * Polls all active channels with followers at configured interval.
 * Interval configurable via RSS_POLL_INTERVAL env variable (default: 30 minutes).
 * @example
 * import { startRSSPolling } from './rssPoller.service.js';
 * startRSSPolling(); // Starts polling every 30 minutes
 */
export function startRSSPolling() {
  const interval = parseInt(process.env.RSS_POLL_INTERVAL) || 30;
  const cronPattern = `*/${interval} * * * *`;

  currentCronJob = cron.schedule(cronPattern, async () => {
    if (isPolling) {
      logger.warn('Previous polling cycle still running, skipping...');
      return;
    }

    isPolling = true;
    logger.info('RSS polling cycle started');

    try {
      // Get all active channels with at least one follower
      const channels = await Channel.find({
        isActive: true,
        followersCount: { $gt: 0 }
      });

      logger.info('Polling channels', { count: channels.length });

      // Process channels sequentially
      for (const channel of channels) {
        await processChannelVideos(channel);

        // Polite delay between channels
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.info('RSS polling cycle completed', {
        channelsProcessed: channels.length
      });

    } catch (error) {
      logger.error('RSS polling cycle failed', {
        error: error.message
      });
    } finally {
      isPolling = false;
    }
  });

  logger.info(`RSS polling scheduler started (every ${interval} minutes)`);
}

/**
 * Stops the RSS polling scheduler gracefully.
 * Waits for current polling cycle to complete (max 30 seconds).
 * @returns {Promise<void>} Resolves when polling has stopped
 */
export function stopRSSPolling() {
  if (currentCronJob) {
    currentCronJob.stop();
    logger.info('RSS polling scheduler stopped');
  }

  // Wait for current poll to finish
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (!isPolling) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);

    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, 30000);
  });
}

/**
 * Manually triggers an immediate RSS check for a specific channel.
 * Useful for checking new follows or manual refresh requests.
 * @param {string} channelId - YouTube channel ID (UCxxxxxx format)
 * @param {string} [reason='manual'] - Reason for polling (for logging)
 * @returns {Promise<{success: boolean, channelId: string}>} Result object
 * @throws {Error} If channel is not found in database
 * @example
 * await pollChannelNow('UCxxxxxxx', 'new_follow');
 */
export async function pollChannelNow(channelId, reason = 'manual') {
  logger.info('Immediate poll requested', { channelId, reason });

  const channel = await Channel.findOne({ channelId });

  if (!channel) {
    throw new Error('Channel not found');
  }

  await processChannelVideos(channel);
  return { success: true, channelId };
}
