import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthEnhanced } from '@/hooks/useAuthEnhanced';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const authContext = useAuthEnhanced();
  const user = authContext?.user ?? null;
  const loading = authContext?.loading ?? false;
  const signIn = authContext?.signIn ?? (async () => ({ error: 'Auth unavailable.' }));

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (user.is_admin) {
      navigate('/admin-dashboard', { replace: true });
      return;
    }
    if (user.user_type === 'agency') {
      navigate('/agency-dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user) {
        if (result.user.is_admin || result.user.user_type === 'agency') {
          return;
        }
        setError('This portal is for administrators and verified agencies only. Use the main sign-in for your account type.');
        await authContext?.signOut?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo / badge */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Staff portal</h1>
          <p className="text-white/40 text-sm mt-1">Admins and verified agencies — Domestic Connect</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/70 text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/30 h-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/70 text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/30 h-12 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || loading}
            className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold text-base"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8">
          Authorised personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
