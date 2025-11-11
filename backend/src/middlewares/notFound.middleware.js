import { NotFoundError } from '../utils/errorClasses.util.js';

/**
 * 404 Not Found middleware
 */

export const notFound = (req, res, next) => {
    throw new NotFoundError(`Route ${req.originalUrl} not found`);
};
