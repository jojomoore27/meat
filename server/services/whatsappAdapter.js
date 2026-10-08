/**
 * WhatsApp Business / Cloud API Notification Adapter
 */
export async function sendWhatsAppNotification({ phoneId, accessToken, recipientPhone, messageText }) {
  if (!phoneId || !accessToken || !recipientPhone) {
    throw new Error('WhatsApp Phone ID, Access Token, or Recipient Phone is missing in settings.');
  }

  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipientPhone.replace(/[^\d+]/g, ''),
      type: 'text',
      text: { body: messageText },
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`WhatsApp API Error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return { success: true, messageId: data.messages?.[0]?.id };
}
