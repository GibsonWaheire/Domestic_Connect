import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthEnhanced } from '@/hooks/useAuthEnhanced';
import { FirebaseAuthService } from '@/lib/firebaseAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const authContext = useAuthEnhanced();
  const user = authContext?.user || null;
  const loading = authContext?.loading || false;
  const authStep = authContext?.authStep || 1;
  const phoneNumber = authContext?.phoneNumber || '';
  const formatKenyanPhone = authContext?.formatKenyanPhone || ((phone: string) => phone);
  const handleSendOTP = authContext?.handleSendOTP || (async () => ({ error: 'Authentication is unavailable.' }));
  const handleVerifyOTP = authContext?.handleVerifyOTP || (async () => ({ error: 'Authentication is unavailable.' }));
  const resendOTP = authContext?.resendOTP || (async () => ({ error: 'Authentication is unavailable.' }));
  const changePhoneNumber = authContext?.changePhoneNumber || (() => { });
  const handleGoogleSignIn = authContext?.handleGoogleSignIn || (async () => ({ error: 'Authentication is unavailable.' }));
  const signIn = authContext?.signIn || (async () => ({ error: 'Authentication is unavailable.' }));
  const signUp = authContext?.signUp || (async () => ({ error: 'Authentication is unavailable.' }));

  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup' | 'select-role'>('login');
  const [userType, setUserType] = useState<'employer' | 'housegirl'>('employer');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [lastSubmittedCode, setLastSubmittedCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [pendingUid, setPendingUid] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  const maskPhoneForDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) return phone;
    return `+${digits.slice(0, 6)}XXX${digits.slice(-2)}`;
  };

  useEffect(() => {
    changePhoneNumber();
    setOtpCode('');
    setError(null);
  }, [changePhoneNumber]);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const uid = searchParams.get('uid') || '';
    if (urlMode === 'signup') {
      setMode('signup');
      setPendingUid('');
    } else if (urlMode === 'select-role') {
      setMode('select-role');
      setPendingUid(uid);
    } else {
      setMode('login');
      setPendingUid('');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    if (user.is_admin) {
      navigate('/admin-dashboard', { replace: true });
      return;
    }
    if (user.user_type === 'housegirl') {
      navigate('/housegirl-dashboard', { replace: true });
      return;
    }
    if (user.user_type === 'agency') {
      navigate('/agency-dashboard', { replace: true });
      return;
    }
    navigate('/employer-dashboard', { replace: true });
  }, [user, navigate]);

  const verifyCode = async (code: string) => {
    if (isVerifyingCode || code.length !== 6) return;
    setIsVerifyingCode(true);
    setLastSubmittedCode(code);
    setError(null);
    try {
      const authMode = mode === 'signup' ? 'signup' : 'login';
      const result = await handleVerifyOTP(code, authMode);
      if (result.error) {
        setError(result.error);
        setLastSubmittedCode('');
      }
    } catch (error: unknown) {
      const exactError = error instanceof Error ? error.message : String(error);
      setError(exactError || 'Failed to verify code.');
      setLastSubmittedCode('');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  useEffect(() => {
    if (authStep !== 2) return;
    if (!('OTPCredential' in window) || !navigator.credentials) return;
    const ac = new AbortController();
    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    } as any).then((otp: any) => {
      const incomingCode = String(otp?.code || '').replace(/\D/g, '').slice(0, 6);
      if (incomingCode.length === 6) {
        setOtpCode(incomingCode);
        verifyCode(incomingCode);
      }
    }).catch(() => {
    });
    return () => ac.abort();
  }, [authStep]);

  useEffect(() => {
    if (authStep !== 2) return;
    if (otpCode.length === 6 && otpCode !== lastSubmittedCode) {
      verifyCode(otpCode);
    }
  }, [otpCode, authStep, lastSubmittedCode]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const formattedPhone = formatKenyanPhone(phoneInput);
    const authMode = mode === 'signup' ? 'signup' : 'login';
    const result = await handleSendOTP(formattedPhone, userType, authMode);
    if (result.error) {
      setError(result.error);
      return;
    }
    setOtpCode('');
    setLastSubmittedCode('');
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;
    await verifyCode(otpCode);
  };

  const handleResendCode = async () => {
    setError(null);
    const result = await resendOTP();
    if (result.error) {
      setError(result.error);
    }
  };

  const handleEmailAuth = async () => {
    setError(null);

    if (mode === 'signup' && passwordInput !== confirmPasswordInput) {
      setError('Passwords do not match.');
      return;
    }

    if (mode === 'login') {
      const result = await signIn(emailInput, passwordInput);
      if (result.error) {
        setError(result.error);
      }
      return;
    }

    const result = await signUp(emailInput, passwordInput, userType, {});
    if (result.error) {
      setError(result.error);
    }
  };

  const handleSelectRole = async (selectedType: 'employer' | 'housegirl') => {
    try {
      setIsUpdatingRole(true);
      setError(null);
      const firebaseUser = FirebaseAuthService.getCurrentUser();
      if (!firebaseUser) {
        setError('Session expired. Please log in again.');
        return;
      }
      const token = await FirebaseAuthService.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/update-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          uid: pendingUid || firebaseUser.uid,
          user_type: selectedType,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        setError(data?.error || 'Failed to update role.');
        return;
      }
      if (selectedType === 'housegirl') {
        navigate('/housegirl-dashboard', { replace: true });
      } else {
        navigate('/employer-dashboard', { replace: true });
      }
    } catch (error: unknown) {
      const exactError = error instanceof Error ? error.message : String(error);
      setError(exactError || 'Failed to update role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDF6F0] font-sans text-[#111]">
      {/* Left Panel - Hidden on Mobile */}
      <div className="hidden md:flex flex-col justify-between w-[45%] bg-[#111] text-white p-12 relative overflow-hidden">
        {/* Subtle CSS Pattern */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex flex-col items-start gap-6">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white hover:opacity-90 transition-all duration-200">
            Domestic Connect
          </Link>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mt-12 w-full max-w-sm">
            Find trusted house help across Kenya
          </h1>
          <div className="flex flex-col gap-6 mt-12">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/10 p-1.5 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="font-medium text-lg text-white/90">Verified profiles</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/10 p-1.5 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="font-medium text-lg text-white/90">Trusted by 1,000+ families</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/10 p-1.5 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="font-medium text-lg text-white/90">Safe & secure</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-16">
          <Link to="/" className="text-white/60 hover:text-white transition-all duration-200 text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col w-full md:w-[55%] min-h-screen">
        {/* Mobile Header */}
        <div className="md:hidden p-5 text-center bg-[#111] border-b border-gray-800 shadow-sm flex items-center mb-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white mx-auto">
            Domestic Connect
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 md:p-12 relative w-full">
          <div className="w-full max-w-[400px] mx-auto">
            <div className="mb-6">
              {mode === 'select-role' ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">One more step</h2>
                  <p className="mt-1 text-sm text-gray-500">What best describes you?</p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900">Welcome to Domestic Connect</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
                  </p>
                </>
              )}
            </div>

            {/* Top Pill Tab Toggle */}
            {mode !== 'select-role' && (
              <div className="flex p-1 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-full mb-10 shadow-sm">
                <button
                  type="button"
                  onClick={() => { setMode('login'); navigate('/login'); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${mode === 'login' ? 'bg-[#111] text-white shadow-md' : 'text-gray-500 hover:text-[#111] hover:bg-white/50'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); navigate('/login?mode=signup'); }}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${mode === 'signup' ? 'bg-[#111] text-white shadow-md' : 'text-gray-500 hover:text-[#111] hover:bg-white/50'}`}
                >
                  Create Account
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 font-medium text-center shadow-sm">
                {error}
              </div>
            )}

            {mode === 'select-role' ? (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => handleSelectRole('employer')}
                  disabled={isUpdatingRole}
                  className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-gray-300"
                >
                  <div className="text-lg font-semibold text-gray-900">👔 I am an Employer</div>
                  <div className="mt-1 text-sm text-gray-500">I am looking for house help</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectRole('housegirl')}
                  disabled={isUpdatingRole}
                  className="w-full rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm hover:border-gray-300"
                >
                  <div className="text-lg font-semibold text-gray-900">👩 I am a Housegirl</div>
                  <div className="mt-1 text-sm text-gray-500">I am looking for work</div>
                </button>
                {isUpdatingRole && (
                  <p className="text-sm text-gray-500 text-center mt-2">Saving your role...</p>
                )}
              </div>
            ) : authStep === 1 ? (
              <form onSubmit={handleSendCode} className="flex flex-col animate-in fade-in duration-300">
                {mode === 'signup' && (
                  <div className="flex w-full rounded-[14px] bg-white border border-gray-200 p-1.5 mb-6 shadow-sm">
                    {[
                      { value: 'employer', label: 'Employer' },
                      { value: 'housegirl', label: 'Housegirl' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setUserType(option.value as 'employer' | 'housegirl')}
                        className={`flex-1 rounded-[10px] py-2.5 text-center text-sm font-semibold transition-all duration-200 ${userType === option.value
                          ? 'bg-[#111] text-white shadow-md'
                          : 'text-gray-500 hover:text-[#111] hover:bg-gray-50'
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className={`mb-6 transition-all duration-200 ${showEmailForm ? 'hidden' : ''}`}>
                  <Label htmlFor="phoneInput" className="block text-sm font-semibold text-[#111] mb-2">Phone Number</Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 pl-4 py-3 flex items-center pr-3 border-r border-gray-200 pointer-events-none z-10">
                      <span className="text-lg leading-none mr-2">🇰🇪</span>
                      <span className="text-gray-600 font-medium">+254</span>
                    </div>
                    <Input
                      id="phoneInput"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="712 345 678"
                      inputMode="numeric"
                      className="pl-[112px] w-full border border-gray-200 bg-white rounded-xl h-14 pr-4 shadow-sm text-lg tracking-wide focus-visible:ring-1 focus-visible:ring-[#111] transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className={`transition-all duration-200 ${showEmailForm ? 'hidden' : ''}`}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#111] text-white rounded-xl h-14 text-base font-semibold hover:bg-black transition-all duration-200 shadow-md mb-2"
                  >
                    {loading ? 'Processing...' : (mode === 'login' ? 'Send Code' : 'Save & Continue')}
                  </Button>
                </div>

                <div className={`relative my-8 transition-all duration-200 ${showEmailForm ? 'hidden' : ''}`}>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm font-medium">
                    <span className="bg-[#FDF6F0] px-4 text-gray-400">OR</span>
                  </div>
                </div>

                <div className={`transition-all duration-200 ${showEmailForm ? 'hidden' : ''}`}>
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => handleGoogleSignIn(userType, mode)}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-[#111] rounded-xl h-14 text-base font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {mode === 'login' ? 'Sign In with Google' : 'Sign Up with Google'}
                  </Button>
                </div>

                <div className={`${showEmailForm ? 'max-h-96 mt-8' : 'max-h-0'} overflow-hidden transition-all duration-200`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setEmailInput('');
                      setPasswordInput('');
                      setConfirmPasswordInput('');
                    }}
                    className="mb-4 text-sm text-gray-400 underline cursor-pointer"
                  >
                    ← Back to other options
                  </button>

                  <div className="mb-4">
                    <Label htmlFor="emailInput" className="block text-sm font-semibold text-[#111] mb-2">Email</Label>
                    <Input
                      id="emailInput"
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-gray-200 bg-white rounded-xl h-12 shadow-sm focus-visible:ring-1 focus-visible:ring-[#111] transition-all duration-200"
                    />
                  </div>

                  <div className="mb-4">
                    <Label htmlFor="passwordInput" className="block text-sm font-semibold text-[#111] mb-2">Password</Label>
                    <Input
                      id="passwordInput"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full border border-gray-200 bg-white rounded-xl h-12 shadow-sm focus-visible:ring-1 focus-visible:ring-[#111] transition-all duration-200"
                    />
                  </div>

                  {mode === 'signup' && (
                    <div className="mb-6">
                      <Label htmlFor="confirmPasswordInput" className="block text-sm font-semibold text-[#111] mb-2">Confirm Password</Label>
                      <Input
                        id="confirmPasswordInput"
                        type="password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        className="w-full border border-gray-200 bg-white rounded-xl h-12 shadow-sm focus-visible:ring-1 focus-visible:ring-[#111] transition-all duration-200"
                      />
                    </div>
                  )}

                  <Button
                    type="button"
                    disabled={loading}
                    onClick={handleEmailAuth}
                    className="w-full bg-[#111] text-white rounded-xl h-12 text-base font-semibold hover:bg-black transition-all duration-200 shadow-md mb-2"
                  >
                    {mode === 'login' ? 'Sign In with Email' : 'Create Account with Email'}
                  </Button>
                </div>

                {!showEmailForm && (
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(true)}
                    className="mt-6 text-sm text-gray-400 underline cursor-pointer transition-all duration-200"
                  >
                    Prefer email? Sign in with email →
                  </button>
                )}

                <div className="mt-8 text-center text-sm font-medium">
                  {mode === 'login' ? (
                    <p className="text-gray-500">Don't have an account? <button type="button" onClick={() => { setMode('signup'); navigate('/login?mode=signup'); }} className="text-[#F59E0B] font-bold hover:text-amber-600 transition-all duration-200 ml-1">Join Today</button></p>
                  ) : (
                    <p className="text-gray-500">Already have an account? <button type="button" onClick={() => { setMode('login'); navigate('/login'); }} className="text-[#F59E0B] font-bold hover:text-amber-600 transition-all duration-200 ml-1">Sign In</button></p>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifySubmit} className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl px-4 py-3 text-sm font-medium mb-8 flex flex-col md:flex-row items-center gap-2 shadow-sm w-full justify-center text-center">
                  <span>Code sent to {maskPhoneForDisplay(phoneNumber)}</span>
                  <button type="button" onClick={() => { changePhoneNumber(); setOtpCode(''); setLastSubmittedCode(''); }} className="underline hover:text-amber-700 decoration-amber-300">Change number</button>
                </div>

                <h3 className="text-2xl font-bold text-[#111] mb-2">Check your phone</h3>
                <p className="text-gray-500 mb-8 text-center font-medium">Enter the 6-digit verification code below</p>

                <Input
                  id="otpCode"
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="w-full text-center text-4xl tracking-[0.5em] font-bold border border-gray-200 bg-white rounded-2xl h-20 mb-8 shadow-sm focus-visible:ring-2 focus-visible:ring-[#111] transition-all duration-200"
                  required
                />

                <Button
                  type="submit"
                  disabled={loading || isVerifyingCode}
                  className="w-full bg-[#111] text-white rounded-xl h-14 text-base font-semibold hover:bg-black transition-all duration-200 shadow-md mb-6"
                >
                  {loading || isVerifyingCode ? 'Verifying...' : 'Verify & Continue'}
                </Button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-gray-500 font-semibold hover:text-[#111] transition-all duration-200"
                >
                  Didn't receive the code? <span className="underline decoration-2 underline-offset-4">Resend</span>
                </button>
              </form>
            )}

            <div id="recaptcha-container" style={{ display: 'none' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
