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
    accommodation: "Day Worker",
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
    accommodation: "Day Worker",
    status: "Available",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    bio: "Young and energetic house help with fresh ideas and modern approaches to domestic work. Very reliable.",
    phoneNumber: "+254 700 678 901",
    email: "hope.a@example.com",
    skills: ["Modern Cleaning", "Cooking", "Laundry", "Organization", "Technology"],
    languages: ["English", "Swahili", "Kikuyu"]
  },
  {
    id: 7,
    name: "Sarah M.",
    age: 29,
    nationality: "Kenya",
    location: "Eldoret",
    community: "Kalenjin",
    experience: "4 Years",
    education: "Diploma",
    salary: "KES 11,000",
    accommodation: "Live-in",
    status: "Available",
    image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
    bio: "Experienced house help with strong background in hospitality and customer service. Very professional.",
    phoneNumber: "+254 700 789 012",
    email: "sarah.m@example.com",
    skills: ["Hospitality", "Customer Service", "Cooking", "Cleaning", "Event Planning"],
    languages: ["English", "Swahili", "Kalenjin"]
  },
  {
    id: 8,
    name: "Joyce W.",
    age: 26,
    nationality: "Kenya",
    location: "Thika",
    community: "Kamba",
    experience: "3 Years",
    education: "Form 4 and Above",
    salary: "KES 8,500",
    accommodation: "Live-out",
    status: "Available",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "Reliable and hardworking house help with excellent references. Specializes in childcare and cooking.",
    phoneNumber: "+254 700 890 123",
    email: "joyce.w@example.com",
    skills: ["Childcare", "Cooking", "Cleaning", "Laundry", "First Aid"],
    languages: ["English", "Swahili", "Kamba"]
  },
  {
    id: 9,
    name: "Nancy K.",
    age: 31,
    nationality: "Kenya",
    location: "Kisii",
    community: "Kisii",
    experience: "7 Years",
    education: "University",
    salary: "KES 14,000",
    accommodation: "Live-in",
    status: "Available",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "University-educated house help with extensive experience in luxury household management and education support.",
    phoneNumber: "+254 700 901 234",
    email: "nancy.k@example.com",
    skills: ["Education Support", "Luxury Housekeeping", "Cooking", "Childcare", "Pet Care"],
    languages: ["English", "Swahili", "Kisii", "French"]
  },
  {
    id: 10,
    name: "Esther N.",
    age: 23,
    nationality: "Kenya",
    location: "Nyeri",
    community: "Kikuyu",
    experience: "1 Year",
    education: "Form 4 and Above",
    salary: "KES 6,500",
    accommodation: "Live-in",
    status: "Available",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    bio: "Young and enthusiastic house help eager to learn and grow. Very honest and trustworthy.",
    phoneNumber: "+254 700 012 345",
    email: "esther.n@example.com",
    skills: ["Basic Cleaning", "Cooking", "Laundry", "Childcare", "Learning"],
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
  const [currentPage, setCurrentPage] = useState(1);
  const [profilesPerPage] = useState(6);

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
    setCurrentPage(1);
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

  // Pagination logic
  const totalPages = Math.ceil(filteredHousegirls.length / profilesPerPage);
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = filteredHousegirls.slice(indexOfFirstProfile, indexOfLastProfile);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

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
                onClick={() => navigate('/home')}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                title="Go to Home Page"
              >
                <Home className="h-5 w-5" />
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Employer Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-blue-800">
                  Welcome back, {user.first_name}! 👋
                </span>
              </div>
              <Button variant="outline" onClick={signOut} size="sm" className="border-gray-300 hover:bg-gray-50">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Find Your Perfect Housegirl</h2>
              <p className="text-sm text-gray-600">Browse through verified profiles and find the right match for your household</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{filteredHousegirls.length}</div>
                <div className="text-sm text-gray-500">Available Profiles</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Agency Advert Section */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Need Professional Help?</h3>
                  <p className="text-sm text-gray-600">Want to contact an agency and get a verified caregiver or housegirl?</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/agencies')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium px-6"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Contact Agencies
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Filters Section */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-white to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Filter className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Advanced Search & Filters</h3>
              </div>
              <Button 
                variant="outline" 
                onClick={resetFilters}
                size="sm"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
            
            {/* Mobile-Friendly Single Row Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              {/* Search Input - Full Width on Mobile */}
              <div className="lg:col-span-2 xl:col-span-1">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <Input
                    placeholder="Name, location, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-7 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
              
              {/* Location Filter */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
                <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                  <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-xs">
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
              </div>
              
              {/* Experience Filter */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Experience</label>
                <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                  <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-xs">
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
              </div>
              
              {/* Accommodation Filter */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                <Select value={filters.accommodation} onValueChange={(value) => handleFilterChange('accommodation', value)}>
                  <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="Live-in">Live-in</SelectItem>
                    <SelectItem value="Day Worker">Day Worker</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Community Filter */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Community</label>
                <Select value={filters.community} onValueChange={(value) => handleFilterChange('community', value)}>
                  <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-xs">
                    <SelectValue placeholder="Community" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Communities">All Communities</SelectItem>
                    <SelectItem value="Kikuyu">Kikuyu</SelectItem>
                    <SelectItem value="Luo">Luo</SelectItem>
                    <SelectItem value="Luhya">Luhya</SelectItem>
                    <SelectItem value="Kamba">Kamba</SelectItem>
                    <SelectItem value="Kisii">Kisii</SelectItem>
                    <SelectItem value="Meru">Meru</SelectItem>
                    <SelectItem value="Embu">Embu</SelectItem>
                    <SelectItem value="Tharaka">Tharaka</SelectItem>
                    <SelectItem value="Mijikenda">Mijikenda</SelectItem>
                    <SelectItem value="Taita">Taita</SelectItem>
                    <SelectItem value="Pokomo">Pokomo</SelectItem>
                    <SelectItem value="Orma">Orma</SelectItem>
                    <SelectItem value="Rendile">Rendile</SelectItem>
                    <SelectItem value="Samburu">Samburu</SelectItem>
                    <SelectItem value="Maasai">Maasai</SelectItem>
                    <SelectItem value="Turkana">Turkana</SelectItem>
                    <SelectItem value="Kalenjin">Kalenjin</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Education Filter */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Education</label>
                <Select value={filters.education} onValueChange={(value) => handleFilterChange('education', value)}>
                  <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-xs">
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
              </div>
              
              {/* Salary Filter */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Salary</label>
                <Select value={filters.salaryRange} onValueChange={(value) => handleFilterChange('salaryRange', value)}>
                  <SelectTrigger className="h-9 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-xs">
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
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  Showing <span className="text-blue-600">{indexOfFirstProfile + 1}-{Math.min(indexOfLastProfile, filteredHousegirls.length)}</span> of <span className="text-blue-600">{filteredHousegirls.length}</span> profiles
                </span>
              </div>
              {totalPages > 1 && (
                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                  Page {currentPage} of {totalPages}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Housegirls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentProfiles.map((housegirl) => (
            <Card key={housegirl.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-blue-200 shadow-lg">
                        {housegirl.image ? (
                          <img 
                            src={housegirl.image} 
                            alt={housegirl.name}
                            className="w-16 h-16 object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-blue-600" />
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{housegirl.name}</h3>
                      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 text-xs font-medium">
                        {housegirl.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveProfile(housegirl.id)}
                      className="p-2 h-9 w-9 hover:bg-blue-50 text-blue-600 rounded-full"
                      title="Save to Favorites"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <div className="p-2 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full h-9 w-9 flex items-center justify-center">
                      <Lock className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                {/* Salary Highlight */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{housegirl.salary}</div>
                    <div className="text-xs text-blue-500 font-medium">Expected Salary</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Key Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <MapPin className="h-3 w-3 text-blue-600" />
                      </div>
                      <div className="text-xs">
                        <div className="font-medium text-gray-900">{housegirl.location}</div>
                        <div className="text-gray-500">{housegirl.nationality}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Home className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="text-xs">
                        <div className="font-medium text-gray-900">{housegirl.community}</div>
                        <div className="text-gray-500">{housegirl.accommodation}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Clock className="h-3 w-3 text-purple-600" />
                      </div>
                      <div className="text-xs">
                        <div className="font-medium text-gray-900">{housegirl.experience}</div>
                        <div className="text-gray-500">{housegirl.age} years old</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-orange-100 rounded-lg">
                        <GraduationCap className="h-3 w-3 text-orange-600" />
                      </div>
                      <div className="text-xs">
                        <div className="font-medium text-gray-900">{housegirl.education}</div>
                        <div className="text-gray-500">Education Level</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleViewProfile(housegirl)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium h-10 group-hover:shadow-lg transition-all duration-300"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Button>
                  
                  <div className="text-center">
                    <span className="text-xs text-gray-500">
                      Unlock contact details for KES 200
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced No Results */}
        {filteredHousegirls.length === 0 && (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto border-0 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
              <CardContent className="p-8">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full inline-block mb-6">
                  <Search className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Profiles Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters to find more housegirls</p>
                <div className="space-y-3">
                  <Button 
                    onClick={resetFilters} 
                    variant="default" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Reset All Filters
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current page
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={pageNumber}
                            variant={pageNumber === currentPage ? "default" : "outline"}
                            onClick={() => goToPage(pageNumber)}
                            className={`px-4 py-2 text-sm min-w-[44px] rounded-full transition-all duration-200 ${
                              pageNumber === currentPage
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                            }`}
                          >
                            {pageNumber}
                          </Button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <span key={pageNumber} className="px-3 text-gray-400 font-medium">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
