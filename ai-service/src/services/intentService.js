// src/services/intentService.js
import logger from '../utils/logger.js';

// Simple rule-based intent classifier for campus topics
export const detectIntent = (text) => {
    if (!text || text.trim().length === 0) return 'unknown';

    const t = text.toLowerCase();

    const intents = [
        { key: 'payments', words: ['fee', 'payment', 'due', 'deadline', 'pay', 'late fee'] },
        { key: 'scholarship', words: ['scholarship', 'fellowship', 'grant', 'eligibility'] },
        { key: 'timetable', words: ['timetable', 'schedule', 'exam date', 'time table', 'reschedule'] },
        { key: 'circulars', words: ['circular', 'notice', 'circulars', 'announcement', 'memo'] },
        { key: 'procedures', words: ['procedure', 'apply', 'application', 'process', 'how to'] },
        { key: 'admissions', words: ['admission', 'admissions', 'enroll', 'enrol'] },
        { key: 'general', words: ['where', 'how', 'who', 'what', 'help', 'info', 'information'] }
    ];

    for (const intent of intents) {
        for (const w of intent.words) {
            if (t.includes(w)) {
                logger.info('Intent detected', { intent: intent.key, hint: w });
                return intent.key;
            }
        }
    }

    logger.info('Intent unknown for query');
    return 'unknown';
};

export default { detectIntent };
