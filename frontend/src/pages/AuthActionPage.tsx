import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verifyResetCode, confirmReset, applyEmailActionCode } from '@/lib/firebaseAuth';

type Stage = 'loading' | 'reset-form' | 'success' | 'error';

const AuthActionPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [stage, setStage] = useState<Stage>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!oobCode) { setStage('error'); return; }

    if (mode === 'resetPassword') {
      verifyResetCode(oobCode)
        .then(userEmail => { setEmail(userEmail); setStage('reset-form'); })
        .catch(() => setStage('error'));
    } else if (mode === 'verifyEmail') {
      applyEmailActionCode(oobCode)
        .then(() => setStage('success'))
        .catch(() => setStage('error'));
    } else {
      setStage('error');
    }
  }, [mode, oobCode]);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setSubmitting(true);
    try {
      await confirmReset(oobCode!, password);
      setStage('success');
    } catch {
      setError('Could not reset your password. The link may have expired — request a new one.');
    } finally {
      setSubmitting(false);
    }
  };

  const leftPanel = (
    <div className="hidden md:flex flex-col justify-between w-[45%] bg-[#111] text-white p-12 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />
      <div className="relative z-10 flex flex-col items-start gap-6">
        <Link to="/" className="text-2xl font-bold tracking-tight text-white hover:opacity-90 transition-all duration-200">
          Domestic Connect
        </Link>
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mt-12 w-full max-w-sm">
          Find trusted house help across Kenya
        </h1>
        <div className="flex flex-col gap-6 mt-12">
          {['Verified profiles', 'Trusted by 1,000+ families', 'Safe & secure'].map((text) => (
            <div key={text} className="flex items-center gap-4">
              <div className="rounded-full bg-white/10 p-1.5 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="font-medium text-lg text-white/90">{text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative z-10 mt-auto pt-16">
        <Link to="/" className="text-white/60 hover:text-white transition-all duration-200 text-sm font-medium">
          ← Back to Home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDF6F0] font-sans text-[#111]">
      {leftPanel}

      <div className="flex-1 flex flex-col w-full md:w-[55%] min-h-screen">
        {/* Mobile header */}
        <div className="md:hidden p-5 text-center bg-[#111] border-b border-gray-800 shadow-sm flex items-center mb-6">
          <Link to="/" className="text-xl font-bold tracking-tight text-white mx-auto">
            Domestic Connect
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 md:p-12 w-full">
          <div className="w-full max-w-[400px] mx-auto">

            {/* Loading */}
            {stage === 'loading' && (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-gray-500">Verifying link…</p>
              </div>
            )}

            {/* Reset password form */}
            {stage === 'reset-form' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Set new password</h2>
                  {email && (
                    <p className="mt-1 text-sm text-gray-500">for <span className="text-gray-700 font-medium">{email}</span></p>
                  )}
                </div>

                <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
                  <div>
                    <Label htmlFor="password" className="block text-sm font-semibold text-[#111] mb-2">
                      New password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="At least 8 characters"
                        className="w-full border border-gray-200 bg-white rounded-xl h-12 shadow-sm focus-visible:ring-1 focus-visible:ring-[#111] transition-all duration-200 pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm" className="block text-sm font-semibold text-[#111] mb-2">
                      Confirm password
                    </Label>
                    <Input
                      id="confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                      placeholder="Repeat password"
                      className="w-full border border-gray-200 bg-white rounded-xl h-12 shadow-sm focus-visible:ring-1 focus-visible:ring-[#111] transition-all duration-200"
                    />
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 font-medium shadow-sm">
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 mt-0.5">⚠️</span>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#111] text-white rounded-xl h-12 text-base font-semibold hover:bg-black transition-all duration-200 shadow-md"
                  >
                    {submitting ? 'Saving…' : 'Set new password'}
                  </Button>
                </form>
              </>
            )}

            {/* Success */}
            {stage === 'success' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {mode === 'verifyEmail' ? 'Email verified!' : 'Password updated!'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {mode === 'verifyEmail'
                      ? 'Your email has been verified. You can now sign in.'
                      : 'Your password has been changed. Sign in with your new password.'}
                  </p>
                </div>
                <div className="rounded-xl border border-green-200 bg-green-50/80 px-4 py-4 text-sm text-green-700 font-medium shadow-sm mb-6">
                  {mode === 'verifyEmail' ? '✅ Email successfully verified.' : '✅ Password successfully updated.'}
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#111] text-white rounded-xl h-12 text-base font-semibold hover:bg-black transition-all duration-200 shadow-md"
                >
                  Go to sign in →
                </Button>
              </>
            )}

            {/* Error */}
            {stage === 'error' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Link expired or invalid</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    This link has already been used or has expired.
                  </p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-700 font-medium shadow-sm mb-6">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <span>Request a new link from the sign in page.</span>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-[#111] text-white rounded-xl h-12 text-base font-semibold hover:bg-black transition-all duration-200 shadow-md"
                >
                  Back to sign in
                </Button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthActionPage;
