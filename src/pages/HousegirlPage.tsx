import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';
import PhotoUpload from '@/components/PhotoUpload';
import ReturnToHome from '@/components/ReturnToHome';
import AgencyRegistrationModal from '@/components/AgencyRegistrationModal';
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
  Building2
} from 'lucide-react';

const HousegirlPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [agencyModalOpen, setAgencyModalOpen] = useState(false);

  // Redirect logged-in housegirls to their dashboard
  useEffect(() => {
    if (user && user.user_type === 'housegirl') {
      navigate('/housegirl-dashboard');
    }
  }, [user, navigate]);

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const openAgencyModal = () => {
    setAgencyModalOpen(true);
  };

  const closeAgencyModal = () => {
    setAgencyModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50 shadow-sm">
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
                  // If not logged in, go to home
                  navigate('/home');
                }
              }}>
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-3">
                  Domestic Connect
                </h1>
              </div>
              
              <ReturnToHome variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50" />
              
              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full" onClick={() => navigate('/home')}>
                  For Employers
                </Button>
                <Button variant="ghost" className="text-blue-600 bg-blue-50 rounded-full">
                  For Housegirls
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full" onClick={() => navigate('/agencies')}>
                  For Agencies
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-400 to-indigo-500 text-white border-0">
                    {user.user_type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Karibu, {user.first_name}
                  </span>
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
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full"
                  >
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={signOut} className="border-blue-300 hover:bg-blue-50 rounded-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" onClick={() => openAuthModal('login')} className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                    Login
                  </Button>
                  <Button onClick={() => openAuthModal('signup')} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full shadow-lg">
                    Join today!
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - TAFUTA KAZI Focus */}
      <section className="py-24 bg-gradient-to-br from-white via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
        
        <div className="max-w-5xl mx-auto text-center px-4 relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-2xl mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            TAFUTA KAZI
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Find your next house help job today! Create your profile and connect with families looking for reliable workers.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              onClick={() => openAuthModal('signup')}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <User className="h-6 w-6 mr-3" />
              Create My Profile →
            </Button>
            <Button 
              onClick={openAgencyModal}
              size="lg" 
              variant="outline"
              className="border-2 border-green-500 text-green-600 hover:bg-green-50 px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Building2 className="h-6 w-6 mr-3" />
              Register with Agency →
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              Free Profile
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-blue-500 mr-2" />
              Safe & Secure
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-indigo-500 mr-2" />
              Quick Setup
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Simple Steps */}
      <section className="py-20 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to find your next job. No stress, no hassle!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="h-10 w-10 text-blue-600" />
              </div>
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Create Your Profile</h4>
              <p className="text-gray-600">
                Sign up and create your professional profile. Add your experience, skills, and preferences.
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-10 w-10 text-indigo-600" />
              </div>
              <div className="bg-indigo-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Get Discovered</h4>
              <p className="text-gray-600">
                Families will find your profile and contact you directly. No more going door to door!
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Start Working</h4>
              <p className="text-gray-600">
                Connect with families, discuss terms, and start your new job. Simple as that!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Jobs Available</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
                <MapPin className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">20+</div>
              <div className="text-gray-600 font-medium">Cities</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-white rounded-2xl shadow-lg inline-block mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
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

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Domestic Connect?
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We're here to make finding house help jobs easier for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6 group-hover:shadow-xl transition-shadow duration-300">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Safe & Secure</h4>
              <p className="text-gray-600">
                All families are verified. Your safety and security are our top priority.
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6 group-hover:shadow-xl transition-shadow duration-300">
                <Award className="h-10 w-10 text-indigo-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Better Pay</h4>
              <p className="text-gray-600">
                Connect directly with families. No agency fees, no middlemen taking your money.
              </p>
            </div>

            <div className="text-center group">
              <div className="p-6 bg-white rounded-2xl shadow-lg inline-block mb-6 group-hover:shadow-xl transition-shadow duration-300">
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Grow Your Career</h4>
              <p className="text-gray-600">
                Build your reputation, get reviews, and find better opportunities over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Upload Section - Only for logged in housegirls */}
      {user && user.user_type === 'housegirl' && (
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-gray-900 mb-4">
                Upload Your Profile Photo
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                A professional photo helps employers connect with you better. Stand out from the crowd!
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <PhotoUpload 
                onPhotoUploaded={(photoUrl) => {
                  console.log('Photo uploaded:', photoUrl);
                  // In production, this would save to the user's profile
                }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 shadow-xl border border-blue-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Find Your Next Job?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of housegirls who found great jobs through Domestic Connect
            </p>
            <Button 
              onClick={() => openAuthModal('signup')}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <User className="h-6 w-6 mr-3" />
              Create My Profile Now →
            </Button>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h4 className="text-2xl font-bold ml-3">Domestic Connect</h4>
          </div>
          <p className="text-blue-100 mb-6">
            Making house help jobs easier to find for Kenyan workers.
          </p>
          <div className="border-t border-blue-700 pt-6">
            <p className="text-blue-200">
              © 2024 Domestic Connect. All rights reserved. Tafuta kazi, pata kazi.
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

      {/* Agency Registration Modal */}
      <AgencyRegistrationModal 
        isOpen={agencyModalOpen} 
        onClose={closeAgencyModal} 
      />
    </div>
  );
};

export default HousegirlPage;
