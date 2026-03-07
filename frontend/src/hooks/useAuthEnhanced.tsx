import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService, FirebaseUser } from '@/lib/firebaseAuth';
import { errorService } from '@/lib/errorService';

interface User {
  id: string;
  email: string;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseUser, setIsFirebaseUser] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const signUp = async (
    email: string, 
    password: string, 
    userType: 'employer' | 'housegirl' | 'agency', 
    additionalData: Record<string, unknown>
  ) => {
    try {
      setLoading(true);

      // Validate password strength
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters long' };
      }

      // Use Firebase for new signups
      const firebaseResult = await FirebaseAuthService.signUp(
        email, 
        password, 
        `${additionalData.first_name} ${additionalData.last_name}`.trim()
      );

      if (!firebaseResult.success) {
        return { error: firebaseResult.error || 'Failed to create account' };
      }

      // Create user profile in backend
      const token = await FirebaseAuthService.getIdToken();
      const signupData = {
        firebase_uid: firebaseResult.user?.uid,
        email,
        user_type: userType,
        first_name: additionalData.first_name || '',
        last_name: additionalData.last_name || '',
        phone_number: additionalData.phone_number || '',
        is_firebase_user: true
      };

      const response = await apiRequest<{ message: string; user: User }>('/api/auth/firebase_signup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(signupData),
      });

      setUser({ ...response.user, is_firebase_user: true });
      setIsFirebaseUser(true);
      await FirebaseAuthService.signOut();
      setUser(null);
      setIsFirebaseUser(false);

      toast({
        title: "Account Created",
        description: "Your account has been created successfully. Please login with your password.",
      });

      return { error: null };
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Use Firebase for login
      const firebaseResult = await FirebaseAuthService.signIn(email, password);

      if (!firebaseResult.success) {
        return { error: firebaseResult.error || 'Invalid email or password' };
      }

      const token = await FirebaseAuthService.getIdToken();
      const response = await apiRequest<{ user: User }>('/api/auth/firebase_user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firebase_uid: firebaseResult.user?.uid,
          email: firebaseResult.user?.email,
          display_name: firebaseResult.user?.displayName
        })
      });
      const signedInUser = { ...response.user, is_firebase_user: true };
      setUser(signedInUser);
      setIsFirebaseUser(true);

      toast({
        title: "Signed In",
        description: "Welcome back!",
      });

      return { error: null, user: signedInUser };
    } catch (error: unknown) {
      console.error('Signin error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password.';
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      const firebaseResult = await FirebaseAuthService.signInWithGoogle();

      if (!firebaseResult.success) {
        return { error: firebaseResult.error || 'Failed to sign in with Google' };
      }

      const token = await FirebaseAuthService.getIdToken();
      const response = await apiRequest<{ user: User }>('/api/auth/firebase_user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firebase_uid: firebaseResult.user?.uid,
          email: firebaseResult.user?.email,
          display_name: firebaseResult.user?.displayName
        })
      });
      const signedInUser: User = { ...response.user, is_firebase_user: true };
      setUser(signedInUser);
      setIsFirebaseUser(true);

      toast({
        title: "Signed In",
        description: "Welcome back!",
      });

      return { error: null, user: signedInUser };
    } catch (error: unknown) {
      console.error('Google signin error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in with Google.';
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
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
    try {
      const result = await FirebaseAuthService.resetPassword(email);
      
      if (result.success) {
        toast({
          title: "Password Reset",
          description: "Password reset email sent! Check your inbox.",
        });
        return { error: null };
      } else {
        toast({
          title: "Password Reset Failed",
          description: result.error || "Failed to send password reset email.",
          variant: "destructive"
        });
        return { error: result.error || "Failed to send password reset email." };
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send password reset email.';
      
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return { error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
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