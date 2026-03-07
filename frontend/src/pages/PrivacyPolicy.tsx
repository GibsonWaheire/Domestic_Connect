import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  const lastUpdated = new Date().toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-[#111]">
            Domestic Connect
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/housegirls" className="text-[#333] hover:text-black">Find Help</Link>
            <Link to="/terms" className="text-[#333] hover:text-black">Terms</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-black mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">1. Who We Are</h2>
          <p className="text-[15px] text-[#444] leading-relaxed mb-6">
            Domestic Connect is a Kenyan domestic staffing platform at domesticconnect.co.ke connecting employers with verified housegirls, nannies, cooks and caregivers.
          </p>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">2. What Information We Collect</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>- Name, email or phone number at registration</p>
            <p>- Profile information (role, location, skills)</p>
            <p>- Payment records (M-Pesa transaction IDs only, we do not store card details)</p>
            <p>- Device and browser data for analytics</p>
          </div>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">3. How We Use Your Information</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>- To create and manage your account</p>
            <p>- To display your profile to potential employers (housegirls only)</p>
            <p>- To process M-Pesa payments</p>
            <p>- To send important account notifications</p>
          </div>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">4. Who We Share Your Data With</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>- We do not sell your data to third parties</p>
            <p>- Contact details are only shared with verified employers who have paid the unlock fee</p>
            <p>- M-Pesa payments processed by Safaricom</p>
          </div>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">5. Your Rights</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>- Request deletion of your account and data</p>
            <p>- Update your profile information at any time</p>
            <p>- Contact us at privacy@domesticconnect.co.ke</p>
          </div>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">6. Cookies</h2>
          <p className="text-[15px] text-[#444] leading-relaxed mb-6">
            We use essential cookies only to keep you logged in. No advertising cookies.
          </p>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">7. Contact</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>Email: privacy@domesticconnect.co.ke</p>
            <p>Location: Nairobi, Kenya</p>
          </div>
        </section>
      </main>

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
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">Legal</p>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/privacy-policy" className="text-white hover:text-[#aaa] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-white hover:text-[#aaa] transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#aaa] mb-3">Contact</p>
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-white">📍 Nairobi, Kenya</p>
              <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#aaa] transition-colors">📱 WhatsApp us</a>
              <p className="text-white">🌐 domesticconnect.co.ke</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
