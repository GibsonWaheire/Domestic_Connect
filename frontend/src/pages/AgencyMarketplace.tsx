import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Building2, Star, Shield, Users, MapPin, MessageCircle, CheckCircle2 } from 'lucide-react';
import AgencyCard, { Agency } from '@/components/AgencyCard';
import AgencyHiringModal from '@/components/AgencyHiringModal';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';

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
      const response = await fetch(`${API_BASE_URL}/agencies`);
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

      const response = await fetch(`${API_BASE_URL}/api/agencies/clients`, {
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
    <div className="min-h-screen bg-[#FDF6F0] text-[#111] font-sans">
      <Helmet>
        <title>Agency Marketplace | Domestic Connect Kenya</title>
        <meta name="description" content="Find verified domestic worker agencies in Kenya. Browse NITA-licensed agencies in Nairobi, Mombasa, Kisumu and across Kenya. Guaranteed placements with replacement warranties." />
        <meta name="keywords" content="domestic worker agency kenya, housegirl agency nairobi, maid agency mombasa, nanny agency kenya, domestic connect agency marketplace" />
        <link rel="canonical" href="https://domestic-connect.co.ke/agency-marketplace" />
        <meta property="og:title" content="Agency Marketplace | Domestic Connect Kenya" />
        <meta property="og:description" content="Find NITA-licensed domestic worker agencies across Kenya. Verified agencies with replacement guarantees." />
        <meta property="og:url" content="https://domestic-connect.co.ke/agency-marketplace" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="bg-[#111] text-white py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            Verified Agency Marketplace
          </span>
          <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
            Find a trusted domestic worker agency in Kenya
          </h1>
          <p className="text-white/70 text-[16px] mb-8 max-w-xl mx-auto leading-relaxed">
            Browse NITA-licensed agencies across Nairobi, Mombasa, Kisumu and beyond. Verified workers, replacement guarantees, and professional support.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 text-[13px] text-white/60 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> NITA-licensed agencies</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> Background-checked workers</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> Replacement guarantees</span>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Building2 className="h-6 w-6 text-blue-600" />, value: agencies.length, label: 'Verified Agencies', bg: 'bg-blue-50' },
              { icon: <Users className="h-6 w-6 text-green-600" />, value: agencies.reduce((s, a) => s + a.verified_workers, 0), label: 'Verified Workers', bg: 'bg-green-50' },
              { icon: <Star className="h-6 w-6 text-yellow-600" />, value: agencies.reduce((s, a) => s + a.successful_placements, 0), label: 'Placements Made', bg: 'bg-yellow-50' },
              { icon: <Shield className="h-6 w-6 text-purple-600" />, value: '30–90 days', label: 'Replacement Window', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${stat.bg} mb-2`}>{stat.icon}</div>
                <div className="text-2xl font-extrabold text-[#111]">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEARCH + LISTINGS */}
      <section className="bg-[#fafafa] py-12">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#111]">All agencies</h2>
              <p className="text-sm text-gray-500 mt-0.5">{filteredAgencies.length} agenc{filteredAgencies.length !== 1 ? 'ies' : 'y'} found</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 mb-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search agencies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger><SelectValue placeholder="Service" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setLocationFilter('all'); setServiceFilter('all'); setTierFilter('all'); }}
                className="flex items-center gap-2">
                <Filter className="h-4 w-4" /><span>Clear</span>
              </Button>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgencies.map(agency => (
              <AgencyCard key={agency.id} agency={agency} onSelect={handleAgencySelect} />
            ))}
          </div>

          {filteredAgencies.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
              <Building2 className="h-14 w-14 text-gray-200 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700 mb-1">No agencies found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* WHY USE AN AGENCY */}
      <section className="bg-white py-16 md:py-20 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight">Why hire through an agency?</h2>
          <p className="text-gray-500 text-sm text-center mb-10 max-w-md mx-auto">Agencies offer additional peace of mind beyond direct hiring.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: '🔍', title: 'Pre-screened Workers', desc: 'All workers listed by agencies have been vetted, interviewed, and cleared before being placed with your family.' },
              { icon: '🔄', title: 'Replacement Guarantee', desc: 'If a worker leaves or doesn\'t fit within the guarantee window, the agency provides a free replacement.' },
              { icon: '📋', title: 'Background Checks', desc: 'Premium and International agencies conduct comprehensive police and reference background checks on all workers.' },
              { icon: '📞', title: 'After-Placement Support', desc: 'Agencies remain available to help mediate any issues that arise after placement — protecting both parties.' },
              { icon: '🏆', title: 'Trained Professionals', desc: 'Many agencies provide professional training in housekeeping, childcare, cooking, and elderly care before placement.' },
              { icon: '📄', title: 'Formal Contract', desc: 'Agencies provide formal employment agreements, clearly outlining duties, pay, and conditions for both employer and worker.' },
            ].map(item => (
              <div key={item.title} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-[#111] mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — list your agency */}
      <section className="bg-[#111] text-white py-14">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Are you a domestic worker agency?</h2>
          <p className="text-white/70 mb-6 text-sm">List your agency on Domestic Connect and reach thousands of verified Kenyan families. Plans start from KSh 1,200/month.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/login?mode=signup')} className="rounded-full bg-white text-[#111] hover:bg-gray-100 h-12 px-10 text-base font-semibold">
              List Your Agency →
            </Button>
            <Button onClick={() => navigate('/agency-packages')} variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10 h-12 px-8 text-base">
              View Packages
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#111] text-white border-t border-white/10 py-8">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
          <p>© {new Date().getFullYear()} Domestic Connect Kenya</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact-us" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>

      {/* WhatsApp */}
      <div className="fixed bottom-5 left-5 z-50 group flex items-center">
        <span className="mr-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#111] shadow-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">Chat with us</span>
        <a href="https://wa.me/254726899113" target="_blank" rel="noopener noreferrer"
          className="h-14 w-14 rounded-full bg-green-500 text-white shadow-xl inline-flex items-center justify-center hover:bg-green-600 transition-colors" aria-label="Chat on WhatsApp">
          <MessageCircle size={24} />
        </a>
      </div>

      {/* Agency Hiring Modal */}
      {showAgencyModal && selectedAgency && (
        <AgencyHiringModal
          agency={selectedAgency}
          housegirlName="Selected Worker"
          onClose={() => { setShowAgencyModal(false); setSelectedAgency(null); }}
          onHire={handleAgencyHire}
        />
      )}
    </div>
  );
};

export default AgencyMarketplace;
