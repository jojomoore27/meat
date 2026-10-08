import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * GET /api/faqs (Public List)
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM faqs WHERE is_published = 1 ORDER BY sort_order ASC, created_at ASC');
    res.json({ success: true, faqs: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/faqs (Admin All)
 */
router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM faqs ORDER BY sort_order ASC, created_at ASC');
    res.json({ success: true, faqs: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/faqs (Admin Create)
 */
router.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const { question, answer, category = 'General', sort_order = 0, is_published = 1 } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, error: 'Question and answer are required.' });
    }

    const id = uuidv4();
    await query(
      'INSERT INTO faqs (id, question, answer, category, sort_order, is_published) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, question.trim(), answer.trim(), category.trim(), Number(sort_order) || 0, is_published ? 1 : 0]
    );

    const created = await queryOne('SELECT * FROM faqs WHERE id = $1', [id]);
    res.status(201).json({ success: true, faq: created });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/faqs/:id (Admin Update)
 */
router.put('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { question, answer, category, sort_order, is_published } = req.body;
    const existing = await queryOne('SELECT * FROM faqs WHERE id = $1', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'FAQ not found' });
    }

    await query(
      `UPDATE faqs SET
        question = $1, answer = $2, category = $3, sort_order = $4, is_published = $5
       WHERE id = $6`,
      [
        question ?? existing.question,
        answer ?? existing.answer,
        category ?? existing.category,
        sort_order !== undefined ? Number(sort_order) : existing.sort_order,
        is_published !== undefined ? (is_published ? 1 : 0) : existing.is_published,
        req.params.id
      ]
    );

    const updated = await queryOne('SELECT * FROM faqs WHERE id = $1', [req.params.id]);
    res.json({ success: true, faq: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/faqs/:id (Admin Delete)
 */
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM faqs WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
