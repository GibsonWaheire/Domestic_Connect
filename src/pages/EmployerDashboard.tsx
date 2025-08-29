import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import ProfileModal from '@/components/ProfileModal';
import JobPostingModal from '@/components/JobPostingModal';
import Sidebar from '@/components/employer/Sidebar';
import DashboardHeader from '@/components/employer/DashboardHeader';
import JobPostingSection from '@/components/employer/JobPostingSection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, MessageCircle, Settings } from 'lucide-react';

const EmployerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeSection, setActiveSection] = useState<'overview' | 'jobs' | 'candidates' | 'messages' | 'settings'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [selectedHousegirl, setSelectedHousegirl] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Mock data
  const [postedJobs] = useState([
    {
      id: 1,
      title: "Live-in House Help Needed",
      location: "Westlands, Nairobi",
      salary: "KES 15,000 - 20,000",
      postedDate: "2 days ago",
      applications: 3
    }
  ]);

  // Handlers
  const handleSignOut = async () => {
    await signOut();
    navigate('/housegirls');
  };

  const handlePostJob = () => {
    setShowJobPostingModal(true);
  };

  const handleViewProfile = (housegirl: any) => {
    setSelectedHousegirl(housegirl);
    setIsProfileModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access the dashboard</h2>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSignOut={handleSignOut}
        userFirstName={user.first_name}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <DashboardHeader
          activeSection={activeSection}
          onNavigateHome={() => navigate('/home')}
        />

        {/* Content */}
        <div className="px-6 py-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <JobPostingSection
              onPostJob={handlePostJob}
              postedJobs={postedJobs}
            />
          )}

          {/* Jobs Section */}
          {activeSection === 'jobs' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Job Postings</CardTitle>
                  <CardDescription>Manage your posted jobs and applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Job management coming soon</h3>
                    <p className="text-gray-600 mb-4">You'll be able to manage your job postings here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Candidates Section */}
          {activeSection === 'candidates' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Browse Candidates</CardTitle>
                  <CardDescription>Find qualified housegirls for your needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">👥</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Candidate browsing coming soon</h3>
                    <p className="text-gray-600 mb-4">You'll be able to browse and filter candidates here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Section */}
          {activeSection === 'messages' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Messages</CardTitle>
                  <CardDescription>Communicate with candidates and applicants</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Messaging coming soon</h3>
                    <p className="text-gray-600 mb-4">You'll be able to message candidates here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Settings</CardTitle>
                  <CardDescription>Manage your account and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Settings coming soon</h3>
                    <p className="text-gray-600 mb-4">You'll be able to manage your settings here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <JobPostingModal
        isOpen={showJobPostingModal}
        onClose={() => setShowJobPostingModal(false)}
        user={user}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedHousegirl(null);
        }}
        housegirl={selectedHousegirl}
      />
    </div>
  );
};

export default EmployerDashboard;
