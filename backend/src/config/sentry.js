/**
 * @fileoverview Sentry error tracking and performance monitoring configuration.
 * Provides advanced observability for AI/LLM operations, Express requests,
 * and application-wide error tracking.
 * @module config/sentry
 */

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Initialize Sentry for the backend application with advanced configuration.
 * Only initializes when SENTRY_DSN environment variable is set.
 * Includes profiling, performance monitoring, and AI-specific tracking.
 * @param {import('express').Express} app - Express application instance
 */
export const initSentry = (app) => {
    if (!process.env.SENTRY_DSN) {
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.APP_VERSION || '1.0.0',

        integrations: [
            nodeProfilingIntegration(),
        ],

        // Performance monitoring - higher in dev for debugging
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Filter sensitive data before sending
        beforeSend(event) {
            // Remove sensitive headers
            if (event.request?.headers) {
                delete event.request.headers.authorization;
                delete event.request.headers.cookie;
                delete event.request.headers['x-api-key'];
            }

            // Redact API keys from error messages
            if (event.exception?.values) {
                event.exception.values.forEach(ex => {
                    if (ex.value) {
                        // Redact OpenRouter and other API keys
                        ex.value = ex.value.replace(/sk-or-[a-zA-Z0-9-]+/g, '[REDACTED_OPENROUTER_KEY]');
                        ex.value = ex.value.replace(/sk-[a-zA-Z0-9-]+/g, '[REDACTED_API_KEY]');
                    }
                });
            }

            // Redact sensitive data from breadcrumbs
            if (event.breadcrumbs) {
                event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
                    if (breadcrumb.data?.authorization) {
                        breadcrumb.data.authorization = '[REDACTED]';
                    }
                    return breadcrumb;
                });
            }

            return event;
        },

        // Ignore expected operational errors
        ignoreErrors: [
            'TokenExpiredError',
            'JsonWebTokenError',
            // Network errors that are expected in normal operation
            'ECONNRESET',
            'ETIMEDOUT',
        ],
    });
};

/**
 * Get Sentry error handler middleware.
 * Returns a no-op middleware if Sentry is not configured.
 * Must be added after all routes but before other error handlers.
 * @returns {import('express').ErrorRequestHandler} Error handler middleware
 */
export const getSentryErrorHandler = () => {
    if (!process.env.SENTRY_DSN) {
        // No-op middleware when Sentry is not configured
        return (err, req, res, next) => next(err);
    }

    // Use Sentry v8+ error handler with custom filtering
    return (err, req, res, next) => {
        // Only capture 5xx errors and unexpected 4xx errors
        const shouldCapture =
            (err.statusCode >= 500) ||
            (err.statusCode >= 400 && ![400, 401, 403, 404].includes(err.statusCode));

        if (shouldCapture) {
            Sentry.captureException(err, {
                extra: {
                    url: req.url,
                    method: req.method,
                    statusCode: err.statusCode,
                },
            });
        }
        next(err);
    };
};

/**
 * Setup Sentry Express error handler on the app.
 * Call this after all routes are defined.
 * @param {import('express').Express} app - Express application instance
 */
export const setupSentryErrorHandler = (app) => {
    if (process.env.SENTRY_DSN) {
        Sentry.setupExpressErrorHandler(app);
    }
};

export { Sentry };
export default Sentry;
