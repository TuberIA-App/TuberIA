/**
 * @fileoverview Validation result middleware for express-validator.
 * Checks validation results and returns formatted errors if validation failed.
 * @module middlewares/validate
 */

import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.util.js';

/**
 * Middleware that checks express-validator validation results.
 * If validation errors exist, returns 400 with formatted error details.
 * Must be placed after validator middleware chains.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns {void|import('express').Response} Continues or returns error response
 * @example
 * // Usage in routes
 * router.post('/register',
 *   registerValidator,  // validation rules
 *   validate,           // this middleware checks results
 *   registerController  // only runs if validation passes
 * );
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Format the errors to array of { field, message }
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg
        }));

        return errorResponse(
            res,
            'Validation failed',
            400,
            formattedErrors
        );
    }

    next();

}