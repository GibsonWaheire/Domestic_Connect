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
  signUp: (email: string, password: string, userType: 'employer' | 'housegirl' | 'agency' | 'admin', additionalData: Record<string, unknown>) => Promise<{ error: string | null; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: User }>;
  signInWithGoogle: () => Promise<{ error: string | null; user?: User }>;
  handleGoogleSignIn: (userType?: 'employer' | 'housegirl' | 'agency' | 'admin', mode?: 'login' | 'signup') => Promise<{ error: string | null; user?: User }>;
  handleGoogleRedirectResult: (mode?: 'login' | 'signup', userType?: 'employer' | 'housegirl' | 'agency' | 'admin') => Promise<{ error: string | null; user?: User }>;
  signOut: (redirectTo?: string) => Promise<void>;
  checkSession: () => Promise<void>;
  prepareAdminLogin: () => void;
  loginAsAdmin: (adminUser: User) => void;
  patchUser: (updates: Partial<User>) => void;
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
  const [authReady, setAuthReady] = useState({ firebase: false, session: false });
  const shouldSyncFirebaseUserRef = useRef(false);
  const checkSessionDoneRef = useRef(false);
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
          const firebaseResponse = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency' | 'admin'; user?: User; status?: string; uid?: string }>('/api/auth/verify', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ mode: 'login' })
          });
          if (firebaseResponse.status === 'role_required') {
            const pendingUid = firebaseResponse.uid || firebaseCurrentUser.uid;
            navigate(`/login?mode=select-role&uid=${encodeURIComponent(pendingUid)}`, { replace: true });
            return;
          }
          if (firebaseResponse.user) {
            const normalizedUser = normalizeUser(firebaseResponse.user);
            setUser(normalizedUser);
            setIsFirebaseUser(true);
            checkSessionDoneRef.current = true;
            return;
          }
        }
      }
      // Cookie-session fallback for non-Firebase session-based users.
      const response = await apiRequest<{ user: User | null }>('/api/auth/check_session');
      if (response.user) {
        const normalizedUser = normalizeUser(response.user);
        setUser(normalizedUser);
        setIsFirebaseUser(normalizedUser?.is_firebase_user || false);
        checkSessionDoneRef.current = true;
      } else {
        setUser(null);
        setIsFirebaseUser(false);
      }
    } catch (error) {
      setUser(null);
      setIsFirebaseUser(false);
    } finally {
      setAuthReady(prev => ({ ...prev, session: true }));
    }
  }, [normalizeUser, navigate]);

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
      const message = error instanceof Error ? error.message : String(error);
      // Google OAuth is blocked for admin accounts — sign out and inform the user.
      if (message.toLowerCase().includes('administrator') || message.toLowerCase().includes('staff portal')) {
        try { await FirebaseAuthService.signOut(); } catch { /* ignore */ }
        setUser(null);
        setIsFirebaseUser(false);
        toast({
          title: 'Admin accounts: use the staff portal',
          description: 'Sign in at /dc-ops9k4/portal with email and password.',
          variant: 'destructive'
        });
        return;
      }
      errorService.logError(error instanceof Error ? error : new Error(String(error)), 'Firebase user sync', 'medium');
      if (!userRef.current) return;
      toast({ title: "Profile Sync Required", description: "We could not verify your account role right now. Please try logging in again.", variant: "destructive" });
    }
  }, [setNormalizedUser, setUser, setIsFirebaseUser]);

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
            if (!firebaseUser.email) {
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
              // Skip the extra API call if checkSession already resolved this user
              if (firebaseMatchesUser || checkSessionDoneRef.current) {
                setLoading(false);
                clearTimeout(fallbackTimeout);
                return;
              }
              await handleFirebaseUser(firebaseUser);
              shouldSyncFirebaseUserRef.current = false;
              setLoading(false);
              clearTimeout(fallbackTimeout);
              return;
            }
            if (user && (user.firebase_uid === firebaseUser.uid || user.id === firebaseUser.uid)) {
              setLoading(false); clearTimeout(fallbackTimeout); shouldSyncFirebaseUserRef.current = false; return;
            }
            await handleFirebaseUser(firebaseUser);
            shouldSyncFirebaseUserRef.current = false;
          } else {
            setUser(null);
            setIsFirebaseUser(false);
            shouldSyncFirebaseUserRef.current = false;
          }
        } finally { 
          setAuthReady(prev => ({ ...prev, firebase: true }));
          clearTimeout(fallbackTimeout); 
        }
      });
    };
    setupAuth();
    return () => { clearTimeout(fallbackTimeout); unsubscribe(); };
  }, [checkSession, handleFirebaseUser, isSigningOut]);

  // Unified loading state
  useEffect(() => {
    if (authReady.firebase && authReady.session) {
      setLoading(false);
    }
  }, [authReady]);

  const signOut = useCallback(async (redirectTo = '/home') => {
    try {
      setLoading(true); setIsSigningOut(true);
      if (isFirebaseUser) await FirebaseAuthService.signOut();
      else await apiRequest('/api/auth/logout', { method: 'DELETE' });
      setUser(null); setIsFirebaseUser(false); shouldSyncFirebaseUserRef.current = false;
      localStorage.removeItem('dc_auth_provider');
      toast({ title: "Signed Out", description: "You have been signed out successfully." });
      navigate(redirectTo);
    } catch (error) {
      setUser(null); setIsFirebaseUser(false); shouldSyncFirebaseUserRef.current = false;
      localStorage.removeItem('dc_auth_provider');
      toast({ title: "Signed Out", description: "You have been signed out." });
    } finally { setLoading(false); setIsSigningOut(false); }
  }, [isFirebaseUser, navigate]);

  useInactivityTimer(user, signOut);
  const googleAuth = useGoogleAuth(navigate, setLoading, setNormalizedUser, setIsFirebaseUser, shouldSyncFirebaseUserRef);
  const emailAuth = useEmailAuth(navigate, setLoading, setNormalizedUser, setIsFirebaseUser, shouldSyncFirebaseUserRef);

  // Call this BEFORE signInWithEmail so onAuthStateChanged short-circuits
  // immediately instead of racing against the admin-verify fetch.
  const prepareAdminLogin = useCallback(() => {
    checkSessionDoneRef.current = true;
  }, []);

  const loginAsAdmin = useCallback((adminUser: User) => {
    const normalized = normalizeUser({ ...adminUser, is_firebase_user: true, user_type: 'admin' as const });
    setUser(normalized);
    setIsFirebaseUser(true);
    checkSessionDoneRef.current = true;
    setAuthReady({ firebase: true, session: true });
  }, [normalizeUser]);

  const patchUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  const value = {
    user, loading,
    ...emailAuth,
    signInWithGoogle: googleAuth.handleGoogleSignIn,
    handleGoogleSignIn: googleAuth.handleGoogleSignIn,
    handleGoogleRedirectResult: googleAuth.handleGoogleRedirectResult,
    signOut, checkSession, prepareAdminLogin, loginAsAdmin, patchUser, isFirebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};