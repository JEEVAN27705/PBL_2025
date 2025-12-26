// src/services/indexWatcher.js
import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { indexDocument } from './documentService.js';

// VerifiedUpload model (loose schema - mirrors main server collection)
const VerifiedUpload = mongoose.model('VerifiedUpload', new mongoose.Schema({}, { strict: false }), 'verified_uploads');

const DEFAULT_POLL_INTERVAL = parseInt(process.env.AUTO_INDEX_POLL_INTERVAL_MS || '30000', 10);

/**
 * Attempt to watch the verified_uploads collection using change streams.
 * If change streams are unavailable (standalone MongoDB), fall back to polling.
 */
export const startIndexWatcher = async () => {
    try {
        if (!VerifiedUpload.collection) {
            logger.warn('VerifiedUpload collection not available for watcher');
            startPolling();
            return;
        }

        // Build a pipeline to catch inserts and updates where status becomes 'verified'
        const pipeline = [
            {
                $match: {
                    operationType: { $in: ['insert', 'update', 'replace'] }
                }
            }
        ];

        const changeStream = VerifiedUpload.watch(pipeline, { fullDocument: 'updateLookup' });

        changeStream.on('change', async (change) => {
            try {
                const doc = change.fullDocument;
                if (!doc) return;

                // Only index if status is 'verified'
                if (doc.status && String(doc.status).toLowerCase() === 'verified') {
                    logger.info('ChangeStream detected verified document, indexing', { id: doc._id });
                    await indexDocument(doc, false);
                }
            } catch (err) {
                logger.error('Error handling change stream event for verified_uploads', { error: err.message });
            }
        });

        changeStream.on('error', (err) => {
            logger.warn('ChangeStream error, falling back to polling', { error: err.message });
            changeStream.close();
            startPolling();
        });

        logger.info('Started change stream watcher for verified_uploads');
    } catch (error) {
        logger.warn('Change streams not available or watcher failed, using polling fallback', { error: error.message });
        startPolling();
    }
};

/**
 * Poll the VerifiedUpload collection periodically and index any verified documents.
 * This is a safe fallback for single-node MongoDB setups where change streams are not supported.
 */
const startPolling = () => {
    logger.info('Starting polling watcher for verified_uploads', { intervalMs: DEFAULT_POLL_INTERVAL });

    const poll = async () => {
        try {
            const docs = await VerifiedUpload.find({ status: 'verified' }).lean().limit(100).exec();
            for (const doc of docs) {
                try {
                    await indexDocument(doc, false);
                } catch (err) {
                    logger.error('Failed to index document during polling', { id: doc._id, error: err.message });
                }
            }
        } catch (err) {
            logger.error('Polling for verified uploads failed', { error: err.message });
        }
    };

    // Run once immediately, then periodically
    poll();
    const interval = setInterval(poll, DEFAULT_POLL_INTERVAL);

    // Keep Node process aware (we don't need to clear this interval normally)
    process.on('exit', () => clearInterval(interval));
};

export default { startIndexWatcher };
