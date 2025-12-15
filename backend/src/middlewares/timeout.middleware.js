/**
 * @fileoverview Request timeout middleware to prevent hanging connections.
 * Automatically responds with 408 if request takes too long.
 * @module middlewares/timeout
 */

import logger from '../utils/logger.js';

/**
 * Creates a timeout middleware to prevent requests from hanging indefinitely.
 * Returns 408 Request Timeout if the request exceeds the specified duration.
 * @param {number} [timeoutMs=30000] - Timeout in milliseconds (default: 30 seconds)
 * @returns {Function} Express middleware function
 * @example
 * // Global timeout of 30 seconds
 * app.use(timeoutMiddleware());
 *
 * // Route-specific timeout of 60 seconds
 * router.post('/upload', timeoutMiddleware(60000), uploadHandler);
 */
export const timeoutMiddleware = (timeoutMs = 30000) => {
  return (req, res, next) => {
    // Set request timeout
    req.setTimeout(timeoutMs, () => {
      logger.error('Request timeout', {
        method: req.method,
        url: req.url,
        timeout: timeoutMs
      });

      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          error: 'The server took too long to respond'
        });
      }
    });

    next();
  };
};
