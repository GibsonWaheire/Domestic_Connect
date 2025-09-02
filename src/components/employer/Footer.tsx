import { Users } from 'lucide-react';

interface FooterProps {
  filteredHousegirlsCount: number;
}

export const Footer = ({ filteredHousegirlsCount }: FooterProps) => {
  return (
    <footer className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200/50 flex-shrink-0">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">Domestic Connect</span>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>© 2024 All rights reserved</span>
              <span>•</span>
              <button className="hover:text-gray-700 transition-colors">Privacy Policy</button>
              <span>•</span>
              <button className="hover:text-gray-700 transition-colors">Terms of Service</button>
              <span>•</span>
              <button className="hover:text-gray-700 transition-colors">Support</button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500">
              <span className="font-medium text-green-600">{filteredHousegirlsCount}</span> housegirls available
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};
