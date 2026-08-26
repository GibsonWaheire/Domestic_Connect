import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, CheckCircle, Shield, PhoneCall, Clock, Users, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const WHATSAPP = 'https://wa.me/254726899113';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I find a domestic worker through Domestic Connect?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Register as an employer, pay the one-time KES 1,500 fee, then tell us your requirements. We match you with a vetted, interviewed worker within 24–48 hours.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does the KES 1,500 registration fee cover?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It covers our vetting and matching service — ID checks, in-person interviews, reference calls and the introduction to your matched worker. No hidden fees after that.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the workers on Domestic Connect verified?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Every worker is personally met, interviewed, and ID-verified by our team before we ever recommend them to an employer. We also contact two referees on your behalf.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which areas does Domestic Connect cover in Kenya?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We primarily serve Nairobi and its suburbs (Westlands, Karen, Kilimani, Kasarani, Ngong, Kikuyu, Ruiru etc.) and are expanding to Mombasa, Nakuru and Kisumu.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of domestic workers can I request?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We place Housegirls / House Managers, Gardeners, Gatemen / Security, Nurses / Caregivers, and Daily Casuals for one-off tasks.',
      },
    },
  ],
};

const HowItWorksPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>How It Works | Domestic Connect Kenya</title>
        <meta name="description" content="Learn how Domestic Connect Kenya works — register as an employer, pay KES 1,500, tell us your needs, and we match you with a vetted domestic worker within 48 hours." />
        <meta name="keywords" content="how domestic connect works, find vetted housegirl kenya, hire maid nairobi, domestic worker agency kenya, how to find house help kenya" />
        <link rel="canonical" href="https://domestic-connect.co.ke/how-it-works" />
        <meta property="og:title" content="How It Works | Domestic Connect Kenya" />
        <meta property="og:description" content="Register, pay KES 1,500, tell us your needs and we match you with a vetted domestic worker within 48 hours." />
        <meta property="og:url" content="https://domestic-connect.co.ke/how-it-works" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="bg-[#F9FAFB] py-16 border-b border-gray-100">
        <div className="max-w-[800px] mx-auto px-4 text-center">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
            Simple & Transparent
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            How Domestic Connect Works
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We are a vetted domestic staffing agency — not a self-serve directory. Every worker is personally interviewed by us before we recommend them to any employer.
          </p>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">Three steps to finding trusted help</h2>
          <p className="text-center text-gray-500 mb-14 max-w-xl mx-auto text-sm">
            Designed for busy Kenyan families who need trustworthy domestic staff without the hassle of screening strangers.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                icon: <Shield className="h-8 w-8 text-teal-600" />,
                title: 'Register & Pay KES 1,500',
                desc: 'Create a free employer account and pay the one-time KES 1,500 registration fee via M-Pesa or card. This covers our full vetting and matching service — no recurring charges.',
                color: 'bg-teal-50',
              },
              {
                num: '02',
                icon: <CheckCircle className="h-8 w-8 text-teal-600" />,
                title: 'Tell Us Your Needs',
                desc: 'Complete a short form specifying the role you need (housegirl, gardener, caregiver etc.), your location, live-in or live-out preference, duties, and your salary budget.',
                color: 'bg-teal-50',
              },
              {
                num: '03',
                icon: <PhoneCall className="h-8 w-8 text-teal-600" />,
                title: 'We Match You — Within 48 hrs',
                desc: 'Our team personally matches you with a suitable vetted worker from our pool and calls you to arrange the introduction. You deal directly with the worker after that.',
                color: 'bg-teal-50',
              },
            ].map(({ num, icon, title, desc, color }) => (
              <div key={num} className="flex flex-col items-center text-center">
                <div className={`${color} rounded-2xl p-6 mb-5 relative`}>
                  {icon}
                  <span className="absolute -top-2 -right-2 bg-[#111] text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center">{num}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/login')}
              className="rounded-full bg-teal-700 hover:bg-teal-800 text-white h-12 px-10 text-base"
            >
              Find a Worker Now →
            </Button>
          </div>
        </div>
      </section>

      {/* Vetting detail */}
      <section className="py-16 bg-[#F9FAFB] border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">Our vetting process</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto text-sm">
            Unlike job boards where anyone can post a profile, every worker we recommend has been physically met and assessed by our team.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Shield className="h-7 w-7 text-teal-600" />, title: 'National ID Verified', desc: 'We verify the original national ID card of every worker before listing them.' },
              { icon: <Users className="h-7 w-7 text-teal-600" />, title: 'In-Person Interview', desc: 'We meet and interview every worker ourselves. No remote or WhatsApp-only screening.' },
              { icon: <Star className="h-7 w-7 text-teal-600" />, title: 'Reference Checked', desc: 'We call two previous employers or referees directly to verify character and work history.' },
              { icon: <Clock className="h-7 w-7 text-teal-600" />, title: '30-Day Replacement', desc: 'If a placement does not work out within 30 days, we find you a replacement at no extra cost.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm text-center flex flex-col items-center">
                <div className="bg-teal-50 rounded-full p-3 mb-4">{icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What we place */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-3 tracking-tight">What types of workers can I request?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto text-sm">We place vetted domestic workers across five categories.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { emoji: '🏠', label: 'Housegirl / House Manager' },
              { emoji: '🌿', label: 'Gardener' },
              { emoji: '🛡️', label: 'Gateman / Security' },
              { emoji: '❤️', label: 'Nurse / Caregiver' },
              { emoji: '⏱️', label: 'Daily Casual' },
            ].map(({ emoji, label }) => (
              <div key={label} className="bg-[#F9FAFB] border border-gray-100 rounded-xl p-5 text-center hover:shadow-sm transition-shadow">
                <div className="text-3xl mb-3">{emoji}</div>
                <p className="font-semibold text-[#111] text-sm">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            Not sure what category fits your needs?{' '}
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline font-medium">WhatsApp us</a> and we will advise.
          </p>
        </div>
      </section>

      {/* Worker section */}
      <section className="py-16 bg-[#F9FAFB] border-t border-gray-100">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Are you a domestic worker looking for employment?</h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            We are always looking for honest, hardworking domestic workers to add to our vetted pool. Submit your details and we will contact you for an interview. Your details are never posted publicly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.href = '/for-housegirls'}
              variant="outline"
              className="rounded-full border-[#111] text-[#111] h-11 px-7"
            >
              Register as a Worker
            </Button>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-full px-7 h-11 transition-colors"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-[740px] mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10 tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((item) => (
              <div key={item.name} className="bg-[#F9FAFB] rounded-xl p-5 border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{item.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-teal-700 text-white text-center">
        <div className="max-w-[640px] mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to find trusted help?</h2>
          <p className="text-teal-100 mb-8 text-sm leading-relaxed">
            Join Kenyan families who have found reliable, vetted domestic workers through Domestic Connect. One-time fee. Personal matching. 30-day guarantee.
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
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
