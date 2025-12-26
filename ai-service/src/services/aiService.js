// src/services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../utils/logger.js';
import { AIServiceError, retryOperation } from '../utils/errorHandler.js';

let genAI = null;
let model = null;

/**
 * Initialize Google Generative AI
 */
export const initializeAI = () => {
    try {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('GOOGLE_API_KEY not found in environment variables');
        }

        genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

        // Allow overriding the model via env var. Use a conservative default
        // that is commonly available for text generation on Google Generative API.
        const selectedModel = process.env.GOOGLE_MODEL || 'models/text-bison';
        model = genAI.getGenerativeModel({ model: selectedModel });

        logger.info('✅ Google Generative AI initialized successfully', { model: selectedModel });
    } catch (error) {
        logger.error('Failed to initialize AI service:', {
            error: error.message
        });
        throw new AIServiceError(`AI initialization failed: ${error.message}`);
    }
};

/**
 * Generate answer using AI model with context
 * @param {string} query - User query
 * @param {Array<Object>} relevantChunks - Relevant document chunks
 * @returns {Promise<Object>} - AI response with answer and metadata
 */
export const generateAnswer = async (query, relevantChunks) => {
    try {
        // If FORCE_EXTRACTIVE is enabled or model is not available, use an
        // extractive document-only answer generator (no external LLM calls).
        if (process.env.FORCE_EXTRACTIVE === 'true' || !model) {
            logger.info('Using extractive document-only answer mode');
            return extractiveAnswer(query, relevantChunks);
        }

        // Build context from relevant chunks
        const context = relevantChunks
            .map((chunk, idx) => {
                return `[Document ${idx + 1}: ${chunk.documentTitle}]\n${chunk.chunkText}`;
            })
            .join('\n\n---\n\n');

        // Create prompt
        const prompt = buildPrompt(query, context);

        logger.info('Generating AI response', {
            queryLength: query.length,
            contextLength: context.length,
            numChunks: relevantChunks.length
        });

        // Generate response with retry logic
        const result = await retryOperation(async () => {
            return await model.generateContent(prompt);
        }, 3, 1000);

        const response = await result.response;
        const answer = response.text();

        logger.info('AI response generated successfully', {
            answerLength: answer.length
        });

        return {
            answer: answer.trim(),
            sources: relevantChunks.map(chunk => ({
                documentTitle: chunk.documentTitle,
                department: chunk.department,
                chunkIndex: chunk.chunkIndex
            })),
            confidence: estimateConfidence(answer, context)
        };
    } catch (error) {
        logger.error('AI generation failed:', {
            query,
            error: error.message
        });

        // Return fallback response
        return {
            answer: "I apologize, but I'm having trouble generating a response at the moment. Please try again or rephrase your question.",
            sources: relevantChunks.map(chunk => ({
                documentTitle: chunk.documentTitle,
                department: chunk.department
            })),
            confidence: 0,
            error: true
        };
    }
};

/**
 * Extractive answer generator: selects sentences from the retrieved chunks
 * that match query keywords and returns them with source attributions.
 * This mode guarantees answers only come from verified documents.
 */
const extractiveAnswer = (query, relevantChunks) => {
    const q = (query || '').toLowerCase();
    const qTokens = q.split(/\W+/).filter(Boolean);

    const candidates = [];

    for (const chunk of relevantChunks) {
        const text = chunk.chunkText || '';
        // Split into sentences (simple heuristic)
        const sentences = text.split(/(?<=[.?!\n])\s+/);

        sentences.forEach((s) => {
            const lower = s.toLowerCase();
            let score = 0;

            // boost for exact phrase
            if (q.length > 3 && lower.includes(q)) score += 5;

            // count token matches
            for (const t of qTokens) {
                if (t.length < 2) continue;
                if (lower.includes(t)) score += 1;
            }

            if (score > 0) {
                candidates.push({
                    score,
                    sentence: s.trim(),
                    documentTitle: chunk.documentTitle,
                    department: chunk.department,
                    chunkIndex: chunk.chunkIndex
                });
            }
        });
    }

    // Sort candidates by score and take top 5 unique sentences
    candidates.sort((a, b) => b.score - a.score);

    const used = new Set();
    const top = [];
    for (const c of candidates) {
        if (top.length >= 5) break;
        const key = `${c.documentTitle}::${c.sentence.slice(0, 120)}`;
        if (used.has(key)) continue;
        used.add(key);
        top.push(c);
    }

    if (top.length === 0) {
        return {
            answer: "I don't have enough information in the verified documents to answer this question",
            sources: [],
            confidence: 0.2
        };
    }

    // Build a concise answer from selected sentences with citations
    const pieces = top.map((t) => `${t.sentence} (Source: ${t.documentTitle})`);
    const answer = `Based only on the verified documents:\n${pieces.join('\n')}`;

    // Confidence heuristic
    const confidence = Math.min(0.9, 0.4 + Math.min(0.5, top[0].score / 10));

    return {
        answer,
        sources: top.map(t => ({ documentTitle: t.documentTitle, department: t.department, chunkIndex: t.chunkIndex })),
        confidence
    };
};

/**
 * Build prompt for AI model
 * @param {string} query - User query
 * @param {string} context - Document context
 * @returns {string} - Formatted prompt
 */
const buildPrompt = (query, context) => {
    return `You are an intelligent assistant helping students by answering questions based ONLY on the provided verified documents.

IMPORTANT INSTRUCTIONS:
1. Answer the question using ONLY information from the documents provided below
2. If the answer is not in the documents, clearly state "I don't have enough information in the verified documents to answer this question"
3. Be concise but informative
4. Cite which document you're referencing when possible
5. If multiple documents have relevant information, synthesize them
6. Do not make up information or use external knowledge

VERIFIED DOCUMENTS:
${context}

STUDENT QUESTION:
${query}

ANSWER:`;
};

/**
 * Estimate confidence in the answer
 * @param {string} answer - Generated answer
 * @param {string} context - Context used
 * @returns {number} - Confidence score (0-1)
 */
const estimateConfidence = (answer, context) => {
    // Simple heuristic - can be improved with more sophisticated methods
    if (answer.toLowerCase().includes("don't have enough information")) {
        return 0.2;
    }

    if (answer.toLowerCase().includes("based on the document")) {
        return 0.9;
    }

    if (context.length > 1000 && answer.length > 100) {
        return 0.8;
    }

    return 0.6;
};

/**
 * Generate embeddings for text (placeholder for future implementation)
 * @param {string} text - Text to generate embeddings for
 * @returns {Promise<Array<number>>} - Embedding vector
 */
export const generateEmbeddings = async (text) => {
    // Placeholder - can be implemented using Google's embedding models
    // or other embedding services
    logger.warn('Embeddings generation not implemented, using text search instead');
    return null;
};

/**
 * Check if AI service is healthy
 * @returns {boolean} - Health status
 */
export const checkAIHealth = () => {
    return model !== null && genAI !== null;
};

export default {
    initializeAI,
    generateAnswer,
    generateEmbeddings,
    checkAIHealth
};
