import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuthEnhanced';
import AuthModal from '@/components/AuthModal';
import PaymentModal, { PackageDetails } from '@/components/PaymentModal';
import { MapPin, Menu, Phone, Search } from 'lucide-react';

const bgImage = '/housegirls.webp';

type RoleType = 'House Help' | 'Nanny' | 'Cook' | 'Caregiver' | 'Cleaner';

type Profile = {
  id: string;
  name: string;
  role: RoleType;
  location: string;
  tags: string[];
  experienceYears: number;
  monthlyRate: number;
  available: boolean;
  phone: string;
  exactLocation: string;
  avatar: string | null;
};

const PROFILE_FILTERS: RoleType[] = [
  'House Help',
  'Nanny',
  'Cook',
  'Caregiver',
  'Cleaner',
] as const;
const KENYA_CITIES_CACHE_KEY = 'dc_kenya_cities_cache_v1';
const KENYA_CITIES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const MOCK_PROFILES: Profile[] = [
  {
    id: 'mock-1',
    name: 'Mary Wanjiku',
    role: 'House Help',
    location: 'Kasarani, Nairobi',
    tags: ['Cleaning', 'Laundry', 'Ironing'],
    experienceYears: 5,
    monthlyRate: 15000,
    available: true,
    phone: '+254 712 334 110',
    exactLocation: 'Kasarani, Nairobi',
    avatar: null,
  },
  {
    id: 'mock-2',
    name: 'Grace Akinyi',
    role: 'Nanny',
    location: 'Nyali, Mombasa',
    tags: ['Childcare', 'Meal Prep', 'Tutoring'],
    experienceYears: 4,
    monthlyRate: 18000,
    available: true,
    phone: '+254 701 992 803',
    exactLocation: 'Nyali, Mombasa',
    avatar: null,
  },
  {
    id: 'mock-3',
    name: 'Joyce Atieno',
    role: 'Cook',
    location: 'Milimani, Kisumu',
    tags: ['Cooking', 'Baking', 'Meal Prep'],
    experienceYears: 7,
    monthlyRate: 20000,
    available: false,
    phone: '+254 722 883 094',
    exactLocation: 'Milimani, Kisumu',
    avatar: null,
  },
  {
    id: 'mock-4',
    name: 'Jane Njeri',
    role: 'Caregiver',
    location: 'Section 58, Nakuru',
    tags: ['Elder Care', 'Medication', 'Companionship'],
    experienceYears: 6,
    monthlyRate: 22000,
    available: true,
    phone: '+254 734 918 725',
    exactLocation: 'Section 58, Nakuru',
    avatar: null,
  },
  {
    id: 'mock-5',
    name: 'Faith Chebet',
    role: 'Cleaner',
    location: 'Pioneer, Eldoret',
    tags: ['Deep Cleaning', 'Laundry', 'Organization'],
    experienceYears: 3,
    monthlyRate: 14000,
    available: true,
    phone: '+254 746 113 302',
    exactLocation: 'Pioneer, Eldoret',
    avatar: null,
  },
];

const CONTACT_UNLOCK_PACKAGE: PackageDetails = {
  id: 'contact_unlock',
  name: 'Contact Unlock',
  price: 200,
  agencyFee: 0,
  platformFee: 200,
  features: ['Direct phone contact', 'Exact location details', 'Instant profile access'],
  color: 'purple',
  icon: Phone,
};

const BUNDLE_UNLOCK_PACKAGE: PackageDetails = {
  id: 'bundle_unlock',
  name: '3 Contacts Bundle',
  price: 500,
  agencyFee: 0,
  platformFee: 500,
  features: ['Unlock 3 contacts', 'Save KES 100', 'Instant profile access'],
  color: 'blue',
  icon: Phone,
};

const ROLE_BORDER: Record<RoleType, string> = {
  'House Help': 'border-l-4 border-l-pink-500',
  'Nanny': 'border-l-4 border-l-blue-500',
  'Cook': 'border-l-4 border-l-orange-500',
  'Caregiver': 'border-l-4 border-l-green-500',
  'Cleaner': 'border-l-4 border-l-purple-500',
};

const ROLE_BADGE: Record<RoleType, string> = {
  'House Help': 'border-pink-500 text-pink-600',
  'Nanny': 'border-blue-500 text-blue-600',
  'Cook': 'border-orange-500 text-orange-600',
  'Caregiver': 'border-green-500 text-green-600',
  'Cleaner': 'border-purple-500 text-purple-600',
};

const HousegirlsListPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.user_type === 'agency') return '/agency-dashboard';
    if (user.user_type === 'housegirl') return '/housegirl-dashboard';
    return '/employer-dashboard';
  };

  const [selectedCategory, setSelectedCategory] = useState<RoleType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentPackage, setSelectedPaymentPackage] = useState<PackageDetails>(CONTACT_UNLOCK_PACKAGE);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [unlockedProfiles, setUnlockedProfiles] = useState<Record<string, boolean>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All locations');
  const [kenyaCities, setKenyaCities] = useState<string[]>([]);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProfiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return MOCK_PROFILES.filter((profile) => {
      const roleMatch = selectedCategory === 'All' || profile.role === selectedCategory;
      const locationMatch =
        selectedLocation === 'All locations' ||
        profile.location.toLowerCase().includes(selectedLocation.toLowerCase());
      const queryMatch =
        query.length === 0 ||
        profile.name.toLowerCase().includes(query) ||
        profile.location.toLowerCase().includes(query) ||
        profile.tags.some((tag) => tag.toLowerCase().includes(query));
      return roleMatch && locationMatch && queryMatch;
    });
  }, [searchTerm, selectedCategory, selectedLocation]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLocation]);

  const totalPages = Math.ceil(filteredProfiles.length / 10);
  const paginatedProfiles = filteredProfiles.slice((currentPage - 1) * 10, currentPage * 10);

  const handleGetContact = (profileId: string) => {
    if (!user) {
      localStorage.setItem('pendingContactId', profileId);
      setAuthMode('signup');
      setAuthModalOpen(true);
      return;
    }
    setSelectedProfileId(profileId);
    setSelectedPaymentPackage(CONTACT_UNLOCK_PACKAGE);
    setShowPaymentModal(true);
  };

  const handlePricingClick = (pkg: PackageDetails) => {
    if (!user) {
      setAuthMode('signup');
      setAuthModalOpen(true);
      return;
    }
    setSelectedProfileId(null);
    setSelectedPaymentPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    if (selectedProfileId) {
      setUnlockedProfiles((prev) => ({ ...prev, [selectedProfileId]: true }));
    }
    setSelectedProfileId(null);
    setShowPaymentModal(false);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const pendingFromQuery = searchParams.get('pendingContactId');
    const pendingContactId = pendingFromQuery || localStorage.getItem('pendingContactId');
    if (!pendingContactId) {
      return;
    }

    const matchingProfile = MOCK_PROFILES.find((profile) => profile.id === pendingContactId);
    if (!matchingProfile) {
      localStorage.removeItem('pendingContactId');
      if (pendingFromQuery) {
        searchParams.delete('pendingContactId');
        const nextUrl = searchParams.toString() ? `${window.location.pathname}?${searchParams.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', nextUrl);
      }
      return;
    }

    setSelectedProfileId(matchingProfile.id);
    setSelectedPaymentPackage(CONTACT_UNLOCK_PACKAGE);
    setShowPaymentModal(true);
    localStorage.removeItem('pendingContactId');

    if (pendingFromQuery) {
      searchParams.delete('pendingContactId');
      const nextUrl = searchParams.toString() ? `${window.location.pathname}?${searchParams.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', nextUrl);
    }
  }, [user]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  useEffect(() => {
    const loadKenyaCities = async () => {
      try {
        const cachedValue = localStorage.getItem(KENYA_CITIES_CACHE_KEY);
        if (cachedValue) {
          const parsed = JSON.parse(cachedValue) as { timestamp: number; cities: string[] };
          if (
            parsed?.timestamp &&
            Array.isArray(parsed?.cities) &&
            Date.now() - parsed.timestamp < KENYA_CITIES_CACHE_TTL_MS
          ) {
            setKenyaCities(parsed.cities);
            return;
          }
        }
      } catch {
        // Ignore cache parse issues and fetch fresh data.
      }

      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ country: 'Kenya' }),
        });

        if (!response.ok) {
          throw new Error(`Failed to load Kenya cities: ${response.status}`);
        }

        const payload = (await response.json()) as { data?: string[] };
        const cities = Array.isArray(payload?.data)
          ? Array.from(new Set(payload.data))
              .filter((city) => typeof city === 'string' && city.trim().length > 0)
              .sort((a, b) => a.localeCompare(b))
          : [];

        if (cities.length > 0) {
          setKenyaCities(cities);
          localStorage.setItem(
            KENYA_CITIES_CACHE_KEY,
            JSON.stringify({
              timestamp: Date.now(),
              cities,
            })
          );
        }
      } catch {
        const fallbackCities = Array.from(
          new Set(
            MOCK_PROFILES.map((profile) => profile.location.split(',').at(-1)?.trim()).filter(
              (city): city is string => Boolean(city)
            )
          )
        ).sort((a, b) => a.localeCompare(b));
        setKenyaCities(fallbackCities);
      }
    };

    loadKenyaCities();
  }, []);

  const handleFindHelp = () => {
    const profilesSection = document.getElementById('profiles-list');
    if (profilesSection) {
      profilesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate('/browse-housegirls');
  };

  const handlePricingScroll = () => {
    const pricingSection = document.getElementById('pricing-value');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate('/agency-packages');
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", lineHeight: 1.5 }}
    >
      <Helmet>
        <title>Domestic Connect | Find a Housegirl, Nanny, Caregiver & House Manager in Kenya</title>
        <meta
          name="description"
          content="Looking for a trusted housegirl, nanny, house manager, caregiver or cleaner in Nairobi, Mombasa, Kisumu, Nakuru or anywhere in Kenya? Browse verified profiles and connect today for just KES 200."
        />
        <meta
          name="keywords"
          content="housegirl kenya, nanny nairobi, caregiver kenya, house manager nairobi, ayah kenya, domestic worker kenya, house help nairobi, cleaner mombasa, nanny mombasa, caregiver nakuru, housegirl kisumu, domestic connect kenya, find housegirl online kenya, trusted nanny kenya, home helper nairobi, house aunty kenya, babysitter nairobi, elderly caregiver kenya, live-in house help, part time cleaner nairobi, domestic staff agency kenya"
        />
        <meta property="og:title" content="Domestic Connect | Find a Housegirl, Nanny, Caregiver & House Manager in Kenya" />
        <meta
          property="og:description"
          content="Looking for a trusted housegirl, nanny, house manager, caregiver or cleaner in Nairobi, Mombasa, Kisumu, Nakuru or anywhere in Kenya? Browse verified profiles and connect today for just KES 200."
        />
        <meta property="og:url" content="https://www.domesticconnect.co.ke" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.domesticconnect.co.ke" />
      </Helmet>

      <div className="fixed inset-0 z-[-1]">
        <img
          src={bgImage}
          alt="Background"
          className="w-full h-full object-cover blur-[3px] saturate-[0.3] opacity-[0.08]"
        />
      </div>

      <header className="bg-white border-b border-[#eee] relative md:sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => {
                navigate(getDashboardRoute());
              }}
            >
              <h1 className="text-2xl font-bold text-black tracking-tight">Domestic Connect</h1>
            </div>

            <nav className="hidden md:flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={handleFindHelp}
                className="text-sm font-medium text-[#333] hover:text-black transition-opacity"
              >
                Find Help
              </button>
              <button
                type="button"
                onClick={handlePricingScroll}
                className="text-sm font-medium text-[#333] hover:text-black transition-opacity"
              >
                Pricing
              </button>
            </nav>

            <div className="flex items-center justify-end gap-3">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate(getDashboardRoute())}
                    className="hidden md:inline-flex bg-black hover:bg-[#333] text-white rounded-full transition-opacity duration-150"
                  >
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={signOut} className="hidden md:inline-flex border-gray-300 text-black bg-transparent hover:bg-gray-100 rounded-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="text-sm font-medium text-black border border-black hover:bg-gray-50 rounded-full px-5 py-2 transition-colors"
                  >
                    Login
                  </button>
                  <Button
                    onClick={() => openAuth('signup')}
                    className="hidden md:inline-flex rounded-full px-6 bg-black hover:bg-[#333] text-white font-medium"
                  >
                    Join Today
                  </Button>
                </>
              )}

              <button
                type="button"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="landing-main-menu"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-black hover:bg-gray-100 transition-colors border-0"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'bg-black/30 opacity-100 pointer-events-auto' : 'bg-black/0 opacity-0 pointer-events-none'}`}>
        <aside
          id="landing-main-menu"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">For Employers</p>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => { setIsMenuOpen(false); handleFindHelp(); }} className="text-left text-gray-800 hover:text-black">Find a Housegirl</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/how-it-works'); }} className="text-left text-gray-800 hover:text-black">How It Works</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-packages'); }} className="text-left text-gray-800 hover:text-black">Pricing & Packages</button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">For Housegirls</p>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => { setIsMenuOpen(false); openAuth('signup'); }} className="text-left text-gray-800 hover:text-black">Register as Housegirl</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/housegirls'); }} className="text-left text-gray-800 hover:text-black">How to Get Listed</button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">For Agencies</p>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-marketplace'); }} className="text-left text-gray-800 hover:text-black">Agency Marketplace</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); openAuth('signup'); }} className="text-left text-gray-800 hover:text-black">List Your Agency</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-packages'); }} className="text-left text-gray-800 hover:text-black">Agency Packages</button>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">General</p>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/why-choose-us'); }} className="text-left text-gray-800 hover:text-black">About Us</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/stats'); }} className="text-left text-gray-800 hover:text-black">Help Center</button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/contact-us'); }} className="text-left text-gray-800 hover:text-black">Contact Us</button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="relative md:sticky top-[73px] z-40 bg-[#111] w-full">
        <div className="px-4 md:px-12 py-4">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
              <div className="relative min-w-[220px] flex-1 max-w-md">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, location or skill..."
                  className="h-9 rounded-[2px] pl-10 border-0 bg-[#222] text-white placeholder-white focus-visible:ring-0"
                />
              </div>
              <div className="min-w-[200px]">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="h-9 w-full rounded-[2px] border-0 bg-[#222] px-3 text-[13px] text-white focus:outline-none"
                >
                  <option value="All locations">All locations</option>
                  {kenyaCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'All' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('All')}
                  className={
                    selectedCategory === 'All'
                      ? 'h-9 rounded-[2px] bg-white text-black text-[13px] px-3 hover:bg-gray-100'
                      : 'h-9 rounded-[2px] border border-[#444] bg-transparent text-white text-[13px] px-3 hover:bg-[#222]'
                  }
                >
                  All
                </Button>
                {PROFILE_FILTERS.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedCategory === filter ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(filter as RoleType | 'All')}
                    className={
                      selectedCategory === filter
                        ? 'h-9 rounded-[2px] bg-white text-black text-[13px] px-3 hover:bg-gray-100'
                        : 'h-9 rounded-[2px] border border-[#444] bg-transparent text-white text-[13px] px-3 hover:bg-[#222]'
                    }
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-[13px] text-[#888]">{filteredProfiles.length} housegirls available</p>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 md:px-12 w-full">

      <main id="profiles-list" className="py-8">
        <div className="w-full px-10">
          <div className="flex flex-col w-full relative">
            <div className="flex flex-col gap-[8px] w-full">
            {paginatedProfiles.map((profile) => {
              const isUnlocked = Boolean(unlockedProfiles[profile.id]);
              return (
                <article
                  key={profile.id}
                  className={`bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 ${ROLE_BORDER[profile.role as RoleType]}`}
                >
                  <div className="flex flex-row gap-4 items-center">
                    <div className="relative flex-shrink-0">
                      {profile.avatar ? (
                        <img
                          src={profile.avatar}
                          alt={profile.name}
                          className="w-[72px] h-[72px] rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-[72px] h-[72px] rounded-full bg-[#4b5563] text-white font-semibold text-2xl flex items-center justify-center text-center">
                          {profile.name
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((namePart) => namePart[0]?.toUpperCase())
                            .join('')}
                        </div>
                      )}
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          profile.available ? 'bg-[#22c55e]' : 'bg-[#9ca3af]'
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-[18px] font-semibold text-[#111] leading-none mb-1">{profile.name}</h3>
                        <Badge variant="secondary" className={`w-fit border bg-transparent text-[13px] px-3 py-1 rounded-[2px] ${ROLE_BADGE[profile.role as RoleType]}`}>
                          {profile.role}
                        </Badge>
                        <p className="text-[#555] text-[13px] flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-[#555]" />
                          {profile.location}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="border border-[#ddd] bg-transparent text-[#555] text-[12px] rounded-[2px] px-2 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-[#555] text-[13px]">{profile.experienceYears} yrs experience</p>
                        {isUnlocked && (
                          <div className="text-[13px] text-[#555] border border-[#e5e5e5] px-3 py-2 w-fit">
                            Contact: {profile.phone} · {profile.exactLocation}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="md:w-56 flex flex-col gap-2 md:items-end">
                      <p className="text-[22px] font-bold text-[#111]">
                        KES {profile.monthlyRate.toLocaleString()}
                        <span className="text-sm font-medium text-gray-500">/mo</span>
                      </p>
                      <Button
                        onClick={() => handleGetContact(profile.id)}
                        className="w-full md:w-auto rounded-[4px] px-6 bg-black hover:bg-[#333] text-white transition-opacity duration-150"
                      >
                        {isUnlocked ? 'Contact Unlocked ✓' : 'Get Contact →'}
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`text-[13px] mr-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-[#555]'}`}
                >
                  ← Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (totalPages > 5) {
                     if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                       if (page === 2 && currentPage > 3) return <span key={`ell-${page}`} className="text-[#888]">...</span>;
                       if (page === totalPages - 1 && currentPage < totalPages - 2) return <span key={`ell-${page}`} className="text-[#888]">...</span>;
                       return null;
                     }
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-[32px] px-2 text-[13px] ${
                        currentPage === page
                          ? 'bg-black text-white border border-black'
                          : 'bg-white text-black border border-black hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`text-[13px] ml-2 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-[#555]'}`}
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-14 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
              <p className="text-gray-600">No housegirls found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </main>

      <section id="pricing-value" className="border-y border-gray-200 bg-[#f9f9f9]">
        <div className="max-w-[1100px] mx-auto px-4 py-10">
          <div className="grid gap-4 md:grid-cols-3">
            <div 
              className="border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
              onClick={() => handlePricingClick(CONTACT_UNLOCK_PACKAGE)}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Single Unlock</p>
              <p className="mt-2 text-2xl font-bold text-[#111]">KES 200</p>
              <p className="mt-2 text-[13px] text-[#555]">Unlock one profile contact instantly via M-Pesa.</p>
            </div>
            <div 
              className="border border-[#111] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] cursor-pointer hover:border-blue-600 hover:shadow-md transition-all duration-200 relative"
              onClick={() => handlePricingClick(BUNDLE_UNLOCK_PACKAGE)}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">Best Value</p>
              <p className="mt-2 text-2xl font-bold text-[#111]">KES 500</p>
              <p className="mt-2 text-[13px] text-[#555]">Unlock 3 contacts and save KES 100.</p>
            </div>
            <div 
              className="border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200"
              onClick={() => handlePricingClick(CONTACT_UNLOCK_PACKAGE)}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">No Subscription</p>
              <p className="mt-2 text-2xl font-bold text-[#111]">Pay As You Hire</p>
              <p className="mt-2 text-[13px] text-[#555]">No monthly commitment. Only pay when you need contacts.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="max-w-[1100px] mx-auto px-4 py-10">
          <div className="border border-[#e5e5e5] p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[#111]">Ready to hire safely and faster?</h2>
              <p className="mt-1 text-[14px] text-[#555]">Browse profiles and unlock contact details when you find the right fit.</p>
            </div>
            <Button
              onClick={handleFindHelp}
              className="rounded-[4px] bg-black hover:bg-[#333333] text-white px-6 transition-opacity duration-150"
            >
              Start Browsing
            </Button>
          </div>
        </div>
      </section>
      </div>

      <footer className="bg-black text-white py-8 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-300">© 2024 Domestic Connect. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />

      {showPaymentModal && (
        <PaymentModal
          package={selectedPaymentPackage}
          agency={{
            id: 'contact_unlock_bundle',
            name: 'Domestic Connect',
            location: 'Kenya',
            verification_status: 'verified',
            subscription_tier: 'premium',
            license_number: 'DC-2024-001',
            rating: 5,
            verified_workers: 0,
            successful_placements: 0,
          }}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedProfileId(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default HousegirlsListPage;
