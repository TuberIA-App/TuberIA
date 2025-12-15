/**
 * @fileoverview Standardized API response utilities for consistent JSON responses.
 * Provides helper functions to format success and error responses.
 * @module utils/response
 */

/**
 * Sends a standardized success JSON response
 * @param {import('express').Response} res - Express response object
 * @param {Object|Array|null} data - Response payload data
 * @param {string} [message='Success'] - Success message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {import('express').Response} Express response with JSON body
 * @example
 * // Basic usage
 * successResponse(res, { user: userData });
 *
 * // With custom message and status
 * successResponse(res, { id: newUser.id }, 'User created successfully', 201);
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

/**
 * Sends a standardized error JSON response
 * @param {import('express').Response} res - Express response object
 * @param {string} [message='Error'] - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Array|Object|null} [errors=null] - Additional error details (e.g., validation errors)
 * @returns {import('express').Response} Express response with JSON body
 * @example
 * // Basic error
 * errorResponse(res, 'User not found', 404);
 *
 * // With validation errors
 * errorResponse(res, 'Validation failed', 400, [
 *   { field: 'email', message: 'Invalid email format' }
 * ]);
 */
export const errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response)
}