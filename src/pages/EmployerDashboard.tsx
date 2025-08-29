import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import ProfileModal from '@/components/ProfileModal';

import Sidebar from '@/components/employer/Sidebar';
import DashboardHeader from '@/components/employer/DashboardHeader';
import HousegirlsOverview from '@/components/employer/HousegirlsOverview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, MessageCircle, Settings } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState<'overview' | 'jobs' | 'candidates' | 'messages' | 'settings'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedHousegirl, setSelectedHousegirl] = useState<Housegirl | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);



  // Handlers
  const handleSignOut = async () => {
    await signOut();
    navigate('/housegirls');
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
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Job posting feature coming soon</h3>
                    <p className="text-gray-600 mb-4">You'll be able to post job opportunities to attract housegirls</p>
                    <Button variant="outline" className="mt-4">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Post Job (Coming Soon)
                    </Button>
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
                  <CardTitle className="text-xl">Advanced Candidate Search</CardTitle>
                  <CardDescription>Use advanced filters to find the perfect housegirl match</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced search coming soon</h3>
                    <p className="text-gray-600 mb-4">Advanced filtering, saved searches, and candidate comparison tools</p>
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
