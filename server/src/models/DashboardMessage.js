// server/src/models/DashboardMessage.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, required: true },
        senderDept: { type: String, default: null },
        content: { type: String, required: true },
        mentionedRole: { type: String, default: null }, // e.g., 'hod', 'accounts', 'exam'
        isPrivate: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model('DashboardMessage', messageSchema);
