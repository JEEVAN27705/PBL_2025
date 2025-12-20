// server/src/routes/viewStatus.js
import { Router } from 'express';
import mongoose from 'mongoose';
import Upload from '../models/Upload.js';
import PendingUpload from '../models/PendingUpload.js';
import VerifiedUpload from '../models/VerifiedUpload.js';
import RejectedUpload from '../models/RejectedUpload.js';
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
      filter.userId = req.user.id;
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

    let Model = Upload;
    if (status) {
      const s = String(status).toLowerCase();
      if (s === 'pending') Model = PendingUpload;
      else if (s === 'verified') Model = VerifiedUpload;
      else if (s === 'rejected') Model = RejectedUpload;
    }

    const docs = await Model.find(filter).sort({ updatedAt: -1 }).lean();

    const normalized = docs.map(d => ({
      ...d,
      status: (d.status || (Model === PendingUpload ? 'pending' : Model === VerifiedUpload ? 'verified' : Model === RejectedUpload ? 'rejected' : 'pending')),
    }));

    return res.json(normalized);
  } catch (e) {
    console.error('GET /admin/view-status error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

/**
 * GET /api/admin/pending-approvals
 * Fetch documents waiting for verification by this admin's department
 */
router.get('/admin/pending-approvals', auth, authorize(['admin']), async (req, res) => {
  try {
    const { q } = req.query;
    const scope = req.user.adminScope;

    let targetDept = null;
    if (scope === 'hod') targetDept = 'HR';
    else if (scope === 'exam') targetDept = 'Legal';
    else if (scope === 'accounts') targetDept = 'Accounts';

    if (!targetDept) return res.json([]);

    const filter = { verifyDept: targetDept };

    if (q && String(q).trim()) {
      const rx = new RegExp(String(q).trim(), 'i');
      filter.$or = [{ title: rx }, { type: rx }, { uploadedBy: rx }];
    }

    const docs = await PendingUpload.find(filter).sort({ createdAt: 1 }).lean();
    return res.json(docs);
  } catch (e) {
    console.error('GET /admin/pending-approvals error:', e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
