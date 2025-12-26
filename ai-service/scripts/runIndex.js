import 'dotenv/config';
import logger from '../src/utils/logger.js';
import { connectDatabase, disconnectDatabase } from '../src/config/database.js';
import { indexDocuments } from '../src/services/documentService.js';

const main = async () => {
	try {
		await connectDatabase();

		logger.info('Starting document indexing script');

		// By default index all verified documents. You can pass IDs via env var DOCUMENT_IDS (comma-separated)
		const idsEnv = process.env.DOCUMENT_IDS || '';
		const ids = idsEnv ? idsEnv.split(',').map(s => s.trim()).filter(Boolean) : null;
		const reindex = process.env.REINDEX === 'true' || false;

		const result = await indexDocuments(ids, reindex);
		console.log('Indexing result:', JSON.stringify(result, null, 2));
		logger.info('Indexing script completed');
	} catch (error) {
		logger.error('Indexing script failed', { error: error.message });
		process.exitCode = 1;
	} finally {
		try { await disconnectDatabase(); } catch (_) {}
	}
};

main();
