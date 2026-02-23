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

    // If no user is logged in, redirect to home
    if (!user) {
      toast({
        title: "Access Denied",
        description: "Please sign in to access this page.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    // Check if user type is allowed
    const userType = user.is_admin ? 'admin' : user.user_type;
    const isAllowed = allowedUserTypes.includes(userType);

    if (!isAllowed) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to access this page. This area is for ${allowedUserTypes.join(' or ')} only.`,
        variant: "destructive"
      });
      
      // Redirect to appropriate dashboard based on user type
      switch (userType) {
        case 'employer':
          navigate('/dashboard');
          break;
        case 'housegirl':
          navigate('/housegirl-dashboard');
          break;
        case 'agency':
          navigate('/agency-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate(redirectTo);
      }
      return;
    }
  }, [user, loading, allowedUserTypes, navigate, redirectTo]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
