import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM testimonials WHERE is_featured = 1 ORDER BY sort_order ASC, created_at DESC');
    res.json({ success: true, testimonials: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC');
    res.json({ success: true, testimonials: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const { customer_name, customer_role = '', quote, photo_url = '', is_featured = 1, sort_order = 0 } = req.body;
    if (!customer_name || !quote) {
      return res.status(400).json({ success: false, error: 'Customer name and quote are required.' });
    }

    const id = uuidv4();
    await query(
      'INSERT INTO testimonials (id, customer_name, customer_role, quote, photo_url, is_featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, customer_name.trim(), customer_role.trim(), quote.trim(), photo_url.trim(), is_featured ? 1 : 0, Number(sort_order) || 0]
    );

    const created = await queryOne('SELECT * FROM testimonials WHERE id = $1', [id]);
    res.status(201).json({ success: true, testimonial: created });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
