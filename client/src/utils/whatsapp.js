export const WHATSAPP_PHONE = '13052132655';

export function getWhatsAppOrderUrl(product) {
  const name = product?.name || 'Beef Cut';
  const price = product?.price_display || (product?.price ? `$${product.price}` : '');
  const priceText = price ? ` (${price})` : '';
  const message = `Hello BestGrassFedCattle! I would like to order: ${name}${priceText}. Please confirm availability and harvest details.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
