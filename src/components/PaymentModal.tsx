import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  DollarSign, 
  Phone, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNotificationActions } from '@/hooks/useNotificationActions';

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
    mpesa_checkout_request_id?: string;
    mpesa_merchant_request_id?: string;
    transaction_id?: string;
  }) => void;
}

const PaymentModal = ({ package: packageDetails, agency, onClose, onSuccess }: PaymentModalProps) => {
  const { user } = useAuth();
  const { showSuccessNotification, showErrorNotification } = useNotificationActions();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');

  const handlePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      showErrorNotification('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Real M-Pesa STK Push
      const stkPushResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          amount: packageDetails.price,
          reference: `DC_${user?.id}_${Date.now()}`,
          description: `${packageDetails.name} Package - ${agency.name}`
        }),
      });

      const stkPushResult = await stkPushResponse.json();

      if (!stkPushResult.success) {
        throw new Error(stkPushResult.message || 'STK Push failed');
      }

      // Wait for user to complete payment (in real implementation, you'd poll for status)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check transaction status
      const statusResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/mpesa/transaction-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkoutRequestId: stkPushResult.data.CheckoutRequestID
        }),
      });

      const statusResult = await statusResponse.json();

      if (!statusResult.success || statusResult.data.ResultCode !== '0') {
        throw new Error('Payment was not completed successfully');
      }

      // Create payment record
      const paymentData = {
        id: `payment_${Date.now()}`,
        client_id: user?.id,
        agency_id: agency.id,
        package_id: packageDetails.id,
        amount: packageDetails.price,
        agency_fee: packageDetails.agencyFee,
        platform_fee: packageDetails.platformFee,
        phone_number: phoneNumber,
        status: 'completed',
        payment_method: 'mpesa',
        created_at: new Date().toISOString(),
        agency_client_id: `ac_${Date.now()}`,
        terms_accepted: true,
        mpesa_checkout_request_id: stkPushResult.data.CheckoutRequestID,
        mpesa_merchant_request_id: stkPushResult.data.MerchantRequestID,
        transaction_id: statusResult.data.TransactionID || `TXN_${Date.now()}`
      };

      // Save to database
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/payments/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        // Create agency client record
        const agencyClientData = {
          id: paymentData.agency_client_id,
          agency_id: agency.id,
          client_id: user?.id,
          hiring_fee: packageDetails.price,
          placement_status: 'registered',
          hire_date: new Date().toISOString(),
          package_type: packageDetails.id,
          commission_paid: packageDetails.agencyFee,
          platform_fee_paid: packageDetails.platformFee,
          dispute_resolution: null,
          terms_accepted: true
        };

        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/agencies/clients`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(agencyClientData),
        });

        setPaymentStep('success');
        showSuccessNotification(
          'Payment Successful!', 
          `You've successfully registered with ${agency.name}. They will contact you within 24 hours.`
        );

        setTimeout(() => {
          onSuccess(paymentData);
        }, 2000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showErrorNotification('Payment Failed', 'Please try again or contact support');
      setPaymentStep('details');
    } finally {
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

  if (paymentStep === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-gray-600 mb-4">Please check your phone for M-Pesa prompt</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Enter your M-Pesa PIN when prompted</p>
              <p>• Wait for confirmation SMS</p>
              <p>• Do not close this window</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">
              You've been successfully connected to {agency.name}
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>Next Steps:</strong>
              </p>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Agency will contact you within 24 hours</li>
                <li>• Discuss your specific requirements</li>
                <li>• Get matched with verified workers</li>
              </ul>
            </div>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Phone className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">M-Pesa Payment</span>
              </div>
              <p className="text-sm text-blue-700">
                You'll receive an M-Pesa prompt on your phone to complete the payment.
              </p>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <Input
                type="tel"
                placeholder="e.g., 0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Enter the phone number registered with M-Pesa
              </p>
            </div>
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
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={!phoneNumber || isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay KES {packageDetails.price.toLocaleString()}
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
