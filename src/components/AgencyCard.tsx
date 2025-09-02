import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Star, Shield, Users, CheckCircle } from 'lucide-react';

export interface Agency {
  id: string;
  name: string;
  license_number: string;
  verification_status: 'verified' | 'pending' | 'unverified';
  subscription_tier: 'basic' | 'premium' | 'international';
  rating: number;
  services: string[];
  location: string;
  monthly_fee: number;
  commission_rate: number;
  verified_workers: number;
  successful_placements: number;
  description: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  created_at: string;
  updated_at: string;
}

interface AgencyCardProps {
  agency: Agency;
  onSelect: (agencyId: string) => void;
  showHireButton?: boolean;
}

const AgencyCard = ({ agency, onSelect, showHireButton = true }: AgencyCardProps) => {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      case 'international':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Shield className="h-4 w-4" />;
      case 'international':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">{agency.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(agency.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({agency.rating})</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge className={`verification-badge verified ${getTierColor(agency.subscription_tier)}`}>
              {getTierIcon(agency.subscription_tier)}
              <span className="ml-1 capitalize">{agency.subscription_tier}</span>
            </Badge>
            <Badge className="verification-badge verified">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">{agency.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Verified Workers:</span>
            <span className="font-medium text-gray-900">{agency.verified_workers}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Successful Placements:</span>
            <span className="font-medium text-gray-900">{agency.successful_placements}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium text-gray-900">{agency.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Commission Rate:</span>
            <span className="font-medium text-gray-900">{agency.commission_rate}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-gray-700">Services:</span>
          <div className="flex flex-wrap gap-2">
            {agency.services.map(service => (
              <Badge key={service} variant="outline" className="text-xs capitalize">
                {service.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {showHireButton && (
          <Button 
            onClick={() => onSelect(agency.id)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2"
          >
            Hire via Agency (KES 1,500)
          </Button>
        )}

        <div className="text-xs text-gray-500 text-center">
          License: {agency.license_number}
        </div>
      </CardContent>
    </Card>
  );
};

export default AgencyCard;
