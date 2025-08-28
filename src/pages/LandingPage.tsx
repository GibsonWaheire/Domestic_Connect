import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
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
  MessageCircle
} from 'lucide-react';

const LandingPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleNavigation = (path: string) => {
    if (!user) {
      setAuthMode('login');
      setAuthModalOpen(true);
      return;
    }
    navigate(path);
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
                Domestic Connect
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a>
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Services</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    {user.user_type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.first_name}
                  </span>
                  <Button variant="outline" onClick={signOut} className="border-gray-300 hover:bg-gray-50">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" onClick={() => openAuthModal('login')} className="text-gray-700 hover:text-blue-600">
                    Sign In
                  </Button>
                  <Button onClick={() => openAuthModal('signup')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-24 pb-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mb-6">
              <Star className="h-4 w-4 mr-2" />
              Trusted by 10,000+ users across Kenya
            </Badge>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Domestic Worker
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect with verified domestic workers, reliable agencies, and trusted employers. 
              Advanced filtering, secure payments, and 24/7 support for peace of mind.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <div className="flex items-center text-blue-100">
                <Shield className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="font-medium">Verified Profiles</span>
              </div>
              <div className="flex items-center text-blue-100">
                <Search className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="font-medium">Smart Matching</span>
              </div>
              <div className="flex items-center text-blue-100">
                <Shield className="h-5 w-5 text-yellow-300 mr-2" />
                <span className="font-medium">Secure Platform</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => handleNavigation('/find-housegirl')}
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-xl inline-block mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">10,000+</div>
              <div className="text-gray-600 font-medium">Active Users</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-green-50 rounded-xl inline-block mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">5,000+</div>
              <div className="text-gray-600 font-medium">Verified Profiles</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-red-50 rounded-xl inline-block mb-4">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">8,000+</div>
              <div className="text-gray-600 font-medium">Successful Matches</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-purple-50 rounded-xl inline-block mb-4">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive solutions for employers, domestic workers, and agencies. 
              Choose the service that fits your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Employers Card */}
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 bg-white shadow-lg hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
              <CardHeader className="relative pb-6">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-gray-900 mb-3">For Employers</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Find experienced and verified domestic workers for your home
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-4 mb-8 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Browse verified profiles with detailed information</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Filter by tribe, location, experience, and education</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Flexible payment packages starting from KES 200</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Direct contact access and secure communication</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={() => handleNavigation('/find-housegirl')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  Find Housegirl
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="mt-6 text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-blue-600">KES 200</p>
                  <p className="text-xs text-gray-500">per contact</p>
                </div>
              </CardContent>
            </Card>

            {/* Domestic Workers Card - No Pricing */}
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 bg-white shadow-lg hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
              <CardHeader className="relative pb-6">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <User className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-gray-900 mb-3">For Domestic Workers</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Create your professional profile and find employment opportunities
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-4 mb-8 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Create comprehensive professional profiles</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Showcase skills, experience, and qualifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Connect directly with potential employers</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Safe and secure platform for job hunting</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={() => handleNavigation('/find-employer')}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  Find Employer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="mt-6 text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Free Profile Creation</p>
                  <p className="text-lg font-semibold text-green-600">No Cost</p>
                  <p className="text-xs text-gray-500">Create and manage your profile</p>
                </div>
              </CardContent>
            </Card>

            {/* Agencies Card */}
            <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 bg-white shadow-lg hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              <CardHeader className="relative pb-6">
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl text-gray-900 mb-3">For Agencies</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Bulk access and premium features for recruitment agencies
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-4 mb-8 text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Bulk contact packages for multiple hires</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Comprehensive agency dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Priority customer support</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>Advanced analytics and reporting</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={() => handleNavigation('/agency-access')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  Agency Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="mt-6 text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Starting from</p>
                  <p className="text-3xl font-bold text-purple-600">KES 2,000</p>
                  <p className="text-xs text-gray-500">15 contacts package</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Domestic Connect?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've built the most comprehensive platform for domestic worker recruitment 
              with advanced features, security, and user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8">
                <div className="p-4 bg-blue-500 rounded-xl inline-block mb-6">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Smart Matching</h4>
                <p className="text-gray-600 leading-relaxed">AI-powered algorithm matches you with the perfect domestic worker or employer</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8">
                <div className="p-4 bg-green-500 rounded-xl inline-block mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Background Verification</h4>
                <p className="text-gray-600 leading-relaxed">All profiles undergo thorough verification for your safety and peace of mind</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8">
                <div className="p-4 bg-purple-500 rounded-xl inline-block mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">24/7 Support</h4>
                <p className="text-gray-600 leading-relaxed">Round-the-clock customer support to assist you with any queries</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8">
                <div className="p-4 bg-red-500 rounded-xl inline-block mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Secure Payments</h4>
                <p className="text-gray-600 leading-relaxed">Bank-grade security for all transactions and personal information</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8">
                <div className="p-4 bg-orange-500 rounded-xl inline-block mb-6">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Advanced Filters</h4>
                <p className="text-gray-600 leading-relaxed">Filter by experience, education, location, tribe, and more</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white">
              <CardContent className="p-8">
                <div className="p-4 bg-indigo-500 rounded-xl inline-block mb-6">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Trusted Platform</h4>
                <p className="text-gray-600 leading-relaxed">Secure payments and trusted by thousands of users</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have already found their perfect match. 
            Create your account today and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => openAuthModal('signup')}
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
            >
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold ml-3">Domestic Connect</h4>
              </div>
              <p className="text-gray-400 mb-6">
                Connecting families, workers, and agencies across Kenya with the most 
                trusted and secure platform for domestic worker recruitment.
              </p>
              <div className="flex space-x-4">
                <div className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                  <MessageCircle className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6">Services</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">For Employers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Workers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Agencies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Verification</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6">Company</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6">Support</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Domestic Connect. All rights reserved. Connecting Kenya, one home at a time.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={closeAuthModal} 
        defaultMode={authMode} 
      />
    </div>
  );
};

export default LandingPage;
