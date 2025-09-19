/**
 * Error logging and handling service
 * Provides centralized error logging and user-friendly error messages
 */

export interface ErrorLog {
  id: string;
  message: string;
  stack?: string;
  context?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface UserFriendlyError {
  title: string;
  message: string;
  action?: string;
  canRetry: boolean;
  errorId: string;
}

class ErrorService {
  private errorLogs: ErrorLog[] = [];
  private maxLogs = 100;

  /**
   * Log an error with context
   */
  logError(error: Error, context?: string, severity: ErrorLog['severity'] = 'medium', userId?: string): string {
    const errorId = this.generateErrorId();
    
    const errorLog: ErrorLog = {
      id: errorId,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId,
      severity,
    };

    // Add to local logs
    this.errorLogs.unshift(errorLog);
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${severity.toUpperCase()}] Error in ${context || 'unknown context'}:`, error);
      console.error('Error ID:', errorId);
    }

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorLog);
    }

    return errorId;
  }

  /**
   * Convert technical error to user-friendly message
   */
  getUserFriendlyError(error: Error, context?: string): UserFriendlyError {
    const errorId = this.logError(error, context);

    // Map common technical errors to user-friendly messages
    const errorMappings: Record<string, UserFriendlyError> = {
      'NetworkError': {
        title: 'Connection Problem',
        message: 'Please check your internet connection and try again.',
        action: 'Check your connection',
        canRetry: true,
        errorId,
      },
      'TypeError': {
        title: 'Something went wrong',
        message: 'We encountered an unexpected issue. Please try again.',
        action: 'Try again',
        canRetry: true,
        errorId,
      },
      'ReferenceError': {
        title: 'Page Error',
        message: 'There was a problem loading this page. Please refresh and try again.',
        action: 'Refresh page',
        canRetry: true,
        errorId,
      },
      'SyntaxError': {
        title: 'Data Error',
        message: 'We received unexpected data. Please try again.',
        action: 'Try again',
        canRetry: true,
        errorId,
      },
      'ChunkLoadError': {
        title: 'Loading Error',
        message: 'There was a problem loading the page. Please refresh your browser.',
        action: 'Refresh browser',
        canRetry: true,
        errorId,
      },
    };

    // Check for specific error patterns
    if (error.message.includes('Cannot access') && error.message.includes('before initialization')) {
      return {
        title: 'Loading Error',
        message: 'There was a problem loading this feature. Please refresh the page.',
        action: 'Refresh page',
        canRetry: true,
        errorId,
      };
    }

    if (error.message.includes('fetch')) {
      return {
        title: 'Connection Problem',
        message: 'Unable to connect to our servers. Please check your internet connection.',
        action: 'Check connection',
        canRetry: true,
        errorId,
      };
    }

    if (error.message.includes('auth') || error.message.includes('login')) {
      return {
        title: 'Authentication Error',
        message: 'There was a problem with your login. Please try signing in again.',
        action: 'Sign in again',
        canRetry: true,
        errorId,
      };
    }

    // Default fallback
    return errorMappings[error.name] || {
      title: 'Something went wrong',
      message: 'We encountered an unexpected issue. Our team has been notified.',
      action: 'Try again',
      canRetry: true,
      errorId,
    };
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(error: unknown, endpoint?: string): UserFriendlyError {
    let errorMessage = 'An unexpected error occurred';
    let errorName = 'ApiError';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorName = error.name;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    const context = endpoint ? `API call to ${endpoint}` : 'API call';
    const errorObj = new Error(errorMessage);
    errorObj.name = errorName;

    return this.getUserFriendlyError(errorObj, context);
  }

  /**
   * Get recent error logs (for debugging)
   */
  getRecentErrors(limit: number = 10): ErrorLog[] {
    return this.errorLogs.slice(0, limit);
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    this.errorLogs = [];
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToExternalService(errorLog: ErrorLog): Promise<void> {
    try {
      // In a real application, you would send this to an error tracking service
      // like Sentry, LogRocket, Bugsnag, or your own logging service
      
      // Example: Send to your backend
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorLog),
      // });

      // For now, just log to console
      console.error('Error sent to external service:', errorLog);
    } catch (sendError) {
      console.error('Failed to send error to external service:', sendError);
    }
  }
}

// Export singleton instance
export const errorService = new ErrorService();

// Export utility functions
export const logError = (error: Error, context?: string, severity?: ErrorLog['severity'], userId?: string) => 
  errorService.logError(error, context, severity, userId);

export const getUserFriendlyError = (error: Error, context?: string) => 
  errorService.getUserFriendlyError(error, context);

export const handleApiError = (error: unknown, endpoint?: string) => 
  errorService.handleApiError(error, endpoint);
