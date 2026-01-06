// server/src/routes/docs.js
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Upload from '../models/Upload.js';
import PendingUpload from '../models/PendingUpload.js';
import VerifiedUpload from '../models/VerifiedUpload.js';
import RejectedUpload from '../models/RejectedUpload.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.join(__dirname, '../uploads'); // adjust if needed

// Utility to resolve first file of an Upload doc
async function resolveFirstFile(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await Upload.findById(id).lean();
  if (!doc || !doc.files || !doc.files.length) return null;

  const f = doc.files[0];
  const absPath = path.isAbsolute(f.path) ? f.path : path.join(uploadsRoot, f.path);
  const originalName = f.originalName || f.filename || 'document.pdf';
  const mimetype = f.mimetype || 'application/pdf';
  return { absPath, originalName, mimetype };
}

// GET /api/docs/:id/preview -> inline stream for iframe
router.get('/:id/preview', auth, authorize(['admin']), async (req, res) => {
  try {
    const meta = await resolveFirstFile(req.params.id);
    if (!meta) return res.status(404).json({ message: 'File not found' });

    const { absPath, originalName, mimetype } = meta;
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: 'File missing on server' });

    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(originalName)}"`);

    const stream = fs.createReadStream(absPath);
    stream.on('error', () => res.status(500).end());
    stream.pipe(res);
  } catch (e) {
    console.error('PREVIEW ERROR:', e);
    res.status(500).json({ message: 'Preview failed' });
  }
});

// GET /api/docs/:id/download -> force download attachment
router.get('/:id/download', auth, authorize(['admin']), async (req, res) => {
  try {
    const meta = await resolveFirstFile(req.params.id);
    if (!meta) return res.status(404).json({ message: 'File not found' });

    const { absPath, originalName, mimetype } = meta;
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: 'File missing on server' });

    // Explicit type + attachment filename; Express sets Content-Disposition for download
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(originalName)}"`); // filename header for client parsing [web:86]
    return res.download(absPath, originalName); // prompts download in browsers [web:116][web:117]
  } catch (e) {
    console.error('DOWNLOAD ERROR:', e);
    res.status(500).json({ message: 'Download failed' });
  }
});

// PUT /api/docs/:id/status -> Approve/Reject
router.put('/:id/status', auth, authorize(['admin']), async (req, res) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const doc = await Upload.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Optional: check if admin belongs to correct department
    // const scope = req.user.adminScope;
    // ... logic same as pending-approvals if strict enforcement needed

    doc.status = status;
    doc.verifiedBy = req.user.email || req.user.fullName;
    doc.verifiedAt = new Date();
    await doc.save();

    // 1. Remove from Pending
    await PendingUpload.findByIdAndDelete(req.params.id);

    // 2. Add to Verified or Rejected
    const Model = status === 'verified' ? VerifiedUpload : RejectedUpload;

    // Create new doc in target collection with same data
    const plainDoc = doc.toObject();
    await Model.create(plainDoc);

    // Trigger AI Ingestion if Verified
    if (status === 'verified') {
      try {
        const FormData = (await import('form-data')).default;
        const fetch = (await import('node-fetch')).default || global.fetch;
        const fs = (await import('fs')).default;

        if (doc.files && doc.files.length) {
          for (const f of doc.files) {
            const absPath = path.isAbsolute(f.path) ? f.path : path.join(uploadsRoot, f.path);
            if (fs.existsSync(absPath)) {
              const formData = new FormData();
              formData.append('file', fs.createReadStream(absPath));
              fetch('http://localhost:8000/ingest', { method: 'POST', body: formData })
                .catch(err => console.error('AI Ingestion failed:', err.message));
            }
          }
        }
      } catch (aiErr) { console.error('AI Trigger Error:', aiErr); }
    }

    return res.json({ message: `Document ${status}`, doc });
  } catch (e) {
    console.error('UPDATE STATUS ERROR:', e);
    return res.status(500).json({ message: 'Update failed' });
  }
});

export default router;
