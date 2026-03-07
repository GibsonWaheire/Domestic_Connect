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

const PROFILE_FILTERS = ['All', 'House Help', 'Nanny', 'Cook', 'Caregiver', 'Cleaner'] as const;
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

const LandingPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.user_type === 'agency') return '/agency-dashboard';
    if (user.user_type === 'housegirl') return '/housegirl-dashboard';
    return '/dashboard';
  };

  const [selectedCategory, setSelectedCategory] = useState<typeof PROFILE_FILTERS[number]>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [unlockedProfiles, setUnlockedProfiles] = useState<Record<string, boolean>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All locations');
  const [kenyaCities, setKenyaCities] = useState<string[]>([]);
  const drawerRef = useRef<HTMLDivElement | null>(null);

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

  const handleGetContact = (profileId: string) => {
    if (!user) {
      localStorage.setItem('pendingContactId', profileId);
      setAuthMode('signup');
      setAuthModalOpen(true);
      return;
    }
    setSelectedProfileId(profileId);
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

      <header className="bg-white border-b border-gray-200 relative md:sticky top-0 z-50">
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
                className="text-sm font-medium text-gray-800 hover:text-black"
              >
                Find Help
              </button>
              <button
                type="button"
                onClick={handlePricingScroll}
                className="text-sm font-medium text-gray-800 hover:text-black"
              >
                Pricing
              </button>
            </nav>

            <div className="flex items-center justify-end gap-3">
              {user ? (
                <>
                  <Button
                    onClick={() => navigate(getDashboardRoute())}
                    className="hidden md:inline-flex bg-black hover:bg-[#333333] text-white rounded-sm transition-opacity duration-150"
                  >
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={signOut} className="hidden md:inline-flex border-gray-300 hover:bg-gray-100 rounded-sm">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuth('login')}
                    className="text-sm font-medium text-gray-700 hover:text-black"
                  >
                    Login
                  </button>
                  <Button
                    onClick={() => openAuth('signup')}
                    className="hidden md:inline-flex rounded-sm px-5 bg-black hover:bg-[#333333] text-white"
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gray-200 text-gray-800 hover:text-black hover:border-gray-300"
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

      <section className="relative md:sticky top-[73px] z-40 border-b border-gray-200 bg-white">
        <div className="max-w-[900px] mx-auto px-4 py-3">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 flex-wrap border border-[#e5e5e5] bg-[#f7f7f7] p-2 text-[13px] tracking-[0.3px]">
              <div className="relative min-w-[220px] flex-1 max-w-md">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, location or skill..."
                  className="h-9 rounded-[2px] pl-10 border border-[#d8d8d8] bg-white text-[13px] focus-visible:ring-0"
                />
              </div>
              <div className="min-w-[200px]">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="h-9 w-full rounded-[2px] border border-[#d8d8d8] bg-white px-3 text-[13px] text-[#555] focus:outline-none"
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
                {PROFILE_FILTERS.map((filter) => (
                  <Button
                    key={filter}
                    variant={selectedCategory === filter ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(filter)}
                    className={
                      selectedCategory === filter
                        ? 'h-9 rounded-[2px] bg-black text-white text-[13px] px-3 hover:bg-black'
                        : 'h-9 rounded-[2px] border border-[#d8d8d8] bg-white text-[#555] text-[13px] px-3 hover:bg-white'
                    }
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
            <p className="text-[13px] text-[#666]">{filteredProfiles.length} housegirls available</p>
          </div>
          <p className="text-[13px] text-[#666] mt-3 text-left">
            Verified profiles · KES 200 one-time M-Pesa fee · No subscription · Instant access
          </p>
        </div>
      </section>

      <main id="profiles-list" className="py-8">
        <div className="w-full px-10">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
            {filteredProfiles.map((profile) => {
              const isUnlocked = Boolean(unlockedProfiles[profile.id]);
              return (
                <article
                  key={profile.id}
                  className="bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6"
                >
                  <div className="flex flex-col md:flex-row gap-5 md:items-center">
                    <div className="md:w-[130px]">
                      <div className="relative w-fit">
                        {profile.avatar ? (
                          <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="h-[110px] w-[110px] rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-[110px] w-[110px] rounded-full bg-[#4b5563] text-white font-semibold text-2xl leading-tight flex items-center justify-center text-center">
                            {profile.name
                              .split(' ')
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((namePart) => namePart[0]?.toUpperCase())
                              .join('')}
                          </div>
                        )}
                        <span
                          className={`absolute bottom-1 right-1 h-2 w-2 rounded-full border border-white ${
                            profile.available ? 'bg-[#22c55e]' : 'bg-[#9ca3af]'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-[18px] font-semibold text-[#111]">{profile.name}</h3>
                        <Badge variant="secondary" className="w-fit border border-black bg-transparent text-black text-[13px] px-3 py-1 rounded-[2px]">
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

                    <div className="md:w-56 flex flex-col gap-1 md:items-end">
                      <p className="text-[22px] font-bold text-[#111]">
                        KES {profile.monthlyRate.toLocaleString()}
                        <span className="text-sm font-medium text-gray-500">/mo</span>
                      </p>
                      <Button
                        onClick={() => handleGetContact(profile.id)}
                        className="w-full md:w-auto rounded-[4px] px-6 bg-black hover:bg-[#333333] text-white transition-opacity duration-150"
                      >
                        {isUnlocked ? 'Contact Unlocked ✓' : 'Get Contact →'}
                      </Button>
                      {!isUnlocked && (
                        <>
                          <p className="text-[11px] text-[#888]">KES 200 via M-Pesa to unlock</p>
                          <p className="text-[11px] text-[#888]">Or unlock 3 contacts for KES 500 — save KES 100</p>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
            </div>

            <aside className="hidden lg:block sticky top-[80px]">
              <div className="space-y-4 w-[320px]">
                <div className="w-[320px]">
                  <img
                    src="/housegirls.webp"
                    alt="Domestic workers in Kenya"
                    loading="lazy"
                    className="w-[320px] h-[280px] object-cover object-[center_26%] rounded-[6px]"
                  />
                </div>
                <div className="w-[320px]">
                  <img
                    src="/woooies.avif"
                    alt="Home support services in Kenya"
                    loading="lazy"
                    className="w-[320px] h-[280px] object-cover object-center rounded-[6px]"
                  />
                </div>
              </div>
            </aside>
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
            <div className="border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Single Unlock</p>
              <p className="mt-2 text-2xl font-bold text-[#111]">KES 200</p>
              <p className="mt-2 text-[13px] text-[#555]">Unlock one profile contact instantly via M-Pesa.</p>
            </div>
            <div className="border border-[#111] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-600">Best Value</p>
              <p className="mt-2 text-2xl font-bold text-[#111]">KES 500</p>
              <p className="mt-2 text-[13px] text-[#555]">Unlock 3 contacts and save KES 100.</p>
            </div>
            <div className="border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
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
          package={CONTACT_UNLOCK_PACKAGE}
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

export default LandingPage;
