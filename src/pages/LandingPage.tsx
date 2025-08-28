import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Heart, Search, Shield, Star, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold text-foreground">Domestic Connect</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.email}
                  </span>
                  <Button variant="outline" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Find the Perfect
            <span className="text-primary block">Domestic Worker</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connecting families with trusted domestic workers and reliable agencies. 
            Safe, secure, and affordable with advanced filtering and verification.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary mr-2" />
              Verified Profiles
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Search className="h-4 w-4 text-primary mr-2" />
              Advanced Filters
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-primary mr-2" />
              Trusted Platform
            </div>
          </div>
        </div>
      </section>

      {/* Main Action Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Employers Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
              <CardHeader className="relative">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-foreground">For Employers</CardTitle>
                <CardDescription className="text-lg">
                  Find experienced domestic workers for your home
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 mb-6 text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Browse verified profiles
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Filter by tribe, location, experience
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Flexible payment packages
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                    Direct contact access
                  </li>
                </ul>
                
                <Button 
                  onClick={() => handleNavigation('/find-housegirl')}
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  size="lg"
                >
                  Find Housegirl
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-2xl font-bold text-primary">KES 200</p>
                  <p className="text-xs text-muted-foreground">per contact</p>
                </div>
              </CardContent>
            </Card>

            {/* Housegirls Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/50">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent" />
              <CardHeader className="relative">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-secondary/10 rounded-lg">
                    <User className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-foreground">For Domestic Workers</CardTitle>
                <CardDescription className="text-lg">
                  Create your profile and find employment
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 mb-6 text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3" />
                    Create professional profile
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3" />
                    Showcase your skills
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3" />
                    Connect with employers
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3" />
                    Safe and secure platform
                  </li>
                </ul>
                
                <Button 
                  onClick={() => handleNavigation('/find-employer')}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-colors"
                  size="lg"
                >
                  Find Employer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Access employers for</p>
                  <p className="text-2xl font-bold text-secondary">KES 1,500</p>
                  <p className="text-xs text-muted-foreground">per contact</p>
                </div>
              </CardContent>
            </Card>

            {/* Agencies Card */}
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
              <CardHeader className="relative">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Heart className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-foreground">For Agencies</CardTitle>
                <CardDescription className="text-lg">
                  Bulk access and premium features
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3 mb-6 text-muted-foreground">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                    Bulk contact packages
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                    Agency dashboard
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                    Premium support
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                    Advanced analytics
                  </li>
                </ul>
                
                <Button 
                  onClick={() => handleNavigation('/agency-access')}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-colors"
                  size="lg"
                >
                  Agency Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-2xl font-bold text-accent">KES 2,000</p>
                  <p className="text-xs text-muted-foreground">15 contacts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Domestic Connect?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've improved on existing platforms with better features, security, and user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-lg inline-block mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Advanced Filtering</h4>
              <p className="text-muted-foreground">Filter by tribe, experience, education, location, and more</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-secondary/10 rounded-lg inline-block mb-4">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Verified Profiles</h4>
              <p className="text-muted-foreground">All profiles are verified for authenticity and safety</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-accent/10 rounded-lg inline-block mb-4">
                <Star className="h-8 w-8 text-accent" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Flexible Packages</h4>
              <p className="text-muted-foreground">Choose from various payment options that fit your needs</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-lg inline-block mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Trusted Platform</h4>
              <p className="text-muted-foreground">Secure payments and trusted by thousands of users</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <Heart className="h-6 w-6 text-primary mr-2" />
            <span className="text-lg font-semibold text-foreground">Domestic Connect</span>
          </div>
          <p className="text-center text-muted-foreground mt-4">
            Connecting families, workers, and agencies across Kenya
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;