/**
 * @fileoverview Sentry helper utilities for AI/LLM monitoring.
 * Provides reusable functions for tracking AI operations, token usage,
 * and capturing errors with rich context.
 * @module utils/sentryHelpers
 */

import * as Sentry from '@sentry/node';

/**
 * Records token usage metrics on a Sentry span.
 * @param {Object} span - Sentry span object
 * @param {number} inputTokens - Number of input/prompt tokens
 * @param {number} outputTokens - Number of output/completion tokens
 */
export const recordTokenUsage = (span, inputTokens, outputTokens) => {
    if (span) {
        span.setAttribute('gen_ai.usage.input_tokens', inputTokens);
        span.setAttribute('gen_ai.usage.output_tokens', outputTokens);
        span.setAttribute('gen_ai.usage.total_tokens', inputTokens + outputTokens);
    }
};

/**
 * Captures an AI pipeline error with full context.
 * @param {Error} error - The error object
 * @param {Object} context - Additional context
 * @param {string} context.model - AI model identifier
 * @param {string} context.operation - Operation type (chat, summarization, etc.)
 * @param {boolean} [context.isCritical=false] - Whether this is a critical failure
 */
export const captureAIError = (error, context) => {
    Sentry.captureException(error, {
        tags: {
            type: 'ai_pipeline_error',
            model: context.model || 'unknown',
            operation: context.operation || 'unknown',
        },
        extra: {
            ...context,
            timestamp: new Date().toISOString(),
        },
        level: context.isCritical ? 'fatal' : 'error',
    });
};

/**
 * Adds a breadcrumb for AI pipeline flow tracking.
 * @param {string} message - Breadcrumb message
 * @param {Object} data - Additional data to attach
 * @param {string} [level='info'] - Log level (info, warning, error)
 */
export const addAIBreadcrumb = (message, data, level = 'info') => {
    Sentry.addBreadcrumb({
        category: 'ai.pipeline',
        message,
        level,
        data,
    });
};

/**
 * Captures a rate limiting event with context.
 * @param {string} model - The model that was rate limited
 * @param {string} [retryAfter] - Retry-after header value if available
 */
export const captureRateLimitEvent = (model, retryAfter) => {
    Sentry.captureMessage('OpenRouter API Rate Limited', {
        level: 'warning',
        tags: {
            service: 'openrouter',
            error_type: 'rate_limit',
            model,
        },
        extra: {
            model,
            retry_after: retryAfter || 'not provided',
            timestamp: new Date().toISOString(),
        },
    });
};

/**
 * Captures a slow API response warning.
 * @param {string} model - AI model identifier
 * @param {number} duration - Response time in milliseconds
 * @param {number} threshold - Threshold that was exceeded
 */
export const captureSlowResponse = (model, duration, threshold) => {
    Sentry.captureMessage('Slow AI API response detected', {
        level: 'warning',
        tags: {
            service: 'openrouter',
            model,
        },
        extra: {
            duration_ms: duration,
            threshold_ms: threshold,
            exceeded_by_ms: duration - threshold,
        },
    });
};

/**
 * Sets job context for BullMQ worker operations.
 * @param {Object} job - BullMQ job object
 * @param {string} queueName - Name of the queue
 */
export const setJobContext = (job, queueName) => {
    Sentry.setContext('bullmq_job', {
        jobId: job.id,
        queueName,
        attemptsMade: job.attemptsMade,
        timestamp: job.timestamp,
    });
};

/**
 * Captures a job failure with full context.
 * @param {Error} error - The error that caused the failure
 * @param {Object} job - BullMQ job object
 * @param {string} workerName - Name of the worker
 * @param {Object} [additionalContext={}] - Additional context to include
 */
export const captureJobFailure = (error, job, workerName, additionalContext = {}) => {
    const isFinalFailure = job.attemptsMade >= 3;

    Sentry.captureException(error, {
        tags: {
            worker: workerName,
            job_stage: isFinalFailure ? 'final_failure' : 'retry_pending',
        },
        extra: {
            jobId: job.id,
            attempts: job.attemptsMade,
            maxAttempts: 3,
            ...additionalContext,
        },
        level: isFinalFailure ? 'error' : 'warning',
    });
};

/**
 * Captures all models exhausted error for summarization.
 * @param {Error} error - The last error from the fallback chain
 * @param {Object} context - Context about the summarization attempt
 * @param {string[]} context.attemptedModels - List of models that were tried
 * @param {Object[]} context.attemptResults - Results of each attempt
 * @param {string} [context.videoTitle] - Title of the video being summarized
 * @param {number} [context.transcriptLength] - Length of the transcript
 */
export const captureAllModelsExhausted = (error, context) => {
    Sentry.captureException(error, {
        tags: {
            type: 'ai_all_models_failed',
            operation: 'summarization',
        },
        extra: {
            attemptedModels: context.attemptedModels,
            attemptResults: context.attemptResults,
            videoTitle: context.videoTitle,
            transcriptLength: context.transcriptLength,
            timestamp: new Date().toISOString(),
        },
        level: 'fatal',
    });
};

export { Sentry };
