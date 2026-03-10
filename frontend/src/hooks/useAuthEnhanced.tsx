import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
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
  handleSendOTP: (rawPhone: string, userType: 'employer' | 'housegirl' | 'agency', mode?: 'login' | 'signup') => Promise<{ error: string | null }>;
  handleVerifyOTP: (code: string, mode?: 'login' | 'signup') => Promise<{ error: string | null; userType?: 'employer' | 'housegirl' | 'agency' }>;
  resendOTP: () => Promise<{ error: string | null }>;
  changePhoneNumber: () => void;
  signUp: (email: string, password: string, userType: 'employer' | 'housegirl' | 'agency', additionalData: Record<string, unknown>) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: User }>;
  signInWithGoogle: () => Promise<{ error: string | null; user?: User }>;
  handleGoogleSignIn: (userType?: 'employer' | 'housegirl' | 'agency', mode?: 'login' | 'signup') => Promise<{ error: string | null; user?: User }>;
  handleGoogleRedirectResult: (userType?: 'employer' | 'housegirl' | 'agency', mode?: 'login' | 'signup') => Promise<{ error: string | null; user?: User }>;
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

// API base URL
// Use relative URLs for development (proxy handles forwarding)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

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

const mapEmailAuthError = (code?: string) => {
  if (code === 'auth/email-already-in-use') return 'An account with this email exists. Please sign in instead.';
  if (code === 'auth/wrong-password') return 'Incorrect password. Please try again.';
  if (code === 'auth/user-not-found') return 'No account found with this email.';
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.';
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait and try again.';
  if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
  return 'Something went wrong. Please try again.';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseUser, setIsFirebaseUser] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authStep, setAuthStep] = useState<1 | 2>(1);
  const [selectedUserType, setSelectedUserType] = useState<'employer' | 'housegirl' | 'agency'>('employer');
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

      if (!user) return; // Don't show sync errors to logged out users

      toast({
        title: "Profile Sync Required",
        description: "We could not verify your account role right now. Please try logging in again.",
        variant: "destructive",
      });
    }
  }, [user]);

  // Initialize auth state
  useEffect(() => {
    let unsubscribe: () => void = () => { };

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
            if (!shouldSyncFirebaseUserRef.current) {
              setLoading(false);
              clearTimeout(fallbackTimeout);
              return;
            }
            // Prevent duplicate sync calls right after successful login
            if (user && (user.firebase_uid === firebaseUser.uid || user.id === firebaseUser.uid)) {
              setLoading(false);
              clearTimeout(fallbackTimeout);
              shouldSyncFirebaseUserRef.current = false;
              return;
            }
            // User is signed in with Firebase
            await handleFirebaseUser(firebaseUser);
            shouldSyncFirebaseUserRef.current = false;
          } else {
            // User is signed out from Firebase
            setUser(null);
            setIsFirebaseUser(false);
            shouldSyncFirebaseUserRef.current = false;
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

  const handleSendOTP = async (rawPhone: string, userType: 'employer' | 'housegirl' | 'agency', mode: 'login' | 'signup' = 'login') => {
    try {
      setLoading(true);
      const formattedPhone = formatKenyanPhone(rawPhone);
      const otpResult = await FirebaseAuthService.sendOTP(formattedPhone);
      if (import.meta.env.DEV) {
        console.log('sendOTP confirmationResult exists:', Boolean(otpResult.confirmationResult));
      }
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
  };

  const handleVerifyOTP = async (code: string, mode?: 'login' | 'signup') => {
    if (import.meta.env.DEV) {
      console.log('verifyOTP confirmationResult exists:', Boolean(confirmationResult));
    }
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

      const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency'; user?: User }>('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_type: selectedUserType,
          mode
        })
      });

      if ((response as { status?: string; user_type?: 'employer' | 'housegirl' | 'agency' }).status === 'account_exists') {
        const existingRole = (response as { user_type?: 'employer' | 'housegirl' | 'agency' }).user_type || 'employer';
        toast({
          title: 'Account exists',
          description: `Already registered as ${existingRole}. Sign in instead?`,
          action: (
            <ToastAction
              altText="Sign in instead"
              onClick={async () => {
                try {
                  setSelectedMode('login');
                  const loginResponse = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency'; user?: User }>('/api/auth/verify', {
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
                  if (resolvedUserType === 'employer') {
                    navigate('/employer-dashboard');
                  } else if (resolvedUserType === 'housegirl') {
                    navigate('/housegirl-dashboard');
                  } else {
                    navigate('/');
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
        toast({
          title: 'Account not found',
          description: 'No account found with this number. Create an account first.',
        });
        setSelectedMode('signup');
        changePhoneNumber();
        navigate('/login?mode=signup');
        return { error: null };
      }

      if ((response as { status?: string; uid?: string }).status === 'role_required') {
        const responseUid = (response as { uid?: string }).uid || verified.userCredential.user.uid;
        navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
        return { error: null };
      }

      if (response.user) {
        setUser(response.user);
        setIsFirebaseUser(true);
      }

      const resolvedUserType = response.user_type;
      if (resolvedUserType === 'employer') {
        navigate('/employer-dashboard');
      } else if (resolvedUserType === 'housegirl') {
        navigate('/housegirl-dashboard');
      } else {
        navigate('/');
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
  };

  const resendOTP = async () => {
    if (!phoneNumber) {
      return { error: 'Please enter your number again.' };
    }
    return handleSendOTP(phoneNumber, selectedUserType, selectedMode);
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
    try {
      setLoading(true);
      shouldSyncFirebaseUserRef.current = true;
      const { signUpWithEmail } = await import('@/lib/firebaseAuth');
      const result = await signUpWithEmail(email, password);
      const token = await result.user.getIdToken();
      const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency'; user?: User }>('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_type: userType,
          mode: 'signup',
          ...additionalData
        })
      });

      if ((response as { status?: string; user_type?: 'employer' | 'housegirl' | 'agency' }).status === 'account_exists') {
        const existingRole = (response as { user_type?: 'employer' | 'housegirl' | 'agency' }).user_type || 'employer';
        toast({
          title: 'Account exists',
          description: `Already registered as ${existingRole}. Sign in instead?`,
          action: (
            <ToastAction altText="Sign in instead" onClick={() => navigate('/login')}>
              Yes, Sign In
            </ToastAction>
          ),
        });
        return { error: null };
      }
      if ((response as { status?: string }).status === 'not_found') {
        toast({
          title: 'Account not found',
          description: 'No account found with this number. Create an account first.',
        });
        setSelectedMode('signup');
        navigate('/login?mode=signup');
        return { error: null };
      }

      if ((response as { status?: string; uid?: string }).status === 'role_required') {
        const responseUid = (response as { uid?: string }).uid || result.user.uid;
        navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
        return { error: null };
      }

      if (response.user) {
        setUser(response.user);
        setIsFirebaseUser(true);
      }

      const resolvedUserType = response.user_type;
      if (resolvedUserType === 'employer') {
        navigate('/employer-dashboard');
      } else if (resolvedUserType === 'housegirl') {
        navigate('/housegirl-dashboard');
      } else {
        navigate('/');
      }

      return { error: null };
    } catch (error: unknown) {
      shouldSyncFirebaseUserRef.current = false;
      const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
      const fallbackMessage = error instanceof Error ? error.message : String(error);
      return { error: mapEmailAuthError(errorCode) || fallbackMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      shouldSyncFirebaseUserRef.current = true;
      const { signInWithEmail } = await import('@/lib/firebaseAuth');
      const result = await signInWithEmail(email, password);
      const token = await result.user.getIdToken();
      const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency'; user?: User }>('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: 'login'
        })
      });

      if ((response as { status?: string }).status === 'not_found') {
        toast({
          title: 'Account not found',
          description: 'No account found with this number. Create an account first.',
        });
        setSelectedMode('signup');
        navigate('/login?mode=signup');
        return { error: null, user: response.user };
      }

      if ((response as { status?: string; uid?: string }).status === 'role_required') {
        const responseUid = (response as { uid?: string }).uid || result.user.uid;
        navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
        return { error: null, user: response.user };
      }

      if (response.user) {
        setUser(response.user);
        setIsFirebaseUser(true);
      }

      const resolvedUserType = response.user_type;
      if (resolvedUserType === 'employer') {
        navigate('/employer-dashboard');
      } else if (resolvedUserType === 'housegirl') {
        navigate('/housegirl-dashboard');
      } else {
        navigate('/');
      }

      return { error: null, user: response.user };
    } catch (error: unknown) {
      shouldSyncFirebaseUserRef.current = false;
      const errorCode = typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : undefined;
      const fallbackMessage = error instanceof Error ? error.message : String(error);
      return { error: mapEmailAuthError(errorCode) || fallbackMessage };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    return handleGoogleSignIn();
  };

  const handleGoogleSignIn = async (userType?: 'employer' | 'housegirl' | 'agency', mode?: 'login' | 'signup') => {
    try {
      setLoading(true);
      shouldSyncFirebaseUserRef.current = true;
      const { signInWithGoogle: firebaseSignInWithGoogle } = await import('@/lib/firebaseAuth');
      await firebaseSignInWithGoogle();
      return { error: null };
    } catch (error: unknown) {
      shouldSyncFirebaseUserRef.current = false;
      const exactError = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Sign In Error',
        description: exactError || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
      return { error: exactError || 'Something went wrong. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirectResult = async (userType?: 'employer' | 'housegirl' | 'agency', mode?: 'login' | 'signup') => {
    try {
      setLoading(true);
      const { getGoogleRedirectResult } = await import('@/lib/firebaseAuth');
      const result = await getGoogleRedirectResult();
      if (!result?.user) {
        return { error: null };
      }
      const token = await result.user.getIdToken();

      const response = await apiRequest<{ user_type: 'employer' | 'housegirl' | 'agency'; user?: User }>('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_type: userType,
          mode,
          display_name: result.user.displayName,
          email: result.user.email,
          photo_url: result.user.photoURL
        })
      });

      if ((response as { status?: string; uid?: string }).status === 'role_required') {
        const responseUid = (response as { uid?: string }).uid || result.user.uid;
        navigate(`/login?mode=select-role&uid=${encodeURIComponent(responseUid)}`);
        return { error: null, user: response.user };
      }

      if ((response as { status?: string }).status === 'not_found') {
        toast({
          title: 'Account not found',
          description: 'No account found with this number. Create an account first.',
        });
        setSelectedMode('signup');
        navigate('/login?mode=signup');
        return { error: null, user: response.user };
      }

      if (response.user) {
        setUser(response.user);
        setIsFirebaseUser(true);
      }

      const resolvedUserType = response.user_type;
      if (resolvedUserType === 'employer') {
        navigate('/employer-dashboard');
      } else if (resolvedUserType === 'housegirl') {
        navigate('/housegirl-dashboard');
      } else {
        navigate('/');
      }

      return { error: null, user: response.user };
    } catch (error: unknown) {
      shouldSyncFirebaseUserRef.current = false;
      const exactError = error instanceof Error ? error.message : String(error);
      toast({
        title: 'Sign In Error',
        description: exactError || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
      return { error: exactError || 'Something went wrong. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = useCallback(async (redirectTo = '/home') => {
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
      shouldSyncFirebaseUserRef.current = false;

      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });

      navigate(redirectTo);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Sign out error:', error);
      }

      // Even if logout fails, clear local state
      setUser(null);
      setIsFirebaseUser(false);
      shouldSyncFirebaseUserRef.current = false;

      toast({
        title: "Signed Out",
        description: "You have been signed out.",
      });
    } finally {
      setLoading(false);
      setIsSigningOut(false);
    }
  }, [isFirebaseUser, navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    let warningTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      clearTimeout(warningTimer);

      warningTimer = setTimeout(() => {
        toast({
          title: "Session Expiring",
          description: "You will be logged out in 2 minutes due to inactivity.",
          variant: "destructive",
        });
      }, INACTIVITY_TIMEOUT - 2 * 60 * 1000);

      timer = setTimeout(async () => {
        await signOut('/login');
      }, INACTIVITY_TIMEOUT);
    };

    const events: Array<keyof WindowEventMap> = [
      'mousedown',
      'mousemove',
      'keydown',
      'touchstart',
      'click',
      'scroll',
    ];

    events.forEach((eventName) => window.addEventListener(eventName, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      clearTimeout(warningTimer);
      events.forEach((eventName) => window.removeEventListener(eventName, resetTimer));
    };
  }, [user, signOut]);

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
    handleGoogleSignIn,
    handleGoogleRedirectResult,
    signOut,
    checkSession,
    resetPassword,
    isFirebaseUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};