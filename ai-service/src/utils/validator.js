// src/utils/validator.js
import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

/**
 * Validation Schemas
 */
const schemas = {
    query: Joi.object({
        query: Joi.string()
            .trim()
            .min(3)
            .max(parseInt(process.env.MAX_QUERY_LENGTH) || 500)
            .required()
            .messages({
                'string.empty': 'Query cannot be empty',
                'string.min': 'Query must be at least 3 characters long',
                'string.max': `Query must not exceed ${process.env.MAX_QUERY_LENGTH || 500} characters`,
                'any.required': 'Query is required'
            }),
        language: Joi.string()
            .valid('en', 'hi', 'mr', 'es', 'fr', 'de', 'auto')
            .default('auto')
            .messages({
                'any.only': 'Unsupported language. Supported: en, hi, mr, es, fr, de, auto'
            }),
        maxResults: Joi.number()
            .integer()
            .min(1)
            .max(10)
            .default(5)
    }),

    indexRequest: Joi.object({
        documentIds: Joi.array()
            .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/))
            .min(1)
            .messages({
                'array.min': 'At least one document ID is required',
                'string.pattern.base': 'Invalid document ID format'
            }),
        reindex: Joi.boolean().default(false)
    })
};

/**
 * Validate request data
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schemas[schema].validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            throw new ValidationError(
                `Validation failed: ${errors.map(e => e.message).join(', ')}`
            );
        }

        req.validatedData = value;
        next();
    };
};

/**
 * Sanitize user input to prevent injection attacks
 */
export const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;

    // Remove potential script tags and dangerous characters
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/[<>]/g, '')
        .trim();
};

/**
 * Validate MongoDB ObjectId
 */
export const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

export default {
    validate,
    sanitizeInput,
    isValidObjectId,
    schemas
};
