import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { initiateMpesaPayment, initiateCardPayment, PaymentResponse } from '@/lib/payment';
import { toast } from '@/hooks/use-toast';
import ReturnToHome from '@/components/ReturnToHome';
import { 
  User, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Home, 
  Phone, 
  Mail, 
  Calendar,
  Heart,
  Shield,
  CheckCircle,
  X,
  CreditCard,
  Smartphone,
  Lock,
  Eye,
  Star
} from 'lucide-react';

interface HousegirlProfile {
  id: number;
  name: string;
  age: number;
  nationality: string;
  location: string;
  community: string;
  experience: string;
  education: string;
  salary: string;
  accommodation: string;
  status: string;
  image?: string;
  bio?: string;
  phoneNumber?: string;
  email?: string;
  skills?: string[];
  references?: string[];
  languages?: string[];
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  housegirl: HousegirlProfile | null;
}

const ProfileModal = ({ isOpen, onClose, housegirl }: ProfileModalProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  if (!housegirl) return null;

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make a payment.",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === 'mpesa' && !phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your M-Pesa phone number.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      let paymentResponse: PaymentResponse;

      if (paymentMethod === 'mpesa') {
        paymentResponse = await initiateMpesaPayment({
          phoneNumber,
          amount: 200,
          reference: `PROFILE_${housegirl.id}_${user.id}`,
          description: `Unlock ${housegirl.name}'s profile`
        });
      } else {
        paymentResponse = await initiateCardPayment({
          amount: 200,
          reference: `PROFILE_${housegirl.id}_${user.id}`,
          description: `Unlock ${housegirl.name}'s profile`
        });
      }

      if (paymentResponse.success) {
        setPaymentCompleted(true);
        setShowContactInfo(true);
        toast({
          title: "Payment Successful!",
          description: paymentResponse.message,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: paymentResponse.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "An error occurred during payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const resetPayment = () => {
    setPaymentCompleted(false);
    setShowContactInfo(false);
    setPhoneNumber('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {housegirl.name}'s Profile
            </DialogTitle>
            <ReturnToHome variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700" />
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Profile Header */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                        {housegirl.image ? (
                          <img 
                            src={housegirl.image} 
                            alt={housegirl.name}
                            className="w-32 h-32 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-16 w-16 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{housegirl.name}</h3>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {housegirl.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{housegirl.bio || 'Professional house help with excellent experience in domestic work.'}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-600">{housegirl.age} years old</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-600">{housegirl.location}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-600">{housegirl.experience}</span>
                          </div>
                          <div className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-gray-600">{housegirl.education}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills & Languages */}
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Skills & Languages</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {housegirl.skills?.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                              {skill}
                            </Badge>
                          )) || (
                            <>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">Cooking</Badge>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">Cleaning</Badge>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">Laundry</Badge>
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700">Childcare</Badge>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Languages</h5>
                        <div className="flex flex-wrap gap-2">
                          {housegirl.languages?.map((language, index) => (
                            <Badge key={index} variant="outline">
                              {language}
                            </Badge>
                          )) || (
                            <>
                              <Badge variant="outline">English</Badge>
                              <Badge variant="outline">Swahili</Badge>
                              <Badge variant="outline">Kikuyu</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Detailed Information</h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Personal Details</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Full Name:</span>
                              <span className="font-medium">{housegirl.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Age:</span>
                              <span className="font-medium">{housegirl.age} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nationality:</span>
                              <span className="font-medium">{housegirl.nationality}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Community:</span>
                              <span className="font-medium">{housegirl.community}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Work Details</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Experience:</span>
                              <span className="font-medium">{housegirl.experience}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Education:</span>
                              <span className="font-medium">{housegirl.education}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Accommodation:</span>
                              <span className="font-medium">{housegirl.accommodation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Expected Salary:</span>
                              <span className="font-medium">{housegirl.salary}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                    
                    {!showContactInfo ? (
                      <div className="text-center py-8">
                        <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
                          <Lock className="h-8 w-8 text-gray-500" />
                        </div>
                        <h5 className="text-lg font-medium text-gray-900 mb-2">Contact Details Locked</h5>
                        <p className="text-gray-600 mb-6">
                          Unlock {housegirl.name}'s contact information for just <span className="font-bold text-blue-600">KES 200</span>
                        </p>
                        
                        {!paymentCompleted ? (
                          <div className="space-y-4">
                            <div className="flex justify-center space-x-4">
                              <Button
                                variant={paymentMethod === 'mpesa' ? 'default' : 'outline'}
                                onClick={() => setPaymentMethod('mpesa')}
                                className="flex items-center space-x-2"
                              >
                                <Smartphone className="h-4 w-4" />
                                <span>M-Pesa</span>
                              </Button>
                              <Button
                                variant={paymentMethod === 'card' ? 'default' : 'outline'}
                                onClick={() => setPaymentMethod('card')}
                                className="flex items-center space-x-2"
                              >
                                <CreditCard className="h-4 w-4" />
                                <span>Card</span>
                              </Button>
                            </div>
                            
                            {paymentMethod === 'mpesa' && (
                              <div className="max-w-xs mx-auto">
                                <input
                                  type="tel"
                                  placeholder="Enter M-Pesa phone number"
                                  value={phoneNumber}
                                  onChange={(e) => setPhoneNumber(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            )}
                            
                            <Button
                              onClick={handlePayment}
                              disabled={isProcessingPayment || (paymentMethod === 'mpesa' && !phoneNumber)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isProcessingPayment ? (
                                <div className="flex items-center space-x-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Processing...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <span>Pay KES 200</span>
                                  {paymentMethod === 'mpesa' && <Smartphone className="h-4 w-4" />}
                                  {paymentMethod === 'card' && <CreditCard className="h-4 w-4" />}
                                </div>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="p-4 bg-green-100 rounded-full inline-block mb-4">
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h5 className="text-lg font-medium text-green-900 mb-2">Payment Successful!</h5>
                            <p className="text-gray-600 mb-4">You can now view the contact details below.</p>
                            <Button onClick={resetPayment} variant="outline" size="sm">
                              Reset Payment
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-green-800">
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-medium">Contact Information Unlocked</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Phone className="h-5 w-5 text-blue-600" />
                              <h5 className="font-medium text-gray-900">Phone Number</h5>
                            </div>
                            <p className="text-lg font-mono text-gray-900">{housegirl.phoneNumber || '+254 700 000 000'}</p>
                          </div>
                          
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Mail className="h-5 w-5 text-blue-600" />
                              <h5 className="font-medium text-gray-900">Email</h5>
                            </div>
                            <p className="text-lg font-mono text-gray-900">{housegirl.email || `${housegirl.name.toLowerCase().replace(' ', '.')}@example.com`}</p>
                          </div>
                        </div>
                        
                        <div className="text-center pt-4">
                          <Button 
                            onClick={() => setShowContactInfo(false)}
                            variant="outline"
                            size="sm"
                          >
                            Hide Contact Info
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Payment & Actions */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('contact')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Contact Info
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Save to Favorites
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Report Issue
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Profile Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{housegirl.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{housegirl.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Education:</span>
                    <span className="font-medium">{housegirl.education}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salary:</span>
                    <span className="font-medium text-blue-600">{housegirl.salary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {housegirl.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
