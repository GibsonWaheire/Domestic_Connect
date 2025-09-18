const API_BASE_URL = 'http://localhost:5000';

export interface User {
  id: string;
  email: string;
  user_type: 'employer' | 'housegirl' | 'agency';
  first_name: string;
  last_name: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone_number: string | null;
  user_type: 'employer' | 'housegirl' | 'agency';
  created_at: string;
  updated_at: string;
}

export interface EmployerProfile {
  id: string;
  profile_id: string;
  company_name: string | null;
  location: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface HousegirlProfile {
  id: string;
  profile_id: string;
  age: number;
  bio: string | null;
  current_location: string;
  location: string;
  education: 'primary' | 'form_2' | 'form_4' | 'certificate' | 'diploma' | 'degree';
  experience: 'no_experience' | '1_year' | '2_years' | '3_years' | '4_years' | '5_plus_years';
  expected_salary: number;
  accommodation_type: 'live_in' | 'live_out' | 'both';
  tribe: string;
  is_available: boolean | null;
  profile_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgencyProfile {
  id: string;
  profile_id: string;
  agency_name: string;
  location: string;
  description: string | null;
  license_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  contacts_included: number;
  is_active: boolean | null;
  created_at: string;
}

export interface UserPurchase {
  id: string;
  user_id: string;
  package_id: string;
  amount_paid: number;
  contacts_remaining: number;
  purchase_date: string;
  expires_at: string | null;
  is_active: boolean | null;
  mpesa_transaction_id: string | null;
}

export interface ContactAccess {
  id: string;
  purchaser_id: string;
  target_profile_id: string;
  accessed_at: string;
}

// Generic API functions
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Profile API functions
export const profilesApi = {
  getAll: () => apiRequest<Profile[]>('/profiles'),
  getById: (id: string) => apiRequest<Profile>(`/profiles/${id}`),
  create: (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => 
    apiRequest<Profile>('/profiles', {
      method: 'POST',
      body: JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }),
  update: (id: string, updates: Partial<Profile>) =>
    apiRequest<Profile>(`/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }),
  delete: (id: string) => apiRequest(`/profiles/${id}`, { method: 'DELETE' }),
};

// Employer Profile API functions
export const employerProfilesApi = {
  getAll: () => apiRequest<EmployerProfile[]>('/employer_profiles'),
  getById: (id: string) => apiRequest<EmployerProfile>(`/employer_profiles/${id}`),
  getByProfileId: (profileId: string) => 
    apiRequest<EmployerProfile[]>(`/employer_profiles?profile_id=${profileId}`),
  create: (profile: Omit<EmployerProfile, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<EmployerProfile>('/employer_profiles', {
      method: 'POST',
      body: JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }),
  update: (id: string, updates: Partial<EmployerProfile>) =>
    apiRequest<EmployerProfile>(`/employer_profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }),
  delete: (id: string) => apiRequest(`/employer_profiles/${id}`, { method: 'DELETE' }),
};

// Housegirl Profile API functions
export const housegirlProfilesApi = {
  getAll: () => apiRequest<HousegirlProfile[]>('/housegirl_profiles'),
  getById: (id: string) => apiRequest<HousegirlProfile>(`/housegirl_profiles/${id}`),
  getByProfileId: (profileId: string) =>
    apiRequest<HousegirlProfile[]>(`/housegirl_profiles?profile_id=${profileId}`),
  create: (profile: Omit<HousegirlProfile, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<HousegirlProfile>('/housegirl_profiles', {
      method: 'POST',
      body: JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }),
  update: (id: string, updates: Partial<HousegirlProfile>) =>
    apiRequest<HousegirlProfile>(`/housegirl_profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }),
  delete: (id: string) => apiRequest(`/housegirl_profiles/${id}`, { method: 'DELETE' }),
};

// Agency Profile API functions
export const agencyProfilesApi = {
  getAll: () => apiRequest<AgencyProfile[]>('/agency_profiles'),
  getById: (id: string) => apiRequest<AgencyProfile>(`/agency_profiles/${id}`),
  getByProfileId: (profileId: string) =>
    apiRequest<AgencyProfile[]>(`/agency_profiles?profile_id=${profileId}`),
  create: (profile: Omit<AgencyProfile, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<AgencyProfile>('/agency_profiles', {
      method: 'POST',
      body: JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }),
  update: (id: string, updates: Partial<AgencyProfile>) =>
    apiRequest<AgencyProfile>(`/agency_profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }),
  delete: (id: string) => apiRequest(`/agency_profiles/${id}`, { method: 'DELETE' }),
};

// Payment Packages API functions
export const paymentPackagesApi = {
  getAll: () => apiRequest<PaymentPackage[]>('/payment_packages'),
  getById: (id: string) => apiRequest<PaymentPackage>(`/payment_packages/${id}`),
  getActive: () => apiRequest<PaymentPackage[]>('/payment_packages?is_active=true'),
};

// User Purchases API functions
export const userPurchasesApi = {
  getAll: () => apiRequest<UserPurchase[]>('/user_purchases'),
  getById: (id: string) => apiRequest<UserPurchase>(`/user_purchases/${id}`),
  getByUserId: (userId: string) =>
    apiRequest<UserPurchase[]>(`/user_purchases?user_id=${userId}`),
  create: (purchase: Omit<UserPurchase, 'id'>) =>
    apiRequest<UserPurchase>('/user_purchases', {
      method: 'POST',
      body: JSON.stringify(purchase),
    }),
  update: (id: string, updates: Partial<UserPurchase>) =>
    apiRequest<UserPurchase>(`/user_purchases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
};

// Contact Access API functions
export const contactAccessApi = {
  getAll: () => apiRequest<ContactAccess[]>('/contact_access'),
  getById: (id: string) => apiRequest<ContactAccess>(`/contact_access/${id}`),
  getByPurchaserId: (purchaserId: string) =>
    apiRequest<ContactAccess[]>(`/contact_access?purchaser_id=${purchaserId}`),
  create: (access: Omit<ContactAccess, 'id'>) =>
    apiRequest<ContactAccess>('/contact_access', {
      method: 'POST',
      body: JSON.stringify({
        ...access,
        accessed_at: new Date().toISOString(),
      }),
    }),
};

// Admin API interfaces
export interface AdminDashboardStats {
  overview: {
    total_users: number;
    total_employers: number;
    total_housegirls: number;
    total_agencies: number;
    active_users: number;
    monthly_users: number;
  };
  agencies: {
    total_agencies: number;
    verified_agencies: number;
    pending_verification: number;
  };
  payments: {
    total_packages: number;
    total_purchases: number;
    total_revenue: number;
  };
  recent_activity: {
    users: Array<{
      id: string;
      email: string;
      user_type: string;
      first_name: string;
      last_name: string;
      created_at: string;
    }>;
    purchases: Array<{
      id: string;
      user_id: string;
      amount: number;
      status: string;
      purchase_date: string;
    }>;
  };
}

export interface AdminUser {
  id: string;
  email: string;
  user_type: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  has_profile: boolean;
}

export interface AdminAgency {
  id: string;
  name: string;
  license_number: string;
  verification_status: string;
  subscription_tier: string;
  rating: number;
  location: string;
  monthly_fee: number;
  commission_rate: number;
  verified_workers: number;
  successful_placements: number;
  contact_email: string;
  contact_phone: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAnalytics {
  user_growth: Array<{ date: string; count: number }>;
  user_types: Array<{ type: string; count: number }>;
  revenue_growth: Array<{ date: string; total: number }>;
  top_agencies: Array<{
    name: string;
    rating: number;
    successful_placements: number;
    verified_workers: number;
  }>;
}

// Admin API functions
export const adminApi = {
  getDashboardStats: (token: string) =>
    apiRequest<AdminDashboardStats>('/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  getUsers: (token: string, params?: { page?: number; per_page?: number; user_type?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.user_type) searchParams.append('user_type', params.user_type);
    if (params?.search) searchParams.append('search', params.search);
    
    return apiRequest<{ users: AdminUser[]; pagination: any }>(`/admin/users?${searchParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  
  getUserDetails: (token: string, userId: string) =>
    apiRequest<any>(`/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  toggleUserStatus: (token: string, userId: string) =>
    apiRequest<any>(`/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  getAgencies: (token: string, params?: { page?: number; per_page?: number; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    return apiRequest<{ agencies: AdminAgency[]; pagination: any }>(`/admin/agencies?${searchParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  
  verifyAgency: (token: string, agencyId: string, status: string) =>
    apiRequest<any>(`/admin/agencies/${agencyId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }),
  
  syncData: (token: string, syncType: string = 'all') =>
    apiRequest<any>('/admin/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: syncType }),
    }),
  
  getAnalytics: (token: string) =>
    apiRequest<AdminAnalytics>('/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
