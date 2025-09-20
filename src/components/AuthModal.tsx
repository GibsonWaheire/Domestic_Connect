import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { errorService } from '@/lib/errorService';
import { API_BASE_URL } from '@/lib/apiConfig';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { User, Heart, Building2, Eye, EyeOff, X, Shield, CheckCircle, Clock, Mail } from 'lucide-react';

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
  const [userType, setUserType] = useState<'employer' | 'housegirl' | 'agency'>('housegirl');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [community, setCommunity] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [accommodationType, setAccommodationType] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('');
  const [agencies, setAgencies] = useState<Array<{
    id: string;
    name: string;
    location: string;
    verification_status: string;
    subscription_tier: string;
    rating: number;
    license_number: string;
    verified_workers: number;
    successful_placements: number;
    description?: string;
    contact_email?: string;
    contact_phone?: string;
    website?: string;
  }>>([]);

  // Auto-generate bio description based on form fields
  const generateBioDescription = useCallback(() => {
    if (!age && !experience && !education && !skills.length && !languages.length) {
      return '';
    }

    let description = 'I am';

    // Add age if available
    if (age) {
      description += ` a ${age}-year-old`;
    } else {
      description += ' a';
    }

    // Add experience level
    if (experience === 'No Experience') {
      description += ' hardworking person looking for my first house help job. I am eager to learn and willing to work hard.';
    } else if (experience === '1 Year') {
      description += ' domestic worker with 1 year of experience. I am reliable and professional.';
    } else if (experience === '2 Years') {
      description += ' domestic worker with 2 years of experience. I am skilled and trustworthy.';
    } else if (experience === '3+ Years') {
      description += ' experienced domestic worker with 3+ years of experience. I am very professional and skilled.';
    } else {
      description += ' domestic worker. I am hardworking and reliable.';
    }

    // Add skills if available
    if (skills.length > 0) {
      const skillText = skills.join(', ');
      description += ` I am skilled in ${skillText}.`;
    }

    // Add languages if available
    if (languages.length > 0) {
      const languageText = languages.join(', ');
      description += ` I speak ${languageText}.`;
    }

    // Add accommodation preference
    if (accommodationType === 'live_in') {
      description += ' I prefer live-in arrangements.';
    } else if (accommodationType === 'live_out') {
      description += ' I prefer live-out arrangements.';
    } else if (accommodationType === 'both') {
      description += ' I am flexible with accommodation arrangements.';
    }

    // Add location if available
    if (location && location !== 'Custom') {
      description += ` I am located in ${location}.`;
    } else if (location === 'Custom' && customLocation) {
      description += ` I am located in ${customLocation}.`;
    }

    // Add education if available
    if (education) {
      description += ` I have ${education} education.`;
    }

    // Add community if available
    if (community && community !== 'Other') {
      description += ` I am from the ${community} community.`;
    }

    // Add salary expectation if available
    if (expectedSalary) {
      description += ` My expected salary is KSh ${expectedSalary}.`;
    }

    // Final touch
    description += ' I am looking for a good family to work with and I am committed to providing excellent service.';

    return description;
  }, [age, experience, education, skills, languages, accommodationType, location, community, expectedSalary, customLocation]);

  // Auto-update bio when relevant fields change
  useEffect(() => {
    if (userType === 'housegirl' && (age || experience || education || skills.length || languages.length || accommodationType || location || community || expectedSalary)) {
      const generatedBio = generateBioDescription();
      if (generatedBio && !bio) {
        setBio(generatedBio);
      }
    }
  }, [age, experience, education, skills, languages, accommodationType, location, community, expectedSalary, userType, bio, generateBioDescription]);

  // Fetch agencies for housegirl registration
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/agencies`);
        const data = await response.json();
        setAgencies(data);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        errorService.logError(errorObj, 'Fetching agencies', 'low');
        // Don't show error to user for agency fetching as it's not critical
      }
    };

    if (userType === 'housegirl') {
      fetchAgencies();
    }
  }, [userType]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp, signIn, signInWithGoogle, resetPassword, user, isFirebaseUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      onClose();
      // Automatically redirect users to their appropriate dashboard based on user type
      if (user.user_type === 'employer') {
        navigate('/dashboard');
      } else if (user.user_type === 'housegirl') {
        navigate('/housegirl-dashboard');
      } else if (user.user_type === 'agency') {
        navigate('/agencies');
      }
    }
  }, [user, onClose, navigate]);

  useEffect(() => {
    setIsLogin(defaultMode === 'login');
  }, [defaultMode]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        toast({
          title: "Google Sign In Error",
          description: result.error || "Failed to sign in with Google. Please try again.",
          variant: "destructive"
        });
      } else {
        onClose();
        // Redirect based on user type
        const currentUser = result.user;
        if (currentUser?.user_type === 'agency') {
          window.location.href = '/agency-dashboard';
        } else if (currentUser?.user_type === 'housegirl') {
          window.location.href = '/housegirl-dashboard';
        } else if (currentUser?.user_type === 'employer') {
          window.location.href = '/dashboard';
        } else if (currentUser?.is_admin) {
          window.location.href = '/admin-dashboard';
        } else {
          // Default fallback - redirect to appropriate dashboard based on user type
          if (currentUser?.user_type === 'housegirl') {
            window.location.href = '/housegirl-dashboard';
          } else {
            window.location.href = '/dashboard';
          }
        }
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const userFriendlyError = errorService.getUserFriendlyError(errorObj, 'Google Sign In');
      
      toast({
        title: userFriendlyError.title,
        description: userFriendlyError.message,
        variant: "destructive"
      });
      
      setError(userFriendlyError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.error) {
        toast({
          title: "Password Reset Failed",
          description: result.error || "Failed to send password reset email.",
          variant: "destructive"
        });
      } else {
        setShowForgotPassword(false);
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for instructions to reset your password.",
        });
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const userFriendlyError = errorService.getUserFriendlyError(errorObj, 'Password Reset');
      
      toast({
        title: userFriendlyError.title,
        description: userFriendlyError.message,
        variant: "destructive"
      });
      
      setError(userFriendlyError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        if (result.error) {
          toast({
            title: "Sign In Error",
            description: result.error || "Failed to sign in. Please try again.",
            variant: "destructive"
          });
        } else {
          onClose();
          // Use the user data returned from signIn
          const currentUser = result.user;
          if (currentUser?.user_type === 'agency') {
            window.location.href = '/agency-dashboard';
          } else if (currentUser?.user_type === 'housegirl') {
            window.location.href = '/housegirl-dashboard';
          } else if (currentUser?.user_type === 'employer') {
            window.location.href = '/dashboard';
          } else if (currentUser?.is_admin) {
            window.location.href = '/admin-dashboard';
          } else {
            // Default fallback - redirect to appropriate dashboard based on user type
            if (currentUser?.user_type === 'housegirl') {
              window.location.href = '/housegirl-dashboard';
            } else {
              window.location.href = '/dashboard';
            }
          }
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

        // Phone number validation
        if (!validatePhoneNumber(phoneNumber)) {
          toast({
            title: "Invalid Phone Number",
            description: "Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX)",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Custom location validation
        if (location === 'Custom' && !customLocation.trim()) {
          toast({
            title: "Location Required",
            description: "Please enter your custom location",
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
              age: parseInt(age) || 25,
              bio: bio || 'Professional house help with experience in cooking, cleaning, and childcare.',
              current_location: location === 'Custom' ? customLocation : location || 'Nairobi',
              location: location === 'Custom' ? customLocation : location || 'Nairobi',
              education: education || 'Form 4 and Above',
              experience: experience || '2 Years',
              expected_salary: parseInt(expectedSalary) || 8000,
              accommodation_type: accommodationType || 'live_in',
              community: community || 'Kikuyu',
              skills: skills.length > 0 ? skills : ['Cooking', 'Cleaning', 'Laundry', 'Childcare'],
              languages: languages.length > 0 ? languages : ['English', 'Swahili']
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
            description: error || "Failed to create account. Please try again.",
            variant: "destructive"
          });
        } else {
          onClose();
          // Redirect based on user type
          if (userType === 'housegirl') {
            window.location.href = '/housegirl-dashboard';
          } else if (userType === 'employer') {
            window.location.href = '/dashboard';
          } else if (userType === 'agency') {
            window.location.href = '/agencies';
          }
        }
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const userFriendlyError = errorService.getUserFriendlyError(errorObj, isLogin ? 'Sign In' : 'Sign Up');
      
      toast({
        title: userFriendlyError.title,
        description: userFriendlyError.message,
        variant: "destructive"
      });
      
      setError(userFriendlyError.message);
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



  // Phone number validation and formatting for Kenya
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // If it starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    }
    
    // If it starts with 254, add +
    if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    }
    
    // If it starts with 7, add +254
    if (cleaned.startsWith('7')) {
      return '+254' + cleaned;
    }
    
    // If it already starts with +, return as is
    if (value.startsWith('+')) {
      return value;
    }
    
    // Default: add +254 if it's a 9-digit number
    if (cleaned.length === 9) {
      return '+254' + cleaned;
    }
    
    return value;
  };

  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    // Kenyan phone numbers should be +254 followed by 9 digits
    const phoneRegex = /^\+254[17]\d{8}$/;
    return phoneRegex.test(formatted);
  };

  if (!isOpen) return null;

      return (
      <div 
        className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-black/40 p-4"
      >
        <div className="w-full max-w-2xl relative my-8 mx-auto">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white/90 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full p-3 shadow-lg border border-gray-200 hover:border-red-300 transition-all duration-200 z-10"
        >
          <X className="h-6 w-6 font-bold" />
        </Button>

        <Card 
          className="w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm max-h-[90vh] flex flex-col"
        >
          <CardHeader className="text-center pb-4 shrink-0">
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
          <CardContent className="px-6 py-6 overflow-y-auto">
            {/* Error Display */}
            {error && (
              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="h-3 w-3 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Something went wrong</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setError(null)}
                    className="text-red-600 hover:bg-red-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Top Section with Info */}
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {isLogin ? 'Welcome Back!' : 'Join Our Community'}
              </h3>
              <p className="text-sm text-gray-500">
                {isLogin 
                  ? 'Sign in to access your account and find your perfect match'
                  : 'Create your profile and start connecting with opportunities'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pt-4 max-w-3xl mx-auto">
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

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
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
                    <div className="space-y-3">
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
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setPhoneNumber(formatted);
                      }}
                      onBlur={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        setPhoneNumber(formatted);
                      }}
                      placeholder="07XX XXX XXX or +254 7XX XXX XXX"
                      className={`border-gray-300 focus:border-blue-500 ${
                        phoneNumber && !validatePhoneNumber(phoneNumber) 
                          ? 'border-red-500 focus:border-red-500' 
                          : ''
                      }`}
                    />
                    {phoneNumber && !validatePhoneNumber(phoneNumber) && (
                      <p className="text-xs text-red-500">
                        Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX)
                      </p>
                    )}
                    {phoneNumber && validatePhoneNumber(phoneNumber) && (
                      <p className="text-xs text-green-600">
                        ✓ Valid phone number format
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Enter your phone number (e.g., 07XX XXX XXX, +254 7XX XXX XXX)
                    </p>
                  </div>

                  {/* Additional fields for housegirls */}
                  {userType === 'housegirl' && (
                    <div className="space-y-8 p-6 bg-blue-50 rounded-lg border border-blue-200 my-8 max-w-2xl mx-auto">
                      <h4 className="text-lg font-semibold text-blue-800 mb-6 text-center">Tell Us About Yourself</h4>
                      
                      {/* Basic Information */}
                      <div className="space-y-6">
                        <h5 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">Basic Information</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="age" className="text-gray-700 font-medium text-sm">Age</Label>
                            <Input
                              id="age"
                              type="number"
                              value={age}
                              onChange={(e) => setAge(e.target.value)}
                              placeholder="25"
                              className="border-gray-300 focus:border-blue-500 text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location" className="text-gray-700 font-medium text-sm">Where are you?</Label>
                            <Select value={location} onValueChange={setLocation}>
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 text-sm">
                                <SelectValue placeholder="Select your city/town" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Nairobi">Nairobi</SelectItem>
                                <SelectItem value="Mombasa">Mombasa</SelectItem>
                                <SelectItem value="Kisumu">Kisumu</SelectItem>
                                <SelectItem value="Nakuru">Nakuru</SelectItem>
                                <SelectItem value="Eldoret">Eldoret</SelectItem>
                                <SelectItem value="Thika">Thika</SelectItem>
                                <SelectItem value="Machakos">Machakos</SelectItem>
                                <SelectItem value="Kakamega">Kakamega</SelectItem>
                                <SelectItem value="Nyeri">Nyeri</SelectItem>
                                <SelectItem value="Embu">Embu</SelectItem>
                                <SelectItem value="Meru">Meru</SelectItem>
                                <SelectItem value="Kericho">Kericho</SelectItem>
                                <SelectItem value="Bungoma">Bungoma</SelectItem>
                                <SelectItem value="Kisii">Kisii</SelectItem>
                                <SelectItem value="Garissa">Garissa</SelectItem>
                                <SelectItem value="Custom">Custom Location</SelectItem>
                              </SelectContent>
                            </Select>
                            {location === 'Custom' && (
                              <Input
                                type="text"
                                placeholder="Enter your city/town name"
                                value={customLocation || ''}
                                onChange={(e) => setCustomLocation(e.target.value)}
                                className="border-gray-300 focus:border-blue-500 text-sm mt-2"
                              />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="community" className="text-gray-700 font-medium text-sm">Community</Label>
                          <Select value={community} onValueChange={setCommunity}>
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 text-sm">
                              <SelectValue placeholder="Select your community" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Kikuyu">Kikuyu</SelectItem>
                              <SelectItem value="Luo">Luo</SelectItem>
                              <SelectItem value="Kamba">Kamba</SelectItem>
                              <SelectItem value="Luhya">Luhya</SelectItem>
                              <SelectItem value="Kisii">Kisii</SelectItem>
                              <SelectItem value="Meru">Meru</SelectItem>
                              <SelectItem value="Embu">Embu</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Work Experience */}
                      <div className="space-y-6">
                        <h5 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">Work Experience</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="experience" className="text-gray-700 font-medium text-sm">Experience</Label>
                            <Select value={experience} onValueChange={setExperience}>
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 text-sm">
                                <SelectValue placeholder="Select experience" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="No Experience">No Experience</SelectItem>
                                <SelectItem value="1 Year">1 Year</SelectItem>
                                <SelectItem value="2 Years">2 Years</SelectItem>
                                <SelectItem value="3+ Years">3+ Years</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="education" className="text-gray-700 font-medium text-sm">Education</Label>
                            <Select value={education} onValueChange={setEducation}>
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 text-sm">
                                <SelectValue placeholder="Select education" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Primary School">Primary School</SelectItem>
                                <SelectItem value="Class 8+">Class 8+</SelectItem>
                                <SelectItem value="Form 4+">Form 4+</SelectItem>
                                <SelectItem value="Higher">Higher Education</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Work Preferences */}
                      <div className="space-y-6">
                        <h5 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">Work Preferences</h5>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="accommodationType" className="text-gray-700 font-medium text-sm">Live-in or Live-out?</Label>
                            <Select value={accommodationType} onValueChange={setAccommodationType}>
                              <SelectTrigger className="border-gray-300 focus:border-blue-500 text-sm">
                                <SelectValue placeholder="Select preference" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="live_in">Live-in</SelectItem>
                                <SelectItem value="live_out">Live-out</SelectItem>
                                <SelectItem value="both">Both are fine</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expectedSalary" className="text-gray-700 font-medium text-sm">Expected Salary (KSh)</Label>
                            <Input
                              id="expectedSalary"
                              type="number"
                              value={expectedSalary}
                              onChange={(e) => setExpectedSalary(e.target.value)}
                              placeholder="15000"
                              className="border-gray-300 focus:border-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">What can you do?</h5>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {['Cooking', 'Cleaning', 'Laundry', 'Childcare', 'Ironing', 'Shopping'].map((skill) => (
                            <label key={skill} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={skills.includes(skill)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSkills([...skills, skill]);
                                  } else {
                                    setSkills(skills.filter(s => s !== skill));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{skill}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Languages */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">Languages you speak</h5>
                        
                        <div className="grid grid-cols-2 gap-3">
                          {['English', 'Swahili', 'Kikuyu', 'Luo', 'Kamba', 'Other'].map((language) => (
                            <label key={language} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={languages.includes(language)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setLanguages([...languages, language]);
                                  } else {
                                    setLanguages(languages.filter(s => s !== language));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{language}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* About You */}
                      <div className="space-y-4">
                        <h5 className="text-sm font-medium text-blue-700 border-b border-blue-200 pb-2">Tell us about yourself</h5>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label htmlFor="bio" className="text-gray-700 font-medium text-sm">Brief description</Label>
                              <p className="text-xs text-gray-500 mt-1">
                                We'll create a professional description based on your details
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const generatedBio = generateBioDescription();
                                if (generatedBio) {
                                  setBio(generatedBio);
                                }
                              }}
                              className="text-xs h-7 px-2"
                            >
                              Auto-generate
                            </Button>
                          </div>
                          <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Click 'Auto-generate' to create a description based on your details, or write your own..."
                            className="w-full border-gray-300 focus:border-blue-500 text-sm rounded-md p-3 min-h-[80px] resize-none"
                            rows={3}
                          />
                          {bio && (
                            <p className="text-xs text-gray-500">
                              💡 You can edit this description to make it more personal
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
                {isLogin && (
                  <div className="text-right">
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-blue-600 hover:text-blue-700 text-xs p-0 h-auto"
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}
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

              {/* Google Sign In Button */}
              <div className="space-y-4">
                <Button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 font-medium flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Processing...' : 'Continue with Google'}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
              </div>

              {/* Sticky submit */}
              <div className="sticky bottom-0 -mx-6 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t px-6 py-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 font-semibold" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                </Button>
              </div>
            </form>

            {/* Bottom Section with Additional Info */}
            <div className="mt-12 text-center max-w-2xl mx-auto">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-center space-x-6 mb-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-600">Safe & Secure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Verified Profiles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Quick Setup</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Your information is protected and will only be shared with verified users
                </p>
              </div>
            </div>

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

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-gray-900">Reset Password</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-gray-700 font-medium">Email Address</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading || !email}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
