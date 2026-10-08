import { query, queryOne } from '../config/db.js';
import { sendTelegramNotification } from './telegramAdapter.js';
import { sendEmailNotification } from './emailAdapter.js';
import { sendWhatsAppNotification } from './whatsappAdapter.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get active notification settings
 */
export async function getNotificationSettings() {
  const settings = await queryOne('SELECT * FROM notification_settings WHERE id = $1', ['default']);
  return settings || {
    admin_dashboard_enabled: 1,
    email_enabled: 0,
    telegram_enabled: 0,
    whatsapp_enabled: 0,
    livechat_enabled: 0,
  };
}

/**
 * Log notification outcome into notification_logs
 */
async function logNotification({ eventType, referenceNo, channel, status, errorMessage = null, payload = {} }) {
  try {
    await query(
      `INSERT INTO notification_logs (id, event_type, reference_no, channel, status, error_message, payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uuidv4(), eventType, referenceNo, channel, status, errorMessage, JSON.stringify(payload)]
    );
  } catch (err) {
    console.error('Failed to write notification log:', err.message);
  }
}

/**
 * Universal Multi-Channel Dispatcher
 */
export async function dispatchNotification({ eventType, referenceNo, title, messageHtml, messageText, rawPayload }) {
  const settings = await getNotificationSettings();
  const results = {};

  // 1. Admin Dashboard Notification
  if (settings.admin_dashboard_enabled) {
    try {
      await query(
        `INSERT INTO admin_notifications (id, title, message, type, is_read)
         VALUES ($1, $2, $3, $4, 0)`,
        [uuidv4(), title, messageText, eventType]
      );
      await logNotification({ eventType, referenceNo, channel: 'dashboard', status: 'sent', payload: rawPayload });
      results.dashboard = { status: 'sent' };
    } catch (err) {
      await logNotification({ eventType, referenceNo, channel: 'dashboard', status: 'failed', errorMessage: err.message, payload: rawPayload });
      results.dashboard = { status: 'failed', error: err.message };
    }
  } else {
    results.dashboard = { status: 'skipped' };
  }

  // 2. Telegram Bot
  if (settings.telegram_enabled && settings.telegram_bot_token && settings.telegram_chat_id) {
    try {
      await sendTelegramNotification({
        botToken: settings.telegram_bot_token,
        chatId: settings.telegram_chat_id,
        text: messageHtml,
      });
      await logNotification({ eventType, referenceNo, channel: 'telegram', status: 'sent', payload: rawPayload });
      results.telegram = { status: 'sent' };
    } catch (err) {
      await logNotification({ eventType, referenceNo, channel: 'telegram', status: 'failed', errorMessage: err.message, payload: rawPayload });
      results.telegram = { status: 'failed', error: err.message };
    }
  } else {
    results.telegram = { status: 'skipped', reason: settings.telegram_enabled ? 'Credentials missing' : 'Disabled' };
  }

  // 3. Email (SMTP)
  if (settings.email_enabled && settings.smtp_host) {
    try {
      await sendEmailNotification({
        settings,
        subject: title,
        htmlContent: messageHtml,
        textContent: messageText,
      });
      await logNotification({ eventType, referenceNo, channel: 'email', status: 'sent', payload: rawPayload });
      results.email = { status: 'sent' };
    } catch (err) {
      await logNotification({ eventType, referenceNo, channel: 'email', status: 'failed', errorMessage: err.message, payload: rawPayload });
      results.email = { status: 'failed', error: err.message };
    }
  } else {
    results.email = { status: 'skipped', reason: settings.email_enabled ? 'SMTP unconfigured' : 'Disabled' };
  }

  // 4. WhatsApp
  if (settings.whatsapp_enabled && settings.whatsapp_phone_id && settings.whatsapp_access_token && settings.whatsapp_recipient_phone) {
    try {
      await sendWhatsAppNotification({
        phoneId: settings.whatsapp_phone_id,
        accessToken: settings.whatsapp_access_token,
        recipientPhone: settings.whatsapp_recipient_phone,
        messageText: messageText,
      });
      await logNotification({ eventType, referenceNo, channel: 'whatsapp', status: 'sent', payload: rawPayload });
      results.whatsapp = { status: 'sent' };
    } catch (err) {
      await logNotification({ eventType, referenceNo, channel: 'whatsapp', status: 'failed', errorMessage: err.message, payload: rawPayload });
      results.whatsapp = { status: 'failed', error: err.message };
    }
  } else {
    results.whatsapp = { status: 'skipped', reason: settings.whatsapp_enabled ? 'WhatsApp credentials missing' : 'Disabled' };
  }

  // 5. LiveChat / Outgoing Webhook
  if (settings.livechat_enabled && settings.livechat_webhook_url) {
    try {
      await fetch(settings.livechat_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          referenceNo,
          title,
          message: messageText,
          data: rawPayload,
          timestamp: new Date().toISOString(),
        }),
      });
      await logNotification({ eventType, referenceNo, channel: 'livechat', status: 'sent', payload: rawPayload });
      results.livechat = { status: 'sent' };
    } catch (err) {
      await logNotification({ eventType, referenceNo, channel: 'livechat', status: 'failed', errorMessage: err.message, payload: rawPayload });
      results.livechat = { status: 'failed', error: err.message };
    }
  } else {
    results.livechat = { status: 'skipped' };
  }

  return results;
}

/**
 * High-Level Formatter for Order Requests
 */
export async function notifyNewOrderRequest(order) {
  const title = `🥩 New Order Request: ${order.reference_no} (${order.product_name})`;
  const messageText = `NEW BESTGRASSFEDCATTLE ORDER REQUEST
Request: ${order.reference_no}
Customer: ${order.customer_name}
Product: ${order.product_name}
Quantity: ${order.quantity}
Cut Preference: ${order.cut_preference || 'Standard'}
Contact Method: ${order.contact_preference}
Email: ${order.email}
Phone: ${order.phone}
Special Instructions: ${order.special_instructions || 'None'}
Notes: ${order.additional_notes || 'None'}
Status: New Request`;

  const messageHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #183222; margin-top: 0;">🥩 New Order Request: ${order.reference_no}</h2>
      <p style="font-size: 16px; color: #444;">A customer has submitted a new product order request on BestGrassFedCattle.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Reference:</td><td>${order.reference_no}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Customer:</td><td>${order.customer_name}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Product:</td><td><strong>${order.product_name}</strong></td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Quantity:</td><td>${order.quantity}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Cut Preference:</td><td>${order.cut_preference || 'Standard'}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${order.email}">${order.email}</a></td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${order.phone}">${order.phone}</a></td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Preferred Contact:</td><td>${order.contact_preference}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Instructions:</td><td>${order.special_instructions || 'None'}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 12px; background: #faf8f5; border-left: 4px solid #2a5e37;">
        <strong>Next Step:</strong> Review stock availability and contact the customer directly to confirm and finalize arrangements.
      </div>
    </div>
  `;

  return dispatchNotification({
    eventType: 'order_request',
    referenceNo: order.reference_no,
    title,
    messageHtml,
    messageText,
    rawPayload: order,
  });
}

/**
 * High-Level Formatter for Wholesale Requests
 */
export async function notifyNewWholesaleRequest(req) {
  const title = `🏢 New Wholesale Inquiry: ${req.reference_no} (${req.company_name})`;
  const messageText = `NEW WHOLESALE/BULK BEEF REQUEST
Reference: ${req.reference_no}
Company: ${req.company_name} (${req.business_type})
Contact: ${req.full_name}
Email: ${req.email}
Phone: ${req.phone}
Location: ${req.location}
Products Interested: ${req.products_interested}
Estimated Quantity: ${req.estimated_quantity}
Purchase Frequency: ${req.purchase_frequency || 'N/A'}
Message: ${req.message || 'None'}`;

  const messageHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #183222; margin-top: 0;">🏢 New Wholesale/Bulk Inquiry</h2>
      <p style="font-size: 16px; color: #444;">A commercial entity has submitted a volume beef request.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Reference:</td><td>${req.reference_no}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Company:</td><td><strong>${req.company_name}</strong> (${req.business_type})</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Contact Person:</td><td>${req.full_name}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Location:</td><td>${req.location}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Products:</td><td>${req.products_interested}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Est. Quantity:</td><td>${req.estimated_quantity}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Frequency:</td><td>${req.purchase_frequency}</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${req.email}">${req.email}</a></td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td><a href="tel:${req.phone}">${req.phone}</a></td></tr>
      </table>
    </div>
  `;

  return dispatchNotification({
    eventType: 'wholesale_request',
    referenceNo: req.reference_no,
    title,
    messageHtml,
    messageText,
    rawPayload: req,
  });
}

/**
 * High-Level Formatter for Contact Messages
 */
export async function notifyNewContactMessage(msg) {
  const title = `📩 New Farm Contact Message: ${msg.subject}`;
  const messageText = `NEW CONTACT MESSAGE
From: ${msg.name} (${msg.email})
Phone: ${msg.phone || 'N/A'}
Subject: ${msg.subject}
Message: ${msg.message}`;

  const messageHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #183222; margin-top: 0;">📩 New Contact Message</h2>
      <p><strong>From:</strong> ${msg.name} (<a href="mailto:${msg.email}">${msg.email}</a>)</p>
      <p><strong>Phone:</strong> ${msg.phone || 'None'}</p>
      <p><strong>Subject:</strong> ${msg.subject}</p>
      <div style="background: #f9f9f9; padding: 12px; border-radius: 4px; margin-top: 10px;">${msg.message}</div>
    </div>
  `;

  return dispatchNotification({
    eventType: 'contact',
    referenceNo: `MSG-${Date.now().toString().slice(-5)}`,
    title,
    messageHtml,
    messageText,
    rawPayload: msg,
  });
}
