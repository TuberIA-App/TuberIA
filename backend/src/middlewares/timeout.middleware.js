import logger from '../utils/logger.js';

/**
 * Timeout middleware to prevent requests from hanging indefinitely
 *
 * Best Practice: Always set request timeouts to avoid hanging connections
 *
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30 seconds)
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
