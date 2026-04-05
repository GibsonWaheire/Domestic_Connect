import React, { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { User, apiRequest } from '@/lib/authUtils';
import { mapEmailAuthError } from '@/lib/authErrors';

export const useEmailAuth = (
    navigate: NavigateFunction,
    setLoading: (loading: boolean) => void,
    setUser: (user: User | null) => void,
    setIsFirebaseUser: (isFirebase: boolean) => void,
    shouldSyncFirebaseUserRef: React.MutableRefObject<boolean>
) => {

    const signUp = useCallback(async (
        email: string,
        password: string,
        userType: 'employer' | 'housegirl' | 'agency' | 'admin',
        additionalData: Record<string, unknown>
    ): Promise<{ error: string | null; needsVerification?: boolean }> => {
        try {
            setLoading(true);
            shouldSyncFirebaseUserRef.current = true;
            const { signUpWithEmail, sendVerificationEmail } = await import('@/lib/firebaseAuth');
            const result = await signUpWithEmail(email, password);

            // Send email verification before proceeding
            await sendVerificationEmail(result.user).catch(() => {
                // Non-fatal — user can request a resend later
            });

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
                setLoading(false);
                toast({
                    title: 'Account exists',
                    description: `Already registered as ${existingRole}. Sign in instead?`,
                    action: (
                        <ToastAction altText="Sign in instead" onClick={() => navigate('/login', { replace: true })}>
                            Yes, Sign In
                        </ToastAction>
                    ),
                });
                return { error: null };
            }
            if ((response as { status?: string }).status === 'not_found') {
                setLoading(false);
                toast({
                    title: 'Account not found',
                    description: 'No account found with this number. Create an account first.',
                });
                navigate('/login?mode=signup', { replace: true });
                return { error: null };
            }

            if ((response as { status?: string; uid?: string }).status === 'role_required') {
                const responseUid = (response as { uid?: string }).uid || result.user.uid;
                setLoading(false);
                navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`, { replace: true });
                return { error: null };
            }

            // Only show the verification screen if the backend confirmed account creation
            const backendOk = (response as { status?: string; user?: unknown }).status === 'ok' || !!(response as { user?: unknown }).user;
            setLoading(false);
            if (!backendOk) {
                // Backend returned an unexpected response — don't silently swallow it
                return { error: 'Account setup incomplete. Please try registering again.' };
            }
            // Account created — require email verification before dashboard access
            return { error: null, needsVerification: true };
        } catch (error: unknown) {
            shouldSyncFirebaseUserRef.current = false;
            const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
            const fallbackMessage = error instanceof Error ? error.message : String(error);
            return { error: mapEmailAuthError(errorCode) || fallbackMessage || 'Something went wrong. Please try again.' };
        } finally {
            setLoading(false);
        }
    }, [setLoading, shouldSyncFirebaseUserRef, setUser, setIsFirebaseUser]);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            setLoading(true);
            shouldSyncFirebaseUserRef.current = true;
            const { signInWithEmail, sendVerificationEmail } = await import('@/lib/firebaseAuth');
            const result = await signInWithEmail(email, password);

            // Block unverified email/password accounts
            if (!result.user.emailVerified) {
                await sendVerificationEmail(result.user).catch(() => {});
                setLoading(false);
                return { error: 'Email not verified. We sent a new verification link to ' + email + '. Please check your inbox and click the link before logging in.' };
            }

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
                setLoading(false);
                return { error: 'No account found with this email. Please create an account first.' };
            }

            if ((response as { status?: string; uid?: string }).status === 'role_required') {
                const responseUid = (response as { uid?: string }).uid || result.user.uid;
                setLoading(false);
                navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`, { replace: true });
                return { error: null, user: response.user };
            }

            if (response.user) {
                setUser(response.user);
                setIsFirebaseUser(true);
            }

            const resolvedUserType = response.user_type;
            setLoading(false);

            const pendingUnlockRawSignin = sessionStorage.getItem('unlock_after_login');
            if (pendingUnlockRawSignin) {
                try {
                    const pendingUnlock = JSON.parse(pendingUnlockRawSignin);
                    sessionStorage.removeItem('unlock_after_login');
                    if (pendingUnlock.profileId) {
                        navigate(`/housegirls?unlock=${pendingUnlock.profileId}`, { replace: true });
                    } else if (pendingUnlock.packageId) {
                        navigate(`/housegirls?bundle=${pendingUnlock.packageId}`, { replace: true });
                    }
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
            const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
            const fallbackMessage = error instanceof Error ? error.message : String(error);
            return { error: mapEmailAuthError(errorCode) || fallbackMessage || 'Something went wrong. Please try again.' };
        } finally {
            setLoading(false);
        }
    }, [setLoading, shouldSyncFirebaseUserRef, navigate, setUser, setIsFirebaseUser]);

    const resetPassword = useCallback(async (email: string) => {
        return { error: 'Password reset is no longer supported.' };
    }, []);

    return {
        signIn,
        signUp,
        resetPassword
    };
};
