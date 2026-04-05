import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle2, Menu, MessageCircle, Shield, Star, Zap, Building2,
  Users, Lock, Briefcase, CreditCard, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthEnhanced';

const AgencyPackagesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.user_type === 'agency') return '/agency-dashboard';
    if (user.user_type === 'housegirl') return '/housegirl-dashboard';
    return '/employer-dashboard';
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMenuOpen(false); };
    const handleOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('mousedown', handleOutside);
    return () => { window.removeEventListener('keydown', handleEscape); window.removeEventListener('mousedown', handleOutside); };
  }, [isMenuOpen]);

  const agencyPackages = [
    {
      id: 'basic',
      name: 'Basic',
      price: 1200,
      badge: null,
      description: 'Perfect for small agencies starting out on the platform.',
      features: [
        'List up to 10 verified workers',
        'Basic agency profile page',
        '30-day replacement guarantee',
        'Standard background check',
        'Email support',
        'Local placements only',
      ],
      cta: 'Get Started',
      ctaStyle: 'outline',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 1500,
      badge: 'Most Popular',
      description: 'Best for growing agencies that want more visibility and clients.',
      features: [
        'List up to 30 verified workers',
        'Featured agency profile',
        '60-day replacement guarantee',
        'Full background check included',
        'Priority support',
        'Local & regional placements',
        'Analytics dashboard',
        'Client messaging',
      ],
      cta: 'Get Premium',
      ctaStyle: 'filled',
    },
    {
      id: 'international',
      name: 'International',
      price: 2000,
      badge: 'Best Value',
      description: 'For established agencies handling local and international placements.',
      features: [
        'Unlimited worker listings',
        'Top placement in search',
        '90-day replacement guarantee',
        'Comprehensive background checks',
        'Dedicated account manager',
        'Local & international placements',
        'Advanced analytics',
        'WhatsApp business integration',
        'Custom agency branding',
      ],
      cta: 'Go International',
      ctaStyle: 'outline',
    },
  ];

  const faqs = [
    {
      q: 'What is included in the monthly subscription?',
      a: 'Your subscription covers your agency profile listing on the platform, the ability to list verified workers, access to employer inquiries, and customer support. Background checks and replacement guarantees are package-dependent.',
    },
    {
      q: 'Can I upgrade or downgrade my package?',
      a: 'Yes, you can change your package at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.',
    },
    {
      q: 'How does the replacement guarantee work?',
      a: 'If a worker placed by your agency leaves or is unsatisfactory within the guarantee period, your agency provides a free replacement at no additional cost to the employer.',
    },
    {
      q: 'How do I get my agency verified?',
      a: 'Submit your NITA license or government registration certificate during signup. Our team reviews and verifies agencies within 24–48 hours. Verified agencies get a badge on their profile.',
    },
    {
      q: 'Do employers pay separately?',
      a: 'Yes. Employers pay your agency directly for placement fees per your quoted rate. The platform subscription fee is paid by your agency to maintain your listing on Domestic Connect.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#111] font-sans">
      <Helmet>
        <title>Agency Packages & Pricing | Domestic Connect Kenya</title>
        <meta name="description" content="List your domestic worker agency on Domestic Connect Kenya. Transparent pricing from KES 1,200/mo. Reach thousands of verified Kenyan families looking for housegirls, nannies and caregivers." />
        <meta name="keywords" content="domestic worker agency packages kenya, maid agency pricing kenya, domestic connect agency plan, hire housegirl agency nairobi, nanny agency packages kenya" />
        <link rel="canonical" href="https://domestic-connect.co.ke/agency-packages" />
        <meta property="og:title" content="Agency Packages & Pricing | Domestic Connect Kenya" />
        <meta property="og:description" content="Affordable packages for housegirl and maid agencies to list verified workers across Kenya. Plans from KES 1,200." />
        <meta property="og:url" content="https://domestic-connect.co.ke/agency-packages" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Agency Packages & Pricing | Domestic Connect Kenya" />
        <meta name="twitter:description" content="Affordable packages for housegirl and maid agencies to list verified workers across Kenya. Plans from KES 1,200." />
      </Helmet>

      {/* NAVBAR */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-40">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#111]">Domestic Connect</Link>
          <nav className="hidden md:flex items-center gap-3">
            <Link to="/housegirls" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5">Browse Workers</Link>
            <Link to="/agency-marketplace" className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-3 py-1.5">Find an Agency</Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate(getDashboardRoute())} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-[38px] px-5">Dashboard →</Button>
            ) : (
              <>
                <Button onClick={() => navigate('/login')} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-gray-50 h-[38px] px-5">Login</Button>
                <Button onClick={() => navigate('/login?mode=signup')} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-[38px] px-5">Join Today</Button>
              </>
            )}
          </div>
          <button type="button" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setIsMenuOpen(p => !p)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-black hover:bg-gray-100 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isMenuOpen ? 'bg-black/30 opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <aside ref={drawerRef} className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full overflow-y-auto p-6">
            <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
              <p className="text-[16px] font-bold text-[#111]">Domestic Connect</p>
              <button type="button" onClick={() => setIsMenuOpen(false)} className="h-10 w-10 inline-flex items-center justify-center text-gray-500 text-xl">×</button>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Find a Housegirl', to: '/housegirls' },
                { label: 'Find an Agency', to: '/agency-marketplace' },
                { label: 'How It Works', to: '/how-it-works' },
                { label: 'For Housegirls', to: '/for-housegirls' },
                { label: 'Contact Us', to: '/contact-us' },
              ].map(item => (
                <button key={item.to} type="button" onClick={() => { setIsMenuOpen(false); navigate(item.to); }}
                  className="py-3 px-3 rounded-lg text-[15px] text-gray-800 font-medium hover:bg-gray-50 flex items-center justify-between min-h-[48px]">
                  <span>{item.label}</span><span className="text-gray-300 text-sm">›</span>
                </button>
              ))}
              <div className="pt-2 flex flex-col gap-2 mt-2 border-t border-gray-100">
                {user ? (
                  <Button onClick={() => { setIsMenuOpen(false); navigate(getDashboardRoute()); }} className="w-full rounded-xl bg-black text-white">Dashboard →</Button>
                ) : (
                  <>
                    <Button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} variant="outline" className="w-full rounded-xl border-black text-black">Login</Button>
                    <Button onClick={() => { setIsMenuOpen(false); navigate('/login?mode=signup'); }} className="w-full rounded-xl bg-black text-white">Join Today</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* HERO */}
      <section className="bg-[#111] text-white py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            Transparent Pricing
          </span>
          <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
            Packages for every employer, housegirl & agency
          </h1>
          <p className="text-white/70 text-[16px] mb-8 max-w-xl mx-auto leading-relaxed">
            No hidden fees. Pay only for what you need — whether you're hiring directly, applying for a job, or listing your agency.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-white/60 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> M-Pesa accepted</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> Secure via Pesapal</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> No subscription traps</span>
          </div>
        </div>
      </section>

      {/* EMPLOYER PRICING */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">For Employers</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Hire directly — pay only to connect</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Browse all worker profiles free. Pay KSh 200 only when you're ready to contact a specific housegirl.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Users size={22} />, title: 'Browse Profiles', price: 'Free', desc: 'View hundreds of verified housegirl, nanny, cook and caregiver profiles — no payment needed.' },
              { icon: <Lock size={22} />, title: 'Unlock Contact', price: 'KSh 200', desc: 'Pay once per worker to reveal their phone number and email. Direct contact — no middleman.' },
              { icon: <Briefcase size={22} />, title: 'Post a Job', price: 'Free', desc: 'Post your job listing and let housegirls apply directly to you. Review and message applicants easily.' },
            ].map(item => (
              <div key={item.title} className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col">
                <div className="w-10 h-10 rounded-lg bg-[#111] text-white flex items-center justify-center mb-4">{item.icon}</div>
                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-2xl font-extrabold text-[#111] mb-3">{item.price}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button onClick={() => navigate('/housegirls')} className="rounded-full bg-[#111] hover:bg-[#333] text-white px-8 h-11">
              Browse Housegirls Free →
            </Button>
          </div>
        </div>
      </section>

      {/* HOUSEGIRL PRICING */}
      <section className="bg-[#fafafa] py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">For Housegirls</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Register free. Pay only when you apply.</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">No salary deductions. No agency commission. Keep 100% of your earnings.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', icon: '👤', title: 'Create Profile', price: 'Free', desc: 'Set up your full profile with your skills, experience, location, and a profile photo. Takes 5 minutes.' },
              { step: '2', icon: '🔍', title: 'Browse Jobs', price: 'Free', desc: 'See all active job listings from verified families across Kenya — Nairobi, Mombasa, Kisumu and more.' },
              { step: '3', icon: '📝', title: 'Apply for a Job', price: 'KSh 100', desc: 'Found the right job? Pay a small KSh 100 fee to apply, attach a short cover letter, and connect directly.' },
            ].map(item => (
              <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col items-center text-center shadow-sm">
                <div className="w-14 h-14 rounded-full bg-[#111] text-white flex items-center justify-center text-2xl mb-4">{item.icon}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Step {item.step}</div>
                <h3 className="font-bold text-base mb-1">{item.title}</h3>
                <p className="text-2xl font-extrabold text-[#111] mb-3">{item.price}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button onClick={() => navigate('/login?mode=signup&userType=housegirl')} className="rounded-full bg-[#111] hover:bg-[#333] text-white px-8 h-11">
              Register Free as Housegirl →
            </Button>
          </div>
        </div>
      </section>

      {/* AGENCY PACKAGES */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">For Agencies</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Choose your agency plan</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto">List your agency, showcase verified workers, and reach thousands of Kenyan families actively seeking domestic help.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {agencyPackages.map(pkg => (
              <div key={pkg.id}
                className={`rounded-2xl p-7 flex flex-col border-2 relative transition-shadow hover:shadow-xl ${pkg.badge === 'Most Popular' ? 'border-[#111] shadow-lg' : 'border-gray-200'}`}>
                {pkg.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap ${pkg.badge === 'Most Popular' ? 'bg-[#111] text-white' : 'bg-green-100 text-green-800'}`}>
                    {pkg.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{pkg.name} Package</h3>
                <p className="text-gray-500 text-sm mb-4">{pkg.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-[#111]">KSh {pkg.price.toLocaleString()}</span>
                  <span className="text-gray-400 text-sm ml-1">/month</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => navigate('/login?mode=signup')}
                  className={`w-full rounded-xl font-semibold ${pkg.ctaStyle === 'filled' ? 'bg-[#111] hover:bg-[#333] text-white' : 'bg-white border-2 border-[#111] text-[#111] hover:bg-gray-50'}`}
                  variant={pkg.ctaStyle === 'filled' ? 'default' : 'outline'}
                >
                  {pkg.cta}
                </Button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">All plans include a 7-day free trial. Cancel anytime. Prices in KES + applicable taxes.</p>
        </div>
      </section>

      {/* WHY LIST YOUR AGENCY */}
      <section className="bg-[#fafafa] py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 tracking-tight">Why list on Domestic Connect?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { icon: <Users size={20} />, title: '10,000+ Verified Families', desc: 'Reach thousands of actively hiring employers across Kenya who are ready to pay for qualified workers.' },
              { icon: <Shield size={20} />, title: 'Verified Agency Badge', desc: 'Your agency gets a "Verified" badge once your license is confirmed — building instant trust with clients.' },
              { icon: <Star size={20} />, title: 'Rating & Review System', desc: 'Showcase your successful placements, ratings, and reviews to stand out from unverified recruiters.' },
              { icon: <Zap size={20} />, title: 'Instant Visibility', desc: 'Your agency profile goes live within 24 hours of verification and appears in search results immediately.' },
              { icon: <CreditCard size={20} />, title: 'Flexible Payments', desc: 'Pay via M-Pesa, card, or bank transfer through our secure Pesapal-powered payment system.' },
              { icon: <Building2 size={20} />, title: 'Dedicated Support', desc: 'Get onboarding help and ongoing support from our team to maximise your placements on the platform.' },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#111] text-white flex items-center justify-center mb-3">{item.icon}</div>
                <h3 className="font-bold text-[#111] mb-1.5">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[780px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 justify-center mb-8">
            <HelpCircle className="h-5 w-5 text-gray-400" />
            <h2 className="text-2xl font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <h3 className="font-semibold text-[#111] mb-2 text-sm">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            Still have questions?{' '}
            <button onClick={() => navigate('/contact-us')} className="text-[#111] font-medium underline hover:no-underline">Contact our team</button>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111] text-white py-14">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Ready to grow your agency?</h2>
          <p className="text-white/70 mb-6 text-sm">Join hundreds of verified agencies already connecting with Kenyan families through Domestic Connect.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/login?mode=signup')} className="rounded-full bg-white text-[#111] hover:bg-gray-100 h-12 px-10 text-base font-semibold">
              List Your Agency →
            </Button>
            <Button onClick={() => navigate('/agency-marketplace')} variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10 h-12 px-8 text-base">
              Browse Agencies
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
        <span className="mr-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#111] shadow-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          Chat with us
        </span>
        <a href="https://wa.me/254726899113" target="_blank" rel="noopener noreferrer"
          className="h-14 w-14 rounded-full bg-green-500 text-white shadow-xl inline-flex items-center justify-center hover:bg-green-600 transition-colors"
          aria-label="Chat on WhatsApp">
          <MessageCircle size={24} />
        </a>
      </div>
    </div>
  );
};

export default AgencyPackagesPage;
