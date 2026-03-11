import React, { useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { User, apiRequest, formatKenyanPhone } from '@/lib/authUtils';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { mapPhoneAuthError } from '@/lib/authErrors';
import { ConfirmationResult } from 'firebase/auth';

export const usePhoneAuth = (
    navigate: NavigateFunction,
    setLoading: (loading: boolean) => void,
    setUser: (user: User | null) => void,
    setIsFirebaseUser: (isFirebase: boolean) => void,
    shouldSyncFirebaseUserRef: React.MutableRefObject<boolean>,
    confirmationResult: ConfirmationResult | null,
    setConfirmationResult: (result: ConfirmationResult | null) => void,
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
        setConfirmationResult(null);
    }, [setAuthStep, setConfirmationResult]);

    const handleSendOTP = useCallback(async (rawPhone: string, userType: 'employer' | 'housegirl' | 'agency' | 'admin', mode: 'login' | 'signup' = 'login') => {
        try {
            setLoading(true);
            const formattedPhone = formatKenyanPhone(rawPhone);
            const otpResult = await FirebaseAuthService.sendOTP(formattedPhone);

            if (!otpResult.success || !otpResult.confirmationResult) {
                const errorMessage = otpResult.error || mapPhoneAuthError(otpResult.code);
                return { error: errorMessage };
            }
            setConfirmationResult(otpResult.confirmationResult);
            setPhoneNumber(formattedPhone);
            setSelectedUserType(userType);
            setSelectedMode(mode);
            setAuthStep(2);
            return { error: null };
        } finally {
            setLoading(false);
        }
    }, [setLoading, setConfirmationResult, setPhoneNumber, setSelectedUserType, setSelectedMode, setAuthStep]);

    const handleVerifyOTP = useCallback(async (code: string, mode?: 'login' | 'signup') => {
        if (!confirmationResult) {
            return { error: 'Please request a code first.' };
        }

        try {
            setLoading(true);
            shouldSyncFirebaseUserRef.current = true;
            const timeoutMessage = 'Verification is taking too long. Please try again.';
            const verificationTimeout = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error(timeoutMessage)), 15000);
            });
            const verified = await Promise.race([
                FirebaseAuthService.verifyOTP(confirmationResult, code),
                verificationTimeout,
            ]) as Awaited<ReturnType<typeof FirebaseAuthService.verifyOTP>>;

            if (!verified.success || !verified.userCredential) {
                shouldSyncFirebaseUserRef.current = false;
                const errorMessage = verified.error || mapPhoneAuthError(verified.code);
                return { error: errorMessage };
            }

            const token = await verified.userCredential.user.getIdToken();

            const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency' | 'admin'; user?: User }>('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_type: selectedUserType,
                    mode
                })
            });

            console.log('Phone verify response:', response);

            if ((response as { status?: string; user_type?: 'employer' | 'housegirl' | 'agency' | 'admin' }).status === 'account_exists') {
                const existingRole = (response as { user_type?: 'employer' | 'housegirl' | 'agency' | 'admin' }).user_type || 'employer';
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
                                    const loginResponse = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency' | 'admin'; user?: User }>('/api/auth/verify', {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({
                                            mode: 'login'
                                        })
                                    });
                                    if (loginResponse.user) {
                                        setUser(loginResponse.user);
                                        setIsFirebaseUser(true);
                                    }
                                    const resolvedUserType = loginResponse.user_type;
                                    setLoading(false);
                                    console.log('Phone verify (existing) navigating to:', resolvedUserType);
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
                                } catch {
                                }
                            }}
                        >
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
                setSelectedMode('signup');
                changePhoneNumber();
                navigate('/login?mode=signup', { replace: true });
                return { error: null };
            }

            if ((response as { status?: string; uid?: string }).status === 'role_required') {
                const responseUid = (response as { uid?: string }).uid || verified.userCredential.user.uid;
                setLoading(false);
                navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`, { replace: true });
                return { error: null };
            }

            if (response.user) {
                setUser(response.user);
                setIsFirebaseUser(true);
            }

            const resolvedUserType = response.user_type;
            setLoading(false);
            console.log('Phone verify navigating to:', resolvedUserType);
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

            return { error: null, userType: resolvedUserType };
        } catch (error: unknown) {
            shouldSyncFirebaseUserRef.current = false;
            const exactError = error instanceof Error ? error.message : String(error);
            if (exactError === 'Verification is taking too long. Please try again.') {
                changePhoneNumber();
            }
            return { error: exactError || 'Something went wrong. Please try again.' };
        } finally {
            setLoading(false);
        }
    }, [confirmationResult, setLoading, shouldSyncFirebaseUserRef, selectedUserType, setSelectedMode, setUser, setIsFirebaseUser, navigate, changePhoneNumber]);

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
