import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuthEnhanced';

const LoginPage = () => {
  const navigate = useNavigate();
  const {
    user,
    loading,
    authStep,
    phoneNumber,
    formatKenyanPhone,
    handleSendOTP,
    handleVerifyOTP,
    resendOTP,
    changePhoneNumber,
  } = useAuth();

  const [userType, setUserType] = useState<'employer' | 'housegirl'>('employer');
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [lastSubmittedCode, setLastSubmittedCode] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      const result = await handleVerifyOTP(code);
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
    const result = await handleSendOTP(formattedPhone, userType);
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

  return (
    <div className="min-h-screen bg-[#FDF6F0] text-[#111] font-sans">
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight text-[#111]">Domestic Connect</span>
          </Link>
          <nav className="hidden md:flex items-center gap-3">
            <Link to="/housegirls" className="bg-black text-white rounded-full px-4 py-1.5 text-sm font-medium hover:bg-[#333] transition-colors">
              Find Househelp
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-sm mx-auto pt-16 px-4">
        <p className="text-[14px] font-bold text-black text-center">Domestic Connect</p>
        <h1 className="mb-6 text-center text-[22px] font-bold text-black">Welcome back</h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {authStep === 1 ? (
          <form onSubmit={handleSendCode}>
            <div className="mx-auto mb-4 flex w-full max-w-xs rounded-full bg-gray-100 p-1">
              {[
                { value: 'employer', label: '👔 Employer' },
                { value: 'housegirl', label: '👩 Housegirl' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUserType(option.value as 'employer' | 'housegirl')}
                  className={`flex-1 cursor-pointer rounded-full py-2 text-center text-sm font-medium transition-all ${userType === option.value
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div>
              <Label htmlFor="phoneInput">Phone number</Label>
              <Input
                id="phoneInput"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="0712 345 678"
                inputMode="numeric"
                className="w-full border border-gray-200 rounded-xl py-3 px-4 text-[15px] mt-2"
                required
              />
              <p className="text-gray-400 text-xs mt-1">We'll send you a verification code</p>
            </div>

            <Button
              type="submit"
              className="bg-black text-white rounded-full w-full py-3 font-medium mt-4 hover:bg-black/90"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Send Code →'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifySubmit}>
            <p className="text-center text-sm font-medium text-gray-700 mb-1">
              Code sent to {maskPhoneForDisplay(phoneNumber)}
            </p>
            <p className="text-center text-xs text-gray-400 mb-5">
              Check your phone and type the 6-digit code below
            </p>
            <Input
              id="otpCode"
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              pattern="[0-9]*"
              className="text-center text-3xl tracking-widest border border-gray-200 rounded-xl py-4 px-4 w-full"
              required
            />

            <Button
              type="submit"
              className="bg-black text-white rounded-full w-full py-3 font-medium mt-4 hover:bg-black/90"
              disabled={loading || isVerifyingCode}
            >
              {loading || isVerifyingCode ? 'Processing...' : 'Verify Code →'}
            </Button>

            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-gray-400 text-center mt-3 cursor-pointer w-full"
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                changePhoneNumber();
                setOtpCode('');
                setLastSubmittedCode('');
              }}
              className="text-sm text-gray-400 text-center mt-2 cursor-pointer w-full"
            >
              ← Change number
            </button>
          </form>
        )}

        <div
          id="recaptcha-container"
          style={{ display: 'none' }}
        ></div>
      </main>
    </div>
  );
};

export default LoginPage;
