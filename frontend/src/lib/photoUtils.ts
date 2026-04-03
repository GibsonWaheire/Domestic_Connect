const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://domesticconnect-production.up.railway.app';

/**
 * Converts a stored photo URL to an absolute URL.
 * The backend saves relative proxy paths like /api/photos/file/...
 * These must be prefixed with the backend origin before rendering in <img>.
 */
export const toAbsolutePhotoUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};
