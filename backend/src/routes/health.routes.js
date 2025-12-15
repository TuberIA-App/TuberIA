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
 * Health check endpoint that returns the status of all services.
 * Returns 200 if all services healthy, 503 if any service is unhealthy.
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
    await redisClient.ping();
    health.services.redis = 'healthy';
  } catch (error) {
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