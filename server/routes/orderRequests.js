import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { validateEmail } from '../middleware/validator.js';
import { notifyNewOrderRequest } from '../services/notificationService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * Helper: Generate unique reference number like BGC-10482
 */
function generateReferenceNo() {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `BGC-${randomDigits}`;
}

/**
 * POST /api/order-requests (Public Customer Order Request)
 */
router.post('/', orderLimiter, async (req, res, next) => {
  try {
    const {
      customer_name,
      email,
      phone,
      contact_preference = 'email',
      product_id,
      product_name,
      quantity = 1,
      cut_preference = '',
      special_instructions = '',
      additional_notes = ''
    } = req.body;

    if (!customer_name || !email || !phone || !product_name) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your full name, email, phone number, and selected product.'
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    const reference_no = generateReferenceNo();
    const id = uuidv4();
    const ip_address = req.ip || req.connection?.remoteAddress || '';

    await query(
      `INSERT INTO order_requests (
        id, reference_no, customer_name, email, phone, contact_preference,
        product_id, product_name, quantity, cut_preference, special_instructions,
        additional_notes, status, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id, reference_no, customer_name.trim(), email.trim(), phone.trim(),
        contact_preference, product_id || null, product_name.trim(),
        Number(quantity) || 1, cut_preference.trim(), special_instructions.trim(),
        additional_notes.trim(), 'new', ip_address
      ]
    );

    const createdOrder = {
      id,
      reference_no,
      customer_name: customer_name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      contact_preference,
      product_id,
      product_name: product_name.trim(),
      quantity: Number(quantity) || 1,
      cut_preference: cut_preference.trim(),
      special_instructions: special_instructions.trim(),
      additional_notes: additional_notes.trim(),
      status: 'new'
    };

    // Trigger multi-channel notifications asynchronously
    notifyNewOrderRequest(createdOrder).catch(err => {
      console.error('Error dispatching order notification:', err.message);
    });

    res.status(201).json({
      success: true,
      reference_no,
      message: 'Thank you for your order request. Your request has been successfully received by BestGrassFedCattle. Our team will review your request and contact you directly to confirm availability and finalize the order.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/order-requests (Admin Protected)
 */
router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let sql = 'SELECT * FROM order_requests WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (customer_name LIKE $${params.length} OR reference_no LIKE $${params.length} OR email LIKE $${params.length} OR product_name LIKE $${params.length})`;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    res.json({ success: true, count: result.rowCount, orders: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/order-requests/:id (Admin Protected)
 */
router.get('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const order = await queryOne('SELECT * FROM order_requests WHERE id = $1', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order request not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/order-requests/:id (Admin Protected - update status/notes)
 */
router.patch('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { status, admin_notes } = req.body;
    const existing = await queryOne('SELECT * FROM order_requests WHERE id = $1', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order request not found' });
    }

    const updatedStatus = status || existing.status;
    const updatedNotes = admin_notes !== undefined ? admin_notes : existing.admin_notes;

    await query(
      'UPDATE order_requests SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [updatedStatus, updatedNotes, req.params.id]
    );

    const updated = await queryOne('SELECT * FROM order_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true, order: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/order-requests/:id (Admin Protected)
 */
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM order_requests WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Order request deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
