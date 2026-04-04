import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Phone, Mail, Star, MapPin, Clock, Shield, CreditCard, Lock, ExternalLink, AlertTriangle
} from 'lucide-react';
import { Housegirl } from '@/types/employer';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { API_BASE_URL } from '@/lib/apiConfig';
import { FirebaseAuthService } from '@/lib/firebaseAuth';

export const PESAPAL_PENDING_KEY = 'pesapal_pending_payment';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  housegirlId: string;
  housegirlName: string;
  jobId: string;
  onPaymentInitiated: () => void;
  onContactUnlocked: () => void;
}

export const UnlockModal = ({
  isOpen,
  onClose,
  housegirlId,
  housegirlName,
  jobId,
  onPaymentInitiated,
  onContactUnlocked,
}: UnlockModalProps) => {
  const { showErrorNotification } = useNotificationActions();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [unlockedContactDetails, setUnlockedContactDetails] = useState<{ email: string | null; phone_number: string | null } | null>(null);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    onPaymentInitiated(); // Notify parent that payment initiation has started

    try {
      const token = await FirebaseAuthService.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_BASE_URL}/api/employers/jobs/${jobId}/housegirls/${housegirlId}/unlock-contact`, {
        method: 'POST',
        headers,
      });

      const data = await response.json();

      if (response.ok) {
        // If contact was already unlocked, backend returns details directly
        if (data.contact_details) {
          setUnlockedContactDetails(data.contact_details);
          onContactUnlocked();
        } else if (data.redirect_url) {
          // Payment initiated, redirect to Pesapal
          const redirectUrl: string = data.redirect_url;
          try {
            const parsed = new URL(redirectUrl);
            if (!parsed.hostname.endsWith('pesapal.com')) throw new Error('Invalid redirect');
          } catch {
            throw new Error('Invalid payment redirect destination.');
          }
          localStorage.setItem(PESAPAL_PENDING_KEY, JSON.stringify({
            order_tracking_id: data.order_tracking_id,
            package_id: 'apply_contact_unlock',
            job_id: jobId,
            housegirl_id: housegirlId,
            redirect_after: window.location.pathname, // Redirect back to current page
          }));
          window.location.href = redirectUrl;
        }
      } else {
        throw new Error(data?.error || 'Failed to initiate contact unlock.');
      }

    } catch (error) {
      showErrorNotification(
        'Contact Unlock Error',
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  if (!isOpen) return null;

  // When contact is unlocked, display details directly
  if (unlockedContactDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-green-600" />
              <span>Contact Unlocked - {housegirlName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-700">You have successfully unlocked the contact details for {housegirlName}:</p>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{unlockedContactDetails.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{unlockedContactDetails.phone_number}</span>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-gray-500">These details are also available on the applicant's profile within the job posting.</p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button onClick={onClose} className="bg-[#111] hover:bg-[#333] text-white">Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
            {/* Removed housegirlToUnlock specific display - will be handled by parent for now */}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{housegirlName}</h3>
              <p className="text-sm text-gray-600">Applicant for Job ID: {jobId}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Payment Details:</div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Contact Unlock Fee</span>
                <span className="font-bold text-blue-600">KES 100</span>
              </div>
              <div className="text-sm text-gray-600">
                Get access to phone number and email address
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Secure Payment via Pesapal</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Pay with M-Pesa, card, or bank — you'll be redirected to Pesapal's secure checkout.
              </div>
            </div>

            {housegirlToUnlock.status === 'unavailable' && (
              <div className="text-sm text-amber-700">⚠️ This person may be unavailable due to high demand.</div>
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
              disabled={isUnlocking}
              className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isUnlocking ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Redirecting to Pesapal...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Pay KES 100 via Pesapal</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
