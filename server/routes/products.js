import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { permanentlyDeleteMediaFile } from '../utils/fileCleanup.js';
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
 * GET /api/products (Public Catalog with Filters)
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, search, featured, sort } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
    `;
    const params = [];

    const isCleanParam = (val) => Boolean(
      val &&
      val !== 'all' &&
      val !== 'undefined' &&
      val !== 'null' &&
      String(val).trim() !== ''
    );

    if (isCleanParam(category)) {
      params.push(String(category).trim());
      sql += ` AND (c.slug = $${params.length} OR p.category_id = $${params.length})`;
    }

    if (isCleanParam(search)) {
      params.push(`%${String(search).trim()}%`);
      sql += ` AND (p.name LIKE $${params.length} OR p.short_description LIKE $${params.length} OR p.sku LIKE $${params.length})`;
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND p.is_featured = 1';
    }

    if (sort === 'price-asc') {
      sql += ' ORDER BY p.price ASC';
    } else if (sort === 'price-desc') {
      sql += ' ORDER BY p.price DESC';
    } else if (sort === 'name-asc') {
      sql += ' ORDER BY p.name ASC';
    } else {
      sql += ' ORDER BY p.is_featured DESC, p.created_at DESC';
    }

    const result = await query(sql, params);

    // Parse JSON fields if SQLite returned them as strings
    const products = result.rows.map(row => ({
      ...row,
      cut_options: typeof row.cut_options === 'string' ? JSON.parse(row.cut_options || '[]') : row.cut_options,
      specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications || '{}') : row.specifications,
      additional_images: typeof row.additional_images === 'string' ? JSON.parse(row.additional_images || '[]') : row.additional_images,
    }));

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/products/:slug (Public Single Product)
 */
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await queryOne(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = $1 OR p.id = $1`,
      [req.params.slug]
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    product.cut_options = typeof product.cut_options === 'string' ? JSON.parse(product.cut_options || '[]') : product.cut_options;
    product.specifications = typeof product.specifications === 'string' ? JSON.parse(product.specifications || '{}') : product.specifications;
    product.additional_images = typeof product.additional_images === 'string' ? JSON.parse(product.additional_images || '[]') : product.additional_images;

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/products (Admin All Products including drafts)
 */
router.get('/admin/all', requireAdmin, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC`
    );

    const products = result.rows.map(row => ({
      ...row,
      cut_options: typeof row.cut_options === 'string' ? JSON.parse(row.cut_options || '[]') : row.cut_options,
      specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications || '{}') : row.specifications,
      additional_images: typeof row.additional_images === 'string' ? JSON.parse(row.additional_images || '[]') : row.additional_images,
    }));

    res.json({ success: true, count: products.length, products });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/products (Create Product)
 */
router.post('/admin', requireAdmin, async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category_id,
      price = 0,
      short_description,
      full_description = '',
      main_image,
      additional_images = [],
      status = 'published',
      is_featured = 0,
      cut_options = [],
      specifications = {},
      seo_title = '',
      seo_description = ''
    } = req.body;

    if (!name || !price || !short_description || !main_image) {
      return res.status(400).json({ success: false, error: 'Product name, price, short description, and main image are required.' });
    }

    const id = uuidv4();
    const slug = slugify(name) + '-' + Math.floor(100 + Math.random() * 900);
    const productSku = sku || `BGC-${Math.floor(1000 + Math.random() * 9000)}`;

    await query(
      `INSERT INTO products (
        id, name, slug, sku, category_id, price, short_description, full_description,
        main_image, additional_images, status, is_featured, cut_options, specifications,
        seo_title, seo_description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id, name.trim(), slug, productSku.trim(), category_id || null, Number(price),
        short_description.trim(), full_description.trim(), main_image.trim(),
        JSON.stringify(additional_images), status, is_featured ? 1 : 0,
        JSON.stringify(cut_options), JSON.stringify(specifications),
        seo_title.trim(), seo_description.trim()
      ]
    );

    const created = await queryOne('SELECT * FROM products WHERE id = $1', [id]);
    res.status(201).json({ success: true, product: created });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/products/:id (Update Product)
 */
router.put('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const {
      name,
      sku,
      category_id,
      price,
      short_description,
      full_description,
      main_image,
      additional_images,
      status,
      is_featured,
      cut_options,
      specifications,
      seo_title,
      seo_description
    } = req.body;

    const existing = await queryOne('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // If main image was changed or removed, permanently delete the old image
    if (main_image !== undefined && existing.main_image && existing.main_image !== main_image) {
      await permanentlyDeleteMediaFile(existing.main_image);
    }

    await query(
      `UPDATE products SET
        name = $1, sku = $2, category_id = $3, price = $4, short_description = $5,
        full_description = $6, main_image = $7, additional_images = $8, status = $9,
        is_featured = $10, cut_options = $11, specifications = $12, seo_title = $13,
        seo_description = $14, updated_at = CURRENT_TIMESTAMP
       WHERE id = $15`,
      [
        name ?? existing.name,
        sku ?? existing.sku,
        category_id ?? existing.category_id,
        price !== undefined ? Number(price) : existing.price,
        short_description ?? existing.short_description,
        full_description ?? existing.full_description,
        main_image ?? existing.main_image,
        additional_images ? JSON.stringify(additional_images) : existing.additional_images,
        status ?? existing.status,
        is_featured !== undefined ? (is_featured ? 1 : 0) : existing.is_featured,
        cut_options ? JSON.stringify(cut_options) : existing.cut_options,
        specifications ? JSON.stringify(specifications) : existing.specifications,
        seo_title ?? existing.seo_title,
        seo_description ?? existing.seo_description,
        req.params.id
      ]
    );

    const updated = await queryOne('SELECT * FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true, product: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/products/:id (Delete Product)
 */
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const existing = await queryOne('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (existing) {
      if (existing.main_image) {
        await permanentlyDeleteMediaFile(existing.main_image);
      }
      let additional = [];
      try {
        additional = typeof existing.additional_images === 'string'
          ? JSON.parse(existing.additional_images || '[]')
          : existing.additional_images;
      } catch (e) {
        additional = [];
      }
      if (Array.isArray(additional)) {
        for (const img of additional) {
          await permanentlyDeleteMediaFile(img);
        }
      }
    }

    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Product and associated images permanently deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
