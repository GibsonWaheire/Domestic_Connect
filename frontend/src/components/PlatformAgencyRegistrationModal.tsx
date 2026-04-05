import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { Building2, Eye, EyeOff, X } from 'lucide-react';

interface PlatformAgencyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SERVICES_OPTIONS = [
  { id: 'housegirls', label: 'Housegirls' },
  { id: 'nannies', label: 'Nannies' },
  { id: 'cooks', label: 'Cooks' },
  { id: 'cleaners', label: 'Cleaners' },
  { id: 'elderly_care', label: 'Elderly Care' },
  { id: 'gardeners', label: 'Gardeners' },
  { id: 'drivers', label: 'Drivers' },
];

const LOCATIONS = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Other'];

const PlatformAgencyRegistrationModal = ({ isOpen, onClose }: PlatformAgencyRegistrationModalProps) => {
  const [agencyName, setAgencyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [location, setLocation] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const toggleService = (id: string) => {
    setServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Weak Password', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (services.length === 0) {
      toast({ title: 'Services Required', description: 'Please select at least one service.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(contactEmail, password, 'agency', {
        agency_name: agencyName,
        license_number: licenseNumber,
        location,
        services,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        website: website || null,
      });

      if (error) {
        toast({ title: 'Registration Failed', description: error, variant: 'destructive' });
      } else {
        toast({ title: 'Success!', description: 'Your agency has been registered. Welcome to Domestic Connect!', variant: 'default' });
        onClose();
        navigate('/agency-dashboard');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-xl relative my-8 mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white/90 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-full p-3 shadow-lg border border-gray-200 hover:border-red-300 transition-all duration-200 z-10"
        >
          <X className="h-6 w-6" />
        </Button>

        <Card className="w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 ml-3">List Your Agency</h1>
            </div>
            <CardTitle className="text-xl text-gray-900">Register on Domestic Connect</CardTitle>
            <CardDescription className="text-gray-600">
              Reach thousands of verified Kenyan families. Plans from KSh 1,200/month.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Agency Details */}
              <div className="space-y-4 p-5 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800">Agency Details</h4>

                <div className="space-y-2">
                  <Label htmlFor="agencyName">Agency Name *</Label>
                  <Input
                    id="agencyName"
                    value={agencyName}
                    onChange={e => setAgencyName(e.target.value)}
                    required
                    placeholder="e.g. Sunrise Domestic Agency"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number (NITA) *</Label>
                  <Input
                    id="licenseNumber"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    required
                    placeholder="e.g. NITA-2024-00123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={location} onValueChange={setLocation} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city / county" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map(l => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Services Offered *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SERVICES_OPTIONS.map(opt => (
                      <label key={opt.id} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                        <Checkbox
                          checked={services.includes(opt.id)}
                          onCheckedChange={() => toggleService(opt.id)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800">Contact Information</h4>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    required
                    placeholder="agency@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    required
                    placeholder="07XX XXX XXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    value={website}
                    onChange={e => setWebsite(e.target.value)}
                    placeholder="https://youragency.co.ke"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800">Set Password</h4>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="pr-10"
                      placeholder="At least 6 characters"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                      placeholder="Repeat password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 font-semibold"
                disabled={loading}
              >
                {loading ? 'Registering...' : 'Register Agency'}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                By registering, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformAgencyRegistrationModal;
