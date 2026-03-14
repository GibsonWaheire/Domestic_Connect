import { Helmet } from 'react-helmet-async';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuthEnhanced';
import PaymentModal, { PackageDetails } from '@/components/PaymentModal';
import { MapPin, Menu, Phone, Search, X } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { FirebaseAuthService } from '@/lib/firebaseAuth';

const bgImage = '/housegirls.webp';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://domesticconnect-production.up.railway.app';

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
  unlockCount: number;
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

type ApiHousegirl = {
  id: string | number;
  first_name?: string;
  last_name?: string;
  skills?: string[];
  experience?: string;
  expected_salary?: number;
  is_available?: boolean;
  phone_number?: string | null;
  phone?: string | null;
  location?: string;
  profile_photo_url?: string | null;
  unlock_count?: number;
};

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
  const [searchParams] = useSearchParams();

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.user_type === 'agency') return '/agency-dashboard';
    if (user.user_type === 'housegirl') return '/housegirl-dashboard';
    return '/employer-dashboard';
  };

  const [selectedCategory, setSelectedCategory] = useState<RoleType | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentPackage, setSelectedPaymentPackage] = useState<PackageDetails>(CONTACT_UNLOCK_PACKAGE);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [unlockedProfiles, setUnlockedProfiles] = useState<Record<string, { phone?: string; email?: string }>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All locations');
  const [kenyaCities, setKenyaCities] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highDemandWarning, setHighDemandWarning] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const filteredProfiles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return profiles.filter((profile) => {
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
  }, [profiles, searchTerm, selectedCategory, selectedLocation]);
  useEffect(() => {
    const normalizeRole = (skills: string[] = []): RoleType => {
      const combined = skills.join(' ').toLowerCase();
      if (combined.includes('nanny') || combined.includes('child')) return 'Nanny';
      if (combined.includes('cook') || combined.includes('chef')) return 'Cook';
      if (combined.includes('care') || combined.includes('elder')) return 'Caregiver';
      if (combined.includes('clean')) return 'Cleaner';
      return 'House Help';
    };

    const parseExperienceYears = (experience?: string): number => {
      if (!experience) return 0;
      const parsed = Number.parseInt(experience.replace(/\D+/g, ''), 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    const loadProfiles = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/api/housegirls/`;
        console.log('Fetching from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('Profiles received:', data.housegirls?.length);
        const apiProfiles: ApiHousegirl[] = data?.housegirls || [];
        const mappedProfiles: Profile[] = apiProfiles.map((profile) => {
          const firstName = profile.first_name?.trim() || 'Unknown';
          const lastName = profile.last_name?.trim() || '';
          const name = `${firstName} ${lastName}`.trim();
          const location = profile.location || 'Location not provided';
          return {
            id: String(profile.id),
            name,
            role: normalizeRole(profile.skills),
            location,
            tags: profile.skills || [],
            experienceYears: parseExperienceYears(profile.experience),
            monthlyRate: Number(profile.expected_salary) || 0,
            available: Boolean(profile.is_available),
            phone: profile.phone_number || profile.phone || 'Unlock to view',
            exactLocation: location,
            avatar: profile.profile_photo_url || null,
            unlockCount: Number(profile.unlock_count) || 0,
          };
        });
        setProfiles(mappedProfiles);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setProfiles([]);
        setError('Could not load profiles.');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedLocation]);

  const totalPages = Math.ceil(filteredProfiles.length / 10);
  const paginatedProfiles = filteredProfiles.slice((currentPage - 1) * 10, currentPage * 10);

  const handleGetContact = (profileId: string) => {
    if (!user) {
      const profile = profiles.find((p) => p.id === profileId);
      sessionStorage.setItem('unlock_after_login', JSON.stringify({
        profileId,
        profileName: profile?.name || '',
        returnUrl: '/housegirls',
      }));
      navigate('/login?mode=signup');
      return;
    }
    const found = profiles.find((profile) => profile.id === profileId);
    if (found && found.unlockCount >= 3) {
      setHighDemandWarning(`⚡ High demand — unlocked ${found.unlockCount} times. They may not be available.`);
    } else {
      setHighDemandWarning(null);
    }
    setSelectedProfileId(profileId);
    setSelectedPaymentPackage(CONTACT_UNLOCK_PACKAGE);
    setShowPaymentModal(true);
  };

  const handlePricingClick = (pkg: PackageDetails) => {
    if (!user) {
      navigate('/login?mode=signup');
      return;
    }
    setSelectedProfileId(null);
    setSelectedPaymentPackage(pkg);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (selectedProfileId) {
      try {
        const token = await FirebaseAuthService.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/housegirls/${selectedProfileId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUnlockedProfiles((prev) => ({
            ...prev,
            [selectedProfileId]: {
              phone: data.phone !== 'Unlock to view' ? data.phone : undefined,
              email: data.email !== 'Unlock to view' ? data.email : undefined,
            },
          }));
        } else {
          setUnlockedProfiles((prev) => ({ ...prev, [selectedProfileId]: {} }));
        }
      } catch {
        setUnlockedProfiles((prev) => ({ ...prev, [selectedProfileId]: {} }));
      }
    }
    setSelectedProfileId(null);
    setShowPaymentModal(false);
  };

  useEffect(() => {
    if (!user || profiles.length === 0) return;

    // Priority 1: ?unlock=profileId in URL (set by auth hooks after login)
    const unlockParam = searchParams.get('unlock');
    if (unlockParam) {
      window.history.replaceState({}, '', '/housegirls');
      const match = profiles.find((p) => p.id === unlockParam);
      if (match) {
        setSelectedProfileId(match.id);
        setSelectedPaymentPackage(CONTACT_UNLOCK_PACKAGE);
        setShowPaymentModal(true);
      }
      return;
    }

    // Priority 2: sessionStorage (set by handleGetContact before redirect)
    const raw = sessionStorage.getItem('unlock_after_login');
    if (!raw) return;

    let pendingId: string | null = null;
    try {
      const parsed = JSON.parse(raw);
      pendingId = parsed.profileId || null;
    } catch {
      pendingId = raw; // fallback for plain string
    }

    sessionStorage.removeItem('unlock_after_login');
    if (!pendingId) return;

    const matchingProfile = profiles.find((p) => p.id === pendingId);
    if (!matchingProfile) return;

    setSelectedProfileId(matchingProfile.id);
    setSelectedPaymentPackage(CONTACT_UNLOCK_PACKAGE);
    setShowPaymentModal(true);
  }, [profiles, user, searchParams]);

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
            profiles.map((profile) => profile.location.split(',').at(-1)?.trim()).filter(
              (city): city is string => Boolean(city)
            )
          )
        ).sort((a, b) => a.localeCompare(b));
        setKenyaCities(fallbackCities);
      }
    };

    loadKenyaCities();
  }, [profiles]);

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
        <title>Browse Domestic Workers | Domestic Connect Kenya</title>
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
                    Dashboard →
                  </Button>
                  <Button variant="outline" onClick={signOut} className="hidden md:inline-flex border-gray-300 text-black bg-transparent hover:bg-gray-100 rounded-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate('/login?mode=signup')}
                    variant="outline"
                    className="text-sm font-medium text-black border border-black hover:bg-gray-50 rounded-full px-5 py-2 transition-colors"
                  >
                    Register as Housegirl
                  </Button>
                  <Button
                    onClick={() => navigate('/login?mode=signup')}
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
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="h-full overflow-y-auto p-6">
            <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
              <p className="text-[16px] font-bold text-[#111]">Domestic Connect</p>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMenuOpen(false)}
                className="h-10 w-10 inline-flex items-center justify-center text-gray-500"
              >
                ×
              </button>
            </div>
            <div>
              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">For Employers</p>
                <div className="flex flex-col">
                  <button type="button" onClick={() => { setIsMenuOpen(false); handleFindHelp(); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Find a Housegirl</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/how-it-works'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>How It Works</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-packages'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Pricing & Packages</span><span className="text-gray-300 text-sm">›</span></button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">For Housegirls</p>
                <div className="flex flex-col">
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/login?mode=signup'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Register as Housegirl</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/housegirls'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>How to Get Listed</span><span className="text-gray-300 text-sm">›</span></button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">For Agencies</p>
                <div className="flex flex-col">
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-marketplace'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Agency Marketplace</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/login?mode=signup'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>List Your Agency</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-packages'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Agency Packages</span><span className="text-gray-300 text-sm">›</span></button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">General</p>
                <div className="flex flex-col">
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/why-choose-us'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>About Us</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/stats'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Help Center</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/contact-us'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Contact Us</span><span className="text-gray-300 text-sm">›</span></button>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Button
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate(getDashboardRoute());
                      }}
                      className="w-full rounded-xl py-3 text-center font-medium bg-black text-white hover:bg-[#333]"
                    >
                      Dashboard →
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut();
                      }}
                      className="w-full rounded-xl py-3 text-center font-medium border border-black text-black"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => { setIsMenuOpen(false); navigate('/login?mode=signup'); }} variant="outline" className="w-full rounded-xl py-3 text-center font-medium border border-black text-black">
                      Sign Up
                    </Button>
                    <Button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="w-full rounded-xl py-3 text-center font-medium bg-black text-white hover:bg-[#333]">
                      Join Today
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="relative md:sticky top-[73px] z-40 bg-[#111] w-full">
        <div className="px-4 md:px-12 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-1 flex-col md:flex-row md:items-center gap-3">
              <div className="relative w-full md:flex-1 md:max-w-md">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, location or skill..."
                  className="h-9 rounded-[2px] pl-10 border-0 bg-[#222] text-white placeholder-white focus-visible:ring-0"
                />
              </div>
              <div className="w-full md:w-[220px]">
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
              <div className="w-full md:w-auto overflow-x-auto md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex flex-nowrap md:flex-wrap gap-2 min-w-max">
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
            </div>
            <p className="text-[13px] text-[#888] text-left">{filteredProfiles.length} housegirls available</p>
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 md:px-12 w-full">

        <main id="profiles-list" className="mt-4 py-8">
          <div className="w-full px-0 md:px-10">
            <div className="flex flex-col w-full relative">
              <div className="flex flex-col gap-[8px] w-full">
                {loading && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    Loading profiles...
                  </div>
                )}
                {!loading && error && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      Could not load profiles.
                      {' '}
                      Please try again later.
                    </p>
                    <button onClick={() => window.location.reload()}>
                      Retry
                    </button>
                  </div>
                )}
                {!error && paginatedProfiles.map((profile) => {
                  const unlockData = unlockedProfiles[profile.id];
                  const isUnlocked = unlockData !== undefined;
                  return (
                    <article
                      key={profile.id}
                      className={`bg-white border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5 cursor-pointer hover:shadow-md transition-all ${ROLE_BORDER[profile.role as RoleType]}`}
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-center md:items-center">
                        <div className="relative flex-shrink-0 mx-auto md:mx-0">
                          <UserAvatar
                            src={profile.avatar}
                            name={profile.name}
                            size="xl"
                            isAvailable={profile.available}
                          />
                        </div>

                        <div className="flex-1 w-full">
                          <div className="flex flex-col gap-1 text-center md:text-left">
                            <h3 className="text-[18px] font-semibold text-[#111] leading-none mb-1">{profile.name}</h3>

                            {profile.unlockCount >= 3 ? (
                              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                                ⚡ High demand · unlocked {profile.unlockCount} times
                              </div>
                            ) : profile.unlockCount > 0 ? (
                              <div className="text-[11px] text-amber-600 w-fit mx-auto md:mx-0">
                                🔓 Unlocked {profile.unlockCount} times
                              </div>
                            ) : null}

                            <Badge variant="secondary" className={`w-fit mx-auto md:mx-0 border bg-transparent text-[13px] px-3 py-1 rounded-[2px] ${ROLE_BADGE[profile.role as RoleType]}`}>
                              {profile.role}
                            </Badge>
                            <p className="text-[#555] text-[13px] flex items-center justify-center md:justify-start gap-1">
                              <MapPin className="h-4 w-4 text-[#555]" />
                              {profile.location}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                              {profile.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="border border-[#ddd] bg-transparent text-[#555] text-[12px] rounded-[2px] px-2 py-1">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-[#555] text-[13px]">{profile.experienceYears} yrs experience</p>

                            {isUnlocked && (
                              <div className="text-[13px] border border-green-200 bg-green-50 px-3 py-2 w-fit mx-auto md:mx-0 rounded space-y-0.5">
                                <div className="text-green-700 font-medium">✓ Contact Unlocked</div>
                                {unlockData?.phone && <div className="text-[#555]">📞 {unlockData.phone}</div>}
                                {unlockData?.email && <div className="text-[#555]">📧 {unlockData.email}</div>}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="w-full md:w-56 flex flex-col gap-2 items-center md:items-end">
                          <p className="text-[22px] font-bold text-[#111] text-center md:text-right">
                            KES {profile.monthlyRate.toLocaleString()}
                            <span className="text-sm font-medium text-gray-500">/mo</span>
                          </p>
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleGetContact(profile.id); }}
                            className="w-full md:w-auto rounded-[4px] px-6 bg-black hover:bg-[#333] text-white transition-opacity duration-150"
                          >
                            {isUnlocked ? 'Contact Unlocked ✓' : 'Unlock Contact - KES 200'}
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
                    className={`text-xs md:text-[13px] mr-1 md:mr-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-[#555]'}`}
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
                        className={`${Math.abs(page - currentPage) > 1 ? 'hidden md:inline-flex' : 'inline-flex'} items-center justify-center h-7 md:h-8 min-w-[28px] md:min-w-[32px] px-2 text-xs md:text-[13px] ${currentPage === page
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
                    className={`text-xs md:text-[13px] ml-1 md:ml-2 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:text-[#555]'}`}
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
          <div className="mt-3 flex items-center justify-center gap-4 text-sm">
            <a href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-gray-500">·</span>
            <a href="/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

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
            setHighDemandWarning(null);
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
      {showPaymentModal && highDemandWarning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-700">
          {highDemandWarning}
        </div>
      )}

      {selectedProfile && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Profile</h2>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <UserAvatar
                  src={selectedProfile.avatar}
                  name={selectedProfile.name}
                  size="xl"
                  isAvailable={selectedProfile.available}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedProfile.name}</h3>
                  <Badge variant="secondary" className={`border bg-transparent text-[13px] px-3 py-1 rounded-[2px] ${ROLE_BADGE[selectedProfile.role as RoleType]}`}>
                    {selectedProfile.role}
                  </Badge>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />{selectedProfile.location}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProfile.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="border border-[#ddd] bg-transparent text-[#555] text-[12px] rounded-[2px] px-2 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Experience</span>
                  <p className="font-medium">{selectedProfile.experienceYears} yrs</p>
                </div>
                <div>
                  <span className="text-gray-500">Monthly Rate</span>
                  <p className="font-medium">KES {selectedProfile.monthlyRate.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-2">
                {user ? (
                  <Button
                    className="w-full rounded-[4px] bg-black hover:bg-[#333] text-white"
                    onClick={() => {
                      setSelectedProfile(null);
                      handleGetContact(selectedProfile.id);
                    }}
                  >
                    {unlockedProfiles[selectedProfile.id] !== undefined ? 'Contact Unlocked ✓' : 'Unlock Contact - KES 200'}
                  </Button>
                ) : (
                  <Button
                    className="w-full rounded-[4px] bg-black hover:bg-[#333] text-white"
                    onClick={() => navigate('/login?mode=signup')}
                  >
                    Sign in to unlock contact
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousegirlsListPage;
