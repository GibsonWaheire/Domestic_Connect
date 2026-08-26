import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/employer/Header';
import { Footer } from '@/components/employer/Footer';
import { Housegirls } from '@/components/employer/Housegirls';
import { Settings } from '@/components/employer/Settings';
import { UnlockModal } from '@/components/employer/UnlockModal';
import AppliedHousegirlsList from '@/components/employer/AppliedHousegirlsList';
import { MessageThread } from '@/components/employer/MessageThread';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { filterHousegirls } from '@/utils/filterUtils';
import { Housegirl } from '@/types/employer';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Briefcase, CheckCircle, ClipboardList, LogOut, MessageCircle, Phone,
  Plus, RefreshCw, Settings as SettingsIcon, Trash2, Users, X
} from 'lucide-react';
import {
  KENYA_CITIES, SKILLS_OPTIONS, EXPERIENCE_OPTIONS,
  WORK_TYPE_OPTIONS, EDUCATION_OPTIONS
} from '@/constants/employer';
import { API_BASE_URL } from '@/lib/apiConfig';

// ─── Employer Messages sub-component ─────────────────────────────────────────
const EmployerMessages = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openThread, setOpenThread] = useState<string | null>(null);

  const authHeaders = async () => {
    const token = await FirebaseAuthService.getIdToken().catch(() => null);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => { loadThreads(); }, []);

  const loadThreads = async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/messages/threads`, { headers });
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  };

  if (loading) return <div className="py-10 text-center text-sm text-gray-400">Loading messages…</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <p className="mt-1 text-sm text-gray-600">
            Your conversations with housegirls. Unlock a contact in "Post a Job" to start messaging.
          </p>
        </div>
        <Button onClick={loadThreads} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {threads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
          <MessageCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">No conversations yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Go to <strong>Post a Job</strong> → View Applicants → Unlock a contact (KSh 100) to start messaging.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {threads.map((thread: any) => (
            <div key={`${thread.housegirl_id}-${thread.job_id}`} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                onClick={() => setOpenThread(
                  openThread === `${thread.housegirl_id}-${thread.job_id}`
                    ? null
                    : `${thread.housegirl_id}-${thread.job_id}`
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#111] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {(thread.housegirl_name || 'H').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{thread.housegirl_name || 'Housegirl'}</p>
                    <p className="text-xs text-gray-400">{thread.job_title || 'Job Application'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {thread.unread_count > 0 && (
                    <span className="bg-[#111] text-white text-xs rounded-full px-2 py-0.5">{thread.unread_count}</span>
                  )}
                  <p className="text-xs text-gray-400">{thread.last_message_at ? new Date(thread.last_message_at).toLocaleDateString() : ''}</p>
                </div>
              </button>

              {openThread === `${thread.housegirl_id}-${thread.job_id}` && (
                <div className="border-t px-4 pb-4 pt-3">
                  <MessageThread
                    jobId={thread.job_id}
                    housegirlId={thread.housegirl_id}
                    housegirlName={thread.housegirl_name || 'Housegirl'}
                    myId={thread.employer_id}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main EmployerDashboard ───────────────────────────────────────────────────
const EmployerDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Navigation
  const [activeSection, setActiveSection] = useState('housegirls');

  // Unlock modal
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [housegirlToUnlock, setHousegirlToUnlock] = useState<Housegirl | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Search / filters
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLivingArrangement, setSelectedLivingArrangement] = useState('');

  // Data
  const [housegirls, setHousegirls] = useState<Housegirl[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [jobApplicants, setJobApplicants] = useState<Record<string, any[]>>({});
  const [fetchingApplicants, setFetchingApplicants] = useState<string | null>(null);
  const [jobFormData, setJobFormData] = useState({
    title: '', description: '', location: '',
    salaryMin: '', salaryMax: '', workType: '',
    experience: '', education: '', skills: [] as string[], deadline: '',
  });
  const [employerProfileData, setEmployerProfileData] = useState<{
    full_name?: string; first_name?: string; last_name?: string;
    location?: string; phone?: string; profile_photo_url?: string;
    company_name?: string; description?: string;
  } | null>(null);

  // My staffing requests
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    category: '', location: '', live_in: 'flexible',
    start_date: '', salary_budget: '', duties: '', contact_phone: '',
  });
  const [paymentVerified, setPaymentVerified] = useState<boolean | null>(null);

  // Real-time data
  const { dashboardData, loading: dataLoading, error: dataError, refreshing, refreshData, lastUpdated } = useRealTimeData();

  // Auth guard
  useEffect(() => {
    if (!loading && user) {
      if (user.user_type !== 'employer' && !user.is_admin) {
        if (user.user_type === 'housegirl') navigate('/housegirl-dashboard');
        else if (user.user_type === 'agency') navigate('/agency-dashboard');
        else navigate('/');
      }
    }
  }, [user, loading, navigate]);

  // Transform dashboard data
  useEffect(() => {
    const apiHousegirls = dashboardData?.available_data?.housegirls || [];
    const transformed: Housegirl[] = (apiHousegirls as any[]).map((hg) => ({
      id: String(hg.id),
      name: `${hg.first_name || 'Unknown'} ${hg.last_name || ''}`,
      age: hg.age,
      location: hg.location,
      experience: hg.experience,
      education: hg.education,
      salary: hg.expected_salary && hg.expected_salary >= 1000
        ? `KSh ${hg.expected_salary.toLocaleString()}`
        : 'Not specified',
      status: hg.is_available ? 'available' : 'unavailable',
      bio: hg.bio,
      skills: hg.skills || [],
      contactUnlocked: Boolean(hg.contact_unlocked || (hg.phone_number && hg.phone_number !== 'Unlock to view')),
      unlockCount: Number(hg.unlock_count) || 0,
      phone: hg.phone_number,
      email: hg.email,
      community: hg.tribe,
      workType: hg.accommodation_type,
      livingArrangement: hg.accommodation_type,
      profileImage: hg.profile_photo_url,
    }));
    transformed.sort((a, b) => {
      if (a.contactUnlocked && !b.contactUnlocked) return -1;
      if (!a.contactUnlocked && b.contactUnlocked) return 1;
      return 0;
    });
    setHousegirls(transformed);
    setJobPostings((dashboardData?.available_data as any)?.job_postings || []);
    setEmployerProfileData((dashboardData?.available_data as any)?.employer_profile || null);
  }, [dashboardData]);

  useEffect(() => {
    if (dataError) toast({ title: 'Data Sync Error', description: 'Failed to sync latest data.', variant: 'destructive' });
  }, [dataError]);

  // Check payment verification status
  useEffect(() => {
    if (!user?.id) return;
    const checkPayment = async () => {
      try {
        const token = await FirebaseAuthService.getIdToken().catch(() => null);
        const res = await fetch(`${API_BASE_URL}/api/payments/credit-summary`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const data = await res.json();
          setPaymentVerified((data.total_credits ?? 0) > 0 || data.employer_active === true);
        }
      } catch { /* silent */ }
    };
    checkPayment();
  }, [user?.id]);

  // Load employer requests when tab is active
  useEffect(() => {
    if (activeSection !== 'requests') return;
    const load = async () => {
      setLoadingRequests(true);
      try {
        const token = await FirebaseAuthService.getIdToken().catch(() => null);
        const res = await fetch(`${API_BASE_URL}/api/employer-requests/mine`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const data = await res.json();
          setMyRequests(data.requests || []);
        }
      } catch { /* silent */ } finally { setLoadingRequests(false); }
    };
    load();
  }, [activeSection]);

  // Profile completion
  const employerCompletionItems = [
    { key: 'first-name', label: 'Add your first name', weight: 20, completed: Boolean((employerProfileData?.first_name || user?.first_name || '').trim()) },
    { key: 'last-name', label: 'Add your last name', weight: 20, completed: Boolean((employerProfileData?.last_name || user?.last_name || '').trim()) },
    { key: 'location', label: 'Add your location', weight: 15, completed: Boolean((employerProfileData?.location || (user as any)?.location || '').trim()) },
    { key: 'photo', label: 'Upload a profile photo', weight: 20, completed: Boolean(employerProfileData?.profile_photo_url || (user as any)?.profile_photo_url) },
    { key: 'company_name', label: 'Add your company name', weight: 10, completed: Boolean((employerProfileData?.company_name || '').trim()) },
    { key: 'phone', label: 'Add your phone number', weight: 10, completed: Boolean((employerProfileData?.phone || (user as any)?.phone_number || '').trim()) },
    { key: 'description', label: 'Add a company description', weight: 5, completed: Boolean((employerProfileData?.description || '').trim()) },
  ] as const;

  const employerProfileCompletion = employerCompletionItems.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);

  // Filtered / paginated housegirls
  const filteredHousegirls = filterHousegirls(housegirls, searchTerm, selectedCommunity, selectedAgeRange, selectedSalaryRange, selectedEducation, selectedWorkType, selectedExperience, selectedLivingArrangement);
  const stats = { activeJobs: jobPostings.filter((j: any) => j.status === 'active').length };

  // Handlers
  const handleLogout = async () => {
    try { await signOut(); navigate('/'); }
    catch { toast({ title: 'Logout failed', description: 'Please try again.', variant: 'destructive' }); }
  };

  const handleUnlockAttempt = (housegirl: Housegirl) => {
    setHousegirlToUnlock(housegirl);
    setShowUnlockModal(true);
    setIsUnlocking(false);
  };

  const handleUnlockSuccess = async () => {
    setShowUnlockModal(false);
    await refreshData(false);
  };

  const handleJobSkillToggle = (skill: string) => {
    setJobFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill],
    }));
  };

  const handleCreateJob = async () => {
    if (!jobFormData.title || !jobFormData.location || !jobFormData.salaryMin || !jobFormData.salaryMax) {
      toast({ title: 'Missing required fields', description: 'Please fill in title, location, and salary range.', variant: 'destructive' });
      return;
    }
    setIsCreatingJob(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/jobs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          title: jobFormData.title, description: jobFormData.description,
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
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed to create job'); }
      const newJob = await res.json();
      setJobPostings(prev => [newJob, ...prev]);
      setShowJobForm(false);
      setJobFormData({ title: '', description: '', location: '', salaryMin: '', salaryMax: '', workType: '', experience: '', education: '', skills: [], deadline: '' });
      toast({ title: 'Job posted!', description: `"${newJob.title}" is now live.` });
      refreshData(false);
    } catch (err: unknown) {
      toast({ title: 'Failed to post job', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally { setIsCreatingJob(false); }
  };

  const handleViewApplicants = (jobId: string) => {
    if (expandedJobId === jobId) { setExpandedJobId(null); return; }
    setExpandedJobId(jobId);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      const token = await FirebaseAuthService.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      setJobPostings(prev => prev.filter((j: any) => j.id !== jobId));
      toast({ title: 'Job deleted.' });
    } catch (err: unknown) {
      toast({ title: 'Failed to delete job', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestFormData.category || !requestFormData.location) {
      toast({ title: 'Missing fields', description: 'Please fill in category and location.', variant: 'destructive' });
      return;
    }
    setSubmittingRequest(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/employer-requests/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(requestFormData),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      const data = await res.json();
      toast({ title: 'Request submitted!', description: data.message });
      setShowRequestForm(false);
      setRequestFormData({ category: '', location: '', live_in: 'flexible', start_date: '', salary_budget: '', duties: '', contact_phone: '' });
      // Reload requests list
      const token2 = await FirebaseAuthService.getIdToken().catch(() => null);
      const listRes = await fetch(`${API_BASE_URL}/api/employer-requests/mine`, {
        headers: { ...(token2 ? { Authorization: `Bearer ${token2}` } : {}) },
      });
      if (listRes.ok) { const d = await listRes.json(); setMyRequests(d.requests || []); }
    } catch (err: unknown) {
      toast({ title: 'Failed to submit', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally { setSubmittingRequest(false); }
  };

  const sidebarItems = [
    { id: 'housegirls', label: 'Browse Workers',  icon: Users },
    { id: 'contacts',   label: 'My Contacts',     icon: Phone },
    { id: 'requests',   label: 'My Request',      icon: ClipboardList },
    { id: 'jobs',       label: 'Post a Job',      icon: Briefcase },
    { id: 'messages',   label: 'Messages',        icon: MessageCircle },
    { id: 'agency',     label: 'Agency Services', icon: Building2 },
    { id: 'settings',   label: 'Settings',        icon: SettingsIcon },
  ] as const;

  // ─── Section renderer ────────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {

      case 'housegirls':
        return (
          <Housegirls
            housegirls={housegirls}
            filteredHousegirls={filteredHousegirls}
            searchTerm={searchTerm}
            selectedCommunity={selectedCommunity} setSelectedCommunity={setSelectedCommunity}
            selectedAgeRange={selectedAgeRange} setSelectedAgeRange={setSelectedAgeRange}
            selectedSalaryRange={selectedSalaryRange} setSelectedSalaryRange={setSelectedSalaryRange}
            selectedEducation={selectedEducation} setSelectedEducation={setSelectedEducation}
            selectedWorkType={selectedWorkType} setSelectedWorkType={setSelectedWorkType}
            selectedExperience={selectedExperience} setSelectedExperience={setSelectedExperience}
            selectedLivingArrangement={selectedLivingArrangement} setSelectedLivingArrangement={setSelectedLivingArrangement}
            currentPage={currentPage} setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onUnlock={handleUnlockAttempt}
          />
        );

      case 'contacts': {
        const unlockedContacts = housegirls.filter(h => h.contactUnlocked);
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h2 className="text-lg font-semibold text-gray-900">My Contacts</h2>
              <p className="mt-1 text-sm text-gray-600">Housegirls whose contact details you have unlocked.</p>
            </div>
            {unlockedContacts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
                No contacts unlocked yet. Browse housegirls and click Unlock Contact.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {unlockedContacts.map((c) => (
                  <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-base font-semibold text-gray-900">{c.name}</p>
                    <p className="mt-1 text-sm text-gray-600">{c.location}</p>
                    <p className="mt-2 text-sm text-gray-700 flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-green-500" />{c.phone || 'Not available'}</p>
                    <p className="text-sm text-gray-700 flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-blue-500" />{c.email || 'Not available'}</p>
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
                <p className="mt-1 text-sm text-gray-600">Create job postings and manage applications.</p>
              </div>
              <Button type="button" onClick={() => setShowJobForm(v => !v)}>
                {showJobForm ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Plus className="h-4 w-4 mr-2" />New Job</>}
              </Button>
            </div>

            {showJobForm && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Job Title *', field: 'title', type: 'text', placeholder: 'e.g. Full-time Housegirl' },
                    { label: 'Salary Min (KES) *', field: 'salaryMin', type: 'number', placeholder: '15000' },
                    { label: 'Salary Max (KES) *', field: 'salaryMax', type: 'number', placeholder: '25000' },
                  ].map(({ label, field, type, placeholder }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <input type={type} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        value={(jobFormData as any)[field]} placeholder={placeholder}
                        onChange={e => setJobFormData(p => ({ ...p, [field]: e.target.value }))} />
                    </div>
                  ))}
                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.location} onChange={e => setJobFormData(p => ({ ...p, location: e.target.value }))}>
                      <option value="">Select city</option>
                      {KENYA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Work Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.workType} onChange={e => setJobFormData(p => ({ ...p, workType: e.target.value }))}>
                      <option value="">Any</option>
                      {WORK_TYPE_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required</label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.experience} onChange={e => setJobFormData(p => ({ ...p, experience: e.target.value }))}>
                      <option value="">Any</option>
                      {EXPERIENCE_OPTIONS.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                  </div>
                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education Required</label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.education} onChange={e => setJobFormData(p => ({ ...p, education: e.target.value }))}>
                      <option value="">Any</option>
                      {EDUCATION_OPTIONS.map(ed => <option key={ed} value={ed}>{ed}</option>)}
                    </select>
                  </div>
                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                    <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                      value={jobFormData.deadline} min={new Date().toISOString().split('T')[0]}
                      onChange={e => setJobFormData(p => ({ ...p, deadline: e.target.value }))} />
                  </div>
                </div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" rows={3}
                    value={jobFormData.description} placeholder="Describe duties, requirements, and expectations…"
                    onChange={e => setJobFormData(p => ({ ...p, description: e.target.value }))} />
                </div>
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills Required</label>
                  <div className="flex flex-wrap gap-2">
                    {SKILLS_OPTIONS.map(skill => (
                      <button key={skill} type="button" onClick={() => handleJobSkillToggle(skill)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${jobFormData.skills.includes(skill) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}>
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowJobForm(false)}>Cancel</Button>
                  <Button type="button" onClick={handleCreateJob} disabled={isCreatingJob}>
                    {isCreatingJob ? 'Posting…' : 'Post Job'}
                  </Button>
                </div>
              </div>
            )}

            {/* Job postings list */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">My Job Postings</h3>
              {jobPostings.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6">No job postings yet. Click "New Job" to get started.</p>
              ) : (
                <div className="space-y-3">
                  {jobPostings.map((job: any) => (
                    <div key={job.id} className="rounded-lg border border-gray-100 bg-gray-50 overflow-hidden">
                      <div className="flex items-start justify-between p-3">
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
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <button type="button" onClick={() => handleViewApplicants(job.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {expandedJobId === job.id ? 'Hide' : 'View Applicants'}
                          </button>
                          <button type="button" onClick={() => handleDeleteJob(job.id)}
                            className="text-gray-400 hover:text-red-600 transition-colors" title="Delete job">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* AppliedHousegirlsList with unlock flow */}
                      {expandedJobId === job.id && user?.id && (
                        <div className="border-t border-gray-200 bg-white p-4">
                          <AppliedHousegirlsList jobId={job.id} employerId={user.id} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'requests': {
        const WORKER_CATEGORIES = [
          'Housegirl / House Manager', 'Gardener', 'Gateman / Security',
          'Nurse / Caregiver', 'Daily Casual',
        ];
        const STATUS_LABELS: Record<string, { label: string; className: string }> = {
          in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-800' },
          matched:     { label: 'Matched',     className: 'bg-green-100 text-green-800' },
          closed:      { label: 'Closed',      className: 'bg-gray-100 text-gray-500' },
        };
        return (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">My Staffing Request</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Tell us what kind of worker you need. We will match you within 24–48 hours.
                </p>
              </div>
              <button type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
                onClick={() => setShowRequestForm(v => !v)}>
                {showRequestForm ? <><X className="h-4 w-4" />Cancel</> : <><Plus className="h-4 w-4" />New Request</>}
              </button>
            </div>

            {showRequestForm && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Staffing Needs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Worker Category *</label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={requestFormData.category}
                      onChange={e => setRequestFormData(p => ({ ...p, category: e.target.value }))}>
                      <option value="">Select category</option>
                      {WORKER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Location *</label>
                    <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. Westlands, Nairobi"
                      value={requestFormData.location}
                      onChange={e => setRequestFormData(p => ({ ...p, location: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Live-in Preference</label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={requestFormData.live_in}
                      onChange={e => setRequestFormData(p => ({ ...p, live_in: e.target.value }))}>
                      <option value="flexible">Flexible</option>
                      <option value="live_in">Live-in</option>
                      <option value="live_out">Live-out</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Start Date</label>
                    <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={requestFormData.start_date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setRequestFormData(p => ({ ...p, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (KES)</label>
                    <input type="text" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 15,000 – 20,000"
                      value={requestFormData.salary_budget}
                      onChange={e => setRequestFormData(p => ({ ...p, salary_budget: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <input type="tel" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="+254 7XX XXX XXX"
                      value={requestFormData.contact_phone}
                      onChange={e => setRequestFormData(p => ({ ...p, contact_phone: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Duties / Requirements</label>
                  <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" rows={3}
                    placeholder="Describe duties, special needs, languages preferred, etc."
                    value={requestFormData.duties}
                    onChange={e => setRequestFormData(p => ({ ...p, duties: e.target.value }))} />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowRequestForm(false)}>Cancel</button>
                  <button type="button" disabled={submittingRequest}
                    className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                    onClick={handleSubmitRequest}>
                    {submittingRequest ? 'Submitting…' : 'Submit Request'}
                  </button>
                </div>
              </div>
            )}

            {loadingRequests ? (
              <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
            ) : myRequests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">No staffing requests yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "New Request" to tell us what kind of worker you need.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req: any) => {
                  const s = STATUS_LABELS[req.status] || { label: req.status, className: 'bg-gray-100 text-gray-500' };
                  return (
                    <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{req.category}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{req.location} · {req.live_in?.replace('_', '-')}</p>
                          {req.salary_budget && <p className="text-xs text-gray-500">Budget: KES {req.salary_budget}</p>}
                          {req.duties && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{req.duties}</p>}
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted {req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : '—'}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      case 'messages':
        return <EmployerMessages />;

      case 'settings':
        return <Settings stats={stats} profileData={employerProfileData} />;

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
                <p className="mt-1 text-sm text-gray-600">Compare agencies by services and location before you hire.</p>
                <Button type="button" className="mt-3" onClick={() => navigate('/agency-marketplace')}>
                  Browse Agencies
                </Button>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="text-base font-semibold text-gray-900">Agency Packages</p>
                <p className="mt-1 text-sm text-gray-600">View package plans with replacement and support options.</p>
                <Button type="button" variant="outline" className="mt-3" onClick={() => navigate('/agency-packages')}>
                  View Packages
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── Loading / auth states ────────────────────────────────────────────────────
  if (loading || dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border border-gray-200 bg-white flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Please wait while we load your account and data…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col overflow-hidden">
          <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {/* Welcome */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user?.first_name ? `Welcome back, ${user.first_name}` : 'Welcome, Employer'}
                  </h1>
                  <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-medium border border-gray-200">
                    Employer Account
                  </span>
                  {paymentVerified === true && (
                    <span className="flex items-center gap-1 rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-medium border border-green-200">
                      <CheckCircle className="h-3.5 w-3.5" /> Payment Verified
                    </span>
                  )}
                  {paymentVerified === false && (
                    <button type="button"
                      className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-medium border border-amber-200 hover:bg-amber-200 transition-colors"
                      onClick={() => navigate('/agency-marketplace')}>
                      Pending Payment — Register Now
                    </button>
                  )}
                </div>
                <p className="text-gray-500 text-sm">Find and manage the perfect domestic staff for your home.</p>
              </div>
            </div>

            {/* Profile completion banner */}
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Profile Live ({employerProfileCompletion}%)</h3>
                <p className="text-sm text-blue-800 mt-1">
                  You can unlock contacts and post jobs! Add more details to stand out to candidates.
                </p>
              </div>
              <Button onClick={() => setActiveSection('settings')} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0" size="sm">
                {employerProfileCompletion < 100 ? 'Add Details →' : 'Edit Profile'}
              </Button>
            </div>

            {/* Navigation bar */}
            <div className="mb-4 flex flex-wrap items-center gap-2 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
              <div className="flex overflow-x-auto gap-2 w-full md:w-auto flex-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <Button key={item.id} type="button" variant="outline"
                      onClick={() => setActiveSection(item.id)}
                      className={isActive ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900' : 'text-gray-700'}>
                      <Icon className="h-4 w-4 mr-2" />{item.label}
                    </Button>
                  );
                })}
                <Button type="button" variant="outline" className="ml-auto" onClick={() => refreshData(false)} disabled={refreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button type="button" variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />Log Out
                </Button>
              </div>
            </div>

            {lastUpdated && (
              <p className="mb-3 text-xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
            )}

            {renderSection()}
          </main>

          <Footer filteredHousegirlsCount={filteredHousegirls.length} />
        </div>

        {/* Unlock modal */}
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => { setShowUnlockModal(false); setHousegirlToUnlock(null); }}
          housegirlId={housegirlToUnlock?.id || ''}
          housegirlName={housegirlToUnlock?.name || ''}
          jobId=""
          onPaymentInitiated={() => setIsUnlocking(true)}
          onContactUnlocked={handleUnlockSuccess}
        />
      </div>
    </NotificationProvider>
  );
};

export default EmployerDashboard;
