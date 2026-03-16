import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';

// Allowlist of internal paths that `redirectTo` may point to.
// Any value not in this set falls back to '/' to prevent open-redirect attacks.
const REDIRECT_ALLOWLIST = new Set([
  '/',
  '/login',
  '/home',
  '/employer-dashboard',
  '/housegirl-dashboard',
  '/agency-dashboard',
  '/admin-dashboard',
]);

function safeRedirect(path: string): string {
  return REDIRECT_ALLOWLIST.has(path) ? path : '/';
}

interface AuthGuardProps {
  children: React.ReactNode;
  allowedUserTypes: ('employer' | 'housegirl' | 'agency' | 'admin')[];
  redirectTo?: string;
}

/**
 * AuthGuard component that protects routes based on user type.
 * Prevents unauthorized access to dashboards.
 * All redirects are validated against an allowlist.
 */
export const AuthGuard = ({
  children,
  allowedUserTypes,
  redirectTo = '/'
}: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login');
        return;
      }

      const userType = user.is_admin ? 'admin' : user.user_type;
      const isAllowed = allowedUserTypes.includes(userType);

      if (!isAllowed) {
        switch (userType) {
          case 'employer':
            navigate('/employer-dashboard');
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
            navigate(safeRedirect(redirectTo));
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, loading, allowedUserTypes, navigate, redirectTo]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
      </div>
    );
  }

  if (!user) return null;

  const userType = user.is_admin ? 'admin' : user.user_type;
  const isAllowed = allowedUserTypes.includes(userType);

  if (!isAllowed) return null;

  return <>{children}</>;
};

export const withEmployerAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AuthGuard allowedUserTypes={['employer']}>
      <Component {...props} />
    </AuthGuard>
  );
};

export const withHousegirlAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AuthGuard allowedUserTypes={['housegirl']}>
      <Component {...props} />
    </AuthGuard>
  );
};

export const withAgencyAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AuthGuard allowedUserTypes={['agency']}>
      <Component {...props} />
    </AuthGuard>
  );
};

export const withAdminAuth = <P extends object>(Component: React.ComponentType<P>) => {
  return (props: P) => (
    <AuthGuard allowedUserTypes={['admin']}>
      <Component {...props} />
    </AuthGuard>
  );
};
