import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
import PaymentModal, { PackageDetails } from '@/components/PaymentModal';
import { 
  Building2, 
  User, 
  Heart, 
  Search, 
  Shield, 
  Star, 
  ArrowRight, 
  MapPin, 
  CheckCircle, 
  Users, 
  Phone, 
  Mail, 
  MessageCircle,
  Home,
  Briefcase,
  Zap,
  Award,
  Clock,
  TrendingUp,
  DollarSign,
  CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageDetails | null>(null);

  // Mock agency packages for testing
  const mockPackages: PackageDetails[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 1200,
      agencyFee: 1000,
      platformFee: 200,
      features: [
        'Verified worker',
        'Basic training',
        '30-day replacement',
        'Agency support'
      ],
      color: 'green',
      icon: Shield
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1500,
      agencyFee: 1000,
      platformFee: 500,
      features: [
        'Verified worker',
        'Professional training',
        'Background check',
        '60-day replacement',
        'Dispute resolution'
      ],
      color: 'blue',
      icon: Shield
    },
    {
      id: 'international',
      name: 'International',
      price: 2000,
      agencyFee: 1000,
      platformFee: 1000,
      features: [
        'Verified worker',
        'International training',
        'Comprehensive background check',
        '90-day replacement',
        'Legal compliance'
      ],
      color: 'purple',
      icon: Shield
    }
  ];

  const handlePackageSelect = (packageDetails: PackageDetails) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    setSelectedPackage(packageDetails);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData: {
    id: string;
    client_id: string;
    agency_id: string;
    package_id: string;
    amount: number;
    agency_fee: number;
    platform_fee: number;
    phone_number: string;
    status: string;
    payment_method: string;
    created_at: string;
    agency_client_id: string;
    terms_accepted: boolean;
  }) => {
    setShowPaymentModal(false);
    setSelectedPackage(null);
    // Show success message or redirect
  };

  const handleNavigation = (path: string) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    
    // Redirect based on user type
    if (user.user_type === 'agency') {
      navigate('/agency-dashboard');
    } else if (user.user_type === 'housegirl') {
      navigate('/housegirl-dashboard');
    } else if (user.user_type === 'employer') {
      navigate('/dashboard');
    } else if (user.is_admin) {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pink-50 to-orange-50">
      {/* Enhanced Header with Unique Design */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center cursor-pointer" onClick={() => {
                if (user) {
                  // If logged in, go to appropriate dashboard
                  if (user.user_type === 'agency') {
                    navigate('/agency-dashboard');
                  } else if (user.user_type === 'housegirl') {
                    navigate('/housegirl-dashboard');
                  } else {
                    navigate('/dashboard');
                  }
                } else {
                  // If not logged in, stay on home
                  navigate('/home');
                }
              }}>
                <div className="p-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent ml-3">
                  Domestic Connect
                </h1>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" className="text-pink-600 bg-pink-50 rounded-full">
                  For Employers
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full" onClick={() => navigate('/housegirls')}>
                  For Housegirls
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full" onClick={() => navigate('/agencies')}>
                  For Agencies
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full" onClick={() => navigate('/agency-marketplace')}>
                  Agency Marketplace
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-6">
                  <Badge variant="secondary" className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0">
                    {user.user_type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Karibu, {user.first_name}
                  </span>
                  <Button onClick={() => {
                    if (user.user_type === 'agency') {
                      navigate('/agency-dashboard');
                    } else if (user.user_type === 'housegirl') {
                      navigate('/housegirl-dashboard');
                    } else {
                      navigate('/dashboard');
                    }
                  }} className="bg-gradient-to-r from-pink-500 to-orange-600 hover:from-pink-600 hover:to-orange-700 text-white rounded-full">
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={signOut} className="border-pink-300 hover:bg-pink-50 rounded-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" onClick={() => openAuthModal('login')} className="text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-full">
                    Login
                  </Button>
                  <Button onClick={() => openAuthModal('signup')} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-full shadow-lg">
                    Join today!
                </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Unique Design */}
      <section className="py-24 bg-gradient-to-br from-white via-pink-50 to-orange-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-200 rounded-full opacity-20 blur-xl"></div>
        
        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <Home className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Tired of struggling with house help?
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            We get it! Find your perfect housegirl today for just <span className="text-pink-600 font-bold text-3xl">200 bob</span> via M-Pesa
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            {user ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-lg text-gray-600 mb-2">
                  Welcome back! What would you like to do?
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => {
                      if (user.user_type === 'agency') {
                        navigate('/agency-dashboard');
                      } else if (user.user_type === 'housegirl') {
                        navigate('/housegirl-dashboard');
                      } else {
                        navigate('/dashboard');
                      }
                    }}
                    size="lg" 
                    className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <User className="h-6 w-6 mr-3" />
                    Go to Dashboard →
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Home className="h-6 w-6 mr-3" />
                    Explore More
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                onClick={() => openAuthModal('signup')}
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <User className="h-6 w-6 mr-3" />
                Find My Perfect Housegirl →
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Verified Profiles
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-blue-500 mr-2" />
              Safe & Secure
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-orange-500 mr-2" />
              Same Day Access
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced Design */}
      <section className="py-20 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to find your perfect housegirl. No stress, no hassle!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-10 w-10 text-pink-600" />
              </div>
              <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Browse Available Housegirls</h4>
              <p className="text-gray-600">
                See hundreds of verified housegirls ready to work. Filter by location, experience, and more!
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-orange-600" />
              </div>
              <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Unlock Profile Access</h4>
              <p className="text-gray-600">
                Found your match? Unlock their full profile for just <span className="text-pink-600 font-semibold">200 bob</span> via M-Pesa
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Hire & Connect</h4>
              <p className="text-gray-600">
                Contact your chosen housegirl directly and arrange hiring. Simple as that!
              </p>
            </div>
                  </div>
                </div>
      </section>

      {/* Stats Section - New Addition */}
      <section className="py-16 bg-gradient-to-r from-pink-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
                <Users className="h-8 w-8 text-pink-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Housegirls Available</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600 font-medium">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">24hrs</div>
              <div className="text-gray-600 font-medium">Response Time</div>
                </div>
                  </div>
                </div>
      </section>

      {/* Second CTA - Enhanced */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-3xl p-12 shadow-xl">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Stop the Struggle?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of happy families who found their perfect housegirl for just <span className="text-pink-600 font-bold text-2xl">200 bob</span>
            </p>
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard')}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <User className="h-6 w-6 mr-3" />
                  Go to Dashboard →
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Home className="h-6 w-6 mr-3" />
                  Stay on Home
                </Button>
                </div>
            ) : (
              <Button 
                onClick={() => openAuthModal('signup')}
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <User className="h-6 w-6 mr-3" />
                Start My Search Now →
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Enhanced Section */}
      <section className="py-20 bg-gradient-to-r from-pink-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Domestic Connect?
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're not just another platform - we're your solution to house help problems
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6 group-hover:shadow-xl transition-shadow duration-300">
                <Briefcase className="h-10 w-10 text-pink-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Digital Housegirl Bureau</h4>
              <p className="text-gray-600">
                We do the hard work of finding vetted housegirls so you don't have to stress about it.
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6 group-hover:shadow-xl transition-shadow duration-300">
                <Award className="h-10 w-10 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">No Hidden Fees</h4>
              <p className="text-gray-600">
                Unlike traditional bureaus, you only pay for profile access. No salary deductions, no surprises!
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6 group-hover:shadow-xl transition-shadow duration-300">
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Earn While Helping</h4>
              <p className="text-gray-600">
                Refer friends and earn money! Our affiliate program lets you make money while helping others.
              </p>
              <Button variant="outline" className="mt-4 bg-green-100 border-green-300 text-green-700 hover:bg-green-200 rounded-full">
                Coming soon
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Try Our Agency Service - Mock Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Try Our Agency Service
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience our premium agency service with verified workers and guaranteed satisfaction. 
              <span className="text-blue-600 font-semibold"> Test the payment system now!</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {mockPackages.map((packageDetails) => (
              <Card 
                key={packageDetails.id}
                className={`border-2 border-gray-200 hover:border-${packageDetails.color}-300 transition-all duration-300 cursor-pointer hover:shadow-xl`}
                onClick={() => handlePackageSelect(packageDetails)}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <div className="flex items-center">
                      <packageDetails.icon className={`h-6 w-6 text-${packageDetails.color}-600 mr-3`} />
                      {packageDetails.name} Package
                    </div>
                    {packageDetails.id === 'premium' && (
                      <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">KES {packageDetails.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">One-time registration fee</p>
                  </div>
                  <ul className="space-y-2">
                    {packageDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full bg-${packageDetails.color}-600 hover:bg-${packageDetails.color}-700 text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePackageSelect(packageDetails);
                    }}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Try This Package
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-white rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Why Try Our Agency Service?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <span>Verified Workers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mr-2" />
                  <span>Guaranteed Replacement</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-600 mr-2" />
                  <span>Professional Training</span>
                </div>
              </div>
              <p className="text-gray-600 mt-4 text-sm">
                <strong>Note:</strong> This is a demo to test our payment system. Real agencies will be available soon!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-pink-900 to-orange-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-pink-400 to-orange-400 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold ml-3">Domestic Connect</h4>
              </div>
              <p className="text-pink-100 mb-6">
                Making house help easy, affordable, and stress-free for Kenyan families.
              </p>
              <div className="flex space-x-4">
                <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <MessageCircle className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6">Quick Links</h5>
              <ul className="space-y-3 text-pink-100">
                <li><a href="#" className="hover:text-white transition-colors">For Housegirls</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Employers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6">Support</h5>
              <ul className="space-y-3 text-pink-100">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6">Legal</h5>
              <ul className="space-y-3 text-pink-100">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-pink-700 pt-8 text-center">
            <p className="text-pink-200">
              © 2024 Domestic Connect. All rights reserved. Making Kenya better, one home at a time.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={closeAuthModal} 
        defaultMode={authMode} 
      />

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <PaymentModal
          package={selectedPackage}
          agency={{
            id: 'demo_agency',
            name: 'Demo Agency Service',
            license_number: 'DEMO-2024-001',
            rating: 4.9,
            verified_workers: 50
          }}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default LandingPage;
