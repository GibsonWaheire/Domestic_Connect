import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Phone, Mail, Star, MapPin, Clock, Shield, CreditCard, Lock
} from 'lucide-react';
import { Housegirl } from '@/types/employer';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface UnlockModalProps {
  showUnlockModal: boolean;
  setShowUnlockModal: (show: boolean) => void;
  housegirlToUnlock: Housegirl | null;
  isUnlocking: boolean;
  setIsUnlocking: (unlocking: boolean) => void;
}

export const UnlockModal = ({ 
  showUnlockModal, 
  setShowUnlockModal, 
  housegirlToUnlock, 
  isUnlocking, 
  setIsUnlocking 
}: UnlockModalProps) => {
  const { showSuccessNotification, showInfoNotification } = useNotificationActions();

  const handleUnlock = async () => {
    if (!housegirlToUnlock) return;
    
    setIsUnlocking(true);
    
    // TODO: Integrate with Daraja API for M-Pesa STK Push
    // For now, simulate payment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update the housegirl's contact status to unlocked
    housegirlToUnlock.contactUnlocked = true;
    housegirlToUnlock.unlockCount = (housegirlToUnlock.unlockCount || 0) + 1;
    
    setIsUnlocking(false);
    setShowUnlockModal(false);
    
    // Show detailed unlock statistics
    const currentUserUnlocks = 1; // This would come from backend
    const totalUnlocks = housegirlToUnlock.unlockCount;
    const otherUsersUnlocks = totalUnlocks - currentUserUnlocks;
    
    showSuccessNotification(
      "Contact Unlocked Successfully!", 
      `You've unlocked this contact ${currentUserUnlocks} time(s). Total unlocks: ${totalUnlocks} (${otherUsersUnlocks} by other users)`
    );
    
    // Show additional alert for high unlock counts
    if (totalUnlocks > 5) {
      setTimeout(() => {
        showInfoNotification(
          "Popular Profile", 
          `This housegirl's contact has been unlocked ${totalUnlocks} times! She's in high demand.`
        );
      }, 1000);
    }
  };

  if (!housegirlToUnlock) return null;

  return (
    <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5 text-orange-600" />
            <span>Unlock Contact - {housegirlToUnlock.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Housegirl Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <img
              src={housegirlToUnlock.profileImage || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'}
              alt={housegirlToUnlock.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{housegirlToUnlock.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{housegirlToUnlock.age} years</span>
                <span>•</span>
                <span>{housegirlToUnlock.experience}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{housegirlToUnlock.location}</span>
              </div>
            </div>
            {housegirlToUnlock.rating && (
              <div className="flex items-center space-x-1 text-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{housegirlToUnlock.rating}</span>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Payment Details:</div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Contact Unlock Fee</span>
                <span className="font-bold text-blue-600">KES 200</span>
              </div>
              <div className="text-sm text-gray-600">
                Get access to phone number and email address
              </div>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Secure Payment</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Payment will be processed via M-Pesa STK Push
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowUnlockModal(false)}
              disabled={isUnlocking}
              className="hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={isUnlocking}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isUnlocking ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                                      <CreditCard className="h-4 w-4" />
                    <span>Pay KES 200</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
