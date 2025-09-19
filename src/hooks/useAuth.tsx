import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: 'employer' | 'housegirl' | 'agency', additionalData: Record<string, unknown>) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; user?: User }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount (auto-login)
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ user: User | null }>('/api/auth/check_session');
      
      if (response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
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

      // Prepare signup data
      const signupData = {
        email,
        password,
        user_type: userType,
        first_name: additionalData.first_name || '',
        last_name: additionalData.last_name || '',
        phone_number: additionalData.phone_number || '',
      };

      // Call backend signup endpoint
      const response = await apiRequest<{ message: string; user: User }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      });

      // Set user as logged in (session is automatically set by backend)
      setUser(response.user);

      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
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

      // Call backend login endpoint
      const response = await apiRequest<{ message: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Set user as logged in (session is automatically set by backend)
      setUser(response.user);

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

  const signOut = async () => {
    try {
      setLoading(true);

      // Call backend logout endpoint
      await apiRequest('/api/auth/logout', {
        method: 'DELETE',
      });

      // Clear user state
      setUser(null);

      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      
      // Even if backend logout fails, clear local state
      setUser(null);
      
      toast({
        title: "Signed Out",
        description: "You have been signed out.",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    checkSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};