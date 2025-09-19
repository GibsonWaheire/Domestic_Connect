/**
 * User-friendly error display component
 * Shows errors in a clean, non-technical way
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, X, AlertCircle } from 'lucide-react';
import { UserFriendlyError } from '@/lib/errorService';

interface ErrorDisplayProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'card' | 'inline' | 'toast';
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  variant = 'card',
  className = '',
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      window.location.reload();
    }
  };

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800 font-medium">{error.title}</p>
          <p className="text-xs text-red-600 mt-1">{error.message}</p>
        </div>
        {error.canRetry && onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRetry}
            className="text-red-700 border-red-300 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-red-600 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div className={`flex items-center gap-3 p-4 bg-white border border-red-200 rounded-lg shadow-lg ${className}`}>
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{error.title}</p>
          <p className="text-xs text-gray-600 mt-1">{error.message}</p>
        </div>
        {error.canRetry && onRetry && (
          <Button
            size="sm"
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`border-red-200 shadow-lg ${className}`}>
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-lg text-red-900">{error.title}</CardTitle>
        <CardDescription className="text-red-700">
          {error.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error ID for support */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Reference ID:</strong> {error.errorId}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Include this ID when contacting support if the problem persists.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {error.canRetry && onRetry && (
            <Button
              onClick={handleRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {error.action || 'Try Again'}
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Dismiss
            </Button>
          )}
        </div>

        {/* Support information */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Need help? Contact us at{' '}
            <a
              href="mailto:support@domesticconnect.com"
              className="text-blue-600 hover:underline"
            >
              support@domesticconnect.com
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Hook for displaying errors in components
 */
export const useErrorDisplay = () => {
  const [error, setError] = React.useState<UserFriendlyError | null>(null);

  const showError = (error: UserFriendlyError) => {
    setError(error);
  };

  const clearError = () => {
    setError(null);
  };

  const ErrorComponent = () => {
    if (!error) return null;

    return (
      <ErrorDisplay
        error={error}
        onRetry={clearError}
        onDismiss={clearError}
        variant="inline"
      />
    );
  };

  return {
    error,
    showError,
    clearError,
    ErrorComponent,
  };
};
