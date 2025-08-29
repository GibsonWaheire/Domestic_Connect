import { Button } from '@/components/ui/button';
import { Heart, Home, Briefcase, Users, BarChart3, ArrowLeft, ArrowRight, LogOut } from 'lucide-react';

interface SidebarProps {
  activeSection: 'overview' | 'jobs' | 'candidates' | 'analytics';
  onSectionChange: (section: 'overview' | 'jobs' | 'candidates' | 'analytics') => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onSignOut: () => void;
  userFirstName: string;
}

const Sidebar = ({ 
  activeSection, 
  onSectionChange, 
  sidebarCollapsed, 
  onToggleSidebar, 
  onSignOut, 
  userFirstName 
}: SidebarProps) => {
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'blue' },
    { id: 'jobs', label: 'Job Postings', icon: Briefcase, color: 'green' },
    { id: 'candidates', label: 'Candidates', icon: Users, color: 'purple' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'indigo' }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Domestic Connect</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="p-1 h-8 w-8"
          >
            {sidebarCollapsed ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
              activeSection === item.id
                ? `bg-${item.color}-50 border border-${item.color}-200 text-${item.color}-700`
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
            {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{userFirstName.charAt(0)}</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{userFirstName}</p>
              <p className="text-xs text-gray-500">Employer</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className={`p-1 h-8 w-8 ${sidebarCollapsed ? 'mx-auto' : ''}`}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
