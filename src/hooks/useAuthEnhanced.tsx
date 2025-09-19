import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService, FirebaseUser } from '@/lib/firebaseAuth';

interface User {
  id: string;
  email: string;
  user_type: 'employer' | 'housegirl' | 'agency';
  first_name: string;
  last_name: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for session management
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Test login credentials for development
const TEST_LOGIN_CREDENTIALS = {
  employer: { email: 'test@employer.com', password: 'password123' },
  housegirl: { email: 'test@housegirl.com', password: 'password123' },
  agency: { email: 'test@agency.com', password: 'password123' }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseUser, setIsFirebaseUser] = useState(false);

  // Check session on mount (auto-login)
  useEffect(() => {
    checkSession();
    
    // Listen to Firebase auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase
        await handleFirebaseUser(firebaseUser);
      } else {
        // User is signed out from Firebase
        if (isFirebaseUser) {
          setUser(null);
          setIsFirebaseUser(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFirebaseUser = async (firebaseUser: FirebaseUser) => {
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
      console.error('Failed to sync Firebase user:', error);
    }
  };

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ user: User | null }>('/api/auth/check_session');
      
      if (response.user) {
        setUser(response.user);
        setIsFirebaseUser(response.user.is_firebase_user || false);
      } else {
        setUser(null);
        setIsFirebaseUser(false);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
      setIsFirebaseUser(false);
    } finally {
      setLoading(false);
    }
  };

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

      toast({
        title: "Account Created",
        description: "Your account has been created successfully! Please check your email to verify your account.",
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

      // Check if this is a test login
      const testCredential = Object.values(TEST_LOGIN_CREDENTIALS).find(
        cred => cred.email === email && cred.password === password
      );

      if (testCredential) {
        // Use backend test login
        const response = await apiRequest<{ message: string; user: User }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        setUser(response.user);
        setIsFirebaseUser(false);

        toast({
          title: "Signed In",
          description: "Welcome back! (Test Account)",
        });

        return { error: null, user: response.user };
      }

      // Use Firebase for regular login
      const firebaseResult = await FirebaseAuthService.signIn(email, password);

      if (!firebaseResult.success) {
        return { error: firebaseResult.error || 'Invalid email or password' };
      }

      // Get user profile from backend
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

      setUser({ ...response.user, is_firebase_user: true });
      setIsFirebaseUser(true);

      toast({
        title: "Signed In",
        description: "Welcome back!",
      });

      return { error: null, user: response.user };
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

      // Get or create user profile in backend
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

      setUser({ ...response.user, is_firebase_user: true });
      setIsFirebaseUser(true);

      toast({
        title: "Signed In",
        description: "Welcome back!",
      });

      return { error: null, user: response.user };
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