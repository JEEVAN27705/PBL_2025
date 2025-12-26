// src/utils/errorHandler.js
import logger from './logger.js';

/**
 * Custom Error Classes
 */
export class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

export class DocumentNotFoundError extends AppError {
    constructor(message = 'No relevant documents found') {
        super(message, 404);
        this.name = 'DocumentNotFoundError';
    }
}

export class AIServiceError extends AppError {
    constructor(message = 'AI service error occurred') {
        super(message, 503);
        this.name = 'AIServiceError';
    }
}

export class TranslationError extends AppError {
    constructor(message = 'Translation service error') {
        super(message, 503);
        this.name = 'TranslationError';
    }
}

export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed') {
        super(message, 500);
        this.name = 'DatabaseError';
    }
}

/**
 * Error Handler Utility Functions
 */
export const handleError = (error) => {
    if (error.isOperational) {
        logger.error('Operational Error:', {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            stack: error.stack
        });
    } else {
        logger.error('Programming Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Retry utility for AI API calls
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            logger.warn(`Retry attempt ${i + 1}/${maxRetries} after error:`, {
                error: error.message
            });

            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
    }
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = (str, fallback = null) => {
    try {
        return JSON.parse(str);
    } catch (error) {
        logger.warn('JSON parse failed:', { error: error.message });
        return fallback;
    }
};

export default {
    AppError,
    ValidationError,
    DocumentNotFoundError,
    AIServiceError,
    TranslationError,
    DatabaseError,
    handleError,
    asyncHandler,
    retryOperation,
    safeJsonParse
};
