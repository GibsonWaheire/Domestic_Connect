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
  onUnlock: (housegirl: Housegirl) => void;
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
  onUnlock,
}: HousegirlsProps) => {
  const [showFilters, setShowFilters] = useState(true);
  const { showSuccessNotification, showInfoNotification } = useNotificationActions();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedHousegirl, setSelectedHousegirlLocal] = useState<Housegirl | null>(null);

  const handleUnlockContact = (housegirl: Housegirl) => {
    onUnlock(housegirl);
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
    <div className="mx-auto max-w-6xl space-y-4 rounded-xl bg-slate-100 px-4 py-5">
      {/* Available Housegirls Count - Compact */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredHousegirls.length}
                </h2>
                <p className="text-sm text-gray-600">Available Housegirls</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>{housegirls.length} Total Profiles</div>
              <div>{filteredHousegirls.length} Matching Criteria</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Navbar */}
      <div className="rounded-lg bg-[#12000f] p-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-200" />
            <span className="text-sm font-medium text-gray-200">Filters</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 border-gray-600 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white text-xs"
            >
              {showFilters ? 'Hide' : 'Show'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-8 border-gray-600 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white text-xs"
            >
              Reset
            </Button>
          </div>
        </div>
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">Community</label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-600 rounded bg-[#1b0c1a] text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">All</option>
                  {COMMUNITY_OPTIONS.map((community) => (
                    <option key={community} value={community}>{community}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">Education</label>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-600 rounded bg-[#1b0c1a] text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">All</option>
                  {EDUCATION_OPTIONS.map((education) => (
                    <option key={education} value={education}>{education}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">Work Type</label>
                <select
                  value={selectedWorkType}
                  onChange={(e) => setSelectedWorkType(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-600 rounded bg-[#1b0c1a] text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">All</option>
                  {WORK_TYPE_OPTIONS.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">Age Range</label>
                <select
                  value={selectedAgeRange}
                  onChange={(e) => setSelectedAgeRange(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-600 rounded bg-[#1b0c1a] text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">All</option>
                  {AGE_RANGE_OPTIONS.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">Salary</label>
                <select
                  value={selectedSalaryRange}
                  onChange={(e) => setSelectedSalaryRange(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-600 rounded bg-[#1b0c1a] text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">All</option>
                  {SALARY_RANGE_OPTIONS.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">Experience</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-600 rounded bg-[#1b0c1a] text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">All</option>
                  {EXPERIENCE_OPTIONS.map((experience) => (
                    <option key={experience} value={experience}>{experience}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 mb-1 block">Living</label>
                <select
                  value={selectedLivingArrangement}
                  onChange={(e) => setSelectedLivingArrangement(e.target.value)}
                  className="w-full h-8 px-2 text-xs border border-gray-600 rounded bg-[#1b0c1a] text-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">All</option>
                  {LIVING_ARRANGEMENT_OPTIONS.map((arrangement) => (
                    <option key={arrangement} value={arrangement}>{arrangement}</option>
                  ))}
                </select>
              </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {paginatedHousegirls.map((housegirl) => (
          <Card 
            key={housegirl.id} 
            className={`bg-white border border-gray-200 shadow-sm transition-colors ${
              housegirl.unlockCount > 5 ? 'ring-2 ring-orange-200' : ''
            }`}
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <img
                    src={housegirl.profileImage || '/placeholder.svg'}
                    alt={housegirl.name}
                    className="h-20 w-20 rounded-full object-cover border border-gray-200"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{housegirl.name}</h3>
                      <Badge className="bg-green-100 text-green-800 border-green-200">AVAILABLE</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <span className="w-20 text-gray-500">Salary</span>
                        <span>{housegirl.salary}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-gray-500">Work Type</span>
                        <span>{housegirl.workType || '-'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-gray-500">Location</span>
                        <span>{housegirl.location}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-gray-500">Experience</span>
                        <span>{housegirl.experience}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-gray-500">Community</span>
                        <span>{housegirl.community || '-'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-gray-500">Education</span>
                        <span>{housegirl.education || '-'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="w-20 text-gray-500">Age</span>
                        <span>{housegirl.age} years</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-600"
                    onClick={() => {
                      showInfoNotification(
                        "Saved",
                        `${housegirl.name} saved to shortlist.`
                      );
                    }}
                  >
                    Save
                  </Button>

                  {housegirl.contactUnlocked && (
                    <Badge className="bg-emerald-500 text-white border-emerald-500">Unlocked</Badge>
                  )}

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
                        <Phone className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => onUnlock(housegirl)}
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Unlock
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
