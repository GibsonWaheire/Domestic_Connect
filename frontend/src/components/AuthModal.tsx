import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
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
  const [userType, setUserType] = useState<'employer' | 'housegirl' | 'agency'>(resolvedDefaultUserType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const { signIn, signUp, handleGoogleSignIn, loading, user } = useAuth();
  const navigate = useNavigate();

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
      setUserType(resolvedDefaultUserType);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
    }
  }, [isOpen, resolvedDefaultUserType]);

  const handleGoogleClick = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await handleGoogleSignIn(mode === 'signup' ? userType : undefined, mode);
      if (result.error) {
        setError(result.error);
        toast({ title: 'Google Sign-In Failed', description: result.error, variant: 'destructive' });
      } else if (result.user) {
        onClose();
        navigate(getPostAuthRoute(result.user.user_type, result.user.is_admin));
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setEmailLoading(true);
    try {
      if (mode === 'login') {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
          toast({ title: 'Sign In Failed', description: result.error, variant: 'destructive' });
        } else if (result.user) {
          onClose();
          navigate(getPostAuthRoute(result.user.user_type, result.user.is_admin));
        }
      } else {
        const result = await signUp(email, password, userType, {});
        if (result.error) {
          setError(result.error);
          toast({ title: 'Sign Up Failed', description: result.error, variant: 'destructive' });
        } else {
          toast({ title: 'Account Created', description: 'Welcome to Domestic Connect!' });
          onClose();
        }
      }
    } finally {
      setEmailLoading(false);
    }
  };

  if (!isOpen) return null;

  const isLoading = loading || googleLoading || emailLoading;

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

              <div className="space-y-4">
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

                <Button
                  type="button"
                  onClick={handleGoogleClick}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white py-3 font-medium text-[#333] hover:bg-gray-50"
                  disabled={isLoading}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {googleLoading ? 'Connecting...' : mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                </Button>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-400">or</span>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="modal-email" className="text-xs text-gray-500">Email</Label>
                    <Input
                      id="modal-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11 w-full border-gray-300"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="modal-password" className="text-xs text-gray-500">Password</Label>
                    <Input
                      id="modal-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 w-full border-gray-300"
                      placeholder="••••••••"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                  </div>
                  {mode === 'signup' && (
                    <div className="space-y-1">
                      <Label htmlFor="modal-confirm-password" className="text-xs text-gray-500">Confirm Password</Label>
                      <Input
                        id="modal-confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="h-11 w-full border-gray-300"
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-black py-3 font-semibold text-white hover:bg-black/90"
                    disabled={isLoading}
                  >
                    {emailLoading ? 'Processing...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                  </Button>
                </form>

                <div className="mt-2 text-center">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
