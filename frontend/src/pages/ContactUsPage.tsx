import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Mail, Phone, Clock, CheckCircle2, Building2, Users, Briefcase, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';

const ContactUsPage = () => {
  const navigate = useNavigate();

  const topics = [
    { icon: <Users size={18} />, title: 'Hiring Support', desc: 'Help finding a housegirl, maid, nanny, or caregiver. Issues with worker profiles or contact unlocking.' },
    { icon: <Briefcase size={18} />, title: 'Job Applications', desc: 'Help for housegirls applying for jobs, payment issues, or profile setup questions.' },
    { icon: <Building2 size={18} />, title: 'Agency Onboarding', desc: 'Listing your agency, verifying your license, choosing a package, or managing your profile.' },
    { icon: <HelpCircle size={18} />, title: 'Account & Payments', desc: 'Login issues, payment queries, refund requests, or updating your account details.' },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#111] font-sans">
      <Helmet>
        <title>Contact Us | Domestic Connect Kenya</title>
        <meta name="description" content="Contact Domestic Connect Kenya for help hiring housegirls, finding domestic work, agency onboarding, and payment support. WhatsApp, email and phone available." />
        <meta name="keywords" content="contact domestic connect kenya, domestic connect support, domestic connect nairobi contact, hire housegirl help kenya" />
        <link rel="canonical" href="https://domestic-connect.co.ke/contact-us" />
        <meta property="og:title" content="Contact Us | Domestic Connect Kenya" />
        <meta property="og:description" content="Get in touch with Domestic Connect Kenya — we help families find verified house help and domestic workers find jobs across Kenya." />
        <meta property="og:url" content="https://domestic-connect.co.ke/contact-us" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Us | Domestic Connect Kenya" />
        <meta name="twitter:description" content="Reach Domestic Connect Kenya for support with hiring, job applications, agency listings, or payments." />
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="bg-[#111] text-white py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            We're here for you
          </span>
          <h1 className="text-[36px] md:text-[52px] font-extrabold tracking-tight leading-[1.1] mb-5 max-w-3xl mx-auto">
            Contact Domestic Connect Kenya
          </h1>
          <p className="text-white/70 text-[16px] mb-8 max-w-xl mx-auto leading-relaxed">
            Whether you're hiring, job-hunting, or listing your agency — our team is ready to help. Reach us by WhatsApp, email, or phone.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] text-white/60 font-medium">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> Responds within a few hours</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> Mon–Sat support</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> Kiswahili & English</span>
          </div>
        </div>
      </section>

      {/* CONTACT CHANNELS */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 tracking-tight">Choose how to reach us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* WhatsApp */}
            <a href="https://wa.me/254726899113" target="_blank" rel="noopener noreferrer"
              className="group bg-gray-50 border-2 border-gray-100 hover:border-green-200 hover:shadow-lg rounded-2xl p-7 flex flex-col transition-all duration-200">
              <div className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <MessageCircle size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                The fastest way to reach us. Get a response in minutes during business hours. Send photos, voice notes, or text.
              </p>
              <div className="mt-auto">
                <p className="font-bold text-[#111] text-lg mb-1">+254 726 899 113</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>Mon–Sat, 8am–8pm</span>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-green-700 font-semibold text-sm">
                Open WhatsApp <span>→</span>
              </div>
            </a>

            {/* Email */}
            <a href="mailto:info@domesticconnect.co.ke"
              className="group bg-gray-50 border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg rounded-2xl p-7 flex flex-col transition-all duration-200">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Mail size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Best for detailed queries, account issues, agency onboarding, and anything that needs a written record. We reply within a few hours.
              </p>
              <div className="mt-auto">
                <p className="font-bold text-[#111] text-base mb-1">info@domesticconnect.co.ke</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>Response within 3–6 hours</span>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm">
                Send an Email <span>→</span>
              </div>
            </a>

            {/* Phone */}
            <a href="tel:+254726899113"
              className="group bg-gray-50 border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg rounded-2xl p-7 flex flex-col transition-all duration-200">
              <div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Phone size={26} />
              </div>
              <h3 className="text-xl font-bold mb-2">Phone Call</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                Prefer to talk? Call us directly for urgent placement issues, agency onboarding, or any question that needs a real conversation.
              </p>
              <div className="mt-auto">
                <p className="font-bold text-[#111] text-lg mb-1">+254 726 899 113</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>Mon–Fri 8am–6pm · Sat 9am–2pm</span>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-purple-700 font-semibold text-sm">
                Call Now <span>→</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* WHAT WE HELP WITH */}
      <section className="bg-[#fafafa] py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 tracking-tight">What we help with</h2>
          <p className="text-gray-500 text-sm text-center mb-10 max-w-md mx-auto">Mention your topic when you reach us so we can route your message to the right team quickly.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {topics.map(topic => (
              <div key={topic.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-[#111] text-white flex items-center justify-center mb-3">{topic.icon}</div>
                <h3 className="font-bold text-[#111] mb-1.5 text-sm">{topic.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{topic.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESPONSE TIMES */}
      <section className="bg-white py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-[780px] mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center mb-8 tracking-tight">Response times & support hours</h2>
          <div className="space-y-4">
            {[
              { channel: 'WhatsApp', time: 'Minutes–2 hours', hours: 'Mon–Sat, 8am–8pm EAT', icon: <MessageCircle size={18} className="text-green-600" />, bg: 'bg-green-50' },
              { channel: 'Email', time: '3–6 hours', hours: 'Mon–Sat, 8am–8pm EAT', icon: <Mail size={18} className="text-blue-600" />, bg: 'bg-blue-50' },
              { channel: 'Phone', time: 'Immediate', hours: 'Mon–Fri 8am–6pm · Sat 9am–2pm', icon: <Phone size={18} className="text-purple-600" />, bg: 'bg-purple-50' },
            ].map(item => (
              <div key={item.channel} className={`${item.bg} rounded-xl p-5 flex items-center justify-between flex-wrap gap-3`}>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <p className="font-semibold text-[#111] text-sm">{item.channel}</p>
                    <p className="text-xs text-gray-500">{item.hours}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-[#111]">⚡ {item.time}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Outside support hours? Leave a WhatsApp message or email — we'll reply first thing next business day.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#111] text-white py-14">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Not sure where to start?</h2>
          <p className="text-white/70 mb-6 text-sm">Visit our Help Center for step-by-step guides, FAQs, and tips for employers and housegirls.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/stats')} className="rounded-full bg-white text-[#111] hover:bg-gray-100 h-12 px-10 text-base font-semibold">
              Visit Help Center →
            </Button>
            <a href="https://wa.me/254726899113" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-full border-white/40 text-white hover:bg-white/10 h-12 px-8 text-base w-full sm:w-auto">
                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Us
              </Button>
            </a>
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
            <Link to="/stats" className="hover:text-white transition-colors">Help Center</Link>
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

export default ContactUsPage;
