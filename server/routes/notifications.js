import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { getNotificationSettings, dispatchNotification } from '../services/notificationService.js';
import { sendTelegramNotification } from '../services/telegramAdapter.js';
import { sendEmailNotification } from '../services/emailAdapter.js';
import { sendWhatsAppNotification } from '../services/whatsappAdapter.js';

const router = express.Router();

/**
 * GET /api/admin/notifications/settings
 */
router.get('/settings', requireAdmin, async (req, res, next) => {
  try {
    const settings = await getNotificationSettings();
    // Mask sensitive fields slightly for UI
    res.json({
      success: true,
      settings: {
        ...settings,
        admin_dashboard_enabled: Boolean(settings.admin_dashboard_enabled),
        email_enabled: Boolean(settings.email_enabled),
        telegram_enabled: Boolean(settings.telegram_enabled),
        whatsapp_enabled: Boolean(settings.whatsapp_enabled),
        livechat_enabled: Boolean(settings.livechat_enabled),
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/notifications/settings
 */
router.put('/settings', requireAdmin, async (req, res, next) => {
  try {
    const {
      admin_dashboard_enabled,
      email_enabled,
      email_recipient,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_password,
      smtp_secure,
      telegram_enabled,
      telegram_bot_token,
      telegram_chat_id,
      whatsapp_enabled,
      whatsapp_phone_id,
      whatsapp_access_token,
      whatsapp_recipient_phone,
      livechat_enabled,
      livechat_webhook_url
    } = req.body;

    const existing = await queryOne('SELECT * FROM notification_settings WHERE id = $1', ['default']);

    await query(
      `UPDATE notification_settings SET
        admin_dashboard_enabled = $1, email_enabled = $2, email_recipient = $3,
        smtp_host = $4, smtp_port = $5, smtp_user = $6, smtp_password = $7,
        smtp_secure = $8, telegram_enabled = $9, telegram_bot_token = $10,
        telegram_chat_id = $11, whatsapp_enabled = $12, whatsapp_phone_id = $13,
        whatsapp_access_token = $14, whatsapp_recipient_phone = $15,
        livechat_enabled = $16, livechat_webhook_url = $17, updated_at = CURRENT_TIMESTAMP
       WHERE id = 'default'`,
      [
        admin_dashboard_enabled !== undefined ? (admin_dashboard_enabled ? 1 : 0) : existing?.admin_dashboard_enabled,
        email_enabled !== undefined ? (email_enabled ? 1 : 0) : existing?.email_enabled,
        email_recipient ?? existing?.email_recipient,
        smtp_host ?? existing?.smtp_host,
        smtp_port !== undefined ? Number(smtp_port) : existing?.smtp_port,
        smtp_user ?? existing?.smtp_user,
        smtp_password || existing?.smtp_password,
        smtp_secure !== undefined ? (smtp_secure ? 1 : 0) : existing?.smtp_secure,
        telegram_enabled !== undefined ? (telegram_enabled ? 1 : 0) : existing?.telegram_enabled,
        telegram_bot_token || existing?.telegram_bot_token,
        telegram_chat_id ?? existing?.telegram_chat_id,
        whatsapp_enabled !== undefined ? (whatsapp_enabled ? 1 : 0) : existing?.whatsapp_enabled,
        whatsapp_phone_id ?? existing?.whatsapp_phone_id,
        whatsapp_access_token || existing?.whatsapp_access_token,
        whatsapp_recipient_phone ?? existing?.whatsapp_recipient_phone,
        livechat_enabled !== undefined ? (livechat_enabled ? 1 : 0) : existing?.livechat_enabled,
        livechat_webhook_url ?? existing?.livechat_webhook_url
      ]
    );

    const updated = await getNotificationSettings();
    res.json({ success: true, settings: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/notifications/test (Verify / Ping a channel)
 */
router.post('/test', requireAdmin, async (req, res, next) => {
  try {
    const { channel } = req.body;
    const settings = await getNotificationSettings();

    if (channel === 'telegram') {
      if (!settings.telegram_bot_token || !settings.telegram_chat_id) {
        return res.status(400).json({ success: false, error: 'Telegram Bot Token and Chat ID must be configured and saved first.' });
      }
      const testResult = await sendTelegramNotification({
        botToken: settings.telegram_bot_token,
        chatId: settings.telegram_chat_id,
        text: `<b>BestGrassFedCattle — Test Notification</b>\n\n✅ Your Telegram notification channel is successfully connected! You will receive live customer order and wholesale requests here.`,
      });
      return res.json({ success: true, message: 'Test message sent to Telegram successfully!', result: testResult });
    }

    if (channel === 'email') {
      if (!settings.smtp_host || !settings.smtp_user) {
        return res.status(400).json({ success: false, error: 'SMTP Host and User must be configured first.' });
      }
      const testResult = await sendEmailNotification({
        settings,
        subject: 'BestGrassFedCattle — SMTP Email Channel Test',
        htmlContent: '<h3>✅ SMTP Connection Verified</h3><p>Your email channel for BestGrassFedCattle order requests is working properly.</p>',
        textContent: 'SMTP Connection Verified. Your email channel for BestGrassFedCattle order requests is working properly.',
      });
      return res.json({ success: true, message: 'Test email sent successfully!', result: testResult });
    }

    if (channel === 'whatsapp') {
      if (!settings.whatsapp_phone_id || !settings.whatsapp_access_token || !settings.whatsapp_recipient_phone) {
        return res.status(400).json({ success: false, error: 'WhatsApp Phone ID, Access Token, and Recipient Phone must be configured first.' });
      }
      const testResult = await sendWhatsAppNotification({
        phoneId: settings.whatsapp_phone_id,
        accessToken: settings.whatsapp_access_token,
        recipientPhone: settings.whatsapp_recipient_phone,
        messageText: 'BestGrassFedCattle: WhatsApp notification integration test successful!',
      });
      return res.json({ success: true, message: 'Test WhatsApp message sent!', result: testResult });
    }

    return res.status(400).json({ success: false, error: `Unsupported test channel: ${channel}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/notifications/logs (Audit Trail)
 */
router.get('/logs', requireAdmin, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 50');
    res.json({ success: true, logs: result.rows });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/notifications/unread
 */
router.get('/unread', requireAdmin, async (req, res, next) => {
  try {
    const countResult = await queryOne('SELECT COUNT(*) as count FROM admin_notifications WHERE is_read = 0');
    const recentResult = await query('SELECT * FROM admin_notifications ORDER BY created_at DESC LIMIT 10');
    res.json({
      success: true,
      unreadCount: Number(countResult?.count) || 0,
      notifications: recentResult.rows
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/notifications/read-all
 */
router.patch('/read-all', requireAdmin, async (req, res, next) => {
  try {
    await query('UPDATE admin_notifications SET is_read = 1 WHERE is_read = 0');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

export default router;
