// src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import queryRoutes from './routes/queryRoutes.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 20,
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later',
            type: 'RateLimitError'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'AI/NLP Query Service - PBL 2025',
        version: '1.0.0',
        endpoints: {
            query: 'POST /api/query',
            indexDocuments: 'POST /api/index-documents',
            stats: 'GET /api/stats',
            suggestions: 'GET /api/suggestions',
            languages: 'GET /api/languages',
            health: 'GET /api/health'
        },
        documentation: 'See README.md for detailed documentation'
    });
});

// API routes
app.use('/api', queryRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', {
        promise,
        reason: reason.stack || reason
    });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack
    });
    process.exit(1);
});

export default app;
