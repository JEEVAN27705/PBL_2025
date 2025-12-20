// server/src/routes/stats.routes.js
import { Router } from 'express';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Upload from '../models/Upload.js';
import PendingUpload from '../models/PendingUpload.js';
import VerifiedUpload from '../models/VerifiedUpload.js';
import RejectedUpload from '../models/RejectedUpload.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.get('/admin/stats', auth, authorize(['admin']), async (req, res) => {
    try {
        const [userCount, adminCount, uploadCount, pendingCount, verifiedCount, rejectedCount, uploads] = await Promise.all([
            User.countDocuments(),
            Admin.countDocuments(),
            Upload.countDocuments(),
            PendingUpload.countDocuments(),
            VerifiedUpload.countDocuments(),
            RejectedUpload.countDocuments(),
            Upload.find().sort({ createdAt: -1 }).limit(10).lean()
        ]);

        const stats = {
            users: userCount,
            admins: adminCount,
            totalUploads: uploadCount,
            pendingUploads: pendingCount,
            verifiedUploads: verifiedCount,
            rejectedUploads: rejectedCount,
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
