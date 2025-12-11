import User from '../model/User.js';
import logger from '../utils/logger.js';
import { verifyRefreshToken, generateAccessToken, verifyAccessToken } from '../utils/jwt.util.js';
import { addToBlacklist, isBlacklisted } from './tokenBlacklist.service.js';

/**
 * Register a new user
 * @param {Object} userData - { username, name, email, password }
 * @returns {Promise<Object>} User data with tokens or error object
 */
export const registerUser = async ({ username, name, email, password }) => {
    try {
        // Checking if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return {
                error: 'conflict',
                message: 'Email already exists'
            };
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return {
                error: 'conflict',
                message: 'Username already exists'
            };
        }

        // Create a new user (password will be hashed by pre-save hook) if everything is correct
        const user = await User.create({
            username,
            name,
            email,
            password
        });

        // Generate tokens
        const { accessToken, refreshToken } = user.generateAuthTokens();

        logger.info('User registered successfully', {
            userId: user._id,
            email: user.email
        });

        // Return the user data (without password) and the tokens
        return {
            user: user.toJSON(),
            accessToken,
            refreshToken
        };

    } catch (error) {
        logger.error(`Error in registerUser service, { error: ${error.message} }`);
        return {
            error: 'server_error',
            message: error.message || 'Error registering user'
        };
    }
};

/**
 * 
 * @param {Object} credentials - { email, password } 
 * @returns {Promise<Object>} User data with tokens or error object
 */
export const loginUser = async ({email, password}) => {
    try {
        // Find the user by email
        // With the +password as configured for security on the User model, we tell the DB to get the password field, since by default we hide it with select: false
        // NOTE: We DON'T use .lean() here because we need Mongoose methods (comparePassword, generateAuthTokens, save)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return {
                error: 'unauthorized',
                message: 'Invalid credentials'
            };
        }

        // Compare with password if the email is found
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return {
                error: 'unauthorized',
                message: 'Invalid credentials'
            };
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate the tokens if the login is successful
        const { accessToken, refreshToken } = user.generateAuthTokens();

        logger.info('User logged in successfully', {
            userId: user._id,
            email: user.email
        });

        // Return the user data and tokens
        return {
            user: user.toJSON(),
            accessToken,
            refreshToken
        };

    } catch (error) {
        logger.error(`Error in loginUser service, { error: ${error.message} }`);
        return {
            error: 'server_error',
            message: error.message || 'Error logging in'
        };
    }
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token or error object
 */
export const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Check if refresh token is blacklisted (revoked)
        const tokenIsBlacklisted = await isBlacklisted(refreshToken);
        if (tokenIsBlacklisted) {
            logger.warn('Attempted to refresh with revoked token', {
                userId: decoded.userId
            });
            return {
                error: 'unauthorized',
                message: 'Token has been revoked'
            };
        }

        // Find the user
        const user = await User.findById(decoded.userId).lean();
        if (!user) {
            return {
                error: 'unauthorized',
                message: 'User not found'
            };
        }

        // Generate the new access token
        const newAccessToken = generateAccessToken({
            userId: user._id.toString(),
            email: user.email
        });

        logger.info(`Access token refreshed, { userId: ${user._id} }`);

        return {
            accessToken: newAccessToken
        };

    } catch (error) {
        logger.error(`Error in refreshAccessToken service { error: ${error.message} }`)
        return {
            error: 'unauthorized',
            message: 'Invalid or expired refresh token'
        }
    }
}

/**
 * Logout user by revoking their tokens
 * @param {string} accessToken - Access token from Authorization header
 * @param {string} refreshToken - Optional refresh token from request body
 * @returns {Promise<Object>} Success message or error object
 */
export const logoutUser = async (accessToken, refreshToken = null) => {
    try {
        // Decode access token to get expiration time
        const decodedAccess = verifyAccessToken(accessToken);
        const currentTime = Math.floor(Date.now() / 1000);
        const accessTokenTTL = decodedAccess.exp - currentTime;

        // Add access token to blacklist if it hasn't expired yet
        if (accessTokenTTL > 0) {
            const blacklistedAccess = await addToBlacklist(accessToken, accessTokenTTL);
            if (!blacklistedAccess) {
                logger.warn('Failed to blacklist access token, but continuing logout');
            }
        }

        // If refresh token is provided, blacklist it too
        if (refreshToken) {
            try {
                const decodedRefresh = verifyRefreshToken(refreshToken);
                const refreshTokenTTL = decodedRefresh.exp - currentTime;

                if (refreshTokenTTL > 0) {
                    const blacklistedRefresh = await addToBlacklist(refreshToken, refreshTokenTTL);
                    if (!blacklistedRefresh) {
                        logger.warn('Failed to blacklist refresh token, but continuing logout');
                    }
                }
            } catch (error) {
                // If refresh token is invalid/expired, just log it and continue
                logger.warn('Invalid refresh token provided during logout, skipping blacklist');
            }
        }

        logger.info('User logged out successfully', {
            userId: decodedAccess.userId,
            tokensRevoked: refreshToken ? 'access + refresh' : 'access only'
        });

        return {
            success: true,
            message: 'Logout successful'
        };

    } catch (error) {
        logger.error(`Error in logoutUser service { error: ${error.message} }`);
        return {
            error: 'server_error',
            message: error.message || 'Error during logout'
        };
    }
}