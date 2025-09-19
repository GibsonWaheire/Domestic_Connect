// Use relative URLs for development (proxy handles forwarding)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  first_name: string;
  last_name: string;
  phone_number: string | null;
  email: string | null;
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

export interface JobApplication {
  id: string;
  job_id: string;
  housegirl_id: string;
  cover_letter: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  reviewed_at: string | null;
}

export interface JobPosting {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  salary_min: number;
  salary_max: number;
  accommodation_type: 'live_in' | 'live_out' | 'both';
  required_experience: 'no_experience' | '1_year' | '2_years' | '3_years' | '4_years' | '5_plus_years';
  required_education: 'primary' | 'form_2' | 'form_4' | 'certificate' | 'diploma' | 'degree';
  skills_required: string[];
  languages_required: string[];
  status: 'active' | 'closed' | 'filled';
  application_deadline: string | null;
  created_at: string;
  updated_at: string;
  employer: {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    company_name: string | null;
    company_location: string | null;
  };
  applications_count: number;
}

// Generic API functions
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    // Remove credentials for proxy compatibility
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Profile API functions
export const profilesApi = {
  getAll: () => apiRequest<Profile[]>('/api/profiles'),
  getById: (id: string) => apiRequest<Profile>(`/api/profiles/${id}`),
  create: (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => 
    apiRequest<Profile>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }),
  update: (id: string, updates: Partial<Profile>) =>
    apiRequest<Profile>(`/api/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }),
  delete: (id: string) => apiRequest(`/api/profiles/${id}`, { method: 'DELETE' }),
};

// Employer Profile API functions
export const employerProfilesApi = {
  getAll: () => apiRequest<EmployerProfile[]>('/api/employers'),
  getById: (id: string) => apiRequest<EmployerProfile>(`/api/employers/${id}`),
  getByProfileId: (profileId: string) => 
    apiRequest<EmployerProfile[]>(`/api/employers?profile_id=${profileId}`),
  create: (profile: Omit<EmployerProfile, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<EmployerProfile>('/api/employers', {
      method: 'POST',
      body: JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }),
  update: (id: string, updates: Partial<EmployerProfile>) =>
    apiRequest<EmployerProfile>(`/api/employers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }),
  delete: (id: string) => apiRequest(`/api/employers/${id}`, { method: 'DELETE' }),
};

// Housegirl Profile API functions
export const housegirlProfilesApi = {
  getAll: () => apiRequest<HousegirlProfile[]>('/api/housegirls'),
  getById: (id: string) => apiRequest<HousegirlProfile>(`/api/housegirls/${id}`),
  getByProfileId: (profileId: string) =>
    apiRequest<HousegirlProfile[]>(`/api/housegirls?profile_id=${profileId}`),
  create: (profile: Omit<HousegirlProfile, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<HousegirlProfile>('/api/housegirls', {
      method: 'POST',
      body: JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }),
  update: (id: string, updates: Partial<HousegirlProfile>) =>
    apiRequest<HousegirlProfile>(`/api/housegirls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }),
  delete: (id: string) => apiRequest(`/api/housegirls/${id}`, { method: 'DELETE' }),
};

// Agency Profile API functions
export const agencyProfilesApi = {
  getAll: () => apiRequest<AgencyProfile[]>('/api/agencies'),
  getById: (id: string) => apiRequest<AgencyProfile>(`/api/agencies/${id}`),
  getByProfileId: (profileId: string) =>
    apiRequest<AgencyProfile[]>(`/api/agencies?profile_id=${profileId}`),
  create: (profile: Omit<AgencyProfile, 'id' | 'created_at' | 'updated_at'>) =>
    apiRequest<AgencyProfile>('/api/agencies', {
      method: 'POST',
      body: JSON.stringify({
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }),
  update: (id: string, updates: Partial<AgencyProfile>) =>
    apiRequest<AgencyProfile>(`/api/agencies/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }),
  delete: (id: string) => apiRequest(`/api/agencies/${id}`, { method: 'DELETE' }),
};

// Alias for backward compatibility
export const agenciesApi = agencyProfilesApi;

// Payment Packages API functions
export const paymentPackagesApi = {
  getAll: () => apiRequest<PaymentPackage[]>('/api/payments/packages'),
  getById: (id: string) => apiRequest<PaymentPackage>(`/api/payments/packages/${id}`),
  getActive: () => apiRequest<PaymentPackage[]>('/api/payments/packages?is_active=true'),
};

// User Purchases API functions
export const userPurchasesApi = {
  getAll: () => apiRequest<UserPurchase[]>('/api/payments/purchases'),
  getById: (id: string) => apiRequest<UserPurchase>(`/api/payments/purchases/${id}`),
  getByUserId: (userId: string) =>
    apiRequest<UserPurchase[]>(`/api/payments/purchases?user_id=${userId}`),
  create: (purchase: Omit<UserPurchase, 'id'>) =>
    apiRequest<UserPurchase>('/api/payments/purchases', {
      method: 'POST',
      body: JSON.stringify(purchase),
    }),
  update: (id: string, updates: Partial<UserPurchase>) =>
    apiRequest<UserPurchase>(`/api/payments/purchases/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),
};

// Contact Access API functions
export const contactAccessApi = {
  getAll: () => apiRequest<ContactAccess[]>('/api/payments/contact-access'),
  getById: (id: string) => apiRequest<ContactAccess>(`/api/payments/contact-access/${id}`),
  getByPurchaserId: (purchaserId: string) =>
    apiRequest<ContactAccess[]>(`/api/payments/contact-access?purchaser_id=${purchaserId}`),
  create: (access: Omit<ContactAccess, 'id'>) =>
    apiRequest<ContactAccess>('/api/payments/contact-access', {
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
    apiRequest<AdminDashboardStats>('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  getUsers: (token: string, params?: { page?: number; per_page?: number; user_type?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.user_type) searchParams.append('user_type', params.user_type);
    if (params?.search) searchParams.append('search', params.search);
    
    return apiRequest<{ users: AdminUser[]; pagination: { page: number; per_page: number; total: number; pages: number } }>(`/api/admin/users?${searchParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  
  getUserDetails: (token: string, userId: string) =>
    apiRequest<AdminUser>(`/api/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  toggleUserStatus: (token: string, userId: string) =>
    apiRequest<{ success: boolean; message: string }>(`/api/admin/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    }),
  
  getAgencies: (token: string, params?: { page?: number; per_page?: number; status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    return apiRequest<{ agencies: AdminAgency[]; pagination: { page: number; per_page: number; total: number; pages: number } }>(`/api/admin/agencies?${searchParams}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  
  verifyAgency: (token: string, agencyId: string, status: string) =>
    apiRequest<{ success: boolean; message: string }>(`/api/admin/agencies/${agencyId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    }),
  
  syncData: (token: string, syncType: string = 'all') =>
    apiRequest<{ success: boolean; message: string }>('/api/admin/sync', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type: syncType }),
    }),
  
  getAnalytics: (token: string) =>
    apiRequest<AdminAnalytics>('/api/admin/analytics', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Job Posting API functions
export const jobsApi = {
  getAll: (params?: { 
    location?: string; 
    salary_min?: number; 
    salary_max?: number; 
    accommodation_type?: string; 
    experience?: string; 
    education?: string; 
    status?: string; 
    page?: number; 
    per_page?: number 
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.location) searchParams.append('location', params.location);
    if (params?.salary_min) searchParams.append('salary_min', params.salary_min.toString());
    if (params?.salary_max) searchParams.append('salary_max', params.salary_max.toString());
    if (params?.accommodation_type) searchParams.append('accommodation_type', params.accommodation_type);
    if (params?.experience) searchParams.append('experience', params.experience);
    if (params?.education) searchParams.append('education', params.education);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    
    return apiRequest<{ jobs: JobPosting[]; pagination: { page: number; per_page: number; total: number; pages: number } }>(`/api/jobs/?${searchParams}`);
  },
  
  getById: (id: string) => apiRequest<JobPosting>(`/api/jobs/${id}`),
  
  create: (job: Omit<JobPosting, 'id' | 'created_at' | 'updated_at' | 'employer' | 'applications_count'>) =>
    apiRequest<JobPosting>('/api/jobs/', {
      method: 'POST',
      body: JSON.stringify(job),
    }),
  
  update: (id: string, updates: Partial<JobPosting>) =>
    apiRequest<JobPosting>(`/api/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string) => apiRequest(`/api/jobs/${id}`, { method: 'DELETE' }),
  
  apply: (jobId: string, coverLetter?: string) =>
    apiRequest<JobApplication>(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ cover_letter: coverLetter }),
    }),
  
  getApplications: (jobId: string) =>
    apiRequest<{ applications: JobApplication[] }>(`/api/jobs/${jobId}/applications`),
};

// Cross-entity dashboard data interface
export interface DashboardData {
  user: {
    id: string;
    email: string;
    user_type: 'employer' | 'housegirl' | 'agency';
    first_name: string;
    last_name: string;
    is_admin: boolean;
  };
  stats: {
    [key: string]: number;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user_id?: string;
  }>;
  available_data: {
    housegirls?: HousegirlProfile[];
    job_postings?: JobPosting[];
    agencies?: AgencyProfile[];
    job_opportunities?: JobPosting[];
    employers?: EmployerProfile[];
    clients?: Array<{
      id: string;
      name: string;
      email: string;
      phone_number: string;
      company_name: string;
      location: string;
      placement_status: string;
      hire_date: string;
    }>;
    workers?: Array<{
      id: string;
      name: string;
      verification_status: string;
      training_certificates: string[];
      hire_date: string;
    }>;
    all_employers?: EmployerProfile[];
    all_housegirls?: HousegirlProfile[];
    all_users?: User[];
    all_job_postings?: JobPosting[];
    all_applications?: JobApplication[];
  };
}

export const crossEntityApi = {
  getDashboardData: () => apiRequest<DashboardData>('/api/cross-entity/dashboard-data')
};
