/**
 * @fileoverview Express application configuration and middleware setup.
 * Configures security, CORS, rate limiting, body parsing, and routes.
 * @module app
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import healthRoutes from './routes/health.routes.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { timeoutMiddleware } from './middlewares/timeout.middleware.js';
import logger from './utils/logger.js';
import { RATE_LIMIT } from './config/constants.js';
import { initSentry, getSentryErrorHandler } from './config/sentry.js';

/**
 * Express application instance.
 * @type {import('express').Express}
 */
const app = express();

/**
 * Initialize Sentry error tracking (must be first).
 * Only activates when SENTRY_DSN environment variable is set.
 */
initSentry(app);

/**
 * Proxy trust configuration for accurate client IP detection behind reverse proxy.
 * Required for rate limiting to work correctly in production environments.
 */
app.set('trust proxy', 1);

/**
 * Health check routes mounted at root level for load balancer compatibility.
 */
app.use('/', healthRoutes);

/**
 * Security headers middleware (helmet).
 * Sets various HTTP headers for protection against common vulnerabilities.
 */
app.use(helmet());

/**
 * CORS configuration.
 * Restricts origins based on environment: specific URLs in production, localhost in development.
 * @see https://www.npmjs.com/package/cors
 */
const corsOrigins = process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours - reduces preflight requests
}));

/**
 * Rate limiter for API endpoints.
 * Protects against brute force and DoS attacks.
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const limiter = rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api', limiter);

/**
 * Stricter rate limiter for authentication endpoints.
 * Prevents brute force attacks on login/register endpoints.
 * @type {import('express-rate-limit').RateLimitRequestHandler}
 */
const authLimiter = rateLimit({
    windowMs: RATE_LIMIT.AUTH.WINDOW_MS,
    max: RATE_LIMIT.AUTH.MAX_REQUESTS,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/auth', authLimiter);

/**
 * Body parsing middleware.
 * Parses JSON and URL-encoded bodies with 10MB size limit.
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request timeout middleware.
 * Prevents requests from hanging indefinitely (30 second timeout).
 */
app.use(timeoutMiddleware(30000));

/**
 * Request logging middleware.
 * Logs all incoming requests with method, URL, IP, and user agent.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
 */
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

/**
 * API routes mounted at /api prefix.
 */
app.use('/api', routes);

/**
 * 404 handler for unmatched routes.
 * Must be placed after all route definitions.
 */
app.use(notFound);

/**
 * Sentry error handler.
 * Captures errors and sends them to Sentry. Must be before custom error handler.
 */
app.use(getSentryErrorHandler());

/**
 * Global error handler.
 * Must be the last middleware in the chain.
 */
app.use(errorHandler);

export default app;