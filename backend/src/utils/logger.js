/**
 * @fileoverview Winston logger configuration for application-wide logging.
 * Provides structured logging with timestamps, colors, and file rotation.
 * @module utils/logger
 */

import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format function for Winston.
 * Formats log messages with timestamp, level, message, stack trace, and metadata.
 * @private
 * @param {Object} info - Log info object from Winston
 * @param {string} info.level - Log level (error, warn, info, debug)
 * @param {string} info.message - Log message
 * @param {string} info.timestamp - Formatted timestamp
 * @param {string} [info.stack] - Error stack trace if present
 * @returns {string} Formatted log string
 */
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }
  
  // Add metadata if exists
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  
  return msg;
});

/**
 * Configured Winston logger instance.
 * Provides structured logging with multiple transports:
 * - Console: Colorized output for development
 * - File (error.log): Error-level logs only, 5MB max, 5 files rotation
 * - File (combined.log): All log levels, 5MB max, 5 files rotation
 *
 * Log level is controlled by LOG_LEVEL environment variable (default: 'info').
 *
 * @type {import('winston').Logger}
 * @example
 * import logger from './utils/logger.js';
 *
 * logger.info('User logged in', { userId: '123', email: 'user@example.com' });
 * logger.error('Database connection failed', { error: err.message });
 * logger.debug('Processing request', { endpoint: '/api/videos' });
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Don't exit on handled exceptions
  exitOnError: false
});

// If not in production, log to console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      logFormat
    )
  }));
}

export default logger;