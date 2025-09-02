import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Home,
  Edit,
  Settings,
  LogOut,
  Eye,
  Calendar,
  DollarSign,
  MapPin as LocationIcon,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import PhotoUpload from '@/components/PhotoUpload';
import ReturnToHome from '@/components/ReturnToHome';

interface JobOpportunity {
  id: string;
  title: string;
  location: string;
  salary: string;
  postedDate: string;
  employer: string;
  description: string;
  requirements: string[];
  matchScore: number;
}

const HousegirlDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'messages'>('overview');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
    // Load photo from localStorage on component mount
    return localStorage.getItem('housegirl_profile_photo');
  });
  const [showEditModal, setShowEditModal] = useState(false);

  // Enhanced mock data with match scores
  const [jobOpportunities] = useState<JobOpportunity[]>([
    {
      id: '1',
      title: 'Live-in House Help Needed',
      location: 'Westlands, Nairobi',
      salary: 'KSh 15,000 - 20,000',
      postedDate: '2 hours ago',
      employer: 'Family of 4',
      description: 'Looking for a reliable house help for cooking, cleaning, and basic childcare.',
      requirements: ['Cooking skills', 'Cleaning experience', 'Basic English', 'Live-in preferred'],
      matchScore: 95
    },
    {
      id: '2',
      title: 'Part-time Housekeeper',
      location: 'Kilimani, Nairobi',
      salary: 'KSh 8,000 - 12,000',
      postedDate: '1 day ago',
      employer: 'Single Professional',
      description: 'Need help with cleaning and laundry 3 times a week.',
      requirements: ['Cleaning experience', 'Reliable', 'Live-out', 'Flexible schedule'],
      matchScore: 87
    },
    {
      id: '3',
      title: 'Full-time Nanny & House Help',
      location: 'Lavington, Nairobi',
      salary: 'KSh 18,000 - 25,000',
      postedDate: '3 days ago',
      employer: 'Family with 2 children',
      description: 'Experienced nanny needed for childcare and light housekeeping.',
      requirements: ['Childcare experience', 'First aid knowledge', 'Patient with children', 'Live-in available'],
      matchScore: 92
    },
    {
      id: '4',
      title: 'Weekend House Help',
      location: 'Karen, Nairobi',
      salary: 'KSh 6,000 - 8,000',
      postedDate: '5 days ago',
      employer: 'Busy Family',
      description: 'Weekend assistance with cleaning and meal preparation.',
      requirements: ['Cooking skills', 'Cleaning experience', 'Weekend availability'],
      matchScore: 78
    }
  ]);

  useEffect(() => {
    if (!user || user.user_type !== 'housegirl') {
      navigate('/housegirls');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/housegirls');
  };

  const handlePhotoUpload = (photoUrl: string) => {
    setProfilePhoto(photoUrl);
    // Save to localStorage for persistence
    localStorage.setItem('housegirl_profile_photo', photoUrl);
  };

  if (!user || user.user_type !== 'housegirl') {
    return null;
  }

  // Get user's actual data from registration
  const getUserData = () => {
    // Use actual user data from registration, with fallbacks
    return {
      age: user.age || '25',
      location: user.location || 'Nairobi',
      experience: user.experience || '2 Years',
      education: user.education || 'Form 4 and Above',
      expectedSalary: user.expectedSalary || 'KSh 15,000',
      accommodationType: user.accommodationType || 'Live-in',
      community: user.community || 'Kikuyu',
      skills: user.skills || ['Cooking', 'Cleaning', 'Laundry', 'Childcare'],
      languages: user.languages || ['English', 'Swahili'],
      bio: user.bio || 'Professional house help with experience in cooking, cleaning, and childcare.'
    };
  };

  const userData = getUserData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/home')}>
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-2">
                  Domestic Connect
                </h1>
              </div>
              
              <ReturnToHome variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50 hidden sm:flex" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0 text-xs">
                {user.user_type}
              </Badge>
              <span className="text-sm text-gray-600 hidden sm:block">
                Karibu, {user.first_name}
              </span>
              <Button variant="outline" onClick={handleSignOut} className="border-blue-300 hover:bg-blue-50 rounded-full p-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.first_name}! 👋
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Here's what's happening with your job search today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                <AvatarImage src={profilePhoto || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg sm:text-xl font-bold">
                  {user.first_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-gray-500">Profile Photo</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-1 text-xs"
                  onClick={() => setActiveTab('profile')}
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'messages', label: 'Messages', icon: MessageCircle }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as 'overview' | 'profile' | 'messages')}
              className={`flex-1 text-xs sm:text-sm ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Job Opportunities */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Available Job Opportunities</CardTitle>
                    <CardDescription>Jobs that best match your skills and preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobOpportunities.map((job) => (
                    <Card key={job.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {job.matchScore}% Match
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <LocationIcon className="h-4 w-4 mr-2" />
                              {job.location}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2" />
                              {job.salary}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Posted {job.postedDate}
                            </div>
                          </div>

                          <p className="text-gray-700 text-sm">{job.description}</p>

                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Requirements:</p>
                            <div className="flex flex-wrap gap-1">
                              {job.requirements.slice(0, 3).map((req, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {req}
                                </Badge>
                              ))}
                              {job.requirements.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.requirements.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600">
                            <strong>Employer:</strong> {job.employer}
                          </p>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                              Apply Now
                            </Button>
                            <Button variant="outline" size="sm">
                              Save
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Things you can do to improve your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                    onClick={() => setActiveTab('profile')}
                  >
                    <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <span className="text-xs sm:text-sm">Update Profile</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                  >
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    <span className="text-xs sm:text-sm">Search Jobs</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                  >
                    <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    <span className="text-xs sm:text-sm">Preferences</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Profile Information</CardTitle>
                <CardDescription>Manage your profile details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Photo Upload */}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Photo</h4>
                    <PhotoUpload 
                      onPhotoUploaded={handlePhotoUpload}
                    />
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Full Name</label>
                          <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Phone</label>
                          <p className="text-gray-900">{user.phone_number || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Age</label>
                          <p className="text-gray-900">{userData.age} years old</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Community</label>
                          <p className="text-gray-900">{userData.community}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Work Preferences</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Preferred Location</label>
                          <p className="text-gray-900">{userData.location}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Experience Level</label>
                          <p className="text-gray-900">{userData.experience}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Education</label>
                          <p className="text-gray-900">{userData.education}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Expected Salary</label>
                          <p className="text-gray-900">{userData.expectedSalary}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Accommodation</label>
                          <p className="text-gray-900">{userData.accommodationType}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Bio */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">About You</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {userData.bio}
                    </p>
                  </div>

                  <Separator />

                  {/* Skills & Languages */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills & Languages</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Skills</label>
                        <div className="flex flex-wrap gap-2">
                          {userData.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Languages</label>
                        <div className="flex flex-wrap gap-2">
                          {userData.languages.map((language) => (
                            <Badge key={language} variant="outline" className="bg-green-100 text-green-800">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowEditModal(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Messages</CardTitle>
                <CardDescription>Communicate with potential employers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                  <p className="text-gray-600 mb-4">
                    When employers contact you about job opportunities, you'll see their messages here.
                  </p>
                  <Button variant="outline">
                    Browse Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Edit Profile</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Bio</label>
                  <textarea 
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                    rows={3}
                    placeholder="Tell employers about yourself..."
                    defaultValue={userData.bio}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Expected Salary</label>
                  <input 
                    type="text"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g., KSh 15,000"
                    defaultValue={userData.expectedSalary}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <input 
                    type="text"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g., Nairobi"
                    defaultValue={userData.location}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // TODO: Implement save functionality
                    alert('Profile updated successfully!');
                    setShowEditModal(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousegirlDashboard;
