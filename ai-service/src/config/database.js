// src/config/database.js
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { DatabaseError } from '../utils/errorHandler.js';

/**
 * Connect to MongoDB
 */
export const connectDatabase = async () => {
    try {
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        };

        await mongoose.connect(process.env.MONGODB_URI, options);

        logger.info('✅ MongoDB connected successfully', {
            database: mongoose.connection.name,
            host: mongoose.connection.host
        });

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('MongoDB reconnected');
        });

    } catch (error) {
        logger.error('Failed to connect to MongoDB:', {
            error: error.message,
            uri: process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@') // Hide credentials
        });
        throw new DatabaseError(`Database connection failed: ${error.message}`);
    }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async () => {
    try {
        await mongoose.disconnect();
        logger.info('MongoDB disconnected');
    } catch (error) {
        logger.error('Error disconnecting from MongoDB:', error);
    }
};

/**
 * Check database connection health
 */
export const checkDatabaseHealth = () => {
    return mongoose.connection.readyState === 1;
};

export default {
    connectDatabase,
    disconnectDatabase,
    checkDatabaseHealth
};
