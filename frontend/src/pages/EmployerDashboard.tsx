import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/employer/Header';
import { Footer } from '@/components/employer/Footer';
import { Housegirls } from '@/components/employer/Housegirls';
import { Settings } from '@/components/employer/Settings';
import { UnlockModal } from '@/components/employer/UnlockModal';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { filterHousegirls } from '@/utils/filterUtils';
import { Housegirl } from '@/types/employer';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Briefcase, LogOut, Phone, Plus, RefreshCw, Settings as SettingsIcon, Trash2, Users, X } from 'lucide-react';
import { KENYA_CITIES, SKILLS_OPTIONS, EXPERIENCE_OPTIONS, WORK_TYPE_OPTIONS, EDUCATION_OPTIONS } from '@/constants/employer';
import { API_BASE_URL } from '@/lib/apiConfig';

const EmployerDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Additional auth check - ensure only employers can access this dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.user_type !== 'employer' && !user.is_admin) {
        toast({
          title: "Access Denied",
          description: "This dashboard is only accessible to employers.",
          variant: "destructive"
        });

        // Redirect based on user type
        if (user.user_type === 'housegirl') {
          navigate('/housegirl-dashboard');
        } else if (user.user_type === 'agency') {
          navigate('/agency-dashboard');
        } else {
          navigate('/');
        }
        return;
      }
    }
  }, [user, loading, navigate]);

  // State
  const [activeSection, setActiveSection] = useState('housegirls');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [housegirlToUnlock, setHousegirlToUnlock] = useState<Housegirl | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLivingArrangement, setSelectedLivingArrangement] = useState('');
  const [unlockRestrictionMessage, setUnlockRestrictionMessage] = useState<string | null>(null);

  // State for real data
  const [housegirls, setHousegirls] = useState<Housegirl[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '', description: '', location: '',
    salaryMin: '', salaryMax: '', workType: '',
    experience: '', education: '', skills: [] as string[], deadline: '',
  });
  const [employerProfileData, setEmployerProfileData] = useState<{
    full_name?: string;
    first_name?: string;
    last_name?: string;
    location?: string;
    phone?: string;
    profile_photo_url?: string;
    company_name?: string;
    description?: string;
  } | null>(null);

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

  // Extract job postings from dashboard data
  useEffect(() => {
    const jobs = (dashboardData?.available_data as any)?.job_postings || [];
    setJobPostings(jobs);
  }, [dashboardData]);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;

    const loadProfile = async () => {
      try {
        const token = await FirebaseAuthService.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/employers/${user.id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) {
          setEmployerProfileData(data);
        }
      } catch {
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // Transform dashboard data when it changes
  useEffect(() => {
    const apiHousegirls = dashboardData?.available_data.housegirls || [];
    const transformedHousegirls: Housegirl[] = apiHousegirls.map((hg) => ({
      id: String(hg.id),
      name: `${hg.first_name || 'Unknown'} ${hg.last_name || ''}`,
      age: hg.age,
      location: hg.location,
      experience: hg.experience,
      education: hg.education,
      salary: `KSh ${hg.expected_salary?.toLocaleString() || '0'}`,
      status: hg.is_available ? 'available' : 'unavailable',
      bio: hg.bio,
      skills: hg.skills || [],
      contactUnlocked: Boolean(
        hg.phone_number &&
        hg.phone_number !== 'Unlock to view' &&
        hg.email &&
        hg.email !== 'Unlock to view'
      ),
      unlockCount: Number(hg.unlock_count) || 0,
      phone: hg.phone_number,
      email: hg.email,
      community: hg.tribe,
      workType: hg.accommodation_type,
      livingArrangement: hg.accommodation_type,
      profileImage: hg.profile_photo_url
    }));

    const sortedRealHousegirls = transformedHousegirls.sort((a, b) => {
      const aMatch = apiHousegirls.find((hg) => String(hg.id) === String(a.id));
      const bMatch = apiHousegirls.find((hg) => String(hg.id) === String(b.id));
      const aTime = Date.parse((aMatch as { created_at?: string } | undefined)?.created_at || '');
      const bTime = Date.parse((bMatch as { created_at?: string } | undefined)?.created_at || '');
      if (Number.isFinite(aTime) && Number.isFinite(bTime)) {
        return bTime - aTime;
      }
      return Number(b.id) - Number(a.id);
    });
    setHousegirls(sortedRealHousegirls);
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

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Show loading state while auth is initializing or data is loading
  if (loading || dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border border-gray-200 bg-white flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we load your account and data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Filtered housegirls
  const filteredHousegirls = filterHousegirls(
    housegirls,
    searchTerm,
    selectedCommunity,
    selectedAgeRange,
    selectedSalaryRange,
    selectedEducation,
    selectedWorkType,
    selectedExperience,
    selectedLivingArrangement
  );

  // Real-time stats from dashboard data
  const stats = dashboardData?.stats as any || {
    totalApplications: housegirls.length,
    activeJobs: 0,
    totalViews: 0,
    unreadMessages: 0
  };

  const employerCompletionItems = [
    {
      key: 'first-name',
      label: 'Add your first name',
      weight: 20,
      completed: Boolean((employerProfileData?.first_name || user?.first_name || '').trim()),
    },
    {
      key: 'last-name',
      label: 'Add your last name',
      weight: 20,
      completed: Boolean((employerProfileData?.last_name || user?.last_name || '').trim()),
    },
    {
      key: 'location',
      label: 'Add your location',
      weight: 15,
      completed: Boolean((employerProfileData?.location || (user as { location?: string } | null)?.location || '').trim()),
    },
    {
      key: 'photo',
      label: 'Upload a profile photo',
      weight: 20,
      completed: Boolean(employerProfileData?.profile_photo_url || (user as { profile_photo_url?: string } | null)?.profile_photo_url),
    },
    {
      key: 'company_name',
      label: 'Add your company name',
      weight: 10,
      completed: Boolean((employerProfileData?.company_name || '').trim()),
    },
    {
      key: 'phone',
      label: 'Add your phone number',
      weight: 10,
      completed: Boolean((employerProfileData?.phone || (user as { phone_number?: string } | null)?.phone_number || '').trim()),
    },
    {
      key: 'description',
      label: 'Add a company description',
      weight: 5,
      completed: Boolean((employerProfileData?.description || '').trim()),
    },
  ] as const;

  const employerProfileCompletion = employerCompletionItems.reduce(
    (sum, item) => sum + (item.completed ? item.weight : 0),
    0
  );
  const missingEmployerFields = employerCompletionItems.filter((item) => !item.completed);

  const jumpToEmployerProfileSection = (sectionKey: string) => {
    setActiveSection('settings');
    setTimeout(() => {
      window.location.hash = `employer-${sectionKey}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnlockAttempt = (housegirl: Housegirl) => {
    setUnlockRestrictionMessage(null);
    setHousegirlToUnlock(housegirl);
    setShowUnlockModal(true);
  };

  const handleJobSkillToggle = (skill: string) => {
    setJobFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleCreateJob = async () => {
    if (!jobFormData.title || !jobFormData.location || !jobFormData.salaryMin || !jobFormData.salaryMax) {
      toast({ title: "Missing required fields", description: "Please fill in title, location, and salary range.", variant: "destructive" });
      return;
    }
    setIsCreatingJob(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: jobFormData.title,
          description: jobFormData.description,
          location: jobFormData.location,
          salary_min: parseInt(jobFormData.salaryMin) || 0,
          salary_max: parseInt(jobFormData.salaryMax) || 0,
          accommodation_type: jobFormData.workType,
          required_experience: jobFormData.experience,
          required_education: jobFormData.education,
          skills_required: jobFormData.skills,
          application_deadline: jobFormData.deadline,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create job');
      }
      const newJob = await res.json();
      setJobPostings(prev => [newJob, ...prev]);
      setShowJobForm(false);
      setJobFormData({ title: '', description: '', location: '', salaryMin: '', salaryMax: '', workType: '', experience: '', education: '', skills: [], deadline: '' });
      toast({ title: "Job posted!", description: `"${newJob.title}" is now live.` });
      await refreshData(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: "Failed to post job", description: msg, variant: "destructive" });
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const token = await FirebaseAuthService.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete job');
      }
      setJobPostings(prev => prev.filter((j: any) => j.id !== jobId));
      toast({ title: "Job deleted." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      toast({ title: "Failed to delete job", description: msg, variant: "destructive" });
    }
  };

  const handleUnlockSuccess = async (payload: { housegirlId: number; phone?: string; email?: string }) => {
    setHousegirls((prev) =>
      prev.map((housegirl) =>
        String(housegirl.id) === String(payload.housegirlId)
          ? {
              ...housegirl,
              contactUnlocked: true,
              unlockCount: (housegirl.unlockCount || 0) + 1,
              phone: payload.phone || housegirl.phone,
              email: payload.email || housegirl.email,
            }
          : housegirl
      )
    );
    await refreshData(false);
  };

  const sidebarItems = [
    { id: 'housegirls', label: 'Browse Housegirls', icon: Users },
    { id: 'contacts', label: 'My Contacts', icon: Phone },
    { id: 'jobs', label: 'Post a Job', icon: Briefcase },
    { id: 'agency', label: 'Agency Services', icon: Building2 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] as const;

  // Render section based on active section
  const renderSection = () => {
    switch (activeSection) {
      case 'housegirls':
        if (housegirls.length === 0) {
          return (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">
                No profiles available yet.
              </p>
              <a href="/housegirls" className="text-amber-600 text-sm underline mt-2 block">
                Browse all profiles →
              </a>
            </div>
          );
        }
        return (
          <Housegirls
            housegirls={housegirls}
            filteredHousegirls={filteredHousegirls}
            searchTerm={searchTerm}
            selectedCommunity={selectedCommunity}
            setSelectedCommunity={setSelectedCommunity}
            selectedAgeRange={selectedAgeRange}
            setSelectedAgeRange={setSelectedAgeRange}
            selectedSalaryRange={selectedSalaryRange}
            setSelectedSalaryRange={setSelectedSalaryRange}
            selectedEducation={selectedEducation}
            setSelectedEducation={setSelectedEducation}
            selectedWorkType={selectedWorkType}
            setSelectedWorkType={setSelectedWorkType}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
            selectedLivingArrangement={selectedLivingArrangement}
            setSelectedLivingArrangement={setSelectedLivingArrangement}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onUnlock={handleUnlockAttempt}
          />
        );
      case 'contacts': {
        const unlockedContacts = housegirls.filter((housegirl) => housegirl.contactUnlocked);
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-gray-900">My Contacts</h2>
              <p className="mt-1 text-sm text-gray-600">
                Housegirls whose contact details you have unlocked.
              </p>
            </div>
            {unlockedContacts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
                No contacts unlocked yet. Browse housegirls and click Unlock Contact.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {unlockedContacts.map((contact) => (
                  <div key={contact.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-base font-semibold text-gray-900">{contact.name}</p>
                    <p className="mt-1 text-sm text-gray-600">{contact.location}</p>
                    <p className="mt-2 text-sm text-gray-700">Phone: {contact.phone || 'Not available'}</p>
                    <p className="text-sm text-gray-700">Email: {contact.email || 'Not available'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }
      case 'jobs':
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Post a Job</h2>
                <p className="mt-1 text-sm text-gray-600">Create job postings and manage applications from housegirls.</p>
              </div>
              <Button type="button" onClick={() => setShowJobForm(v => !v)}>
                {showJobForm ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Plus className="h-4 w-4 mr-2" />New Job</>}
              </Button>
            </div>

            {showJobForm && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.title}
                      onChange={e => setJobFormData(p => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Full-time Housegirl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.location}
                      onChange={e => setJobFormData(p => ({ ...p, location: e.target.value }))}
                    >
                      <option value="">Select city</option>
                      {KENYA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Min (KES) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.salaryMin}
                      onChange={e => setJobFormData(p => ({ ...p, salaryMin: e.target.value }))}
                      placeholder="e.g. 15000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary Max (KES) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.salaryMax}
                      onChange={e => setJobFormData(p => ({ ...p, salaryMax: e.target.value }))}
                      placeholder="e.g. 25000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.workType}
                      onChange={e => setJobFormData(p => ({ ...p, workType: e.target.value }))}
                    >
                      <option value="">Any</option>
                      {WORK_TYPE_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.experience}
                      onChange={e => setJobFormData(p => ({ ...p, experience: e.target.value }))}
                    >
                      <option value="">Any</option>
                      {EXPERIENCE_OPTIONS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Required</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.education}
                      onChange={e => setJobFormData(p => ({ ...p, education: e.target.value }))}
                    >
                      <option value="">Any</option>
                      {EDUCATION_OPTIONS.map(ed => <option key={ed} value={ed}>{ed}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.deadline}
                      onChange={e => setJobFormData(p => ({ ...p, deadline: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    rows={3}
                    value={jobFormData.description}
                    onChange={e => setJobFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe duties, requirements, and expectations..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills Required</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_OPTIONS.map(skill => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleJobSkillToggle(skill)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          jobFormData.skills.includes(skill)
                            ? 'bg-gray-900 text-white border-gray-900'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowJobForm(false)}>Cancel</Button>
                  <Button type="button" onClick={handleCreateJob} disabled={isCreatingJob}>
                    {isCreatingJob ? 'Posting...' : 'Post Job'}
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">My Job Postings</h3>
              {jobPostings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No job postings yet. Click "New Job" to get started.</p>
              ) : (
                <div className="space-y-3">
                  {jobPostings.map((job: any) => (
                    <div key={job.id} className="flex items-start justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {job.status || 'active'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {job.location} · KES {job.salary_min?.toLocaleString()} – {job.salary_max?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.applications_count ?? 0} applicant{(job.applications_count ?? 0) !== 1 ? 's' : ''} ·{' '}
                          Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : '—'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        className="ml-3 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                        title="Delete job"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      case 'settings':
        return (
          <Settings
            stats={stats}
            profileData={employerProfileData}
          />
        );
      case 'agency':
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-gray-900">Agency Services</h2>
              <p className="mt-1 text-sm text-gray-600">
                Explore trusted agency options and packages when you need fully managed hiring support.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-base font-semibold text-gray-900">Agency Marketplace</p>
                <p className="mt-1 text-sm text-gray-600">
                  Compare agencies by services and location before you hire.
                </p>
                <Button
                  type="button"
                  className="mt-3"
                  onClick={() => navigate('/agency-marketplace')}
                >
                  Browse Agencies
                </Button>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-base font-semibold text-gray-900">Agency Packages</p>
                <p className="mt-1 text-sm text-gray-600">
                  View package plans with replacement and support options.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3"
                  onClick={() => navigate('/agency-packages')}
                >
                  View Packages
                </Button>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <Housegirls
            housegirls={housegirls}
            filteredHousegirls={filteredHousegirls}
            searchTerm={searchTerm}
            selectedCommunity={selectedCommunity}
            setSelectedCommunity={setSelectedCommunity}
            selectedAgeRange={selectedAgeRange}
            setSelectedAgeRange={setSelectedAgeRange}
            selectedSalaryRange={selectedSalaryRange}
            setSelectedSalaryRange={setSelectedSalaryRange}
            selectedEducation={selectedEducation}
            setSelectedEducation={setSelectedEducation}
            selectedWorkType={selectedWorkType}
            setSelectedWorkType={setSelectedWorkType}
            selectedExperience={selectedExperience}
            setSelectedExperience={setSelectedExperience}
            selectedLivingArrangement={selectedLivingArrangement}
            setSelectedLivingArrangement={setSelectedLivingArrangement}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onUnlock={handleUnlockAttempt}
          />
        );
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">

            {/* Welcome Section */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.first_name ? `Welcome back, ${user.first_name}` : 'Welcome, Employer'}
                  </h1>
                  <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-medium border border-gray-200 shadow-sm flex items-center">
                    👔 Employer Account
                  </span>
                </div>
                <p className="text-gray-500 text-sm">Find and manage the perfect domestic staff for your home.</p>
              </div>
            </div>

            {/* Status Banner - Informative */}
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Profile Live ({employerProfileCompletion}%)</h3>
                <p className="text-sm text-blue-800 mt-1">
                  You can now unlock contacts and post jobs! Add more details to your profile to stand out to candidates.
                </p>
              </div>
              <Button
                onClick={() => setActiveSection('settings')}
                className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                size="sm"
              >
                {employerProfileCompletion < 100 ? 'Add Details →' : 'Edit Profile'}
              </Button>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
              <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto flex-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <Button
                      key={item.id}
                      type="button"
                      variant="outline"
                      onClick={() => setActiveSection(item.id)}
                      className={isActive ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900' : 'text-gray-700'}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
                <Button
                  type="button"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => refreshData(false)}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
            {lastUpdated && (
              <p className="mb-3 text-xs text-gray-500 mt-2 w-full">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            )}

            {renderSection()}
          </main>

          {/* Footer */}
          <Footer
            filteredHousegirlsCount={filteredHousegirls.length}
          />
        </div>

        <UnlockModal
          showUnlockModal={showUnlockModal}
          setShowUnlockModal={setShowUnlockModal}
          housegirlToUnlock={housegirlToUnlock}
          isUnlocking={isUnlocking}
          setIsUnlocking={setIsUnlocking}
          employerPhone={user.phone_number}
          onUnlockSuccess={handleUnlockSuccess}
        />
      </div>
    </NotificationProvider>
  );
};

export default EmployerDashboard;
