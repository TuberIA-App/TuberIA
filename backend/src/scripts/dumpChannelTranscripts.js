/**
 * @fileoverview Standalone script that dumps every video of a YouTube channel
 * (title + transcript) into a single JSON file.
 *
 * Reuses TuberIA's own transcript logic (`services/youtube/videoTranscription.js`,
 * which wraps youtube-transcript-plus with user agent rotation, proxy support and
 * exponential-backoff retries) but skips the API/Mongo/Redis layers entirely.
 *
 * Video discovery does NOT use the RSS feed (`channelFeedExtractor`) because RSS
 * only exposes the 15 most recent videos. Instead it scrapes `ytInitialData` from
 * the channel's /videos tab and follows YouTube's Innertube continuation tokens
 * until the full upload list is exhausted.
 *
 * @example
 * node src/scripts/dumpChannelTranscripts.js https://www.youtube.com/@TizzyRBLX12
 * node src/scripts/dumpChannelTranscripts.js @TizzyRBLX12 --out ./tizzy.json --delay 800
 *
 * @module scripts/dumpChannelTranscripts
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import UserAgent from 'user-agents';
import { fetchTranscript } from 'youtube-transcript-plus';
import { getTranscript } from '../services/youtube/videoTranscription.js';
import { createYoutubeTranscriptConfig } from '../utils/youtubeProxyConfig.util.js';
import logger from '../utils/logger.js';

/**
 * Consent + locale headers so YouTube serves the page instead of a cookie wall.
 * @private
 */
const BASE_HEADERS = {
    'Accept-Language': 'en-US,en;q=0.9',
    Cookie: 'SOCS=CAI; CONSENT=YES+cb',
};

/**
 * Number of extra passes over videos that failed for transient reasons.
 * @private
 * @constant {number}
 */
const RETRY_ROUNDS = 4;

/**
 * Attempts allowed when loading the channel page (YouTube sometimes serves a
 * bot-check shell without ytInitialData).
 * @private
 * @constant {number}
 */
const CHANNEL_FETCH_RETRIES = 4;

/**
 * Failures that will never succeed on a retry.
 *
 * Deliberately narrow: when YouTube throttles an IP it lies, reporting videos as
 * caption-less or removed even though they transcribe fine minutes later. Only
 * an explicitly disabled caption track is treated as final.
 * @private
 * @constant {RegExp}
 */
const PERMANENT_FAILURE = /Transcript is disabled|captions are disabled/i;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Parses CLI arguments.
 * @private
 * @returns {{target: string, out: string|null, delay: number, limit: number|null}}
 */
const parseArgs = () => {
    const argv = process.argv.slice(2);
    const positional = [];
    const flags = {};

    for (let i = 0; i < argv.length; i++) {
        if (argv[i].startsWith('--')) {
            const key = argv[i].slice(2);
            flags[key] = argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[++i];
        } else {
            positional.push(argv[i]);
        }
    }

    if (!positional[0]) {
        console.error(
            'Usage: node src/scripts/dumpChannelTranscripts.js <channelUrl|@handle|UC...> [--out file.json] [--delay ms] [--limit n]'
        );
        process.exit(1);
    }

    return {
        target: positional[0],
        out: typeof flags.out === 'string' ? flags.out : null,
        delay: flags.delay ? parseInt(flags.delay, 10) : 700,
        limit: flags.limit ? parseInt(flags.limit, 10) : null,
    };
};

/**
 * Fetches a URL with a freshly rotated user agent.
 * @private
 * @param {string} url
 * @returns {Promise<string>} Raw HTML
 */
const fetchHtml = async (url) => {
    const response = await fetch(url, {
        headers: { ...BASE_HEADERS, 'User-Agent': new UserAgent().toString() },
        redirect: 'follow',
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url} (HTTP ${response.status})`);
    }

    return response.text();
};

/**
 * Extracts a balanced JSON object that follows a marker in an HTML document.
 * @private
 * @param {string} html - Page source
 * @param {string} marker - Text immediately preceding the object (e.g. 'ytInitialData')
 * @returns {Object|null} Parsed object, or null when the marker is absent
 */
const extractJsonAfter = (html, marker) => {
    const markerIndex = html.indexOf(marker);
    if (markerIndex === -1) return null;

    const start = html.indexOf('{', markerIndex);
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < html.length; i++) {
        const char = html[i];

        if (inString) {
            if (escaped) escaped = false;
            else if (char === '\\') escaped = true;
            else if (char === '"') inString = false;
            continue;
        }

        if (char === '"') inString = true;
        else if (char === '{') depth++;
        else if (char === '}' && --depth === 0) {
            try {
                return JSON.parse(html.slice(start, i + 1));
            } catch (error) {
                return null;
            }
        }
    }

    return null;
};

/**
 * Recursively collects every value stored under a given key.
 * @private
 * @param {*} node - Any JSON node
 * @param {string} key - Key to look for
 * @param {Array} [acc] - Accumulator
 * @returns {Array} All matching values in document order
 */
const collectByKey = (node, key, acc = []) => {
    if (!node || typeof node !== 'object') return acc;

    if (Array.isArray(node)) {
        for (const item of node) collectByKey(item, key, acc);
        return acc;
    }

    for (const [k, value] of Object.entries(node)) {
        if (k === key) acc.push(value);
        collectByKey(value, key, acc);
    }

    return acc;
};

/**
 * Maps a YouTube `lockupViewModel` (the renderer used by the /videos grid) to a
 * flat video record.
 * @private
 * @param {Object} lockup - lockupViewModel node
 * @returns {Object|null} Video record, or null when the lockup is not a video
 */
const lockupToVideo = (lockup) => {
    if (lockup?.contentType !== 'LOCKUP_CONTENT_TYPE_VIDEO' || !lockup.contentId) {
        return null;
    }

    const metadata = lockup.metadata?.lockupMetadataViewModel;
    const rows = metadata?.metadata?.contentMetadataViewModel?.metadataRows || [];
    const parts = rows.flatMap((row) => (row.metadataParts || []).map((part) => part.text?.content).filter(Boolean));
    const duration = collectByKey(lockup.contentImage, 'thumbnailBadgeViewModel')
        .map((badge) => badge.text)
        .find((text) => /^\d+(:\d+)+$/.test(text || ''));

    return {
        videoId: lockup.contentId,
        title: metadata?.title?.content || null,
        url: `https://www.youtube.com/watch?v=${lockup.contentId}`,
        thumbnail: lockup.contentImage?.thumbnailViewModel?.image?.sources?.slice(-1)[0]?.url || null,
        durationText: duration || null,
        viewCountText: parts[0] || null,
        publishedText: parts[1] || null,
    };
};

/**
 * Pulls videos and the next continuation token out of any Innertube payload.
 * @private
 * @param {Object} payload - ytInitialData or a browse continuation response
 * @returns {{videos: Array<Object>, continuation: string|null}}
 */
const parsePayload = (payload) => {
    const videos = collectByKey(payload, 'lockupViewModel').map(lockupToVideo).filter(Boolean);
    const continuation = collectByKey(payload, 'continuationCommand')
        .map((command) => command?.token)
        .find(Boolean);

    return { videos, continuation: continuation || null };
};

/**
 * Resolves a handle/URL/ID into channel metadata and loads the first page of uploads.
 * @private
 * @param {string} target - Channel URL, @handle or UC... id
 * @returns {Promise<{channel: Object, context: Object, page: Object}>}
 */
const loadChannel = async (target) => {
    let channelUrl;

    if (/^https?:\/\//i.test(target)) {
        channelUrl = target.replace(/\/(videos|featured|streams|shorts)\/?$/i, '');
    } else if (/^UC[\w-]{22}$/.test(target)) {
        channelUrl = `https://www.youtube.com/channel/${target}`;
    } else {
        channelUrl = `https://www.youtube.com/${target.startsWith('@') ? target : `@${target}`}`;
    }

    // YouTube intermittently answers with a bot-check shell that carries no
    // ytInitialData, so retry with a fresh user agent before giving up.
    let html;
    let page = null;

    for (let attempt = 1; attempt <= CHANNEL_FETCH_RETRIES && !page; attempt++) {
        if (attempt > 1) {
            logger.warn(`Channel page had no ytInitialData, retrying (${attempt}/${CHANNEL_FETCH_RETRIES})`);
            await sleep(2000 * attempt);
        }

        html = await fetchHtml(`${channelUrl}/videos`);
        page = extractJsonAfter(html, 'var ytInitialData =') || extractJsonAfter(html, 'ytInitialData');
    }

    if (!page) {
        throw new Error('Could not parse ytInitialData — YouTube markup changed or the request was blocked');
    }

    const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
    const clientVersion = html.match(/"INNERTUBE_CONTEXT_CLIENT_VERSION":"([^"]+)"/)?.[1]
        || html.match(/"clientVersion":"([\d.]+)"/)?.[1];
    const channelId = page.metadata?.channelMetadataRenderer?.externalId
        || html.match(/"externalId":"(UC[\w-]{22})"/)?.[1];

    if (!apiKey || !clientVersion || !channelId) {
        throw new Error('Could not extract Innertube credentials from the channel page');
    }

    return {
        channel: {
            channelId,
            handle: page.metadata?.channelMetadataRenderer?.vanityChannelUrl?.split('/').pop() || null,
            title: page.metadata?.channelMetadataRenderer?.title || null,
            url: `https://www.youtube.com/channel/${channelId}`,
        },
        context: { apiKey, clientVersion },
        page,
    };
};

/**
 * Requests the next page of uploads from YouTube's Innertube browse endpoint.
 * @private
 * @param {string} token - Continuation token
 * @param {{apiKey: string, clientVersion: string}} context - Innertube credentials
 * @returns {Promise<Object>} Raw browse response
 */
const fetchContinuation = async (token, context) => {
    const response = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${context.apiKey}&prettyPrint=false`, {
        method: 'POST',
        headers: {
            ...BASE_HEADERS,
            'Content-Type': 'application/json',
            'User-Agent': new UserAgent().toString(),
            'X-YouTube-Client-Name': '1',
            'X-YouTube-Client-Version': context.clientVersion,
        },
        body: JSON.stringify({
            context: { client: { clientName: 'WEB', clientVersion: context.clientVersion, hl: 'en', gl: 'US' } },
            continuation: token,
        }),
    });

    if (!response.ok) {
        throw new Error(`Continuation request failed (HTTP ${response.status})`);
    }

    return response.json();
};

/**
 * Lists every public video of a channel by walking all continuation pages.
 * @param {string} target - Channel URL, @handle or UC... id
 * @param {number|null} limit - Stop after N videos (null = all)
 * @returns {Promise<{channel: Object, videos: Array<Object>}>}
 */
const listChannelVideos = async (target, limit) => {
    const { channel, context, page } = await loadChannel(target);
    logger.info('Channel resolved', { channelId: channel.channelId, title: channel.title });

    const seen = new Set();
    const videos = [];

    let { videos: batch, continuation } = parsePayload(page);

    while (batch.length > 0) {
        for (const video of batch) {
            if (seen.has(video.videoId)) continue;
            seen.add(video.videoId);
            videos.push(video);
        }

        logger.info(`Discovered ${videos.length} videos so far`);

        if (!continuation || (limit && videos.length >= limit)) break;

        await sleep(300);
        const next = parsePayload(await fetchContinuation(continuation, context));

        // Guard against a continuation that loops or returns nothing new
        if (next.videos.every((video) => seen.has(video.videoId))) break;

        batch = next.videos;
        continuation = next.continuation;
    }

    return { channel, videos: limit ? videos.slice(0, limit) : videos };
};

/**
 * Builds a successful video record from raw transcript segments.
 * @private
 * @param {Object} video - Video metadata from the channel listing
 * @param {Array<{text: string, offset: number, duration: number, lang?: string}>} segments - Transcript segments
 * @returns {Object} Video record including full text and timed segments
 */
const toRecord = (video, segments) => ({
    ...video,
    transcriptAvailable: true,
    language: segments[0]?.lang || null,
    transcript: segments.map((segment) => segment.text).join(' '),
    segments: segments.map(({ text, offset, duration }) => ({ text, offset, duration })),
});

/**
 * Fetches the transcript for a single video and wraps it into a JSON record.
 *
 * All TuberIA error classes are flagged as operational, so `getTranscript`'s
 * generic InternalServerError hides why a video failed. On failure this makes one
 * direct call to the underlying library: it either recovers the transcript (the
 * first attempt was throttled) or surfaces the real reason for the report.
 * @private
 * @param {Object} video - Video metadata from the channel listing
 * @returns {Promise<Object>} Video record with transcript or error
 */
const transcribeVideo = async (video) => {
    try {
        return toRecord(video, await getTranscript(video.videoId));
    } catch (error) {
        let reason = error.message;

        try {
            const segments = await fetchTranscript(
                `https://www.youtube.com/watch?v=${video.videoId}`,
                createYoutubeTranscriptConfig()
            );

            if (segments?.length > 0) return toRecord(video, segments);
        } catch (probeError) {
            reason = `${probeError.name}: ${probeError.message}`;
        }

        return { ...video, transcriptAvailable: false, language: null, transcript: null, segments: [], error: reason };
    }
};

/**
 * Loads transcripts captured by a previous run of the same output file.
 * @private
 * @param {string} outputPath - Path of the JSON file being written
 * @returns {Promise<Map<string, Object>>} Map of videoId to successful record
 */
const loadExisting = async (outputPath) => {
    const results = new Map();

    try {
        const previous = JSON.parse(await fs.readFile(outputPath, 'utf8'));

        for (const record of previous.videos || []) {
            if (record.transcriptAvailable) results.set(record.videoId, record);
        }

        if (results.size > 0) logger.info(`Resuming from ${outputPath}`, { alreadyTranscribed: results.size });
    } catch (error) {
        if (error.code !== 'ENOENT') logger.warn(`Ignoring unreadable previous output: ${error.message}`);
    }

    return results;
};

/**
 * Writes the combined result set to the single output JSON file.
 * @private
 * @param {string} outputPath - Destination path
 * @param {Object} channel - Channel metadata
 * @param {Array<Object>} videos - Full channel listing, in order
 * @param {Map<string, Object>} results - Successful transcript records
 * @param {Map<string, Object>} failures - Failed records with their reason
 * @returns {Promise<void>}
 */
const save = async (outputPath, channel, videos, results, failures) => {
    const records = videos.map((video) => results.get(video.videoId) || failures.get(video.videoId) || {
        ...video,
        transcriptAvailable: false,
        language: null,
        transcript: null,
        segments: [],
        error: 'Not attempted',
    });

    const withTranscript = records.filter((record) => record.transcriptAvailable).length;

    await fs.writeFile(
        outputPath,
        JSON.stringify(
            {
                channel,
                generatedAt: new Date().toISOString(),
                stats: {
                    total: records.length,
                    withTranscript,
                    withoutTranscript: records.length - withTranscript,
                },
                videos: records,
            },
            null,
            2
        ),
        'utf8'
    );

    logger.info(`Saved ${outputPath}`, { total: records.length, withTranscript });
};

/**
 * Entry point: discovers all videos, transcribes them and writes a single JSON file.
 * @returns {Promise<void>}
 */
const main = async () => {
    const { target, out, delay, limit } = parseArgs();

    const { channel, videos } = await listChannelVideos(target, limit);
    const outputPath = path.resolve(out || `${channel.handle || channel.channelId}-transcripts.json`);

    // Resume: keep transcripts captured by an earlier run so a throttled run can
    // only ever add data, never destroy it
    const results = await loadExisting(outputPath);
    const todo = videos.filter((video) => !results.has(video.videoId));

    logger.info(
        `Fetching transcripts for ${todo.length} videos`,
        results.size > 0 ? { reusedFromPreviousRun: results.size } : {}
    );

    const failures = new Map();

    for (const [index, video] of todo.entries()) {
        const record = await transcribeVideo(video);
        const position = `${index + 1}/${todo.length}`;

        if (record.transcriptAvailable) {
            results.set(video.videoId, record);
            failures.delete(video.videoId);
            logger.info(`[${position}] OK — ${video.title}`, { segments: record.segments.length });
        } else {
            failures.set(video.videoId, record);
            logger.warn(`[${position}] FAILED — ${video.title}: ${record.error}`);
        }

        // Space out requests so YouTube does not rate limit the run
        if (index < todo.length - 1) await sleep(delay);
    }

    await save(outputPath, channel, videos, results, failures);

    // A throttled IP makes YouTube report perfectly good videos as caption-less,
    // so sweep the failures again with a progressively longer cooldown.
    for (let round = 1; round <= RETRY_ROUNDS; round++) {
        const pending = videos.filter(
            (video) => failures.has(video.videoId) && !PERMANENT_FAILURE.test(failures.get(video.videoId).error || '')
        );

        if (pending.length === 0) break;

        const cooldown = delay * 5 * round;
        logger.info(`Retry round ${round}/${RETRY_ROUNDS} for ${pending.length} videos (${cooldown}ms between requests)`);

        for (const video of pending) {
            await sleep(cooldown);
            const record = await transcribeVideo(video);

            if (record.transcriptAvailable) {
                results.set(video.videoId, record);
                failures.delete(video.videoId);
                logger.info(`RETRY OK — ${video.title}`, { segments: record.segments.length });
            } else {
                failures.set(video.videoId, record);
                logger.warn(`RETRY FAILED — ${video.title}: ${record.error}`);
            }
        }

        await save(outputPath, channel, videos, results, failures);
    }

    const withTranscript = videos.filter((video) => results.has(video.videoId)).length;
    logger.info(`Done — ${withTranscript}/${videos.length} videos have transcripts`, { output: outputPath });
};

main().catch((error) => {
    logger.error('Dump failed', { error: error.message, stack: error.stack });
    process.exit(1);
});
