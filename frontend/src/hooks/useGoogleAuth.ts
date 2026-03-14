import React, { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { User, apiRequest } from '@/lib/authUtils';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { mapGoogleAuthError } from '@/lib/authErrors';

export const useGoogleAuth = (
    navigate: NavigateFunction,
    setLoading: (loading: boolean) => void,
    setUser: (user: User | null) => void,
    setIsFirebaseUser: (isFirebase: boolean) => void,
    shouldSyncFirebaseUserRef: React.MutableRefObject<boolean>
) => {
    const handleGoogleSignIn = useCallback(async (userType?: 'employer' | 'housegirl' | 'agency' | 'admin', mode?: 'login' | 'signup') => {
        try {
            setLoading(true);
            shouldSyncFirebaseUserRef.current = true;

            const { signInWithGoogle: firebaseSignInWithGoogle } = await import('@/lib/firebaseAuth');
            const result = await firebaseSignInWithGoogle();


            if (!result?.user) {
                setLoading(false);
                return { error: 'Sign in was cancelled.' };
            }

            const token = await result.user.getIdToken();
            const resolvedMode = mode || 'login';
            const resolvedRedirectUserType = userType;

            const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency' | 'admin'; user?: User }>('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_type: resolvedRedirectUserType,
                    mode: resolvedMode,
                    display_name: result.user.displayName,
                    email: result.user.email,
                    photo_url: result.user.photoURL
                })
            });


            if ((response as { status?: string; uid?: string }).status === 'role_required') {
                const responseUid = (response as { uid?: string }).uid || result.user.uid;
                setLoading(false);
                navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`, { replace: true });
                return { error: null, user: response.user };
            }

            if ((response as { status?: string }).status === 'not_found') {
                if (resolvedMode === 'signup') {
                    const signupResponse = await apiRequest<{ status?: string; user_type: 'employer' | 'housegirl' | 'agency' | 'admin'; user?: User; uid?: string }>('/api/auth/verify', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            user_type: resolvedRedirectUserType,
                            mode: 'signup',
                            display_name: result.user.displayName,
                            email: result.user.email,
                            photo_url: result.user.photoURL
                        })
                    });

                    if (signupResponse.status === 'role_required') {
                        const responseUid = signupResponse.uid || result.user.uid;
                        setLoading(false);
                        navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`, { replace: true });
                        return { error: null, user: signupResponse.user };
                    }

                    if (signupResponse.user) {
                        setUser(signupResponse.user);
                        setIsFirebaseUser(true);
                    }

                    const signupUserType = signupResponse.user_type;
                    setLoading(false);

                    const pendingUnlockRawSignup = sessionStorage.getItem('unlock_after_login');
                    if (pendingUnlockRawSignup) {
                        try {
                            const pendingUnlock = JSON.parse(pendingUnlockRawSignup);
                            sessionStorage.removeItem('unlock_after_login');
                            navigate(`/housegirls?unlock=${pendingUnlock.profileId}`, { replace: true });
                            return { error: null, user: signupResponse.user };
                        } catch {
                            sessionStorage.removeItem('unlock_after_login');
                        }
                    }

                    switch (signupUserType) {
                        case 'employer':
                            navigate('/employer-dashboard', { replace: true });
                            break;
                        case 'housegirl':
                            navigate('/housegirl-dashboard', { replace: true });
                            break;
                        case 'agency':
                            navigate('/agency-dashboard', { replace: true });
                            break;
                        case 'admin':
                            navigate('/admin-dashboard', { replace: true });
                            break;
                        default:
                            navigate('/login?mode=select-role', { replace: true });
                    }

                    return { error: null, user: signupResponse.user };
                }

                setLoading(false);
                toast({
                    title: 'Account not found',
                    description: 'No account found. Please create an account first.',
                });
                navigate('/login?mode=signup', { replace: true });
                return { error: null, user: response.user };
            }

            if (response.user) {
                setUser(response.user);
                setIsFirebaseUser(true);
            }

            const resolvedUserType = response.user_type;
            setLoading(false);

            const pendingUnlockRaw = sessionStorage.getItem('unlock_after_login');
            if (pendingUnlockRaw) {
                try {
                    const pendingUnlock = JSON.parse(pendingUnlockRaw);
                    sessionStorage.removeItem('unlock_after_login');
                    navigate(`/housegirls?unlock=${pendingUnlock.profileId}`, { replace: true });
                    return { error: null, user: response.user };
                } catch {
                    sessionStorage.removeItem('unlock_after_login');
                }
            }

            switch (resolvedUserType) {
                case 'employer':
                    navigate('/employer-dashboard', { replace: true });
                    break;
                case 'housegirl':
                    navigate('/housegirl-dashboard', { replace: true });
                    break;
                case 'agency':
                    navigate('/agency-dashboard', { replace: true });
                    break;
                case 'admin':
                    navigate('/admin-dashboard', { replace: true });
                    break;
                default:
                    navigate('/login?mode=select-role', { replace: true });
            }

            return { error: null, user: response.user };
        } catch (error: unknown) {
            shouldSyncFirebaseUserRef.current = false;
            const errorCode = typeof error === 'object' && error !== null && 'code' in error
                ? String((error as { code: unknown }).code)
                : undefined;
            const friendlyMessage = mapGoogleAuthError(errorCode);

            // Don't show a toast for silent cancellations
            const isSilent = errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request';
            if (!isSilent) {
                toast({
                    title: 'Google Sign In Failed',
                    description: friendlyMessage,
                    variant: 'destructive'
                });
            }
            return { error: friendlyMessage };
        } finally {
            setLoading(false);
        }
    }, [navigate, setLoading, setUser, setIsFirebaseUser, shouldSyncFirebaseUserRef]);

    const handleGoogleRedirectResult = useCallback(async (mode?: 'login' | 'signup', userType?: 'employer' | 'housegirl' | 'agency' | 'admin') => {
        // No-op for popup flow
        return { error: null };
    }, []);

    return {
        handleGoogleSignIn,
        handleGoogleRedirectResult
    };
};
