// server/src/models/User.js
import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'user', immutable: true },
    avatarUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('RegisterDataUser', usersSchema, 'RegisterDataUser');
