import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Lock, Phone, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';

const LandingPage = () => {
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openRegister = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  const openLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans">
      {/* NAVBAR */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Domestic Connect
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/housegirls" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Find Help
            </Link>
            <Link to="/agency-packages" className="text-sm font-medium hover:text-gray-600 transition-colors">
              Agencies
            </Link>
            <div className="flex items-center gap-3 ml-4">
              <Button onClick={openLogin} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-gray-50 h-[38px] px-5">
                Login
              </Button>
              <Button onClick={openRegister} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-[38px] px-5">
                Join Today
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 -mr-2 text-[#111]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-4">
            <Link to="/housegirls" className="block py-2 text-[15px] font-medium" onClick={() => setIsMenuOpen(false)}>
              Find Help
            </Link>
            <Link to="/agency-packages" className="block py-2 text-[15px] font-medium" onClick={() => setIsMenuOpen(false)}>
              Agencies
            </Link>
            <div className="pt-2 flex flex-col gap-3">
              <Button onClick={openLogin} variant="outline" className="w-full rounded-[4px] border-[#111] text-[#111]">
                Login
              </Button>
              <Button onClick={openRegister} className="w-full rounded-[4px] bg-[#111] text-white">
                Join Today
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="bg-white py-16 md:py-24 flex items-center min-h-[calc(100vh-64px)] md:min-h-0">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 w-full text-center md:text-left flex flex-col md:items-start items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-2xl mb-6">
            Find trusted <br className="hidden md:block" /> house help <br className="hidden md:block" /> in Kenya
          </h1>
          <p className="text-gray-500 text-[16px] md:text-lg mb-8 max-w-xl leading-relaxed">
            Browse verified housegirls, nannies, cooks and caregivers across Kenya. 
            Pay KES 200 via M-Pesa to unlock any contact. No agency fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10">
            <Button onClick={() => navigate('/housegirls')} className="rounded-full bg-[#111] hover:bg-[#333] text-white h-12 px-8 text-[15px] w-full sm:w-auto">
              Browse Housegirls →
            </Button>
            <Button onClick={openRegister} variant="outline" className="rounded-full border-[#111] text-[#111] hover:bg-gray-50 h-12 px-8 text-[15px] w-full sm:w-auto">
              Register as Housegirl
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 text-sm font-medium text-gray-600">
            <span className="flex items-center gap-1.5"><span className="text-green-600">✓</span> Verified profiles</span>
            <span className="flex items-center gap-1.5"><span className="text-green-600">✓</span> KES 200 one-time</span>
            <span className="flex items-center gap-1.5"><span className="text-green-600">✓</span> No subscription</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-16 tracking-tight">How it works</h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <Search size={28} className="text-[#111]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Browse Profiles</h3>
              <p className="text-gray-500 leading-relaxed">
                See available housegirls near you filtered by role, location and skills.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <Lock size={28} className="text-[#111]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Unlock Contact</h3>
              <p className="text-gray-500 leading-relaxed">
                Pay KES 200 via M-Pesa to reveal the phone number and location of your chosen housegirl.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <Phone size={28} className="text-[#111]" />
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
            <div className="bg-white p-8 rounded-[4px] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Looking for house help?</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Browse hundreds of verified profiles. Filter by location, role and experience. Pay only when you find the right person.
                </p>
              </div>
              <Button onClick={() => navigate('/housegirls')} className="rounded-[4px] bg-[#111] hover:bg-[#333] text-white w-fit px-6">
                Find Housegirls →
              </Button>
            </div>
            
            <div className="bg-white p-8 rounded-[4px] border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">Looking for work?</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Create a free profile and get discovered by families across Kenya. No upfront fee to register.
                </p>
              </div>
              <Button onClick={openRegister} variant="outline" className="rounded-[4px] border-[#111] text-[#111] hover:bg-gray-50 w-fit px-6">
                Register Free →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#111] text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-center md:text-left text-sm md:text-base font-medium">
            <span>500+ Housegirls</span>
            <span className="hidden md:inline text-gray-600">|</span>
            <span>15+ Cities</span>
            <span className="hidden md:inline text-gray-600">|</span>
            <span>KES 200 fee</span>
            <span className="hidden md:inline text-gray-600">|</span>
            <span>Same day access</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white py-12 md:py-8 border-t border-[#222]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400">
          <div>© {new Date().getFullYear()} Domestic Connect</div>
          <div className="flex items-center gap-4">
            <Link to="/housegirls" className="hover:text-white transition-colors">/housegirls</Link>
            <span>·</span>
            <Link to="/agency-packages" className="hover:text-white transition-colors">/agency-packages</Link>
            <span>·</span>
            <Link to="/how-it-works" className="hover:text-white transition-colors">/how-it-works</Link>
          </div>
          <div>domesticconnect.co.ke</div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode} 
      />
    </div>
  );
};

export default LandingPage;
