import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface DashboardHeaderProps {
  activeSection: string;
  onNavigateHome: () => void;
}

const DashboardHeader = ({ activeSection, onNavigateHome }: DashboardHeaderProps) => {
  const getSectionDescription = (section: string) => {
    switch (section) {
      case 'overview':
        return 'Welcome back! Here\'s your dashboard overview';
      case 'jobs':
        return 'Manage your job postings and applications';
      case 'candidates':
        return 'Browse and connect with qualified housegirls';
      case 'messages':
        return 'Communicate with candidates and applicants';
      case 'settings':
        return 'Manage your account and preferences';
      default:
        return 'Welcome to your dashboard';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeSection}</h2>
            <p className="text-gray-600">{getSectionDescription(activeSection)}</p>
          </div>
          <Button
            variant="ghost"
            onClick={onNavigateHome}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg"
            title="Go to Home Page"
          >
            <Home className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
