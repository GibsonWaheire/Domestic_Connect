import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, Users, DollarSign, Phone, Mail } from 'lucide-react';
import { Agency } from './AgencyCard';

interface AgencyHiringModalProps {
  agency: Agency;
  housegirlName: string;
  onClose: () => void;
  onHire: (agencyId: string) => void;
}

const AgencyHiringModal = ({ agency, housegirlName, onClose, onHire }: AgencyHiringModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-green-600" />
            <span>Hire via Agency</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Agency Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Agency Details</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {agency.name}</p>
              <p><strong>Rating:</strong> ⭐⭐⭐⭐⭐ {agency.rating}</p>
              <p><strong>Verified Workers:</strong> {agency.verified_workers}</p>
              <p><strong>Successful Placements:</strong> {agency.successful_placements}</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Benefits of Agency Hiring
            </h4>
            <ul className="text-sm text-green-700 space-y-2">
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                Verified and screened worker with background checks
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                Dispute resolution guarantee
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                Free replacement if needed within 30 days
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                Professional support and training
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                Legal compliance and documentation
              </li>
            </ul>
          </div>

          {/* Pricing */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="mb-2">
              <p className="text-3xl font-bold text-green-600">KES 1,500</p>
              <p className="text-sm text-gray-600">One-time agency fee</p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Commission: {agency.commission_rate}%</p>
              <p>Worker: {housegirlName}</p>
            </div>
          </div>

          {/* Agency Contact */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Agency Contact</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-600" />
                <span>{agency.contact_phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span>{agency.contact_email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => onHire(agency.id)} 
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Hire Now
            </Button>
          </div>

          {/* Terms */}
          <div className="text-xs text-gray-500 text-center">
            <p>By hiring through this agency, you agree to their terms and conditions.</p>
            <p>Payment will be processed securely through our platform.</p>
          </div>
        </CardContent>
      </div>
    </div>
  );
};

export default AgencyHiringModal;
