export const mapPhoneAuthError = (code?: string, message?: string) => {
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a few minutes before trying again.';
    if (code === 'auth/invalid-phone-number') return 'Please enter a valid Kenyan number e.g. 0712 345 678';
    if (code === 'auth/captcha-check-failed') return 'Verification failed. Please refresh the page and try again.';
    if (code === 'auth/invalid-verification-code') return 'Wrong code. Please check your SMS.';
    if (code === 'auth/code-expired') return 'Code expired. Please request a new one.';
    if (code === 'auth/network-request-failed') return 'Phone sign in is temporarily unavailable. Please use Google or email instead.';
    if (code === 'auth/user-not-found') return 'No account found. Please sign up first.';
    if (code === 'auth/popup-closed-by-user') return 'Sign in was cancelled.';
    if (code === 'auth/cancelled-popup-request') return 'Only one sign in window allowed.';
    // Timeout
    if (message && message.includes('taking too long')) return 'Taking too long. Please check your number and try again.';
    // 503 / network fallback
    if (message && (message.includes('503') || message.includes('unavailable') || message.includes('fetch'))) {
        return 'Phone sign in is temporarily unavailable. Please use Google or email instead.';
    }
    return null;
};

export const mapGoogleAuthError = (code?: string) => {
    if (code === 'auth/popup-closed-by-user') return 'Sign in was cancelled.';
    if (code === 'auth/cancelled-popup-request') return 'Sign in was cancelled.';
    if (code === 'auth/network-request-failed') return 'No internet connection. Please check your network and try again.';
    if (code === 'auth/popup-blocked') return 'Popup was blocked. Please allow popups for this site and try again.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a few minutes before trying again.';
    return 'Google sign in failed. Please try again or use email instead.';
};

export const mapEmailAuthError = (code?: string) => {
    if (code === 'auth/email-already-in-use') return 'An account with this email already exists. Please sign in instead.';
    if (code === 'auth/wrong-password') return 'Incorrect password. Please try again or reset your password.';
    if (code === 'auth/user-not-found') return 'No account found with this email. Please create an account first.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a few minutes before trying again.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/invalid-credential') return 'Incorrect email or password. Please try again.';
    return null;
};
