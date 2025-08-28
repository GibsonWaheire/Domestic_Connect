import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  Heart as HeartIcon
} from 'lucide-react';

// Mock data for housegirls
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
    image: "/placeholder.svg"
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
    image: "/placeholder.svg"
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
    image: "/placeholder.svg"
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
    image: "/placeholder.svg"
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
    image: "/placeholder.svg"
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
    image: "/placeholder.svg"
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

  const handleViewProfile = (housegirlId: number) => {
    // This would typically unlock the profile for a fee
    alert(`Profile unlocked! You can now view ${housegirls.find(h => h.id === housegirlId)?.name}'s full details.`);
  };

  const handleSaveProfile = (housegirlId: number) => {
    // This would save the profile to favorites
    alert(`Profile saved to favorites!`);
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
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent ml-3">
                  Domestic Connect
                </h1>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" className="text-pink-600 bg-pink-50 rounded-full">
                  Dashboard
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full" onClick={() => navigate('/housegirls')}>
                  For Housegirls
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full" onClick={() => navigate('/agencies')}>
                  For Agencies
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">
                {user.user_type}
              </Badge>
              <span className="text-sm text-gray-600">
                Karibu, {user.first_name}
              </span>
              <Button variant="outline" onClick={signOut} className="border-pink-300 hover:bg-pink-50 rounded-full">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl mr-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Available Housegirls</h2>
          </div>
          <p className="text-lg text-gray-600">Find your perfect house help from our verified database</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Search & Filters</h3>
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="border-pink-300 text-pink-600 hover:bg-pink-50 rounded-full"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <Input
                  placeholder="Search by name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-pink-200 focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                  <SelectTrigger className="border-pink-200 focus:border-pink-500">
                    <SelectValue />
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                  <SelectTrigger className="border-pink-200 focus:border-pink-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Experience Levels">All Experience Levels</SelectItem>
                    <SelectItem value="1 Year">1 Year</SelectItem>
                    <SelectItem value="2 Years">2 Years</SelectItem>
                    <SelectItem value="3 Years">3 Years</SelectItem>
                    <SelectItem value="4 Years">4 Years</SelectItem>
                    <SelectItem value="5+ Years">5+ Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accommodation</label>
                <Select value={filters.accommodation} onValueChange={(value) => handleFilterChange('accommodation', value)}>
                  <SelectTrigger className="border-pink-200 focus:border-pink-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="Live-in">Live-in</SelectItem>
                    <SelectItem value="Live-out">Live-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Community</label>
                <Select value={filters.community} onValueChange={(value) => handleFilterChange('community', value)}>
                  <SelectTrigger className="border-pink-200 focus:border-pink-500">
                    <SelectValue />
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <Select value={filters.education} onValueChange={(value) => handleFilterChange('education', value)}>
                  <SelectTrigger className="border-pink-200 focus:border-pink-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Levels">All Levels</SelectItem>
                    <SelectItem value="Class 8 and Above">Class 8 and Above</SelectItem>
                    <SelectItem value="Form 4 and Above">Form 4 and Above</SelectItem>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="University">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <Select value={filters.salaryRange} onValueChange={(value) => handleFilterChange('salaryRange', value)}>
                  <SelectTrigger className="border-pink-200 focus:border-pink-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Salaries">All Salaries</SelectItem>
                    <SelectItem value="KES 5,000 - 8,000">KES 5,000 - 8,000</SelectItem>
                    <SelectItem value="KES 8,000 - 12,000">KES 8,000 - 12,000</SelectItem>
                    <SelectItem value="KES 12,000 - 15,000">KES 12,000 - 15,000</SelectItem>
                    <SelectItem value="KES 15,000+">KES 15,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-pink-600">{filteredHousegirls.length}</span> of {housegirls.length} available housegirls
          </p>
        </div>

        {/* Housegirls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHousegirls.map((housegirl) => (
            <Card key={housegirl.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{housegirl.name}</h3>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {housegirl.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSaveProfile(housegirl.id)}
                      className="p-2 hover:bg-pink-50 text-pink-600"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-semibold text-pink-600">{housegirl.salary}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                      {housegirl.nationality}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Home className="h-4 w-4 mr-2 text-pink-500" />
                      {housegirl.community}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-pink-500" />
                      {housegirl.age} Years Old
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Home className="h-4 w-4 mr-2 text-pink-500" />
                      {housegirl.accommodation}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-pink-500" />
                      {housegirl.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-pink-500" />
                      {housegirl.experience}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2 text-pink-500" />
                      {housegirl.education}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleViewProfile(housegirl.id)}
                  className="w-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-full"
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
            <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-4">
              <Search className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No housegirls found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={resetFilters} variant="outline" className="border-pink-300 text-pink-600 hover:bg-pink-50">
              Reset All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
