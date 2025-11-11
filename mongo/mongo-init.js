db = db.getSiblingDB('tuberia_db');

db.createUser({
    user: 'mongo',
    pwd: 'mongo',
    roles: [{ role: 'readWrite', db: 'tuberia_db' }]
});

db.createCollection('users');
db.createCollection('channels');
db.createCollection('videos');
db.createCollection('userchannels');

db.users.createIndex({ username: 1, email: 1 }, { unique: false });
db.users.createIndex({ email: 1 }, { unique: true });

db.channels.createIndex({ owner: 1 });
db.channels.createIndex({ channelId: 1 }, { unique: true });
db.channels.createIndex({ lastChecked: 1 });

db.videos.createIndex({ videoId: 1 }, { unique: true });
db.videos.createIndex({ channelId: 1, publishedAt: -1 });
db.videos.createIndex({ status: 1 });

db.userchannels.createIndex({ userId: 1, channelId: 1 }, { unique: true });
db.userchannels.createIndex({ channelId: 1 });

try {
    db.createView('user_feed', 'videos', [
        {
            $lookup: {
                from: 'channels',
                localField: 'channelId',
                foreignField: '_id',
                as: 'channel_info'
            }
        },
        { $unwind: { path: '$channel_info', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, title: 1, url: 1, publishedAt: 1, videoId: 1, 'channel_info.name': 1, 'channel_info.channelId': 1 } }
    ]);
} catch (e) {
    print('user_feed view creation skipped or failed: ' + e.message);
}