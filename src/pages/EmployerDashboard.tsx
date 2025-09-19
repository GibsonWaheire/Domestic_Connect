import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/employer/Sidebar';
import { Header } from '@/components/employer/Header';
import { Footer } from '@/components/employer/Footer';
import { Housegirls } from '@/components/employer/Housegirls';
import { Jobs } from '@/components/employer/Jobs';
import { Messages } from '@/components/employer/Messages';
import { Settings } from '@/components/employer/Settings';
import AgencyMarketplace from '@/components/employer/AgencyMarketplace';
import { JobPostingModal } from '@/components/employer/JobPostingModal';
import { UnlockModal } from '@/components/employer/UnlockModal';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { mockJobPostings, mockMessages } from '@/data/mockData';
import { filterHousegirls } from '@/utils/filterUtils';
import { Housegirl } from '@/types/employer';
import { crossEntityApi, DashboardData } from '@/lib/api';
import { useRealTimeData } from '@/hooks/useRealTimeData';

const EmployerDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [activeSection, setActiveSection] = useState('housegirls');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedHousegirl, setSelectedHousegirl] = useState<Housegirl | null>(null);
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

  // State for real data
  const [housegirls, setHousegirls] = useState<Housegirl[]>([]);
  const [jobPostings] = useState(mockJobPostings);
  const [messages] = useState(mockMessages);

  // Use real-time data hook
  const { 
    dashboardData, 
    loading: dataLoading, 
    error: dataError, 
    lastUpdated, 
    refreshData 
  } = useRealTimeData({ 
    refreshInterval: 30000, // 30 seconds
    enabled: !!user 
  });

  // Transform dashboard data when it changes
  useEffect(() => {
    if (dashboardData?.available_data.housegirls) {
      const transformedHousegirls: Housegirl[] = dashboardData.available_data.housegirls.map(hg => ({
        id: parseInt(hg.id),
        name: `${hg.first_name || 'Unknown'} ${hg.last_name || ''}`,
        age: hg.age,
        location: hg.location,
        experience: hg.experience,
        education: hg.education,
        salary: `KSh ${hg.expected_salary?.toLocaleString() || '0'}`,
        status: hg.is_available ? 'available' : 'unavailable',
        bio: hg.bio,
        skills: ['Cooking', 'Cleaning', 'Laundry'], // Default skills
        rating: 4.5, // Default rating since it's not in API yet
        reviews: 12, // Default reviews
        contactUnlocked: false, // Default to locked
        unlockCount: 0, // Default unlock count
        phone: hg.phone_number,
        email: hg.email,
        nationality: 'Kenyan', // Default nationality
        community: hg.tribe,
        workType: hg.accommodation_type,
        livingArrangement: hg.accommodation_type,
        profileImage: hg.profile_photo_url
      }));
      setHousegirls(transformedHousegirls);
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

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);
  
  // Show loading state while auth is initializing or data is loading
  if (loading || dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

  // Stats
  const stats = {
    totalApplications: 45,
    activeJobs: jobPostings.filter(job => job.status === 'active').length,
    totalViews: 234,
    unreadMessages: messages.filter(msg => !msg.isRead).length
  };

  // Render section based on active section
  const renderSection = () => {
    switch (activeSection) {
      case 'housegirls':
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
            setSelectedHousegirl={setSelectedHousegirl}
            setShowUnlockModal={setShowUnlockModal}
            setHousegirlToUnlock={setHousegirlToUnlock}
          />
        );
      case 'agency-marketplace':
        return <AgencyMarketplace />;
      case 'jobs':
        return (
          <Jobs
            jobPostings={jobPostings}
            setShowJobModal={setShowJobModal}
          />
        );
      case 'messages':
        return (
          <Messages
            messages={messages}
          />
        );
      case 'settings':
        return (
          <Settings
            stats={stats}
          />
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
            setSelectedHousegirl={setSelectedHousegirl}
            setShowUnlockModal={setShowUnlockModal}
            setHousegirlToUnlock={setHousegirlToUnlock}
          />
        );
    }
  };

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Sidebar */}
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setSelectedWorkType={setSelectedWorkType}
          filteredHousegirlsCount={filteredHousegirls.length}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Header */}
          <Header
            activeSection={activeSection}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowJobModal={setShowJobModal}
            stats={stats}
            lastUpdated={lastUpdated}
            onRefresh={refreshData}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {renderSection()}
          </main>

          {/* Footer */}
          <Footer
            filteredHousegirlsCount={filteredHousegirls.length}
          />
        </div>

        {/* Modals */}
        <JobPostingModal
          showJobModal={showJobModal}
          setShowJobModal={setShowJobModal}
        />

        <UnlockModal
          showUnlockModal={showUnlockModal}
          setShowUnlockModal={setShowUnlockModal}
          housegirlToUnlock={housegirlToUnlock}
          isUnlocking={isUnlocking}
          setIsUnlocking={setIsUnlocking}
        />
      </div>
    </NotificationProvider>
  );
};

export default EmployerDashboard;
