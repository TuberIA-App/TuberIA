export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

export const VIDEO_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_SALT_ROUNDS = 10;

export const RATE_LIMIT = {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 666
}

export const TOKEN_EXPIRY = {
    ACCESS: '15m',
    REFRESH: '7d'
}