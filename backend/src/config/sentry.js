/**
 * @fileoverview Sentry error tracking configuration for backend.
 * Integrates with Express for automatic error capture.
 * @module config/sentry
 */

import * as Sentry from '@sentry/node';

/**
 * Initialize Sentry for the backend application.
 * Only initializes when SENTRY_DSN environment variable is set.
 * @param {import('express').Express} app - Express application instance
 */
export const initSentry = (app) => {
    if (!process.env.SENTRY_DSN) {
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        beforeSend(event) {
            // Filter out sensitive data from headers
            if (event.request?.headers) {
                delete event.request.headers.authorization;
                delete event.request.headers.cookie;
            }
            return event;
        },
    });

    // Add Sentry request handler as first middleware
    app.use(Sentry.expressRequestHandler());
};

/**
 * Sentry error handler middleware.
 * Must be added after all routes but before other error handlers.
 */
export const sentryErrorHandler = Sentry.expressErrorHandler();

export default Sentry;
