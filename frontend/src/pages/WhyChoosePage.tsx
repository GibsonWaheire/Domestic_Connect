import { Briefcase, Award, TrendingUp, Shield, MapPin, PhoneCall, Star, Clock, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';

const WhyChoosePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Why Choose Domestic Connect Kenya | Trusted Housegirl & Maid Platform</title>
        <meta name="description" content="Why thousands of Kenyan families choose Domestic Connect — verified housegirls, maids, nannies, cooks and house managers. Affordable KES 200 contact fee across Nairobi, Mombasa, Kisumu and beyond." />
        <meta name="keywords" content="why domestic connect kenya, trusted housegirl agency kenya, best maid platform kenya, verified nanny nairobi, affordable housegirl kenya, find maid nairobi, house manager kenya, houseboy kenya, cook kenya, cleaner nairobi" />
        <link rel="canonical" href="https://domestic-connect.co.ke/why-choose-us" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Why Choose Domestic Connect Kenya | Trusted Housegirl & Maid Platform" />
        <meta property="og:description" content="Kenya's most trusted platform for finding verified housegirls, maids, nannies and caregivers. Learn why 1,000+ families choose us." />
        <meta property="og:url" content="https://domestic-connect.co.ke/why-choose-us" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Why Choose Domestic Connect Kenya | Trusted Housegirl & Maid Platform" />
        <meta name="twitter:description" content="Kenya's most trusted platform for finding verified housegirls, maids, nannies and caregivers. Learn why 1,000+ families choose us." />
      </Helmet>

      {/* Hero */}
      <Navbar />
      <div className="bg-gradient-to-r from-pink-50 to-orange-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose Domestic Connect Kenya?</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Domestic Connect is Kenya's most trusted online platform for finding verified housegirls, maids, nannies, cooks, caregivers, and house managers. We make the hiring process simple, affordable, and transparent — no hidden fees, no middlemen.
          </p>
        </div>
      </div>

      {/* Main reasons */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">The Domestic Connect Advantage</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl inline-block mb-6">
                <Briefcase className="h-10 w-10 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kenya's Digital Housegirl Bureau</h3>
              <p className="text-gray-600 leading-relaxed">
                Domestic Connect is Kenya's leading digital platform for finding housegirls, maids, and nannies. Unlike traditional housegirl bureaus in Nairobi and other cities that charge placement fees of KES 3,000 to KES 10,000 or more, Domestic Connect lets you browse verified profiles for free and pay just KES 200 to connect. No agency commission, no placement fee.
              </p>
            </div>
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl inline-block mb-6">
                <Award className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No Hidden Fees, No Surprises</h3>
              <p className="text-gray-600 leading-relaxed">
                Our pricing is completely transparent. Browsing all housegirl and maid profiles on Domestic Connect is 100% free. When you find someone you like, you pay a single, flat fee of KES 200 via M-Pesa to unlock their contact details. That's it — no monthly subscription, no hidden charges, no commission on salary. What you see is what you pay.
              </p>
            </div>
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl inline-block mb-6">
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Kenya's Fastest Growing Platform</h3>
              <p className="text-gray-600 leading-relaxed">
                Domestic Connect is the fastest growing housegirl and maid platform in Kenya. More families in Nairobi, Mombasa, Kisumu, Nakuru and across Kenya are joining every day. More housegirls, nannies, house managers and cooks are registering to be discovered by employers. The more the community grows, the better your chances of finding the perfect match.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Everything You Need to Find Trusted House Help</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Domestic Connect provides all the tools families in Kenya need to find, vet and connect with the right housegirl, maid or nanny quickly and safely.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
              <Shield className="h-8 w-8 text-pink-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Verified Housegirl Profiles</h3>
                <p className="text-sm text-gray-600">Every housegirl, maid, nanny and caregiver on the platform is registered and verified. Profiles include ID details, work history, and references — so you know who you're contacting.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
              <MapPin className="h-8 w-8 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Nationwide Coverage</h3>
                <p className="text-sm text-gray-600">Find housegirls and maids in Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Machakos, and every corner of Kenya. Filter by location to find house help near you.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
              <PhoneCall className="h-8 w-8 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Direct Contact, No Middlemen</h3>
                <p className="text-sm text-gray-600">When you unlock a profile, you get the housegirl's phone number and contact directly. No agency calling on your behalf, no delays, no back-and-forth through third parties.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
              <Star className="h-8 w-8 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Filter by Role & Skills</h3>
                <p className="text-sm text-gray-600">Search for specific roles: housegirl, maid, nanny, cook, caregiver, house manager, houseboy, cleaner. Filter by skills, experience level, age, and availability to find your perfect match.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
              <Clock className="h-8 w-8 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Hire Within 24 Hours</h3>
                <p className="text-sm text-gray-600">Many Kenyan families find and hire their ideal housegirl or nanny within 24 hours of joining Domestic Connect. The platform is built for speed and simplicity.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
              <CheckCircle className="h-8 w-8 text-teal-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">M-Pesa Payments</h3>
                <p className="text-sm text-gray-600">Pay securely via M-Pesa — Kenya's most trusted mobile payment platform. Fast, instant, and completely safe. No credit card required.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Domestic Connect vs Traditional Housegirl Bureaus</h2>
          <p className="text-center text-gray-600 mb-12">See why families across Kenya are switching from traditional placement agencies to Domestic Connect.</p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 bg-gray-50 font-semibold text-gray-700"></th>
                  <th className="p-4 bg-pink-600 text-white font-semibold rounded-t-lg">Domestic Connect Kenya</th>
                  <th className="p-4 bg-gray-100 text-gray-700 font-semibold rounded-t-lg">Traditional Bureau</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Browsing profiles", "Free", "Not available"],
                  ["Contact fee", "KES 200 flat", "KES 3,000–10,000+"],
                  ["Hidden charges", "None", "Often yes"],
                  ["Placement guarantee", "Direct hiring, your choice", "May require extra fees"],
                  ["Coverage", "All Kenya", "Usually one city"],
                  ["Speed", "Hire in hours", "Days to weeks"],
                  ["Direct contact", "Yes, immediately", "Through agent only"],
                ].map(([feature, dc, bureau], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-4 text-gray-700 font-medium border-b border-gray-100">{feature}</td>
                    <td className="p-4 text-center text-pink-700 font-semibold border-b border-gray-100 bg-pink-50">{dc}</td>
                    <td className="p-4 text-center text-gray-500 border-b border-gray-100">{bureau}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-pink-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Join 1,000+ Kenyan Families on Domestic Connect</h2>
          <p className="text-pink-100 mb-8">Browse verified housegirls, maids, nannies, cooks and caregivers across Kenya. Free to browse, KES 200 to connect. Start today.</p>
          <Link
            to="/housegirls"
            className="inline-block bg-white text-pink-600 font-semibold px-8 py-3 rounded-full hover:bg-pink-50 transition-colors mr-4"
          >
            Browse Housegirls
          </Link>
          <Link
            to="/how-it-works"
            className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-full hover:bg-pink-700 transition-colors"
          >
            How It Works
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="text-lg font-bold text-white">Domestic Connect</p>
            <p className="text-sm text-[#aaa] mt-2">Trusted housegirl & maid platform in Kenya</p>
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
              <Link to="/login?mode=signup&userType=housegirl" className="text-white hover:text-[#aaa] transition-colors">Register Free</Link>
              <Link to="/housegirls" className="text-white hover:text-[#aaa] transition-colors">How to Get Listed</Link>
              <Link to="/login" className="text-white hover:text-[#aaa] transition-colors">Dashboard Login</Link>
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
    </div>
  );
};

export default WhyChoosePage;
