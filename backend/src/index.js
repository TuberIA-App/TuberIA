import dotenv from 'dotenv';

// Load environment variables FIRST (before any other imports that use them)
dotenv.config();

// Import secrets (this validates secrets are loaded correctly)
import './config/secrets.js';

import mongoose from 'mongoose';
import app from './app.js';
import logger from './utils/logger.js';
import { validateEnv } from './config/env.js';
import { redisConnection, redisClient } from './config/redis.js';
import transcriptionWorker from './workers/transcription.worker.js';
import summarizationWorker from './workers/summarization.worker.js';

// Make Redis clients globally available
global.redisConnection = redisConnection;
global.redisClient = redisClient;

// Validate environment variables
try {
    validateEnv();
    logger.info('Environment variables validated successfully :)');
} catch (error) {
    logger.error('Environment validation failed', { error: error.message });
    process.exit(1);
}

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// MongoDB connection options
const mongoOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
}

// Connect to MongoDB
mongoose.connect(MONGODB_URI, mongoOptions)
    .then(() => {
        logger.info('MongoDB connected successfully');
        logger.info(`Database: ${mongoose.connection.name}`)

        // Start server
        const server = app.listen(PORT, () => {
            logger.info(`- Server running on port ${PORT}`);
            logger.info(`- Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`- API available at http://localhost:${PORT}/api`);
        });

        // Workers start automatically when imported
        transcriptionWorker.on('ready', () => {
            logger.info('Transcription worker ready and listening');
        });

        summarizationWorker.on('ready', () => {
            logger.info('Summarization worker ready and listening');
        });

        // Graceful shutdown
        const gracefulShutdown = async (signal) => {
            logger.info(`${signal} signal received: closing HTTP server`);

            server.close(async () => {
                logger.info('HTTP Server Closed');

                try {
                    // Close BullMQ workers first (finish current jobs)
                    await transcriptionWorker.close();
                    await summarizationWorker.close();
                    logger.info('Workers closed');

                    await mongoose.connection.close();
                    logger.info('MongoDB connection closed');

                    // Close Redis connections
                    // Use disconnect() instead of quit() to avoid EPIPE errors
                    // disconnect() is immediate, quit() waits for pending commands
                    if (redisConnection.status === 'ready' || redisConnection.status === 'connecting') {
                        await redisConnection.disconnect();
                        logger.info('Redis connection (BullMQ) closed');
                    }
                    if (redisClient.status === 'ready' || redisClient.status === 'connecting') {
                        await redisClient.disconnect();
                        logger.info('Redis client closed');
                    }

                    process.exit(0);
                } catch (error) {
                    logger.error('Error during graceful shutdown:', error.message);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    })
    .catch((error) => {
        logger.error('MongoDB connection failed', { error: error.message });
        process.exit(1);
    })

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! - Shutting down...', {
        error: err.message,
        stack: err.stack
    });
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! - Shutting down...', {
        error: err.message,
        stack: err.stack
    });
    process.exit(1);
});