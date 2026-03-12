import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Heart,
  User,
  Search,
  MapPin,
  CheckCircle,
  Star,
  ArrowRight,
  Briefcase,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Award,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Home,
  Edit,
  Settings,
  LogOut,
  RefreshCw,
  Eye,
  Calendar,
  DollarSign,
  MapPin as LocationIcon,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import ReturnToHome from '@/components/ReturnToHome';
import { jobsApi, JobPosting, crossEntityApi, DashboardData } from '@/lib/api';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';

interface JobOpportunity {
  id: string;
  title: string;
  location: string;
  salary: string;
  postedDate: string;
  employer: string;
  description: string;
  requirements: string[];
  matchScore: number;
}

interface EditFormData {
  bio: string;
  expectedSalary: string;
  location: string;
  experience: string;
  education: string;
  accommodationType: string;
  community: string;
  skills: string;
  languages: string;
}

const HousegirlDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const resolvedUserId = user?.id || ((user as { uid?: string; firebase_uid?: string } | null)?.uid ? `user_${(user as { uid?: string; firebase_uid?: string } | null)?.uid}` : (user as { uid?: string; firebase_uid?: string } | null)?.firebase_uid ? `user_${(user as { uid?: string; firebase_uid?: string } | null)?.firebase_uid}` : '');

  // Additional auth check - ensure only housegirls can access this dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.user_type !== 'housegirl' && !user.is_admin) {
        toast({
          title: "Access Denied",
          description: "This dashboard is only accessible to housegirls.",
          variant: "destructive"
        });

        // Redirect based on user type
        if (user.user_type === 'employer') {
          navigate('/employer-dashboard');
        } else if (user.user_type === 'agency') {
          navigate('/agency-dashboard');
        } else {
          navigate('/');
        }
        return;
      }
    }
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'messages'>('overview');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    bio: '',
    expectedSalary: '',
    location: '',
    experience: '',
    education: '',
    accommodationType: '',
    community: '',
    skills: '',
    languages: ''
  });

  // State for real dashboard data
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>([]);
  const [housegirlProfileId, setHousegirlProfileId] = useState<string>('');
  const [unlockCount, setUnlockCount] = useState(0);
  const [activationFeePaid, setActivationFeePaid] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activationPhone, setActivationPhone] = useState('');
  const [isActivating, setIsActivating] = useState(false);
  const [activationPending, setActivationPending] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Get user's actual data from registration
  const getUserData = useCallback(() => {
    return {
      age: user?.age || '',
      location: user?.location || '',
      experience: user?.experience || '',
      education: user?.education || '',
      expectedSalary: user?.expectedSalary || '',
      accommodationType: user?.accommodationType || '',
      community: user?.community || '',
      skills: user?.skills || [],
      languages: user?.languages || [],
      bio: user?.bio || '',
      photoUrl: (user as { photo_url?: string; profile_photo_url?: string } | null)?.photo_url || (user as { photo_url?: string; profile_photo_url?: string } | null)?.profile_photo_url || ''
    };
  }, [user]);

  // Use real-time data hook
  const {
    dashboardData,
    loading: dataLoading,
    error: dataError,
    refreshing,
    lastUpdated,
    refreshData
  } = useRealTimeData({
    refreshInterval: 30000, // 30 seconds
    enabled: !!user
  });

  // Transform dashboard data when it changes
  useEffect(() => {
    if (dashboardData?.available_data.job_opportunities) {
      const transformedJobs: JobOpportunity[] = dashboardData.available_data.job_opportunities.map(job => ({
        id: job.id,
        title: job.title,
        location: job.location,
        salary: `KSh ${job.salary_min?.toLocaleString() || '0'} - ${job.salary_max?.toLocaleString() || '0'}`,
        postedDate: new Date(job.created_at).toLocaleDateString(),
        employer: job.employer?.name || 'Unknown Employer',
        description: job.description,
        requirements: job.skills_required || [],
        matchScore: 0
      }));
      setJobOpportunities(transformedJobs);
    }
  }, [dashboardData]);

  // Show error if data fetching fails
  useEffect(() => {
    if (dataError) {
      toast({
        title: "Data Sync Error",
        description: "Failed to sync latest data. Some information may be outdated.",
        variant: "destructive",
      });
    }
  }, [dataError]);

  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'housegirl')) {
      navigate('/housegirls');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (!user || user.user_type !== 'housegirl' || !resolvedUserId) return;
      const userData = getUserData();
      if (userData.photoUrl) {
        setProfilePhoto(userData.photoUrl);
      }
      try {
        const token = await FirebaseAuthService.getIdToken();
        const response = await fetch(`/api/housegirls/${resolvedUserId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) return;
        const result = await response.json();
        const apiPhoto = result?.profile_photo_url || result?.photo_url || '';
        const apiSkills = Array.isArray(result?.skills) ? result.skills : [];
        const apiLanguages = Array.isArray(result?.languages) ? result.languages : [];
        if (apiPhoto) {
          setProfilePhoto(apiPhoto);
        }
        setHousegirlProfileId(String(result?.id || ''));
        setUnlockCount(Number(result?.unlock_count) || 0);
        setActivationFeePaid(Boolean(result?.activation_fee_paid));
        setEditFormData({
          bio: result?.bio || '',
          expectedSalary: result?.expected_salary ? String(result.expected_salary) : '',
          location: result?.location || result?.current_location || '',
          experience: result?.experience || '',
          education: result?.education || '',
          accommodationType: result?.accommodation_type || '',
          community: result?.tribe || '',
          skills: apiSkills.join(', '),
          languages: apiLanguages.join(', ')
        });
        if (!activationPhone && user.phone_number) {
          setActivationPhone(user.phone_number);
        }
      } catch {
      }
    };
    loadProfilePhoto();
  }, [activationPhone, getUserData, resolvedUserId, user]);

  const handleActivationPayment = async () => {
    if (!housegirlProfileId || !activationPhone) {
      return;
    }

    setIsActivating(true);
    setActivationPending(false);

    try {
      const token = await FirebaseAuthService.getIdToken();
      const userId = (user as { firebase_uid?: string; id?: string } | null)?.firebase_uid || user?.id;
      const purchaseResponse = await fetch(`${API_BASE_URL}/api/payments/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          package_id: 'high_demand_activation',
          phone_number: activationPhone,
          amount: 500,
        }),
      });
      const purchaseData = await purchaseResponse.json().catch(() => ({}));
      if (!purchaseResponse.ok || !purchaseData?.checkout_request_id) {
        throw new Error(purchaseData?.error || 'Unable to initiate activation payment.');
      }

      setActivationPending(true);
      const timeoutAt = Date.now() + 120000;
      let paymentStatus = 'pending';
      while (Date.now() < timeoutAt) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const statusResponse = await fetch(`${API_BASE_URL}/api/payments/purchase-status/${purchaseData.checkout_request_id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const statusData = await statusResponse.json().catch(() => ({}));
        paymentStatus = statusData?.status || 'pending';
        if (paymentStatus === 'completed') {
          break;
        }
        if (paymentStatus === 'failed') {
          throw new Error('Activation payment failed. Please try again.');
        }
      }

      if (paymentStatus !== 'completed') {
        throw new Error('Payment not confirmed. Please try again.');
      }

      const resetResponse = await fetch(`${API_BASE_URL}/api/housegirls/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          is_available: true,
          in_demand_alert: false,
          unlock_count: 0,
          activation_fee_paid: true,
        }),
      });
      if (!resetResponse.ok) {
        throw new Error('Activation succeeded but failed to refresh profile status.');
      }

      setUnlockCount(0);
      setActivationFeePaid(true);
      setShowActivationModal(false);
      setActivationPending(false);
      await refreshData(false);
      toast({
        title: 'Activation successful',
        description: 'Your profile visibility has been restored.',
      });
    } catch (error) {
      toast({
        title: 'Activation error',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsActivating(false);
      setActivationPending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/housegirls');
  };

  const handlePhotoUpload = async (photoUrl: string) => {
    setProfilePhoto(photoUrl);
    if (!user || !resolvedUserId) return;
    try {
      const token = await FirebaseAuthService.getIdToken();
      await fetch(`/api/housegirls/${resolvedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ photo_url: photoUrl }),
      });
    } catch {
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user || !resolvedUserId) return;
    setIsSavingProfile(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const normalizedSkills = (editFormData.skills || '')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
      const normalizedLanguages = (editFormData.languages || '')
        .split(',')
        .map((language) => language.trim())
        .filter(Boolean);
      const numericRate = Number((editFormData.expectedSalary || '').replace(/[^\d]/g, ''));

      const response = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          role: normalizedSkills[0] || '',
          skills: normalizedSkills,
          languages: normalizedLanguages,
          expected_salary: Number.isFinite(numericRate) ? numericRate : 0,
          monthly_rate: Number.isFinite(numericRate) ? numericRate : 0,
          bio: editFormData.bio,
          location: editFormData.location,
          current_location: editFormData.location,
          experience: editFormData.experience,
          education: editFormData.education,
          accommodation_type: editFormData.accommodationType,
          tribe: editFormData.community,
          profile_photo_url: profilePhoto || null,
        }),
      });

      if (response.ok) {
        const saved = await response.json().catch(() => ({}));
        const savedSkills = Array.isArray(saved?.skills) ? saved.skills : normalizedSkills;
        const savedLanguages = Array.isArray(saved?.languages) ? saved.languages : normalizedLanguages;
        setEditFormData({
          bio: saved?.bio || editFormData.bio,
          expectedSalary: saved?.expected_salary ? String(saved.expected_salary) : editFormData.expectedSalary,
          location: saved?.location || editFormData.location,
          experience: saved?.experience || editFormData.experience,
          education: saved?.education || editFormData.education,
          accommodationType: saved?.accommodation_type || editFormData.accommodationType,
          community: saved?.tribe || editFormData.community,
          skills: savedSkills.join(', '),
          languages: savedLanguages.join(', ')
        });
        if (saved?.profile_photo_url) {
          setProfilePhoto(saved.profile_photo_url);
        }
        toast({
          title: "Profile saved",
          description: "Your profile has been updated successfully.",
        });
        await refreshData(false);
        setShowEditModal(false);
      } else {
        toast({
          title: "Failed to save. Please try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Failed to save. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Initialize edit form data when userData is available
  useEffect(() => {
    if (user && user.user_type === 'housegirl') {
      const userData = getUserData();
      setEditFormData({
        bio: userData.bio,
        expectedSalary: userData.expectedSalary,
        location: userData.location,
        experience: userData.experience,
        education: userData.education,
        accommodationType: userData.accommodationType,
        community: userData.community,
        skills: userData.skills.join(', '),
        languages: userData.languages.join(', ')
      });
    }
  }, [user, getUserData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.user_type !== 'housegirl') {
    return null;
  }

  const userData = getUserData();
  const parsedSkills = (editFormData.skills || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);

  const housegirlCompletionItems = [
    {
      key: 'full-name',
      label: 'Add your full name',
      weight: 10,
      completed: Boolean(`${user.first_name || ''} ${user.last_name || ''}`.trim()),
    },
    {
      key: 'photo',
      label: 'Upload a profile photo',
      weight: 15,
      completed: Boolean(profilePhoto),
    },
    {
      key: 'location',
      label: 'Add your location',
      weight: 10,
      completed: Boolean(editFormData.location || user.location),
    },
    {
      key: 'phone',
      label: 'Confirm your phone number',
      weight: 15,
      completed: Boolean(user.phone_number),
    },
    {
      key: 'role',
      label: 'Add your role or speciality',
      weight: 10,
      completed: Boolean(parsedSkills[0] || (user.skills && user.skills[0])),
    },
    {
      key: 'skills',
      label: 'Add at least 2 skills',
      weight: 10,
      completed: parsedSkills.length >= 2 || (user.skills?.length || 0) >= 2,
    },
    {
      key: 'experience',
      label: 'Add your years of experience',
      weight: 10,
      completed: Boolean(editFormData.experience || user.experience),
    },
    {
      key: 'salary',
      label: 'Add your expected salary',
      weight: 10,
      completed: Boolean(editFormData.expectedSalary || user.expectedSalary),
    },
    {
      key: 'bio',
      label: 'Add a short bio',
      weight: 10,
      completed: Boolean(editFormData.bio || user.bio),
    },
  ] as const;

  const housegirlProfileCompletion = housegirlCompletionItems.reduce(
    (sum, item) => sum + (item.completed ? item.weight : 0),
    0
  );
  const missingHousegirlFields = housegirlCompletionItems.filter((item) => !item.completed);

  const jumpToHousegirlSection = (sectionKey: string) => {
    setActiveTab('profile');
    setTimeout(() => {
      const element = document.getElementById(`housegirl-${sectionKey}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 border border-gray-200 bg-white rounded-lg">
                  <Heart className="h-5 w-5 text-gray-700" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 ml-2">
                  Domestic Connect
                </h1>
              </div>

              <ReturnToHome variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50 hidden sm:flex" />
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200 text-xs">
                {user.user_type}
              </Badge>
              <span className="text-sm text-gray-600 hidden sm:block">
                Karibu, {user.first_name}
              </span>
              <Button variant="outline" onClick={handleSignOut} className="border-gray-300 hover:bg-gray-100 p-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {unlockCount >= 3 && !activationFeePaid && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Your profile is in high demand! Activate premium for KES 500 to stay visible and prioritized.
            <button
              type="button"
              className="ml-1 font-medium underline"
              onClick={() => setShowActivationModal(true)}
            >
              →
            </button>
          </div>
        )}
        {/* Welcome Section */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.first_name ? `Welcome, ${user.first_name}` : 'Welcome!'}
              </h2>
              <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs font-medium border border-green-200 shadow-sm flex items-center">
                👩 Housegirl Account
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm hover:bg-gray-50"
                onClick={() => {
                  toast({
                    title: "Status Update",
                    description: "Availability toggle will be connected to backend soon.",
                    duration: 3000
                  });
                }}
              >
                <div className={`w-2 h-2 rounded-full ${true ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {true ? 'Available for work' : 'Not available'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <Avatar className="h-12 w-12 border-2 border-gray-100">
              <AvatarImage src={profilePhoto || undefined} />
              <AvatarFallback className="bg-gray-100 text-gray-700 font-bold">
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">My Profile</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-blue-600 font-medium"
                onClick={() => setActiveTab('profile')}
              >
                Edit Details
              </Button>
            </div>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {housegirlProfileCompletion < 60 && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">Profile Hidden ({housegirlProfileCompletion}% Complete)</h3>
                <p className="text-sm text-red-800 mt-1">
                  Your profile is hidden from employers. Complete it to get discovered.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setActiveTab('profile')}
              className="bg-red-600 hover:bg-red-700 text-white shrink-0"
              size="sm"
            >
              Complete Profile →
            </Button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'messages', label: 'Messages', icon: MessageCircle }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as 'overview' | 'profile' | 'messages')}
                className={`flex-1 text-xs sm:text-sm ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={() => refreshData(false)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        {lastUpdated && (
          <p className="mb-6 text-xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Job Opportunities */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Available Job Opportunities</CardTitle>
                    <CardDescription>Jobs that best match your skills and preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {dataLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading job opportunities...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobOpportunities.length === 0 ? (
                      <div className="text-center py-8">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No job opportunities available at the moment.</p>
                        <p className="text-sm text-gray-500">Check back later for new opportunities!</p>
                      </div>
                    ) : (
                      jobOpportunities.map((job) => (
                        <Card key={job.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex flex-col space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  {job.matchScore}% Match
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <LocationIcon className="h-4 w-4 mr-2" />
                                  {job.location}
                                </div>
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  {job.salary}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  Posted {job.postedDate}
                                </div>
                              </div>

                              <p className="text-gray-700 text-sm">{job.description}</p>

                              <div>
                                <p className="text-sm font-medium text-gray-900 mb-2">Requirements:</p>
                                <div className="flex flex-wrap gap-1">
                                  {job.requirements.slice(0, 3).map((req, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {req}
                                    </Badge>
                                  ))}
                                  {job.requirements.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{job.requirements.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <p className="text-sm text-gray-600">
                                <strong>Employer:</strong> {job.employer}
                              </p>

                              <div className="flex space-x-2">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                                  Apply Now
                                </Button>
                                <Button variant="outline" size="sm">
                                  Save
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Things you can do to improve your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                    onClick={() => setActiveTab('profile')}
                  >
                    <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <span className="text-xs sm:text-sm">Update Profile</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                  >
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    <span className="text-xs sm:text-sm">Search Jobs</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-16 sm:h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                  >
                    <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    <span className="text-xs sm:text-sm">Preferences</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Profile Information</CardTitle>
                    <CardDescription>Manage your profile details and preferences</CardDescription>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowEditModal(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Photo Upload */}
                  <div className="text-center" id="housegirl-photo">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h4>
                    <PhotoUpload
                      onPhotoUploaded={handlePhotoUpload}
                    />
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div id="housegirl-full-name">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Full Name</label>
                          <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                        <div id="housegirl-phone">
                          <label className="text-sm font-medium text-gray-700">Phone</label>
                          <p className="text-gray-900">{user.phone_number || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Age</label>
                          <p className="text-gray-900">{userData.age} years old</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Community</label>
                          <p className="text-gray-900">{userData.community}</p>
                        </div>
                      </div>
                    </div>

                    <div id="housegirl-location">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Work Preferences</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Preferred Location</label>
                          <p className="text-gray-900">{userData.location}</p>
                        </div>
                        <div id="housegirl-experience">
                          <label className="text-sm font-medium text-gray-700">Experience Level</label>
                          <p className="text-gray-900">{userData.experience}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Education</label>
                          <p className="text-gray-900">{userData.education}</p>
                        </div>
                        <div id="housegirl-salary">
                          <label className="text-sm font-medium text-gray-700">Expected Salary</label>
                          <p className="text-gray-900">{userData.expectedSalary}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Accommodation</label>
                          <p className="text-gray-900">{userData.accommodationType}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Bio */}
                  <div id="housegirl-bio">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">About You</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {userData.bio}
                    </p>
                  </div>

                  <Separator />

                  {/* Skills & Languages */}
                  <div id="housegirl-role">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills & Languages</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div id="housegirl-skills">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Skills</label>
                        <div className="flex flex-wrap gap-2">
                          {userData.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Languages</label>
                        <div className="flex flex-wrap gap-2">
                          {userData.languages.map((language) => (
                            <Badge key={language} variant="outline" className="bg-green-100 text-green-800">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Messages</CardTitle>
                <CardDescription>Communicate with potential employers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600 mb-4">
                    When employers contact you about job opportunities, you'll see their messages here.
                  </p>
                  <Button variant="outline">
                    Browse Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., Nairobi"
                      value={editFormData.location || ''}
                      onChange={(e) => handleFormChange('location', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Expected Salary</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., KSh 15,000"
                      value={editFormData.expectedSalary || ''}
                      onChange={(e) => handleFormChange('expectedSalary', e.target.value)}
                    />
                  </div>
                </div>

                {/* Experience & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    <select
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                      value={editFormData.experience || ''}
                      onChange={(e) => handleFormChange('experience', e.target.value)}
                    >
                      <option value="">Select Experience</option>
                      <option value="No Experience">No Experience</option>
                      <option value="1 Year">1 Year</option>
                      <option value="2 Years">2 Years</option>
                      <option value="3 Years">3 Years</option>
                      <option value="4 Years">4 Years</option>
                      <option value="5+ Years">5+ Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Education</label>
                    <select
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                      value={editFormData.education || ''}
                      onChange={(e) => handleFormChange('education', e.target.value)}
                    >
                      <option value="">Select Education</option>
                      <option value="Primary">Primary</option>
                      <option value="Class 8+">Class 8+</option>
                      <option value="Form 4 and Above">Form 4 and Above</option>
                      <option value="Certificate">Certificate</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Degree">Degree</option>
                    </select>
                  </div>
                </div>

                {/* Accommodation & Community */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Accommodation Type</label>
                    <select
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                      value={editFormData.accommodationType || ''}
                      onChange={(e) => handleFormChange('accommodationType', e.target.value)}
                    >
                      <option value="">Select Accommodation</option>
                      <option value="Live-in">Live-in</option>
                      <option value="Live-out">Live-out</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Community</label>
                    <select
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                      value={editFormData.community || ''}
                      onChange={(e) => handleFormChange('community', e.target.value)}
                    >
                      <option value="">Select Community</option>
                      <option value="Kikuyu">Kikuyu</option>
                      <option value="Luo">Luo</option>
                      <option value="Luhya">Luhya</option>
                      <option value="Kamba">Kamba</option>
                      <option value="Kisii">Kisii</option>
                      <option value="Meru">Meru</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Skills & Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Skills (comma separated)</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., Cooking, Cleaning, Childcare"
                      value={editFormData.skills || ''}
                      onChange={(e) => handleFormChange('skills', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Languages (comma separated)</label>
                    <input
                      type="text"
                      className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., English, Swahili"
                      value={editFormData.languages || ''}
                      onChange={(e) => handleFormChange('languages', e.target.value)}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="text-sm font-medium text-gray-700">About You</label>
                  <textarea
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                    rows={4}
                    placeholder="Tell employers about yourself..."
                    value={editFormData.bio || ''}
                    onChange={(e) => handleFormChange('bio', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showActivationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Activation</h3>
            <p className="text-sm text-gray-600 mb-4">Pay KES 500 to reset high demand status and prioritize your profile.</p>
            <input
              type="tel"
              value={activationPhone}
              onChange={(e) => setActivationPhone(e.target.value)}
              placeholder="M-Pesa phone number"
              className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm mb-3"
            />
            {activationPending && (
              <p className="text-sm text-amber-700 mb-3">Check your phone for M-Pesa prompt and enter PIN to complete.</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowActivationModal(false)}
                disabled={isActivating}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={handleActivationPayment}
                disabled={isActivating || !activationPhone}
              >
                {isActivating ? 'Processing...' : 'Pay KES 500'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousegirlDashboard;
