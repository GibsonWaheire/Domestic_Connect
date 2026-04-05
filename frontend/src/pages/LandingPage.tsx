import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Lock, Phone, Menu, MessageCircle, Users, MapPin, Banknote, Clock, Star, ShieldCheck, Zap, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthEnhanced';

const LandingPage = () => {
  const navigate = useNavigate();
  const heroImage = '/woooies.avif';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const { user } = useAuth();

  const heroSlides = [
    { type: 'image' },
    { type: 'features' },
    { type: 'stats' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Domestic Connect Kenya",
    "alternateName": "Domestic Connect",
    "description": "Kenya's trusted platform for finding verified housegirls, maids, nannies, cooks, caregivers, house managers and cleaners in Nairobi, Mombasa, Kisumu and across Kenya.",
    "url": "https://domestic-connect.co.ke",
    "image": "https://domestic-connect.co.ke/og-image.jpg",
    "priceRange": "KES 200",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Nairobi",
      "addressCountry": "KE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -1.286389,
      "longitude": 36.817223
    },
    "areaServed": [
      { "@type": "City", "name": "Nairobi" },
      { "@type": "City", "name": "Mombasa" },
      { "@type": "City", "name": "Kisumu" },
      { "@type": "City", "name": "Nakuru" },
      { "@type": "Country", "name": "Kenya" }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Domestic Worker Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Housegirl / House Help" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Nanny / Childcare" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cook" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Caregiver / Elderly Care" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "House Cleaner" } }
      ]
    }
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
    navigate('/login?mode=signup&userType=housegirl');
    setIsMenuOpen(false);
  };

  const openLogin = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
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

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#111] font-sans">
      <Helmet>
        <title>Domestic Connect Kenya | Find Trusted House Help, Nannies & Caregivers</title>
        <meta name="description" content="Domestic Connect Kenya — find verified housegirls, nannies, cooks and caregivers in Nairobi, Mombasa, Kisumu and across Kenya. Browse 1,000+ profiles. Pay only KES 200 to connect." />
        <meta name="keywords" content="domestic connect kenya, domestic connect nairobi, find housegirl kenya, maid nairobi, nanny kenya, caregiver kenya, house help kenya, house manager nairobi, houseboy kenya, cook kenya, cleaner nairobi, housegirl agency kenya, find maid kenya, maid agency nairobi" />
        <link rel="canonical" href="https://domestic-connect.co.ke/" />
        <meta property="og:title" content="Domestic Connect Kenya | Find Trusted House Help, Nannies & Caregivers" />
        <meta property="og:description" content="Find verified housegirls, nannies, cooks and caregivers in Nairobi, Mombasa, Kisumu and across Kenya. Pay only KES 200 to connect." />
        <meta property="og:url" content="https://domestic-connect.co.ke/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      {/* NAVBAR — sticky */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight text-[#111]">Domestic Connect</span>
          </Link>

          <nav className="hidden md:flex items-center gap-3">
            <Link to="/housegirls" className="bg-black text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-[#333] transition-colors">
              Find Househelp
            </Link>
            <button type="button" onClick={() => navigate('/for-housegirls')} className="bg-transparent text-black rounded-full px-4 py-1.5 text-sm font-medium border border-black hover:bg-black hover:text-white transition-colors">
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

          {/* hamburger — all screen sizes (full site nav lives here) */}
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

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'bg-black/30 opacity-100 pointer-events-auto' : 'bg-black/0 opacity-0 pointer-events-none'}`}>
        <aside
          id="landing-main-menu"
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-marketplace'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Find an Agency</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/how-it-works'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>How It Works</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/agency-packages'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Pricing & Packages</span><span className="text-gray-300 text-sm">›</span></button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">For Housegirls</p>
                <div className="flex flex-col">
                  <button type="button" onClick={() => { setIsMenuOpen(false); openHousegirlRegister(); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>Register as Housegirl</span><span className="text-gray-300 text-sm">›</span></button>
                  <button type="button" onClick={() => { setIsMenuOpen(false); navigate('/for-housegirls'); }} className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium border-b border-gray-100 last:border-0 hover:bg-white hover:text-black min-h-[48px] flex items-center justify-between"><span>How to Get Listed</span><span className="text-gray-300 text-sm">›</span></button>
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
      <section className="bg-[#FDF6F0] py-16 md:py-24">
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
              <Button onClick={openHousegirlRegister} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-white h-12 px-8 text-[15px] w-full sm:w-auto">
                Register as Housegirl
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 text-[13px] font-medium text-[#666]">
              <span className="flex items-center gap-1.5"><span className="text-amber-700">✓</span> Verified profiles</span>
              <span className="flex items-center gap-1.5"><span className="text-amber-700">✓</span> KES 200 one-time fee</span>
              <span className="flex items-center gap-1.5"><span className="text-amber-700">✓</span> No subscription</span>
              <span className="flex items-center gap-1.5"><span className="text-amber-700">✓</span> Same day access</span>
            </div>
            <a
              href="https://wa.me/254726899113"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium"
            >
              <MessageCircle size={18} className="text-green-600" />
              Need help? Chat with us on WhatsApp
            </a>
          </div>

          {/* Hero Carousel */}
          <div className="w-full max-w-md mx-auto">
            <style>{`
              @keyframes kenBurns {
                0%   { transform: scale(1)    translate(0%,   0%); }
                100% { transform: scale(1.12) translate(-3%, -2%); }
              }
              .hero-ken-burns { animation: kenBurns 9s ease-in-out infinite alternate; }
            `}</style>
            <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden relative h-72">

              {/* Slide 0 — Image with Ken Burns */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${heroSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="relative h-full overflow-hidden">
                  <img src={heroImage} alt="House help in Kenya" className="hero-ken-burns h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-9 left-4 right-4">
                    <p className="text-white font-semibold text-sm drop-shadow">500+ verified workers listed</p>
                    <Button onClick={() => navigate('/housegirls')} size="sm" className="mt-2 rounded-full bg-white text-[#111] hover:bg-gray-100 text-xs px-4 h-7 shadow">
                      Browse →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Slide 1 — Feature highlights */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${heroSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-white px-6 py-7 flex flex-col justify-center`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-5">Why families trust us</p>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: <ShieldCheck size={18} />, title: 'Verified Profiles', desc: 'Every worker is ID-checked and background-verified.' },
                    { icon: <Zap size={18} />, title: 'Same-Day Access', desc: 'Pay KES 200 and call directly — no waiting.' },
                    { icon: <ThumbsUp size={18} />, title: 'No Hidden Fees', desc: 'One payment. Direct contact. Zero commissions.' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">{icon}</div>
                      <div>
                        <p className="font-semibold text-[#111] text-sm leading-snug">{title}</p>
                        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide 2 — Stats / trust */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${heroSlide === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-[#111] px-6 py-7 flex flex-col justify-center`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-6">By the numbers</p>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { value: '500+', label: 'Verified Workers' },
                    { value: '15+', label: 'Cities in Kenya' },
                    { value: 'KES 200', label: 'One-time fee' },
                    { value: '< 48 hrs', label: 'Avg. time to hire' },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <Button onClick={() => navigate('/housegirls')} className="mt-7 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs px-4 h-8 w-full">
                  Browse Workers →
                </Button>
              </div>

              {/* Dot indicators */}
              <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-20">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => setHeroSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${heroSlide === i ? 'w-5 bg-white' : 'w-2 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">How it works</h2>
          <p className="text-center text-[#666] text-[14px] max-w-xl mx-auto mb-12">
            Whether you need a housegirl in Nairobi, a nanny in Mombasa, or a caregiver in Kisumu — here is how Domestic Connect works.
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { step: 1, icon: <Search size={28} />, title: 'Browse Profiles', desc: 'See available housegirls near you filtered by role, location and skills.' },
              { step: 2, icon: <Lock size={28} />, title: 'Unlock Contact', desc: 'Pay KES 200 via M-Pesa to reveal the phone number and location of your chosen housegirl.' },
              { step: 3, icon: <Phone size={28} />, title: 'Hire Directly', desc: 'Call or WhatsApp them directly. No middleman. No commission.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                    {icon}
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-bold flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="bg-[#FDF6F0] py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">Who is this for?</h2>
          <p className="text-center text-[#666] text-[14px] max-w-xl mx-auto mb-10">
            Whether you are hiring or looking for work, Domestic Connect is built for you.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div id="for-employers" className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">🏠 Looking for house help?</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Are you looking for a housegirl, nanny, cook or caregiver in Kenya? Browse hundreds of verified profiles from Nairobi, Mombasa, Kisumu, Nakuru and beyond. Pay only when you find the right person.
                </p>
              </div>
              <Button onClick={() => navigate('/housegirls')} className="rounded-xl bg-[#111] hover:bg-[#333] text-white w-fit px-6">
                Find Housegirls →
              </Button>
            </div>

            <div id="for-housegirls" className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">💼 Looking for work?</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Are you a housegirl, nanny, cook or caregiver looking for work in Kenya? Create a free profile on Domestic Connect and get discovered by families near you. No upfront fee. No commission deducted.
                </p>
              </div>
              <Button onClick={openHousegirlRegister} variant="outline" className="rounded-xl border-[#111] text-[#111] hover:bg-gray-50 w-fit px-6">
                Register Free →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#111] text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { icon: <Users size={20} />, value: '500+', label: 'Housegirls' },
              { icon: <MapPin size={20} />, value: '15+', label: 'Cities' },
              { icon: <Banknote size={20} />, value: 'KES 200', label: 'One-time fee' },
              { icon: <Clock size={20} />, value: 'Instantly', label: 'Access' },
            ].map(({ icon, value, label }, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 py-4 text-center ${i < 3 ? 'md:border-r md:border-white/10' : ''}`}>
                <span className="text-amber-300">{icon}</span>
                <span className="font-semibold text-lg">{value}</span>
                <span className="text-sm text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="bg-white py-16 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">What people say</h2>
          <p className="text-center text-[#666] text-[14px] max-w-xl mx-auto mb-10">
            Real stories from families and workers across Kenya.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="italic text-[#444] mb-4">
                "I found work in just 3 days. Domestic Connect truly delivers!"
              </p>
              <p className="text-[13px] font-bold text-[#111]">— Amina, House Help · Mombasa</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="italic text-[#444] mb-4">
                "Found a great nanny in 2 days. Honest and straightforward service."
              </p>
              <p className="text-[13px] font-bold text-[#111]">— Peter, Employer · Nairobi</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="italic text-[#444] mb-4">
                "This service is amazing. We hired our housekeeper in under 48 hours."
              </p>
              <p className="text-[13px] font-bold text-[#111]">— Joyce, Employer · Kisumu</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="text-lg font-bold text-white">Domestic Connect</p>
            <p className="text-sm text-[#aaa] mt-2">Trusted domestic staff platform in Kenya</p>
            <p className="text-sm text-[#aaa] mt-4">© {new Date().getFullYear()} Domestic Connect. All rights reserved.</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">For Employers</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/housegirls" className="text-white hover:text-[#aaa] transition-colors">Find a Housegirl</Link>
              <Link to="/how-it-works" className="text-white hover:text-[#aaa] transition-colors">How It Works</Link>
              <Link to="/why-choose-us" className="text-white hover:text-[#aaa] transition-colors">Why Choose Us</Link>
              <Link to="/agency-packages" className="text-white hover:text-[#aaa] transition-colors">Pricing</Link>
              <Link to="/contact-us" className="text-white hover:text-[#aaa] transition-colors">Contact Us</Link>
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

      {/* WHATSAPP WIDGET */}
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
