/**
 * @fileoverview Health check routes for monitoring and load balancers.
 * Provides endpoints to check API, database, and cache health status.
 * @module routes/health
 *
 * @description
 * Available routes:
 * - GET /health - System health check (public)
 */

import express from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis.js';

/**
 * Express router for health check endpoints.
 * @type {import('express').Router}
 */
const router = express.Router();

/**
 * Liveness probe. Answers exactly one question: can this process serve HTTP?
 * It performs no I/O and asserts nothing about MongoDB or Redis.
 *
 * This is what the container HEALTHCHECK polls. A liveness probe that also
 * checked dependencies would mark the backend unhealthy during any transient
 * Redis blip - and because other services declare
 * `depends_on: backend: {condition: service_healthy}`, a single blip would
 * cascade into a wedged deploy. Dependency assertions belong in the readiness
 * probe below, which the deploy script polls as its release gate.
 *
 * @route GET /health/live
 * @access Public
 * @returns {Object} Always {status: 'alive'} with HTTP 200.
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * Readiness probe: reports the status of every dependency.
 * Returns 200 if all services are healthy, 503 if any is not.
 * @route GET /health
 * @access Public
 * @returns {Object} Health status with timestamp and service statuses
 * @example
 * // Response when healthy:
 * {
 *   "status": "ok",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "services": {
 *     "api": "healthy",
 *     "mongodb": "healthy",
 *     "redis": "healthy"
 *   }
 * }
 */
/**
 * Milliseconds a dependency probe may take before it is declared unhealthy.
 * @constant {number}
 */
const PROBE_TIMEOUT_MS = 2000;

/**
 * Reject a promise that takes too long, instead of waiting for it forever.
 *
 * This is load-bearing for the Redis probe. The ioredis client is created with
 * `maxRetriesPerRequest: null` because BullMQ requires it, and that setting
 * makes commands queue INDEFINITELY while Redis is unreachable rather than
 * failing fast. Without this wrapper `await redisClient.ping()` simply never
 * settles, so GET /health never sends a response at all - the one situation
 * the endpoint exists to report. The deploy script polls /health as its
 * release gate, so a silent hang there reads as a failed deploy and triggers
 * an unnecessary rollback.
 *
 * @param {Promise} promise - The probe to bound.
 * @param {number} ms - Timeout in milliseconds.
 * @param {string} label - Name used in the timeout error.
 * @returns {Promise} Settles with the probe, or rejects on timeout.
 */
const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    // Do not keep the event loop alive purely for this timer.
    timer.unref?.();
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

router.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      mongodb: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
      redis: 'unknown'
    }
  };

  // Check Redis
  try {
    await withTimeout(redisClient.ping(), PROBE_TIMEOUT_MS, 'redis ping');
    health.services.redis = 'healthy';
  } catch {
    health.services.redis = 'unhealthy';
    health.status = 'degraded';
  }

  // Overall status
  const allHealthy = Object.values(health.services).every(
    s => s === 'healthy'
  );

  if (!allHealthy) {
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;