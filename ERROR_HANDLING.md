# Error Handling System Documentation

This document explains how to use the comprehensive error handling system implemented in the Domestic Connect app.

## Overview

The error handling system ensures that users never see raw stack traces or technical errors. Instead, they see user-friendly messages while developers can still debug issues through proper logging.

## Components

### 1. Error Service (`src/lib/errorService.ts`)

The central service for logging errors and converting them to user-friendly messages.

```typescript
import { errorService, getUserFriendlyError, handleApiError } from '@/lib/errorService';

// Log an error
const errorId = errorService.logError(error, 'User authentication', 'high');

// Get user-friendly error message
const userFriendlyError = getUserFriendlyError(error, 'Sign in process');

// Handle API errors specifically
const apiError = handleApiError(error, '/api/auth/login');
```

### 2. API Error Handler (`src/lib/apiErrorHandler.ts`)

Provides safe API call wrappers that return user-friendly errors.

```typescript
import { safeApiCall, retryApiCall, useApiErrorHandler } from '@/lib/apiErrorHandler';

// Safe API call that returns user-friendly errors
const response = await safeApiCall(
  () => fetch('/api/users'),
  'Fetching user data'
);

if (!response.success) {
  // Show user-friendly error
  console.log(response.error.title, response.error.message);
} else {
  // Use the data
  console.log(response.data);
}

// Retry API call with automatic retries
const retryResponse = await retryApiCall(
  () => fetch('/api/data'),
  3, // max retries
  1000, // delay between retries
  'Data fetching'
);

// Hook for React components
const { handleError, handleApiResponse } = useApiErrorHandler();
```

### 3. Global Error Handler (`src/lib/globalErrorHandler.ts`)

Automatically initialized to catch unhandled errors.

```typescript
// Automatically initialized in main.tsx
import './lib/globalErrorHandler';

// Catches:
// - Unhandled promise rejections
// - JavaScript runtime errors
// - Resource loading errors
```

### 4. Error Display Component (`src/components/ErrorDisplay.tsx`)

Displays errors in a user-friendly way.

```typescript
import { ErrorDisplay, useErrorDisplay } from '@/components/ErrorDisplay';

// In a component
const { error, showError, clearError, ErrorComponent } = useErrorDisplay();

// Show an error
showError(userFriendlyError);

// Render error component
return (
  <div>
    <ErrorComponent />
    {/* Rest of component */}
  </div>
);

// Or use directly
<ErrorDisplay
  error={userFriendlyError}
  onRetry={handleRetry}
  onDismiss={clearError}
  variant="inline" // or "card" or "toast"
/>
```

### 5. Enhanced Error Boundary (`src/components/ErrorBoundary.tsx`)

Catches React component errors and shows fallback UI.

```typescript
import { ErrorBoundary, withErrorBoundary } from '@/components/ErrorBoundary';

// Wrap components
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>

// Or use HOC
const SafeComponent = withErrorBoundary(MyComponent);
```

## Usage Patterns

### 1. In API Calls

```typescript
// Old way (shows technical errors)
try {
  const response = await fetch('/api/data');
  const data = await response.json();
} catch (error) {
  // User sees: "TypeError: Failed to fetch"
  toast({ title: "Error", description: error.message });
}

// New way (shows user-friendly errors)
try {
  const response = await fetch('/api/data');
  const data = await response.json();
} catch (error) {
  const userFriendlyError = errorService.getUserFriendlyError(error, 'Data loading');
  // User sees: "Connection Problem - Please check your internet connection"
  toast({ 
    title: userFriendlyError.title, 
    description: userFriendlyError.message 
  });
}
```

### 2. In React Components

```typescript
import { useState } from 'react';
import { errorService } from '@/lib/errorService';
import { ErrorDisplay } from '@/components/ErrorDisplay';

function MyComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Your API call
      const result = await fetch('/api/data');
      
    } catch (error) {
      const userFriendlyError = errorService.getUserFriendlyError(error, 'Action');
      setError(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={handleAction}
          onDismiss={() => setError(null)}
          variant="inline"
        />
      )}
      
      <button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Do Action'}
      </button>
    </div>
  );
}
```

### 3. With Safe API Calls

```typescript
import { safeApiCall } from '@/lib/apiErrorHandler';
import { ErrorDisplay } from '@/components/ErrorDisplay';

function DataComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    const response = await safeApiCall(
      () => fetch('/api/data').then(res => res.json()),
      'Loading data'
    );

    if (response.success) {
      setData(response.data);
      setError(null);
    } else {
      setError(response.error);
    }
  };

  return (
    <div>
      {error && (
        <ErrorDisplay
          error={error}
          onRetry={loadData}
          onDismiss={() => setError(null)}
        />
      )}
      
      {data && <div>{/* Render data */}</div>}
    </div>
  );
}
```

## Error Mapping

The system automatically maps common technical errors to user-friendly messages:

| Technical Error | User-Friendly Message |
|----------------|----------------------|
| `Cannot access 'x' before initialization` | "Loading Error - There was a problem loading this feature. Please refresh the page." |
| `NetworkError` | "Connection Problem - Please check your internet connection and try again." |
| `TypeError` | "Something went wrong - We encountered an unexpected issue. Please try again." |
| `fetch` errors | "Connection Problem - Unable to connect to our servers. Please check your internet connection." |
| `auth`/`login` errors | "Authentication Error - There was a problem with your login. Please try signing in again." |

## Development vs Production

- **Development**: Errors are logged to console with full details
- **Production**: Errors are logged to external service (configurable) with user-friendly messages shown to users

## Best Practices

1. **Always use error handling**: Wrap API calls and async operations
2. **Provide context**: Include meaningful context when logging errors
3. **Show user-friendly messages**: Never expose technical details to users
4. **Include retry options**: Allow users to retry failed operations
5. **Log for debugging**: Ensure errors are properly logged for developers
6. **Use appropriate severity**: Mark errors as low, medium, high, or critical

## Example Implementation

See `src/components/AuthModal.tsx` for a complete example of how the error handling system is implemented in a real component.
