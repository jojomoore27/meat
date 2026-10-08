import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { orderLimiter } from '../middleware/rateLimiter.js';
import { validateEmail } from '../middleware/validator.js';
import { notifyNewContactMessage } from '../services/notificationService.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

/**
 * POST /api/contact (Public contact message submission)
 */
router.post('/', orderLimiter, async (req, res, next) => {
  try {
    const { name, email, phone = '', subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'Please provide your name, email, subject, and message.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const id = uuidv4();
    await query(
      'INSERT INTO contact_messages (id, name, email, phone, subject, message, is_read, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, name.trim(), email.trim(), phone.trim(), subject.trim(), message.trim(), 0, 'new']
    );

    const createdMsg = { id, name: name.trim(), email: email.trim(), phone: phone.trim(), subject: subject.trim(), message: message.trim() };
    notifyNewContactMessage(createdMsg).catch(err => {
      console.error('Error dispatching contact notification:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting BestGrassFedCattle. We have received your message and will respond shortly.'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/contact-messages (Admin Protected)
 */
router.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, messages: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/contact-messages/:id (Admin Protected)
 */
router.patch('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const { is_read, status, admin_notes } = req.body;
    const existing = await queryOne('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    const readVal = is_read !== undefined ? (is_read ? 1 : 0) : existing.is_read;
    const statusVal = status || existing.status;
    const notesVal = admin_notes !== undefined ? admin_notes : existing.admin_notes;

    await query(
      'UPDATE contact_messages SET is_read = $1, status = $2, admin_notes = $3 WHERE id = $4',
      [readVal, statusVal, notesVal, req.params.id]
    );

    const updated = await queryOne('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/contact-messages/:id (Admin Protected)
 */
router.delete('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    await query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
