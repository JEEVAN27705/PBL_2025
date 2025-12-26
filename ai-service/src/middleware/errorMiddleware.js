// src/middleware/errorMiddleware.js
import logger from '../utils/logger.js';
import { AppError } from '../utils/errorHandler.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    // Log error
    logger.error('Error occurred:', {
        name: err.name,
        message: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Operational errors
    if (err instanceof AppError && err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                type: err.name,
                timestamp: err.timestamp
            }
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                type: 'ValidationError',
                details: Object.values(err.errors).map(e => e.message)
            }
        });
    }

    // Mongoose cast errors
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Invalid ID format',
                type: 'CastError'
            }
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                message: 'Invalid token',
                type: 'AuthenticationError'
            }
        });
    }

    // Default to 500 server error
    res.status(500).json({
        success: false,
        error: {
            message: process.env.NODE_ENV === 'development'
                ? err.message
                : 'An unexpected error occurred',
            type: 'InternalServerError',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

/**
 * 404 handler middleware
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.path} not found`,
            type: 'NotFoundError'
        }
    });
};

/**
 * Request logger middleware
 */
export const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log request
    logger.info('Incoming request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Log response
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.logRequest(req, res, duration);
    });

    next();
};

export default {
    errorHandler,
    notFoundHandler,
    requestLogger
};
