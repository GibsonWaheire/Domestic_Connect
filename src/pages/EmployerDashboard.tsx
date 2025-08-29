import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import ProfileModal from '@/components/ProfileModal';

import Sidebar from '@/components/employer/Sidebar';
import DashboardHeader from '@/components/employer/DashboardHeader';
import HousegirlsOverview from '@/components/employer/HousegirlsOverview';
import CandidatesSection from '@/components/employer/CandidatesSection';
import JobPostingModal from '@/components/JobPostingModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, BarChart3, TrendingUp, Users } from 'lucide-react';

interface Housegirl {
  id: number;
  name: string;
  age: number;
  nationality: string;
  location: string;
  community: string;
  experience: string;
  education: string;
  salary: string;
  accommodation: string;
  status: string;
  image?: string;
  bio?: string;
  skills?: string[];
  languages?: string[];
  rating?: number;
  reviews?: number;
}

const EmployerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeSection, setActiveSection] = useState<'overview' | 'jobs' | 'candidates' | 'analytics'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [selectedHousegirl, setSelectedHousegirl] = useState<Housegirl | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);



  // Handlers
  const handleSignOut = async () => {
    await signOut();
    navigate('/housegirls');
  };



  const handlePostJob = () => {
    setShowJobPostingModal(true);
  };

  const handleViewProfile = (housegirl: Housegirl) => {
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
        onSectionChange={(section: string) => setActiveSection(section as 'overview' | 'jobs' | 'candidates' | 'messages' | 'settings')}
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
            <HousegirlsOverview
              onViewProfile={handleViewProfile}
            />
          )}

          {/* Jobs Section */}
          {activeSection === 'jobs' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Post Job Opportunity</CardTitle>
                  <CardDescription>Create a job posting to attract qualified housegirls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to hire?</h3>
                    <p className="text-gray-600 mb-4">Post a job opportunity and connect with qualified housegirls in your area</p>
                    <Button onClick={handlePostJob} className="mt-4 bg-blue-600 hover:bg-blue-700">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Post Job Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Candidates Section */}
          {activeSection === 'candidates' && (
            <CandidatesSection
              onViewProfile={handleViewProfile}
              onContact={(application) => {
                // Handle contact action - could open a modal or redirect
                console.log('Contact application:', application);
              }}
            />
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Dashboard Analytics</CardTitle>
                  <CardDescription>Track your hiring performance and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-blue-900">Total Applications</h3>
                        <p className="text-2xl font-bold text-blue-700">24</p>
                        <p className="text-sm text-blue-600">+12% from last month</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-green-900">Hiring Rate</h3>
                        <p className="text-2xl font-bold text-green-700">85%</p>
                        <p className="text-sm text-green-600">+5% from last month</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-purple-50 border-purple-200">
                      <CardContent className="p-4 text-center">
                        <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-purple-900">Active Housegirls</h3>
                        <p className="text-2xl font-bold text-purple-700">8</p>
                        <p className="text-sm text-purple-600">Currently employed</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics dashboard coming soon</h3>
                    <p className="text-gray-600 mb-4">Detailed insights, charts, and performance metrics</p>
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Detailed Reports
                    </Button>
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
