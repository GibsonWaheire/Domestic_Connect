import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { errorService } from '@/lib/errorService';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
  defaultUserType?: 'employer' | 'housegirl' | 'agency';
  userTypeFixed?: boolean;
}

const AuthModal = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  defaultUserType,
  userTypeFixed = false,
}: AuthModalProps) => {
  const resolvedDefaultUserType = defaultUserType ?? 'employer';
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [lastSubmittedCode, setLastSubmittedCode] = useState('');
  const [userType, setUserType] = useState<'employer' | 'housegirl' | 'agency'>(resolvedDefaultUserType);
  const [error, setError] = useState<string | null>(null);

  const { handleSendOTP, handleVerifyOTP, resendOTP, changePhoneNumber, authStep, phoneNumber, loading, user, handleGoogleSignIn } = useAuth();
  const navigate = useNavigate();

  const formatKenyanPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+254') && cleaned.length === 13) return cleaned;
    if (cleaned.startsWith('254') && cleaned.length === 12) return `+${cleaned}`;
    if (cleaned.startsWith('0') && cleaned.length === 10) return `+254${cleaned.slice(1)}`;
    if (cleaned.startsWith('7') && cleaned.length === 9) return `+254${cleaned}`;
    return cleaned;
  };

  const maskPhoneForDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) return phone;
    return `+${digits.slice(0, 6)}XXX${digits.slice(-2)}`;
  };

  const getRouteByUserType = (type?: string, isAdmin?: boolean) => {
    if (isAdmin) return '/admin-dashboard';
    if (type === 'agency') return '/agency-dashboard';
    if (type === 'housegirl') return '/housegirl-dashboard';
    if (type === 'employer') return '/employer-dashboard';
    return '/';
  };

  const getPostAuthRoute = (type?: string, isAdmin?: boolean) => {
    const pendingContactId = localStorage.getItem('pendingContactId');
    if (pendingContactId && type === 'employer' && !isAdmin) {
      return `/?pendingContactId=${encodeURIComponent(pendingContactId)}`;
    }
    return getRouteByUserType(type, isAdmin);
  };

  useEffect(() => {
    if (user && mode === 'login') {
      onClose();
      navigate(getPostAuthRoute(user.user_type, user.is_admin));
    }
  }, [user, mode, onClose, navigate]);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  useEffect(() => {
    if (isOpen) {
      changePhoneNumber();
      setUserType(resolvedDefaultUserType);
      setPhoneInput('');
      setOtpCode('');
      setLastSubmittedCode('');
      setIsVerifyingCode(false);
      setError(null);
    }
  }, [isOpen, resolvedDefaultUserType, changePhoneNumber]);

  const verifyCode = async (code: string) => {
    if (isVerifyingCode || code.length !== 6) return;
    setIsVerifyingCode(true);
    setLastSubmittedCode(code);
    setError(null);
    try {
      const result = await handleVerifyOTP(code, mode);
      if (result.error) {
        toast({
          title: 'Verification Failed',
          description: result.error,
          variant: 'destructive'
        });
        setError(result.error);
        setLastSubmittedCode('');
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const userFriendlyError = errorService.getUserFriendlyError(errorObj, 'OTP Verification');
      toast({
        title: userFriendlyError.title,
        description: userFriendlyError.message,
        variant: 'destructive'
      });
      setError(userFriendlyError.message);
      setLastSubmittedCode('');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  useEffect(() => {
    if (authStep !== 2 || !isOpen) return;
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
  }, [authStep, isOpen]);

  useEffect(() => {
    if (authStep !== 2) return;
    if (otpCode.length === 6 && otpCode !== lastSubmittedCode) {
      verifyCode(otpCode);
    }
  }, [otpCode, authStep, lastSubmittedCode]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await handleSendOTP(formatKenyanPhone(phoneInput), userType);
      if (result.error) {
        toast({
          title: 'Sign In Error',
          description: result.error,
          variant: 'destructive'
        });
        setError(result.error);
      } else {
        setOtpCode('');
        setLastSubmittedCode('');
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const userFriendlyError = errorService.getUserFriendlyError(errorObj, 'Phone Verification');
      toast({
        title: userFriendlyError.title,
        description: userFriendlyError.message,
        variant: 'destructive'
      });
      setError(userFriendlyError.message);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otpCode.length !== 6) {
      const message = 'Enter the 6-digit code from SMS.';
      setError(message);
      toast({
        title: 'Invalid Code',
        description: message,
        variant: 'destructive'
      });
      return;
    }
    await verifyCode(otpCode);
  };

  const handleResendCode = async () => {
    setError(null);
    const result = await resendOTP();
    if (result.error) {
      setError(result.error);
      toast({
        title: 'Resend Failed',
        description: result.error,
        variant: 'destructive'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40">
      <div className="flex h-full w-full items-center justify-center md:p-4">
        <div className="relative h-full w-full md:h-auto md:max-w-[400px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-black"
          >
            <X className="h-5 w-5" />
          </Button>

          <Card className="h-full w-full rounded-none border-0 bg-white md:h-auto md:rounded-xl">
            <CardHeader className="p-7 pb-3">
              <div className="flex mb-4 bg-gray-100 p-1 rounded-full w-full">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all ${mode === 'login' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-full transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
                >
                  Create Account
                </button>
              </div>

              {mode === 'login' ? (
                <>
                  <CardTitle className="text-center text-[22px] font-bold text-black mb-1">Welcome back</CardTitle>
                  <p className="text-center text-sm text-gray-500">Sign in to continue</p>
                </>
              ) : (
                <>
                  <CardTitle className="text-center text-[22px] font-bold text-black mb-1">Join Domestic Connect</CardTitle>
                  <p className="text-center text-sm text-gray-500">
                    {userType === 'employer' ? 'Find trusted house help in Kenya' : 'Get discovered by families across Kenya'}
                  </p>
                </>
              )}
            </CardHeader>

            <CardContent className="p-7 pt-0">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <div className="flex items-center justify-between gap-2">
                    <span>{error}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setError(null)}
                      className="h-auto p-1 text-red-600 hover:bg-red-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {authStep === 1 ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  {!userTypeFixed && mode === 'signup' && (
                    <div className="mx-auto flex w-full max-w-xs rounded-full bg-gray-100 p-1">
                      {[
                        { value: 'employer', label: '👔 Employer' },
                        { value: 'housegirl', label: '👩 Housegirl' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setUserType(option.value as 'employer' | 'housegirl' | 'agency')}
                          className={`flex-1 cursor-pointer rounded-full py-2 text-center text-sm font-medium transition-all ${userType === option.value
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phoneInput" className="text-xs text-gray-500">
                      Phone number
                    </Label>
                    <Input
                      id="phoneInput"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      required
                      className="h-11 w-full border-gray-300"
                      placeholder="0712 345 678"
                    />
                    <p className="text-xs text-gray-400">We'll send you a verification code</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-full bg-black py-3 font-semibold text-white hover:bg-black/90"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Send Code →'}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-400">or</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleGoogleSignIn(mode === 'signup' ? userType : undefined, mode)}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-3 font-medium text-[#333] hover:bg-gray-50"
                    disabled={loading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <p className="text-xs text-gray-500">Code sent to {maskPhoneForDisplay(phoneNumber)}</p>
                  <Input
                    id="otpCode"
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    className="h-12 w-full border-gray-300 text-center text-2xl tracking-widest"
                    placeholder="_ _ _ _ _ _"
                  />
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-black py-3 font-semibold text-white hover:bg-black/90"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Verify Code →'}
                  </Button>
                  <div className="space-y-2 text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendCode}
                      className="h-auto p-0 text-xs text-gray-400 hover:text-gray-600"
                    >
                      Resend code
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => {
                        changePhoneNumber();
                        setOtpCode('');
                        setLastSubmittedCode('');
                      }}
                      className="h-auto p-0 text-xs text-gray-400 hover:text-gray-600"
                    >
                      ← Change number
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-4 text-center">
                {mode === 'login' ? (
                  <button type="button" onClick={() => setMode('signup')} className="text-sm text-gray-500 hover:text-black transition-colors">
                    New here? Create account →
                  </button>
                ) : (
                  <button type="button" onClick={() => setMode('login')} className="text-sm text-gray-500 hover:text-black transition-colors">
                    Already have account? Sign in →
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
