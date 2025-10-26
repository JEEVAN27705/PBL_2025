// server/src/routes/viewStatus.js
import { Router } from 'express';
import mongoose from 'mongoose';
import Upload from '../models/Upload.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

/**
 * GET /api/admin/view-status
 * Query params:
 *  - mine=true        -> only current user's uploads
 *  - status=pending|verified|rejected
 *  - type=Exam|Holidays|Circular|Notice|Other|pdf
 *  - q=free text      -> searches title/type/uploadedBy/verifyDept
 */
router.get('/admin/view-status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { mine, status, type, q } = req.query;

    const filter = {};
    if (mine === 'true') {
      // Only documents created by this admin
      filter.userId = req.user.id;
    }

    if (status) {
      const s = String(status).toLowerCase();
      if (['pending', 'verified', 'rejected'].includes(s)) {
        filter.status = s;
      }
    }

    if (type && type !== 'All') {
      filter.type = type;
    }

    if (q && String(q).trim()) {
      const rx = new RegExp(String(q).trim(), 'i');
      filter.$or = [
        { title: rx },
        { type: rx },
        { uploadedBy: rx },
        { verifyDept: rx },
      ];
    }

    const docs = await Upload.find(filter).sort({ updatedAt: -1 }).lean();

    // OPTIONAL: normalize fields for frontend expectations
    // e.g., convert status to capitalized labels if your UI expects it
    const normalized = docs.map(d => ({
      ...d,
      status: (d.status || 'pending'),
    }));

    return res.json(normalized);
  } catch (e) {
    console.error('GET /admin/view-status error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
