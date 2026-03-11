import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService, FirebaseUser } from '@/lib/firebaseAuth';
import { errorService } from '@/lib/errorService';
import { ConfirmationResult } from 'firebase/auth';
import { User, apiRequest, formatKenyanPhone } from '@/lib/authUtils';
import { useInactivityTimer } from './useInactivityTimer';
import { useGoogleAuth } from './useGoogleAuth';
import { usePhoneAuth } from './usePhoneAuth';
import { useEmailAuth } from './useEmailAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authStep: 1 | 2;
  phoneNumber: string;
  formatKenyanPhone: (phone: string) => string;
  handleSendOTP: (rawPhone: string, userType: 'employer' | 'housegirl' | 'agency' | 'admin', mode?: 'login' | 'signup') => Promise<{ error: string | null }>;
  handleVerifyOTP: (code: string, mode?: 'login' | 'signup') => Promise<{ error: string | null; userType?: 'employer' | 'housegirl' | 'agency' | 'admin' }>;
  resendOTP: () => Promise<{ error: string | null }>;
  changePhoneNumber: () => void;
  signUp: (email: string, password: string, userType: 'employer' | 'housegirl' | 'agency' | 'admin', additionalData: Record<string, unknown>) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: User }>;
  signInWithGoogle: () => Promise<{ error: string | null; user?: User }>;
  handleGoogleSignIn: (userType?: 'employer' | 'housegirl' | 'agency' | 'admin', mode?: 'login' | 'signup') => Promise<{ error: string | null; user?: User }>;
  handleGoogleRedirectResult: (mode?: 'login' | 'signup', userType?: 'employer' | 'housegirl' | 'agency' | 'admin') => Promise<{ error: string | null; user?: User }>;
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

export const useAuthEnhanced = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseUser, setIsFirebaseUser] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [selectedUserType, setSelectedUserType] = useState<'employer' | 'housegirl' | 'agency' | 'admin'>('employer');
  const [selectedMode, setSelectedMode] = useState<'login' | 'signup'>('login');
  const shouldSyncFirebaseUserRef = useRef(false);

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
      if (!firebaseUser.email) return;
      const token = await FirebaseAuthService.getIdToken();
      const response = await apiRequest<{ user: User }>('/api/auth/firebase_user', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ firebase_uid: firebaseUser.uid, email: firebaseUser.email, display_name: firebaseUser.displayName })
      });
      setUser({ ...response.user, is_firebase_user: true });
      setIsFirebaseUser(true);
    } catch (error) {
      if (!firebaseUser.email) return;
      errorService.logError(error instanceof Error ? error : new Error(String(error)), 'Firebase user sync', 'medium');
      if (!user) return;
      toast({ title: "Profile Sync Required", description: "We could not verify your account role right now. Please try logging in again.", variant: "destructive" });
    }
  }, [user]);

  useEffect(() => {
    let unsubscribe: () => void = () => { };
    const fallbackTimeout = setTimeout(() => setLoading(false), 5000);
    const setupAuth = async () => {
      try {
        const { auth } = await import('@/lib/firebase');
        const { setPersistence, browserLocalPersistence } = await import('firebase/auth');
        await setPersistence(auth, browserLocalPersistence);
      } catch (err) { console.error('Firebase persistence init error:', err); }

      unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
        if (isSigningOut) { clearTimeout(fallbackTimeout); return; }
        try {
          if (firebaseUser) {
            if (!firebaseUser.email) { setIsFirebaseUser(true); setLoading(false); clearTimeout(fallbackTimeout); return; }
            if (!shouldSyncFirebaseUserRef.current) { setLoading(false); clearTimeout(fallbackTimeout); return; }
            if (user && (user.firebase_uid === firebaseUser.uid || user.id === firebaseUser.uid)) {
              setLoading(false); clearTimeout(fallbackTimeout); shouldSyncFirebaseUserRef.current = false; return;
            }
            await handleFirebaseUser(firebaseUser);
            shouldSyncFirebaseUserRef.current = false;
          } else { setUser(null); setIsFirebaseUser(false); shouldSyncFirebaseUserRef.current = false; }
        } finally { setLoading(false); clearTimeout(fallbackTimeout); }
      });
    };
    setupAuth();
    return () => { clearTimeout(fallbackTimeout); unsubscribe(); };
  }, [handleFirebaseUser, isSigningOut, user]);

  const signOut = useCallback(async (redirectTo = '/home') => {
    try {
      setLoading(true); setIsSigningOut(true);
      if (isFirebaseUser) await FirebaseAuthService.signOut();
      else await apiRequest('/api/auth/logout', { method: 'DELETE' });
      setUser(null); setIsFirebaseUser(false); shouldSyncFirebaseUserRef.current = false;
      toast({ title: "Signed Out", description: "You have been signed out successfully." });
      navigate(redirectTo);
    } catch (error) {
      setUser(null); setIsFirebaseUser(false); shouldSyncFirebaseUserRef.current = false;
      toast({ title: "Signed Out", description: "You have been signed out." });
    } finally { setLoading(false); setIsSigningOut(false); }
  }, [isFirebaseUser, navigate]);

  useInactivityTimer(user, signOut);
  const googleAuth = useGoogleAuth(setLoading, setUser, setIsFirebaseUser, shouldSyncFirebaseUserRef);
  const phoneAuth = usePhoneAuth(setLoading, setUser, setIsFirebaseUser, shouldSyncFirebaseUserRef, confirmationResult, setConfirmationResult, phoneNumber, setPhoneNumber, selectedUserType, setSelectedUserType, selectedMode, setSelectedMode, setAuthStep);
  const emailAuth = useEmailAuth(setLoading, setUser, setIsFirebaseUser, shouldSyncFirebaseUserRef);

  const value = {
    user, loading, authStep, phoneNumber, formatKenyanPhone,
    ...phoneAuth,
    ...emailAuth,
    signInWithGoogle: googleAuth.handleGoogleSignIn,
    handleGoogleSignIn: googleAuth.handleGoogleSignIn,
    handleGoogleRedirectResult: googleAuth.handleGoogleRedirectResult,
    signOut, checkSession, isFirebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};