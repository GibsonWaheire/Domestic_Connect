import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/lib/apiConfig';
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { PESAPAL_PENDING_KEY } from '@/components/employer/UnlockModal';

export interface PackageDetails {
  id: string;
  name: string;
  price: number;
  agencyFee: number;
  platformFee: number;
  features: string[];
  color: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface PaymentModalProps {
  package: PackageDetails;
  agency: {
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
  };
  targetProfileId?: string;
  housegirlId?: string;
  redirectAfter?: string;
  onClose: () => void;
  onSuccess: (paymentData: {
    id: string;
    client_id: string;
    agency_id: string;
    package_id: string;
    amount: number;
    agency_fee: number;
    platform_fee: number;
    phone_number: string;
    status: string;
    payment_method: string;
    created_at: string;
    agency_client_id: string;
    terms_accepted: boolean;
    order_tracking_id?: string;
  }) => void;
}

const PaymentModal = ({ package: packageDetails, agency, targetProfileId, housegirlId, redirectAfter, onClose, onSuccess }: PaymentModalProps) => {
  const { user } = useAuth();
  const { showErrorNotification } = useNotificationActions();
  const [isProcessing, setIsProcessing] = useState(false);

  const getAuthHeaders = async () => {
    try {
      const { FirebaseAuthService } = await import('@/lib/firebaseAuth');
      const token = await FirebaseAuthService.getIdToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const authHeaders = await getAuthHeaders();

      const purchaseResponse = await fetch(`${API_BASE_URL}/api/payments/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          package_id: packageDetails.id,
          amount: packageDetails.price,
          ...(targetProfileId ? { target_profile_id: targetProfileId } : {}),
          ...(housegirlId ? { housegirl_id: housegirlId } : {}),
        }),
      });

      const purchaseData = await purchaseResponse.json();

      if (!purchaseResponse.ok || !purchaseData?.redirect_url) {
        throw new Error(purchaseData?.error || 'Failed to initiate payment');
      }

      // Store context for the callback page to complete the agency-client record
      localStorage.setItem(PESAPAL_PENDING_KEY, JSON.stringify({
        order_tracking_id: purchaseData.order_tracking_id,
        purchase_id: purchaseData.purchase_id,
        package_id: packageDetails.id,
        agency_id: agency.id,
        client_id: user?.id,
        amount: packageDetails.price,
        agency_fee: packageDetails.agencyFee,
        platform_fee: packageDetails.platformFee,
        agency_name: agency.name,
        target_profile_id: targetProfileId || null,
        housegirl_id: housegirlId || null,
        redirect_after: redirectAfter || '/employer-dashboard',
      }));

      // Validate redirect_url is a Pesapal domain before redirecting (prevent open redirect)
      const redirectUrl = new URL(purchaseData.redirect_url);
      if (!redirectUrl.hostname.endsWith('pesapal.com')) {
        throw new Error('Invalid payment redirect destination.');
      }
      window.location.href = redirectUrl.toString();

    } catch (error) {
      console.error('Payment error:', error);
      showErrorNotification('Payment Failed', error instanceof Error ? error.message : 'Please try again or contact support');
      setIsProcessing(false);
    }
  };

  const getIconColor = () => {
    switch (packageDetails.color) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getBorderColor = () => {
    switch (packageDetails.color) {
      case 'green': return 'border-green-300';
      case 'blue': return 'border-blue-300';
      case 'purple': return 'border-purple-300';
      default: return 'border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <span>Complete Registration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Package Summary */}
          <div className={`border-2 ${getBorderColor()} rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <packageDetails.icon className={`h-5 w-5 ${getIconColor()}`} />
                <h3 className="font-semibold text-gray-900">{packageDetails.name} Package</h3>
              </div>
              <Badge className={`bg-${packageDetails.color}-100 text-${packageDetails.color}-800`}>
                KES {packageDetails.price.toLocaleString()}
              </Badge>
            </div>
            <ul className="text-sm space-y-1">
              {packageDetails.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Agency Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Agency Details</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {agency.name}</p>
              <p><strong>License:</strong> {agency.license_number}</p>
              <p><strong>Rating:</strong> ⭐ {agency.rating}</p>
              <p><strong>Verified Workers:</strong> {agency.verified_workers}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Secure Payment via Pesapal</span>
            </div>
            <p className="text-sm text-blue-700">
              You'll be redirected to Pesapal's secure checkout page where you can pay via M-Pesa, debit/credit card, or bank transfer.
            </p>
          </div>

          {/* Terms */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Terms & Conditions</p>
                <ul className="space-y-1 text-xs">
                  <li>• This is a registration and connection fee</li>
                  <li>• Agency will contact you within 24 hours</li>
                  <li>• Additional fees may apply for specific placements</li>
                  <li>• Refunds subject to agency terms</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay KES {packageDetails.price.toLocaleString()} via Pesapal
                  <ExternalLink className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;
