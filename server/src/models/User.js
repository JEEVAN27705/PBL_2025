import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user', index: true }
  },
  { timestamps: true }
);

// Ensure unique index on email
usersSchema.index({ email: 1 }, { unique: true });

// Export model with custom collection name
export default mongoose.model('RegisterDataUser', usersSchema, 'RegisterDataUser');
