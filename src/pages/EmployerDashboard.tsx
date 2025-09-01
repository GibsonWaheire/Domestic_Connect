import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast'; 
import ProfileModal from '@/components/ProfileModal';

import Sidebar from '@/components/employer/Sidebar';
import DashboardHeader from '@/components/employer/DashboardHeader';
import HousegirlsOverview from '@/components/employer/HousegirlsOverview';
import CandidatesSection from '@/components/employer/CandidatesSection';
import JobPostingModal from '@/components/JobPostingModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Briefcase, 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageCircle, 
  Settings, 
  Bell, 
  Search,
  Calendar,
  Clock,
  Star,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info,
  MapPin,
  LogOut,
  Phone,
  CreditCard
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
  phone?: string;
  email?: string;
}

interface JobPosting {
  id: number;
  title: string;
  location: string;
  salary: string;
  status: 'active' | 'paused' | 'closed' | 'expired';
  applications: number;
  views: number;
  postedDate: string;
  expiryDate: string;
  jobType: string;
  accommodation: string;
}

interface Message {
  id: number;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  type: 'application' | 'inquiry' | 'system';
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
  timestamp: string;
  isRead: boolean;
}

const EmployerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [activeSection, setActiveSection] = useState<'overview' | 'jobs' | 'candidates' | 'messages' | 'analytics' | 'settings'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [selectedHousegirl, setSelectedHousegirl] = useState<Housegirl | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [housegirlToUnlock, setHousegirlToUnlock] = useState<Housegirl | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Mock data - in real app this would come from API
  const [jobPostings] = useState<JobPosting[]>([
    {
      id: 1,
      title: "Live-in House Help",
      location: "Westlands, Nairobi",
      salary: "KES 18,000",
      status: 'active',
      applications: 12,
      views: 45,
      postedDate: "2024-01-10",
      expiryDate: "2024-02-10",
      jobType: "Full Time",
      accommodation: "Provided"
    },
    {
      id: 2,
      title: "Part-time Cleaner",
      location: "Kilimani, Nairobi",
      salary: "KES 15,000",
      status: 'active',
      applications: 8,
      views: 32,
      postedDate: "2024-01-08",
      expiryDate: "2024-02-08",
      jobType: "Part Time",
      accommodation: "Not Provided"
    },
    {
      id: 3,
      title: "House Manager",
      location: "Karen, Nairobi",
      salary: "KES 25,000",
      status: 'paused',
      applications: 15,
      views: 67,
      postedDate: "2024-01-05",
      expiryDate: "2024-02-05",
      jobType: "Full Time",
      accommodation: "Provided"
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: 1,
      from: "Sarah Wanjiku",
      subject: "Application for Live-in House Help",
      preview: "I am very interested in your job posting and would love to discuss...",
      timestamp: "2 hours ago",
      isRead: false,
      type: 'application'
    },
    {
      id: 2,
      from: "Grace Akinyi",
      subject: "Interview Confirmation",
      preview: "Thank you for considering my application. I confirm my availability...",
      timestamp: "1 day ago",
      isRead: true,
      type: 'application'
    },
    {
      id: 3,
      from: "System",
      subject: "Job Posting Expiring Soon",
      preview: "Your job posting 'Live-in House Help' will expire in 3 days...",
      timestamp: "2 days ago",
      isRead: false,
      type: 'system'
    }
  ]);

  const [notifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Application Received",
      message: "Sarah Wanjiku applied for your Live-in House Help position",
      type: 'info',
      timestamp: "2 hours ago",
      isRead: false
    },
    {
      id: 2,
      title: "Job Posted Successfully",
      message: "Your job posting has been published and is now live",
      type: 'success',
      timestamp: "1 day ago",
      isRead: true
    },
    {
      id: 3,
      title: "Interview Scheduled",
      message: "Interview with Grace Akinyi scheduled for tomorrow at 2 PM",
      type: 'info',
      timestamp: "2 days ago",
      isRead: false
    }
  ]);

  // Dashboard stats
  const dashboardStats = {
    totalApplications: 24,
    activeJobs: jobPostings.filter(job => job.status === 'active').length,
    totalViews: jobPostings.reduce((sum, job) => sum + job.views, 0),
    unreadMessages: messages.filter(msg => !msg.isRead).length,
    unreadNotifications: notifications.filter(notif => !notif.isRead).length,
    hiringRate: 85,
    averageResponseTime: "2.5 hours"
  };

  // Handlers
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      toast({
        title: "Signed Out Successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/housegirls');
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostJob = () => {
    toast({
      title: "Opening Job Form",
      description: "Please fill in the details for your job posting.",
    });
    setShowJobPostingModal(true);
  };

  const handleViewProfile = (housegirl: Housegirl) => {
    toast({
      title: "Loading Profile",
      description: `Opening ${housegirl.name}'s profile...`,
    });
    setSelectedHousegirl(housegirl);
    setIsProfileModalOpen(true);
  };

  const handleJobAction = (jobId: number, action: 'edit' | 'pause' | 'delete') => {
    switch (action) {
      case 'edit':
        toast({
          title: "Edit Job",
          description: "Job editing feature coming soon!",
        });
        break;
      case 'pause':
        toast({
          title: "Job Paused",
          description: "Your job posting has been paused.",
        });
        break;
      case 'delete':
        toast({
          title: "Job Deleted",
          description: "Your job posting has been removed.",
        });
        break;
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data is being prepared for download.",
    });
  };

  const handleUnlockContact = (housegirl: Housegirl) => {
    if (housegirl.contactUnlocked) {
      // Contact already unlocked - show info
      const unlockMessage = housegirl.unlockCount > 1 
        ? `Contact unlocked by ${housegirl.unlockCount} other employers`
        : `Contact unlocked by ${housegirl.unlockCount} other employer`;
      
      toast({
        title: "Contact Already Unlocked",
        description: `${unlockMessage}. You can view contact details for free.`,
      });
    } else {
      // Show unlock modal
      setHousegirlToUnlock(housegirl);
      setShowUnlockModal(true);
    }
  };

  const confirmUnlockContact = async () => {
    if (!housegirlToUnlock) return;

    setIsUnlocking(true);
    
    try {
      // Simulate payment process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update housegirl data
      const updatedHousegirl = {
        ...housegirlToUnlock,
        contactUnlocked: true,
        unlockCount: housegirlToUnlock.unlockCount + 1,
        unlockedBy: [...housegirlToUnlock.unlockedBy, user.first_name],
        lastUnlocked: new Date().toLocaleDateString(),
        phone: "+254700123456", // Mock phone number
        email: `${housegirlToUnlock.name.toLowerCase().replace(' ', '.')}@example.com` // Mock email
      };

      // Update the housegirl in the list (in real app, this would update the database)
      // For now, we'll pass this updated data to the HousegirlsOverview component
      setSelectedHousegirl(updatedHousegirl);

      toast({
        title: "Contact Unlocked Successfully!",
        description: `You can now view ${housegirlToUnlock.name}'s contact details.`,
      });

      setShowUnlockModal(false);
      setHousegirlToUnlock(null);
    } catch (error) {
      toast({
        title: "Unlock Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUnlocking(false);
    }
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

  const renderOverviewSection = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-900">{dashboardStats.totalApplications}</p>
                <p className="text-xs text-blue-600">+12% from last month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-900">{dashboardStats.activeJobs}</p>
                <p className="text-xs text-green-600">Currently posted</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Views</p>
                <p className="text-2xl font-bold text-purple-900">{dashboardStats.totalViews}</p>
                <p className="text-xs text-purple-600">Job postings viewed</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Hiring Rate</p>
                <p className="text-2xl font-bold text-orange-900">{dashboardStats.hiringRate}%</p>
                <p className="text-xs text-orange-600">+5% from last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handlePostJob}
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-6 w-6" />
              <span>Post New Job</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setActiveSection('candidates')}
            >
              <Users className="h-6 w-6" />
              <span>View Candidates</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => setActiveSection('messages')}
            >
              <MessageCircle className="h-6 w-6" />
              <span>Check Messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
          <CardDescription>Latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full ${
                  notification.type === 'success' ? 'bg-green-100' :
                  notification.type === 'warning' ? 'bg-yellow-100' :
                  notification.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {notification.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                   notification.type === 'warning' ? <AlertCircle className="h-4 w-4 text-yellow-600" /> :
                   notification.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-600" /> :
                   <Info className="h-4 w-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Housegirls Overview */}
      <HousegirlsOverview 
        onViewProfile={handleViewProfile} 
        onUnlockContact={handleUnlockContact}
        selectedHousegirl={selectedHousegirl}
      />
    </div>
  );

  const renderJobsSection = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Postings</h2>
          <p className="text-gray-600">Manage your active and inactive job postings</p>
        </div>
        <Button onClick={handlePostJob} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search job postings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Job Postings List */}
      <div className="space-y-4">
        {jobPostings.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <Badge className={
                      job.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                      job.status === 'paused' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      job.status === 'closed' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.jobType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{job.applications} applications</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>{job.views} views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Posted: {job.postedDate}</span>
                    <span>Expires: {job.expiryDate}</span>
                    <span className="font-medium text-green-600">{job.salary}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJobAction(job.id, 'edit')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJobAction(job.id, 'pause')}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleJobAction(job.id, 'delete')}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {jobPostings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No job postings yet</h3>
            <p className="text-gray-600 mb-4">Create your first job posting to start attracting candidates</p>
            <Button onClick={handlePostJob} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderMessagesSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">Communicate with candidates and manage inquiries</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          {dashboardStats.unreadMessages} unread
        </Badge>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className={`hover:shadow-lg transition-shadow duration-200 ${
            !message.isRead ? 'border-blue-200 bg-blue-50' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{message.from}</h3>
                    <Badge className={
                      message.type === 'application' ? 'bg-green-100 text-green-800' :
                      message.type === 'inquiry' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                    </Badge>
                    {!message.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                  <p className="text-gray-600 text-sm mb-2">{message.preview}</p>
                  <p className="text-xs text-gray-500">{message.timestamp}</p>
                </div>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {messages.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">Messages from candidates will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAnalyticsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Track your hiring performance and insights</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900">Total Applications</h3>
            <p className="text-3xl font-bold text-blue-700">{dashboardStats.totalApplications}</p>
            <p className="text-sm text-blue-600">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900">Hiring Rate</h3>
            <p className="text-3xl font-bold text-green-700">{dashboardStats.hiringRate}%</p>
            <p className="text-sm text-green-600">+5% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-purple-900">Avg Response Time</h3>
            <p className="text-3xl font-bold text-purple-700">{dashboardStats.averageResponseTime}</p>
            <p className="text-sm text-purple-600">To candidate inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Performance Metrics</CardTitle>
          <CardDescription>Detailed insights and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Application Sources</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Direct Applications</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Search Results</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Referrals</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Top Performing Jobs</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Live-in House Help</span>
                    <span className="font-medium">12 applications</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">House Manager</span>
                    <span className="font-medium">15 applications</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Part-time Cleaner</span>
                    <span className="font-medium">8 applications</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose what notifications you receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Applications</p>
                <p className="text-sm text-gray-600">Get notified when someone applies</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Message Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts for new messages</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Job Expiry Reminders</p>
                <p className="text-sm text-gray-600">Get notified before jobs expire</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export My Data
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={(section: string) => setActiveSection(section as 'overview' | 'jobs' | 'candidates' | 'messages' | 'analytics' | 'settings')}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSignOut={handleSignOut}
        userFirstName={user.first_name}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <DashboardHeader
          activeSection={activeSection}
          onNavigateHome={() => navigate('/home')}
        />

        {/* Content */}
        <div className="px-6 py-6">
          {activeSection === 'overview' && renderOverviewSection()}
          {activeSection === 'jobs' && renderJobsSection()}
          {activeSection === 'candidates' && (
            <CandidatesSection
              onViewProfile={handleViewProfile}
              onContact={(application) => {
                toast({
                  title: "Contact Feature",
                  description: "Contact functionality coming soon!",
                });
              }}
            />
          )}
          {activeSection === 'messages' && renderMessagesSection()}
          {activeSection === 'analytics' && renderAnalyticsSection()}
          {activeSection === 'settings' && renderSettingsSection()}
        </div>
      </div>

      {/* Modals */}
      <JobPostingModal
        isOpen={showJobPostingModal}
        onClose={() => setShowJobPostingModal(false)}
        user={user}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedHousegirl(null);
        }}
        housegirl={selectedHousegirl}
      />

      {/* Contact Unlock Modal */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Unlock Contact Details
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unlock {housegirlToUnlock?.name}'s Contact
              </h3>
              <p className="text-gray-600">
                Get access to phone number and email address
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Unlock Fee: KES 200</p>
                  <p className="text-sm text-blue-700">
                    Payment will be processed via M-Pesa
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowUnlockModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmUnlockContact}
                disabled={isUnlocking}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isUnlocking ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Pay KES 200</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployerDashboard;
