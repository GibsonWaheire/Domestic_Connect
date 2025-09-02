import { Button } from '@/components/ui/button';
import { 
  Search, Plus, Users, Briefcase, Eye, MessageCircle, Home
} from 'lucide-react';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  activeSection: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setShowJobModal: (show: boolean) => void;
  stats: {
    totalApplications: number;
    activeJobs: number;
    totalViews: number;
    unreadMessages: number;
  };
}

export const Header = ({
  activeSection,
  searchTerm,
  setSearchTerm,
  setShowJobModal,
  stats
}: HeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {activeSection === 'housegirls' && 'Available Housegirls'}
              {activeSection === 'jobs' && 'Job Management'}
              {activeSection === 'messages' && 'Messages'}
              {activeSection === 'settings' && 'Settings'}
            </h1>
            <p className="text-gray-600">
              {activeSection === 'housegirls' && 'Browse and connect with qualified housegirls'}
              {activeSection === 'jobs' && 'Create and manage your job postings'}
              {activeSection === 'messages' && 'Communicate with housegirls and manage conversations'}
              {activeSection === 'settings' && 'Manage your account and preferences'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Stats Icons */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{stats.totalApplications}</span>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200 flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{stats.activeJobs}</span>
            </div>
            <div className="bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 flex items-center space-x-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">{stats.totalViews}</span>
            </div>
            <div className="bg-orange-50 px-3 py-2 rounded-lg border border-orange-200 flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">{stats.unreadMessages}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/home')}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <NotificationDropdown />
            
            {activeSection === 'jobs' && (
              <Button
                onClick={() => setShowJobModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
