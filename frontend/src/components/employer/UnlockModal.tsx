import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Mail, Shield, CreditCard, Lock, ExternalLink, CheckCircle2 } from 'lucide-react';
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
  const [unlockedContact, setUnlockedContact] = useState<{ email: string | null; phone_number: string | null } | null>(null);

  const handleUnlock = async () => {
    setIsUnlocking(true);
    onPaymentInitiated();

    try {
      const token = await FirebaseAuthService.getIdToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/employers/jobs/${jobId}/housegirls/${housegirlId}/unlock-contact`,
        { method: 'POST', headers }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.contact_details) {
          // Already unlocked or just unlocked — show contact directly
          setUnlockedContact(data.contact_details);
          onContactUnlocked();
        } else if (data.redirect_url) {
          const redirectUrl: string = data.redirect_url;
          try {
            const parsed = new URL(redirectUrl);
            if (!parsed.hostname.endsWith('pesapal.com')) throw new Error('Invalid redirect');
          } catch {
            throw new Error('Invalid payment redirect destination.');
          }
          localStorage.setItem(
            PESAPAL_PENDING_KEY,
            JSON.stringify({
              order_tracking_id: data.order_tracking_id,
              package_id: 'apply_contact_unlock',
              job_id: jobId,
              housegirl_id: housegirlId,
              redirect_after: window.location.pathname,
            })
          );
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

  // Show contact details after unlock
  if (unlockedContact) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Contact Unlocked — {housegirlName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {unlockedContact.phone_number && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">{unlockedContact.phone_number}</span>
              </div>
            )}
            {unlockedContact.email && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Mail className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">{unlockedContact.email}</span>
              </div>
            )}
            {!unlockedContact.phone_number && !unlockedContact.email && (
              <p className="text-sm text-gray-500 text-center py-2">
                No contact details on file for this applicant.
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              You can also message {housegirlName} directly through the platform.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={onClose} className="bg-[#111] hover:bg-[#333] text-white">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-500" />
            Unlock Contact — {housegirlName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Applicant info row */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-[#111] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {housegirlName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{housegirlName}</p>
              <p className="text-xs text-gray-500">Applicant for this job</p>
            </div>
          </div>

          {/* What you get */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">What you unlock</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-blue-500" /> Phone number
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-blue-500" /> Email address
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-blue-500" /> In-platform messaging
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <span className="text-sm text-gray-700">One-time unlock fee</span>
            <span className="text-base font-bold text-gray-900">KSh 100</span>
          </div>

          {/* Payment security note */}
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Shield className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Secure checkout via Pesapal — M-Pesa, card, or bank transfer accepted.</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isUnlocking}>
            Cancel
          </Button>
          <Button
            onClick={handleUnlock}
            disabled={isUnlocking}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isUnlocking ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirecting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Pay KSh 100
                <ExternalLink className="h-3 w-3" />
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
