import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/cms (Public CMS Data & Settings)
 */
router.get('/', async (req, res, next) => {
  try {
    const settings = await queryOne('SELECT * FROM site_settings WHERE id = $1', ['default']);
    const sectionsResult = await query('SELECT * FROM cms_content');

    const sections = {};
    for (const row of sectionsResult.rows) {
      sections[row.id] = typeof row.content_json === 'string' ? JSON.parse(row.content_json) : row.content_json;
    }

    if (settings && typeof settings.social_links === 'string') {
      settings.social_links = JSON.parse(settings.social_links);
    }

    res.json({
      success: true,
      settings: settings || {},
      sections
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/cms/settings (Update Site Settings)
 */
router.put('/admin/settings', requireAdmin, async (req, res, next) => {
  try {
    const {
      business_name,
      tagline,
      location,
      currency,
      contact_email,
      contact_phone,
      address,
      social_links,
      brand_description,
      logo_url,
      favicon_url,
      theme_default
    } = req.body;

    const existing = await queryOne('SELECT * FROM site_settings WHERE id = $1', ['default']);

    await query(
      `UPDATE site_settings SET
        business_name = $1, tagline = $2, location = $3, currency = $4,
        contact_email = $5, contact_phone = $6, address = $7, social_links = $8,
        brand_description = $9, logo_url = $10, favicon_url = $11, theme_default = $12,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = 'default'`,
      [
        business_name ?? existing?.business_name,
        tagline ?? existing?.tagline,
        location ?? existing?.location,
        currency ?? existing?.currency,
        contact_email ?? existing?.contact_email,
        contact_phone ?? existing?.contact_phone,
        address ?? existing?.address,
        social_links ? JSON.stringify(social_links) : existing?.social_links,
        brand_description ?? existing?.brand_description,
        logo_url ?? existing?.logo_url,
        favicon_url ?? existing?.favicon_url,
        theme_default ?? existing?.theme_default
      ]
    );

    const updated = await queryOne('SELECT * FROM site_settings WHERE id = $1', ['default']);
    if (updated && typeof updated.social_links === 'string') {
      updated.social_links = JSON.parse(updated.social_links);
    }

    res.json({ success: true, settings: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/cms/section (Update Specific Page Section)
 */
router.put('/admin/section', requireAdmin, async (req, res, next) => {
  try {
    const { sectionId, pageKey, sectionKey, content } = req.body;
    if (!sectionId || !content) {
      return res.status(400).json({ success: false, error: 'Section ID and content are required' });
    }

    const existing = await queryOne('SELECT * FROM cms_content WHERE id = $1', [sectionId]);
    if (existing) {
      await query(
        'UPDATE cms_content SET content_json = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [JSON.stringify(content), sectionId]
      );
    } else {
      await query(
        'INSERT INTO cms_content (id, page_key, section_key, content_json) VALUES ($1, $2, $3, $4)',
        [sectionId, pageKey || 'general', sectionKey || 'main', JSON.stringify(content)]
      );
    }

    res.json({ success: true, message: 'Section updated successfully', content });
  } catch (err) {
    next(err);
  }
});

export default router;
