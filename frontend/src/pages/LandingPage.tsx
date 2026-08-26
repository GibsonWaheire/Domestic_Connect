import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  MessageCircle, Home, Leaf, Shield, Heart, Clock,
  CheckCircle, ShieldCheck, Users, MapPin, Star,
  ArrowRight, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthEnhanced';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const WHATSAPP = 'https://wa.me/254726899113';

const SERVICES = [
  {
    icon: <Home size={28} />,
    title: 'Housegirl / House Manager',
    desc: 'Experienced house managers for live-in or live-out arrangements. Cooking, cleaning, childcare and general household duties.',
  },
  {
    icon: <Leaf size={28} />,
    title: 'Gardener',
    desc: 'Reliable gardeners for residential compounds, apartment blocks and commercial properties across Kenya.',
  },
  {
    icon: <Shield size={28} />,
    title: 'Gateman / Security',
    desc: 'Vetted gate attendants for homes and estates. Background-checked, trustworthy and well-referenced.',
  },
  {
    icon: <Heart size={28} />,
    title: 'Nurse / Caregiver',
    desc: 'Compassionate caregivers for elderly parents, patients and individuals with special needs. Available live-in or part-time.',
  },
  {
    icon: <Clock size={28} />,
    title: 'Daily Casual',
    desc: 'Short-term help for events, deep cleans, moving days or any one-off domestic task. Book for a day or a week.',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Register & Pay',
    desc: 'Create an employer account and pay the one-time KES 1,500 registration fee via M-Pesa or card. No recurring charges.',
  },
  {
    step: 2,
    title: 'Tell Us Your Needs',
    desc: 'Specify the role, location, live-in or live-out preference, duties and your salary budget.',
  },
  {
    step: 3,
    title: 'We Match You',
    desc: 'We personally match you with a vetted, interviewed worker within 24–48 hours and facilitate the introduction.',
  },
];

const VETTING_STEPS = [
  { icon: <CheckCircle size={18} />, label: 'National ID verification' },
  { icon: <CheckCircle size={18} />, label: 'In-person interview' },
  { icon: <CheckCircle size={18} />, label: 'Reference check (2 referees)' },
  { icon: <CheckCircle size={18} />, label: 'Background screening' },
  { icon: <CheckCircle size={18} />, label: 'Trial period support' },
];

const TESTIMONIALS = [
  {
    quote: "I found a reliable house manager within two days. The vetting process gave me peace of mind — she came with verified references.",
    name: "Wanjiku M.",
    location: "Kilimani, Nairobi",
  },
  {
    quote: "We needed a caregiver for my mother urgently. Domestic Connect called us back the same day and had someone suitable by the next morning.",
    name: "James O.",
    location: "Mombasa",
  },
  {
    quote: "After bad experiences with walk-ins, I appreciated that every worker here has been interviewed. Worth every shilling of the registration fee.",
    name: "Amina K.",
    location: "Westlands, Nairobi",
  },
];

const FAQS = [
  {
    q: 'What does the KES 1,500 registration fee cover?',
    a: 'It covers our vetting and matching service — ID checks, interviews, reference calls and the introduction to your chosen worker. There are no hidden fees after that.',
  },
  {
    q: 'How long does it take to get matched?',
    a: 'We aim to call you within 24 hours of receiving your request and have a suitable match within 48 hours for most roles.',
  },
  {
    q: 'What if the worker does not work out?',
    a: 'We offer a replacement within 30 days at no extra cost if the placement does not work out for genuine reasons.',
  },
  {
    q: 'Do I pay the worker directly?',
    a: 'Yes. Once we introduce you, the salary agreement is directly between you and the worker. We do not take any salary commission.',
  },
  {
    q: 'Which areas do you cover?',
    a: 'We primarily serve Nairobi and its suburbs (Westlands, Karen, Kilimani, Kasarani, Ngong etc.) and are expanding to Mombasa, Nakuru and Kisumu.',
  },
  {
    q: 'Can I request more than one worker?',
    a: 'Yes. Each role type is treated as a separate request. Contact us on WhatsApp if you need multiple placements and we will advise on pricing.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [heroSlide, setHeroSlide] = useState(0);

  const heroSlides = [0, 1, 2];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Domestic Connect Kenya',
    description: "Kenya's vetted domestic staffing agency. Find trusted housegirls, gardeners, gatemen, caregivers and daily casuals in Nairobi and beyond.",
    url: 'https://domestic-connect.co.ke',
    priceRange: 'KES 1500',
    address: { '@type': 'PostalAddress', addressLocality: 'Nairobi', addressCountry: 'KE' },
    areaServed: [
      { '@type': 'City', name: 'Nairobi' },
      { '@type': 'City', name: 'Mombasa' },
      { '@type': 'City', name: 'Kisumu' },
      { '@type': 'Country', name: 'Kenya' },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111] font-sans">
      <Helmet>
        <title>Domestic Connect Kenya | Trusted Vetted House Help, Caregivers & More</title>
        <meta name="description" content="Find vetted housegirls, gardeners, gatemen, nurses and daily casuals in Kenya. Every worker is ID-checked and interviewed. Pay KES 1,500 to register as an employer." />
        <meta name="keywords" content="domestic connect kenya, find housegirl kenya, vetted house help nairobi, gardener kenya, caregiver nairobi, gateman kenya, domestic worker agency kenya, trusted maid nairobi" />
        <link rel="canonical" href="https://domestic-connect.co.ke/" />
        <meta property="og:title" content="Domestic Connect Kenya | Vetted Domestic Staff" />
        <meta property="og:description" content="Find vetted housegirls, caregivers, gardeners and more. Every worker personally interviewed by us." />
        <meta property="og:url" content="https://domestic-connect.co.ke/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      </Helmet>

      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-[#F9FAFB] py-16 md:py-24">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-10 md:gap-8 items-center">
          <div className="text-center md:text-left">
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              Kenya's Vetted Domestic Agency
            </span>
            <h1 className="text-[36px] md:text-[50px] font-extrabold tracking-tight leading-[1.1] max-w-xl mb-5">
              Find domestic staff you can actually trust
            </h1>
            <p className="text-[#555] text-[16px] mb-8 max-w-md leading-relaxed mx-auto md:mx-0">
              Every worker we place is personally interviewed, ID-verified and reference-checked by us. No anonymous listings. No guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-6">
              <Button
                onClick={() => navigate('/agency-marketplace')}
                className="rounded-full bg-teal-700 hover:bg-teal-800 text-white h-12 px-8 text-[15px] w-full sm:w-auto"
              >
                Find a Worker →
              </Button>
              <Button
                onClick={() => navigate('/how-it-works')}
                variant="outline"
                className="rounded-full border-[#111] text-[#111] hover:bg-white h-12 px-8 text-[15px] w-full sm:w-auto"
              >
                How It Works
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-5 text-[13px] font-medium text-[#666]">
              <span className="flex items-center gap-1.5"><span className="text-teal-700">✓</span> ID Verified</span>
              <span className="flex items-center gap-1.5"><span className="text-teal-700">✓</span> Interviewed</span>
              <span className="flex items-center gap-1.5"><span className="text-teal-700">✓</span> Background Checked</span>
              <span className="flex items-center gap-1.5"><span className="text-teal-700">✓</span> 30-day replacement</span>
            </div>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-green-700 hover:text-green-800 text-sm font-medium"
            >
              <MessageCircle size={18} className="text-green-600" />
              Have a question? Chat with us on WhatsApp
            </a>
          </div>

          {/* Hero carousel */}
          <div className="w-full max-w-md mx-auto">
            <style>{`
              @keyframes kenBurns {
                0%   { transform: scale(1)    translate(0%,   0%); }
                100% { transform: scale(1.12) translate(-3%, -2%); }
              }
              .hero-ken-burns { animation: kenBurns 9s ease-in-out infinite alternate; }
            `}</style>
            <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden relative h-72">

              {/* Slide 0 — image */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${heroSlide === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="relative h-full overflow-hidden">
                  <img src="/woooies.avif" alt="Trusted domestic workers in Kenya" className="hero-ken-burns h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-9 left-4 right-4">
                    <p className="text-white font-semibold text-sm drop-shadow">Every worker personally vetted by us</p>
                    <Button
                      onClick={() => navigate('/agency-marketplace')}
                      size="sm"
                      className="mt-2 rounded-full bg-white text-[#111] hover:bg-gray-100 text-xs px-4 h-7 shadow"
                    >
                      Find a Worker →
                    </Button>
                  </div>
                </div>
              </div>

              {/* Slide 1 — vetting highlights */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${heroSlide === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-white px-6 py-7 flex flex-col justify-center`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700 mb-5">Our vetting process</p>
                <div className="flex flex-col gap-4">
                  {[
                    { icon: <ShieldCheck size={18} />, title: 'ID Verified', desc: 'National ID confirmed for every worker on our platform.' },
                    { icon: <Users size={18} />, title: 'In-Person Interview', desc: 'We meet and assess every worker before listing them.' },
                    { icon: <Star size={18} />, title: 'Reference Checked', desc: 'Two verified referees contacted before placement.' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">{icon}</div>
                      <div>
                        <p className="font-semibold text-[#111] text-sm leading-snug">{title}</p>
                        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide 2 — stats */}
              <div className={`absolute inset-0 transition-opacity duration-700 ${heroSlide === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'} bg-[#111] px-6 py-7 flex flex-col justify-center`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300 mb-6">Why employers choose us</p>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { value: '5 Roles', label: 'Domestic categories' },
                    { value: 'Nairobi+', label: 'Coverage area' },
                    { value: 'KES 1,500', label: 'One-time fee' },
                    { value: '< 48 hrs', label: 'Average match time' },
                  ].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <p className="text-2xl font-extrabold text-white leading-none">{value}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => navigate('/agency-marketplace')}
                  className="mt-7 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 h-8 w-full"
                >
                  Find a Worker →
                </Button>
              </div>

              {/* Dots */}
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

      {/* ── SERVICES GRID ── */}
      <section id="services" className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">What we can find for you</h2>
          <p className="text-center text-[#666] text-[14px] max-w-xl mx-auto mb-12">
            We place vetted workers across five domestic categories. Every placement is backed by our personal vetting process.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-[#F9FAFB] border border-gray-100 rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => navigate('/agency-marketplace')}
              >
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#111] mb-1">{title}</h3>
                  <p className="text-[#666] text-sm leading-relaxed">{desc}</p>
                </div>
                <span className="text-teal-700 text-sm font-medium flex items-center gap-1 mt-auto">
                  Request this role <ArrowRight size={14} />
                </span>
              </div>
            ))}
            {/* 6th card — CTA */}
            <div className="bg-teal-700 rounded-xl p-6 flex flex-col justify-between text-white">
              <div>
                <p className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-3">Not sure what you need?</p>
                <h3 className="font-bold text-lg mb-2">Talk to us first</h3>
                <p className="text-teal-100 text-sm leading-relaxed">
                  WhatsApp us and we will advise on the right worker type for your household.
                </p>
              </div>
              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 bg-white text-teal-700 font-semibold text-sm rounded-full px-5 py-2.5 hover:bg-teal-50 transition-colors w-fit"
              >
                <MessageCircle size={16} /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-[#F9FAFB] py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">How it works</h2>
          <p className="text-center text-[#666] text-[14px] max-w-xl mx-auto mb-12">
            Simple, transparent, and designed around how hiring actually works in Kenya.
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center">
                    <span className="text-2xl font-extrabold">{step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button
              onClick={() => navigate('/agency-marketplace')}
              className="rounded-full bg-teal-700 hover:bg-teal-800 text-white h-12 px-10 text-[15px]"
            >
              Get Started — Find a Worker
            </Button>
          </div>
        </div>
      </section>

      {/* ── TRUST / VETTING ── */}
      <section className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
              Our Vetting Process
            </span>
            <h2 className="text-3xl font-bold tracking-tight mb-5">
              We know these workers personally
            </h2>
            <p className="text-[#555] leading-relaxed mb-8">
              Unlike online listings where anyone can post a profile, every worker on Domestic Connect has been met in person, interviewed and screened by our team before they are ever recommended to an employer.
            </p>
            <ul className="flex flex-col gap-3">
              {VETTING_STEPS.map(({ icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-[#333] font-medium">
                  <span className="text-teal-600">{icon}</span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🏠', title: 'No anonymous listings', desc: 'Every profile is real and verified by our team.' },
              { icon: '📞', title: 'We make the call', desc: 'We contact referees ourselves — not the worker.' },
              { icon: '🔁', title: '30-day replacement', desc: 'If a placement does not work out, we find you another at no cost.' },
              { icon: '💬', title: 'Ongoing support', desc: 'We are reachable on WhatsApp throughout the placement period.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-[#F9FAFB] border border-gray-100 rounded-xl p-5">
                <div className="text-2xl mb-3">{icon}</div>
                <h4 className="font-bold text-[#111] text-sm mb-1">{title}</h4>
                <p className="text-[#666] text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-[#111] text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {[
              { icon: <Users size={20} />, value: '5 Categories', label: 'Worker types' },
              { icon: <MapPin size={20} />, value: 'Nairobi+', label: 'Coverage area' },
              { icon: <Shield size={20} />, value: '100%', label: 'Personally vetted' },
              { icon: <Clock size={20} />, value: '< 48 hrs', label: 'Average match' },
            ].map(({ icon, value, label }, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 py-4 text-center ${i < 3 ? 'md:border-r md:border-white/10' : ''}`}>
                <span className="text-teal-400">{icon}</span>
                <span className="font-semibold text-lg">{value}</span>
                <span className="text-sm text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#F9FAFB] py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">What employers say</h2>
          <p className="text-center text-[#666] text-[14px] max-w-xl mx-auto mb-12">
            Real experiences from families who found help through Domestic Connect.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, location }) => (
              <div key={name} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[#444] text-sm leading-relaxed italic">"{quote}"</p>
                <div className="mt-auto">
                  <p className="font-semibold text-[#111] text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16 md:py-24 border-t border-gray-100">
        <div className="max-w-[740px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-3 tracking-tight">Common questions</h2>
          <p className="text-center text-[#666] text-[14px] mb-10">Everything you need to know before registering as an employer.</p>
          <div className="flex flex-col gap-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-[#111] text-sm hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{q}</span>
                  <span className={`ml-4 text-teal-600 text-lg leading-none transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-[#555] leading-relaxed border-t border-gray-50">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKER CTA BANNER ── */}
      <section className="bg-[#F9FAFB] py-12 border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-[#111] mb-1">Are you a domestic worker looking for employment?</h3>
            <p className="text-[#555] text-sm">Register your details with us. We will contact you for an interview and vetting. Your details are never posted publicly.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button
              onClick={() => navigate('/for-housegirls')}
              variant="outline"
              className="rounded-full border-[#111] text-[#111] hover:bg-white px-6 h-11"
            >
              Register as a Worker
            </Button>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-full px-6 h-11 transition-colors"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* WhatsApp widget */}
      <div className="fixed bottom-5 left-5 z-50 group flex items-center">
        <span className="mr-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#111] shadow-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          Chat with us
        </span>
        <a
          href={WHATSAPP}
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
