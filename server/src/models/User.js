// server/src/models/User.js
import mongoose from 'mongoose';

const usersSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user', index: true },
    adminScope: {
      type: String,
      enum: ['accounts', 'hod', 'exam'],
      required: function () { return this.role === 'admin'; }
    },
    avatarUrl: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('RegisterDataUser', usersSchema, 'RegisterDataUser');
