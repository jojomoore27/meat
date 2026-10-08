import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `farm_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter: strict image mime types
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/avif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, GIF, and AVIF images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = express.Router();

/**
 * GET /api/admin/media (List Media Files)
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM media_library ORDER BY uploaded_at DESC');
    res.json({ success: true, media: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/media/upload
 */
router.post('/upload', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const id = uuidv4();

    await query(
      'INSERT INTO media_library (id, file_name, file_url, file_type, file_size, tags) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, req.file.originalname, fileUrl, req.file.mimetype, req.file.size, req.body.tags || '']
    );

    const created = await queryOne('SELECT * FROM media_library WHERE id = $1', [id]);
    res.status(201).json({ success: true, file: created, url: fileUrl });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/media/:id
 */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const item = await queryOne('SELECT * FROM media_library WHERE id = $1', [req.params.id]);
    if (item && item.file_url && item.file_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', item.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await query('DELETE FROM media_library WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Media file removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
