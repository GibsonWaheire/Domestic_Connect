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
  CheckCircle, TrendingUp, MapPin, Clock, Star, LogOut,
  Filter, Bell, Calendar, Heart, Share2, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Target, Award, Zap,
  Info, FileText, Shield
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
  nationality: string;
  community: string;
  education: string;
  workType: string;
  livingArrangement: string;
  profileImage?: string;
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
  { id: 'housegirls', label: 'Housegirls', icon: Users, color: 'purple' },
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedAgeRange, setSelectedAgeRange] = useState('');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState('');
  const [selectedEducation, setSelectedEducation] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedLivingArrangement, setSelectedLivingArrangement] = useState('');
  const [showDayBugAd, setShowDayBugAd] = useState(false);

  // Mock data
  const [housegirls] = useState<Housegirl[]>([
    {
      id: 1, name: "Sarah Wanjiku", age: 28, location: "Westlands, Nairobi",
      experience: "5 years", salary: "KES 18,000", status: "Available",
      bio: "Experienced house help with excellent cooking skills.",
      skills: ["Cooking", "Cleaning", "Childcare"], rating: 4.8, reviews: 12,
      contactUnlocked: true, unlockCount: 3, phone: "+254700123456", email: "sarah.wanjiku@example.com",
      nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2, name: "Grace Akinyi", age: 32, location: "Kilimani, Nairobi",
      experience: "8 years", salary: "KES 22,000", status: "Available",
      bio: "Professional house manager with extensive experience.",
      skills: ["House Management", "Cooking", "Cleaning"], rating: 4.9, reviews: 18,
      contactUnlocked: false, unlockCount: 0,
      nationality: "Kenya", community: "Luo", education: "Form 4 and Above", workType: "Day job", livingArrangement: "Live-out",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3, name: "Mary Muthoni", age: 25, location: "Lavington, Nairobi",
      experience: "3 years", salary: "KES 15,000", status: "Available",
      bio: "Young and energetic house help. Great with children.",
      skills: ["Cleaning", "Childcare", "Pet Care"], rating: 4.5, reviews: 8,
      contactUnlocked: true, unlockCount: 1, phone: "+254700789012", email: "mary.muthoni@example.com",
      nationality: "Kenya", community: "Kikuyu", education: "Class 8 and Above", workType: "Lives in", livingArrangement: "Live-in",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4, name: "Jane Njeri", age: 35, location: "Karen, Nairobi",
      experience: "10 years", salary: "KES 25,000", status: "Available",
      bio: "Senior house manager with excellent organizational skills.",
      skills: ["House Management", "Cooking", "Childcare", "Gardening"], rating: 4.9, reviews: 25,
      contactUnlocked: false, unlockCount: 0,
      nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 5, name: "Faith Wambui", age: 27, location: "Muthaiga, Nairobi",
      experience: "4 years", salary: "KES 20,000", status: "Available",
      bio: "Reliable and hardworking house help with cooking expertise.",
      skills: ["Cooking", "Cleaning", "Laundry"], rating: 4.7, reviews: 15,
      contactUnlocked: true, unlockCount: 2, phone: "+254700123458", email: "faith.wambui@example.com",
      nationality: "Kenya", community: "Kamba", education: "Form 4 and Above", workType: "Day job", livingArrangement: "Live-out",
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 6, name: "Lucy Wangari", age: 30, location: "Runda, Nairobi",
      experience: "6 years", salary: "KES 21,000", status: "Available",
      bio: "Experienced house help specializing in childcare and cooking.",
      skills: ["Childcare", "Cooking", "Cleaning"], rating: 4.8, reviews: 20,
      contactUnlocked: false, unlockCount: 0,
      nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
      profileImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 7, name: "Esther Nyambura", age: 26, location: "Spring Valley, Nairobi",
      experience: "3 years", salary: "KES 16,000", status: "Available",
      bio: "Young and energetic house help with good communication skills.",
      skills: ["Cleaning", "Laundry", "Childcare"], rating: 4.5, reviews: 10,
      contactUnlocked: true, unlockCount: 1, phone: "+254700123459", email: "esther.nyambura@example.com",
      nationality: "Kenya", community: "Kikuyu", education: "Class 8 and Above", workType: "Part-time", livingArrangement: "Live-out",
      profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 8, name: "Ruth Kamau", age: 33, location: "Gigiri, Nairobi",
      experience: "7 years", salary: "KES 23,000", status: "Available",
      bio: "Professional house manager with excellent multitasking abilities.",
      skills: ["House Management", "Cooking", "Cleaning", "Childcare"], rating: 4.9, reviews: 22,
      contactUnlocked: false, unlockCount: 0,
      nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 9, name: "Ann Wanjiru", age: 29, location: "Brookside, Nairobi",
      experience: "5 years", salary: "KES 19,000", status: "Available",
      bio: "Reliable house help with strong work ethic and attention to detail.",
      skills: ["Cooking", "Cleaning", "Laundry"], rating: 4.7, reviews: 16,
      contactUnlocked: true, unlockCount: 3, phone: "+254700123460", email: "ann.wanjiru@example.com",
      nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
      profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 10, name: "Dorcas Mwangi", age: 31, location: "Kileleshwa, Nairobi",
      experience: "6 years", salary: "KES 20,000", status: "Available",
      bio: "Experienced house help with excellent cooking and childcare skills.",
      skills: ["Cooking", "Childcare", "Cleaning"], rating: 4.8, reviews: 19,
      contactUnlocked: false, unlockCount: 0,
      nationality: "Kenya", community: "Luhya", education: "Form 4 and Above", workType: "Day job", livingArrangement: "Live-out",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 11, name: "Mercy Kiprop", age: 24, location: "Loresho, Nairobi",
      experience: "2 years", salary: "KES 14,000", status: "Available",
      bio: "Young and enthusiastic house help eager to learn and grow.",
      skills: ["Cleaning", "Laundry", "Basic Cooking"], rating: 4.4, reviews: 6,
      contactUnlocked: true, unlockCount: 1, phone: "+254700123461", email: "mercy.kiprop@example.com",
      nationality: "Kenya", community: "Kalenjin", education: "Class 8 and Above", workType: "Part-time", livingArrangement: "Live-out",
      profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 12, name: "Hannah Njoroge", age: 34, location: "Rosslyn, Nairobi",
      experience: "9 years", salary: "KES 24,000", status: "Available",
      bio: "Senior house manager with extensive experience in large households.",
      skills: ["House Management", "Cooking", "Childcare", "Gardening"], rating: 4.9, reviews: 28,
      contactUnlocked: false, unlockCount: 0,
      nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
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

  // Enhanced mock data
  const [notifications] = useState([
    { id: 1, type: 'application', message: 'New application from Sarah Wanjiku', time: '2 min ago', read: false },
    { id: 2, type: 'message', message: 'Grace Akinyi replied to your message', time: '5 min ago', read: false },
    { id: 3, type: 'system', message: 'Job posting expires in 2 days', time: '1 hour ago', read: true }
  ]);

  // Filtered housegirls based on search and filters
  const filteredHousegirls = housegirls.filter(housegirl => {
    const matchesSearch = 
      housegirl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      housegirl.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      housegirl.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCommunity = !selectedCommunity || housegirl.community === selectedCommunity;
    
    const matchesAge = !selectedAgeRange ||
      (selectedAgeRange === '18-25' && housegirl.age >= 18 && housegirl.age <= 25) ||
      (selectedAgeRange === '26-35' && housegirl.age >= 26 && housegirl.age <= 35) ||
      (selectedAgeRange === '36+' && housegirl.age >= 36);
    
    const matchesSalary = !selectedSalaryRange ||
      (selectedSalaryRange === '10k-15k' && parseInt(housegirl.salary.replace(/[^\d]/g, '')) >= 10000 && parseInt(housegirl.salary.replace(/[^\d]/g, '')) <= 15000) ||
      (selectedSalaryRange === '16k-20k' && parseInt(housegirl.salary.replace(/[^\d]/g, '')) >= 16000 && parseInt(housegirl.salary.replace(/[^\d]/g, '')) <= 20000) ||
      (selectedSalaryRange === '21k-25k' && parseInt(housegirl.salary.replace(/[^\d]/g, '')) >= 21000 && parseInt(housegirl.salary.replace(/[^\d]/g, '')) <= 25000) ||
      (selectedSalaryRange === '25k+' && parseInt(housegirl.salary.replace(/[^\d]/g, '')) > 25000);
    
    const matchesEducation = !selectedEducation || housegirl.education === selectedEducation;
    const matchesWorkType = !selectedWorkType || housegirl.workType === selectedWorkType;
    
    const matchesExperience = !selectedExperience ||
      (selectedExperience === '0-2' && parseInt(housegirl.experience) >= 0 && parseInt(housegirl.experience) <= 2) ||
      (selectedExperience === '3-5' && parseInt(housegirl.experience) >= 3 && parseInt(housegirl.experience) <= 5) ||
      (selectedExperience === '6-10' && parseInt(housegirl.experience) >= 6 && parseInt(housegirl.experience) <= 10) ||
      (selectedExperience === '10+' && parseInt(housegirl.experience) >= 10);
    
    const matchesLivingArrangement = !selectedLivingArrangement || housegirl.livingArrangement === selectedLivingArrangement;
    
    return matchesSearch && matchesCommunity && matchesAge && matchesSalary && 
           matchesEducation && matchesWorkType && matchesExperience && matchesLivingArrangement;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHousegirls.length / itemsPerPage);
  const paginatedHousegirls = filteredHousegirls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Stats
  const stats = {
    totalApplications: 24,
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalViews: jobs.reduce((sum, j) => sum + j.views, 0),
    unreadMessages: messages.filter(m => !m.isRead).length,
    hiringRate: 85,
    monthlyGrowth: 12,
    responseTime: '2.5h',
    topLocation: 'Westlands'
  };

  // Handlers
  const handleViewProfile = (housegirl: Housegirl) => {
    setSelectedHousegirl(housegirl);
    toast({ 
      title: "Profile Opened", 
      description: `Viewing ${housegirl.name}'s profile. ${housegirl.contactUnlocked ? 'Contact details are available.' : 'Unlock contact to get phone and email.'}`,
      variant: "default"
    });
  };

  const handlePostJob = () => {
    toast({ 
      title: "Job Posting Feature", 
      description: "Job posting functionality is coming soon! For now, you can browse available housegirls.",
      variant: "default"
    });
  };

  const handleViewAllCandidates = () => {
    setActiveSection('housegirls');
    toast({ 
      title: "Housegirls Section", 
      description: "Browsing all available housegirls. Use filters to find your perfect match.",
      variant: "default"
    });
  };

  const handleCheckMessages = () => {
    setActiveSection('messages');
    toast({ 
      title: "Messages Section", 
      description: `You have ${stats.unreadMessages} unread message${stats.unreadMessages !== 1 ? 's' : ''}.`,
      variant: "default"
    });
  };

  const handleSignOut = async () => {
    try {
    await signOut();
      toast({ 
        title: "Signed Out Successfully", 
        description: "You have been logged out of your account. Come back soon!",
        variant: "default"
      });
    navigate('/housegirls');
    } catch (error) {
      toast({ 
        title: "Sign Out Failed", 
        description: "Please try again. If the problem persists, refresh the page.",
        variant: "destructive" 
      });
    }
  };

  const handleUnlockContact = (housegirl: Housegirl) => {
    if (housegirl.contactUnlocked) {
      toast({ 
        title: "Contact Already Unlocked", 
        description: `This contact has been unlocked ${housegirl.unlockCount} time${housegirl.unlockCount > 1 ? 's' : ''} by other employers. You can view it for free!`,
        variant: "default"
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
      toast({ 
        title: "Contact Unlocked Successfully!", 
        description: `You can now contact ${housegirlToUnlock.name}. This contact has been unlocked ${updatedHousegirl.unlockCount} time${updatedHousegirl.unlockCount > 1 ? 's' : ''} total.`,
        variant: "default"
      });
      setShowUnlockModal(false);
      setHousegirlToUnlock(null);
    } catch (error) {
      toast({ 
        title: "Unlock Failed", 
        description: "Please try again. If the problem persists, contact support.",
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

    // Render sections
    const renderOverview = () => (
    <div className="space-y-6">
      {/* Available Housegirls Count */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available Housegirls</h2>
              <p className="text-lg font-semibold text-pink-600">{filteredHousegirls.length} housegirls available</p>
              <p className="text-sm text-gray-600">Find your perfect match from our qualified candidates</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center space-x-2">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Advanced Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Community</label>
              <select 
                value={selectedCommunity} 
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300"
              >
                <option value="">All Communities</option>
                <option value="Kikuyu">Kikuyu</option>
                <option value="Luo">Luo</option>
                <option value="Kamba">Kamba</option>
                <option value="Luhya">Luhya</option>
                <option value="Kalenjin">Kalenjin</option>
                <option value="Meru">Meru</option>
                <option value="Kisii">Kisii</option>
                <option value="Taita">Taita</option>
                <option value="Mijikenda">Mijikenda</option>
                <option value="Pokot">Pokot</option>
                <option value="Turkana">Turkana</option>
                <option value="Samburu">Samburu</option>
                <option value="Maasai">Maasai</option>
                <option value="Embu">Embu</option>
                <option value="Tharaka">Tharaka</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Education Level</label>
              <select 
                value={selectedEducation} 
                onChange={(e) => setSelectedEducation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300"
              >
                <option value="">All Education Levels</option>
                <option value="Class 8 and Above">Class 8 and Above</option>
                <option value="Form 4 and Above">Form 4 and Above</option>
                <option value="University">University</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Work Type</label>
              <select 
                value={selectedWorkType} 
                onChange={(e) => setSelectedWorkType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300"
              >
                <option value="">All Work Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Lives in">Lives in</option>
                <option value="Day job">Day job</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Age Range</label>
              <select 
                value={selectedAgeRange} 
                onChange={(e) => setSelectedAgeRange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300"
              >
                <option value="">All Ages</option>
                <option value="18-25">18-25 years</option>
                <option value="26-35">26-35 years</option>
                <option value="36+">36+ years</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Salary Range</label>
              <select 
                value={selectedSalaryRange} 
                onChange={(e) => setSelectedSalaryRange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300"
              >
                <option value="">All Salaries</option>
                <option value="10k-15k">KES 10k-15k</option>
                <option value="16k-20k">KES 16k-20k</option>
                <option value="21k-25k">KES 21k-25k</option>
                <option value="25k+">KES 25k+</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Experience</label>
              <select 
                value={selectedExperience} 
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300"
              >
                <option value="">All Experience Levels</option>
                <option value="0-2">0-2 years</option>
                <option value="3-5">3-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Living Arrangement</label>
              <select 
                value={selectedLivingArrangement} 
                onChange={(e) => setSelectedLivingArrangement(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white/50 backdrop-blur-sm focus:border-blue-300 focus:ring-blue-300"
              >
                <option value="">All Arrangements</option>
                <option value="Live-in">Live-in</option>
                <option value="Live-out">Live-out</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredHousegirls.length} of {housegirls.length} housegirls
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedCommunity('');
                setSelectedAgeRange('');
                setSelectedSalaryRange('');
                setSelectedEducation('');
                setSelectedWorkType('');
                setSelectedExperience('');
                setSelectedLivingArrangement('');
                setSearchTerm('');
                setCurrentPage(1);
                toast({ 
                  title: "Filters Cleared", 
                  description: "All filters have been reset to show all housegirls.",
                  variant: "default"
                });
              }}
              className="hover:bg-gray-50 backdrop-blur-sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset All Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Housegirls */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center space-x-2">
            <Users className="h-6 w-6 text-pink-500" />
            <span>HOUSEGIRLS AVAILABLE</span>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Search housegirls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredHousegirls.length === 0 ? (
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Housegirls Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find more housegirls</p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCommunity('');
                    setSelectedAgeRange('');
                    setSelectedSalaryRange('');
                    setSelectedEducation('');
                    setSelectedWorkType('');
                    setSelectedExperience('');
                    setSelectedLivingArrangement('');
                    setCurrentPage(1);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Visual Card Grid - Like competitor's design */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedHousegirls.map(housegirl => (
                  <Card key={housegirl.id} className="group relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="relative p-6">
                      {/* Header with photo and status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            {housegirl.profileImage ? (
                              <img 
                                src={housegirl.profileImage} 
                                alt={housegirl.name}
                                className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">{housegirl.name.charAt(0)}</span>
                              </div>
                            )}
                            {housegirl.contactUnlocked && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{housegirl.name}</h3>
                            <Badge className="bg-pink-100 text-pink-800 text-xs font-medium">
                              AVAILABLE
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </Button>
                      </div>

                      {/* Key Details Grid - Like competitor's layout */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">💰</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Salary</p>
                            <p className="font-bold text-green-600">{housegirl.salary}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-sm">🏢</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Nationality</p>
                            <p className="font-medium text-gray-900">{housegirl.nationality}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 text-sm">👥</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Community</p>
                            <p className="font-medium text-gray-900">{housegirl.community}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-sm">📅</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Age</p>
                            <p className="font-medium text-gray-900">{housegirl.age} Years Old</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 text-sm">🛏️</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Living</p>
                            <p className="font-medium text-gray-900">{housegirl.livingArrangement}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 text-sm">📍</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="font-medium text-gray-900">{housegirl.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-sm">☀️</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Experience</p>
                            <p className="font-medium text-gray-900">{housegirl.experience}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-600 text-sm">🎓</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Education</p>
                            <p className="font-medium text-gray-900 text-xs">{housegirl.education}</p>
                          </div>
                        </div>
                      </div>

                      {/* Rating and Reviews */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="font-medium">{housegirl.rating}</span>
                            <span className="text-xs text-gray-500">({housegirl.reviews} reviews)</span>
                          </div>
                        </div>
                        {housegirl.contactUnlocked && housegirl.unlockCount > 0 && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            🔓 Unlocked {housegirl.unlockCount} time{housegirl.unlockCount > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons - Like competitor's design */}
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleViewProfile(housegirl)}
                          className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        {housegirl.contactUnlocked ? (
                          <Button 
                            size="sm" 
                            onClick={() => {
                              toast({ 
                                title: "Contact Available", 
                                description: `You can contact ${housegirl.name} at ${housegirl.phone || 'phone number'} or ${housegirl.email || 'email'}`,
                                variant: "default"
                              });
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Unlocked
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleUnlockContact(housegirl)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Unlock
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredHousegirls.length)} of {filteredHousegirls.length} housegirls
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className="w-8 h-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && (
                        <span className="text-gray-500">...</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
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
        <Button 
          onClick={handlePostJob}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Job Postings Yet</h3>
            <p className="text-gray-600 mb-6">Create your first job posting to start attracting qualified housegirls</p>
            <Button 
              onClick={handlePostJob}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <Card key={job.id} className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-blue-600" />
                        {job.location}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-green-600" />
                        {job.applications} applications
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1 text-purple-600" />
                        {job.views} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={
                      job.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                      job.status === 'paused' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }>
                      {job.status}
                    </Badge>
                    <span className="font-bold text-green-600 text-lg">{job.salary}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({ 
                          title: "Edit Job", 
                          description: "Job editing feature is coming soon!",
                          variant: "default"
                        });
                      }}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      )}
    </div>
  );

    const renderHousegirls = () => (
    <div className="space-y-6">
      {/* Quick Filter Bar - Like competitor's design */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedCommunity('')}
              className={`text-xs ${!selectedCommunity ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              All Communities
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedAgeRange('')}
              className={`text-xs ${!selectedAgeRange ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              All Ages
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedSalaryRange('')}
              className={`text-xs ${!selectedSalaryRange ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              All Salaries
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedEducation('')}
              className={`text-xs ${!selectedEducation ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              All Education
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSelectedWorkType('')}
              className={`text-xs ${!selectedWorkType ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'}`}
            >
              All Work Types
            </Button>
            <div className="flex-1"></div>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCommunity('');
                setSelectedAgeRange('');
                setSelectedSalaryRange('');
                setSelectedEducation('');
                setSelectedWorkType('');
                setSearchTerm('');
                setCurrentPage(1);
                toast({ 
                  title: "Filters Reset", 
                  description: "All filters have been cleared.",
                  variant: "default"
                });
              }}
              className="text-xs hover:bg-gray-50"
            >
              <Filter className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header with search and advanced filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Users className="h-6 w-6 text-pink-500" />
            <span>HOUSEGIRLS AVAILABLE</span>
          </h2>
          <p className="text-gray-600">Browse and connect with qualified housegirls</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search housegirls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300 w-64"
            />
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              toast({ 
                title: "Advanced Filters", 
                description: "Advanced filtering options are coming soon!",
                variant: "default"
              });
            }}
            className="hover:bg-gray-50 backdrop-blur-sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredHousegirls.length} of {housegirls.length} housegirls
      </div>

      {paginatedHousegirls.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Housegirls Found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find more housegirls</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCommunity('');
                setSelectedAgeRange('');
                setSelectedSalaryRange('');
                setSelectedEducation('');
                setSelectedWorkType('');
                setCurrentPage(1);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Visual Card Grid - Like competitor's design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedHousegirls.map(housegirl => (
              <Card key={housegirl.id} className="group relative overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="relative p-6">
                  {/* Header with photo and status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {housegirl.profileImage ? (
                          <img 
                            src={housegirl.profileImage} 
                            alt={housegirl.name}
                            className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-white"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">{housegirl.name.charAt(0)}</span>
                          </div>
                        )}
                        {housegirl.contactUnlocked && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{housegirl.name}</h3>
                        <Badge className="bg-pink-100 text-pink-800 text-xs font-medium">
                          AVAILABLE
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                  </div>

                  {/* Key Details Grid - Like competitor's layout */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm">💰</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Salary</p>
                        <p className="font-bold text-green-600">{housegirl.salary}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-sm">🏢</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Nationality</p>
                        <p className="font-medium text-gray-900">{housegirl.nationality}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 text-sm">👥</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Community</p>
                        <p className="font-medium text-gray-900">{housegirl.community}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-sm">📅</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Age</p>
                        <p className="font-medium text-gray-900">{housegirl.age} Years Old</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 text-sm">🛏️</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Living</p>
                        <p className="font-medium text-gray-900">{housegirl.livingArrangement}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-sm">📍</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">{housegirl.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-sm">☀️</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="font-medium text-gray-900">{housegirl.experience}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <span className="text-teal-600 text-sm">🎓</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Education</p>
                        <p className="font-medium text-gray-900 text-xs">{housegirl.education}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{housegirl.rating}</span>
                        <span className="text-xs text-gray-500">({housegirl.reviews} reviews)</span>
                      </div>
                    </div>
                    {housegirl.contactUnlocked && housegirl.unlockCount > 0 && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        🔓 Unlocked {housegirl.unlockCount} time{housegirl.unlockCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons - Like competitor's design */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewProfile(housegirl)}
                      className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    {housegirl.contactUnlocked ? (
                      <Button 
                        size="sm" 
                        onClick={() => {
                          toast({ 
                            title: "Contact Available", 
                            description: `You can contact ${housegirl.name} at ${housegirl.phone || 'phone number'} or ${housegirl.email || 'email'}`,
                            variant: "default"
                          });
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Unlocked
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        onClick={() => handleUnlockContact(housegirl)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Unlock
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredHousegirls.length)} of {filteredHousegirls.length} housegirls
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="hover:bg-gray-50 transition-colors"
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="text-gray-500">...</span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="hover:bg-gray-50 transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messages</h2>
          <p className="text-gray-600">Communicate with candidates</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {stats.unreadMessages} unread
          </Badge>
          <Button 
            variant="outline"
            onClick={() => {
              toast({ 
                title: "New Message", 
                description: "Message composition feature is coming soon!",
                variant: "default"
              });
            }}
            className="hover:bg-gray-50 backdrop-blur-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {messages.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
            <p className="text-gray-600 mb-6">Messages from candidates and system notifications will appear here</p>
            <Button 
              onClick={() => {
                toast({ 
                  title: "Browse Candidates", 
                  description: "Start by browsing available housegirls to begin conversations",
                  variant: "default"
                });
                setActiveSection('candidates');
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="h-4 w-4 mr-2" />
              Browse Candidates
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map(message => (
            <Card key={message.id} className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${!message.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
              <div className={`absolute inset-0 ${!message.isRead ? 'bg-blue-50/50' : 'bg-gradient-to-r from-gray-50/30 to-blue-50/30'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              <CardContent className="relative p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-bold text-gray-900">{message.from}</h3>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-1">{message.subject}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.preview}</p>
                    <p className="text-xs text-gray-500">{message.timestamp}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({ 
                          title: "Reply", 
                          description: `Replying to ${message.from}. Message composition feature is coming soon!`,
                          variant: "default"
                        });
                      }}
                      className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        toast({ 
                          title: "Message Details", 
                          description: "Full message view feature is coming soon!",
                          variant: "default"
                        });
                      }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                      </CardContent>
                    </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900 font-medium">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                toast({ 
                  title: "Edit Profile", 
                  description: "Profile editing feature is coming soon!",
                  variant: "default"
                });
              }}
              className="w-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
                      </CardContent>
                    </Card>
                    
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Settings className="h-5 w-5 text-gray-600" />
              </div>
              <span>Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              onClick={() => {
                toast({ 
                  title: "Change Password", 
                  description: "Password change feature is coming soon!",
                  variant: "default"
                });
              }}
              className="w-full justify-start hover:bg-gray-50 transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                toast({ 
                  title: "Notifications", 
                  description: "Notification preferences are coming soon!",
                  variant: "default"
                });
              }}
              className="w-full justify-start hover:bg-gray-50 transition-colors"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notification Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                toast({ 
                  title: "Privacy", 
                  description: "Privacy settings are coming soon!",
                  variant: "default"
                });
              }}
              className="w-full justify-start hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
                      </CardContent>
                    </Card>
                  </div>
                  
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Info className="h-5 w-5 text-purple-600" />
            </div>
            <span>Help & Support</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                toast({ 
                  title: "Help Center", 
                  description: "Help center is coming soon!",
                  variant: "default"
                });
              }}
              className="justify-start hover:bg-purple-50 transition-colors"
            >
              <Info className="h-4 w-4 mr-2" />
              Help Center
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                toast({ 
                  title: "Contact Support", 
                  description: "Support contact feature is coming soon!",
                  variant: "default"
                });
              }}
              className="justify-start hover:bg-purple-50 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                toast({ 
                  title: "Terms of Service", 
                  description: "Terms of service page is coming soon!",
                  variant: "default"
                });
              }}
              className="justify-start hover:bg-purple-50 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Terms of Service
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                toast({ 
                  title: "Privacy Policy", 
                  description: "Privacy policy page is coming soon!",
                  variant: "default"
                });
              }}
              className="justify-start hover:bg-purple-50 transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white/90 backdrop-blur-md border-r border-gray-200/50 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 flex flex-col shadow-lg`}>
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Domestic Connect</h1>
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hover:bg-gray-100/50 transition-colors"
            >
              {sidebarCollapsed ? '→' : '←'}
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-300 ${
                activeSection === item.id
                  ? `bg-gradient-to-r from-${item.color}-100 to-${item.color}-200 border border-${item.color}-300 text-${item.color}-700 shadow-md`
                  : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <item.icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : ''}`} />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
          
          {/* Day Bug Advertisement */}
          {!sidebarCollapsed && (
            <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Need a Day Bug Today?</h3>
                <p className="text-xs text-gray-600 mb-3">Find housegirls available for day jobs</p>
                <Button 
                  size="sm"
                  onClick={() => {
                    setSelectedWorkType('Day job');
                    setActiveSection('overview');
                    toast({ 
                      title: "Day Job Filter Applied", 
                      description: "Showing housegirls available for day jobs only.",
                      variant: "default"
                    });
                  }}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-xs shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Find Day Bug
                </Button>
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-200/50 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-bold">{user.first_name.charAt(0)}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{user.first_name}</p>
                <p className="text-xs text-gray-500">Employer</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 flex-shrink-0 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize">{activeSection}</h2>
                <p className="text-gray-600">
                  {activeSection === 'overview' && 'Welcome back! Here\'s your dashboard overview'}
                  {activeSection === 'jobs' && 'Manage your job postings and applications'}
                  {activeSection === 'housegirls' && 'Browse and connect with qualified housegirls'}
                  {activeSection === 'messages' && 'Communicate with candidates and applicants'}
                  {activeSection === 'settings' && 'Manage your account and preferences'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Stats Icons */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">{stats.totalApplications}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                    <Briefcase className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">{stats.activeJobs}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
                    <Eye className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">{stats.totalViews}</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">{stats.unreadMessages}</span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative hover:bg-gray-100/50 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-6">
            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'jobs' && renderJobs()}
            {activeSection === 'housegirls' && renderHousegirls()}
            {activeSection === 'messages' && renderMessages()}
            {activeSection === 'settings' && renderSettings()}
          </div>
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
