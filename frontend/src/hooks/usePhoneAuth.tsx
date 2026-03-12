import React, { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { User, API_BASE_URL, apiRequest, formatKenyanPhone } from '@/lib/authUtils';
import { mapPhoneAuthError } from '@/lib/authErrors';

export const usePhoneAuth = (
    navigate: NavigateFunction,
    setLoading: (loading: boolean) => void,
    setUser: (user: User | null) => void,
    setIsFirebaseUser: (isFirebase: boolean) => void,
    shouldSyncFirebaseUserRef: React.MutableRefObject<boolean>,
    phoneNumber: string,
    setPhoneNumber: (phone: string) => void,
    selectedUserType: 'employer' | 'housegirl' | 'agency' | 'admin',
    setSelectedUserType: (type: 'employer' | 'housegirl' | 'agency' | 'admin') => void,
    selectedMode: 'login' | 'signup',
    setSelectedMode: (mode: 'login' | 'signup') => void,
    setAuthStep: (step: 1 | 2) => void
) => {

    const changePhoneNumber = useCallback(() => {
        setAuthStep(1);
    }, [setAuthStep]);

    const handleSendOTP = useCallback(async (rawPhone: string, userType: 'employer' | 'housegirl' | 'agency' | 'admin', mode: 'login' | 'signup' = 'login') => {
        try {
            setLoading(true);
            const formattedPhone = formatKenyanPhone(rawPhone);
            const res = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: formattedPhone })
            });
            const data = await res.json();
            if (!res.ok) {
                return { error: data.error || 'Failed to send code. Please try again.' };
            }
            setPhoneNumber(formattedPhone);
            setSelectedUserType(userType);
            setSelectedMode(mode);
            setAuthStep(2);
            return { error: null, otpSent: true };
        } catch {
            return { error: 'Failed to send code. Please try again.' };
        } finally {
            setLoading(false);
        }
    }, [setLoading, setPhoneNumber, setSelectedUserType, setSelectedMode, setAuthStep]);

    const _navigateByUserType = useCallback((userType: string) => {
        switch (userType) {
            case 'employer':   navigate('/employer-dashboard', { replace: true }); break;
            case 'housegirl':  navigate('/housegirl-dashboard', { replace: true }); break;
            case 'agency':     navigate('/agency-dashboard', { replace: true }); break;
            case 'admin':      navigate('/admin-dashboard', { replace: true }); break;
            default:           navigate('/login?mode=select-role', { replace: true });
        }
    }, [navigate]);

    const handleVerifyOTP = useCallback(async (code: string, mode?: 'login' | 'signup') => {
        if (!phoneNumber) {
            return { error: 'Please request a code first.' };
        }
        try {
            setLoading(true);
            shouldSyncFirebaseUserRef.current = true;

            // Step 1: validate the SMS code with our backend
            const otpRes = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number: phoneNumber,
                    code,
                    user_type: selectedUserType,
                    mode
                })
            });
            const otpData = await otpRes.json();
            if (!otpRes.ok || !otpData.success) {
                shouldSyncFirebaseUserRef.current = false;
                const friendlyMessage = mapPhoneAuthError(undefined, otpData.error) || otpData.error || 'Invalid code.';
                return { error: friendlyMessage };
            }

            // Step 2: sign into Firebase with the custom token
            const { signInWithCustomToken } = await import('firebase/auth');
            const { auth } = await import('@/lib/firebase');
            const userCredential = await signInWithCustomToken(auth, otpData.custom_token);
            const token = await userCredential.user.getIdToken();

            // Step 3: call /api/auth/verify to create/update user record
            const response = await apiRequest<{
                status?: string;
                uid?: string;
                user_type?: 'employer' | 'housegirl' | 'agency' | 'admin';
                user?: User;
            }>('/api/auth/verify', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ user_type: selectedUserType, mode })
            });

            if (response.status === 'account_exists') {
                const existingRole = response.user_type || 'this number';
                setLoading(false);
                toast({
                    title: 'Account exists',
                    description: `Already registered as ${existingRole}. Sign in instead?`,
                    action: (
                        <ToastAction
                            altText="Sign in instead"
                            onClick={async () => {
                                try {
                                    setSelectedMode('login');
                                    const loginResponse = await apiRequest<{
                                        user_type?: 'employer' | 'housegirl' | 'agency' | 'admin';
                                        user?: User;
                                    }>('/api/auth/verify', {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${token}` },
                                        body: JSON.stringify({ mode: 'login' })
                                    });
                                    if (loginResponse.user) {
                                        setUser(loginResponse.user);
                                        setIsFirebaseUser(true);
                                    }
                                    _navigateByUserType(loginResponse.user_type || '');
                                } catch {}
                            }}
                        >
                            Yes, Sign In
                        </ToastAction>
                    ),
                });
                return { error: null };
            }

            if (response.status === 'not_found') {
                setLoading(false);
                toast({ title: 'Account not found', description: 'No account found with this number. Create an account first.' });
                setSelectedMode('signup');
                changePhoneNumber();
                navigate('/login?mode=signup', { replace: true });
                return { error: null };
            }

            if (response.status === 'role_required') {
                const responseUid = response.uid || userCredential.user.uid;
                setLoading(false);
                navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`, { replace: true });
                return { error: null };
            }

            if (response.user) {
                setUser(response.user);
                setIsFirebaseUser(true);
            }

            setLoading(false);
            _navigateByUserType(response.user_type || '');
            return { error: null, userType: response.user_type };

        } catch (error: unknown) {
            shouldSyncFirebaseUserRef.current = false;
            const errorCode = typeof error === 'object' && error !== null && 'code' in error
                ? String((error as { code: unknown }).code)
                : undefined;
            const exactError = error instanceof Error ? error.message : String(error);
            const friendlyMessage = mapPhoneAuthError(errorCode, exactError) || exactError || 'Something went wrong. Please try again.';
            if (exactError && exactError.includes('taking too long')) {
                changePhoneNumber();
            }
            return { error: friendlyMessage };
        } finally {
            setLoading(false);
        }
    }, [phoneNumber, setLoading, shouldSyncFirebaseUserRef, selectedUserType, setSelectedMode, setUser, setIsFirebaseUser, navigate, changePhoneNumber, _navigateByUserType]);

    const resendOTP = useCallback(async () => {
        if (!phoneNumber) {
            return { error: 'Please enter your number again.' };
        }
        return handleSendOTP(phoneNumber, selectedUserType, selectedMode);
    }, [phoneNumber, handleSendOTP, selectedUserType, selectedMode]);

    return {
        handleSendOTP,
        handleVerifyOTP,
        resendOTP,
        changePhoneNumber
    };
};
