import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Header } from '@/components/employer/Header';
import { Footer } from '@/components/employer/Footer';
import { Housegirls } from '@/components/employer/Housegirls';
import { Settings } from '@/components/employer/Settings';
import { UnlockModal } from '@/components/employer/UnlockModal';
import { JobPostingModal } from '@/components/employer/JobPostingModal';
import AppliedHousegirlsList from '@/components/employer/AppliedHousegirlsList';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { filterHousegirls } from '@/utils/filterUtils';
import { Housegirl } from '@/types/employer';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, Briefcase, LogOut, MapPin, MessageCircle, Phone, Plus, RefreshCw, Settings as SettingsIcon, Trash2, Users, X } from 'lucide-react';
import { KENYA_CITIES, SKILLS_OPTIONS, EXPERIENCE_OPTIONS, WORK_TYPE_OPTIONS, EDUCATION_OPTIONS } from '@/constants/employer';
import { API_BASE_URL } from '@/lib/apiConfig';

const appStatusStyles: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const EmployerMessages = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const authHeaders = async () => {
    const token = await FirebaseAuthService.getIdToken().catch(() => null);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/jobs/employer-applications`, { headers });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      } else {
        const errorData = await res.json();
        toast({
          title: 'Error loading applications',
          description: errorData.error || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      toast({
        title: 'Error loading applications',
        description: e.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appId: string, status: string) => {
    setUpdatingId(appId);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/jobs/applications/${appId}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Application status updated', description: `Status set to ${status}.` });
        loadApplications(); // Refresh list
      } else {
        toast({ title: 'Error updating status', description: data.error || 'Please try again.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error updating status', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Job Applications</h2>
        <Button onClick={loadApplications} variant="outline" size="sm" disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Refresh Applications'}
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <MessageCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No applications received yet.</p>
            <p className="text-xs text-gray-400 mt-1">Housegirls will appear here when they apply to your jobs.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base leading-tight">{app.job_title}</CardTitle>
                  <Badge className={`shrink-0 border text-xs ${appStatusStyles[app.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {app.status}
                  </Badge>
                </div>
                <CardDescription className="flex flex-wrap gap-2 mt-1 text-xs">
                  <span className="flex items-center gap-1"><Users size={11} /> {app.housegirl_name}</span>
                  {app.job_location && <span className="flex items-center gap-1"><MapPin size={11} />{app.job_location}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {app.cover_letter && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 italic">"{app.cover_letter}"</p>
                )}
                <p className="text-xs text-gray-400">
                  Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                </p>
                {app.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs px-4"
                      disabled={updatingId === app.id}
                      onClick={() => updateStatus(app.id, 'reviewed')}
                    >
                      Mark Reviewed
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


const EmployerDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Added states
  const [activeTab, setActiveTab] = useState('housegirls');
  const [showJobModal, setShowJobModal] = useState(false);
  const [selectedJobIdForApplicants, setSelectedJobIdForApplicants] = useState<string | null>(null);

  const handleViewApplicants = (jobId: string) => {
    setSelectedJobIdForApplicants(jobId);
  };

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
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [jobApplicants, setJobApplicants] = useState<Record<string, any[]>>({});
  const [fetchingApplicants, setFetchingApplicants] = useState<string | null>(null);
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
    refreshData,
  } = useRealTimeData();

  const refreshAllData = () => refreshData(true);
  const fetchJobPostings = () => refreshData(true);
  const fetchEmployerProfile = () => refreshData(true);

  // Update states when real-time data changes
  useEffect(() => {
    if (dashboardData) {
      setHousegirls(dashboardData.housegirls || []);
      setJobPostings(dashboardData.jobPostings || []);
      setEmployerProfileData(dashboardData.employerProfile || null);
    }
  }, [dashboardData]);

  // Derived filtered housegirls for current page
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
  const totalPages = Math.ceil(filteredHousegirls.length / itemsPerPage);
  const paginatedHousegirls = filteredHousegirls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCommunity('');
    setSelectedAgeRange('');
    setSelectedSalaryRange('');
    setSelectedEducation('');
    setSelectedWorkType('');
    setSelectedExperience('');
    setSelectedLivingArrangement('');
    setCurrentPage(1);
  };


  const openUnlockModal = (housegirl: Housegirl) => {
    setHousegirlToUnlock(housegirl);
    setShowUnlockModal(true);
    setIsUnlocking(false); // Reset unlocking state
  };

  const handleUnlockSuccess = () => {
    // This will trigger a re-fetch in AppliedHousegirlsList if that's open
    // For general housegirl list, we simply close the modal
    setShowUnlockModal(false);
    // Optionally refresh specific housegirl data here if needed for general list
  };

  const handleCreateOrUpdateJob = async () => {
    if (!user) {
      toast({ title: 'Error', description: 'User not authenticated.', variant: 'destructive' });
      return;
    }

    setIsCreatingJob(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const payload = {
        title: jobFormData.title,
        description: jobFormData.description,
        location: jobFormData.location,
        salary_min: parseInt(jobFormData.salaryMin),
        salary_max: parseInt(jobFormData.salaryMax),
        accommodation_type: jobFormData.workType,
        required_experience: jobFormData.experience,
        required_education: jobFormData.education,
        skills_required: jobFormData.skills,
        application_deadline: jobFormData.deadline,
        // status: 'active' (default in backend)
      };

      let res;
      if (expandedJobId) { // Update existing job
        res = await fetch(`${API_BASE_URL}/api/jobs/${expandedJobId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });
      } else { // Create new job
        res = await fetch(`${API_BASE_URL}/api/jobs/`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error || 'Failed to save job.', variant: 'destructive' });
        return;
      }

      toast({ title: 'Success', description: expandedJobId ? 'Job updated successfully!' : 'Job posted successfully!', });
      setShowJobModal(false);
      setExpandedJobId(null);
      setJobFormData({
        title: '', description: '', location: '',
        salaryMin: '', salaryMax: '', workType: '',
        experience: '', education: '', skills: [] as string[], deadline: '',
      });
      fetchJobPostings(); // Refresh job list

    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setIsCreatingJob(false);
    }
  };

  const handleEditJob = (job: any) => {
    setExpandedJobId(job.id);
    setJobFormData({
      title: job.title,
      description: job.description,
      location: job.location,
      salaryMin: job.salary_min.toString(),
      salaryMax: job.salary_max.toString(),
      workType: job.accommodation_type,
      experience: job.required_experience,
      education: job.required_education,
      skills: job.skills_required,
      deadline: job.application_deadline,
    });
    setShowJobModal(true);
  };


  const handleDeleteJob = async (jobId: string) => {
    if (!user || !window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await FirebaseAuthService.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast({ title: 'Error', description: errorData.error || 'Failed to delete job.', variant: 'destructive' });
        return;
      }

      toast({ title: 'Success', description: 'Job posting deleted successfully.' });
      fetchJobPostings(); // Refresh job list
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'An unexpected error occurred.', variant: 'destructive' });
    }
  };


  if (loading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading dashboard...</div>;
  }

  if (!user || dataError) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600">Error loading user data or dashboard. Please try again.</div>;
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header user={user} signOut={signOut} />

        <main className="flex-1 container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Employer Dashboard</h1>
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <Button
              variant="ghost"
              className={activeTab === 'housegirls' ? 'border-b-2 border-[#111] text-[#111] rounded-none' : 'text-gray-500'}
              onClick={() => { setActiveTab('housegirls'); setSelectedJobIdForApplicants(null); }}
            >
              <Users className="h-4 w-4 mr-2" /> Housegirls
            </Button>
            <Button
              variant="ghost"
              className={activeTab === 'jobs' ? 'border-b-2 border-[#111] text-[#111] rounded-none' : 'text-gray-500'}
              onClick={() => { setActiveTab('jobs'); setSelectedJobIdForApplicants(null); }}
            >
              <Briefcase className="h-4 w-4 mr-2" /> My Jobs
            </Button>
            <Button
              variant="ghost"
              className={activeTab === 'messages' ? 'border-b-2 border-[#111] text-[#111] rounded-none' : 'text-gray-500'}
              onClick={() => { setActiveTab('messages'); setSelectedJobIdForApplicants(null); }}
            >
              <MessageCircle className="h-4 w-4 mr-2" /> Messages
            </Button>
            <Button
              variant="ghost"
              className={activeTab === 'settings' ? 'border-b-2 border-[#111] text-[#111] rounded-none' : 'text-gray-500'}
              onClick={() => { setActiveTab('settings'); setSelectedJobIdForApplicants(null); }}
            >
              <SettingsIcon className="h-4 w-4 mr-2" /> Settings
            </Button>
          </div>

          {/* Main content area based on activeTab */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* Conditional rendering for tabs */}
            {activeTab === 'housegirls' && <Housegirls user={user} />}
            {activeTab === 'jobs' && (
              <div className="space-y-6">
                {selectedJobIdForApplicants && user?.id ? (
                  <>
                    <Button variant="outline" onClick={() => setSelectedJobIdForApplicants(null)} className="mb-4">
                      Back to All Jobs
                    </Button>
                    <AppliedHousegirlsList jobId={selectedJobIdForApplicants} employerId={user.id} />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Your Job Postings</h2>
                      <Button onClick={() => setShowJobModal(true)} className="bg-[#111] hover:bg-[#333] text-white">
                        <Plus className="h-4 w-4 mr-2" /> Post a New Job
                      </Button>
                    </div>
                    {dataLoading ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {[1, 2].map(i => (
                          <Card key={i} className="animate-pulse">
                            <CardHeader>
                              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                              <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </CardHeader>
                            <CardContent>
                              <div className="h-4 bg-gray-200 rounded mb-2" />
                              <div className="h-4 bg-gray-200 rounded w-5/6" />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : jobPostings.length === 0 ? (
                      <Card>
                        <CardContent className="text-center py-10">
                          <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">You haven't posted any jobs yet.</p>
                          <p className="text-xs text-gray-400 mt-1">Click "Post a New Job" to get started.</p>
                          <Button onClick={() => setShowJobModal(true)} className="mt-6 bg-[#111] hover:bg-[#333] text-white">
                            <Plus className="h-4 w-4 mr-2" /> Post a New Job
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {jobPostings.map((job) => (
                          <Card key={job.id} className="border-gray-200 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
                                <Badge className="shrink-0 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
                                  {job.status}
                                </Badge>
                              </div>
                              <CardDescription className="flex flex-wrap gap-2 mt-1 text-xs">
                                {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                                {(job.salary_min || job.salary_max) && (
                                  <span>💰 KSh {(job.salary_min || 0).toLocaleString()}{job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}/mo</span>
                                )}
                                {job.accommodation_type && <span>🏠 {job.accommodation_type}</span>}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {job.description && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {job.skills_required?.slice(0, 4).map((s: string) => (
                                  <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                                ))}
                              </div>
                              <div className="flex items-center justify-between mt-4">
                                <span className="text-xs text-gray-400">{(job.applications_count || 0)} applicant{(job.applications_count || 0) !== 1 ? 's' : ''}</span>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEditJob(job)} className="rounded-full text-xs px-4">
                                    Edit
                                  </Button>
                                  <Button size="sm" onClick={() => handleViewApplicants(job.id)} className="rounded-full text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white">
                                    View Applicants
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id)} className="rounded-full text-xs px-4">
                                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {activeTab === 'messages' && <EmployerMessages />}
            {activeTab === 'settings' && <Settings user={user} employerProfile={employerProfileData} refreshEmployerProfile={fetchEmployerProfile} />}
          </div>
        </main>
        <Footer />

        <JobPostingModal
          isOpen={showJobModal}
          onClose={() => { setShowJobModal(false); setExpandedJobId(null); setJobFormData({ title: '', description: '', location: '', salaryMin: '', salaryMax: '', workType: '', experience: '', education: '', skills: [] as string[], deadline: '', }); }}
          onSubmit={handleCreateOrUpdateJob}
          isSubmitting={isCreatingJob}
          formData={jobFormData}
          setFormData={setJobFormData}
          isEditing={!!expandedJobId}
        />

        {/* This modal is for general housegirl profile unlocks, not job-specific */}
        <UnlockModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          housegirlId={housegirlToUnlock?.id || ''}
          housegirlName={housegirlToUnlock?.name || ''}
          jobId={''} // Pass empty string as it's not job-specific
          onPaymentInitiated={() => setIsUnlocking(true)}
          onContactUnlocked={handleUnlockSuccess}
        />
      </div>
    </NotificationProvider>
  );
};

export default EmployerDashboard;
