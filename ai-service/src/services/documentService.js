// src/services/documentService.js
import mongoose from 'mongoose';
import path from 'path';
import DocumentIndex from '../models/DocumentIndex.js';
import { extractTextFromPDF, chunkText, validatePDF } from '../utils/pdfParser.js';
import logger from '../utils/logger.js';
import { DocumentNotFoundError, DatabaseError } from '../utils/errorHandler.js';

// Import VerifiedUpload model from main server
const VerifiedUpload = mongoose.model('VerifiedUpload', new mongoose.Schema({}, { strict: false }), 'verified_uploads');

/**
 * Get all verified documents
 * @returns {Promise<Array>} - List of verified documents
 */
export const getVerifiedDocuments = async () => {
    try {
        const documents = await VerifiedUpload.find({
            status: 'verified'
        }).select('title files verifyDept uploadedBy verifiedAt');

        logger.info(`Found ${documents.length} verified documents`);
        return documents;
    } catch (error) {
        logger.error('Failed to fetch verified documents:', error);
        throw new DatabaseError('Failed to fetch verified documents');
    }
};

/**
 * Index a single document
 * @param {Object} document - Verified upload document
 * @param {boolean} reindex - Whether to reindex if already indexed
 * @returns {Promise<Object>} - Indexing result
 */
export const indexDocument = async (document, reindex = false) => {
    try {
        logger.info(`Indexing document: ${document.title} (${document._id})`);

        // Check if already indexed
        if (!reindex) {
            const existing = await DocumentIndex.findOne({
                verifiedUploadId: document._id
            });

            if (existing) {
                logger.info(`Document already indexed: ${document.title}`);
                return {
                    success: true,
                    alreadyIndexed: true,
                    documentId: document._id
                };
            }
        } else {
            // Remove existing index
            await DocumentIndex.deleteMany({ verifiedUploadId: document._id });
        }

        // Process all files in the document
        let totalChunks = 0;
        const errors = [];

        for (const file of document.files) {
            try {
                // Construct file path (adjust based on your upload directory)
                const filePath = path.join(
                    process.cwd(),
                    '..',
                    'server',
                    'uploads',
                    file.filename
                );

                // Validate PDF
                const isValid = await validatePDF(filePath);
                if (!isValid) {
                    errors.push(`Invalid PDF: ${file.originalName}`);
                    continue;
                }

                // Extract text
                const text = await extractTextFromPDF(filePath);

                // Chunk text
                const chunks = chunkText(
                    text,
                    parseInt(process.env.CHUNK_SIZE) || 1000,
                    parseInt(process.env.CHUNK_OVERLAP) || 200
                );

                // Save chunks to database
                const chunkDocuments = chunks.map(chunk => ({
                    verifiedUploadId: document._id,
                    documentTitle: document.title,
                    fileName: file.originalName,
                    department: document.verifyDept,
                    chunkIndex: chunk.index,
                    chunkText: chunk.text,
                    chunkStart: chunk.start,
                    chunkEnd: chunk.end,
                    totalChunks: chunks.length,
                    indexedAt: new Date()
                }));

                await DocumentIndex.insertMany(chunkDocuments);
                totalChunks += chunks.length;

                logger.info(`Indexed ${chunks.length} chunks from ${file.originalName}`);
            } catch (error) {
                logger.error(`Failed to process file: ${file.originalName}`, {
                    error: error.message
                });
                errors.push(`Failed to process ${file.originalName}: ${error.message}`);
            }
        }

        return {
            success: totalChunks > 0,
            documentId: document._id,
            documentTitle: document.title,
            totalChunks,
            errors: errors.length > 0 ? errors : undefined
        };
    } catch (error) {
        logger.error(`Failed to index document: ${document.title}`, {
            error: error.message
        });
        throw error;
    }
};

/**
 * Index multiple documents
 * @param {Array<string>} documentIds - Array of document IDs to index
 * @param {boolean} reindex - Whether to reindex if already indexed
 * @returns {Promise<Object>} - Indexing results
 */
export const indexDocuments = async (documentIds = null, reindex = false) => {
    try {
        let query = { status: 'verified' };

        if (documentIds && documentIds.length > 0) {
            query._id = { $in: documentIds };
        }

        const documents = await VerifiedUpload.find(query);

        if (documents.length === 0) {
            throw new DocumentNotFoundError('No verified documents found to index');
        }

        logger.info(`Starting to index ${documents.length} documents`);

        const results = [];
        for (const doc of documents) {
            const result = await indexDocument(doc, reindex);
            results.push(result);
        }

        const successCount = results.filter(r => r.success).length;
        const totalChunks = results.reduce((sum, r) => sum + (r.totalChunks || 0), 0);

        logger.info(`Indexing complete: ${successCount}/${documents.length} documents, ${totalChunks} total chunks`);

        return {
            success: true,
            totalDocuments: documents.length,
            successfullyIndexed: successCount,
            totalChunks,
            results
        };
    } catch (error) {
        logger.error('Failed to index documents:', error);
        throw error;
    }
};

/**
 * Search for relevant document chunks
 * @param {string} query - Search query
 * @param {number} maxResults - Maximum number of results
 * @returns {Promise<Array>} - Relevant document chunks
 */
export const searchDocuments = async (query, maxResults = 5) => {
    try {
        logger.info(`Searching documents for: "${query}"`);

        // Use MongoDB text search
        const results = await DocumentIndex.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(maxResults)
            .lean();

        logger.info(`Found ${results.length} relevant chunks`);

        return results;
    } catch (error) {
        logger.error('Document search failed:', error);

        // Fallback to regex search if text search fails
        logger.warn('Falling back to regex search');
        const results = await DocumentIndex.find({
            chunkText: { $regex: query, $options: 'i' }
        })
            .limit(maxResults)
            .lean();

        return results;
    }
};

/**
 * Get index statistics
 * @returns {Promise<Object>} - Index statistics
 */
export const getIndexStats = async () => {
    try {
        const totalChunks = await DocumentIndex.countDocuments();
        const uniqueDocuments = await DocumentIndex.distinct('verifiedUploadId');
        const departments = await DocumentIndex.distinct('department');

        const stats = {
            totalChunks,
            uniqueDocuments: uniqueDocuments.length,
            departments,
            lastIndexed: await DocumentIndex.findOne()
                .sort({ indexedAt: -1 })
                .select('indexedAt')
                .lean()
        };

        logger.info('Retrieved index statistics', stats);
        return stats;
    } catch (error) {
        logger.error('Failed to get index stats:', error);
        throw new DatabaseError('Failed to retrieve index statistics');
    }
};

export default {
    getVerifiedDocuments,
    indexDocument,
    indexDocuments,
    searchDocuments,
    getIndexStats
};
