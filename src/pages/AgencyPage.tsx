import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthModal from '@/components/AuthModal';
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
  Building2,
  BarChart3,
  CheckSquare,
  Users2,
  Handshake,
  Network,
  Rocket,
  BarChart,
  DollarSign,
  Settings
} from 'lucide-react';

const AgencyPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent ml-3">
                  Domestic Connect
                </h1>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Button variant="ghost" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={() => navigate('/')}>
                  For Employers
                </Button>
                <Button variant="ghost" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={() => navigate('/housegirls')}>
                  For Housegirls
                </Button>
                <Button variant="ghost" className="text-emerald-600 bg-emerald-50 rounded-full">
                  For Agencies
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0">
                    {user.user_type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Karibu, {user.first_name}
                  </span>
                  <Button variant="outline" onClick={signOut} className="border-emerald-300 hover:bg-emerald-50 rounded-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" onClick={() => openAuthModal('login')} className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-full">
                    Login
                  </Button>
                  <Button onClick={() => openAuthModal('signup')} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-full shadow-lg">
                    Partner with us
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Business Focus */}
      <section className="py-24 bg-gradient-to-br from-white via-emerald-50 to-teal-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-200 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-teal-200 rounded-full opacity-20 blur-xl"></div>
        
        <div className="max-w-6xl mx-auto text-center px-4 relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-2xl mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-300">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Scale Your Agency Business
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Join our network of verified agencies and access thousands of pre-screened housegirls. 
            Increase your revenue, expand your reach, and streamline your operations with our enterprise platform.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              onClick={() => openAuthModal('signup')}
              size="lg" 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Building2 className="h-6 w-6 mr-3" />
              Start Partnership →
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 px-10 py-5 text-lg font-semibold rounded-full"
            >
              <BarChart3 className="h-6 w-6 mr-3" />
              View Demo
            </Button>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
              Verified Network
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 text-teal-500 mr-2" />
              Enterprise Security
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-emerald-500 mr-2" />
              24/7 Support
            </div>
          </div>
        </div>
      </section>

      {/* Business Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-lg inline-block mb-4">
                <Users className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Partner Agencies</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-lg inline-block mb-4">
                <MapPin className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25+</div>
              <div className="text-gray-600 font-medium">Cities Covered</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-lg inline-block mb-4">
                <DollarSign className="h-8 w-8 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">40%</div>
              <div className="text-gray-600 font-medium">Revenue Increase</div>
            </div>
            <div className="text-center">
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-lg inline-block mb-4">
                <Zap className="h-8 w-8 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">2x</div>
              <div className="text-gray-600 font-medium">Faster Placement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise Features
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Everything you need to grow your agency business and serve more clients efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users2 className="h-10 w-10 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Talent Pool Access</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Access our database of thousands of pre-screened housegirls with verified backgrounds and skills.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Background verified</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Skills assessed</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>References checked</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-teal-100 to-teal-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart className="h-10 w-10 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Track your performance, monitor placements, and analyze market trends with our comprehensive analytics.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Real-time metrics</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Performance reports</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Market insights</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-10 w-10 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">API Integration</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Seamlessly integrate our platform with your existing systems and workflows.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>RESTful API</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Webhook support</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>SDK available</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-teal-100 to-teal-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Handshake className="h-10 w-10 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Client Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Manage your clients, track requirements, and streamline the hiring process from start to finish.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Client profiles</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Requirement tracking</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Progress monitoring</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Network className="h-10 w-10 text-emerald-600" />
                </div>
                <CardTitle className="text-xl">Lead Generation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Generate qualified leads and expand your client base with our targeted marketing tools.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Lead scoring</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Marketing automation</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-emerald-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Referral programs</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="p-4 bg-gradient-to-r from-teal-100 to-teal-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="h-10 w-10 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Growth Support</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-4">
                  Get dedicated support and resources to help scale your business operations.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Dedicated manager</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Training resources</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-teal-600">
                  <CheckSquare className="h-4 w-4" />
                  <span>Best practices</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Partnership Plans
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your agency size and growth goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-emerald-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="text-4xl font-bold text-emerald-600">KES 15,000</div>
                <div className="text-gray-500">per month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Up to 50 placements/month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Basic analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-2 border-emerald-500 bg-emerald-50 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-500 text-white px-4 py-2 rounded-full">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Professional</CardTitle>
                <div className="text-4xl font-bold text-emerald-600">KES 35,000</div>
                <div className="text-gray-500">per month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Up to 200 placements/month</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>API access</span>
                  </li>
                </ul>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-full">
                  Choose Professional
                </Button>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-emerald-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-emerald-600">Custom</div>
                <div className="text-gray-500">contact us</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Unlimited placements</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>Dedicated manager</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-3" />
                    <span>White-label options</span>
                  </li>
                </ul>
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-full">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              See how other agencies have grown their business with Domestic Connect
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-emerald-100 rounded-full mr-4">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Nairobi Elite Agency</h4>
                    <p className="text-gray-600">Established 2018</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "Since partnering with Domestic Connect, we've increased our monthly placements by 300% and expanded to 3 new cities. The platform has revolutionized how we operate."
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-emerald-600">300%</div>
                  <div className="text-sm text-gray-500">Increase in placements</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-teal-100 rounded-full mr-4">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Mombasa Care Solutions</h4>
                    <p className="text-gray-600">Established 2020</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "The analytics dashboard helps us make data-driven decisions. We've reduced our time-to-hire by 60% and improved client satisfaction significantly."
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-teal-600">60%</div>
                  <div className="text-sm text-gray-500">Faster hiring</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-12 shadow-xl border border-emerald-200">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Scale Your Agency?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Join the network of successful agencies and start growing your business today
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => openAuthModal('signup')}
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 py-5 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Building2 className="h-6 w-6 mr-3" />
                Start Partnership →
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="border-emerald-300 text-emerald-600 hover:bg-emerald-50 px-10 py-5 text-lg font-semibold rounded-full"
              >
                <Phone className="h-6 w-6 mr-3" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold ml-3">Domestic Connect</h4>
              </div>
              <p className="text-emerald-100 mb-6">
                Empowering agencies to scale their business and serve more families across Kenya.
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
              <h5 className="text-lg font-semibold mb-6">For Agencies</h5>
              <ul className="space-y-3 text-emerald-100">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6">Support</h5>
              <ul className="space-y-3 text-emerald-100">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Developer Portal</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training Resources</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6">Legal</h5>
              <ul className="space-y-3 text-emerald-100">
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Processing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Service Level Agreement</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-emerald-700 pt-8 text-center">
            <p className="text-emerald-200">
              © 2024 Domestic Connect. All rights reserved. Empowering agencies, connecting families.
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
    </div>
  );
};

export default AgencyPage;
