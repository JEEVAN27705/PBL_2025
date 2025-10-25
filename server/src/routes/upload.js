import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Upload from '../models/Upload.js';

const router = Router();

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// POST /api/upload
router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    const { title, type, verifyDept, uploadedBy, userId, userRole } = req.body;

    if (!title || !verifyDept || !uploadedBy || !userId) {
      return res.status(400).json({
        message: 'Missing required fields: title, verifyDept, uploadedBy, userId'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(f => ({
      filename: f.filename,
      originalName: f.originalname,
      path: f.path,
      size: f.size,
      mimetype: f.mimetype
    }));

    const doc = await Upload.create({
      title: title.trim(),
      type: type || 'pdf',
      verifyDept,
      files,
      uploadedBy,
      userId,
      userRole: userRole || 'user',
      status: 'pending'
    });

    return res.status(201).json({
      message: 'Files uploaded successfully',
      data: {
        uploadId: doc._id,
        title: doc.title,
        fileCount: files.length,
        uploadedBy: doc.uploadedBy,
        uploadedAt: doc.uploadedAt
      }
    });
  } catch (err) {
    console.error('Upload error:', err);

    // Cleanup saved files on failure
    if (req.files && req.files.length) {
      req.files.forEach(f => {
        fs.unlink(f.path, e => e && console.error('Cleanup failed:', e));
      });
    }

    return res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// GET /api/upload/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const items = await Upload.find({ userId: req.params.userId })
      .sort({ uploadedAt: -1 })
      .select('-files.path');

    return res.json({ message: 'Uploads fetched', count: items.length, data: items });
  } catch (err) {
    console.error('Fetch user uploads error:', err);
    return res.status(500).json({ message: 'Failed to fetch uploads', error: err.message });
  }
});

// GET /api/upload/:uploadId
router.get('/:uploadId', async (req, res) => {
  try {
    const item = await Upload.findById(req.params.uploadId);
    if (!item) return res.status(404).json({ message: 'Upload not found' });
    return res.json({ message: 'Upload fetched', data: item });
  } catch (err) {
    console.error('Fetch upload error:', err);
    return res.status(500).json({ message: 'Failed to fetch upload', error: err.message });
  }
});

// GET /api/upload
router.get('/', async (_req, res) => {
  try {
    const items = await Upload.find().sort({ uploadedAt: -1 });
    return res.json({ message: 'All uploads fetched', count: items.length, data: items });
  } catch (err) {
    console.error('Fetch all uploads error:', err);
    return res.status(500).json({ message: 'Failed to fetch uploads', error: err.message });
  }
});

// DELETE /api/upload/:uploadId
router.delete('/:uploadId', async (req, res) => {
  try {
    const item = await Upload.findById(req.params.uploadId);
    if (!item) return res.status(404).json({ message: 'Upload not found' });

    // Remove files from disk
    item.files.forEach(f => {
      fs.unlink(f.path, e => e && console.error('File delete error:', e));
    });

    await item.deleteOne();
    return res.json({ message: 'Upload deleted' });
  } catch (err) {
    console.error('Delete upload error:', err);
    return res.status(500).json({ message: 'Failed to delete upload', error: err.message });
  }
});

export default router;
