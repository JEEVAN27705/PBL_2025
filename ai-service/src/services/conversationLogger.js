// src/services/conversationLogger.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const redactPII = (text) => {
    if (!text) return text;

    // Remove emails
    let out = text.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '[REDACTED_EMAIL]');

    // Remove phone numbers (basic patterns)
    out = out.replace(/(\+?\d[\d\s-]{6,}\d)/g, '[REDACTED_PHONE]');

    return out;
};

export const logConversation = async ({ query, detectedLanguage, intent, response, confidence = null, sessionId = null }) => {
    try {
        const date = new Date();
        const fileName = `conversations-${date.toISOString().slice(0,10)}.log`;
        const filePath = path.join(logsDir, fileName);

        const entry = {
            timestamp: date.toISOString(),
            sessionId: sessionId || null,
            query: redactPII(query),
            detectedLanguage,
            intent,
            response: redactPII(response),
            confidence
        };

        await fs.promises.appendFile(filePath, JSON.stringify(entry) + '\n');
        logger.info('Conversation logged', { file: fileName });
    } catch (error) {
        logger.error('Failed to write conversation log', { error: error.message });
    }
};

export const exportLogs = async (dateString) => {
    try {
        const fileName = `conversations-${dateString}.log`;
        const filePath = path.join(logsDir, fileName);

        if (!fs.existsSync(filePath)) return null;

        const data = await fs.promises.readFile(filePath, 'utf-8');
        // return array of JSON objects
        return data.split('\n').filter(Boolean).map(line => {
            try { return JSON.parse(line); } catch (e) { return null; }
        }).filter(Boolean);
    } catch (error) {
        logger.error('Failed to export logs', { error: error.message });
        return null;
    }
};

export default { logConversation, exportLogs };
