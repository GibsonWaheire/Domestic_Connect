import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, Menu, X, Clock, LogOut, Users
} from 'lucide-react';
import { NAV_ITEMS } from '@/constants/employer';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSelectedWorkType: (type: string) => void;
  filteredHousegirlsCount: number;
}

export const Sidebar = ({
  activeSection,
  setActiveSection,
  sidebarCollapsed,
  setSidebarCollapsed,
  setSelectedWorkType,
  filteredHousegirlsCount
}: SidebarProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { showInfoNotification } = useNotificationActions();

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className={`bg-gradient-to-b from-white to-gray-50 border-r border-gray-200/50 transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    } flex-shrink-0`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Domestic Connect</h1>
                  <p className="text-xs text-gray-500">Employer Dashboard</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {!sidebarCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="p-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Home className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-700 border-blue-200',
              green: 'bg-green-50 text-green-700 border-green-200',
              purple: 'bg-purple-50 text-purple-700 border-purple-200',
              indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              gray: 'bg-gray-50 text-gray-700 border-gray-200'
            };

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isActive 
                    ? `${colorClasses[item.color as keyof typeof colorClasses]} shadow-md` 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? '' : 'text-gray-400'}`} />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.first_name?.[0] || 'U'}{user?.last_name?.[0] || 'S'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.first_name || 'User'} {user?.last_name || 'Name'}
                </p>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="w-full mt-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
