import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, Mail, Star, MapPin, Clock, Shield, CreditCard, Lock, Users, Calendar, Award
} from 'lucide-react';
import { Housegirl } from '@/types/employer';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  housegirl: Housegirl | null;
  onUnlockContact: (housegirl: Housegirl) => void;
}

export const ProfileModal = ({ 
  isOpen, 
  onClose, 
  housegirl, 
  onUnlockContact 
}: ProfileModalProps) => {
  const { showInfoNotification } = useNotificationActions();

  if (!housegirl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>{housegirl.name}'s Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start space-x-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <div className="relative">
              <img
                src={housegirl.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'}
                alt={housegirl.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
              {housegirl.rating && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-sm rounded-full px-2 py-1 flex items-center shadow-lg">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {housegirl.rating}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{housegirl.name}</h2>
                  <p className="text-lg text-gray-600">{housegirl.age} years old</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
                  AVAILABLE
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{housegirl.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{housegirl.experience} experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{housegirl.education}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{housegirl.workType}</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="text-lg font-semibold text-gray-900">{housegirl.salary}</div>
                <p className="text-sm text-gray-600">Expected salary</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-orange-600" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {housegirl.contactUnlocked ? (
                <div className="space-y-4">
                  {/* Unlock Statistics */}
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="font-medium text-yellow-800">Unlock Statistics</span>
                    </div>
                    <div className="text-sm text-yellow-700">
                      <div className="flex justify-between mb-1">
                        <span>Total Unlocks:</span>
                        <span className="font-semibold">{housegirl.unlockCount || 0} times</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Your Unlocks:</span>
                        <span className="font-semibold">1 time</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Other Users:</span>
                        <span className="font-semibold">{(housegirl.unlockCount || 1) - 1} times</span>
                      </div>
                    </div>
                    {(housegirl.unlockCount || 0) > 5 && (
                      <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded text-xs text-orange-800">
                        ⚡ This profile is in high demand!
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Phone Number</div>
                      <div className="text-sm text-gray-600">+254 700 123 456</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Email Address</div>
                      <div className="text-sm text-gray-600">{housegirl.name.toLowerCase().replace(' ', '.')}@email.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => {
                        showInfoNotification(
                          "Call Initiated", 
                          "Calling housegirl's phone number..."
                        );
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="hover:bg-blue-50 hover:border-blue-300"
                      onClick={() => {
                        showInfoNotification(
                          "Email Opened", 
                          "Opening email client..."
                        );
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lock className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-800">Contact Locked</span>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                      Unlock contact information to get phone number and email address
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Unlock Fee:</span>
                      <span className="font-bold text-orange-600">KES 200</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => onUnlockContact(housegirl)}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Unlock Contact (KES 200)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                <p className="text-sm text-gray-600">
                  Experienced housegirl with {housegirl.experience} of professional experience. 
                  Specializes in {housegirl.workType.toLowerCase()} work and is available for {housegirl.livingArrangement.toLowerCase()}.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Cooking</Badge>
                  <Badge className="bg-green-100 text-green-800">Cleaning</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Laundry</Badge>
                  <Badge className="bg-orange-100 text-orange-800">Childcare</Badge>
                  <Badge className="bg-pink-100 text-pink-800">Elderly Care</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gray-100 text-gray-800">English</Badge>
                  <Badge className="bg-gray-100 text-gray-800">Swahili</Badge>
                  <Badge className="bg-gray-100 text-gray-800">Kikuyu</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
