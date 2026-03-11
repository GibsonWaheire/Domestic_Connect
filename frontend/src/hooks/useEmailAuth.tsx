import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { User, apiRequest } from '@/lib/authUtils';
import { mapEmailAuthError } from '@/lib/authErrors';

export const useEmailAuth = (
    setLoading: (loading: boolean) => void,
    setUser: (user: User | null) => void,
    setIsFirebaseUser: (isFirebase: boolean) => void,
    shouldSyncFirebaseUserRef: React.MutableRefObject<boolean>
) => {
    const navigate = useNavigate();

    const signUp = async (
        email: string,
        password: string,
        userType: 'employer' | 'housegirl' | 'agency' | 'admin',
        additionalData: Record<string, unknown>
    ) => {
        try {
            setLoading(true);
            shouldSyncFirebaseUserRef.current = true;
            const { signUpWithEmail } = await import('@/lib/firebaseAuth');
            const result = await signUpWithEmail(email, password);
            const token = await result.user.getIdToken();
            const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency' | 'admin'; user?: User }>('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_type: userType,
                    mode: 'signup',
                    ...additionalData
                })
            });

            if ((response as { status?: string; user_type?: 'employer' | 'housegirl' | 'agency' | 'admin' }).status === 'account_exists') {
                const existingRole = (response as { user_type?: 'employer' | 'housegirl' | 'agency' | 'admin' }).user_type || 'employer';
                toast({
                    title: 'Account exists',
                    description: `Already registered as ${existingRole}. Sign in instead?`,
                    action: (
                        <ToastAction altText= "Sign in instead" onClick={() => navigate('/login')}>
                            Yes, Sign In
                                </ToastAction>
          ),
        });
return { error: null };
      }
if ((response as { status?: string }).status === 'not_found') {
    toast({
        title: 'Account not found',
        description: 'No account found with this number. Create an account first.',
    });
    navigate('/login?mode=signup');
    return { error: null };
}

if ((response as { status?: string; uid?: string }).status === 'role_required') {
    const responseUid = (response as { uid?: string }).uid || result.user.uid;
    navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
    return { error: null };
}

if (response.user) {
    setUser(response.user);
    setIsFirebaseUser(true);
}

const resolvedUserType = response.user_type;
switch (resolvedUserType) {
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
        navigate('/login?mode=select-role');
}

return { error: null };
    } catch (error: unknown) {
    shouldSyncFirebaseUserRef.current = false;
    const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
    const fallbackMessage = error instanceof Error ? error.message : String(error);
    return { error: mapEmailAuthError(errorCode) || fallbackMessage };
} finally {
    setLoading(false);
}
  };

const signIn = async (email: string, password: string) => {
    try {
        setLoading(true);
        shouldSyncFirebaseUserRef.current = true;
        const { signInWithEmail } = await import('@/lib/firebaseAuth');
        const result = await signInWithEmail(email, password);
        const token = await result.user.getIdToken();
        const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency' | 'admin'; user?: User }>('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                mode: 'login'
            })
        });

        if ((response as { status?: string }).status === 'not_found') {
            toast({
                title: 'Account not found',
                description: 'No account found with this number. Create an account first.',
            });
            navigate('/login?mode=signup');
            return { error: null, user: response.user };
        }

        if ((response as { status?: string; uid?: string }).status === 'role_required') {
            const responseUid = (response as { uid?: string }).uid || result.user.uid;
            navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
            return { error: null, user: response.user };
        }

        if (response.user) {
            setUser(response.user);
            setIsFirebaseUser(true);
        }

        const resolvedUserType = response.user_type;
        switch (resolvedUserType) {
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
                navigate('/login?mode=select-role');
        }

        return { error: null, user: response.user };
    } catch (error: unknown) {
        shouldSyncFirebaseUserRef.current = false;
        const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
        const fallbackMessage = error instanceof Error ? error.message : String(error);
        return { error: mapEmailAuthError(errorCode) || fallbackMessage };
    } finally {
        setLoading(false);
    }
};

const resetPassword = async (email: string) => {
    return { error: 'Password reset is no longer supported.' };
};

return {
    signIn,
    signUp,
    resetPassword
};
};
