import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService, FirebaseUser } from '@/lib/firebaseAuth';
import { errorService } from '@/lib/errorService';
import { ConfirmationResult } from 'firebase/auth';

interface User {
  id: string;
  email: string | null;
  user_type: 'employer' | 'housegirl' | 'agency';
  first_name: string;
  last_name: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
  // Extended fields for housegirl profiles
  age?: number;
  location?: string;
  experience?: string;
  education?: string;
  expectedSalary?: string;
  accommodationType?: string;
  community?: string;
  skills?: string[];
  languages?: string[];
  bio?: string;
  // Firebase specific fields
  firebase_uid?: string;
  is_firebase_user?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authStep: 1 | 2;
  phoneNumber: string;
  formatKenyanPhone: (phone: string) => string;
  handleSendOTP: (rawPhone: string, userType: 'employer' | 'housegirl' | 'agency') => Promise<{ error: string | null }>;
  handleVerifyOTP: (code: string) => Promise<{ error: string | null; userType?: 'employer' | 'housegirl' | 'agency' }>;
  resendOTP: () => Promise<{ error: string | null }>;
  changePhoneNumber: () => void;
  signUp: (email: string, password: string, userType: 'employer' | 'housegirl' | 'agency', additionalData: Record<string, unknown>) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: User }>;
  signInWithGoogle: () => Promise<{ error: string | null; user?: User }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  isFirebaseUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API base URL
// Use relative URLs for development (proxy handles forwarding)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { headers, ...restOptions } = options;
  
  // Abort request if it takes longer than 10 seconds to respond
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...restOptions,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

const formatKenyanPhone = (phone: string) => FirebaseAuthService.formatKenyanPhone(phone);

const mapPhoneAuthError = (code?: string) => {
  if (code === 'auth/invalid-phone-number') return 'Please enter a valid number e.g. 0712 345 678';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Try again later.';
  if (code === 'auth/invalid-verification-code') return 'Wrong code. Check your SMS and try again.';
  if (code === 'auth/code-expired') return 'Code expired. Tap resend to get a new one.';
  return 'Something went wrong. Please try again.';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseUser, setIsFirebaseUser] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [selectedUserType, setSelectedUserType] = useState<'employer' | 'housegirl' | 'agency'>('employer');

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      if (FirebaseAuthService.getCurrentUser()) {
        setLoading(false);
        return;
      }
      const response = await apiRequest<{ user: User | null }>('/api/auth/check_session');
      
      if (response.user) {
        setUser(response.user);
        setIsFirebaseUser(response.user.is_firebase_user || false);
      } else {
        setUser(null);
        setIsFirebaseUser(false);
      }
    } catch (error) {
      setUser(null);
      setIsFirebaseUser(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFirebaseUser = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      if (!firebaseUser.email) {
        return;
      }
      // Get or create user profile in backend
      const token = await FirebaseAuthService.getIdToken();
      const response = await apiRequest<{ user: User }>('/api/auth/firebase_user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firebase_uid: firebaseUser.uid,
          email: firebaseUser.email,
          display_name: firebaseUser.displayName
        })
      });

      setUser({ ...response.user, is_firebase_user: true });
      setIsFirebaseUser(true);
    } catch (error) {
      if (!firebaseUser.email) {
        return;
      }
      // Log the error for debugging
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorService.logError(errorObj, 'Firebase user sync', 'medium');
      toast({
        title: "Profile Sync Required",
        description: "We could not verify your account role right now. Please try logging in again.",
        variant: "destructive",
      });
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    
    // Failsafe timeout: if auth takes longer than 5 seconds, forcefully clear loading
    const fallbackTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const setupAuth = async () => {
      try {
        // Await persistence resolution first
        const { auth } = await import('@/lib/firebase');
        const { setPersistence, browserLocalPersistence } = await import('firebase/auth');
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        console.error('Firebase persistence init error:', err);
      }

      unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
        // Don't process auth state changes if we're in the process of signing out
        if (isSigningOut) {
          clearTimeout(fallbackTimeout);
          return;
        }

        try {
          if (firebaseUser) {
            if (!firebaseUser.email) {
              setIsFirebaseUser(true);
              setLoading(false);
              clearTimeout(fallbackTimeout);
              return;
            }
            // Prevent duplicate sync calls right after successful login
            if (user && (user.firebase_uid === firebaseUser.uid || user.id === firebaseUser.uid)) {
              setLoading(false);
              clearTimeout(fallbackTimeout);
              return;
            }
            // User is signed in with Firebase
            await handleFirebaseUser(firebaseUser);
          } else {
            // User is signed out from Firebase
            setUser(null);
            setIsFirebaseUser(false);
          }
        } finally {
          // ALWAYS finish loading after Firebase resolves
          setLoading(false);
          clearTimeout(fallbackTimeout);
        }
      });
    };

    setupAuth();

    return () => {
      clearTimeout(fallbackTimeout);
      unsubscribe();
    };
  }, [handleFirebaseUser, isSigningOut, user]);

  const handleSendOTP = async (rawPhone: string, userType: 'employer' | 'housegirl' | 'agency') => {
    try {
      setLoading(true);
      const formattedPhone = formatKenyanPhone(rawPhone);
      const otpResult = await FirebaseAuthService.sendOTP(formattedPhone);
      if (!otpResult.success || !otpResult.confirmationResult) {
        const errorMessage = mapPhoneAuthError(otpResult.code) || otpResult.error || 'Failed to send code.';
        return { error: errorMessage };
      }
      setConfirmationResult(otpResult.confirmationResult);
      setPhoneNumber(formattedPhone);
      setSelectedUserType(userType);
      setAuthStep(2);
      return { error: null };
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    if (!confirmationResult) {
      return { error: 'Please request a code first.' };
    }

    try {
      setLoading(true);
      const verified = await FirebaseAuthService.verifyOTP(confirmationResult, code);
      if (!verified.success || !verified.userCredential) {
        const errorMessage = mapPhoneAuthError(verified.code) || verified.error || 'Failed to verify code.';
        return { error: errorMessage };
      }

      const token = await verified.userCredential.user.getIdToken();
      const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency'; user?: User }>('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_type: selectedUserType
        })
      });

      if (response.user) {
        setUser(response.user);
        setIsFirebaseUser(true);
      }

      const resolvedUserType = response.user_type;
      if (resolvedUserType === 'employer') {
        window.location.href = '/employer-dashboard';
      } else if (resolvedUserType === 'housegirl') {
        window.location.href = '/housegirl-dashboard';
      } else {
        window.location.href = '/';
      }

      return { error: null, userType: resolvedUserType };
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!phoneNumber) {
      return { error: 'Please enter your number again.' };
    }
    return handleSendOTP(phoneNumber, selectedUserType);
  };

  const changePhoneNumber = useCallback(() => {
    setAuthStep(1);
    setConfirmationResult(null);
  }, []);

  const signUp = async (
    email: string,
    password: string,
    userType: 'employer' | 'housegirl' | 'agency',
    additionalData: Record<string, unknown>
  ) => {
    return { error: 'Email and password sign up is no longer supported.' };
  };

  const signIn = async (email: string, password: string) => {
    return { error: 'Email and password sign in is no longer supported.' };
  };

  const signInWithGoogle = async () => {
    return { error: 'Google sign in is no longer supported.' };
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setIsSigningOut(true);

      if (isFirebaseUser) {
        // Sign out from Firebase
        await FirebaseAuthService.signOut();
      } else {
        // Sign out from backend
        await apiRequest('/api/auth/logout', {
          method: 'DELETE',
        });
      }

      // Clear user state
      setUser(null);
      setIsFirebaseUser(false);

      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });

      // Force a hard redirect to home page and clear client router state completely
      window.location.href = '/home';
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Even if logout fails, clear local state
      setUser(null);
      setIsFirebaseUser(false);
      
      toast({
        title: "Signed Out",
        description: "You have been signed out.",
      });
    } finally {
      setLoading(false);
      setIsSigningOut(false);
    }
  };

  const resetPassword = async (email: string) => {
    return { error: 'Password reset is no longer supported.' };
  };

  const value = {
    user,
    loading,
    authStep,
    phoneNumber,
    formatKenyanPhone,
    handleSendOTP,
    handleVerifyOTP,
    resendOTP,
    changePhoneNumber,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    checkSession,
    resetPassword,
    isFirebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};