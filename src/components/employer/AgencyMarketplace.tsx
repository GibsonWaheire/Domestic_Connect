import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Building2, Star, Shield, Users, MapPin, ArrowRight, CheckCircle, DollarSign } from 'lucide-react';
import AgencyCard, { Agency } from '@/components/AgencyCard';
import AgencyHiringModal from '@/components/AgencyHiringModal';
import PaymentModal, { PackageDetails } from '@/components/PaymentModal';
import { useNavigate } from 'react-router-dom';

const AgencyMarketplace = () => {
  const navigate = useNavigate();
  const [agencies, setAgencies] = React.useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = React.useState<Agency[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [serviceFilter, setServiceFilter] = React.useState('all');
  const [tierFilter, setTierFilter] = React.useState('all');
  const [showAgencyModal, setShowAgencyModal] = React.useState(false);
  const [selectedAgency, setSelectedAgency] = React.useState<Agency | null>(null);
  const [selectedHousegirl, setSelectedHousegirl] = React.useState('');
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [selectedPackage, setSelectedPackage] = React.useState<PackageDetails | null>(null);

  React.useEffect(() => {
    // Fetch agencies from API
    fetchAgencies();
  }, []);

  React.useEffect(() => {
    filterAgencies();
  }, [agencies, searchTerm, locationFilter, serviceFilter, tierFilter]);

  const fetchAgencies = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/agencies`);
      if (response.ok) {
        const data = await response.json();
        setAgencies(data);
      }
    } catch (error) {
      console.error('Error fetching agencies:', error);
      // Fallback to mock data
      setAgencies([
        {
          id: "agency_1",
          name: "Professional Domestic Agency",
          license_number: "AGY-2024-001",
          verification_status: "verified",
          subscription_tier: "premium",
          rating: 4.8,
          services: ["local", "international", "training"],
          location: "Nairobi",
          monthly_fee: 5000,
          commission_rate: 15,
          verified_workers: 45,
          successful_placements: 120,
          description: "Leading domestic agency with verified workers and professional training programs",
          contact_email: "info@professionaldomestic.ke",
          contact_phone: "+254700123456",
          website: "https://professionaldomestic.ke",
          created_at: "2024-01-15T00:00:00.000Z",
          updated_at: "2024-01-15T00:00:00.000Z"
        },
        {
          id: "agency_2",
          name: "Trusted House Help Solutions",
          license_number: "AGY-2024-002",
          verification_status: "verified",
          subscription_tier: "basic",
          rating: 4.6,
          services: ["local", "training"],
          location: "Mombasa",
          monthly_fee: 3000,
          commission_rate: 12,
          verified_workers: 28,
          successful_placements: 85,
          description: "Reliable domestic agency specializing in local placements and worker training",
          contact_email: "info@trustedhousehelp.ke",
          contact_phone: "+254700789012",
          website: "https://trustedhousehelp.ke",
          created_at: "2024-01-20T00:00:00.000Z",
          updated_at: "2024-01-20T00:00:00.000Z"
        },
        {
          id: "agency_3",
          name: "International Domestic Partners",
          license_number: "AGY-2024-003",
          verification_status: "verified",
          subscription_tier: "international",
          rating: 4.9,
          services: ["international", "local", "training", "background_checks"],
          location: "Nairobi",
          monthly_fee: 8000,
          commission_rate: 20,
          verified_workers: 65,
          successful_placements: 200,
          description: "Premium international agency with comprehensive background checks and overseas placements",
          contact_email: "info@internationaldomestic.ke",
          contact_phone: "+254700345678",
          website: "https://internationaldomestic.ke",
          created_at: "2024-02-01T00:00:00.000Z",
          updated_at: "2024-02-01T00:00:00.000Z"
        }
      ]);
    }
  };

  const filterAgencies = () => {
    let filtered = agencies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(agency =>
        agency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agency.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location filter
    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter(agency => agency.location === locationFilter);
    }

    // Service filter
    if (serviceFilter && serviceFilter !== 'all') {
      filtered = filtered.filter(agency => agency.services.includes(serviceFilter));
    }

    // Tier filter
    if (tierFilter && tierFilter !== 'all') {
      filtered = filtered.filter(agency => agency.subscription_tier === tierFilter);
    }

    setFilteredAgencies(filtered);
  };

  const handleAgencySelect = (agencyId: string) => {
    const agency = agencies.find(a => a.id === agencyId);
    if (agency) {
      setSelectedAgency(agency);
      setShowAgencyModal(true);
    }
  };

  const handleAgencyHire = async (agencyId: string) => {
    try {
      // Here you would integrate with payment system
      console.log('Hiring through agency:', agencyId);
      
      // Create agency client record
      const agencyClientData = {
        agency_id: agencyId,
        client_id: 'current_user_id', // This would come from auth context
        hiring_fee: 1500,
        placement_status: 'pending',
        hire_date: new Date().toISOString(),
        worker_id: selectedHousegirl,
        commission_paid: 0,
        dispute_resolution: null
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/agencies/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agencyClientData),
      });

      if (response.ok) {
        alert('Successfully hired through agency! You will be contacted shortly.');
        setShowAgencyModal(false);
        setSelectedAgency(null);
      }
    } catch (error) {
      console.error('Error hiring through agency:', error);
      alert('Error processing agency hire. Please try again.');
    }
  };

  const locations = [...new Set(agencies.map(agency => agency.location))];
  const services = [...new Set(agencies.flatMap(agency => agency.services))];
  const tiers = ['basic', 'premium', 'international'];

  // Package definitions
  const packages: PackageDetails[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 1200,
      agencyFee: 1000,
      platformFee: 200,
      features: [
        'Verified worker',
        'Basic training',
        '30-day replacement',
        'Agency support'
      ],
      color: 'green',
      icon: Shield
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1500,
      agencyFee: 1000,
      platformFee: 500,
      features: [
        'Verified worker',
        'Professional training',
        'Background check',
        '60-day replacement',
        'Dispute resolution'
      ],
      color: 'blue',
      icon: Shield
    },
    {
      id: 'international',
      name: 'International',
      price: 2000,
      agencyFee: 1000,
      platformFee: 1000,
      features: [
        'Verified worker',
        'International training',
        'Comprehensive background check',
        '90-day replacement',
        'Legal compliance'
      ],
      color: 'purple',
      icon: Shield
    }
  ];

  const handlePackageSelect = (packageDetails: PackageDetails) => {
    setSelectedPackage(packageDetails);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentData: {
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
  }) => {
    setShowPaymentModal(false);
    setSelectedPackage(null);
    // You can add additional logic here like redirecting or showing success message
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agency Marketplace</h1>
          <p className="text-sm text-gray-600">
            Verified agencies with guaranteed satisfaction
          </p>
        </div>
        <Button
          onClick={() => navigate('/agency-marketplace')}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          View Full Marketplace
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{agencies.length}</p>
          <p className="text-xs text-gray-600">Agencies</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {agencies.reduce((sum, agency) => sum + agency.verified_workers, 0)}
          </p>
          <p className="text-xs text-gray-600">Workers</p>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Star className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">
            {agencies.reduce((sum, agency) => sum + agency.successful_placements, 0)}
          </p>
          <p className="text-xs text-gray-600">Placements</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">1,500</p>
          <p className="text-xs text-gray-600">Hiring Fee</p>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white rounded-lg border p-3 mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agencies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {services.map(service => (
                <SelectItem key={service} value={service}>
                  {service.replace('_', ' ').charAt(0).toUpperCase() + service.replace('_', ' ').slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {tiers.map(tier => (
                <SelectItem key={tier} value={tier}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setLocationFilter('all');
              setServiceFilter('all');
              setTierFilter('all');
            }}
            className="h-9 px-3"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Agency Packages */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Agency Packages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((packageDetails) => (
            <Card 
              key={packageDetails.id}
              className={`border-2 border-gray-200 hover:border-${packageDetails.color}-300 transition-colors cursor-pointer`}
              onClick={() => handlePackageSelect(packageDetails)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <packageDetails.icon className={`h-5 w-5 text-${packageDetails.color}-600 mr-2`} />
                  {packageDetails.name} Package
                </CardTitle>
                {packageDetails.id === 'premium' && (
                  <Badge className="w-fit bg-blue-600 text-white">Most Popular</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">KES {packageDetails.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">One-time registration fee</p>
                </div>
                <ul className="text-sm space-y-2">
                  {packageDetails.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full bg-${packageDetails.color}-600 hover:bg-${packageDetails.color}-700 text-white`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePackageSelect(packageDetails);
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Register Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Agencies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgencies.slice(0, 6).map(agency => (
          <AgencyCard
            key={agency.id}
            agency={agency}
            onSelect={handleAgencySelect}
          />
        ))}
      </div>

      {filteredAgencies.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agencies found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      )}

      {filteredAgencies.length > 6 && (
        <div className="text-center">
          <Button
            onClick={() => navigate('/agency-marketplace')}
            variant="outline"
            className="mt-4"
          >
            View All Agencies ({filteredAgencies.length})
          </Button>
        </div>
      )}

      {/* Agency Hiring Modal */}
      {showAgencyModal && selectedAgency && (
        <AgencyHiringModal
          agency={selectedAgency}
          housegirlName="Selected Worker"
          onClose={() => {
            setShowAgencyModal(false);
            setSelectedAgency(null);
          }}
          onHire={handleAgencyHire}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <PaymentModal
          package={selectedPackage}
          agency={{
            id: 'default_agency',
            name: 'Professional Domestic Agency',
            license_number: 'AGY-2024-001',
            rating: 4.8,
            verified_workers: 45
          }}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPackage(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default AgencyMarketplace;
