// src/services/ragService.js
import { searchDocuments } from './documentService.js';
import { generateAnswer } from './aiService.js';
import { detectLanguage, translateText } from './translationService.js';
import logger from '../utils/logger.js';
import { DocumentNotFoundError } from '../utils/errorHandler.js';
import intentService from './intentService.js';
import conversationLogger from './conversationLogger.js';

/**
 * Process a query using RAG (Retrieval-Augmented Generation)
 * @param {string} query - User query
 * @param {string} language - Language code (auto, en, hi, etc.)
 * @param {number} maxResults - Maximum number of document chunks to retrieve
 * @returns {Promise<Object>} - Query response with answer and metadata
 */
export const processQuery = async (query, language = 'auto', maxResults = 5) => {
    const startTime = Date.now();

    try {
        logger.info('Processing RAG query', {
            query: query.substring(0, 100),
            language,
            maxResults
        });

        // Step 1: Detect language if auto
        let detectedLanguage = language;
        if (language === 'auto') {
            detectedLanguage = await detectLanguage(query);
            logger.info(`Auto-detected language: ${detectedLanguage}`);
        }

        // Step 2: Translate query to English if needed (for better document search)
        let searchQuery = query;
        if (detectedLanguage !== 'en') {
            try {
                searchQuery = await translateText(query, 'en', detectedLanguage);
                logger.info('Translated query to English for search');
            } catch (error) {
                logger.warn('Translation failed, using original query:', error);
                searchQuery = query;
            }
        }

        // Step 3: Retrieve relevant document chunks
        const relevantChunks = await searchDocuments(searchQuery, maxResults);

        if (!relevantChunks || relevantChunks.length === 0) {
            logger.warn('No relevant documents found for query');

            return {
                success: false,
                answer: detectedLanguage === 'en'
                    ? "I couldn't find any relevant information in the verified documents to answer your question. Please try rephrasing or asking about different topics covered in the documents."
                    : await translateText(
                        "I couldn't find any relevant information in the verified documents to answer your question. Please try rephrasing or asking about different topics covered in the documents.",
                        detectedLanguage,
                        'en'
                    ),
                sources: [],
                language: detectedLanguage,
                processingTime: Date.now() - startTime,
                noResults: true
            };
        }

        logger.info(`Retrieved ${relevantChunks.length} relevant chunks`);

        // Step 4: Generate answer using AI with retrieved context
        const aiResponse = await generateAnswer(searchQuery, relevantChunks);

        // Step 5: Translate answer back to user's language if needed
        let finalAnswer = aiResponse.answer;
        if (detectedLanguage !== 'en') {
            try {
                finalAnswer = await translateText(aiResponse.answer, detectedLanguage, 'en');
                logger.info(`Translated answer to ${detectedLanguage}`);
            } catch (error) {
                logger.warn('Failed to translate answer, returning English:', error);
            }
        }

        // Step 6: Detect intent and build response
        const intent = intentService.detectIntent(query);

        const response = {
            success: true,
            answer: finalAnswer,
            sources: aiResponse.sources,
            language: detectedLanguage,
            confidence: aiResponse.confidence,
            processingTime: Date.now() - startTime,
            metadata: {
                chunksRetrieved: relevantChunks.length,
                queryTranslated: detectedLanguage !== 'en',
                answerTranslated: detectedLanguage !== 'en',
                intent
            }
        };

        // Log conversation (PII redaction handled by logger)
        try {
            await conversationLogger.logConversation({
                query,
                detectedLanguage,
                intent,
                response: finalAnswer,
                confidence: aiResponse.confidence
            });
        } catch (e) {
            logger.warn('Conversation logging failed', { error: e.message });
        }

        logger.info('RAG query processed successfully', {
            processingTime: response.processingTime,
            language: detectedLanguage,
            chunksUsed: relevantChunks.length
        });

        return response;
    } catch (error) {
        logger.error('RAG query processing failed:', {
            query,
            error: error.message,
            stack: error.stack
        });

        // Return error response
        return {
            success: false,
            answer: "I apologize, but I encountered an error while processing your question. Please try again.",
            sources: [],
            language: language === 'auto' ? 'en' : language,
            processingTime: Date.now() - startTime,
            error: true,
            errorMessage: error.message
        };
    }
};

/**
 * Get query suggestions based on indexed documents
 * @param {number} limit - Maximum number of suggestions
 * @returns {Promise<Array<string>>} - Suggested queries
 */
export const getQuerySuggestions = async (limit = 5) => {
    try {
        // This is a simple implementation - can be enhanced with more sophisticated methods
        const suggestions = [
            "What is the 7 states model of process?",
            "Explain the account verification process",
            "What are the HR policies?",
            "Tell me about legal compliance requirements",
            "How do I submit an exam application?"
        ];

        return suggestions.slice(0, limit);
    } catch (error) {
        logger.error('Failed to get query suggestions:', error);
        return [];
    }
};

/**
 * Validate query before processing
 * @param {string} query - Query to validate
 * @returns {Object} - Validation result
 */
export const validateQuery = (query) => {
    const errors = [];

    if (!query || query.trim().length === 0) {
        errors.push('Query cannot be empty');
    }

    if (query.length < 3) {
        errors.push('Query must be at least 3 characters long');
    }

    if (query.length > (parseInt(process.env.MAX_QUERY_LENGTH) || 500)) {
        errors.push(`Query must not exceed ${process.env.MAX_QUERY_LENGTH || 500} characters`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export default {
    processQuery,
    getQuerySuggestions,
    validateQuery
};
