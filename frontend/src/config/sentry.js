/**
 * @fileoverview Sentry error tracking configuration for frontend.
 * Provides error monitoring and performance tracing for React application.
 * @module config/sentry
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for the React frontend.
 * Only initializes when VITE_SENTRY_DSN environment variable is set.
 */
export const initSentry = () => {
    const dsn = import.meta.env.VITE_SENTRY_DSN;

    if (!dsn) {
        return;
    }

    Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
    });
};

export default Sentry;
