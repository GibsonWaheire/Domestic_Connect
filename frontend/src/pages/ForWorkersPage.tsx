import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle, MessageCircle, Loader2, AlertCircle,
  ChevronRight, ChevronLeft, MapPin, Briefcase, FileText, Star
} from 'lucide-react';
import { useAuthEnhanced } from '@/hooks/useAuthEnhanced';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { PESAPAL_PENDING_KEY } from '@/components/employer/UnlockModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const WA_NUMBER = '254726899113';
const PENDING_CAT_KEY = 'dc_pending_worker_category';

const CATEGORIES = [
  { label: 'Housegirl / House Manager', desc: 'Cleaning, cooking, household management' },
  { label: 'Gardener', desc: 'Garden maintenance, landscaping' },
  { label: 'Gateman / Security', desc: 'Gate security, property watchman' },
  { label: 'Nurse / Caregiver', desc: 'Patient care, elderly & child care' },
  { label: 'Daily Casual', desc: 'General daily household tasks' },
];

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret / Uasin Gishu',
  'Machakos', 'Kiambu', 'Kajiado', 'Nyeri', 'Muranga', 'Thika',
  'Meru', 'Kakamega', 'Kilifi', 'Kwale', 'Other',
];

const buildWaLink = (name: string, category: string) => {
  const msg = encodeURIComponent(
    `Hi, I have registered as a ${category || 'domestic worker'} on Domestic Connect. My name is ${name || 'Worker'}. Please review my profile.`
  );
  return `https://wa.me/${WA_NUMBER}?text=${msg}`;
};

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const ForWorkersPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authCtx = useAuthEnhanced();
  const user = authCtx?.user || null;
  const loading = authCtx?.loading || false;
  const handleGoogleSignIn = authCtx?.handleGoogleSignIn || (async () => ({ error: 'Unavailable' }));

  const paidSuccess = searchParams.get('paid') === '1';
  const paidCategory = searchParams.get('category') || '';
  const paidName = searchParams.get('name') || '';

  const [path, setPath] = useState<'self' | 'assisted'>('self');
  const [step, setStep] = useState(1);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-auth category selection
  const [pendingCategory, setPendingCategory] = useState('');

  // Step 1 fields
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [county, setCounty] = useState('');
  const [liveIn, setLiveIn] = useState('flexible');

  // Step 2 fields
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');
  const [prevEmployerName, setPrevEmployerName] = useState('');
  const [prevEmployerPhone, setPrevEmployerPhone] = useState('');
  const [hasNoReferee, setHasNoReferee] = useState(false);
  const [noRefereePayLoading, setNoRefereePayLoading] = useState(false);

  // Step 3 fields
  const [photoUrl, setPhotoUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');

  // Assisted path
  const [assistedName, setAssistedName] = useState('');
  const [assistedCategory, setAssistedCategory] = useState('');
  const [assistedPhone, setAssistedPhone] = useState('');
  const [assistedPayLoading, setAssistedPayLoading] = useState(false);

  // On mount, read pending category from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(PENDING_CAT_KEY);
    if (saved) {
      setPendingCategory(saved);
      setCategory(saved);
    }
  }, []);

  // Redirect logged-in workers with complete profile to dashboard
  useEffect(() => {
    if (!loading && user && user.user_type === 'housegirl' && (user as any).profile_complete) {
      navigate('/housegirl-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleCategorySelect = (cat: string) => {
    setPendingCategory(cat);
    setCategory(cat);
    localStorage.setItem(PENDING_CAT_KEY, cat);
  };

  const handleGoogleClick = async () => {
    if (!pendingCategory) {
      setErrorMsg('Please select your role first.');
      return;
    }
    sessionStorage.setItem('return_after_signup', '/for-workers');
    setGoogleLoading(true);
    setErrorMsg('');
    try {
      const result = await handleGoogleSignIn('housegirl', 'signup');
      if ((result as any)?.error) setErrorMsg((result as any).error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateStep1 = () => {
    if (!phone || phone.length < 9) { setErrorMsg('Enter a valid phone number.'); return false; }
    if (!category) { setErrorMsg('Select a worker category.'); return false; }
    if (!county) { setErrorMsg('Select your county.'); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!hasNoReferee && !prevEmployerName.trim()) {
      setErrorMsg('Enter your previous employer\'s name, or check the no-referee box.');
      return false;
    }
    return true;
  };

  const handleNoRefereePayment = async () => {
    setNoRefereePayLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/workers/initiate-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Worker',
          worker_category: category,
          worker_phone: phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment');

      localStorage.setItem(PESAPAL_PENDING_KEY, JSON.stringify({
        package_id: 'worker_admin_registration',
        worker_name: user?.first_name || 'Worker',
        worker_category: category,
        redirect_after: '/for-workers',
      }));
      window.location.href = data.redirect_url;
    } catch (e: any) {
      setErrorMsg(e.message || 'Something went wrong. Please try again.');
    } finally {
      setNoRefereePayLoading(false);
    }
  };

  const handleSelfSubmit = async () => {
    setSubmitStatus('submitting');
    setErrorMsg('');
    try {
      const token = await FirebaseAuthService.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/workers/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phone, category, county, live_in: liveIn,
          experience_years: experienceYears,
          bio,
          prev_employer_name: prevEmployerName,
          prev_employer_phone: prevEmployerPhone,
          has_no_referee: hasNoReferee,
          profile_photo_url: photoUrl,
          cv_url: cvUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      localStorage.removeItem(PENDING_CAT_KEY);
      setSubmitStatus('success');
    } catch (e: any) {
      setErrorMsg(e.message || 'Something went wrong. Please try again.');
      setSubmitStatus('error');
    }
  };

  const handleAssistedPay = async () => {
    if (!assistedName.trim()) { setErrorMsg('Enter your full name.'); return; }
    if (!assistedCategory) { setErrorMsg('Select your worker category.'); return; }
    setAssistedPayLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/workers/initiate-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worker_name: assistedName.trim(),
          worker_category: assistedCategory,
          worker_phone: assistedPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment initiation failed');

      localStorage.setItem(PESAPAL_PENDING_KEY, JSON.stringify({
        package_id: 'worker_admin_registration',
        worker_name: assistedName.trim(),
        worker_category: assistedCategory,
        redirect_after: '/for-workers',
      }));
      window.location.href = data.redirect_url;
    } catch (e: any) {
      setErrorMsg(e.message || 'Something went wrong. Please try again.');
    } finally {
      setAssistedPayLoading(false);
    }
  };

  const workerName = user?.first_name ? `${user.first_name} ${(user as any).last_name || ''}`.trim() : '';
  const isWorkerLoggedIn = user && user.user_type === 'housegirl';

  // ─── Paid success screen ──────────────────────────────────────────────────────

  if (paidSuccess) {
    const displayCategory = paidCategory || 'domestic worker';
    const displayName = paidName || 'Worker';
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Helmet><title>Registration Paid | Domestic Connect Kenya</title></Helmet>
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Confirmed!</h1>
          <p className="text-gray-600 mb-2">
            Thank you, <strong>{displayName}</strong>. Your KES 300 registration fee has been received.
          </p>
          <p className="text-gray-600 mb-8">
            Tap the button below to message us on WhatsApp. We will contact you within 2 business days to complete your registration as a <strong>{displayCategory}</strong>.
          </p>
          <a
            href={buildWaLink(displayName, displayCategory)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-full px-8 py-3.5 transition-colors mb-4"
          >
            <MessageCircle size={20} /> Message Us on WhatsApp
          </a>
          <p className="text-xs text-gray-400">This will open WhatsApp with your registration message pre-filled.</p>
          <button onClick={() => navigate('/')} className="block mt-6 text-sm text-gray-500 hover:text-gray-800 mx-auto transition-colors">
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111]">
      <Helmet>
        <title>Register as a Domestic Worker | Domestic Connect Kenya</title>
        <meta name="description" content="Join Domestic Connect as a vetted domestic worker in Kenya. Register yourself or get admin assistance for KES 300. Housegirls, gardeners, gatemen, nurses and casual workers welcome." />
        <link rel="canonical" href="https://domestic-connect.co.ke/for-workers" />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section className="bg-[#0B6B5E] text-white py-14 md:py-20">
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <span className="inline-block bg-white/15 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wide uppercase">
            For Domestic Workers
          </span>
          <h1 className="text-[32px] md:text-[46px] font-extrabold leading-[1.1] mb-4">
            Register as a Worker
          </h1>
          <p className="text-white/75 text-[15px] leading-relaxed max-w-lg mx-auto">
            Join Kenya's vetted domestic staffing agency. Once verified, employers can request you through us — you don't have to look for jobs yourself.
          </p>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-2xl mx-auto px-4">

          {/* Tab toggle */}
          <div className="flex rounded-xl bg-white border border-gray-200 p-1 mb-8 shadow-sm">
            <button
              type="button"
              onClick={() => { setPath('self'); setErrorMsg(''); }}
              className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${path === 'self' ? 'bg-[#0B6B5E] text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Register Yourself (Free)
            </button>
            <button
              type="button"
              onClick={() => { setPath('assisted'); setErrorMsg(''); }}
              className={`flex-1 rounded-lg py-3 text-sm font-semibold transition-all ${path === 'assisted' ? 'bg-[#0B6B5E] text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Get Help Registering — KES 300
            </button>
          </div>

          {/* ── SELF-REGISTER PATH ─── */}
          {path === 'self' && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

              {/* Loading */}
              {loading && (
                <div className="p-12 flex justify-center">
                  <Loader2 className="animate-spin text-teal-600 h-8 w-8" />
                </div>
              )}

              {/* Not logged in — step 0: pick category first */}
              {!isWorkerLoggedIn && !loading && (
                <div className="p-8">
                  <h2 className="text-xl font-bold mb-1 text-center">What type of work are you applying for?</h2>
                  <p className="text-gray-500 text-sm mb-6 text-center">Select your role to get started</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => handleCategorySelect(cat.label)}
                        className={`flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all ${pendingCategory === cat.label
                          ? 'border-[#0B6B5E] bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'}`}
                      >
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${pendingCategory === cat.label ? 'text-[#0B6B5E]' : 'text-gray-800'}`}>{cat.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                        </div>
                        {pendingCategory === cat.label && (
                          <CheckCircle size={18} className="text-[#0B6B5E] ml-auto shrink-0 mt-0.5" />
                        )}
                      </button>
                    ))}
                  </div>

                  {pendingCategory ? (
                    <>
                      <div className="rounded-xl bg-teal-50 border border-teal-100 px-4 py-3 mb-5 flex items-center gap-3">
                        <CheckCircle size={18} className="text-teal-600 shrink-0" />
                        <p className="text-sm text-teal-800">
                          Registering as: <strong>{pendingCategory}</strong>. Sign in with Google to continue.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGoogleClick}
                        disabled={googleLoading}
                        className="inline-flex items-center gap-3 justify-center bg-white border border-gray-200 rounded-xl h-14 px-8 text-base font-medium text-[#111] hover:bg-gray-50 shadow-sm transition-all w-full disabled:opacity-60"
                      >
                        {googleLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <GoogleIcon />}
                        {googleLoading ? 'Signing in…' : `Continue as ${pendingCategory.split(' /')[0]}`}
                      </button>
                    </>
                  ) : (
                    <p className="text-center text-sm text-gray-400 mt-2">Select your role above to proceed</p>
                  )}

                  {errorMsg && (
                    <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                      <AlertCircle size={16} className="shrink-0" />{errorMsg}
                    </div>
                  )}
                  <div className="mt-5">
                    <Link
                      to="/login"
                      className="block w-full text-center border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Already have an account? Log In
                    </Link>
                  </div>
                </div>
              )}

              {/* Logged in as worker — show 3-step form */}
              {isWorkerLoggedIn && submitStatus !== 'success' && (
                <>
                  {/* Progress bar */}
                  <div className="px-8 pt-8">
                    <div className="flex items-center gap-2 mb-8">
                      {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2 flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${s < step ? 'bg-teal-600 text-white' : s === step ? 'bg-[#0B6B5E] text-white' : 'bg-gray-100 text-gray-400'}`}>
                            {s < step ? <CheckCircle size={16} /> : s}
                          </div>
                          <span className={`text-xs font-medium hidden sm:block ${s === step ? 'text-[#0B6B5E]' : 'text-gray-400'}`}>
                            {s === 1 ? 'Basic Info' : s === 2 ? 'Experience' : 'Documents'}
                          </span>
                          {s < 3 && <div className="flex-1 h-px bg-gray-200 ml-2" />}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mb-6">
                      Welcome, <strong>{workerName || user?.email}</strong>. Fill in your details carefully — this is what employers see.
                    </p>
                  </div>

                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="px-8 pb-8 space-y-5">
                      <h3 className="text-lg font-bold flex items-center gap-2"><MapPin size={18} className="text-teal-600" /> Basic Information</h3>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                          placeholder="07XX XXX XXX"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Type of Work <span className="text-red-500">*</span></label>
                        {category ? (
                          <div className="flex items-center gap-3 rounded-xl border-2 border-[#0B6B5E] bg-teal-50 px-4 py-3">
                            <span className="text-sm font-semibold text-[#0B6B5E]">{category}</span>
                            <button type="button" onClick={() => { setCategory(''); setPendingCategory(''); localStorage.removeItem(PENDING_CAT_KEY); }}
                              className="ml-auto text-xs text-teal-600 underline">Change</button>
                          </div>
                        ) : (
                          <select value={category} onChange={e => { setCategory(e.target.value); setPendingCategory(e.target.value); localStorage.setItem(PENDING_CAT_KEY, e.target.value); }}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
                            <option value="">Select a category</option>
                            {CATEGORIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">County / Area <span className="text-red-500">*</span></label>
                        <select value={county} onChange={e => setCounty(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
                          <option value="">Select your county</option>
                          {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Live-in Preference <span className="text-red-500">*</span></label>
                        <div className="flex flex-col gap-2">
                          {[
                            { val: 'live_in', label: 'Live-in — I stay at the employer\'s home' },
                            { val: 'live_out', label: 'Live-out — I come daily and go home' },
                            { val: 'flexible', label: 'Flexible — either is fine' },
                          ].map(({ val, label }) => (
                            <label key={val} className="flex items-center gap-3 cursor-pointer">
                              <input type="radio" name="live_in" value={val} checked={liveIn === val}
                                onChange={() => setLiveIn(val)} className="accent-teal-600 w-4 h-4" />
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {errorMsg && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                          <AlertCircle size={15} className="shrink-0" />{errorMsg}
                        </div>
                      )}
                      <button type="button"
                        onClick={() => { setErrorMsg(''); if (validateStep1()) { setStep(2); } }}
                        className="w-full bg-[#0B6B5E] hover:bg-teal-800 text-white rounded-xl h-12 font-semibold flex items-center justify-center gap-2 transition-colors">
                        Next: Experience & References <ChevronRight size={18} />
                      </button>
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="px-8 pb-8 space-y-5">
                      <h3 className="text-lg font-bold flex items-center gap-2"><Briefcase size={18} className="text-teal-600" /> Experience & References</h3>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Years of Experience</label>
                        <select value={experienceYears} onChange={e => setExperienceYears(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white">
                          <option value="">Select</option>
                          <option value="0">Less than 1 year</option>
                          {['1','2','3','4','5+'].map(y => <option key={y} value={y}>{y} {y === '1' ? 'year' : 'years'}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Tell us about yourself & your duties</label>
                        <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                          placeholder="e.g. I have 3 years experience caring for young children and cooking Kenyan meals. I am reliable and honest…"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 resize-none" />
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-2 mb-3">
                          <Star size={16} className="text-amber-600 mt-0.5 shrink-0" />
                          <p className="text-sm text-amber-800 font-semibold">Previous Employer Reference (Required)</p>
                        </div>
                        <p className="text-xs text-amber-700 mb-4">
                          Employers trust workers more when they can verify past employment. Please provide your most recent employer's contact.
                        </p>
                        {!hasNoReferee && (
                          <div className="space-y-3">
                            <input type="text" value={prevEmployerName} onChange={e => setPrevEmployerName(e.target.value)}
                              placeholder="Previous employer's full name"
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white" />
                            <input type="tel" value={prevEmployerPhone} onChange={e => setPrevEmployerPhone(e.target.value)}
                              placeholder="Previous employer's phone number"
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white" />
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer mt-3">
                          <input type="checkbox" checked={hasNoReferee} onChange={e => setHasNoReferee(e.target.checked)}
                            className="accent-amber-600 w-4 h-4" />
                          <span className="text-sm text-amber-800">I don't have a previous employer reference</span>
                        </label>
                        {hasNoReferee && (
                          <div className="mt-3 rounded-lg bg-white border border-amber-200 p-3">
                            <p className="text-xs text-amber-800 mb-3">
                              No problem — pay <strong>KES 300</strong> for admin-assisted registration. We will contact you directly and help build your profile. After payment you'll be redirected to WhatsApp.
                            </p>
                            <button type="button" disabled={noRefereePayLoading}
                              onClick={handleNoRefereePayment}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg h-10 text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                              {noRefereePayLoading ? <><Loader2 size={15} className="animate-spin" />Please wait…</> : 'Pay KES 300 & Register via WhatsApp'}
                            </button>
                          </div>
                        )}
                      </div>

                      {errorMsg && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                          <AlertCircle size={15} className="shrink-0" />{errorMsg}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setStep(1); setErrorMsg(''); }}
                          className="flex-1 border border-gray-200 text-gray-700 rounded-xl h-12 font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                          <ChevronLeft size={18} /> Back
                        </button>
                        {!hasNoReferee && (
                          <button type="button"
                            onClick={() => { setErrorMsg(''); if (validateStep2()) setStep(3); }}
                            className="flex-[2] bg-[#0B6B5E] hover:bg-teal-800 text-white rounded-xl h-12 font-semibold flex items-center justify-center gap-2 transition-colors">
                            Next: Documents <ChevronRight size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="px-8 pb-8 space-y-5">
                      <h3 className="text-lg font-bold flex items-center gap-2"><FileText size={18} className="text-teal-600" /> Documents & Photo</h3>
                      <p className="text-sm text-gray-500">
                        A photo and CV make your profile more trustworthy. Share Google Drive / Dropbox links. These are only visible to our team, not the public.
                      </p>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">Profile Photo Link</label>
                        <input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
                          placeholder="https://drive.google.com/…"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                        <p className="text-xs text-gray-400 mt-1">Upload your photo to Google Drive and paste the sharing link here.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-1.5">CV / Reference Letter Link</label>
                        <input type="url" value={cvUrl} onChange={e => setCvUrl(e.target.value)}
                          placeholder="https://drive.google.com/…"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                        <p className="text-xs text-gray-400 mt-1">A CV or reference letter significantly increases your chances of placement.</p>
                      </div>

                      {submitStatus === 'error' && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                          <AlertCircle size={15} className="shrink-0" />{errorMsg}
                        </div>
                      )}

                      <p className="text-xs text-gray-400 leading-relaxed">
                        By submitting, you confirm that all information is accurate. False information may lead to removal from the platform.
                      </p>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => { setStep(2); setErrorMsg(''); submitStatus === 'error' && setSubmitStatus('idle'); }}
                          className="flex-1 border border-gray-200 text-gray-700 rounded-xl h-12 font-medium flex items-center justify-center gap-2 hover:bg-gray-50">
                          <ChevronLeft size={18} /> Back
                        </button>
                        <button type="button" onClick={handleSelfSubmit} disabled={submitStatus === 'submitting'}
                          className="flex-[2] bg-[#0B6B5E] hover:bg-teal-800 text-white rounded-xl h-12 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                          {submitStatus === 'submitting' ? <><Loader2 size={16} className="animate-spin" />Submitting…</> : 'Submit My Profile'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Success after self-registration */}
              {isWorkerLoggedIn && submitStatus === 'success' && (
                <div className="p-10 text-center">
                  <div className="w-20 h-20 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Profile Submitted!</h2>
                  <p className="text-gray-600 mb-2">
                    Thank you, <strong>{workerName}</strong>. Your profile has been received and is under review.
                  </p>
                  <p className="text-gray-500 text-sm mb-8">
                    We will contact you within 2 business days. Once verified, employers can request you through us.
                  </p>
                  <a
                    href={buildWaLink(workerName, category)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-8 py-3.5 transition-colors mb-4"
                  >
                    <MessageCircle size={20} /> Follow up on WhatsApp
                  </a>
                  <p className="text-xs text-gray-400">
                    Tap above to send us a WhatsApp message — it will be pre-filled with your registration details.
                  </p>
                  <button onClick={() => navigate('/housegirl-dashboard')} className="mt-5 text-sm text-teal-700 hover:underline block mx-auto">
                    Go to My Dashboard →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── ASSISTED PATH ─── */}
          {path === 'assisted' && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <MessageCircle size={24} className="text-green-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Admin-Assisted Registration</h2>
                  <p className="text-sm text-gray-500">KES 300 — we register you and build your profile</p>
                </div>
              </div>

              <div className="rounded-xl bg-teal-50 border border-teal-100 p-4 mb-6 text-sm text-teal-800">
                <strong>How it works:</strong> Pay KES 300, get redirected to WhatsApp, and we'll register you manually within 2 business days. Ideal if you cannot fill the form yourself.
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Your Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={assistedName} onChange={e => setAssistedName(e.target.value)}
                    placeholder="e.g. Grace Wanjiku"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Type of Work <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.label}
                        type="button"
                        onClick={() => setAssistedCategory(cat.label)}
                        className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left transition-all ${assistedCategory === cat.label
                          ? 'border-[#0B6B5E] bg-teal-50'
                          : 'border-gray-200 hover:border-teal-300'}`}
                      >
                        <span className={`text-xs font-semibold ${assistedCategory === cat.label ? 'text-[#0B6B5E]' : 'text-gray-700'}`}>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Your Phone Number</label>
                  <input type="tel" value={assistedPhone} onChange={e => setAssistedPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={15} className="shrink-0" />{errorMsg}
                  </div>
                )}

                <button type="button" onClick={handleAssistedPay} disabled={assistedPayLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {assistedPayLoading
                    ? <><Loader2 size={16} className="animate-spin" />Please wait…</>
                    : <><MessageCircle size={18} />Pay KES 300 & Register via WhatsApp</>}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  You'll be taken to a secure Pesapal payment page (M-Pesa, card, etc.), then redirected to WhatsApp.
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed">
            Your details are kept private and never displayed publicly. Once verified by our team, employers contact <em>us</em> — we match you, you don't have to search.
          </p>
        </div>
      </section>

      <Footer />

      {/* WhatsApp widget */}
      <div className="fixed bottom-5 left-5 z-50 group flex items-center">
        <span className="mr-2 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-sm font-medium text-[#111] shadow-md opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
          Chat with us
        </span>
        <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
          className="h-14 w-14 rounded-full bg-green-500 text-white shadow-xl inline-flex items-center justify-center hover:bg-green-600 transition-colors"
          aria-label="Chat on WhatsApp">
          <MessageCircle size={24} />
        </a>
      </div>
    </div>
  );
};

export default ForWorkersPage;
