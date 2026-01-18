/**
 * @fileoverview Sentry error tracking and performance monitoring for frontend.
 * Provides error monitoring, session replay, and user identification.
 * @module config/sentry
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for the React frontend.
 * Only initializes when VITE_SENTRY_DSN environment variable is set.
 * Includes browser tracing, session replay, and performance monitoring.
 */
export const initSentry = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
        return;
    }

    Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_APP_VERSION || '1.0.0',

        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: false, // Show text for better debugging
                blockAllMedia: true,
                maskAllInputs: true, // Mask inputs for privacy (passwords, etc.)
            }),
        ],

        // Performance monitoring
        tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Filter out noise
        beforeSend(event) {
            // Ignore errors from browser extensions
            if (event.exception?.values?.[0]?.value?.includes('chrome-extension')) {
                return null;
            }
            if (event.exception?.values?.[0]?.value?.includes('moz-extension')) {
                return null;
            }
            // Ignore ResizeObserver errors (common in Chrome)
            if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
                return null;
            }
            return event;
        },

        // Ignore common non-actionable errors
        ignoreErrors: [
            'Non-Error promise rejection captured',
            'Network Error',
            'Request aborted',
            /^Loading chunk .* failed/,
        ],
    });
};

/**
 * Identify user in Sentry for error correlation.
 * Call this after successful login.
 * @param {Object|null} user - User object or null to clear
 * @param {string} user.id - User ID
 * @param {string} [user.email] - User email
 * @param {string} [user.username] - Username
 */
export const identifyUser = (user) => {
    if (!user) {
        Sentry.setUser(null);
        return;
    }

    Sentry.setUser({
        id: user.id || user._id,
        email: user.email,
        username: user.username,
    });
};

/**
 * Add a breadcrumb for tracking user actions.
 * @param {string} category - Category of the action (e.g., 'navigation', 'api', 'ui')
 * @param {string} message - Description of the action
 * @param {Object} [data] - Additional data to attach
 * @param {string} [level='info'] - Log level
 */
export const addBreadcrumb = (category, message, data = {}, level = 'info') => {
    Sentry.addBreadcrumb({
        category,
        message,
        level,
        data,
    });
};

/**
 * Track an API call for debugging context.
 * @param {string} endpoint - API endpoint called
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {number} duration - Request duration in ms
 * @param {number} status - HTTP status code
 */
export const trackAPICall = (endpoint, method, duration, status) => {
    Sentry.addBreadcrumb({
        category: 'api',
        message: `${method?.toUpperCase()} ${endpoint}`,
        level: status >= 400 ? 'error' : 'info',
        data: {
            duration: `${duration}ms`,
            status,
        },
    });
};

/**
 * Capture an error with additional context.
 * @param {Error} error - The error to capture
 * @param {Object} [context] - Additional context
 * @param {Object} [context.tags] - Tags for filtering
 * @param {Object} [context.extra] - Extra data to attach
 */
export const captureError = (error, context = {}) => {
    Sentry.captureException(error, {
        tags: context.tags,
        extra: context.extra,
    });
};

export { Sentry };
export default Sentry;
