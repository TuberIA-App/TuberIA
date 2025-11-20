import jwt from 'jsonwebtoken';
import { secrets, jwtConfig } from '../config/secrets.js';

/**
 * Generate access token (short-lived)
 * @param {Object} payload - { userId, email }
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        secrets.jwtSecret,
        {
            expiresIn: jwtConfig.accessExpiry,
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
        secrets.jwtRefreshSecret,
        {
            expiresIn: jwtConfig.refreshExpiry,
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
        return jwt.verify(token, secrets.jwtSecret);
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
        return jwt.verify(token, secrets.jwtRefreshSecret);
    } catch (error) {
        throw error;
    }
}