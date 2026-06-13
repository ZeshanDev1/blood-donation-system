/**
 * Centralized API configuration.
 *
 * Set NEXT_PUBLIC_API_URL in your environment (e.g. on Vercel) to the deployed
 * backend origin, for example: https://qbds-api.onrender.com
 *
 * It is read at build time for the browser bundle. The trailing slash (if any)
 * is stripped so callers can safely do `${API_BASE}/api/...`.
 */
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
).replace(/\/$/, '');

/** Build a full API/asset URL from a path that starts with `/`. */
export function apiUrl(path: string): string {
  if (!path) return API_BASE;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Resolve an image URL for rendering.
 * - Absolute URLs (e.g. Cloudinary `https://res.cloudinary.com/...`) are returned as-is.
 * - Relative paths (legacy local uploads like `/uploads/team/x.jpg`) are prefixed with API_BASE.
 */
export function imageSrc(url?: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`;
}
