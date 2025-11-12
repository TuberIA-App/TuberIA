import jwt from 'jsonwebtoken';

/**
 * Generate access token (short-lived)
 * @param {Object} payload - { userId, email }
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
            issuer: 'tuberia-api'
        }
    );
};

/**
 * Generate refresh token (long-lived)
 * @param {Object} payload - { userId }
 * @returns {string} JWT token
 */
export const generateRefreshToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
            issuer: 'tuberia-api'
        }
    );
};

/**
 * Verify the access token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw error;
    }
}

/**
 * Verify refresh token
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw error;
    }
}