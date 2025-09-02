import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { User, Building2, Eye, EyeOff, X, Shield, CheckCircle, Clock, Heart } from 'lucide-react';

interface AgencyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AgencyRegistrationModal = ({ isOpen, onClose }: AgencyRegistrationModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Fetch agencies
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const response = await fetch('http://localhost:3002/agencies');
        const data = await response.json();
        setAgencies(data);
      } catch (error) {
        console.error('Error fetching agencies:', error);
      }
    };

    if (isOpen) {
      fetchAgencies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      onClose();
      navigate('/housegirl-dashboard');
    }
  }, [user, onClose, navigate]);

  // Auto-generate bio description
  const generateBioDescription = () => {
    if (!age && !experience && !education && !skills.length && !languages.length) {
      return '';
    }

    let description = 'I am';

    if (age) {
      description += ` a ${age}-year-old`;
    } else {
      description += ' a';
    }

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

    if (skills.length > 0) {
      const skillText = skills.join(', ');
      description += ` I am skilled in ${skillText}.`;
    }

    if (languages.length > 0) {
      const languageText = languages.join(', ');
      description += ` I speak ${languageText}.`;
    }

    if (accommodationType === 'live_in') {
      description += ' I prefer live-in arrangements.';
    } else if (accommodationType === 'live_out') {
      description += ' I prefer live-out arrangements.';
    } else if (accommodationType === 'both') {
      description += ' I am flexible with accommodation arrangements.';
    }

    if (location && location !== 'Custom') {
      description += ` I am located in ${location}.`;
    } else if (location === 'Custom' && customLocation) {
      description += ` I am located in ${customLocation}.`;
    }

    if (education) {
      description += ` I have ${education} education.`;
    }

    if (community && community !== 'Other') {
      description += ` I am from the ${community} community.`;
    }

    if (expectedSalary) {
      description += ` My expected salary is KSh ${expectedSalary}.`;
    }

    description += ' I am looking for a good family to work with and I am committed to providing excellent service.';

    return description;
  };

  // Phone number validation and formatting for Kenya
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    }
    
    if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    }
    
    if (cleaned.startsWith('7')) {
      return '+254' + cleaned;
    }
    
    if (value.startsWith('+')) {
      return value;
    }
    
    if (cleaned.length === 9) {
      return '+254' + cleaned;
    }
    
    return value;
  };

  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    const phoneRegex = /^\+254[17]\d{8}$/;
    return phoneRegex.test(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
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

      if (!validatePhoneNumber(phoneNumber)) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX)",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (location === 'Custom' && !customLocation.trim()) {
        toast({
          title: "Location Required",
          description: "Please enter your custom location",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (!selectedAgency) {
        toast({
          title: "Agency Required",
          description: "Please select an agency to register with",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Sign up with agency
      const { error } = await signUp(email, password, 'housegirl', {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        age: parseInt(age) || 25,
        bio: bio || generateBioDescription(),
        current_location: location === 'Custom' ? customLocation : location || 'Nairobi',
        location: location === 'Custom' ? customLocation : location || 'Nairobi',
        education: education || 'Form 4 and Above',
        experience: experience || '2 Years',
        expected_salary: parseInt(expectedSalary) || 8000,
        accommodation_type: accommodationType || 'live_in',
        community: community || 'Kikuyu',
        skills: skills.length > 0 ? skills : ['Cooking', 'Cleaning', 'Laundry', 'Childcare'],
        languages: languages.length > 0 ? languages : ['English', 'Swahili'],
        agency_id: selectedAgency // Add agency ID to the registration
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully! You're now registered with the selected agency.",
          variant: "default"
        });
        onClose();
        navigate('/housegirl-dashboard');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-2xl relative my-8 mx-auto">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-full p-3 shadow-lg border border-gray-200 hover:border-red-300 transition-all duration-200 z-10"
        >
          <X className="h-6 w-6 font-bold" />
        </Button>

        <Card className="w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm max-h-[90vh] flex flex-col">
          <CardHeader className="text-center pb-4 shrink-0">
            <div className="flex items-center justify-center mb-4">
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 ml-3">
                Register with Agency
              </h1>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              Join an Agency for Better Opportunities
            </CardTitle>
            <CardDescription className="text-gray-600">
              Get professional training, better jobs, and ongoing support
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 py-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-8 pt-4 max-w-3xl mx-auto">
              {/* Agency Selection */}
              <div className="space-y-6 p-6 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-green-800 mb-4 text-center">Select Your Agency</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agency" className="text-gray-700 font-medium">Choose an Agency</Label>
                    <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                      <SelectTrigger className="border-gray-300 focus:border-green-500">
                        <SelectValue placeholder="Select an agency to register with" />
                      </SelectTrigger>
                      <SelectContent>
                        {agencies.map((agency) => (
                          <SelectItem key={agency.id} value={agency.id}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {agency.name}
                              <span className="text-xs text-gray-500">({agency.location})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedAgency && (
                    <div className="p-4 bg-white rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">Agency Benefits:</h5>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Professional training and certification</li>
                        <li>• Better job opportunities and higher salaries</li>
                        <li>• Background verification and trust building</li>
                        <li>• Ongoing support and dispute resolution</li>
                        <li>• Professional profile management</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-4 text-center">Your Information</h4>
                
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
                </div>

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
                    <Label htmlFor="location" className="text-gray-700 font-medium text-sm">Location</Label>
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

              {/* Account Details */}
              <div className="space-y-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Account Details</h4>
                
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
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

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
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 -mx-6 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-t px-6 py-4">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 font-semibold" 
                  disabled={loading || !selectedAgency}
                >
                  {loading ? 'Processing...' : 'Register with Agency'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  By registering, you agree to the agency's terms and conditions
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgencyRegistrationModal;
