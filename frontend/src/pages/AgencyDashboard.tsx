import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { agenciesApi, housegirlProfilesApi, employerProfilesApi, crossEntityApi, DashboardData } from '@/lib/api';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { 
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
  BatteryCharging,
  Loader2
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
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  
  // Additional auth check - ensure only agencies can access this dashboard
  useEffect(() => {
    if (!loading && user) {
      if (user.user_type !== 'agency' && !user.is_admin) {
        toast({
          title: "Access Denied",
          description: "This dashboard is only accessible to agencies.",
          variant: "destructive"
        });
        
        // Redirect based on user type
        if (user.user_type === 'housegirl') {
          navigate('/housegirl-dashboard');
        } else if (user.user_type === 'employer') {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
        return;
      }
    }
  }, [user, loading, navigate]);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'housegirls' | 'jobs' | 'clients' | 'placements' | 'analytics' | 'settings'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [agencyData, setAgencyData] = useState<{
    name: string;
    email: string;
    stats: Record<string, number>;
  } | null>(null);
  const [agencyWorkers, setAgencyWorkers] = useState<Array<{
    id: string;
    name: string;
    verification_status: string;
    training_certificates: string[];
    hire_date: string;
  }>>([]);
  const [agencyClients, setAgencyClients] = useState<Array<{
    id: string;
    name: string;
    email: string;
    phone_number: string;
    company_name: string;
    location: string;
    placement_status: string;
    hire_date: string;
  }>>([]);
  const [agencyPayments, setAgencyPayments] = useState<Array<{
    id: string;
    amount: number;
    agency_fee: number;
    created_at: string;
  }>>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Use real-time data hook
  const { 
    dashboardData, 
    loading: dataLoading, 
    error: dataError, 
    refreshing,
    lastUpdated, 
    refreshData 
  } = useRealTimeData({ 
    refreshInterval: 30000, // 30 seconds
    enabled: !!user 
  });

  // Transform dashboard data when it changes
  useEffect(() => {
    if (dashboardData) {
      // Set agency-specific data
      if (dashboardData.available_data.clients) {
        setAgencyClients(dashboardData.available_data.clients);
      }
      if (dashboardData.available_data.workers) {
        setAgencyWorkers(dashboardData.available_data.workers);
      }
      
      // Set agency data from user profile
      setAgencyData({
        name: `${dashboardData.user.first_name} ${dashboardData.user.last_name}`,
        email: dashboardData.user.email,
        stats: dashboardData.stats
      });
      
      setIsLoading(false);
    }
  }, [dashboardData]);

  // Show error if data fetching fails
  useEffect(() => {
    if (dataError) {
      toast({
        title: "Data Sync Error",
        description: "Failed to sync latest data. Some information may be outdated.",
        variant: "destructive",
      });
    }
  }, [dataError]);
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'agency')) {
      navigate('/agencies');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/agencies');
  };

  if (loading || !user || user.user_type !== 'agency') {
    return null;
  }

  // Calculate real agency stats from fetched data
  const agencyStats = {
    totalHousegirls: agencyWorkers.length || 0,
    activeJobs: 0, // Will be calculated from job postings
    totalClients: agencyClients.length || 0,
    monthlyRevenue: agencyPayments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.created_at);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        return sum + (payment.agency_fee || 0);
      }
      return sum;
    }, 0),
    placementRate: agencyWorkers.length > 0 ? Math.round((agencyClients.filter(client => client.placement_status === 'active').length / agencyWorkers.length) * 100) : 0,
    averageRating: 4.5, // Default rating
    activePlacements: agencyClients.filter(client => client.placement_status === 'active').length || 0,
    pendingInterviews: agencyWorkers.filter(worker => worker.verification_status === 'pending').length || 0,
    thisMonthPlacements: agencyClients.filter(client => {
      const clientDate = new Date(client.hire_date);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return clientDate.getMonth() === currentMonth && clientDate.getFullYear() === currentYear;
    }).length || 0,
    thisMonthRevenue: agencyPayments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.created_at);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        return sum + (payment.amount || 0);
      }
      return sum;
    }, 0)
  };

  // Convert agency workers to housegirl format for display
  const recentHousegirls: Housegirl[] = agencyWorkers.slice(0, 3).map((worker, index) => ({
    id: worker.id,
    name: `Worker ${worker.id}`,
    age: 25 + index,
    location: 'Nairobi',
    experience: '3 years',
    education: 'Form 4 and Above',
    expectedSalary: 'KES 18,000',
    rating: 4.5 + (index * 0.1),
    status: worker.verification_status === 'verified' ? 'available' : 'interviewing',
    skills: worker.training_certificates || ['Cooking', 'Cleaning'],
    languages: ['English', 'Swahili'],
    photo: '/placeholder.svg',
    matchScore: 85 + (index * 5),
    earnings: 35000 + (index * 5000)
  }));

  // Real job opportunities from dashboard data
  const activeJobs: JobPosting[] = dashboardData?.available_data.job_postings?.slice(0, 3) || [];

  // Real clients from dashboard data
  const topClients: Client[] = agencyClients.slice(0, 3).map(client => ({
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone_number,
    location: client.location,
    status: client.placement_status,
    totalSpent: 0, // Will be calculated from payments
    lastContact: client.hire_date,
    photo: '/placeholder.svg',
    placements: 1,
    satisfaction: 4
  }));

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-700"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-56"
                />
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

            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="mb-4 flex flex-wrap gap-2 border border-slate-200 bg-white rounded-lg p-2">
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
              variant="outline"
              onClick={() => setActiveTab(tab.id as 'overview' | 'housegirls' | 'jobs' | 'clients' | 'placements' | 'analytics' | 'settings')}
              className={activeTab === tab.id ? 'bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900' : 'text-slate-700'}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          ))}
          <Button variant="outline" onClick={() => refreshData(false)} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="ml-auto" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        {lastUpdated && (
          <p className="mb-3 text-xs text-slate-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
        )}

        {/* Main Content */}
        <main>
          <Card className="mb-6 border border-blue-100 bg-blue-50">
            <CardContent className="p-4">
              <p className="text-sm text-blue-900">
                Agency features are coming soon. For now, ensure your profile is complete so you are ready when we launch agency tools.
              </p>
            </CardContent>
          </Card>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {dataLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Loading agency data...</span>
                </div>
              ) : (
                <>
                  {/* Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Total Housegirls</p>
                        <p className="text-3xl font-bold">{agencyStats.totalHousegirls}</p>
                        <p className="text-slate-500 text-xs">+{agencyStats.thisMonthPlacements} this month</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Active Placements</p>
                        <p className="text-3xl font-bold">{agencyStats.activePlacements}</p>
                        <p className="text-slate-500 text-xs">+{agencyStats.thisMonthPlacements} this month</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Monthly Revenue</p>
                        <p className="text-3xl font-bold">KES {agencyStats.monthlyRevenue.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">+{agencyStats.thisMonthRevenue.toLocaleString()} this month</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm font-medium">Placement Rate</p>
                        <p className="text-3xl font-bold">{agencyStats.placementRate}%</p>
                        <p className="text-slate-500 text-xs">{agencyStats.pendingInterviews} pending</p>
                      </div>
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Target className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('housegirls')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Housegirl
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('jobs')}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Create Job Posting
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('clients')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Add New Client
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      <span>Recent Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {agencyWorkers.length > 0 ? (
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-slate-600">New housegirl registered - {agencyWorkers[0]?.id}</span>
                        </div>
                        {agencyClients.length > 0 && (
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-slate-600">Placement completed - {agencyClients[0]?.id}</span>
                          </div>
                        )}
                        {agencyPayments.length > 0 && (
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm text-slate-600">New payment received - KES {agencyPayments[0]?.amount?.toLocaleString()}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No recent activity</p>
                        <p className="text-xs text-gray-400 mt-1">Start by adding housegirls and clients</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-slate-200 shadow-sm">
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
                        <div className="bg-slate-900 h-2 rounded-full" style={{ width: `${agencyStats.placementRate}%` }}></div>
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
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Housegirls</CardTitle>
                      <CardDescription>Latest registered housegirls and their status</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('housegirls')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentHousegirls.length > 0 ? (
                    <div className="space-y-4">
                      {recentHousegirls.map((housegirl) => (
                        <div key={housegirl.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 font-semibold">
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
                                     ) : (
                     <div className="text-center py-8">
                       <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                       <p className="text-gray-500">No housegirls registered with your agency yet</p>
                       <p className="text-xs text-gray-400 mt-1 mb-3">Housegirls need to sign up through your agency to appear here</p>
                       <Button 
                         variant="outline" 
                         className="mt-3"
                         onClick={() => setActiveTab('housegirls')}
                       >
                         Add Your First Housegirl
                       </Button>
                     </div>
                   )}
                </CardContent>
              </Card>

              {/* Active Jobs */}
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Job Postings</CardTitle>
                      <CardDescription>Current job opportunities and applications</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('jobs')}
                    >
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
                </>
              )}
            </div>
          )}

          {/* Housegirls Tab */}
          {activeTab === 'housegirls' && (
            <div className="space-y-6">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Housegirls Management</CardTitle>
                      <CardDescription>Manage your registered housegirls, track their placements, and monitor performance</CardDescription>
                    </div>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">
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
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Job Postings</CardTitle>
                      <CardDescription>Create and manage job postings, track applications, and match housegirls to clients</CardDescription>
                    </div>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">
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
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Client Management</CardTitle>
                      <CardDescription>Manage your client relationships, track their requirements, and maintain communication</CardDescription>
                    </div>
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white">
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
              <Card className="border border-slate-200 shadow-sm">
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
              <Card className="border border-slate-200 shadow-sm">
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
              <Card className="border border-slate-200 shadow-sm">
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
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-sm"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* WhatsApp Chat Modal */}
      {showWhatsApp && (
        <div className="fixed bottom-20 right-6 z-50">
          <Card className="w-80 border border-slate-200 shadow-sm">
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
