export const mapPhoneAuthError = (code?: string) => {
    if (code === 'auth/user-not-found') return 'No account found. Please sign up first.';
    if (code === 'auth/wrong-password') return 'Incorrect password. Please try again.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a few minutes and try again.';
    if (code === 'auth/network-request-failed') return 'No internet connection. Please check your network.';
    if (code === 'auth/invalid-verification-code') return 'Wrong code. Please check your SMS.';
    if (code === 'auth/invalid-phone-number') return 'Please enter a valid number e.g. 0712 345 678';
    if (code === 'auth/code-expired') return 'Code expired. Please request a new one.';
    if (code === 'auth/popup-closed-by-user') return 'Sign in was cancelled.';
    if (code === 'auth/cancelled-popup-request') return 'Only one sign in window allowed.';
    return 'Something went wrong. Please try again.';
};

export const mapEmailAuthError = (code?: string) => {
    if (code === 'auth/email-already-in-use') return 'An account with this email exists. Please sign in instead.';
    if (code === 'auth/wrong-password') return 'Incorrect password. Please try again.';
    if (code === 'auth/user-not-found') return 'No account found with this email.';
    if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
    if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    return 'Something went wrong. Please try again.';
};
