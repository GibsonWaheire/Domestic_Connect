import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Users, MapPin, Star, Zap, MessageCircle, HelpCircle,
  Phone, Mail, CheckCircle2, Shield, Briefcase, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const StatsPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      category: 'For Employers',
      questions: [
        { q: 'How do I find a housegirl or maid?', a: 'Browse our listings at /housegirls. Filter by location, skill, and type of work. Once you find a match, pay KSh 200 to unlock their contact details and connect directly.' },
        { q: 'Is it safe to hire through Domestic Connect?', a: 'All workers on our platform have submitted verification documents. Many also have background checks. You can read their profile, experience, and reviews before paying to contact them.' },
        { q: 'What if the housegirl doesn\'t show up?', a: 'Contact us immediately via WhatsApp on +254 726 899 113. Our team will assist you within 24 hours. We take all placement issues seriously and work to resolve them quickly.' },
        { q: 'Can I hire through an agency instead?', a: 'Yes. Visit our Agency Marketplace to find NITA-licensed agencies near you. Agencies offer additional guarantees like replacement periods and background checks.' },
        { q: 'How much does it cost to post a job?', a: 'Posting a job is completely free. You only pay KSh 200 when you choose to view and unlock a specific applicant\'s contact details.' },
      ],
    },
    {
      category: 'For Housegirls',
      questions: [
        { q: 'How do I register as a housegirl?', a: 'Click "Register Free" and select Housegirl as your account type. Fill in your profile — name, photo, skills, experience, and location. It takes about 5 minutes and is completely free.' },
        { q: 'Do I pay to browse jobs?', a: 'No. Browsing all job listings is completely free. You only pay KSh 100 when you choose to apply for a specific job.' },
        { q: 'Will the agency take commission from my salary?', a: 'No. Domestic Connect is not an agency. You connect directly with the employer. There are no commission deductions from your salary — ever.' },
        { q: 'How do I get my contact details seen by employers?', a: 'Complete your profile fully — add a clear photo, list your skills, and set your availability. Employers browsing profiles can unlock your contact for KSh 200 to reach you directly.' },
        { q: 'What cities have jobs available?', a: 'We have active job listings in Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Machakos and 10+ more cities across Kenya. New jobs are posted daily.' },
      ],
    },
    {
      category: 'Payments & Security',
      questions: [
        { q: 'What payment methods are accepted?', a: 'We accept M-Pesa, Visa/Mastercard debit and credit cards, and bank transfers — all powered by Pesapal, Kenya\'s leading secure payment platform.' },
        { q: 'Is my payment information safe?', a: 'Yes. We never store your card or M-Pesa details. All payments are processed by Pesapal, which is PCI-DSS compliant. Your financial data is fully encrypted.' },
        { q: 'Can I get a refund?', a: 'Contact us within 24 hours of payment if you believe there was an error. Refunds are assessed case by case. We are committed to fair resolution for all users.' },
      ],
    },
  ];

  const stats = [
    { icon: <Users className="h-7 w-7" />, value: '1,000+', label: 'Workers Listed', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: <MapPin className="h-7 w-7" />, value: '15+', label: 'Cities Covered', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: <Star className="h-7 w-7" />, value: '98%', label: 'Success Rate', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: <Zap className="h-7 w-7" />, value: '24 hrs', label: 'Avg. Response Time', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: <Briefcase className="h-7 w-7" />, value: '500+', label: 'Jobs Posted', color: 'text-pink-600', bg: 'bg-pink-50' },
    { icon: <Shield className="h-7 w-7" />, value: '50+', label: 'Verified Agencies', color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#111] font-sans">
      <Helmet>
        <title>Help Center | Domestic Connect Kenya</title>
        <meta name="description" content="Domestic Connect Kenya Help Center — answers to common questions for employers, housegirls, and agencies. Find out how to hire, apply, pay, and get support." />
        <meta name="keywords" content="domestic connect kenya help, domestic connect support, how to hire housegirl kenya, domestic worker job kenya faq" />
        <link rel="canonical" href="https://domestic-connect.co.ke/stats" />
        <meta property="og:title" content="Help Center | Domestic Connect Kenya" />
        <meta property="og:description" content="Answers to common questions for employers, housegirls, and agencies on Domestic Connect Kenya." />
        <meta property="og:url" content="https://domestic-connect.co.ke/stats" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Help Center | Domestic Connect Kenya" />
        <meta name="twitter:description" content="Common questions answered for employers, housegirls and agencies on Domestic Connect Kenya." />
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="bg-[#111] text-white py-16 md:py-22">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">Help Center</span>
          <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
            We're here to help — answers fast
          </h1>
          <p className="text-white/70 text-[16px] mb-8 max-w-xl mx-auto leading-relaxed">
            Find answers for employers, housegirls, and agencies. Can't find what you need? Reach us directly on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://wa.me/254726899113" target="_blank" rel="noopener noreferrer">
              <Button className="rounded-full bg-green-500 hover:bg-green-600 text-white h-12 px-8 text-[15px] font-semibold w-full sm:w-auto">
                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Us Now
              </Button>
            </a>
            <Button onClick={() => navigate('/contact-us')} variant="outline"
              className="rounded-full border-white/40 text-white hover:bg-white/10 h-12 px-8 text-[15px]">
              All Contact Options
            </Button>
          </div>
        </div>
      </section>

      {/* PLATFORM STATS */}
      <section className="bg-white py-14 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-xl font-bold text-center text-gray-500 mb-8 tracking-tight uppercase text-sm">Platform at a glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-2xl font-extrabold text-[#111] mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK GUIDE */}
      <section className="bg-[#fafafa] py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 tracking-tight">Quick start guide</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-[#111] text-white flex items-center justify-center"><Users size={18} /></div>
                <h3 className="font-bold text-lg">I'm an Employer</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { step: '1', text: 'Create a free account at /login?mode=signup', icon: <CheckCircle2 size={15} className="text-green-500" /> },
                  { step: '2', text: 'Browse verified housegirl profiles for free', icon: <CheckCircle2 size={15} className="text-green-500" /> },
                  { step: '3', text: 'Pay KSh 200 to unlock contact details', icon: <Lock size={15} className="text-gray-400" /> },
                  { step: '4', text: 'Contact directly — no agency in between', icon: <CheckCircle2 size={15} className="text-green-500" /> },
                  { step: '5', text: 'Post a job listing for free and receive applications', icon: <CheckCircle2 size={15} className="text-green-500" /> },
                ].map(item => (
                  <li key={item.step} className="flex items-start gap-3 text-sm text-gray-700">
                    {item.icon}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ol>
              <Button onClick={() => navigate('/housegirls')} className="mt-6 w-full rounded-xl bg-[#111] hover:bg-[#333] text-white">
                Browse Workers →
              </Button>
            </div>

            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-[#111] text-white flex items-center justify-center"><Briefcase size={18} /></div>
                <h3 className="font-bold text-lg">I'm a Housegirl</h3>
              </div>
              <ol className="space-y-3">
                {[
                  { step: '1', text: 'Register free — no upfront payment', icon: <CheckCircle2 size={15} className="text-green-500" /> },
                  { step: '2', text: 'Complete your profile with photo and skills', icon: <CheckCircle2 size={15} className="text-green-500" /> },
                  { step: '3', text: 'Browse all job listings for free', icon: <CheckCircle2 size={15} className="text-green-500" /> },
                  { step: '4', text: 'Pay KSh 100 to apply for a specific job', icon: <Lock size={15} className="text-gray-400" /> },
                  { step: '5', text: 'Employer contacts you directly — keep 100% salary', icon: <CheckCircle2 size={15} className="text-green-500" /> },
                ].map(item => (
                  <li key={item.step} className="flex items-start gap-3 text-sm text-gray-700">
                    {item.icon}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ol>
              <Button onClick={() => navigate('/login?mode=signup&userType=housegirl')} className="mt-6 w-full rounded-xl bg-[#111] hover:bg-[#333] text-white">
                Register Free →
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[840px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 justify-center mb-10">
            <HelpCircle className="h-5 w-5 text-gray-400" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="space-y-8">
            {faqs.map((section, si) => (
              <div key={si}>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">{section.category}</h3>
                <div className="space-y-3">
                  {section.questions.map((faq, fi) => {
                    const key = si * 100 + fi;
                    return (
                      <div key={fi} className="border border-gray-100 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(openFaq === key ? null : key)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm text-[#111] hover:bg-gray-50 transition-colors"
                        >
                          <span>{faq.q}</span>
                          <span className="text-gray-400 ml-4 flex-shrink-0 text-lg">{openFaq === key ? '−' : '+'}</span>
                        </button>
                        {openFaq === key && (
                          <div className="px-5 pb-4 pt-1 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="bg-[#fafafa] py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight">Still need help?</h2>
          <p className="text-gray-500 text-sm text-center mb-10">Our team responds within a few hours on weekdays.</p>
          <div className="grid md:grid-cols-3 gap-5">
            <a href="https://wa.me/254726899113" target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center block">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
                <MessageCircle size={22} />
              </div>
              <h3 className="font-bold mb-1">WhatsApp</h3>
              <p className="text-sm text-gray-500 mb-3">Fastest response. Chat with us directly.</p>
              <span className="text-sm font-semibold text-green-700">+254 726 899 113</span>
            </a>
            <a href="mailto:info@domesticconnect.co.ke"
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center block">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Mail size={22} />
              </div>
              <h3 className="font-bold mb-1">Email</h3>
              <p className="text-sm text-gray-500 mb-3">Best for account issues and detailed queries.</p>
              <span className="text-sm font-semibold text-blue-700">info@domesticconnect.co.ke</span>
            </a>
            <a href="tel:+254726899113"
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center block">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
                <Phone size={22} />
              </div>
              <h3 className="font-bold mb-1">Phone</h3>
              <p className="text-sm text-gray-500 mb-3">Mon–Fri 8am–6pm. Sat 9am–2pm.</p>
              <span className="text-sm font-semibold text-purple-700">+254 726 899 113</span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111] text-white py-14">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Ready to get started?</h2>
          <p className="text-white/70 mb-6 text-sm">Join thousands of families and domestic workers already using Domestic Connect across Kenya.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/housegirls')} className="rounded-full bg-white text-[#111] hover:bg-gray-100 h-12 px-10 text-base font-semibold">
              Find a Housegirl →
            </Button>
            <Button onClick={() => navigate('/login?mode=signup&userType=housegirl')} variant="outline"
              className="rounded-full border-white/40 text-white hover:bg-white/10 h-12 px-8 text-base">
              Register as Housegirl
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

export default StatsPage;
