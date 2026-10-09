import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { query, queryOne, supabase } from '../config/db.js';
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
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueName = `farm_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter: support all standard camera & device photo formats (including mobile iOS/Android)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|svg)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Please upload a picture from your device (JPEG, PNG, WebP, GIF, AVIF, HEIC).'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit for high-res mobile photos
});

const router = express.Router();

/**
 * GET /api/media (List Media Files)
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
 * POST /api/media/upload
 * Supports uploading from any mobile or desktop device.
 * Stores in Supabase Storage if bucket exists, with fallback to local server.
 */
router.post('/upload', requireAdmin, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    let fileUrl = '';
    const id = uuidv4();
    const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const uniqueFileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;

    // 1. Attempt upload to Supabase Storage for persistent cloud hosting
    if (supabase) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('media')
          .upload(uniqueFileName, fileBuffer, {
            contentType: req.file.mimetype || 'image/jpeg',
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: pubData } = supabase.storage
            .from('media')
            .getPublicUrl(uniqueFileName);

          if (pubData && pubData.publicUrl) {
            fileUrl = pubData.publicUrl;
            console.log('✅ Uploaded picture directly to Supabase Storage CDN:', fileUrl);
          }
        } else if (uploadErr) {
          console.warn('Supabase Storage bucket upload skipped:', uploadErr.message);
        }
      } catch (sbErr) {
        console.warn('Supabase Storage upload warning:', sbErr.message);
      }
    }

    // 2. Fallback to direct absolute URL on the server
    if (!fileUrl) {
      const host = req.get('host');
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

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
 * DELETE /api/media/:id
 */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const item = await queryOne('SELECT * FROM media_library WHERE id = $1', [req.params.id]);
    if (item && item.file_url) {
      // Clean up Supabase storage if applicable
      if (supabase && item.file_url.includes('/storage/v1/object/public/media/')) {
        try {
          const fileName = item.file_url.split('/media/').pop();
          if (fileName) {
            await supabase.storage.from('media').remove([fileName]);
          }
        } catch (delErr) {
          console.warn('Failed to delete from Supabase storage:', delErr.message);
        }
      }

      // Clean up local disk
      if (item.file_url.includes('/uploads/')) {
        const localName = item.file_url.split('/uploads/').pop();
        const filePath = path.join(uploadDir, localName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await query('DELETE FROM media_library WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Media file removed' });
  } catch (err) {
    next(err);
  }
});

export default router;
