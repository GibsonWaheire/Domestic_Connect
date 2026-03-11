import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedUserTypes: ('employer' | 'housegirl' | 'agency' | 'admin')[];
  redirectTo?: string;
}

/**
 * AuthGuard component that protects routes based on user type
 * Prevents unauthorized access to dashboards
 */
export const AuthGuard = ({
  children,
  allowedUserTypes,
  redirectTo = '/'
}: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // If no user is logged in, redirect to login silently
    if (!user) {
      console.log('AuthGuard: No user, redirecting to /login');
      navigate('/login');
      return;
    }

    // Check if user type is allowed
    const userType = user.is_admin ? 'admin' : user.user_type;
    const isAllowed = allowedUserTypes.includes(userType);

    if (!isAllowed) {
      // Redirect to appropriate dashboard based on user type silently
      console.log('AuthGuard: User not allowed for this route. User type:', userType, 'Allowed types:', allowedUserTypes);
      switch (userType) {
        case 'employer':
          console.log('AuthGuard: Redirecting to /employer-dashboard');
          navigate('/employer-dashboard');
          break;
        case 'housegirl':
          console.log('AuthGuard: Redirecting to /housegirl-dashboard');
          navigate('/housegirl-dashboard');
          break;
        case 'agency':
          console.log('AuthGuard: Redirecting to /agency-dashboard');
          navigate('/agency-dashboard');
          break;
        case 'admin':
          console.log('AuthGuard: Redirecting to /admin-dashboard');
          navigate('/admin-dashboard');
          break;
        default:
          console.log('AuthGuard: Redirecting to default:', redirectTo);
          navigate(redirectTo);
      }
      return;
    }
  }, [user, loading, allowedUserTypes, navigate, redirectTo]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  // Don't render children if user is not authorized
  if (!user) {
    return null;
  }

  const userType = user.is_admin ? 'admin' : user.user_type;
  const isAllowed = allowedUserTypes.includes(userType);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Higher-order component for protecting employer dashboard
 */
export const withEmployerAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AuthGuard allowedUserTypes={['employer']}>
      <Component {...props} />
    </AuthGuard>
  );
};

/**
 * Higher-order component for protecting housegirl dashboard
 */
export const withHousegirlAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AuthGuard allowedUserTypes={['housegirl']}>
      <Component {...props} />
    </AuthGuard>
  );
};

/**
 * Higher-order component for protecting agency dashboard
 */
export const withAgencyAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AuthGuard allowedUserTypes={['agency']}>
      <Component {...props} />
    </AuthGuard>
  );
};

/**
 * Higher-order component for protecting admin dashboard
 */
export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AuthGuard allowedUserTypes={['admin']}>
      <Component {...props} />
    </AuthGuard>
  );
};
