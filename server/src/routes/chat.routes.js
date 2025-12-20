// server/src/routes/chat.routes.js
import { Router } from 'express';
import DashboardMessage from '../models/DashboardMessage.js';
import { auth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/chat
 * Fetch messages. Filter private messages based on current user role/id.
 */
router.get('/', auth, async (req, res) => {
    try {
        const userRole = req.user.role;
        const adminScope = req.user.adminScope; // hod, accounts, exam
        const userId = req.user.id;

        const messages = await DashboardMessage.find({
            $or: [
                { isPrivate: false }, // Public messages
                { sender: userId }, // Messages sent by the user
                { mentionedRole: adminScope }, // Messages privately mentioning the admin's scope
                { mentionedRole: userRole } // Messages privately mentioning the user's role
            ]
        })
            .sort({ createdAt: -1 })
            .limit(50);

        return res.json(messages.reverse());
    } catch (e) {
        console.error('Fetch chat error:', e);
        return res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

/**
 * POST /api/chat
 * Send a new message.
 */
router.post('/', auth, async (req, res) => {
    try {
        const { content, senderName } = req.body;
        if (!content) return res.status(400).json({ message: 'Content required' });

        let mentionedRole = null;
        let isPrivate = false;

        // Logic: Look for @role mentions
        // Support @hod, @accounts, @exam based on the admin scopes we have
        const mentionMatch = content.match(/@(\w+)/);
        if (mentionMatch) {
            const role = mentionMatch[1].toLowerCase();
            if (['hod', 'accounts', 'exam', 'admin', 'user'].includes(role)) {
                mentionedRole = role;
                isPrivate = true;
            }
        }

        const msg = await DashboardMessage.create({
            sender: req.user.id,
            senderName: senderName || req.user.fullName || 'Unknown',
            senderRole: req.user.role,
            content,
            mentionedRole,
            isPrivate
        });

        return res.status(201).json(msg);
    } catch (e) {
        console.error('Post chat error:', e);
        return res.status(500).json({ message: 'Failed to send message' });
    }
});

export default router;
