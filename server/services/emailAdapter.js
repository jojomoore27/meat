import nodemailer from 'nodemailer';

/**
 * SMTP Email Notification Adapter
 */
export async function sendEmailNotification({ settings, subject, htmlContent, textContent }) {
  if (!settings.smtp_host || !settings.smtp_user) {
    throw new Error('SMTP host or user is not configured in settings.');
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: Number(settings.smtp_port) || 587,
    secure: Boolean(settings.smtp_secure),
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_password,
    },
  });

  const mailOptions = {
    from: `"BestGrassFedCattle Notifications" <${settings.smtp_user}>`,
    to: settings.email_recipient || settings.smtp_user,
    subject: subject,
    text: textContent,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
}
