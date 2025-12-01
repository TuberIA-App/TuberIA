import express from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../config/redis.js';

const router = express.Router();

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