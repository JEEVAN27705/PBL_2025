// src/server.js
import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { initializeAI } from './services/aiService.js';
import logger from './utils/logger.js';
import DocumentIndex from './models/DocumentIndex.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

/**
 * Start the server
 */
const startServer = async () => {
    try {
        logger.info('🚀 Starting AI/NLP Query Service...');

        // Connect to database
        await connectDatabase();

        // Initialize AI service
        initializeAI();

        // Ensure a text index exists on chunkText to make searches fast
        try {
            DocumentIndex.collection.createIndex({ chunkText: 'text' }, { name: 'chunkText_text' })
                .then(() => logger.info('Ensured text index on DocumentIndex.chunkText'))
                .catch(err => logger.warn('Could not create text index on DocumentIndex.chunkText', { error: err.message }));
        } catch (err) {
            logger.warn('Text index creation failed (non-fatal)', { error: err.message });
        }

        // Start Express server
        const server = app.listen(PORT, () => {
            logger.info(`✅ Server running on port ${PORT}`, {
                environment: process.env.NODE_ENV || 'development',
                port: PORT
            });

            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        AI/NLP Query Service - Successfully Started        ║
║                                                            ║
║  Server:    http://localhost:${PORT}                         ║
║  Health:    http://localhost:${PORT}/api/health              ║
║  API Docs:  See README.md                                  ║
║                                                            ║
║  Status:    ✅ Database Connected                          ║
║             ✅ AI Service Initialized                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
            `);
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`Port ${PORT} is already in use`);
                process.exit(1);
            } else {
                logger.error('Server error:', error);
                process.exit(1);
            }
        });

    } catch (error) {
        logger.error('Failed to start server:', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
};

// Start the server
startServer();
