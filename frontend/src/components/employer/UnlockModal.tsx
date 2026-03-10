import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Phone, Mail, Star, MapPin, Clock, Shield, CreditCard, Lock
} from 'lucide-react';
import { Housegirl } from '@/types/employer';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { API_BASE_URL } from '@/lib/apiConfig';
import { FirebaseAuthService } from '@/lib/firebaseAuth';

interface UnlockModalProps {
  showUnlockModal: boolean;
  setShowUnlockModal: (show: boolean) => void;
  housegirlToUnlock: Housegirl | null;
  isUnlocking: boolean;
  setIsUnlocking: (unlocking: boolean) => void;
  employerPhone?: string;
  onUnlockSuccess: (payload: { housegirlId: number; phone?: string; email?: string }) => void;
}

export const UnlockModal = ({ 
  showUnlockModal, 
  setShowUnlockModal, 
  housegirlToUnlock, 
  isUnlocking, 
  setIsUnlocking,
  employerPhone,
  onUnlockSuccess
}: UnlockModalProps) => {
  const { showSuccessNotification, showInfoNotification } = useNotificationActions();
  const [isPaymentPending, setIsPaymentPending] = useState(false);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleUnlock = async () => {
    if (!housegirlToUnlock) return;

    setIsUnlocking(true);
    setIsPaymentPending(false);

    try {
      const token = await FirebaseAuthService.getIdToken();
      const housegirlResponse = await fetch(`${API_BASE_URL}/api/housegirls/${housegirlToUnlock.id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const housegirlData = await housegirlResponse.json().catch(() => ({}));
      const targetProfileId = housegirlData?.profile_id;
      if (!targetProfileId) {
        throw new Error('Unable to identify this profile for unlock.');
      }

      const purchaseResponse = await fetch(`${API_BASE_URL}/api/payments/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          package_id: 'contact_unlock',
          phone: employerPhone,
          phone_number: employerPhone,
          amount: 200,
        }),
      });

      const purchaseData = await purchaseResponse.json().catch(() => ({}));
      if (!purchaseResponse.ok || !purchaseData?.checkout_request_id) {
        throw new Error(purchaseData?.error || 'Failed to initiate payment.');
      }

      const checkoutRequestId = purchaseData.checkout_request_id as string;
      setIsPaymentPending(true);
      showInfoNotification(
        'Payment pending',
        'Check your phone for M-Pesa prompt. Enter your M-Pesa PIN to complete.'
      );

      const timeoutAt = Date.now() + 120000;
      let paymentStatus = 'pending';
      while (Date.now() < timeoutAt) {
        await wait(3000);
        const statusResponse = await fetch(`${API_BASE_URL}/api/payments/purchase-status/${checkoutRequestId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const statusData = await statusResponse.json().catch(() => ({}));
        paymentStatus = statusData?.status || 'pending';
        if (paymentStatus === 'completed') {
          break;
        }
        if (paymentStatus === 'failed') {
          throw new Error('Payment failed. Please try again.');
        }
      }

      if (paymentStatus !== 'completed') {
        throw new Error('Payment not confirmed. Please try again.');
      }

      const unlockResponse = await fetch(`${API_BASE_URL}/api/payments/contact-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ target_profile_id: String(targetProfileId), housegirl_id: String(housegirlToUnlock.id) }),
      });
      const unlockData = await unlockResponse.json().catch(() => ({}));
      if (!unlockResponse.ok) {
        throw new Error(unlockData?.error || 'Failed to unlock contact.');
      }

      const detailsResponse = await fetch(`${API_BASE_URL}/api/housegirls/${housegirlToUnlock.id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const detailsData = await detailsResponse.json().catch(() => ({}));

      onUnlockSuccess({
        housegirlId: housegirlToUnlock.id,
        phone: detailsData?.phone || detailsData?.phone_number || undefined,
        email: detailsData?.email || undefined,
      });

      setShowUnlockModal(false);
      showSuccessNotification('Contact unlocked successfully!', 'You can now view phone and email details.');
    } catch (error) {
      showInfoNotification(
        'Payment error',
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsPaymentPending(false);
      setIsUnlocking(false);
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
              src={housegirlToUnlock.profileImage || '/placeholder.svg'}
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
            {housegirlToUnlock.status === 'unavailable' && (
              <div className="text-sm text-amber-700">⚠️ This person may be unavailable due to high demand.</div>
            )}
            {isPaymentPending && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center space-x-2 text-amber-800">
                  <div className="w-4 h-4 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Check your phone for M-Pesa prompt</span>
                </div>
                <div className="text-sm text-amber-700 mt-1">Enter your M-Pesa PIN to complete</div>
              </div>
            )}
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
              disabled={isUnlocking || isPaymentPending}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isUnlocking ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isPaymentPending ? 'Payment Pending...' : 'Initiating Payment...'}</span>
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
