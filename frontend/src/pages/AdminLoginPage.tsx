import { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { signInWithEmail, resetPassword } from '@/lib/firebaseAuth';
import { signUpWithEmail } from '@/lib/firebaseAuth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const AdminLoginPage = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [adminExists, setAdminExists] = useState<boolean | null>(null); // null = loading

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Check if an admin account already exists to show/hide signup option
  useEffect(() => {
    fetch('/api/auth/admin-exists', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setAdminExists(d.exists ?? true))
      .catch(() => setAdminExists(true)); // fail-safe: hide signup on error
  }, []);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Enter your email address above, then click Forgot password.');
      return;
    }
    setResetLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch {
      setError('Could not send reset email. Check the address and try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    let firebaseSignedIn = false;
    try {
      const credential = await signInWithEmail(email, password);
      firebaseSignedIn = true;
      const token = await credential.user.getIdToken();

      const res = await fetch('/api/auth/admin-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({}),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        await signOut(auth);
        firebaseSignedIn = false;
        setError(data?.error || 'Sign in failed. Check your credentials.');
        return;
      }

      window.location.href = '/admin-dashboard';
    } catch (err: unknown) {
      if (firebaseSignedIn) { try { await signOut(auth); } catch { /* ignore */ } }
      const code = (err as { code?: string })?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Incorrect email or password.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment before trying again.');
      } else if (code === 'auth/user-disabled') {
        setError('This account has been disabled.');
      } else {
        setError('Sign in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 10) {
      setError('Password must be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    let firebaseSignedIn = false;
    try {
      const credential = await signUpWithEmail(email, password);
      firebaseSignedIn = true;
      const token = await credential.user.getIdToken();

      const res = await fetch('/api/auth/admin-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({}),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        // Delete the Firebase user we just created — it can't be an admin
        try { await credential.user.delete(); } catch { /* ignore */ }
        firebaseSignedIn = false;
        setError(data?.error || 'Account creation failed.');
        return;
      }

      window.location.href = '/admin-dashboard';
    } catch (err: unknown) {
      if (firebaseSignedIn) { try { await signOut(auth); } catch { /* ignore */ } }
      const code = (err as { code?: string })?.code;
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Use the sign-in form.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 10 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError('Account creation failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Badge */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Staff portal</h1>
          <p className="text-white/40 text-sm mt-1">Administrators only — Domestic Connect</p>
        </div>

        {/* Mode tabs — only show signup if no admin exists yet */}
        {adminExists === false && (
          <div className="flex rounded-lg bg-white/5 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'login' ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'signup' ? 'bg-white text-black' : 'text-white/50 hover:text-white/80'}`}
            >
              Create Account
            </button>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-white/70 text-sm font-medium">Email</Label>
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
              <Label htmlFor="password" className="text-white/70 text-sm font-medium">Password</Label>
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
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" disabled={submitting} className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold text-base">
              {submitting ? 'Signing in…' : 'Sign In'}
            </Button>

            {resetSent ? (
              <p className="text-center text-green-400 text-sm">Reset email sent — check your inbox.</p>
            ) : (
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="w-full text-center text-white/30 hover:text-white/60 text-sm transition-colors disabled:opacity-50"
              >
                {resetLoading ? 'Sending…' : 'Forgot password?'}
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400">
              This form can only be used once. After your account is created, this option disappears permanently.
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="su-email" className="text-white/70 text-sm font-medium">Email</Label>
              <Input
                id="su-email"
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
              <Label htmlFor="su-password" className="text-white/70 text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="su-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Min 10 characters"
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

            <div className="space-y-1.5">
              <Label htmlFor="su-confirm" className="text-white/70 text-sm font-medium">Confirm Password</Label>
              <Input
                id="su-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-white/30 h-12"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" disabled={submitting} className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold text-base">
              {submitting ? 'Creating account…' : 'Create Admin Account'}
            </Button>
          </form>
        )}

        <p className="text-center text-white/20 text-xs mt-8">
          Authorised personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
