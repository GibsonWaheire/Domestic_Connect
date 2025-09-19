/**
 * Global error handler for unhandled errors
 * Catches errors that escape React error boundaries
 */

import { errorService } from './errorService';

class GlobalErrorHandler {
  private isInitialized = false;

  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      errorService.logError(error, 'unhandledrejection', 'high');
      
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message || 'Unknown error');
      
      errorService.logError(error, 'global', 'high');
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        console.error('Resource loading error:', event);
        
        const error = new Error(`Failed to load resource: ${(event.target as any)?.src || 'unknown'}`);
        errorService.logError(error, 'resource-loading', 'medium');
      }
    }, true);

    // Handle console errors (for debugging)
    if (process.env.NODE_ENV === 'development') {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Log to our error service if it looks like an error
        if (args[0] instanceof Error) {
          errorService.logError(args[0], 'console', 'low');
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  destroy(): void {
    if (!this.isInitialized) return;
    this.isInitialized = false;

    // Remove event listeners
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    window.removeEventListener('error', this.handleGlobalError);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    errorService.logError(error, 'unhandledrejection', 'high');
    
    event.preventDefault();
  };

  private handleGlobalError = (event: ErrorEvent) => {
    console.error('Global error:', event.error);
    
    const error = event.error instanceof Error 
      ? event.error 
      : new Error(event.message || 'Unknown error');
    
    errorService.logError(error, 'global', 'high');
  };
}

// Export singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  globalErrorHandler.init();
}
