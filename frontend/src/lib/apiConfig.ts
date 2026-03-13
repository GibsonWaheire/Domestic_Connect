// Centralized API configuration
// This ensures consistent API base URL across the entire application

export const getApiBaseUrl = (): string => {
  // Use environment variable if set
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    // Force https if the current origin is https
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && envUrl.startsWith('http:')) {
      return envUrl.replace('http:', 'https:');
    }
    return envUrl;
  }
  
  // Prefer relative URLs both in development and production.
  // In development, Vite proxy handles forwarding /api to the backend.
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
