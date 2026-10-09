export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getApiUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

/**
 * Ensures image URLs work consistently across all devices, mobile browsers, and Vercel/Render deployments.
 * Converts relative /uploads/... paths to fully qualified backend URLs while preserving external CDN links.
 */
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    return getApiUrl(url);
  }
  return url;
}
