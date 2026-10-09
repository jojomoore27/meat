import express from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, query, supabase } from '../config/db.js';
import { signToken, requireAdmin } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates against Supabase Auth, Supabase Database, or local admin store
 */
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username or email, and password are required' });
    }

    const trimmedIdentifier = username.trim();

    // 1. Authenticate with Supabase Auth
    if (supabase) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedIdentifier,
          password: password,
        });

        if (authData?.user && !authError) {
          const user = authData.user;
          const token = signToken({
            id: user.id,
            username: user.user_metadata?.username || user.email.split('@')[0],
            email: user.email,
            role: user.user_metadata?.role || 'admin',
          });

          return res.json({
            success: true,
            token,
            admin: {
              id: user.id,
              username: user.user_metadata?.username || user.email.split('@')[0],
              email: user.email,
              role: user.user_metadata?.role || 'admin',
            },
            authProvider: 'supabase-auth',
          });
        }
      } catch (err) {
        console.warn('Supabase Auth verification attempt:', err.message);
      }

      // 2. Check Supabase 'admins' table
      try {
        const { data: dbAdmins, error: dbErr } = await supabase
          .from('admins')
          .select('*')
          .or(`username.eq.${trimmedIdentifier},email.eq.${trimmedIdentifier}`)
          .limit(1);

        if (dbAdmins && dbAdmins.length > 0) {
          const admin = dbAdmins[0];
          const isValid = await bcrypt.compare(password, admin.password_hash);
          if (isValid) {
            const token = signToken({
              id: admin.id,
              username: admin.username,
              email: admin.email,
              role: admin.role,
            });

            return res.json({
              success: true,
              token,
              admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
              },
              authProvider: 'supabase-db',
            });
          }
        }
      } catch (err) {
        console.warn('Supabase Database verification attempt:', err.message);
      }
    }

    // 3. Fallback check local admins store
    const admin = await queryOne(
      'SELECT * FROM admins WHERE username = $1 OR email = $1',
      [trimmedIdentifier]
    );

    if (admin) {
      const isValid = await bcrypt.compare(password, admin.password_hash);
      if (isValid) {
        const token = signToken({
          id: admin.id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
        });

        return res.json({
          success: true,
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          },
          authProvider: 'local',
        });
      }
    }

    return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAdmin, async (req, res, next) => {
  try {
    if (supabase) {
      try {
        const { data: dbAdmin } = await supabase
          .from('admins')
          .select('id, username, email, role, created_at')
          .eq('id', req.admin.id)
          .single();

        if (dbAdmin) {
          return res.json({ success: true, admin: dbAdmin });
        }
      } catch (err) {
        // continue
      }
    }

    const admin = await queryOne('SELECT id, username, email, role, created_at FROM admins WHERE id = $1', [req.admin.id]);
    if (admin) {
      return res.json({ success: true, admin });
    }

    if (req.admin && req.admin.email) {
      return res.json({ success: true, admin: req.admin });
    }

    return res.status(404).json({ success: false, error: 'Admin not found' });
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
