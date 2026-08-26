import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.user_type === 'agency') return '/agency-dashboard';
    if (user.user_type === 'housegirl') return '/housegirl-dashboard';
    return '/employer-dashboard';
  };

  return (
    <footer className="bg-[#1a1a1a] text-white py-12">
      <div className="max-w-[1100px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <p className="text-lg font-bold text-white">Domestic Connect</p>
          <p className="text-sm text-teal-400 font-medium mt-0.5">Vetted Domestic Staff · Kenya</p>
          <p className="text-sm text-[#aaa] mt-3 leading-relaxed">
            Kenya's trusted domestic staffing agency. Every worker personally interviewed and vetted by us.
          </p>
          <p className="text-sm text-[#aaa] mt-4">© {new Date().getFullYear()} Domestic Connect. All rights reserved.</p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">For Employers</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/login" className="text-white hover:text-[#aaa] transition-colors">Find a Worker</Link>
            <Link to="/how-it-works" className="text-white hover:text-[#aaa] transition-colors">How It Works</Link>
            <Link to="/why-choose-us" className="text-white hover:text-[#aaa] transition-colors">Why Choose Us</Link>
            <Link to="/contact-us" className="text-white hover:text-[#aaa] transition-colors">Contact Us</Link>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">For Workers</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/for-housegirls" className="text-white hover:text-[#aaa] transition-colors">Register as a Worker</Link>
            <Link to="/for-housegirls" className="text-white hover:text-[#aaa] transition-colors">How to Get Listed</Link>
            {user ? (
              <button type="button" onClick={() => navigate(getDashboardRoute())} className="text-left text-white hover:text-[#aaa] transition-colors">Go to Dashboard</button>
            ) : (
              <button type="button" onClick={() => navigate('/login')} className="text-left text-white hover:text-[#aaa] transition-colors">Dashboard Login</button>
            )}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">Contact</p>
          <div className="flex flex-col gap-2 text-sm">
            <p className="text-white">📍 Nairobi, Kenya</p>
            <a
              href="https://wa.me/254726899113"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-[#aaa] transition-colors flex items-center gap-2"
            >
              <MessageCircle size={14} className="text-green-500" /> WhatsApp us
            </a>
            <p className="text-white">🌐 domestic-connect.co.ke</p>
            <Link to="/privacy-policy" className="text-white hover:text-[#aaa] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-white hover:text-[#aaa] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
