import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * GET /api/categories (Public List)
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.status = 'published'
       WHERE (c.is_active = 1 OR c.is_active IS NULL)
       GROUP BY c.id
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/categories (Admin Create)
 */
router.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const { name, description = '', sort_order = 0 } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required.' });
    }

    const id = uuidv4();
    const slug = slugify(name);

    await query(
      'INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, 1)',
      [id, name.trim(), slug, description.trim(), Number(sort_order) || 0]
    );

    const created = await queryOne('SELECT * FROM categories WHERE id = $1', [id]);
    res.status(201).json({ success: true, category: created });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/categories/:id (Admin Update)
 */
router.put('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, sort_order, is_active } = req.body;
    const existing = await queryOne('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }

    await query(
      `UPDATE categories SET
        name = $1, description = $2, sort_order = $3, is_active = $4
       WHERE id = $5`,
      [
        name ?? existing.name,
        description ?? existing.description,
        sort_order !== undefined ? Number(sort_order) : existing.sort_order,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        req.params.id
      ]
    );

    const updated = await queryOne('SELECT * FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true, category: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/categories/:id (Admin Delete)
 */
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
