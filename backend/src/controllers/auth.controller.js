/**
 * @fileoverview Authentication controller handling HTTP requests for auth operations.
 * Maps HTTP requests to authentication service methods.
 * @module controllers/auth
 */

import { asyncHandler } from '../middlewares/asyncHandler.middleware.js'
import * as authService from '../services/auth.service.js'
import { ConflictError, UnauthorizedError } from '../utils/errorClasses.util.js';
import { successResponse } from '../utils/response.util.js';

/**
 * Handles user registration requests.
 * @route POST /api/auth/register
 * @param {import('express').Request} req - Express request with user data in body
 * @param {Object} req.body - Registration data
 * @param {string} req.body.username - Unique username
 * @param {string} [req.body.name] - Display name
 * @param {string} req.body.email - Email address
 * @param {string} req.body.password - Password
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with user data and tokens
 * @throws {ConflictError} 409 - If email or username already exists
 */
export const register = asyncHandler(async (req, res) => {
    const { username, name, email, password } = req.body;

    const result = await authService.registerUser({
        username,
        name,
        email,
        password
    });

    // Handle errors from service
    if (result.error) {
        if (result.error === 'conflict') {
            throw new ConflictError(result.message);
        }
        throw new Error(result.message);
    }

    // Success
    successResponse(res, result, 'User registered successfully', 201);

});

/**
 * Handles user login requests.
 * @route POST /api/auth/login
 * @param {import('express').Request} req - Express request with credentials in body
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with user data and tokens
 * @throws {UnauthorizedError} 401 - If credentials are invalid
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.loginUser({ email, password });

    // Handle errors from service
    if (result.error) {
        if (result.error === 'unauthorized') {
            throw new UnauthorizedError(result.message);
        }
        throw new Error(result.message);
    }

    // Success
    successResponse(res, result, 'Login successful', 200);
});

/**
 * Handles token refresh requests.
 * @route POST /api/auth/refresh
 * @param {import('express').Request} req - Express request with refresh token in body
 * @param {Object} req.body - Request body
 * @param {string} req.body.refreshToken - Valid refresh token
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with new access token
 * @throws {UnauthorizedError} 401 - If refresh token is invalid or expired
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    // Handle errors from service
    if (result.error) {
        throw new UnauthorizedError(result.message);
    }

    // Success
    successResponse(res, result, 'Token refreshed successfully', 200);

});

/**
 * Returns the currently authenticated user's data.
 * @route GET /api/auth/me
 * @param {import('express').Request} req - Express request with user injected by authMiddleware
 * @param {Object} req.user - Authenticated user object
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON response with user data
 */
export const getMe = asyncHandler(async (req, res) => {
    // req.user is injected & protected by authMiddleware
    successResponse(res, { user: req.user }, 'User data retrieved successfully', 200);
})

/**
 * Handles user logout by revoking tokens.
 * @route POST /api/auth/logout
 * @param {import('express').Request} req - Express request with tokens
 * @param {string} req.headers.authorization - Bearer token to revoke
 * @param {Object} [req.body] - Optional request body
 * @param {string} [req.body.refreshToken] - Optional refresh token to also revoke
 * @param {import('express').Response} res - Express response
 * @returns {Promise<void>} JSON success response
 */
export const logout = asyncHandler(async (req, res) => {
    // Extract access token from Authorization header
    const authHeader = req.headers.authorization;
    const accessToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Optional: Get refresh token from request body
    const { refreshToken } = req.body || {};

    const result = await authService.logoutUser(accessToken, refreshToken);

    // Handle errors from service
    if (result.error) {
        throw new Error(result.message);
    }

    // Success
    successResponse(res, result, 'Logout successful', 200);
})
