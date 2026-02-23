import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNavigate } from 'react-router-dom';
import { Housegirls } from '@/components/employer/Housegirls';
import { UnlockModal } from '@/components/employer/UnlockModal';
import AuthModal from '@/components/AuthModal';
import { filterHousegirls } from '@/utils/filterUtils';
import { Housegirl } from '@/types/employer';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { toast } from '@/hooks/use-toast';
import { Footer } from '@/components/employer/Footer';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Helmet } from 'react-helmet-async';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BrowseHousegirls = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [housegirlToUnlock, setHousegirlToUnlock] = useState<Housegirl | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // Show more items on public page
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLivingArrangement, setSelectedLivingArrangement] = useState('');

  // State for real data
  const [housegirls, setHousegirls] = useState<Housegirl[]>([]);

  // Use real-time data hook, enabled for everyone
  const { 
    dashboardData, 
    loading: dataLoading, 
    error: dataError,
    lastUpdated,
    refreshData
  } = useRealTimeData({ 
    refreshInterval: 60000, // 1 minute for public page
    enabled: true 
  });

  // Transform dashboard data when it changes
  useEffect(() => {
    if (dashboardData?.available_data.housegirls) {
      const transformedHousegirls: Housegirl[] = dashboardData.available_data.housegirls.map(hg => ({
        id: parseInt(hg.id),
        name: `${hg.first_name || 'Anonymous'} ${hg.last_name ? hg.last_name[0] + '.' : ''}`, // Anonymize name
        age: hg.age,
        location: hg.location,
        experience: hg.experience,
        education: hg.education,
        salary: `KSh ${hg.expected_salary?.toLocaleString() || '0'}`,
        status: hg.is_available ? 'available' : 'unavailable',
        bio: hg.bio,
        skills: ['Cooking', 'Cleaning', 'Laundry'],
        rating: 4.5,
        reviews: 12,
        contactUnlocked: false, // Always locked for public view
        unlockCount: hg.unlock_count || 0,
        phone: '*********', // Hide phone
        email: '*********', // Hide email
        nationality: 'Kenyan',
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
        description: "Could not load the latest housegirl profiles.",
        variant: "destructive",
      });
    }
  }, [dataError]);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleShowUnlockModal = (housegirl: Housegirl | null) => {
    if (!user) {
        toast({
            title: "Authentication Required",
            description: "Please log in or create an account to unlock contacts.",
        });
        openAuthModal('login');
    } else {
        setHousegirlToUnlock(housegirl);
        setShowUnlockModal(true);
    }
  };

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

  if (dataLoading && housegirls.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Housegirl Profiles...</h2>
          <p className="text-gray-600">Please wait a moment.</p>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Helmet>
          <title>Browse Housegirls | Domestic Connect</title>
          <meta name="description" content="Browse available housegirls, nannies, and domestic workers in Kenya. View profiles and find the perfect match for your home." />
        </Helmet>
        
        {/* Simplified Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl shadow-lg">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent ml-3">
                    Domestic Connect
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                {user ? (
                  <div className="flex items-center space-x-6">
                    <Button onClick={() => {
                      if (user.user_type === 'agency') {
                        navigate('/agency-dashboard');
                      } else if (user.user_type === 'housegirl') {
                        navigate('/housegirl-dashboard');
                      } else {
                        navigate('/dashboard');
                      }
                    }} className="bg-gradient-to-r from-pink-500 to-orange-600 hover:from-pink-600 hover:to-orange-700 text-white rounded-full">
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" onClick={() => openAuthModal('login')} className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full">
                      Login
                    </Button>
                    <Button onClick={() => openAuthModal('signup')} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-full shadow-lg">
                      Join today!
                  </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 lg:p-6">
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
            onUnlock={handleShowUnlockModal}
          />
        </main>

        <Footer filteredHousegirlsCount={filteredHousegirls.length} />

        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          defaultMode={authMode}
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

export default BrowseHousegirls;
