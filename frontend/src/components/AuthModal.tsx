import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { toast } from '@/hooks/use-toast';
import { errorService } from '@/lib/errorService';
import { Eye, EyeOff, X } from 'lucide-react';

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
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [userType, setUserType] = useState<'employer' | 'housegirl' | 'agency'>(resolvedDefaultUserType);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp, signIn, signInWithGoogle, resetPassword, signOut, user } = useAuth();
  const navigate = useNavigate();

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) return '+254' + cleaned.substring(1);
    if (cleaned.startsWith('254')) return '+' + cleaned;
    if (cleaned.startsWith('7')) return '+254' + cleaned;
    if (value.startsWith('+')) return value;
    if (cleaned.length === 9) return '+254' + cleaned;
    return value;
  };

  const validatePhoneNumber = (phone: string) => /^\+254[17]\d{8}$/.test(formatPhoneNumber(phone));

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
    if (user && isLogin) {
      onClose();
      navigate(getPostAuthRoute(user.user_type, user.is_admin));
    }
  }, [user, isLogin, onClose, navigate]);

  useEffect(() => {
    setIsLogin(defaultMode === 'login');
  }, [defaultMode]);

  useEffect(() => {
    if (isOpen) {
      setUserType(resolvedDefaultUserType);
    }
  }, [isOpen, resolvedDefaultUserType]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        toast({
          title: "Google Sign In Error",
          description: result.error || "Failed to sign in with Google. Please try again.",
          variant: "destructive"
        });
      } else {
        onClose();
        localStorage.setItem('dc_auth_provider', 'google');
        const currentUser = result.user;
        navigate(getPostAuthRoute(currentUser?.user_type, currentUser?.is_admin));
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const userFriendlyError = errorService.getUserFriendlyError(errorObj, 'Google Sign In');
      
      toast({
        title: userFriendlyError.title,
        description: userFriendlyError.message,
        variant: "destructive"
      });
      
      setError(userFriendlyError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.error) {
        toast({
          title: "Password Reset Failed",
          description: result.error || "Failed to send password reset email.",
          variant: "destructive"
        });
      } else {
        setShowForgotPassword(false);
        toast({
          title: "Password Reset Email Sent",
          description: "Check your email for instructions to reset your password.",
        });
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const userFriendlyError = errorService.getUserFriendlyError(errorObj, 'Password Reset');
      
      toast({
        title: userFriendlyError.title,
        description: userFriendlyError.message,
        variant: "destructive"
      });
      
      setError(userFriendlyError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const normalizedLoginIdentifier = email.trim();
        if (!normalizedLoginIdentifier) {
          toast({
            title: "Email or Phone Required",
            description: "Please enter your email address or phone number.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        const loginEmail = normalizedLoginIdentifier.includes('@')
          ? normalizedLoginIdentifier.toLowerCase()
          : `phone_${formatPhoneNumber(normalizedLoginIdentifier).replace(/\D/g, '')}@domesticconnect.user`;

        const result = await signIn(loginEmail, password);
        if (result.error) {
          toast({
            title: "Sign In Error",
            description: result.error || "Failed to sign in. Please try again.",
            variant: "destructive"
          });
        } else {
          const currentUser = result.user;
          if (currentUser?.user_type !== userType && !currentUser?.is_admin) {
            toast({
              title: "Invalid Role",
              description: `This account belongs to a ${currentUser?.user_type}. Please select the correct role to sign in.`,
              variant: "destructive"
            });
            await signOut();
            setLoading(false);
            return;
          }
          
          onClose();
          localStorage.setItem('dc_auth_provider', 'password');
          navigate(getPostAuthRoute(currentUser?.user_type, currentUser?.is_admin));
        }
      } else {
        if (password.length < 8) {
          toast({
            title: "Weak Password",
            description: "Password must be at least 8 characters long.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const normalizedIdentifier = signupIdentifier.trim();
        if (!normalizedIdentifier) {
          toast({
            title: "Email or Phone Required",
            description: "Please enter either your phone number or email address.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const isEmailInput = normalizedIdentifier.includes('@');
        if (isEmailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedIdentifier)) {
          toast({
            title: "Invalid Email",
            description: "Please enter a valid email address.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        if (!isEmailInput && !validatePhoneNumber(normalizedIdentifier)) {
          toast({
            title: "Invalid Phone Number",
            description: "Please enter a valid Kenyan phone number (e.g., 07XX XXX XXX)",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const normalizedPhone = isEmailInput ? '' : formatPhoneNumber(normalizedIdentifier);
        const signupEmail = isEmailInput
          ? normalizedIdentifier.toLowerCase()
          : `phone_${normalizedPhone.replace(/\D/g, '')}@domesticconnect.user`;

        const { error } = await signUp(signupEmail, password, userType, {
          first_name: 'New',
          last_name: userType === 'housegirl' ? 'Housegirl' : userType === 'agency' ? 'Agency' : 'Employer',
          phone_number: normalizedPhone,
        });

        if (error) {
          toast({
            title: "Sign Up Error",
            description: error || "Failed to create account. Please try again.",
            variant: "destructive"
          });
        } else {
          localStorage.setItem(`dc_profile_prompt_${userType}`, 'true');
          setIsLogin(true);
          setPassword('');
          setSignupIdentifier('');
          setEmail(normalizedIdentifier);
          toast({
            title: "Account Created",
            description: "Please login with the credentials you created.",
          });
        }
      }
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const userFriendlyError = errorService.getUserFriendlyError(errorObj, isLogin ? 'Sign In' : 'Sign Up');
      
      toast({
        title: userFriendlyError.title,
        description: userFriendlyError.message,
        variant: "destructive"
      });
      
      setError(userFriendlyError.message);
    } finally {
      setLoading(false);
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
            <CardHeader className="p-7 pb-3 text-center">
              <p className="text-[14px] font-bold text-black">Domestic Connect</p>
              <CardTitle className="mb-1 text-center text-[22px] font-bold text-black">
                {isLogin ? 'Welcome back' : 'Join Domestic Connect'}
              </CardTitle>
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <Button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white py-3 text-black hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {loading ? 'Processing...' : 'Continue with Google'}
                </Button>

                <div className="flex items-center gap-2 text-gray-400">
                  <span className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs">or</span>
                  <span className="h-px flex-1 bg-gray-200" />
                </div>

                {!userTypeFixed && (
                  <div className="mx-auto flex w-full max-w-xs rounded-full bg-gray-100 p-1">
                    {[
                      { value: 'employer', label: '👔 Employer' },
                      { value: 'housegirl', label: '👩 Housegirl' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setUserType(option.value as 'employer' | 'housegirl' | 'agency')}
                        className={`flex-1 cursor-pointer rounded-full py-2 text-center text-sm font-medium transition-all ${
                          userType === option.value
                            ? 'bg-white text-black shadow-sm'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {isLogin ? (
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 w-full border-gray-300"
                    placeholder="Email or phone number"
                  />
                ) : (
                  <Input
                    id="signupIdentifier"
                    type="text"
                    value={signupIdentifier}
                    onChange={(e) => setSignupIdentifier(e.target.value)}
                    required
                    className="h-11 w-full border-gray-300"
                    placeholder="Email or phone number"
                  />
                )}

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 w-full border-gray-300 pr-10"
                    placeholder="Password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full bg-black py-3 font-semibold text-white hover:bg-black/90"
                  disabled={loading}
                >
                  {loading
                    ? 'Processing...'
                    : isLogin
                      ? 'Sign In'
                      : userType === 'housegirl'
                        ? 'Continue as Housegirl'
                        : 'Continue as Employer'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="h-auto p-0 text-sm text-gray-500 hover:text-gray-700"
                >
                  {isLogin ? 'No account? Join free →' : 'Have an account? Sign in →'}
                </Button>
              </div>
            </CardContent>
          </Card>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/40 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-gray-900">Reset Password</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter your email address and we'll send you a link to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-gray-700 font-medium">Email Address</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading || !email}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
