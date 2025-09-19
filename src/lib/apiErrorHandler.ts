/**
 * API error handling wrapper
 * Provides consistent error handling for all API calls
 */

import { errorService, UserFriendlyError } from './errorService';

export interface ApiResponse<T = any> {
  data?: T;
  error?: UserFriendlyError;
  success: boolean;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  response?: Response;
}

/**
 * Enhanced fetch wrapper with error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      const apiError: ApiError = new Error(errorMessage);
      apiError.status = response.status;
      apiError.statusText = response.statusText;
      apiError.response = response;

      const userFriendlyError = errorService.handleApiError(apiError, url);
      
      return {
        success: false,
        error: userFriendlyError,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    const userFriendlyError = errorService.handleApiError(error, url);
    
    return {
      success: false,
      error: userFriendlyError,
    };
  }
}

/**
 * Safe API call wrapper that catches all errors
 */
export async function safeApiCall<T = any>(
  apiCall: () => Promise<T>,
  context?: string
): Promise<ApiResponse<T>> {
  try {
    const data = await apiCall();
    return {
      success: true,
      data,
    };
  } catch (error) {
    const userFriendlyError = errorService.getUserFriendlyError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    
    return {
      success: false,
      error: userFriendlyError,
    };
  }
}

/**
 * Retry wrapper for API calls
 */
export async function retryApiCall<T = any>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: string
): Promise<ApiResponse<T>> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const data = await apiCall();
      return {
        success: true,
        data,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('403') || 
        error.message.includes('404')
      )) {
        break;
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  const userFriendlyError = errorService.getUserFriendlyError(
    lastError || new Error('Unknown error'),
    `${context} (attempted ${maxRetries} times)`
  );

  return {
    success: false,
    error: userFriendlyError,
  };
}

/**
 * Hook for handling API errors in React components
 */
export function useApiErrorHandler() {
  const handleError = (error: unknown, context?: string): UserFriendlyError => {
    return errorService.handleApiError(error, context);
  };

  const handleApiResponse = <T>(response: ApiResponse<T>): T | null => {
    if (!response.success && response.error) {
      // You can show toast notifications here
      console.error('API Error:', response.error);
      return null;
    }
    return response.data || null;
  };

  return {
    handleError,
    handleApiResponse,
  };
}
