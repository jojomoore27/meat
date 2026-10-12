import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { query, queryOne, supabase } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { permanentlyDeleteMediaFile } from '../utils/fileCleanup.js';
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
 * GET /api/media/storage-status (Live Supabase Storage check)
 */
router.get('/storage-status', requireAdmin, async (req, res, next) => {
  try {
    let hasMediaBucket = false;
    let buckets = [];
    let error = null;

    if (supabase) {
      const { data, error: bErr } = await supabase.storage.listBuckets();
      if (!bErr && data) {
        buckets = data.map(b => b.name);
        hasMediaBucket = buckets.includes('media');
      } else if (bErr) {
        error = bErr.message;
      }
    }

    res.json({
      success: true,
      isSupabaseConnected: Boolean(supabase),
      hasMediaBucket,
      buckets,
      error
    });
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
    const uniqueFileName = `farm_${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;

    // 1. Attempt upload to Supabase Storage for persistent cloud hosting
    if (supabase) {
      try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
          try {
            await supabase.storage.createBucket('media', { public: true });
          } catch (createErr) {
            // Bucket already exists or cannot create
          }
        }

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
          console.warn('⚠️ Supabase Storage upload error:', uploadErr.message);
          if (uploadErr.message?.includes('row-level security') || uploadErr.statusCode === '403') {
            console.warn('   💡 Fix: Add SUPABASE_SERVICE_ROLE_KEY to your environment variables OR run the SQL policy in server/database/supabase_storage_setup.sql.');
          }
        }
      } catch (sbErr) {
        console.warn('⚠️ Supabase Storage upload exception:', sbErr.message);
      }
    }

    // 2. Fallback to direct absolute URL on the server
    if (!fileUrl) {
      const host = req.get('host');
      const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
      fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
      console.warn(`📁 Stored image locally (${fileUrl}) because cloud storage upload did not complete.`);
    }

    await query(
      'INSERT INTO media_library (id, file_name, file_url, file_type, file_size, tags) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, req.file.originalname, fileUrl, req.file.mimetype, req.file.size, req.body.tags || '']
    );

    const created = await queryOne('SELECT * FROM media_library WHERE id = $1', [id]);
    res.status(201).json({
      success: true,
      file: created,
      url: fileUrl,
      storageEngine: fileUrl.includes('supabase.co') ? 'supabase' : 'local'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/media/:id (Authoritative Media Deletion)
 */
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await queryOne('SELECT * FROM media_library WHERE id = $1', [id]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Media file not found or already deleted.' });
    }

    const deleteResult = await query('DELETE FROM media_library WHERE id = $1', [id]);
    if (!deleteResult || deleteResult.rowCount === 0) {
      return res.status(500).json({ success: false, error: 'Failed to delete media record from database.' });
    }

    if (item.file_url) {
      await permanentlyDeleteMediaFile(item.file_url, { force: true });
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({ success: true, message: 'Media file permanently deleted', deletedId: id });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/media/delete-by-url (Permanently delete by file URL)
 */
router.post('/delete-by-url', requireAdmin, async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'URL is required' });
    }

    await permanentlyDeleteMediaFile(url, { force: true });
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({ success: true, message: 'File permanently deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
