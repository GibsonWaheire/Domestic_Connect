import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Briefcase, Users, MessageCircle, BarChart3, Settings, 
  Search, Plus, Eye, Edit, Trash2, Phone, CreditCard,
  CheckCircle, TrendingUp, MapPin, Clock, Star, LogOut
} from 'lucide-react';

// Types
interface Housegirl {
  id: number;
  name: string;
  age: number;
  location: string;
  experience: string;
  salary: string;
  status: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  reviews?: number;
  contactUnlocked: boolean;
  unlockCount: number;
  phone?: string;
  email?: string;
}

interface JobPosting {
  id: number;
  title: string;
  location: string;
  salary: string;
  status: 'active' | 'paused' | 'closed';
  applications: number;
  views: number;
  postedDate: string;
}

interface Message {
  id: number;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
}

// Navigation items
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'blue' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, color: 'green' },
  { id: 'candidates', label: 'Candidates', icon: Users, color: 'purple' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, color: 'indigo' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' }
];

const EmployerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedHousegirl, setSelectedHousegirl] = useState<Housegirl | null>(null);
  const [housegirlToUnlock, setHousegirlToUnlock] = useState<Housegirl | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Mock data
  const [housegirls] = useState<Housegirl[]>([
    {
      id: 1, name: "Sarah Wanjiku", age: 28, location: "Westlands, Nairobi",
      experience: "5 years", salary: "KES 18,000", status: "Available",
      bio: "Experienced house help with excellent cooking skills.",
      skills: ["Cooking", "Cleaning", "Childcare"], rating: 4.8, reviews: 12,
      contactUnlocked: true, unlockCount: 3, phone: "+254700123456", email: "sarah.wanjiku@example.com"
    },
    {
      id: 2, name: "Grace Akinyi", age: 32, location: "Kilimani, Nairobi",
      experience: "8 years", salary: "KES 22,000", status: "Available",
      bio: "Professional house manager with extensive experience.",
      skills: ["House Management", "Cooking", "Cleaning"], rating: 4.9, reviews: 18,
      contactUnlocked: false, unlockCount: 0
    },
    {
      id: 3, name: "Mary Muthoni", age: 25, location: "Lavington, Nairobi",
      experience: "3 years", salary: "KES 15,000", status: "Available",
      bio: "Young and energetic house help. Great with children.",
      skills: ["Cleaning", "Childcare", "Pet Care"], rating: 4.5, reviews: 8,
      contactUnlocked: true, unlockCount: 1, phone: "+254700789012", email: "mary.muthoni@example.com"
    }
  ]);

  const [jobs] = useState<JobPosting[]>([
    { id: 1, title: "Live-in House Help", location: "Westlands", salary: "KES 18,000", 
      status: 'active', applications: 12, views: 45, postedDate: "2024-01-10" },
    { id: 2, title: "Part-time Cleaner", location: "Kilimani", salary: "KES 15,000", 
      status: 'active', applications: 8, views: 32, postedDate: "2024-01-08" },
    { id: 3, title: "House Manager", location: "Karen", salary: "KES 25,000", 
      status: 'paused', applications: 15, views: 67, postedDate: "2024-01-05" }
  ]);

  const [messages] = useState<Message[]>([
    { id: 1, from: "Sarah Wanjiku", subject: "Application for Live-in House Help", 
      preview: "I am very interested in your job posting...", timestamp: "2 hours ago", isRead: false },
    { id: 2, from: "Grace Akinyi", subject: "Interview Confirmation", 
      preview: "Thank you for considering my application...", timestamp: "1 day ago", isRead: true }
  ]);

  // Stats
  const stats = {
    totalApplications: 24,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalViews: jobs.reduce((sum, j) => sum + j.views, 0),
    unreadMessages: messages.filter(m => !m.isRead).length,
    hiringRate: 85
  };

  // Handlers
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed Out", description: "You have been logged out." });
      navigate('/housegirls');
    } catch (error) {
      toast({ title: "Error", description: "Sign out failed.", variant: "destructive" });
    }
  };

  const handleUnlockContact = (housegirl: Housegirl) => {
    if (housegirl.contactUnlocked) {
      toast({ 
        title: "Contact Unlocked", 
        description: `Already unlocked by ${housegirl.unlockCount} employer${housegirl.unlockCount > 1 ? 's' : ''}.` 
      });
    } else {
      setHousegirlToUnlock(housegirl);
      setShowUnlockModal(true);
    }
  };

  const confirmUnlock = async () => {
    if (!housegirlToUnlock) return;
    setIsUnlocking(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedHousegirl = {
        ...housegirlToUnlock,
        contactUnlocked: true,
        unlockCount: housegirlToUnlock.unlockCount + 1,
        phone: "+254700123456",
        email: `${housegirlToUnlock.name.toLowerCase().replace(' ', '.')}@example.com`
      };
      
      setSelectedHousegirl(updatedHousegirl);
      toast({ title: "Success!", description: "Contact unlocked successfully." });
      setShowUnlockModal(false);
      setHousegirlToUnlock(null);
    } catch (error) {
      toast({ title: "Error", description: "Unlock failed.", variant: "destructive" });
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Render sections
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{stats.totalApplications}</p>
            <p className="text-sm text-blue-600">Applications</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{stats.activeJobs}</p>
            <p className="text-sm text-green-600">Active Jobs</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{stats.totalViews}</p>
            <p className="text-sm text-purple-600">Total Views</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-900">{stats.hiringRate}%</p>
            <p className="text-sm text-orange-600">Hiring Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => setShowJobModal(true)} className="h-16">
              <Plus className="h-5 w-5 mr-2" />
              Post Job
            </Button>
            <Button variant="outline" onClick={() => setActiveSection('candidates')} className="h-16">
              <Users className="h-5 w-5 mr-2" />
              View Candidates
            </Button>
            <Button variant="outline" onClick={() => setActiveSection('messages')} className="h-16">
              <MessageCircle className="h-5 w-5 mr-2" />
              Check Messages
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Housegirls */}
      <Card>
        <CardHeader>
          <CardTitle>Available Housegirls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {housegirls.map(housegirl => (
              <Card key={housegirl.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{housegirl.name}</h3>
                      <p className="text-sm text-gray-600">{housegirl.age} years • {housegirl.location}</p>
                    </div>
                    <Badge className={housegirl.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {housegirl.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{housegirl.bio}</p>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{housegirl.rating} ({housegirl.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-600">{housegirl.salary}</span>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedHousegirl(housegirl)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      {housegirl.contactUnlocked ? (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Unlocked
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleUnlockContact(housegirl)}>
                          <Phone className="h-3 w-3 mr-1" />
                          Unlock
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {housegirl.contactUnlocked && housegirl.unlockCount > 0 && (
                    <Badge className="mt-2 bg-blue-100 text-blue-800 text-xs">
                      {housegirl.unlockCount} unlock{housegirl.unlockCount > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderJobs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Job Postings</h2>
          <p className="text-gray-600">Manage your job postings</p>
        </div>
        <Button onClick={() => setShowJobModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Post Job
        </Button>
      </div>

      <div className="space-y-4">
        {jobs.map(job => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {job.applications} applications
                    </span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {job.views} views
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={
                    job.status === 'active' ? 'bg-green-100 text-green-800' :
                    job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {job.status}
                  </Badge>
                  <span className="font-medium text-green-600">{job.salary}</span>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCandidates = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Candidates</h2>
        <p className="text-gray-600">Review job applications</p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">Job applications will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-gray-600">Communicate with candidates</p>
        </div>
        <Badge variant="secondary">
          {stats.unreadMessages} unread
        </Badge>
      </div>

      <div className="space-y-4">
        {messages.map(message => (
          <Card key={message.id} className={`hover:shadow-md transition-shadow ${!message.isRead ? 'border-blue-200 bg-blue-50' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{message.from}</h3>
                  <h4 className="font-medium text-gray-900">{message.subject}</h4>
                  <p className="text-sm text-gray-600 mt-1">{message.preview}</p>
                  <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
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
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600">Manage your account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <p className="text-gray-900">{user.first_name} {user.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <Button variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-lg font-bold">Domestic Connect</h1>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '→' : '←'}
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all ${
                activeSection === item.id
                  ? `bg-${item.color}-50 border border-${item.color}-200 text-${item.color}-700`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{user.first_name.charAt(0)}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium">{user.first_name}</p>
                <p className="text-xs text-gray-500">Employer</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeSection}</h2>
            <p className="text-gray-600">
              {activeSection === 'overview' && 'Welcome back! Here\'s your dashboard overview'}
              {activeSection === 'jobs' && 'Manage your job postings and applications'}
              {activeSection === 'candidates' && 'Browse and connect with qualified housegirls'}
              {activeSection === 'messages' && 'Communicate with candidates and applicants'}
              {activeSection === 'settings' && 'Manage your account and preferences'}
            </p>
          </div>
        </header>

        <div className="px-6 py-6">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'jobs' && renderJobs()}
          {activeSection === 'candidates' && renderCandidates()}
          {activeSection === 'messages' && renderMessages()}
          {activeSection === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Unlock Contact Details</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center mb-6">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Unlock {housegirlToUnlock?.name}'s Contact</h3>
              <p className="text-gray-600">Get access to phone number and email</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Unlock Fee: KES 200</p>
                  <p className="text-sm text-blue-700">Payment via M-Pesa</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowUnlockModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmUnlock} disabled={isUnlocking} className="flex-1">
                {isUnlocking ? 'Processing...' : 'Pay KES 200'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      {selectedHousegirl && (
        <Dialog open={!!selectedHousegirl} onOpenChange={() => setSelectedHousegirl(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedHousegirl.name}'s Profile</DialogTitle>
            </DialogHeader>
            <div className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Basic Info</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Age:</span> {selectedHousegirl.age} years</p>
                    <p><span className="font-medium">Location:</span> {selectedHousegirl.location}</p>
                    <p><span className="font-medium">Experience:</span> {selectedHousegirl.experience}</p>
                    <p><span className="font-medium">Salary:</span> {selectedHousegirl.salary}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedHousegirl.skills?.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
              </div>
              {selectedHousegirl.bio && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Bio</h3>
                  <p className="text-gray-600">{selectedHousegirl.bio}</p>
                </div>
              )}
              {selectedHousegirl.contactUnlocked && (selectedHousegirl.phone || selectedHousegirl.email) && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Contact Details</h3>
                  <div className="space-y-2">
                    {selectedHousegirl.phone && (
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-green-600" />
                        {selectedHousegirl.phone}
                      </p>
                    )}
                    {selectedHousegirl.email && (
                      <p className="flex items-center">
                        <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                        {selectedHousegirl.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmployerDashboard;
