// src/models/DocumentIndex.js
import mongoose from 'mongoose';

/**
 * Schema for indexed document chunks (memory-safe)
 */
const documentIndexSchema = new mongoose.Schema(
    {
        verifiedUploadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'VerifiedUpload',
            required: true,
            index: true
        },
        documentTitle: { type: String, required: true },
        fileName: { type: String, required: true },
        department: {
            type: String,
            required: true,
            enum: ['Accounts', 'HR', 'Legal', 'HOD', 'Exam']
        },
        chunkIndex: { type: Number, required: true, min: 0 },
        chunkText: { type: String, required: true },
        chunkStart: { type: Number, required: true },
        chunkEnd: { type: Number, required: true },
        pageNumber: { type: Number, default: null },
        totalChunks: { type: Number, required: true },
        // Embeddings optional and not loaded in bulk
        embedding: { type: [Number], default: null, select: false },
        indexedAt: { type: Date, default: Date.now },
        version: { type: Number, default: 1 }
    },
    { timestamps: true }
);

documentIndexSchema.index({ verifiedUploadId: 1, chunkIndex: 1 }, { unique: true });

export default mongoose.model('DocumentIndex', documentIndexSchema);
