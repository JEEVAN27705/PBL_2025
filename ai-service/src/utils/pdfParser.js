// src/utils/pdfParser.js
import pdf from 'pdf-parse';
import fs from 'fs/promises';
import logger from './logger.js';
import { AppError } from './errorHandler.js';

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        logger.info(`Extracting text from PDF: ${filePath}`);

        // Read PDF file
        const dataBuffer = await fs.readFile(filePath);

        // Parse PDF
        const data = await pdf(dataBuffer);

        // Extract and clean text
        const text = data.text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
            .trim();

        logger.info(`Successfully extracted ${text.length} characters from PDF`);

        if (text.length === 0) {
            throw new AppError('PDF appears to be empty or contains only images', 400);
        }

        return text;
    } catch (error) {
        logger.error('PDF extraction failed:', {
            filePath,
            error: error.message
        });

        if (error instanceof AppError) throw error;

        throw new AppError(
            `Failed to extract text from PDF: ${error.message}`,
            500
        );
    }
};

/**
 * Split text into chunks for processing
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Size of each chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {Array<Object>} - Array of text chunks with metadata
 */
export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
    const chunks = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        const chunk = text.slice(start, end);

        // Try to break at sentence boundary if possible
        let actualEnd = end;
        if (end < text.length) {
            const lastPeriod = chunk.lastIndexOf('.');
            const lastNewline = chunk.lastIndexOf('\n');
            const breakPoint = Math.max(lastPeriod, lastNewline);

            if (breakPoint > chunkSize * 0.7) {
                actualEnd = start + breakPoint + 1;
            }
        }

        chunks.push({
            index: chunkIndex,
            text: text.slice(start, actualEnd).trim(),
            start,
            end: actualEnd,
            length: actualEnd - start
        });

        start = actualEnd - overlap;
        chunkIndex++;
    }

    logger.info(`Split text into ${chunks.length} chunks`);
    return chunks;
};

/**
 * Extract metadata from PDF
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<Object>} - PDF metadata
 */
export const extractPDFMetadata = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);

        return {
            pages: data.numpages,
            info: data.info || {},
            version: data.version,
            textLength: data.text.length
        };
    } catch (error) {
        logger.error('Failed to extract PDF metadata:', {
            filePath,
            error: error.message
        });
        return null;
    }
};

/**
 * Validate PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<boolean>} - Whether PDF is valid
 */
export const validatePDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);

        // Check if file starts with PDF header
        const header = dataBuffer.slice(0, 5).toString();
        if (!header.startsWith('%PDF-')) {
            return false;
        }

        // Try to parse
        await pdf(dataBuffer);
        return true;
    } catch (error) {
        logger.warn('PDF validation failed:', {
            filePath,
            error: error.message
        });
        return false;
    }
};

export default {
    extractTextFromPDF,
    chunkText,
    extractPDFMetadata,
    validatePDF
};
