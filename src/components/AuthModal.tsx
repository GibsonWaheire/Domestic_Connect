import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { User, Heart, Building2, Eye, EyeOff, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

const AuthModal = ({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'employer' | 'housegirl' | 'agency'>('employer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signUp, signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      onClose();
      // Redirect users based on their type
      if (user.user_type === 'employer') {
        navigate('/dashboard');
      } else if (user.user_type === 'housegirl') {
        navigate('/housegirls');
      } else if (user.user_type === 'agency') {
        navigate('/agencies');
      }
    }
  }, [user, onClose, navigate]);

  useEffect(() => {
    setIsLogin(defaultMode === 'login');
  }, [defaultMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign In Error",
            description: error.message || "Failed to sign in. Please try again.",
            variant: "destructive"
          });
        } else {
          onClose();
        }
      } else {
        // Sign up validation
        if (password !== confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match. Please try again.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          toast({
            title: "Weak Password",
            description: "Password must be at least 6 characters long.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, userType, {
          first_name: firstName,
          last_name: lastName,
          phone_number: phoneNumber,
          // Add additional fields based on user type
          ...(userType === 'employer' && {
            company_name: '',
            location: '',
            description: ''
          }),
          ...(userType === 'housegirl' && {
            age: 18,
            bio: '',
            current_location: '',
            location: '',
            education: 'primary' as const,
            experience: 'no_experience' as const,
            expected_salary: 0,
            accommodation_type: 'live_in' as const,
            tribe: ''
          }),
          ...(userType === 'agency' && {
            agency_name: '',
            location: '',
            description: '',
            license_number: ''
          })
        });

        if (error) {
          toast({
            title: "Sign Up Error",
            description: error.message || "Failed to create account. Please try again.",
            variant: "destructive"
          });
        } else {
          onClose();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'employer':
        return <Building2 className="h-5 w-5" />;
      case 'housegirl':
        return <User className="h-5 w-5" />;
      case 'agency':
        return <Heart className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md relative">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 hover:bg-white/10 rounded-full p-2"
        >
          <X className="h-5 w-5" />
        </Button>

        <Card className="w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 ml-3">
                Domestic Connect
              </h1>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {isLogin 
                ? 'Sign in to access your account and find your perfect match'
                : 'Join our community and start connecting today'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="userType" className="text-gray-700 font-medium">Account Type</Label>
                    <Select value={userType} onValueChange={(value: 'employer' | 'housegirl' | 'agency') => setUserType(value)}>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500">
                        <div className="flex items-center gap-2">
                          {getUserTypeIcon(userType)}
                          <SelectValue placeholder="Select account type" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employer">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Employer
                          </div>
                        </SelectItem>
                        <SelectItem value="housegirl">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Domestic Worker
                          </div>
                        </SelectItem>
                        <SelectItem value="agency">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Agency
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="border-gray-300 focus:border-blue-500"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="border-gray-300 focus:border-blue-500"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+254 700 000 000"
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-gray-300 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10 border-gray-300 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10 border-gray-300 focus:border-blue-500"
                      placeholder="Confirm your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 font-semibold" 
                disabled={loading}
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthModal;
