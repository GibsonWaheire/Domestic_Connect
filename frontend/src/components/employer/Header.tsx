import { Button } from '@/components/ui/button';
import { 
  Search, Home
} from 'lucide-react';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Header = ({
  searchTerm,
  setSearchTerm
}: HeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/')}
          className="text-gray-700"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
            />
          </div>
          <NotificationDropdown />
        </div>
      </div>
    </header>
  );
};
