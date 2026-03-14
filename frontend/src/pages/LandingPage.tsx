import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Lock, Phone, Menu, MessageCircle, Users, MapPin, Banknote, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthEnhanced';
import UserAvatar from '@/components/ui/UserAvatar';
import { API_BASE_URL } from '@/lib/apiConfig';

const LandingPage = () => {
  const navigate = useNavigate();
  const heroImage = '/woooies.avif';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [featuredHousegirls, setFeaturedHousegirls] = useState<any[]>([]);
  const [loadingHousegirls, setLoadingHousegirls] = useState(true);
  const { user } = useAuth();
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Domestic Connect",
    "description": "Find verified domestic workers across Kenya",
    "url": "https://domestic-connect.co.ke",
    "areaServed": "Kenya",
    "serviceType": [
      "House Help",
      "Nanny",
      "Cook",
      "Caregiver",
      "Cleaner"
    ]
  };

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.user_type === 'agency') return '/agency-dashboard';
    if (user.user_type === 'housegirl') return '/housegirl-dashboard';
    return '/employer-dashboard';
  };
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const openRegister = () => {
    navigate('/login?mode=signup');
    setIsMenuOpen(false);
  };

  const openHousegirlRegister = () => {
    navigate('/login?mode=signup');
    setIsMenuOpen(false);
  };

  const openLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

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
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/housegirls/`);
        if (res.ok) {
          const data = await res.json();
          // Filter out those without names and limit to 4
          const girls = (data.housegirls || [])
            .filter((g: any) => g.first_name)
            .slice(0, 4);
          setFeaturedHousegirls(girls);
        }
      } catch (err) {
        console.error('Error fetching featured housegirls:', err);
      } finally {
        setLoadingHousegirls(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#111] font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {/* NAVBAR */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight text-[#111]">Domestic Connect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-3">
            <Link to="/housegirls" className="bg-black text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-[#333] transition-colors">
              Find Househelp
            </Link>
            <button type="button" onClick={openHousegirlRegister} className="bg-transparent text-black rounded-full px-4 py-1.5 text-sm font-medium border border-black hover:bg-black hover:text-white transition-colors">
              For Housegirls
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate(getDashboardRoute())} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-[38px] px-5">
                Dashboard →
              </Button>
            ) : (
              <>
                <Button onClick={openLogin} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-gray-50 h-[38px] px-5">
                  Login
                </Button>
                <Button onClick={openRegister} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-[38px] px-5">
                  Join Today
                </Button>
              </>
            )}
          </div>

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
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/housegirls'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Find a Housegirl</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-marketplace'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Find an Agency → /agency-marketplace</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/how-it-works'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>How It Works</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-packages'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Pricing & Packages</span><span className="text-gray-300 text-sm">›</span></button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">For Housegirls</p>
                <div className="flex flex-col">
                  <button type="button" onClick={() => { setIsMenuOpen(false); openHousegirlRegister(); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Register as Housegirl</span><span className="text-gray-300 text-sm">›</span></button>
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
                  <Button onClick={() => { setIsMenuOpen(false); navigate(getDashboardRoute()); }} className="w-full rounded-xl py-3 text-center font-medium bg-black text-white hover:bg-[#333]">
                    Dashboard →
                  </Button>
                ) : (
                  <>
                    <Button onClick={openLogin} variant="outline" className="w-full rounded-xl py-3 text-center font-medium border border-black text-black">
                      Login
                    </Button>
                    <Button onClick={openRegister} className="w-full rounded-xl py-3 text-center font-medium bg-black text-white hover:bg-[#333]">
                      Join Today
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* HERO SECTION */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 w-full grid md:grid-cols-2 gap-10 md:gap-8 items-center">
          <div className="text-center md:text-left">

            <h1 className="text-[36px] md:text-[48px] font-extrabold tracking-tight leading-[1.1] max-w-xl mb-5">
              Find trusted house help — fast
            </h1>
            <p className="text-[#555] text-[16px] mb-8 max-w-md leading-relaxed mx-auto md:mx-0">
              Verified housegirls, nannies, cooks and caregivers across Kenya. Pay KES 200 via M-Pesa. No agency fees. No salary cuts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-6">
              <Button onClick={() => navigate('/housegirls')} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-12 px-8 text-[15px] w-full sm:w-auto">
                Browse Housegirls →
              </Button>
              <Button onClick={openHousegirlRegister} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-gray-50 h-12 px-8 text-[15px] w-full sm:w-auto">
                Register as Housegirl
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 text-[13px] font-medium text-[#666]">
              <span className="flex items-center gap-1.5"><span className="text-green-600">✓</span> Verified profiles</span>
              <span className="flex items-center gap-1.5"><span className="text-green-600">✓</span> KES 200 one-time fee</span>
              <span className="flex items-center gap-1.5"><span className="text-green-600">✓</span> No subscription</span>
              <span className="flex items-center gap-1.5"><span className="text-green-600">✓</span> Same day access</span>
            </div>
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium"
            >
              <MessageCircle size={18} className="text-green-600" />
              Need help? Chat with us on WhatsApp
            </a>
          </div>

          <div className="w-full max-w-md mx-auto flex flex-col gap-4">
            <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <img src={heroImage} alt="House help in Kenya" className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="text-sm text-gray-600">Verified profiles across Kenya</p>
              </div>
            </div>
            
            {loadingHousegirls ? (
              // Loading skeletons
              [1, 2, 3].map((i) => (
                <div key={i} className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : featuredHousegirls.length > 0 ? (
              featuredHousegirls.map((girl) => (
                <div key={girl.id} className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-3">
                  <UserAvatar
                    src={girl.profile_photo_url}
                    name={`${girl.first_name} ${girl.last_name || ''}`}
                    size="md"
                    isAvailable={girl.is_available}
                  />
                  <div>
                    <p className="text-base font-bold text-[#111]">{girl.first_name} {girl.last_name?.charAt(0)}.</p>
                    <p className="text-sm text-gray-600">
                      {girl.experience || 'House Help'} · {girl.location || 'Kenya'}
                    </p>
                  </div>
                  <div className="ml-auto inline-flex items-center gap-2 text-sm text-green-700 font-medium">
                    <span className={`h-2.5 w-2.5 rounded-full ${girl.is_available ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {girl.is_available ? 'Available' : 'Unavailable'}
                  </div>
                </div>
              ))
            ) : (
              // Fallback to placeholders if no real girls found (unlikely)
              <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
                <p className="text-sm text-gray-500 italic">Finding available help near you...</p>
                <Button onClick={() => navigate('/housegirls')} variant="link">Browse Directory</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-[#fafafa] py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">How it works</h2>
          <p className="text-center text-[#666] text-[14px] max-w-xl mx-auto mb-8">
            Whether you need a housegirl in Nairobi, a nanny in Mombasa, or a caregiver in Kisumu — here is how Domestic Connect works.
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f5] text-[#333] flex items-center justify-center mb-6">
                <Search size={28} className="text-[#333]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Browse Profiles</h3>
              <p className="text-gray-500 leading-relaxed">
                See available housegirls near you filtered by role, location and skills.
              </p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f5] text-[#333] flex items-center justify-center mb-6">
                <Lock size={28} className="text-[#333]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Unlock Contact</h3>
              <p className="text-gray-500 leading-relaxed">
                Pay KES 200 via M-Pesa to reveal the phone number and location of your chosen housegirl.
              </p>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f5] text-[#333] flex items-center justify-center mb-6">
                <Phone size={28} className="text-[#333]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Hire Directly</h3>
              <p className="text-gray-500 leading-relaxed">
                Call or WhatsApp them directly. No middleman. No commission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div id="for-employers" className="bg-white p-8 rounded-[4px] border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">🏠 Looking for house help?</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Are you looking for a housegirl, nanny, cook or caregiver in Kenya? Browse hundreds of verified profiles from Nairobi, Mombasa, Kisumu, Nakuru and beyond. Pay only when you find the right person.
                </p>
              </div>
              <Button onClick={() => navigate('/housegirls')} className="rounded-[4px] bg-[#111] hover:bg-[#333] text-white w-fit px-6">
                Find Housegirls →
              </Button>
            </div>

            <div id="for-housegirls" className="bg-white p-8 rounded-[4px] border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">💼 Looking for work?</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Are you a housegirl, nanny, cook or caregiver looking for work in Kenya? Create a free profile on Domestic Connect and get discovered by families near you. No upfront fee. No commission deducted.
                </p>
              </div>
              <Button onClick={openHousegirlRegister} variant="outline" className="rounded-[4px] border-[#111] text-[#111] hover:bg-gray-50 w-fit px-6">
                Register Free →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#111] text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users size={20} className="text-white" />
              <span className="font-semibold text-lg">500+</span>
              <span className="text-sm text-gray-300">Housegirls</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin size={20} className="text-white" />
              <span className="font-semibold text-lg">15+</span>
              <span className="text-sm text-gray-300">Cities</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Banknote size={20} className="text-white" />
              <span className="font-semibold text-lg">KES 200</span>
              <span className="text-sm text-gray-300">One-time fee</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Clock size={20} className="text-white" />
              <span className="font-semibold text-lg">Instantly</span>
              <span className="text-sm text-gray-300">Access</span>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="bg-[#fafafa] py-16 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-10 tracking-tight">What people say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-lg mb-3">⭐⭐⭐⭐⭐</p>
              <p className="italic text-[#444] mb-4">
                "Nilipa kazi in 3 days. Asante Domestic Connect!"
              </p>
              <p className="text-[13px] font-bold text-[#111]">— Amina, House Help · Mombasa</p>
            </div>
            <div className="bg-blue border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-lg mb-3">⭐⭐⭐⭐⭐</p>
              <p className="italic text-[#444] mb-4">
                "Found a great nanny in 2 days. Honest and straightforward service."
              </p>
              <p className="text-[13px] font-bold text-[#111]">— Peter, Employer · Nairobi</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-lg mb-3">⭐⭐⭐⭐⭐</p>
              <p className="italic text-[#444] mb-4">
                "thanks guys, ur amazing!."
              </p>
              <p className="text-[13px] font-bold text-[#111]">— Joyce, Employer · Kisumu</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#111] text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="text-lg font-bold text-white">Domestic Connect</p>
            <p className="text-sm text-[#aaa] mt-2">Trusted domestic staff platform in Kenya</p>
            <p className="text-sm text-[#aaa] mt-4">© {new Date().getFullYear()} Domestic Connect</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">For Employers</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/housegirls" className="text-white hover:text-[#aaa] transition-colors">Find a Housegirl</Link>
              <Link to="/how-it-works" className="text-white hover:text-[#aaa] transition-colors">How It Works</Link>
              <Link to="/agency-packages" className="text-white hover:text-[#aaa] transition-colors">Pricing</Link>
              <Link to="/agency-marketplace" className="text-white hover:text-[#aaa] transition-colors">Agency Marketplace</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">For Housegirls</p>
            <div className="flex flex-col gap-2 text-sm">
              <button type="button" onClick={openHousegirlRegister} className="text-left text-white hover:text-[#aaa] transition-colors">Register Free</button>
              <Link to="/housegirls" className="text-white hover:text-[#aaa] transition-colors">How to Get Listed</Link>
              {user ? (
                <button type="button" onClick={() => navigate(getDashboardRoute())} className="text-left text-white hover:text-[#aaa] transition-colors">Go to Dashboard</button>
              ) : (
                <button type="button" onClick={openLogin} className="text-left text-white hover:text-[#aaa] transition-colors">Dashboard Login</button>
              )}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">Contact</p>
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-white">📍 Nairobi, Kenya</p>
              <a href="https://wa.me/254726899113" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#aaa] transition-colors">📱 WhatsApp us</a>
              <p className="text-white">🌐 domesticconnect.co.ke</p>
              <Link to="/privacy-policy" className="text-white hover:text-[#aaa] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-white hover:text-[#aaa] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-5 left-5 z-50 group flex items-center">
        <span className="mr-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#111] shadow-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          Chat with us
        </span>
        <a
          href="https://wa.me/254726899113"
          target="_blank"
          rel="noopener noreferrer"
          className="h-14 w-14 rounded-full bg-green-500 text-white shadow-xl inline-flex items-center justify-center hover:bg-green-600 transition-colors"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </div>
  );
};

export default LandingPage;
