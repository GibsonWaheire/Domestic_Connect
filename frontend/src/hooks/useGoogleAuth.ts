import React, { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { User, apiRequest } from '@/lib/authUtils';
import { FirebaseAuthService } from '@/lib/firebaseAuth';

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
            console.log('Google popup result:', result);

            if (!result?.user) {
                setLoading(false);
                return { error: 'Sign in failed or was cancelled.' };
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
            console.log('Verify response:', response);

            if ((response as { status?: string; uid?: string }).status === 'role_required') {
                const responseUid = (response as { uid?: string }).uid || result.user.uid;
                setLoading(false);
                console.log('Navigating to:', `/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
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
                        console.log('Navigating to:', `/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
                        navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`, { replace: true });
                        return { error: null, user: signupResponse.user };
                    }

                    if (signupResponse.user) {
                        setUser(signupResponse.user);
                        setIsFirebaseUser(true);
                    }

                    const signupUserType = signupResponse.user_type;
                    setLoading(false);
                    switch (signupUserType) {
                        case 'employer':
                            console.log('Navigating to:', '/employer-dashboard');
                            navigate('/employer-dashboard', { replace: true });
                            break;
                        case 'housegirl':
                            console.log('Navigating to:', '/housegirl-dashboard');
                            navigate('/housegirl-dashboard', { replace: true });
                            break;
                        case 'agency':
                            console.log('Navigating to:', '/agency-dashboard');
                            navigate('/agency-dashboard', { replace: true });
                            break;
                        case 'admin':
                            console.log('Navigating to:', '/admin-dashboard');
                            navigate('/admin-dashboard', { replace: true });
                            break;
                        default:
                            console.log('Navigating to:', '/login?mode=select-role');
                            navigate('/login?mode=select-role', { replace: true });
                    }

                    return { error: null, user: signupResponse.user };
                }

                setLoading(false);
                toast({
                    title: 'Account not found',
                    description: 'No account found. Please create an account first.',
                });
                console.log('Navigating to:', '/login?mode=signup');
                navigate('/login?mode=signup', { replace: true });
                return { error: null, user: response.user };
            }

            if (response.user) {
                setUser(response.user);
                setIsFirebaseUser(true);
            }

            const resolvedUserType = response.user_type;
            setLoading(false);
            switch (resolvedUserType) {
                case 'employer':
                    console.log('Navigating to:', '/employer-dashboard');
                    navigate('/employer-dashboard', { replace: true });
                    break;
                case 'housegirl':
                    console.log('Navigating to:', '/housegirl-dashboard');
                    navigate('/housegirl-dashboard', { replace: true });
                    break;
                case 'agency':
                    console.log('Navigating to:', '/agency-dashboard');
                    navigate('/agency-dashboard', { replace: true });
                    break;
                case 'admin':
                    console.log('Navigating to:', '/admin-dashboard');
                    navigate('/admin-dashboard', { replace: true });
                    break;
                default:
                    console.log('Navigating to:', '/login?mode=select-role');
                    navigate('/login?mode=select-role', { replace: true });
            }

            return { error: null, user: response.user };
        } catch (error: unknown) {
            shouldSyncFirebaseUserRef.current = false;
            const exactError = error instanceof Error ? error.message : String(error);
            toast({
                title: 'Sign In Error',
                description: exactError || 'Something went wrong. Please try again.',
                variant: 'destructive'
            });
            return { error: exactError || 'Something went wrong. Please try again.' };
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
