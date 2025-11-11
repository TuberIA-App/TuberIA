import User from '../model/User';
import logger from '../utils/logger';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt.util';

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
        // With the .lean() we are telling mongoose to return a POJO instead of a complete Mongoose one (so we avoid adding overhead to the code since we are avoiding to receive getters/setters, virtuals memory, etc...)
        const user = await User.findOne({ email }).select('+password').lean();
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