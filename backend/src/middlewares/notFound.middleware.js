/**
 * @fileoverview 404 Not Found middleware for unmatched routes.
 * Catches all requests that don't match any defined route.
 * @module middlewares/notFound
 */

import { NotFoundError } from '../utils/errorClasses.util.js';

/**
 * Middleware that handles requests to undefined routes.
 * Throws a NotFoundError which is caught by the error handler.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @throws {NotFoundError} Always throws with the requested URL
 * @example
 * // Usage in app.js (after all routes, before error handler)
 * app.use(notFound);
 * app.use(errorHandler);
 */
export const notFound = (req, res, next) => {
    throw new NotFoundError(`Route ${req.originalUrl} not found`);
};
