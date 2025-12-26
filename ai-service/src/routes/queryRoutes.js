// src/routes/queryRoutes.js
import express from 'express';
import { validate } from '../utils/validator.js';
import {
    handleQuery,
    handleIndexDocuments,
    handleGetStats,
    handleGetSuggestions,
    handleGetLanguages,
    handleHealthCheck
} from '../controllers/queryController.js';
import { handleExportLogs } from '../controllers/queryController.js';

const router = express.Router();

/**
 * Query endpoint
 * POST /api/query
 * Body: { query: string, language?: string, maxResults?: number }
 */
router.post('/query', validate('query'), handleQuery);

/**
 * Index documents endpoint
 * POST /api/index-documents
 * Body: { documentIds?: Array<string>, reindex?: boolean }
 */
router.post('/index-documents', handleIndexDocuments);

/**
 * Get statistics
 * GET /api/stats
 */
router.get('/stats', handleGetStats);

/**
 * Get query suggestions
 * GET /api/suggestions
 */
router.get('/suggestions', handleGetSuggestions);

/**
 * Get supported languages
 * GET /api/languages
 */
router.get('/languages', handleGetLanguages);

/**
 * Health check
 * GET /api/health
 */
router.get('/health', handleHealthCheck);

/**
 * Export conversation logs
 * GET /api/logs?date=YYYY-MM-DD
 */
router.get('/logs', handleExportLogs);

export default router;
