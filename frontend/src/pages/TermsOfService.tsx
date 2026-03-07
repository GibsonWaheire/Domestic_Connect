import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
            <Link to="/privacy-policy" className="text-[#333] hover:text-black">Privacy</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-black mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: {lastUpdated}</p>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">1. Acceptance of Terms</h2>
          <p className="text-[15px] text-[#444] leading-relaxed mb-6">
            By using Domestic Connect you agree to these terms. If you do not agree, do not use the platform.
          </p>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">2. What Domestic Connect Is</h2>
          <p className="text-[15px] text-[#444] leading-relaxed mb-6">
            We are a listing platform. We connect employers with domestic workers. We do not employ any domestic workers directly and are not responsible for the conduct of any listed worker or employer.
          </p>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">3. Employer Responsibilities</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>- You must be 18+ to use this platform</p>
            <p>- You are responsible for verifying a worker&apos;s suitability before hiring</p>
            <p>- Payment of KES 200 unlocks contact details only - it does not guarantee employment</p>
            <p>- You must treat domestic workers with dignity and pay agreed wages on time</p>
          </div>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">4. Housegirl / Worker Responsibilities</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>- Your profile information must be accurate</p>
            <p>- You are responsible for your own conduct during any employment arranged via this platform</p>
            <p>- Domestic Connect is not your employer</p>
          </div>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">5. Payments</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>- All payments are processed via M-Pesa</p>
            <p>- KES 200 contact unlock fee is non-refundable once contact is revealed</p>
            <p>- KES 500 bundle (3 contacts) is non-refundable once any contact is revealed</p>
          </div>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">6. Prohibited Use</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>- No fake profiles</p>
            <p>- No harassment of workers or employers</p>
            <p>- No use of contact details for spam</p>
            <p>- Violations result in immediate account termination</p>
          </div>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">7. Limitation of Liability</h2>
          <p className="text-[15px] text-[#444] leading-relaxed mb-6">
            Domestic Connect is not liable for any disputes, injuries, theft or losses arising from employment arrangements made through this platform.
          </p>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">8. Changes to Terms</h2>
          <p className="text-[15px] text-[#444] leading-relaxed mb-6">
            We may update these terms at any time. Continued use of the platform means you accept the updated terms.
          </p>
        </section>

        <section className="border-b border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-black mb-3 mt-8">9. Contact</h2>
          <div className="text-[15px] text-[#444] leading-relaxed mb-6">
            <p>Email: legal@domesticconnect.co.ke</p>
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

export default TermsOfService;
