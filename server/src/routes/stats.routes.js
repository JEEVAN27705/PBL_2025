// server/src/routes/stats.routes.js
import { Router } from 'express';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Upload from '../models/Upload.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.get('/admin/stats', auth, authorize(['admin']), async (req, res) => {
    try {
        const [userCount, adminCount, uploadCount, uploads] = await Promise.all([
            User.countDocuments(),
            Admin.countDocuments(),
            Upload.countDocuments(),
            Upload.find().sort({ createdAt: -1 }).limit(10).lean()
        ]);

        const statusCounts = await Upload.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const stats = {
            users: userCount,
            admins: adminCount,
            totalUploads: uploadCount,
            pendingUploads: statusCounts.find(s => s._id === 'pending')?.count || 0,
            verifiedUploads: statusCounts.find(s => s._id === 'verified')?.count || 0,
            rejectedUploads: statusCounts.find(s => s._id === 'rejected')?.count || 0,
            recentActivity: uploads.map(u => ({
                id: u._id,
                title: u.title,
                status: u.status,
                uploadedBy: u.uploadedBy,
                createdAt: u.createdAt
            }))
        };

        return res.json(stats);
    } catch (e) {
        console.error('Stats fetch error:', e);
        return res.status(500).json({ message: 'Failed to fetch statistics' });
    }
});

export default router;
