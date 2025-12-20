// server/src/models/Admin.js
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        role: { type: String, default: 'admin', immutable: true },
        adminScope: {
            type: String,
            enum: ['accounts', 'hod', 'exam'],
            required: true
        },
        avatarUrl: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model('RegisterDataAdmin', adminSchema, 'RegisterDataAdmin');
