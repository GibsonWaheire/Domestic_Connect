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
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  RefreshCw,
  Activity,
  PieChart,
  CreditCard,
  Headphones,
  MessageSquare,
  HelpCircle,
  Globe,
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging
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
  status: 'available' | 'placed' | 'unavailable' | 'interviewing';
  skills: string[];
  languages: string[];
  photo: string;
  matchScore: number;
  placementDate?: string;
  clientName?: string;
  earnings: number;
}

interface JobPosting {
  id: string;
  title: string;
  client: string;
  location: string;
  salary: string;
  postedDate: string;
  status: 'active' | 'filled' | 'expired' | 'pending';
  applications: number;
  requirements: string[];
  commission: number;
  placementFee: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  status: 'active' | 'inactive' | 'premium';
  totalSpent: number;
  lastContact: string;
  photo: string;
  placements: number;
  satisfaction: number;
}

interface Placement {
  id: string;
  housegirlName: string;
  clientName: string;
  placementDate: string;
  salary: string;
  commission: number;
  status: 'active' | 'completed' | 'terminated';
  duration: string;
}

const AgencyDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'housegirls' | 'jobs' | 'clients' | 'placements' | 'analytics' | 'settings'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

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

  // Enhanced mock data for agency dashboard
  const agencyStats = {
    totalHousegirls: 127,
    activeJobs: 23,
    totalClients: 89,
    monthlyRevenue: 450000,
    placementRate: 96,
    averageRating: 4.9,
    activePlacements: 156,
    pendingInterviews: 12,
    thisMonthPlacements: 18,
    thisMonthRevenue: 125000
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
      matchScore: 95,
      earnings: 45000
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
      matchScore: 88,
      placementDate: '2024-01-15',
      clientName: 'John & Mary Smith',
      earnings: 38000
    },
    {
      id: '3',
      name: 'Faith Muthoni',
      age: 25,
      location: 'Karen, Nairobi',
      experience: '3 years',
      education: 'Diploma',
      expectedSalary: 'KES 20,000',
      rating: 4.8,
      status: 'interviewing',
      skills: ['Cooking', 'Cleaning', 'Elderly Care'],
      languages: ['English', 'Swahili', 'Kikuyu'],
      photo: '/placeholder.svg',
      matchScore: 92,
      earnings: 52000
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
      requirements: ['Cooking', 'Cleaning', 'Childcare', 'Live-in'],
      commission: 2000,
      placementFee: 5000
    },
    {
      id: '2',
      title: 'Part-time Housekeeper',
      client: 'Dr. Sarah Johnson',
      location: 'Westlands, Nairobi',
      salary: 'KES 15,000',
      postedDate: '2024-01-12',
      status: 'pending',
      applications: 5,
      requirements: ['Cleaning', 'Laundry', 'Live-out'],
      commission: 1500,
      placementFee: 3000
    }
  ];

  const topClients: Client[] = [
    {
      id: '1',
      name: 'John & Mary Smith',
      email: 'john.smith@email.com',
      phone: '+254700123456',
      location: 'Karen, Nairobi',
      status: 'premium',
      totalSpent: 125000,
      lastContact: '2024-01-15',
      photo: '/placeholder.svg',
      placements: 3,
      satisfaction: 5
    },
    {
      id: '2',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+254700789012',
      location: 'Westlands, Nairobi',
      status: 'active',
      totalSpent: 89000,
      lastContact: '2024-01-14',
      photo: '/placeholder.svg',
      placements: 2,
      satisfaction: 4
    }
  ];

  const recentPlacements: Placement[] = [
    {
      id: '1',
      housegirlName: 'Grace Akinyi',
      clientName: 'John & Mary Smith',
      placementDate: '2024-01-15',
      salary: 'KES 22,000',
      commission: 2200,
      status: 'active',
      duration: '2 months'
    },
    {
      id: '2',
      housegirlName: 'Faith Muthoni',
      clientName: 'Dr. Sarah Johnson',
      placementDate: '2024-01-10',
      salary: 'KES 18,000',
      commission: 1800,
      status: 'active',
      duration: '1 month'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
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
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Domestic Connect Agency</h1>
                  <p className="text-sm text-slate-500">Welcome back, {user.first_name}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/home')}
                className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-slate-600">{agencyStats.activePlacements} Active</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-slate-600">KES {agencyStats.thisMonthRevenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-slate-600">{agencyStats.totalHousegirls}</span>
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
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white/80 backdrop-blur-md shadow-lg transition-all duration-300 lg:block ${sidebarCollapsed ? 'hidden' : 'block'}`}>
          <div className="p-4">
            <nav className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: Home },
                { id: 'housegirls', label: 'Housegirls', icon: Users },
                { id: 'jobs', label: 'Job Postings', icon: Briefcase },
                { id: 'clients', label: 'Clients', icon: User },
                { id: 'placements', label: 'Placements', icon: CheckCircle },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full justify-start ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'}`}
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
              {/* Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Housegirls</p>
                        <p className="text-3xl font-bold">{agencyStats.totalHousegirls}</p>
                        <p className="text-blue-200 text-xs">+12 this month</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Active Placements</p>
                        <p className="text-3xl font-bold">{agencyStats.activePlacements}</p>
                        <p className="text-green-200 text-xs">+5 this week</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Monthly Revenue</p>
                        <p className="text-3xl font-bold">KES {agencyStats.monthlyRevenue.toLocaleString()}</p>
                        <p className="text-purple-200 text-xs">+15% vs last month</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Placement Rate</p>
                        <p className="text-3xl font-bold">{agencyStats.placementRate}%</p>
                        <p className="text-orange-200 text-xs">+2% improvement</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Housegirl
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Create Job Posting
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <User className="h-4 w-4 mr-2" />
                      Add New Client
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">New housegirl registered - Faith Muthoni</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Placement completed - Grace Akinyi</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">New premium client inquiry</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span>Performance</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Placement Rate</span>
                        <span className="text-sm font-medium">{agencyStats.placementRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${agencyStats.placementRate}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Client Satisfaction</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium ml-1">{agencyStats.averageRating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Housegirls */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Housegirls</CardTitle>
                      <CardDescription>Latest registered housegirls and their status</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentHousegirls.map((housegirl) => (
                      <div key={housegirl.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {housegirl.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{housegirl.name}</h3>
                            <p className="text-sm text-slate-600">{housegirl.location} • {housegirl.experience}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-slate-500">{housegirl.rating}</span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-500">KES {housegirl.earnings.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={housegirl.status === 'available' ? 'default' : 
                                   housegirl.status === 'placed' ? 'secondary' : 
                                   housegirl.status === 'interviewing' ? 'outline' : 'destructive'}
                            className="capitalize"
                          >
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Job Postings</CardTitle>
                      <CardDescription>Current job opportunities and applications</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div>
                          <h3 className="font-semibold text-slate-900">{job.title}</h3>
                          <p className="text-sm text-slate-600">{job.client} • {job.location}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-slate-500">{job.salary}</span>
                            <span className="text-sm text-slate-500">•</span>
                            <span className="text-sm text-slate-500">{job.applications} applications</span>
                            <span className="text-sm text-slate-500">•</span>
                            <span className="text-sm text-green-600 font-medium">KES {job.commission.toLocaleString()} commission</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={job.status === 'active' ? 'default' : 
                                   job.status === 'pending' ? 'outline' : 
                                   job.status === 'filled' ? 'secondary' : 'destructive'}
                            className="capitalize"
                          >
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Housegirls Management</CardTitle>
                      <CardDescription>Manage your registered housegirls, track their placements, and monitor performance</CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Housegirl
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Housegirls Management</h3>
                    <p className="text-slate-600 mb-4">
                      Register new housegirls, manage their profiles, track placements, and monitor their performance metrics.
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job Postings</CardTitle>
                      <CardDescription>Create and manage job postings, track applications, and match housegirls to clients</CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job Posting
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Briefcase className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Job Postings</h3>
                    <p className="text-slate-600 mb-4">
                      Create compelling job postings, track applications, and efficiently match qualified housegirls to client requirements.
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Client Management</CardTitle>
                      <CardDescription>Manage your client relationships, track their requirements, and maintain communication</CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Client Management</h3>
                    <p className="text-slate-600 mb-4">
                      Build and maintain strong client relationships, track their satisfaction, and ensure repeat business.
                    </p>
                    <Button>View All Clients</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placements Tab */}
          {activeTab === 'placements' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Placements</CardTitle>
                      <CardDescription>Track successful placements, monitor performance, and manage ongoing relationships</CardDescription>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Placements</h3>
                    <p className="text-slate-600 mb-4">
                      Monitor successful placements, track performance metrics, and ensure client satisfaction.
                    </p>
                    <Button>View All Placements</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Analytics & Reports</CardTitle>
                      <CardDescription>Comprehensive analytics, performance metrics, and business insights</CardDescription>
                    </div>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-slate-600 mb-4">
                      Get detailed insights into your business performance, placement rates, and revenue trends.
                    </p>
                    <Button>View Analytics</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Agency Settings</CardTitle>
                  <CardDescription>Manage your agency profile, preferences, and system configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Agency Settings</h3>
                    <p className="text-slate-600 mb-4">
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

      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowWhatsApp(!showWhatsApp)}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* WhatsApp Chat Modal */}
      {showWhatsApp && (
        <div className="fixed bottom-20 right-6 z-50">
          <Card className="w-80 shadow-2xl border-0">
            <CardHeader className="bg-green-500 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <CardTitle className="text-white">Contact Support</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWhatsApp(false)}
                  className="text-white hover:bg-green-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Need help? Contact us via WhatsApp for immediate assistance.
                </p>
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open WhatsApp
                </Button>
                <div className="text-center">
                  <p className="text-xs text-slate-500">Available 24/7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white text-xs px-4 py-2 z-40">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Wifi className="h-3 w-3 text-green-400" />
              <span>Online</span>
            </div>
            <div className="flex items-center space-x-1">
              <Battery className="h-3 w-3 text-green-400" />
              <span>System Healthy</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span>Domestic Connect Agency v1.0</span>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;
