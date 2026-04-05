import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '@/lib/apiConfig';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { PESAPAL_PENDING_KEY } from '@/components/employer/UnlockModal';

type Status = 'checking' | 'completed' | 'failed';

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('checking');
  const [message, setMessage] = useState('Verifying your payment, please wait...');

  useEffect(() => {
    const orderTrackingId = searchParams.get('OrderTrackingId');

    if (!orderTrackingId) {
      setStatus('failed');
      setMessage('No payment reference found. Please contact support if you were charged.');
      return;
    }

    const pendingRaw = localStorage.getItem(PESAPAL_PENDING_KEY);
    const pendingData = pendingRaw ? JSON.parse(pendingRaw) : null;

    verifyPayment(orderTrackingId, pendingData);
  }, []);

  const verifyPayment = async (orderTrackingId: string, pendingData: any) => {
    let token: string | null = null;
    try {
      token = await FirebaseAuthService.getIdToken();
    } catch {
      // User may not be logged in on first load — retry below
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let attempts = 0;
    const maxAttempts = 20;

    const poll = async () => {
      try {
        // Refresh token if needed
        if (!token) {
          token = await FirebaseAuthService.getIdToken().catch(() => null);
          if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_BASE_URL}/api/payments/purchase-status/${orderTrackingId}`,
          { headers }
        );
        const data = await response.json();

        if (data.status === 'completed') {
          await handlePostPayment(pendingData, headers);
          // Keep PESAPAL_PENDING_KEY in localStorage — the destination page
          // (AppliedHousegirlsList.checkPendingUnlock) reads it on mount to
          // show the "Payment received!" toast, then removes it.
          setStatus('completed');
          setMessage('Payment confirmed! Redirecting you...');

          // Only allow known relative paths — prevent open redirect via localStorage tampering
          const ALLOWED_REDIRECTS = ['/employer-dashboard', '/housegirl-dashboard', '/agency-dashboard'];
          const raw = pendingData?.redirect_after;
          const redirectTo = ALLOWED_REDIRECTS.includes(raw) ? raw : '/employer-dashboard';
          setTimeout(() => navigate(redirectTo), 3000);

        } else if (data.status === 'failed') {
          setStatus('failed');
          setMessage('Payment was not completed. No charge was made.');

        } else {
          // Still pending — keep polling
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 4000);
          } else {
            setStatus('failed');
            setMessage(
              'Payment confirmation is taking too long. If you completed the payment, please contact support with your order reference: ' +
              orderTrackingId
            );
          }
        }
      } catch {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 4000);
        } else {
          setStatus('failed');
          setMessage('Could not verify payment status. If you were charged, contact support.');
        }
      }
    };

    await poll();
  };

  const handlePostPayment = async (pendingData: any, headers: Record<string, string>) => {
    if (!pendingData) return;

    // For contact unlock — ensure contact-access record exists (idempotent)
    if (pendingData.package_id === 'contact_unlock' && pendingData.target_profile_id) {
      await fetch(`${API_BASE_URL}/api/payments/contact-access`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          target_profile_id: pendingData.target_profile_id,
          housegirl_id: pendingData.housegirl_id,
        }),
      }).catch(() => {});
    }

    // For agency packages — create agency-client record
    if (pendingData.package_id !== 'contact_unlock' && pendingData.agency_id) {
      await fetch(`${API_BASE_URL}/api/agencies/clients`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: `ac_${Date.now()}`,
          agency_id: pendingData.agency_id,
          client_id: pendingData.client_id,
          hiring_fee: pendingData.amount,
          placement_status: 'registered',
          hire_date: new Date().toISOString(),
          package_type: pendingData.package_id,
          commission_paid: pendingData.agency_fee,
          platform_fee_paid: pendingData.platform_fee,
          dispute_resolution: null,
          terms_accepted: true,
        }),
      }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {status === 'checking' && (
            <>
              <Loader2 className="h-14 w-14 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Payment</h2>
              <p className="text-gray-500 text-sm">{message}</p>
              <p className="text-gray-400 text-xs mt-3">Please do not close this page.</p>
            </>
          )}

          {status === 'completed' && (
            <>
              <CheckCircle2 className="h-14 w-14 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 text-sm">{message}</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Not Confirmed</h2>
              <p className="text-gray-600 text-sm mb-6">{message}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/employer-dashboard')}
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
                <p className="text-xs text-gray-400">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@domestic-connect.co.ke" className="underline">
                    support@domestic-connect.co.ke
                  </a>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallbackPage;
