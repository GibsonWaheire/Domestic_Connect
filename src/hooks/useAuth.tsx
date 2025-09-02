import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { profilesApi, employerProfilesApi, housegirlProfilesApi, agencyProfilesApi } from '@/lib/api';

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
  signUp: (email: string, password: string, userType: 'employer' | 'housegirl' | 'agency', additionalData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Simple local storage user management
const USER_STORAGE_KEY = 'domestic_connect_user';
const USERS_STORAGE_KEY = 'domestic_connect_users';

// Initialize with test users if no users exist
const initializeTestUser = () => {
  const existingUsers = getStoredUsers();
  if (Object.keys(existingUsers).length === 0) {
    const testEmployer: User = {
      id: 'test_employer_1',
      email: 'employer@example.com',
      user_type: 'employer',
      first_name: 'John',
      last_name: 'Employer',
      phone_number: '+254700123456',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const testHousegirl: User = {
      id: 'test_housegirl_1',
      email: 'housegirl@example.com',
      user_type: 'housegirl',
      first_name: 'Sarah',
      last_name: 'Wanjiku',
      phone_number: '+254700789012',
      age: 28,
      location: 'Westlands, Nairobi',
      experience: '5 years',
      education: 'Form 4 and Above',
      expectedSalary: 'KES 18,000',
      accommodationType: 'Live-in',
      community: 'Kikuyu',
      skills: ['Cooking', 'Cleaning', 'Childcare'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      bio: 'Experienced house help with excellent cooking skills.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const testUsers = {
      'employer@example.com': {
        email: 'employer@example.com',
        password: 'password123',
        user: testEmployer
      },
      'housegirl@example.com': {
        email: 'housegirl@example.com',
        password: 'password123',
        user: testHousegirl
      }
    };
    
    setStoredUsers(testUsers);
    return testUsers;
  }
  return existingUsers;
};

const getStoredUser = (): User | null => {
  try {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
};

const getStoredUsers = (): { [key: string]: { email: string; password: string; user: User } } => {
  try {
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);
    return usersData ? JSON.parse(usersData) : {};
  } catch {
    return {};
  }
};

const setStoredUsers = (users: { [key: string]: { email: string; password: string; user: User } }) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize test user if no users exist
    initializeTestUser();
    
    // Check for existing user on mount
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, userType: 'employer' | 'housegirl' | 'agency', additionalData: Record<string, any>) => {
    try {
      const users = getStoredUsers();
      
      // Check if user already exists
      if (users[email]) {
        return { error: { message: 'User already exists with this email' } };
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        user_type: userType,
        first_name: additionalData.first_name || '',
        last_name: additionalData.last_name || '',
        phone_number: additionalData.phone_number || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Add extended profile data for housegirls
      if (userType === 'housegirl') {
        newUser.age = additionalData.age || 25;
        newUser.location = additionalData.location || 'Nairobi';
        newUser.experience = additionalData.experience || '2 Years';
        newUser.education = additionalData.education || 'Form 4 and Above';
        newUser.expectedSalary = additionalData.expectedSalary || 'KSh 15,000';
        newUser.accommodationType = additionalData.accommodationType || 'Live-in';
        newUser.community = additionalData.community || 'Kikuyu';
        newUser.skills = additionalData.skills || ['Cooking', 'Cleaning', 'Laundry', 'Childcare'];
        newUser.languages = additionalData.languages || ['English', 'Swahili'];
        newUser.bio = additionalData.bio || 'Professional house help with experience in cooking, cleaning, and childcare.';
      }

      // Store user credentials
      users[email] = { email, password, user: newUser };
      setStoredUsers(users);
      
      // Set the current user
      setUser(newUser);
      setStoredUser(newUser);

      // Create profile in the database
      try {
        const profile = await profilesApi.create({
          user_id: newUser.id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          email: newUser.email,
          phone_number: newUser.phone_number,
          user_type: newUser.user_type,
        });

        // Create specific profile based on user type
        if (userType === 'employer') {
          await employerProfilesApi.create({
            profile_id: profile.id,
            company_name: additionalData.company_name || null,
            location: additionalData.location || '',
            description: additionalData.description || null,
          });
        } else if (userType === 'housegirl') {
          await housegirlProfilesApi.create({
            profile_id: profile.id,
            age: additionalData.age || 18,
            bio: additionalData.bio || 'Professional house help with experience in cooking, cleaning, and childcare.',
            current_location: additionalData.current_location || '',
            location: additionalData.location || '',
            education: additionalData.education || 'primary',
            experience: additionalData.experience || 'no_experience',
            expected_salary: additionalData.expected_salary || 0,
            accommodation_type: additionalData.accommodation_type || 'live_in',
            tribe: additionalData.community || '', // Use community field
            is_available: true,
            profile_photo_url: null,
          });
        } else if (userType === 'agency') {
          await agencyProfilesApi.create({
            profile_id: profile.id,
            agency_name: additionalData.agency_name || '',
            location: additionalData.location || '',
            description: additionalData.description || null,
            license_number: additionalData.license_number || null,
          });
        }

        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
        });

        return { error: null };
      } catch (profileError) {
        console.error('Profile creation error:', profileError);
        toast({
          title: "Profile Creation Error",
          description: "Account created but profile setup failed. Please contact support.",
          variant: "destructive"
        });
        return { error: profileError };
      }
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const users = getStoredUsers();
      const userData = users[email];

      if (!userData || userData.password !== password) {
        return { error: { message: 'Invalid email or password' } };
      }

      // Set user as logged in
      setUser(userData.user);
      setStoredUser(userData.user);

      toast({
        title: "Signed In",
        description: "Welcome back!",
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      setStoredUser(null);
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};