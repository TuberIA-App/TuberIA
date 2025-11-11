import { NotFoundError } from '../utils/errorClasses.util';

/**
 * 404 Not Found middleware
 */

export const notFound = (req, res, next) => {
    throw new NotFoundError(`Route ${req.originalUrl} not found`);
};
