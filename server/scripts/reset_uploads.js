
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Upload from '../src/models/Upload.js';
import PendingUpload from '../src/models/PendingUpload.js';
import VerifiedUpload from '../src/models/VerifiedUpload.js';
import RejectedUpload from '../src/models/RejectedUpload.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function resetSystem() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in environment");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        // 1. Clear Collections
        await Upload.deleteMany({});
        await PendingUpload.deleteMany({});
        await VerifiedUpload.deleteMany({});
        await RejectedUpload.deleteMany({});
        console.log("Cleared all Upload-related collections.");

        // 2. Clear Uploads Directory
        const uploadDir = path.join(__dirname, '../uploads');
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            for (const file of files) {
                if (file === '.gitkeep') continue;
                const filePath = path.join(uploadDir, file);
                if (fs.lstatSync(filePath).isFile()) {
                    fs.unlinkSync(filePath);
                }
            }
            console.log(`Cleared ${files.length} files from uploads directory.`);
        }

        console.log("System Reset Complete!");
        process.exit(0);
    } catch (e) {
        console.error("Reset Failed:", e);
        process.exit(1);
    }
}

resetSystem();
