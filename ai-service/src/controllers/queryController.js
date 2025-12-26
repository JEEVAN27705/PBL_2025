// src/controllers/queryController.js
import { processQuery, getQuerySuggestions } from '../services/ragService.js';
import { indexDocuments, getIndexStats } from '../services/documentService.js';
import { getSupportedLanguages } from '../services/translationService.js';
import logger from '../utils/logger.js';
import { sanitizeInput } from '../utils/validator.js';
import conversationLogger from '../services/conversationLogger.js';

/**
 * Handle query requests
 * POST /api/query
 */
export const handleQuery = async (req, res, next) => {
    try {
        const { query, language = 'auto', maxResults = 5 } = req.validatedData;

        // Sanitize input
        const sanitizedQuery = sanitizeInput(query);

        // Process query
        const result = await processQuery(sanitizedQuery, language, maxResults);

        // Log query
        logger.info('Query processed', {
            query: sanitizedQuery.substring(0, 50),
            language: result.language,
            success: result.success,
            processingTime: result.processingTime
        });

        res.json({
            success: result.success,
            data: {
                answer: result.answer,
                sources: result.sources,
                language: result.language,
                confidence: result.confidence,
                metadata: result.metadata
            },
            processingTime: result.processingTime
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Index documents
 * POST /api/index-documents
 */
export const handleIndexDocuments = async (req, res, next) => {
    try {
        const { documentIds, reindex = false } = req.validatedData || {};

        logger.info('Starting document indexing', {
            documentIds: documentIds?.length || 'all',
            reindex
        });

        const result = await indexDocuments(documentIds, reindex);

        res.json({
            success: true,
            message: 'Documents indexed successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get service statistics
 * GET /api/stats
 */
export const handleGetStats = async (req, res, next) => {
    try {
        const stats = await getIndexStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get query suggestions
 * GET /api/suggestions
 */
export const handleGetSuggestions = async (req, res, next) => {
    try {
        const suggestions = await getQuerySuggestions(10);

        res.json({
            success: true,
            data: { suggestions }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get supported languages
 * GET /api/languages
 */
export const handleGetLanguages = async (req, res, next) => {
    try {
        const languages = getSupportedLanguages();

        res.json({
            success: true,
            data: { languages }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Health check
 * GET /api/health
 */
export const handleHealthCheck = async (req, res) => {
    const { checkDatabaseHealth } = await import('../config/database.js');
    const { checkAIHealth } = await import('../services/aiService.js');

    const dbHealth = checkDatabaseHealth();
    const aiHealth = checkAIHealth();

    const isHealthy = dbHealth && aiHealth;

    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        status: isHealthy ? 'healthy' : 'unhealthy',
        checks: {
            database: dbHealth ? 'connected' : 'disconnected',
            ai: aiHealth ? 'ready' : 'not ready'
        },
        timestamp: new Date().toISOString()
    });
};

export default {
    handleQuery,
    handleIndexDocuments,
    handleGetStats,
    handleGetSuggestions,
    handleGetLanguages,
    handleHealthCheck
};

/**
 * Export conversation logs for a given date
 * GET /api/logs?date=YYYY-MM-DD
 */
export const handleExportLogs = async (req, res, next) => {
    try {
        const date = req.query.date;
        if (!date) {
            return res.status(400).json({ success: false, message: 'Missing date parameter (YYYY-MM-DD)' });
        }

        const data = await conversationLogger.exportLogs(date);
        if (!data) {
            return res.status(404).json({ success: false, message: 'No logs found for the given date' });
        }

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
