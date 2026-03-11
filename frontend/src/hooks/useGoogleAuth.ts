import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { User, apiRequest } from '@/lib/authUtils';
import { FirebaseAuthService } from '@/lib/firebaseAuth';

export const useGoogleAuth = (
    setLoading: (loading: boolean) => void,
    setUser: (user: User | null) => void,
    setIsFirebaseUser: (isFirebase: boolean) => void,
    shouldSyncFirebaseUserRef: React.MutableRefObject<boolean>
) => {
    const navigate = useNavigate();

    const handleGoogleSignIn = async (userType?: 'employer' | 'housegirl' | 'agency' | 'admin', mode?: 'login' | 'signup') => {
        try {
            setLoading(true);
            shouldSyncFirebaseUserRef.current = true;
            sessionStorage.setItem('auth_mode', mode || 'login');
            if (userType) {
                sessionStorage.setItem('auth_user_type', userType);
            }
            const { signInWithGoogle: firebaseSignInWithGoogle } = await import('@/lib/firebaseAuth');
            await firebaseSignInWithGoogle();
            return { error: null };
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
    };

    const handleGoogleRedirectResult = async (mode?: 'login' | 'signup', userType?: 'employer' | 'housegirl' | 'agency' | 'admin') => {
        try {
            setLoading(true);
            const resolvedMode = mode || (sessionStorage.getItem('auth_mode') as 'login' | 'signup' | null) || 'login';
            const resolvedRedirectUserType = userType || (sessionStorage.getItem('auth_user_type') as 'employer' | 'housegirl' | 'agency' | 'admin' | null) || undefined;
            sessionStorage.removeItem('auth_mode');
            sessionStorage.removeItem('auth_user_type');
            const { getGoogleRedirectResult } = await import('@/lib/firebaseAuth');
            const result = await getGoogleRedirectResult();
            if (!result?.user) {
                return { error: null };
            }
            const token = await result.user.getIdToken();

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
                navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
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
                        navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
                        return { error: null, user: signupResponse.user };
                    }

                    if (signupResponse.user) {
                        setUser(signupResponse.user);
                        setIsFirebaseUser(true);
                    }

                    const signupUserType = signupResponse.user_type;
                    switch (signupUserType) {
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

                    return { error: null, user: signupResponse.user };
                }

                toast({
                    title: 'Account not found',
                    description: 'No account found with this number. Create an account first.',
                });
                navigate('/login?mode=signup');
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
    };

    return {
        handleGoogleSignIn,
        handleGoogleRedirectResult
    };
};
