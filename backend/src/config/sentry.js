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

    // Add Sentry request handler as first middleware
    app.use(Sentry.Handlers.requestHandler());
};

/**
 * Sentry error handler middleware.
 * Must be added after all routes but before other error handlers.
 * Automatically captures unhandled errors and attaches request context.
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
        // Capture all 5xx errors and unexpected 4xx errors
        if (error.statusCode >= 500) {
            return true;
        }
        // Also capture 4xx errors that aren't validation (400) or auth (401, 403)
        if (error.statusCode >= 400 && ![400, 401, 403, 404].includes(error.statusCode)) {
            return true;
        }
        return false;
    },
});

export { Sentry };
export default Sentry;
