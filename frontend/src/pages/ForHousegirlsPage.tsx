import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { API_BASE_URL } from '@/lib/apiConfig';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const WHATSAPP = 'https://wa.me/254726899113?text=Hello%2C%20I%20would%20like%20to%20register%20as%20a%20domestic%20worker%20with%20Domestic%20Connect.';

const CATEGORIES = [
  'Housegirl / House Manager',
  'Gardener',
  'Gateman / Security',
  'Nurse / Caregiver',
  'Daily Casual',
];

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret / Uasin Gishu',
  'Machakos', 'Kiambu', 'Kajiado', 'Nyeri', 'Muranga', 'Thika',
  'Meru', 'Kakamega', 'Kilifi', 'Kwale', 'Other',
];

type FormState = {
  full_name: string;
  phone: string;
  county: string;
  category: string;
  experience_years: string;
  live_in: string;
  notes: string;
};

const INITIAL: FormState = {
  full_name: '',
  phone: '',
  county: '',
  category: '',
  experience_years: '',
  live_in: '',
  notes: '',
};

const ForHousegirlsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect logged-in workers to their dashboard
  useEffect(() => {
    if (user && user.user_type === 'housegirl') {
      navigate('/housegirl-dashboard', { replace: true });
    }
  }, [user, navigate]);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.county || !form.category) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/worker-inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          county: form.county,
          category: form.category,
          experience_years: form.experience_years || '0',
          live_in: form.live_in || 'flexible',
          notes: form.notes.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed. Please try again.');
      }
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111] font-sans">
      <Helmet>
        <title>Register as a Domestic Worker | Domestic Connect Kenya</title>
        <meta name="description" content="Are you a housegirl, gardener, gateman, caregiver or casual worker in Kenya? Register your details with Domestic Connect. We will contact you for an interview and vetting." />
        <link rel="canonical" href="https://domestic-connect.co.ke/for-housegirls" />
      </Helmet>

      <Navbar />

      {/* HERO */}
      <section className="bg-[#111] text-white py-14 md:py-20">
        <div className="max-w-[700px] mx-auto px-4 md:px-6 text-center">
          <span className="inline-block bg-white/10 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            For Domestic Workers
          </span>
          <h1 className="text-[32px] md:text-[46px] font-extrabold tracking-tight leading-[1.1] mb-4">
            Register as a Domestic Worker
          </h1>
          <p className="text-white/70 text-[15px] leading-relaxed max-w-lg mx-auto">
            Fill in the form below. We will contact you within 2 business days to arrange an interview and vetting. Your details are never posted publicly.
          </p>
        </div>
      </section>

      {/* FORM / SUCCESS */}
      <section className="py-14 md:py-20">
        <div className="max-w-[640px] mx-auto px-4 md:px-6">

          {status === 'success' ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3">Details Received</h2>
              <p className="text-[#555] leading-relaxed mb-6">
                Thank you. We have received your registration details and will call you within 2 business days to arrange an interview and vetting.
              </p>
              <p className="text-sm text-gray-400 mb-8">
                Your information is kept private and will never be displayed publicly on our website.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-full px-6 h-11 transition-colors"
                >
                  <MessageCircle size={16} /> Follow up on WhatsApp
                </a>
                <Button onClick={() => navigate('/')} variant="outline" className="rounded-full border-[#111] text-[#111] px-6 h-11">
                  Back to Home
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-1">Your Details</h2>
              <p className="text-sm text-gray-500 mb-7">
                Fields marked <span className="text-red-500">*</span> are required.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* Full name */}
                <div>
                  <label className="block text-sm font-semibold text-[#111] mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grace Wanjiku"
                    value={form.full_name}
                    onChange={set('full_name')}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#111] mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 07XX XXX XXX"
                    value={form.phone}
                    onChange={set('phone')}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                {/* County */}
                <div>
                  <label className="block text-sm font-semibold text-[#111] mb-1.5">
                    County / Town <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.county}
                    onChange={set('county')}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
                  >
                    <option value="">Select your county / area</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-[#111] mb-1.5">
                    Type of Work <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={set('category')}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-[#111] mb-1.5">
                    Years of Experience
                  </label>
                  <select
                    value={form.experience_years}
                    onChange={set('experience_years')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
                  >
                    <option value="">Select</option>
                    <option value="0">Less than 1 year</option>
                    <option value="1">1 year</option>
                    <option value="2">2 years</option>
                    <option value="3">3 years</option>
                    <option value="4">4 years</option>
                    <option value="5">5+ years</option>
                  </select>
                </div>

                {/* Live-in preference */}
                <div>
                  <label className="block text-sm font-semibold text-[#111] mb-2">
                    Live-in or Live-out Preference
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 'live_in', label: 'Live-in (I stay at the employer\'s home)' },
                      { val: 'live_out', label: 'Live-out (I come daily and go home)' },
                      { val: 'flexible', label: 'Flexible (either is fine)' },
                    ].map(({ val, label }) => (
                      <label key={val} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="live_in"
                          value={val}
                          checked={form.live_in === val}
                          onChange={set('live_in')}
                          className="accent-teal-600 w-4 h-4"
                        />
                        <span className="text-sm text-[#333]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-[#111] mb-1.5">
                    Anything else we should know? (optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. I have my own ID card. I am comfortable with young children. I can start immediately."
                    value={form.notes}
                    onChange={set('notes')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                  />
                </div>

                {/* Error */}
                {(status === 'error' || errorMsg) && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{errorMsg || 'Something went wrong. Please try again.'}</span>
                  </div>
                )}

                {/* Privacy note */}
                <p className="text-xs text-gray-400 leading-relaxed">
                  Your details are kept private and are only used internally for interview scheduling and placement. They will never be displayed publicly on our website.
                </p>

                <Button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full rounded-xl bg-teal-700 hover:bg-teal-800 text-white h-12 text-[15px] font-semibold"
                >
                  {status === 'submitting' ? (
                    <span className="flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Submitting…</span>
                  ) : 'Submit My Details'}
                </Button>
              </form>
            </div>
          )}

          {/* WhatsApp alternative */}
          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="font-semibold text-[#111] mb-1">Prefer WhatsApp?</p>
            <p className="text-sm text-gray-500 mb-4">
              You can also message us directly on WhatsApp with your name, phone number, location and the type of work you do.
            </p>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-full px-6 py-2.5 transition-colors"
            >
              <MessageCircle size={16} /> Message us on WhatsApp
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

export default ForHousegirlsPage;
