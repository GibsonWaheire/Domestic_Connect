import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService, FirebaseUser } from '@/lib/firebaseAuth';
import { errorService } from '@/lib/errorService';
import { User, apiRequest } from '@/lib/authUtils';
import { useInactivityTimer } from './useInactivityTimer';
import { useGoogleAuth } from './useGoogleAuth';
import { useEmailAuth } from './useEmailAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
  const shouldSyncFirebaseUserRef = useRef(false);
  const userRef = useRef<User | null>(null);
  useEffect(() => { userRef.current = user; }, [user]);
  const normalizeUser = useCallback((incomingUser: User | null): User | null => {
    if (!incomingUser) return null;
    const userWithIds = incomingUser as User & { uid?: string; firebase_uid?: string };
    const rawUid = userWithIds.uid || userWithIds.firebase_uid || '';
    const normalizedId = userWithIds.id || (rawUid ? `user_${rawUid}` : '');
    return {
      ...incomingUser,
      id: normalizedId || incomingUser.id,
      firebase_uid: rawUid || userWithIds.firebase_uid,
    };
  }, []);
  const setNormalizedUser = useCallback((incomingUser: User | null) => {
    setUser(normalizeUser(incomingUser));
  }, [normalizeUser]);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const firebaseCurrentUser = FirebaseAuthService.getCurrentUser();
      if (firebaseCurrentUser) {
        const token = await FirebaseAuthService.getIdToken();
        if (token) {
          const firebaseResponse = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency' | 'admin'; user?: User }>('/api/auth/verify', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ mode: 'login' })
          });
          if (firebaseResponse.user) {
            const normalizedUser = normalizeUser(firebaseResponse.user);
            setUser(normalizedUser);
            setIsFirebaseUser(true);
            return;
          }
        }
      }
      const response = await apiRequest<{ user: User | null }>('/api/auth/check_session');
      if (response.user) {
        const normalizedUser = normalizeUser(response.user);
        setUser(normalizedUser);
        setIsFirebaseUser(normalizedUser?.is_firebase_user || false);
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
  }, [normalizeUser]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleFirebaseUser = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      if (!firebaseUser.email) return;
      const token = await FirebaseAuthService.getIdToken();
      const response = await apiRequest<{ user: User }>('/api/auth/firebase_user', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ firebase_uid: firebaseUser.uid, email: firebaseUser.email, display_name: firebaseUser.displayName })
      });
      setNormalizedUser({ ...response.user, is_firebase_user: true });
      setIsFirebaseUser(true);
    } catch (error) {
      if (!firebaseUser.email) return;
      errorService.logError(error instanceof Error ? error : new Error(String(error)), 'Firebase user sync', 'medium');
      if (!userRef.current) return;
      toast({ title: "Profile Sync Required", description: "We could not verify your account role right now. Please try logging in again.", variant: "destructive" });
    }
  }, [setNormalizedUser]);

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
        if (import.meta.env.DEV) console.log('onAuthStateChanged fire. firebaseUser:', firebaseUser?.uid);
        if (isSigningOut) { clearTimeout(fallbackTimeout); return; }
        try {
          if (firebaseUser) {
            if (!firebaseUser.email) {
              if (import.meta.env.DEV) console.log('No email on firebaseUser, setting isFirebaseUser true');
              setIsFirebaseUser(true);
              await checkSession();
              return;
            }
            if (!shouldSyncFirebaseUserRef.current) {
              const firebaseMatchesUser =
                user &&
                (
                  user.firebase_uid === firebaseUser.uid ||
                  user.id === firebaseUser.uid ||
                  user.id === `user_${firebaseUser.uid}`
                );
              if (firebaseMatchesUser) {
                if (import.meta.env.DEV) console.log('Firebase user already synced');
                setLoading(false);
                clearTimeout(fallbackTimeout);
                return;
              }
              if (import.meta.env.DEV) console.log('Hydrating firebase user from backend');
              await handleFirebaseUser(firebaseUser);
              shouldSyncFirebaseUserRef.current = false;
              setLoading(false);
              clearTimeout(fallbackTimeout);
              return;
            }
            if (user && (user.firebase_uid === firebaseUser.uid || user.id === firebaseUser.uid)) {
              if (import.meta.env.DEV) console.log('User already matches, skipping sync');
              setLoading(false); clearTimeout(fallbackTimeout); shouldSyncFirebaseUserRef.current = false; return;
            }
            if (import.meta.env.DEV) console.log('Syncing firebase user to backend...');
            await handleFirebaseUser(firebaseUser);
            shouldSyncFirebaseUserRef.current = false;
          } else {
            if (import.meta.env.DEV) console.log('Firebase user is null, clearing user state');
            setUser(null);
            setIsFirebaseUser(false);
            shouldSyncFirebaseUserRef.current = false;
          }
        } finally { setLoading(false); clearTimeout(fallbackTimeout); }
      });
    };
    setupAuth();
    return () => { clearTimeout(fallbackTimeout); unsubscribe(); };
  }, [checkSession, handleFirebaseUser, isSigningOut]);

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
  const googleAuth = useGoogleAuth(navigate, setLoading, setNormalizedUser, setIsFirebaseUser, shouldSyncFirebaseUserRef);
  const emailAuth = useEmailAuth(navigate, setLoading, setNormalizedUser, setIsFirebaseUser, shouldSyncFirebaseUserRef);

  const value = {
    user, loading,
    ...emailAuth,
    signInWithGoogle: googleAuth.handleGoogleSignIn,
    handleGoogleSignIn: googleAuth.handleGoogleSignIn,
    handleGoogleRedirectResult: googleAuth.handleGoogleRedirectResult,
    signOut, checkSession, isFirebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};