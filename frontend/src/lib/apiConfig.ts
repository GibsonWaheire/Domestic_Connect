// Centralized API configuration
// This ensures consistent API base URL across the entire application

export const getApiBaseUrl = (): string => {
  // Use environment variable if set, otherwise use production/development logic
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Prefer relative URLs both in development and production.
  // In development, Vite proxy handles forwarding /api to the backend.
  return '';
};

export const API_BASE_URL = getApiBaseUrl();
