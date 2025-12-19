import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Configure storage for avatars
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'uploads/avatars');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        // Save as: avatar-<userId>-<timestamp>.ext
        cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, true);
    }
});

/**
 * POST /api/avatar
 * Upload a new profile picture
 */
router.post('/', auth, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Construct public URL
        // Serve via static route: /uploads/avatars/filename
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Update user
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Optional: Delete old avatar if it exists to save space
        if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
            const oldPath = path.join(process.cwd(), user.avatarUrl.replace('/uploads/avatars/', 'uploads/avatars/'));
            try {
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            } catch (err) {
                console.warn('Failed to delete old avatar:', err);
            }
        }

        user.avatarUrl = avatarUrl;
        await user.save();

        return res.json({ message: 'Avatar updated', avatarUrl });
    } catch (e) {
        console.error('Avatar upload error:', e);
        return res.status(500).json({ message: e.message || 'Upload failed' });
    }
});

/**
 * DELETE /api/avatar
 * Remove profile picture
 */
router.delete('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.avatarUrl) {
            if (user.avatarUrl.startsWith('/uploads/avatars/')) {
                const oldPath = path.join(process.cwd(), user.avatarUrl.replace(/^\/uploads\//, 'uploads/'));
                try {
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                } catch (err) {
                    console.warn('Failed to delete avatar file:', err);
                }
            }
            user.avatarUrl = '';
            await user.save();
        }

        return res.json({ message: 'Avatar removed' });
    } catch (e) {
        console.error('Remove avatar error:', e);
        return res.status(500).json({ message: 'Server error' });
    }
});

export default router;
