import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, MapPin, PhoneCall, Star, Clock, CheckCircle, MessageCircle, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const WHATSAPP = 'https://wa.me/254726899113';

const WhyChoosePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Why Choose Domestic Connect Kenya | Vetted Domestic Staff Agency</title>
        <meta name="description" content="Why Kenyan families trust Domestic Connect — every worker is personally interviewed, ID-verified and reference-checked before placement. KES 1,500 one-time fee. 30-day replacement guarantee." />
        <meta name="keywords" content="why domestic connect kenya, trusted domestic worker agency, vetted housegirl kenya, best maid agency nairobi, verified nanny nairobi, domestic connect reviews kenya" />
        <link rel="canonical" href="https://domestic-connect.co.ke/why-choose-us" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Why Choose Domestic Connect Kenya | Vetted Domestic Staff Agency" />
        <meta property="og:description" content="Every worker personally interviewed and ID-verified. KES 1,500 one-time fee. 30-day replacement guarantee." />
        <meta property="og:url" content="https://domestic-connect.co.ke/why-choose-us" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="bg-[#F9FAFB] py-16 border-b border-gray-100">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            Our Promise to You
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Why Choose Domestic Connect?
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are not a job board where anyone can post a profile. We are a vetted domestic staffing agency — every single worker we recommend has been personally met, interviewed and screened by our team before we ever introduce them to an employer.
          </p>
        </div>
      </section>

      {/* 3 main reasons */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12 tracking-tight">The Domestic Connect Difference</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                color: 'bg-teal-50',
                icon: <Shield className="h-10 w-10 text-teal-600" />,
                title: 'We Know Every Worker Personally',
                desc: 'Unlike traditional job boards where workers self-list, every person in our pool has been met face-to-face, interviewed and assessed by our team. When we recommend someone, we are personally vouching for them.',
              },
              {
                color: 'bg-teal-50',
                icon: <CheckCircle className="h-10 w-10 text-teal-600" />,
                title: 'Transparent, One-Time Fee',
                desc: 'Our pricing is completely clear. Pay KES 1,500 once for our full vetting and matching service — ID check, interview, reference calls and the introduction. No monthly subscription, no salary commissions, no hidden charges.',
              },
              {
                color: 'bg-teal-50',
                icon: <Heart className="h-10 w-10 text-teal-600" />,
                title: '30-Day Replacement Guarantee',
                desc: 'If the placement does not work out for genuine reasons within 30 days, we find you a suitable replacement at no extra cost. We stand behind every worker we recommend.',
              },
            ].map(({ color, icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className={`${color} rounded-2xl p-6 inline-block mb-6`}>{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits grid */}
      <section className="py-16 bg-[#F9FAFB] border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4 tracking-tight">Everything included in your KES 1,500</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto text-sm">
            One payment. Full service. No surprises.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Shield className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />, title: 'ID Verification', desc: 'We verify the original national ID card of every worker. You know exactly who is entering your home.' },
              { icon: <Users className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />, title: 'In-Person Interview', desc: 'We physically meet every worker. No anonymous profiles, no remote screening — personal assessment only.' },
              { icon: <Star className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />, title: 'Reference Checks', desc: 'We call two previous employers or character referees directly — you do not have to chase these yourself.' },
              { icon: <MapPin className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />, title: 'Location Matching', desc: 'We match you with workers available in your specific area — Nairobi suburbs, Mombasa, Nakuru and beyond.' },
              { icon: <Clock className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />, title: 'Fast Matching — 48 hrs', desc: 'We aim to present you with a suitable match within 24–48 hours of receiving your requirements.' },
              { icon: <PhoneCall className="h-6 w-6 text-teal-600 flex-shrink-0 mt-1" />, title: 'Ongoing Support', desc: 'We remain reachable on WhatsApp throughout the placement period if any issue arises between you and the worker.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
                {icon}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-[860px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4 tracking-tight">Domestic Connect vs Traditional Bureaus</h2>
          <p className="text-center text-gray-600 mb-12 text-sm">See why families across Kenya are choosing us over traditional walk-in housegirl bureaus.</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-[#F9FAFB] font-semibold text-gray-600 text-sm"></th>
                  <th className="p-4 bg-teal-700 text-white font-semibold text-sm">Domestic Connect</th>
                  <th className="p-4 bg-gray-100 text-gray-700 font-semibold text-sm">Traditional Bureau</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Workers personally interviewed', '✓ Yes — every one', '✗ Rarely'],
                  ['ID verification', '✓ Mandatory', '✗ Often skipped'],
                  ['Reference checks', '✓ We call referees for you', '✗ Left to employer'],
                  ['Registration fee', 'KES 1,500 (one-time)', 'KES 3,000–15,000+'],
                  ['Salary commission deducted', 'None — ever', 'Often 1–3 months\' salary'],
                  ['Replacement guarantee', '30 days — free', 'Varies, often extra cost'],
                  ['Ongoing support', '✓ WhatsApp reachable', '✗ After-sale limited'],
                  ['Speed of matching', '24–48 hours', 'Days to weeks'],
                ].map(([feature, dc, bureau], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}>
                    <td className="p-4 text-gray-700 font-medium border-b border-gray-100 text-sm">{feature}</td>
                    <td className="p-4 text-center text-teal-700 font-semibold border-b border-gray-100 bg-teal-50/30 text-sm">{dc}</td>
                    <td className="p-4 text-center text-gray-500 border-b border-gray-100 text-sm">{bureau}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-teal-700 text-white text-center">
        <div className="max-w-[640px] mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to find trusted domestic help?</h2>
          <p className="text-teal-100 mb-8 text-sm leading-relaxed">
            Join Kenyan families who have found reliable, personally vetted domestic workers through Domestic Connect. One-time KES 1,500 fee. 30-day replacement. WhatsApp support throughout.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate('/login')}
              className="rounded-full bg-white text-teal-700 hover:bg-teal-50 font-semibold h-12 px-8"
            >
              Find a Worker →
            </Button>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white text-white font-semibold rounded-full h-12 px-8 hover:bg-teal-600 transition-colors text-sm"
            >
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyChoosePage;
