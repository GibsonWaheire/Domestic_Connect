import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Users, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  LogOut, 
  Filter, 
  Bell, 
  Calendar, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  ArrowUpRight, 
  ArrowDownRight, 
  Target, 
  Award, 
  Zap, 
  Info, 
  FileText, 
  Shield, 
  Home, 
  Menu, 
  X,
  User,
  Briefcase,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Housegirl {
  id: string;
  name: string;
  age: number;
  location: string;
  experience: string;
  education: string;
  expectedSalary: string;
  rating: number;
  status: 'available' | 'placed' | 'unavailable';
  skills: string[];
  languages: string[];
  photo: string;
  matchScore: number;
}

interface JobPosting {
  id: string;
  title: string;
  client: string;
  location: string;
  salary: string;
  postedDate: string;
  status: 'active' | 'filled' | 'expired';
  applications: number;
  requirements: string[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive';
  totalSpent: number;
  lastContact: string;
  photo: string;
}

const AgencyDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'housegirls' | 'jobs' | 'clients' | 'messages' | 'settings'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!user || user.user_type !== 'agency') {
      navigate('/agencies');
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/agencies');
  };

  if (!user || user.user_type !== 'agency') {
    return null;
  }

  // Mock data for agency dashboard
  const agencyStats = {
    totalHousegirls: 45,
    activeJobs: 12,
    totalClients: 28,
    monthlyRevenue: 125000,
    placementRate: 94,
    averageRating: 4.8
  };

  const recentHousegirls: Housegirl[] = [
    {
      id: '1',
      name: 'Sarah Wanjiku',
      age: 28,
      location: 'Westlands, Nairobi',
      experience: '5 years',
      education: 'Form 4 and Above',
      expectedSalary: 'KES 18,000',
      rating: 4.9,
      status: 'available',
      skills: ['Cooking', 'Cleaning', 'Childcare'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      photo: '/placeholder.svg',
      matchScore: 95
    },
    {
      id: '2',
      name: 'Grace Akinyi',
      age: 32,
      location: 'Kilimani, Nairobi',
      experience: '8 years',
      education: 'Certificate',
      expectedSalary: 'KES 22,000',
      rating: 4.7,
      status: 'placed',
      skills: ['Cooking', 'Cleaning', 'Laundry', 'Childcare'],
      languages: ['English', 'Swahili', 'Luo'],
      photo: '/placeholder.svg',
      matchScore: 88
    }
  ];

  const activeJobs: JobPosting[] = [
    {
      id: '1',
      title: 'Live-in House Help Needed',
      client: 'John & Mary Smith',
      location: 'Karen, Nairobi',
      salary: 'KES 20,000',
      postedDate: '2024-01-15',
      status: 'active',
      applications: 8,
      requirements: ['Cooking', 'Cleaning', 'Childcare', 'Live-in']
    },
    {
      id: '2',
      title: 'Part-time Housekeeper',
      client: 'Dr. Sarah Johnson',
      location: 'Westlands, Nairobi',
      salary: 'KES 15,000',
      postedDate: '2024-01-12',
      status: 'active',
      applications: 5,
      requirements: ['Cleaning', 'Laundry', 'Live-out']
    }
  ];

  const topClients: Client[] = [
    {
      id: '1',
      name: 'John & Mary Smith',
      email: 'john.smith@email.com',
      phone: '+254700123456',
      location: 'Karen, Nairobi',
      status: 'active',
      totalSpent: 45000,
      lastContact: '2024-01-15',
      photo: '/placeholder.svg'
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+254700789012',
      location: 'Westlands, Nairobi',
      status: 'active',
      totalSpent: 38000,
      lastContact: '2024-01-14',
      photo: '/placeholder.svg'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Agency Dashboard</h1>
                  <p className="text-sm text-gray-500">Welcome back, {user.first_name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Stats Icons */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{agencyStats.totalHousegirls}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{agencyStats.activeJobs}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{agencyStats.totalClients}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>KES {agencyStats.monthlyRevenue.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotification(!showNotification)}
                className="relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>

              <Button variant="outline" onClick={handleSignOut} className="text-sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm transition-all duration-300 lg:block ${sidebarCollapsed ? 'hidden' : 'block'}`}>
          <div className="p-4">
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: Home },
                { id: 'housegirls', label: 'Housegirls', icon: Users },
                { id: 'jobs', label: 'Job Postings', icon: Briefcase },
                { id: 'clients', label: 'Clients', icon: User },
                { id: 'messages', label: 'Messages', icon: MessageCircle },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full justify-start ${activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:text-emerald-600'}`}
                >
                  <tab.icon className="h-4 w-4 mr-3" />
                  {!sidebarCollapsed && tab.label}
                </Button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Housegirls</p>
                        <p className="text-2xl font-bold text-gray-900">{agencyStats.totalHousegirls}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                        <p className="text-2xl font-bold text-gray-900">{agencyStats.activeJobs}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Clients</p>
                        <p className="text-2xl font-bold text-gray-900">{agencyStats.totalClients}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">KES {agencyStats.monthlyRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Placement Rate</span>
                        <span className="text-sm font-medium">{agencyStats.placementRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${agencyStats.placementRate}%` }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Average Rating</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium ml-1">{agencyStats.averageRating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest updates and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">New housegirl registered - Sarah Wanjiku</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Job placement completed - Grace Akinyi</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">New client inquiry received</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Housegirls */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Housegirls</CardTitle>
                  <CardDescription>Latest registered housegirls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentHousegirls.map((housegirl) => (
                      <div key={housegirl.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{housegirl.name}</h3>
                            <p className="text-sm text-gray-600">{housegirl.location} • {housegirl.experience}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={housegirl.status === 'available' ? 'default' : 'secondary'}>
                            {housegirl.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Jobs */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Job Postings</CardTitle>
                  <CardDescription>Current job opportunities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.client} • {job.location}</p>
                          <p className="text-sm text-gray-600">{job.salary} • {job.applications} applications</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Housegirls Tab */}
          {activeTab === 'housegirls' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Housegirls Management</CardTitle>
                      <CardDescription>Manage your registered housegirls</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Housegirl
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Housegirls Management</h3>
                    <p className="text-gray-600 mb-4">
                      Manage your registered housegirls, view their profiles, and track their placements.
                    </p>
                    <Button>View All Housegirls</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job Postings</CardTitle>
                      <CardDescription>Manage job postings and applications</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job Posting
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Job Postings</h3>
                    <p className="text-gray-600 mb-4">
                      Create and manage job postings, track applications, and match housegirls to clients.
                    </p>
                    <Button>Create New Job</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Client Management</CardTitle>
                      <CardDescription>Manage your client relationships</CardDescription>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Client Management</h3>
                    <p className="text-gray-600 mb-4">
                      Manage your client relationships, track their requirements, and maintain communication.
                    </p>
                    <Button>View All Clients</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Communicate with clients and housegirls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-600 mb-4">
                      When clients or housegirls contact you, you'll see their messages here.
                    </p>
                    <Button variant="outline">Browse Clients</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agency Settings</CardTitle>
                  <CardDescription>Manage your agency profile and preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Agency Settings</h3>
                    <p className="text-gray-600 mb-4">
                      Update your agency information, manage notifications, and configure your preferences.
                    </p>
                    <Button>Update Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AgencyDashboard;
