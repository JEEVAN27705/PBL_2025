// server/src/models/RejectedUpload.js
import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        type: { type: String, default: 'pdf' },
        verifyDept: { type: String, required: true, enum: ['Accounts', 'HR', 'Legal'] },
        files: [
            {
                filename: String,
                originalName: String,
                path: String,
                size: Number,
                mimetype: String
            }
        ],
        uploadedBy: { type: String, required: true }, // email or username
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userRole: { type: String, default: 'user' },
        status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'rejected' },
        uploadedAt: { type: Date, default: Date.now },
        verifiedAt: Date,
        verifiedBy: String
    },
    { timestamps: true }
);

export default mongoose.model('RejectedUpload', uploadSchema, 'rejected_uploads');
