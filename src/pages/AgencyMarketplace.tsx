import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Building2, Star, Shield, Users, MapPin } from 'lucide-react';
import AgencyCard, { Agency } from '@/components/AgencyCard';
import AgencyHiringModal from '@/components/AgencyHiringModal';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AgencyMarketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [selectedHousegirl, setSelectedHousegirl] = useState('');

  useEffect(() => {
    // Fetch agencies from API
    fetchAgencies();
  }, []);

  useEffect(() => {
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
          id: "demo_agency_1",
          name: "Demo Agency Service",
          license_number: "DEMO-2024-001",
          verification_status: "verified",
          subscription_tier: "premium",
          rating: 4.9,
          services: ["local", "international", "training", "background_checks"],
          location: "Nairobi",
          monthly_fee: 5000,
          commission_rate: 15,
          verified_workers: 50,
          successful_placements: 150,
          description: "Demo agency for testing our payment system. Experience our premium service with verified workers and guaranteed satisfaction.",
          contact_email: "demo@domesticconnect.ke",
          contact_phone: "+254700000000",
          website: "https://domesticconnect.ke",
          created_at: "2024-01-15T00:00:00.000Z",
          updated_at: "2024-01-15T00:00:00.000Z"
        },
        {
          id: "demo_agency_2",
          name: "Test Agency Solutions",
          license_number: "DEMO-2024-002",
          verification_status: "verified",
          subscription_tier: "basic",
          rating: 4.7,
          services: ["local", "training"],
          location: "Mombasa",
          monthly_fee: 3000,
          commission_rate: 12,
          verified_workers: 35,
          successful_placements: 95,
          description: "Test agency for demonstrating our local placement services. Reliable and trusted for all your domestic needs.",
          contact_email: "test@domesticconnect.ke",
          contact_phone: "+254700000001",
          website: "https://domesticconnect.ke",
          created_at: "2024-01-20T00:00:00.000Z",
          updated_at: "2024-01-20T00:00:00.000Z"
        },
        {
          id: "demo_agency_3",
          name: "Sample International Agency",
          license_number: "DEMO-2024-003",
          verification_status: "verified",
          subscription_tier: "international",
          rating: 4.8,
          services: ["international", "local", "training", "background_checks"],
          location: "Nairobi",
          monthly_fee: 8000,
          commission_rate: 20,
          verified_workers: 75,
          successful_placements: 220,
          description: "Sample international agency for testing overseas placements. Comprehensive background checks and professional training.",
          contact_email: "sample@domesticconnect.ke",
          contact_phone: "+254700000002",
          website: "https://domesticconnect.ke",
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
        client_id: user?.id,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center cursor-pointer" onClick={() => {
                if (user) {
                  if (user.user_type === 'agency') {
                    navigate('/agency-dashboard');
                  } else if (user.user_type === 'housegirl') {
                    navigate('/housegirl-dashboard');
                  } else {
                    navigate('/dashboard');
                  }
                } else {
                  navigate('/home');
                }
              }}>
                <Building2 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900 ml-2">Domestic Connect</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (user.user_type === 'agency') {
                      navigate('/agency-dashboard');
                    } else if (user.user_type === 'housegirl') {
                      navigate('/housegirl-dashboard');
                    } else {
                      navigate('/dashboard');
                    }
                  }}
                  className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verified Agency Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hire trusted domestic workers through verified agencies with guaranteed satisfaction, 
            dispute resolution, and professional support.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <p className="text-blue-800 font-medium">
              🎯 <strong>Demo Mode:</strong> These are demo agencies for testing our payment system. Real agencies will be available soon!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{agencies.length}</p>
                  <p className="text-sm text-gray-600">Verified Agencies</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {agencies.reduce((sum, agency) => sum + agency.verified_workers, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Verified Workers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {agencies.reduce((sum, agency) => sum + agency.successful_placements, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Successful Placements</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">KES 1,500</p>
                  <p className="text-sm text-gray-600">Agency Hiring Fee</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search agencies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map(service => (
                    <SelectItem key={service} value={service}>
                      {service.replace('_', ' ').charAt(0).toUpperCase() + service.replace('_', ' ').slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  {tiers.map(tier => (
                    <SelectItem key={tier} value={tier}>
                      {tier.charAt(0).toUpperCase() + tier.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setLocationFilter('all');
                  setServiceFilter('all');
                  setTierFilter('all');
                }}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Clear</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agencies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgencies.map(agency => (
            <AgencyCard
              key={agency.id}
              agency={agency}
              onSelect={handleAgencySelect}
            />
          ))}
        </div>

        {filteredAgencies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agencies found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default AgencyMarketplace;
