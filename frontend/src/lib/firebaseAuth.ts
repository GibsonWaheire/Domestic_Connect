import {
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword
} from 'firebase/auth';
import { auth } from './firebase';

// Ensure authentication state persists across page reloads
setPersistence(auth, browserLocalPersistence).catch(console.error);

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

  static async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
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

  static async updatePassword(newPassword: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user found');
    return await updatePassword(user, newPassword);
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
  provider.setCustomParameters({ prompt: 'select_account' });
  return await signInWithPopup(auth, provider);
};

export const signInWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
