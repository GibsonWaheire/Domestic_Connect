import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ProfileModal from '@/components/ProfileModal';
import { toast } from '@/hooks/use-toast';
import { 
  Heart, 
  User, 
  Search, 
  MapPin, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Briefcase,
  Clock,
  TrendingUp,
  Shield,
  Zap,
  Award,
  Users,
  Phone,
  Mail,
  MessageCircle,
  Building2,
  Filter,
  Bookmark,
  Eye,
  Lock,
  Calendar,
  GraduationCap,
  Home,
  FilterX,
  Save,
  Heart as HeartIcon,
  ArrowLeft
} from 'lucide-react';

// Mock data for housegirls with photos
const mockHousegirls = [
  {
    id: 1,
    name: "Mary W.",
    age: 23,
    nationality: "Kenya",
    location: "Bungoma",
    community: "Taita",
    experience: "3 Years",
    education: "Form 4 and Above",
    salary: "KES 8,000",
    accommodation: "Live-in",
    status: "Available",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Professional house help with excellent experience in cooking, cleaning, and childcare. Very reliable and trustworthy.",
    phoneNumber: "+254 700 123 456",
    email: "mary.w@example.com",
    skills: ["Cooking", "Cleaning", "Laundry", "Childcare", "Elderly Care"],
    languages: ["English", "Swahili", "Taita"]
  },
  {
    id: 2,
    name: "Caroline M.",
    age: 30,
    nationality: "Kenya",
    location: "Other",
    community: "Meru",
    experience: "2 Years",
    education: "Class 8 and Above",
    salary: "KES 10,000",
    accommodation: "Live-in",
    status: "Available",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "Experienced domestic worker specializing in housekeeping and meal preparation. Very organized and efficient.",
    phoneNumber: "+254 700 234 567",
    email: "caroline.m@example.com",
    skills: ["Housekeeping", "Cooking", "Laundry", "Organization"],
    languages: ["English", "Swahili", "Meru"]
  },
  {
    id: 3,
    name: "Teresa O.",
    age: 28,
    nationality: "Kenya",
    location: "Nairobi",
    community: "Luo",
    experience: "5 Years",
    education: "University",
    salary: "KES 12,000",
    accommodation: "Live-out",
    status: "Available",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    bio: "University-educated house help with extensive experience in modern household management and childcare.",
    phoneNumber: "+254 700 345 678",
    email: "teresa.o@example.com",
    skills: ["Childcare", "Education Support", "Cooking", "Cleaning", "Pet Care"],
    languages: ["English", "Swahili", "Luo", "French"]
  },
  {
    id: 4,
    name: "Grace K.",
    age: 25,
    nationality: "Kenya",
    location: "Mombasa",
    community: "Kamba",
    experience: "4 Years",
    education: "Form 4 and Above",
    salary: "KES 9,000",
    accommodation: "Live-in",
    status: "Available",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Skilled domestic worker with expertise in traditional and modern cooking methods. Very patient with children.",
    phoneNumber: "+254 700 456 789",
    email: "grace.k@example.com",
    skills: ["Traditional Cooking", "Modern Cooking", "Childcare", "Cleaning"],
    languages: ["English", "Swahili", "Kamba"]
  },
  {
    id: 5,
    name: "Faith N.",
    age: 27,
    nationality: "Kenya",
    location: "Kisumu",
    community: "Luhya",
    experience: "6 Years",
    education: "Diploma",
    salary: "KES 15,000",
    accommodation: "Live-in",
    status: "Available",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: "Diploma holder in hospitality with extensive experience in luxury household management and guest services.",
    phoneNumber: "+254 700 567 890",
    email: "faith.n@example.com",
    skills: ["Luxury Housekeeping", "Guest Services", "Event Planning", "Cooking", "Childcare"],
    languages: ["English", "Swahili", "Luhya", "German"]
  },
  {
    id: 6,
    name: "Hope A.",
    age: 24,
    nationality: "Kenya",
    location: "Nakuru",
    community: "Kikuyu",
    experience: "2 Years",
    education: "Form 4 and Above",
    salary: "KES 7,500",
    accommodation: "Live-out",
    status: "Available",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    bio: "Young and energetic house help with fresh ideas and modern approaches to domestic work. Very reliable.",
    phoneNumber: "+254 700 678 901",
    email: "hope.a@example.com",
    skills: ["Modern Cleaning", "Cooking", "Laundry", "Organization", "Technology"],
    languages: ["English", "Swahili", "Kikuyu"]
  }
];

const EmployerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [housegirls, setHousegirls] = useState(mockHousegirls);
  const [filters, setFilters] = useState({
    location: 'All Locations',
    nationality: 'All Nationalities',
    community: 'All Communities',
    experience: 'All Experience Levels',
    education: 'All Levels',
    accommodation: 'All Types',
    salaryRange: 'All Salaries'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHousegirl, setSelectedHousegirl] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      location: 'All Locations',
      nationality: 'All Nationalities',
      community: 'All Communities',
      experience: 'All Experience Levels',
      education: 'All Levels',
      accommodation: 'All Types',
      salaryRange: 'All Salaries'
    });
    setSearchTerm('');
  };

  const filteredHousegirls = housegirls.filter(housegirl => {
    const matchesSearch = housegirl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         housegirl.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         housegirl.community.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = filters.location === 'All Locations' || housegirl.location === filters.location;
    const matchesNationality = filters.nationality === 'All Nationalities' || housegirl.nationality === filters.nationality;
    const matchesCommunity = filters.community === 'All Communities' || housegirl.community === filters.community;
    const matchesExperience = filters.experience === 'All Experience Levels' || housegirl.experience === filters.experience;
    const matchesEducation = filters.education === 'All Levels' || housegirl.education === filters.education;
    const matchesAccommodation = filters.accommodation === 'All Types' || housegirl.accommodation === filters.accommodation;

    return matchesSearch && matchesLocation && matchesNationality && matchesCommunity && 
           matchesExperience && matchesEducation && matchesAccommodation;
  });

  const handleViewProfile = (housegirl: any) => {
    setSelectedHousegirl(housegirl);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (housegirlId: number) => {
    // This would save the profile to favorites
    toast({
      title: "Profile Saved",
      description: "Profile added to your favorites!",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access the dashboard</h2>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Employer Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Welcome, {user.first_name}
              </span>
              <Button variant="outline" onClick={signOut} size="sm" className="border-gray-300 hover:bg-gray-50">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Compact Filters Section */}
        <Card className="mb-6 border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Search & Filters</h2>
              <Button 
                variant="ghost" 
                onClick={resetFilters}
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                <FilterX className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            
            {/* Compact Filter Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div>
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9 text-sm border-gray-300 focus:border-blue-500"
                />
              </div>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Locations">All Locations</SelectItem>
                  <SelectItem value="Nairobi">Nairobi</SelectItem>
                  <SelectItem value="Mombasa">Mombasa</SelectItem>
                  <SelectItem value="Kisumu">Kisumu</SelectItem>
                  <SelectItem value="Nakuru">Nakuru</SelectItem>
                  <SelectItem value="Bungoma">Bungoma</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Experience Levels">All Experience</SelectItem>
                  <SelectItem value="1 Year">1 Year</SelectItem>
                  <SelectItem value="2 Years">2 Years</SelectItem>
                  <SelectItem value="3 Years">3 Years</SelectItem>
                  <SelectItem value="4 Years">4 Years</SelectItem>
                  <SelectItem value="5+ Years">5+ Years</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.accommodation} onValueChange={(value) => handleFilterChange('accommodation', value)}>
                <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Accommodation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Types">All Types</SelectItem>
                  <SelectItem value="Live-in">Live-in</SelectItem>
                  <SelectItem value="Live-out">Live-out</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.community} onValueChange={(value) => handleFilterChange('community', value)}>
                <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Community" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Communities">All Communities</SelectItem>
                  <SelectItem value="Kikuyu">Kikuyu</SelectItem>
                  <SelectItem value="Luo">Luo</SelectItem>
                  <SelectItem value="Luhya">Luhya</SelectItem>
                  <SelectItem value="Kamba">Kamba</SelectItem>
                  <SelectItem value="Taita">Taita</SelectItem>
                  <SelectItem value="Meru">Meru</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.education} onValueChange={(value) => handleFilterChange('education', value)}>
                <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Levels">All Levels</SelectItem>
                  <SelectItem value="Class 8 and Above">Class 8+</SelectItem>
                  <SelectItem value="Form 4 and Above">Form 4+</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="University">University</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.salaryRange} onValueChange={(value) => handleFilterChange('salaryRange', value)}>
                <SelectTrigger className="h-9 text-sm border-gray-300 focus:border-blue-500">
                  <SelectValue placeholder="Salary" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Salaries">All Salaries</SelectItem>
                  <SelectItem value="KES 5,000 - 8,000">KES 5K-8K</SelectItem>
                  <SelectItem value="KES 8,000 - 12,000">KES 8K-12K</SelectItem>
                  <SelectItem value="KES 12,000 - 15,000">KES 12K-15K</SelectItem>
                  <SelectItem value="KES 15,000+">KES 15K+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-blue-600">{filteredHousegirls.length}</span> of {housegirls.length} available housegirls
          </p>
        </div>

        {/* Housegirls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHousegirls.map((housegirl) => (
            <Card key={housegirl.id} className="hover:shadow-md transition-shadow duration-200 border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{housegirl.name}</h3>
                      <Badge className="bg-green-100 text-green-800 text-xs border-green-200">
                        {housegirl.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveProfile(housegirl.id)}
                      className="p-1 h-8 w-8 hover:bg-blue-50 text-blue-600"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <div className="p-1 bg-gray-100 rounded h-8 w-8 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="space-y-1.5">
                    <div className="text-sm">
                      <span className="font-semibold text-blue-600">{housegirl.salary}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                      {housegirl.nationality}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Home className="h-3 w-3 mr-1 text-gray-400" />
                      {housegirl.community}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                      {housegirl.age} years
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-gray-600">
                      <Home className="h-3 w-3 mr-1 text-gray-400" />
                      {housegirl.accommodation}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                      {housegirl.location}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1 text-gray-400" />
                      {housegirl.experience}
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <GraduationCap className="h-3 w-3 mr-1 text-gray-400" />
                      {housegirl.education}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleViewProfile(housegirl)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredHousegirls.length === 0 && (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No housegirls found</h3>
            <p className="text-sm text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={resetFilters} variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-50">
              Reset All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
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
