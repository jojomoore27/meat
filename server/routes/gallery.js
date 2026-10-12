import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { safelyDeletePostMedia } from '../utils/fileCleanup.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * GET /api/gallery (Public Catalog of Gallery Images)
 */
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM gallery_images WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ' ORDER BY sort_order ASC, created_at DESC';
    const result = await query(sql, params);

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ success: true, count: result.rowCount, images: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/gallery/admin (Admin Add Gallery Image)
 */
router.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const { title, image_url, category = 'farm', is_featured = 0, sort_order = 0 } = req.body;
    if (!title || !image_url) {
      return res.status(400).json({ success: false, error: 'Title and image URL are required.' });
    }

    const id = uuidv4();
    await query(
      'INSERT INTO gallery_images (id, title, image_url, category, is_featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, title.trim(), image_url.trim(), category.trim(), is_featured ? 1 : 0, Number(sort_order) || 0]
    );

    const created = await queryOne('SELECT * FROM gallery_images WHERE id = $1', [id]);
    res.status(201).json({ success: true, image: created });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/gallery/admin/:id (Permanent Admin Delete)
 * Verifies record existence, deletes authoritative database row first,
 * cleans up exclusively owned media, and ensures failures are reported truthfully.
 */
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Identify and verify authoritative database record
    const existing = await queryOne('SELECT * FROM gallery_images WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Gallery photo not found or already deleted.' });
    }

    // 2. Perform authoritative database deletion
    const deleteResult = await query('DELETE FROM gallery_images WHERE id = $1', [id]);
    if (!deleteResult || deleteResult.rowCount === 0) {
      return res.status(500).json({ success: false, error: 'Authoritative database deletion failed.' });
    }

    // 3. Delete exclusively owned media from Supabase Storage / local disk
    let mediaResult = null;
    if (existing.image_url) {
      mediaResult = await safelyDeletePostMedia(existing.image_url, { excludeGalleryId: id });
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.json({
      success: true,
      message: 'Gallery image permanently deleted from database and storage',
      deletedId: id,
      mediaCleanup: mediaResult
    });
  } catch (err) {
    next(err);
  }
});

export default router;
