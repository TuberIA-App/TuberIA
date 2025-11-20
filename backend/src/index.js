import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables FIRST (before any other imports that use them)
dotenv.config();

// Import secrets (this validates secrets are loaded correctly)
import './config/secrets.js';

import app from './app.js';
import logger from './utils/logger.js';
import { validateEnv } from './config/env.js';

// Validate environment variables
try {
    validateEnv();
    logger.info('Enviroment variables validated successfully :)');
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

// Connect to MongoDb
mongoose.connect(MONGODB_URI, mongoOptions)
    .then(() => {
        logger.info('MongoDB connected successfully');
        logger.info(`Database: ${mongoose.connection.name}`)

        // start server
        const server = app.listen(PORT, () => {
            logger.info(`- Server running on port ${PORT}`);
            logger.info(`- Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`- API available at http://localhost:${PORT}/api`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM signal received: closing HTTP server');
            server.close(() => {
                logger.info('HTTP Server Closed');
                mongoose.connection.close(false, () => {
                    logger.info('MongoDB connection closed');
                    process.exit(0);
                });
            });
        });
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
