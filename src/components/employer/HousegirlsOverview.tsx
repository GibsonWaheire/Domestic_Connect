import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Heart, 
  Eye, 
  Phone, 
  Mail,
  Star,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

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
  contactUnlocked: boolean;
  unlockCount: number;
  unlockedBy: string[];
  lastUnlocked?: string;
}

interface HousegirlsOverviewProps {
  onViewProfile: (housegirl: Housegirl) => void;
  onUnlockContact: (housegirl: Housegirl) => void;
  selectedHousegirl?: Housegirl | null;
}

const HousegirlsOverview = ({ onViewProfile, onUnlockContact, selectedHousegirl }: HousegirlsOverviewProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Mock data - in real app this would come from API
  const [housegirls, setHousegirls] = useState<Housegirl[]>([
    {
      id: 1,
      name: "Sarah Wanjiku",
      age: 28,
      nationality: "Kenyan",
      location: "Westlands, Nairobi",
      community: "Kikuyu",
      experience: "5 years",
      education: "Secondary",
      salary: "KES 18,000",
      accommodation: "Live-in",
      status: "Available",
      bio: "Experienced house help with excellent cooking skills and childcare experience. Very reliable and trustworthy.",
      skills: ["Cooking", "Cleaning", "Childcare", "Laundry", "Ironing"],
      languages: ["English", "Swahili", "Kikuyu"],
      rating: 4.8,
      reviews: 12,
      contactUnlocked: true,
      unlockCount: 3,
      unlockedBy: ["John Doe", "Jane Smith", "Mike Johnson"],
      lastUnlocked: "2024-01-15"
    },
    {
      id: 2,
      name: "Grace Akinyi",
      age: 32,
      nationality: "Kenyan",
      location: "Kilimani, Nairobi",
      community: "Luo",
      experience: "8 years",
      education: "College",
      salary: "KES 22,000",
      accommodation: "Live-out",
      status: "Available",
      bio: "Professional house manager with extensive experience in large households. Excellent organizational skills.",
      skills: ["House Management", "Cooking", "Cleaning", "Event Planning", "Budgeting"],
      languages: ["English", "Swahili", "Dholuo"],
      rating: 4.9,
      reviews: 18,
      contactUnlocked: false,
      unlockCount: 0,
      unlockedBy: [],
      lastUnlocked: undefined
    },
    {
      id: 3,
      name: "Mary Muthoni",
      age: 25,
      nationality: "Kenyan",
      location: "Lavington, Nairobi",
      community: "Kikuyu",
      experience: "3 years",
      education: "Secondary",
      salary: "KES 15,000",
      accommodation: "Live-in",
      status: "Available",
      bio: "Young and energetic house help. Great with children and pets. Learning new skills quickly.",
      skills: ["Cleaning", "Childcare", "Pet Care", "Basic Cooking"],
      languages: ["English", "Swahili", "Kikuyu"],
      rating: 4.5,
      reviews: 8,
      contactUnlocked: true,
      unlockCount: 1,
      unlockedBy: ["Alice Brown"],
      lastUnlocked: "2024-01-12"
    },
    {
      id: 4,
      name: "Jane Adhiambo",
      age: 35,
      nationality: "Kenyan",
      location: "Karen, Nairobi",
      community: "Luo",
      experience: "10 years",
      education: "Primary",
      salary: "KES 25,000",
      accommodation: "Live-in",
      status: "Available",
      bio: "Senior house help with vast experience. Excellent cook specializing in traditional Kenyan dishes.",
      skills: ["Traditional Cooking", "Cleaning", "Laundry", "Garden Maintenance"],
      languages: ["Swahili", "Dholuo", "Basic English"],
      rating: 4.7,
      reviews: 25,
      contactUnlocked: false,
      unlockCount: 0,
      unlockedBy: [],
      lastUnlocked: undefined
    }
  ]);

  const [favorites, setFavorites] = useState<number[]>([]);

  // Update housegirls when selectedHousegirl changes (for unlock updates)
  useEffect(() => {
    if (selectedHousegirl) {
      setHousegirls(prev => 
        prev.map(h => h.id === selectedHousegirl.id ? selectedHousegirl : h)
      );
    }
  }, [selectedHousegirl]);

  const toggleFavorite = (housegirlId: number) => {
    setFavorites(prev => 
      prev.includes(housegirlId) 
        ? prev.filter(id => id !== housegirlId)
        : [...prev, housegirlId]
    );
  };

  const filteredHousegirls = housegirls.filter(housegirl => {
    const matchesSearch = housegirl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         housegirl.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         housegirl.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = locationFilter === 'all' || !locationFilter || housegirl.location.includes(locationFilter);
    const matchesExperience = experienceFilter === 'all' || !experienceFilter || housegirl.experience.includes(experienceFilter);
    const matchesFavorites = !showFavorites || favorites.includes(housegirl.id);

    return matchesSearch && matchesLocation && matchesExperience && matchesFavorites;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredHousegirls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHousegirls = filteredHousegirls.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, locationFilter, experienceFilter, showFavorites]);

  const handleViewProfile = (housegirl: Housegirl) => {
    onViewProfile(housegirl);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">Find Your Perfect House Help</h2>
              <p className="text-blue-600">Browse qualified and verified housegirls in your area</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filteredHousegirls.length} Available
              </Badge>
              <Button
                variant={showFavorites ? "default" : "outline"}
                onClick={() => setShowFavorites(!showFavorites)}
                size="sm"
              >
                <Heart className={`h-4 w-4 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
                Favorites
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-blue-700">
              <Users className="h-4 w-4" />
              <span>Verified profiles</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700">
              <Star className="h-4 w-4" />
              <span>Rated & reviewed</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700">
              <Eye className="h-4 w-4" />
              <span>Contact unlock: KES 200</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-700">
              <Briefcase className="h-4 w-4" />
              <span>Background checked</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, skills, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Westlands">Westlands</SelectItem>
                <SelectItem value="Kilimani">Kilimani</SelectItem>
                <SelectItem value="Lavington">Lavington</SelectItem>
                <SelectItem value="Karen">Karen</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Experience</SelectItem>
                <SelectItem value="0-2">0-2 years</SelectItem>
                <SelectItem value="2-5">2-5 years</SelectItem>
                <SelectItem value="5+">5+ years</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Housegirls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedHousegirls.map((housegirl) => (
          <Card key={housegirl.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    {housegirl.image ? (
                      <img 
                        src={housegirl.image} 
                        alt={housegirl.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{housegirl.name}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{housegirl.age} years</span>
                      <span>•</span>
                      <span>{housegirl.community}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(housegirl.id)}
                  className={`p-2 h-8 w-8 ${
                    favorites.includes(housegirl.id) ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(housegirl.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(housegirl.rating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {housegirl.rating} ({housegirl.reviews} reviews)
                </span>
              </div>

              {/* Bio */}
              <p className="text-gray-600 text-sm line-clamp-2">{housegirl.bio}</p>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{housegirl.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{housegirl.experience}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{housegirl.education}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 font-medium">{housegirl.salary}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2">
                {housegirl.skills?.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {housegirl.skills && housegirl.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{housegirl.skills.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Contact Details (if unlocked) */}
              {housegirl.contactUnlocked && (housegirl.phone || housegirl.email) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Contact Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    {housegirl.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-3 w-3 text-green-600" />
                        <span className="text-green-800">{housegirl.phone}</span>
                      </div>
                    )}
                    {housegirl.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3 w-3 text-green-600" />
                        <span className="text-green-800">{housegirl.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status and Actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center space-x-2">
                  <Badge className={`${
                    housegirl.status === 'Available' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {housegirl.status}
                  </Badge>
                  {housegirl.contactUnlocked && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      {housegirl.unlockCount} unlock{housegirl.unlockCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewProfile(housegirl)}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View</span>
                  </Button>
                  {housegirl.contactUnlocked ? (
                    <Button
                      size="sm"
                      onClick={() => onUnlockContact(housegirl)}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Contact Unlocked</span>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => onUnlockContact(housegirl)}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1"
                    >
                      <Phone className="h-3 w-3" />
                      <span>Unlock Contact</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredHousegirls.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No housegirls found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || locationFilter || experienceFilter 
                ? "Try adjusting your search criteria or filters"
                : "Check back later for new profiles"
              }
            </p>
            {(searchTerm || (locationFilter && locationFilter !== 'all') || (experienceFilter && experienceFilter !== 'all')) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setLocationFilter('all');
                  setExperienceFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      {filteredHousegirls.length > 0 && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredHousegirls.length)} of {filteredHousegirls.length} housegirls
        </div>
      )}
    </div>
  );
};

export default HousegirlsOverview;
