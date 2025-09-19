// Centralized API configuration
// This ensures consistent API base URL across the entire application

export const getApiBaseUrl = (): string => {
  // Use environment variable if set, otherwise use production/development logic
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // In production, use relative URLs (Vercel proxy handles forwarding)
  // In development, use localhost
  return import.meta.env.PROD ? '' : 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
