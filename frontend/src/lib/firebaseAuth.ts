import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  PhoneAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './firebase';
import app from './firebase';


// Ensure authentication state persists across page reloads
setPersistence(auth, browserLocalPersistence).catch(console.error);

if (import.meta.env.DEV) {
  // Disable app verification for testing
  auth.settings.appVerificationDisabledForTesting = true;
}

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

// Authentication service class
export class FirebaseAuthService {
  static formatKenyanPhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+254') && cleaned.length === 13) return cleaned;
    if (cleaned.startsWith('254') && cleaned.length === 12) return `+${cleaned}`;
    if (cleaned.startsWith('0') && cleaned.length === 10) return `+254${cleaned.slice(1)}`;
    if (cleaned.startsWith('7') && cleaned.length === 9) return `+254${cleaned}`;
    return cleaned;
  }

  static async setupRecaptcha() {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }

      window.recaptchaVerifier =
        new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: () => { },
            'expired-callback': () => {
              window.recaptchaVerifier = undefined;
            }
          }
        );

      await window.recaptchaVerifier.render();
      return window.recaptchaVerifier;

    } catch (error) {
      window.recaptchaVerifier = undefined;
      throw error;
    }
  }

  static async sendOTP(phoneNumber: string) {
    // In local development, phone auth via reCAPTCHA is unreliable.
    // Firebase's appVerificationDisabledForTesting is set, but if reCAPTCHA
    // still fires (e.g. domain not whitelisted), we catch it and surface a
    // clear dev-only message.
    try {
      const recaptchaVerifier = await this.setupRecaptcha();
      const otpPromise = signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OTP_TIMEOUT')), 15000)
      );
      const confirmationResult = await Promise.race([
        otpPromise,
        timeoutPromise
      ]) as ConfirmationResult;
      return {
        success: true,
        confirmationResult
      };
    } catch (error: unknown) {
      console.error(error);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      if (error instanceof Error && error.message === 'OTP_TIMEOUT') {
        return {
          success: false,
          code: 'OTP_TIMEOUT',
          error: 'Taking too long. Please check your number and try again.'
        };
      }
      const errorCode = typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : undefined;
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code.';

      // In local dev, captcha failures get a specific helpful message
      if (
        import.meta.env.DEV &&
        (errorCode === 'auth/captcha-check-failed' ||
          errorCode === 'auth/internal-error' ||
          (errorMessage && errorMessage.toLowerCase().includes('recaptcha')))
      ) {
        return {
          success: false,
          code: 'auth/captcha-check-failed',
          error: 'Phone verification is not available locally. Please test on the live site or use Google/email instead.'
        };
      }

      return {
        success: false,
        error: errorMessage,
        code: errorCode
      };
    }
  }

  static async verifyOTP(confirmationResult: ConfirmationResult, code: string) {
    try {
      if (!PhoneAuthProvider) {
        throw new Error('Phone authentication is unavailable.');
      }
      const userCredential = await confirmationResult.confirm(code);
      return {
        success: true,
        userCredential
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify code.';
      const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
      return {
        success: false,
        error: errorMessage,
        code: errorCode
      };
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  static async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  static onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

// Export types for use in components
export type FirebaseUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
};

export type AuthResult = {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  return await signInWithPopup(auth, provider);
};

export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
