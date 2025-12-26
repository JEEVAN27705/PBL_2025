// src/services/translationService.js
import { Translate } from '@google-cloud/translate/build/src/v2/index.js';
import logger from '../utils/logger.js';
import { TranslationError } from '../utils/errorHandler.js';

// Language code mapping
const SUPPORTED_LANGUAGES = {
    en: 'English',
    hi: 'Hindi',
    mr: 'Marathi',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    es: 'Spanish',
    fr: 'French',
    de: 'German'
};

/**
 * Simple language detection based on character sets
 * Fallback for when Google Translate is not configured
 */
const detectLanguageSimple = (text) => {
    // Hindi detection (Devanagari script)
    // Marathi detection heuristics: check for common Marathi words
    const lower = text.toLowerCase();
    const marathiHints = ['आहे', 'कसा', 'कशी', 'करा', 'कृपया', 'नवीन', 'विद्यार्थी'];
    for (const w of marathiHints) {
        if (lower.includes(w)) return 'mr';
    }

    // Devanagari script - used by Hindi/Marathi; fallback to Hindi if not Marathi
    if (/[\u0900-\u097F]/.test(text)) return 'hi';

    // Spanish detection (basic)
    if (/[áéíóúñ¿¡]/i.test(text)) return 'es';

    // French detection (basic)
    if (/[àâäçèéêëîïôùûü]/i.test(text)) return 'fr';

    // German detection (basic)
    if (/[äöüß]/i.test(text)) return 'de';

    // Tamil (Tamil Unicode block)
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';

    // Telugu (Telugu Unicode block)
    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';

    // Kannada (Kannada Unicode block)
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';

    // Default to English
    return 'en';
};

/**
 * Detect the language of input text
 * @param {string} text - Text to detect language for
 * @returns {Promise<string>} - Detected language code
 */
export const detectLanguage = async (text) => {
    try {
        // Use simple detection as primary method
        const detectedLang = detectLanguageSimple(text);
        logger.info(`Language detected: ${detectedLang} (${SUPPORTED_LANGUAGES[detectedLang]})`);
        return detectedLang;
    } catch (error) {
        logger.warn('Language detection failed, defaulting to English:', {
            error: error.message
        });
        return 'en';
    }
};

/**
 * Simple translation fallback using dictionary approach
 * For production, use Google Translate API
 */
const translateSimple = async (text, targetLang) => {
    // This is a placeholder - in production you would use a real translation API
    // For now, we'll just return the original text with a note
    logger.warn('Using fallback translation (text returned as-is)');
    return text;
};

/**
 * Translate text to target language
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code
 * @param {string} sourceLang - Source language code (optional)
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLang, sourceLang = null) => {
    try {
        // If target is English or same as source, no translation needed
        if (targetLang === 'en' || targetLang === sourceLang) {
            return text;
        }

        // Check if we have Google Cloud credentials
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            try {
                const translate = new Translate();
                const [translation] = await translate.translate(text, {
                    from: sourceLang || 'en',
                    to: targetLang
                });

                logger.info(`Translated text to ${targetLang}`);
                return translation;
            } catch (error) {
                logger.warn('Google Translate API failed, using fallback:', {
                    error: error.message
                });
                return translateSimple(text, targetLang);
            }
        } else {
            // Use simple translation fallback
            return translateSimple(text, targetLang);
        }
    } catch (error) {
        logger.error('Translation failed:', {
            targetLang,
            error: error.message
        });
        throw new TranslationError(`Translation to ${targetLang} failed`);
    }
};

/**
 * Get supported languages
 * @returns {Object} - Supported languages mapping
 */
export const getSupportedLanguages = () => {
    return SUPPORTED_LANGUAGES;
};

/**
 * Check if language is supported
 * @param {string} langCode - Language code to check
 * @returns {boolean} - Whether language is supported
 */
export const isLanguageSupported = (langCode) => {
    return langCode in SUPPORTED_LANGUAGES;
};

export default {
    detectLanguage,
    translateText,
    getSupportedLanguages,
    isLanguageSupported
};
