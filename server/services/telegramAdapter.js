/**
 * Telegram Notification Adapter
 * Connects to Telegram Bot API: https://api.telegram.org/bot<token>/sendMessage
 */
export async function sendTelegramNotification({ botToken, chatId, text }) {
  if (!botToken || !chatId) {
    throw new Error('Telegram bot token or chat ID is missing in notification settings.');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Telegram API Error: ${data.description || 'Unknown error'}`);
  }

  return { success: true, messageId: data.result?.message_id };
}
