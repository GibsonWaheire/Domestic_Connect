import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Filter, Users, MapPin, Clock, Star, Phone, MessageCircle, Eye, Edit, Trash2
} from 'lucide-react';
import { Housegirl } from '@/types/employer';
import { 
  COMMUNITY_OPTIONS, AGE_RANGE_OPTIONS, SALARY_RANGE_OPTIONS, 
  EDUCATION_OPTIONS, WORK_TYPE_OPTIONS, EXPERIENCE_OPTIONS, 
  LIVING_ARRANGEMENT_OPTIONS 
} from '@/constants/employer';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { ProfileModal } from '@/components/employer/ProfileModal';

interface HousegirlsProps {
  housegirls: Housegirl[];
  filteredHousegirls: Housegirl[];
  searchTerm: string;
  selectedCommunity: string;
  setSelectedCommunity: (community: string) => void;
  selectedAgeRange: string;
  setSelectedAgeRange: (range: string) => void;
  selectedSalaryRange: string;
  setSelectedSalaryRange: (range: string) => void;
  selectedEducation: string;
  setSelectedEducation: (education: string) => void;
  selectedWorkType: string;
  setSelectedWorkType: (type: string) => void;
  selectedExperience: string;
  setSelectedExperience: (experience: string) => void;
  selectedLivingArrangement: string;
  setSelectedLivingArrangement: (arrangement: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setSelectedHousegirl: (housegirl: Housegirl | null) => void;
  setShowUnlockModal: (show: boolean) => void;
  setHousegirlToUnlock: (housegirl: Housegirl | null) => void;
}

export const Housegirls = ({
  housegirls,
  filteredHousegirls,
  searchTerm,
  selectedCommunity,
  setSelectedCommunity,
  selectedAgeRange,
  setSelectedAgeRange,
  selectedSalaryRange,
  setSelectedSalaryRange,
  selectedEducation,
  setSelectedEducation,
  selectedWorkType,
  setSelectedWorkType,
  selectedExperience,
  setSelectedExperience,
  selectedLivingArrangement,
  setSelectedLivingArrangement,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setSelectedHousegirl,
  setShowUnlockModal,
  setHousegirlToUnlock
}: HousegirlsProps) => {
  const [showFilters, setShowFilters] = useState(true);
  const { showSuccessNotification } = useNotificationActions();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedHousegirl, setSelectedHousegirlLocal] = useState<Housegirl | null>(null);

  const handleUnlockContact = (housegirl: Housegirl) => {
    setHousegirlToUnlock(housegirl);
    setShowUnlockModal(true);
    setShowProfileModal(false);
  };

  const resetFilters = () => {
    setSelectedCommunity('');
    setSelectedAgeRange('');
    setSelectedSalaryRange('');
    setSelectedEducation('');
    setSelectedWorkType('');
    setSelectedExperience('');
    setSelectedLivingArrangement('');
    showSuccessNotification(
      "Filters Reset", 
      "All filters have been cleared."
    );
  };

  const paginatedHousegirls = filteredHousegirls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredHousegirls.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Available Housegirls Count */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {filteredHousegirls.length}
            </h2>
            <p className="text-lg text-gray-600 mb-4">Available Housegirls</p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>• {housegirls.length} Total Profiles</span>
              <span>• {filteredHousegirls.length} Matching Your Criteria</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <span>Advanced Filters</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="hover:bg-blue-100 hover:border-blue-300 transition-colors"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                Reset All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Community</label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Communities</option>
                  {COMMUNITY_OPTIONS.map((community) => (
                    <option key={community} value={community}>{community}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Education Level</label>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Education Levels</option>
                  {EDUCATION_OPTIONS.map((education) => (
                    <option key={education} value={education}>{education}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Work Type</label>
                <select
                  value={selectedWorkType}
                  onChange={(e) => setSelectedWorkType(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Work Types</option>
                  {WORK_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Age Range</label>
                <select
                  value={selectedAgeRange}
                  onChange={(e) => setSelectedAgeRange(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Ages</option>
                  {AGE_RANGE_OPTIONS.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Salary Range</label>
                <select
                  value={selectedSalaryRange}
                  onChange={(e) => setSelectedSalaryRange(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Salary Ranges</option>
                  {SALARY_RANGE_OPTIONS.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Experience</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Experience Levels</option>
                  {EXPERIENCE_OPTIONS.map((experience) => (
                    <option key={experience} value={experience}>{experience}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Living Arrangement</label>
                <select
                  value={selectedLivingArrangement}
                  onChange={(e) => setSelectedLivingArrangement(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                >
                  <option value="">All Arrangements</option>
                  {LIVING_ARRANGEMENT_OPTIONS.map((arrangement) => (
                    <option key={arrangement} value={arrangement}>{arrangement}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Housegirls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedHousegirls.map((housegirl) => (
          <Card 
            key={housegirl.id} 
            className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group ${
              housegirl.unlockCount > 5 ? 'ring-2 ring-orange-200' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={housegirl.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'}
                    alt={housegirl.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                  />
                  {housegirl.rating && (
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-xs rounded-full px-1.5 py-0.5 flex items-center">
                      <Star className="h-3 w-3 mr-0.5" />
                      {housegirl.rating}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{housegirl.name}</h3>
                      <p className="text-sm text-gray-500">{housegirl.age} years old</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        AVAILABLE
                      </Badge>
                      {housegirl.unlockCount > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-orange-600">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                          <span>{housegirl.unlockCount} unlocks</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="truncate">{housegirl.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                      <span>{housegirl.experience} experience</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {housegirl.salary}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedHousegirlLocal(housegirl);
                        setShowProfileModal(true);
                        
                        // Show unlock statistics if contact is unlocked
                        if (housegirl.contactUnlocked && housegirl.unlockCount > 0) {
                          setTimeout(() => {
                            showInfoNotification(
                              "Unlock Statistics", 
                              `This contact has been unlocked ${housegirl.unlockCount} times. You've unlocked it 1 time.`
                            );
                          }, 500);
                        }
                      }}
                      className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                    
                    {housegirl.contactUnlocked ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-green-50 hover:border-green-300 transition-colors"
                        onClick={() => {
                          showSuccessNotification(
                            "Contact Available", 
                            "Contact information is already unlocked!"
                          );
                        }}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setHousegirlToUnlock(housegirl);
                          setShowUnlockModal(true);
                        }}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Phone className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="hover:bg-gray-50 transition-colors"
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="hover:bg-gray-50 transition-colors"
          >
            Next
          </Button>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        housegirl={selectedHousegirl}
        onUnlockContact={handleUnlockContact}
      />
    </div>
  );
};
