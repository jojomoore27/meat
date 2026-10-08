import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { validateEmail } from '../middleware/validator.js';
import { notifyNewWholesaleRequest } from '../services/notificationService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

function generateWholesaleReferenceNo() {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `BGC-W${randomDigits}`;
}

/**
 * POST /api/wholesale-requests (Public B2B Bulk Submission)
 */
router.post('/', orderLimiter, async (req, res, next) => {
  try {
    const {
      full_name,
      company_name,
      business_type = 'restaurant',
      email,
      phone,
      location,
      products_interested,
      estimated_quantity,
      preferred_cuts = '',
      purchase_frequency = 'one-time',
      additional_requirements = '',
      message = ''
    } = req.body;

    if (!full_name || !company_name || !email || !phone || !location || !products_interested || !estimated_quantity) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Contact Name, Company Name, Email, Phone, Location, Products, Estimated Quantity).'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid business email address.' });
    }

    const reference_no = generateWholesaleReferenceNo();
    const id = uuidv4();

    await query(
      `INSERT INTO wholesale_requests (
        id, reference_no, full_name, company_name, business_type, email, phone,
        location, products_interested, estimated_quantity, preferred_cuts,
        purchase_frequency, additional_requirements, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        id, reference_no, full_name.trim(), company_name.trim(), business_type.trim(),
        email.trim(), phone.trim(), location.trim(), products_interested.trim(),
        estimated_quantity.trim(), preferred_cuts.trim(), purchase_frequency.trim(),
        additional_requirements.trim(), message.trim(), 'new'
      ]
    );

    const createdRequest = {
      id,
      reference_no,
      full_name: full_name.trim(),
      company_name: company_name.trim(),
      business_type,
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      products_interested: products_interested.trim(),
      estimated_quantity: estimated_quantity.trim(),
      purchase_frequency,
      message: message.trim()
    };

    notifyNewWholesaleRequest(createdRequest).catch(err => {
      console.error('Error dispatching wholesale notification:', err.message);
    });

    res.status(201).json({
      success: true,
      reference_no,
      message: 'Thank you for your wholesale request. BestGrassFedCattle has received your inquiry. Our commercial wholesale director will review your requirements and contact you within 24 hours.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/wholesale-requests (Admin Protected)
 */
router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let sql = 'SELECT * FROM wholesale_requests WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (company_name LIKE $${params.length} OR full_name LIKE $${params.length} OR reference_no LIKE $${params.length} OR email LIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, count: result.rowCount, requests: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/wholesale-requests/:id (Admin Protected)
 */
router.patch('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { status, admin_notes } = req.body;
    const existing = await queryOne('SELECT * FROM wholesale_requests WHERE id = $1', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Wholesale request not found' });
    }

    const updatedStatus = status || existing.status;
    const updatedNotes = admin_notes !== undefined ? admin_notes : existing.admin_notes;

    await query(
      'UPDATE wholesale_requests SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [updatedStatus, updatedNotes, req.params.id]
    );

    const updated = await queryOne('SELECT * FROM wholesale_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true, request: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/wholesale-requests/:id (Admin Protected)
 */
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM wholesale_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Wholesale request deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
