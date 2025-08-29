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
  MapPin as LocationIcon
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
}

const HousegirlDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'profile' | 'messages'>('overview');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Mock data - in production this would come from API
  const [jobOpportunities] = useState<JobOpportunity[]>([
    {
      id: '1',
      title: 'Live-in House Help Needed',
      location: 'Westlands, Nairobi',
      salary: 'KSh 15,000 - 20,000',
      postedDate: '2 hours ago',
      employer: 'Family of 4',
      description: 'Looking for a reliable house help for cooking, cleaning, and basic childcare.',
      requirements: ['Cooking skills', 'Cleaning experience', 'Basic English', 'Live-in preferred']
    },
    {
      id: '2',
      title: 'Part-time Housekeeper',
      location: 'Kilimani, Nairobi',
      salary: 'KSh 8,000 - 12,000',
      postedDate: '1 day ago',
      employer: 'Single Professional',
      description: 'Need help with cleaning and laundry 3 times a week.',
      requirements: ['Cleaning experience', 'Reliable', 'Live-out', 'Flexible schedule']
    },
    {
      id: '3',
      title: 'Full-time Nanny & House Help',
      location: 'Lavington, Nairobi',
      salary: 'KSh 18,000 - 25,000',
      postedDate: '3 days ago',
      employer: 'Family with 2 children',
      description: 'Experienced nanny needed for childcare and light housekeeping.',
      requirements: ['Childcare experience', 'First aid knowledge', 'Patient with children', 'Live-in available']
    }
  ]);

  const [profileStats] = useState({
    profileViews: 45,
    jobApplications: 3,
    messagesReceived: 8,
    daysActive: 12
  });

  useEffect(() => {
    if (!user || user.user_type !== 'housegirl') {
      navigate('/housegirls');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/housegirls');
  };

  if (!user || user.user_type !== 'housegirl') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/home')}>
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-3">
                  Domestic Connect
                </h1>
              </div>
              
              <ReturnToHome variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50" />
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0">
                {user.user_type}
              </Badge>
              <span className="text-sm text-gray-600">
                Karibu, {user.first_name}
              </span>
              <Button variant="outline" onClick={handleSignOut} className="border-blue-300 hover:bg-blue-50 rounded-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user.first_name}! 👋
              </h2>
              <p className="text-gray-600">
                Here's what's happening with your job search today
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profilePhoto || undefined} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl font-bold">
                  {user.first_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm text-gray-500">Profile Photo</p>
                <Button variant="outline" size="sm" className="mt-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'jobs', label: 'Job Opportunities', icon: Briefcase },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'messages', label: 'Messages', icon: MessageCircle }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Profile Views</p>
                      <p className="text-2xl font-bold text-blue-900">{profileStats.profileViews}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Applications</p>
                      <p className="text-2xl font-bold text-green-900">{profileStats.jobApplications}</p>
                    </div>
                    <Briefcase className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Messages</p>
                      <p className="text-2xl font-bold text-purple-900">{profileStats.messagesReceived}</p>
                    </div>
                    <MessageCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Days Active</p>
                      <p className="text-2xl font-bold text-orange-900">{profileStats.daysActive}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Job Opportunities */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Recent Job Opportunities</CardTitle>
                    <CardDescription>Latest jobs that match your profile</CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('jobs')}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobOpportunities.slice(0, 2).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{job.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center">
                            <LocationIcon className="h-4 w-4 mr-1" />
                            {job.location}
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {job.postedDate}
                          </span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Apply Now
                      </Button>
                    </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50">
                    <Edit className="h-6 w-6 text-blue-600" />
                    <span className="text-sm">Update Profile</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50">
                    <Search className="h-6 w-6 text-green-600" />
                    <span className="text-sm">Search Jobs</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50">
                    <Settings className="h-6 w-6 text-purple-600" />
                    <span className="text-sm">Preferences</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Available Job Opportunities</CardTitle>
                <CardDescription>Browse and apply for jobs that match your skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobOpportunities.map((job) => (
                    <Card key={job.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Active
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
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

                            <p className="text-gray-700 mb-4">{job.description}</p>

                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-900 mb-2">Requirements:</p>
                              <div className="flex flex-wrap gap-2">
                                {job.requirements.map((req, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600">
                              <strong>Employer:</strong> {job.employer}
                            </p>
                          </div>
                          
                          <div className="ml-6 flex flex-col space-y-2">
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              Apply Now
                            </Button>
                            <Button variant="outline" size="sm">
                              Save Job
                            </Button>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
                      onPhotoUploaded={(photoUrl) => {
                        setProfilePhoto(photoUrl);
                        console.log('Photo uploaded:', photoUrl);
                      }}
                    />
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Work Preferences</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Preferred Location</label>
                          <p className="text-gray-900">Nairobi</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Experience Level</label>
                          <p className="text-gray-900">2+ Years</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Accommodation</label>
                          <p className="text-gray-900">Live-in preferred</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Skills & Languages */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills & Languages</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Skills</label>
                        <div className="flex flex-wrap gap-2">
                          {['Cooking', 'Cleaning', 'Laundry', 'Childcare', 'Ironing'].map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Languages</label>
                        <div className="flex flex-wrap gap-2">
                          {['English', 'Swahili', 'Kikuyu'].map((language) => (
                            <Badge key={language} variant="outline">
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Button className="bg-blue-600 hover:bg-blue-700">
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
                  <Button variant="outline" onClick={() => setActiveTab('jobs')}>
                    Browse Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousegirlDashboard;
