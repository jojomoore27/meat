import express from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, query } from '../config/db.js';
import { signToken, requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/auth/login
 */
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password are required' });
    }

    const admin = await queryOne(
      'SELECT * FROM admins WHERE username = $1 OR email = $1',
      [username.trim()]
    );

    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const token = signToken({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAdmin, async (req, res, next) => {
  try {
    const admin = await queryOne('SELECT id, username, email, role, created_at FROM admins WHERE id = $1', [req.admin.id]);
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }
    res.json({ success: true, admin });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/auth/password
 */
router.put('/password', requireAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long' });
    }

    const admin = await queryOne('SELECT * FROM admins WHERE id = $1', [req.admin.id]);
    const isValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Incorrect current password' });
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await query('UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, req.admin.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
