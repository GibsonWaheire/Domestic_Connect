import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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
    if (!oobCode) {
      setStage('error');
      return;
    }

    if (mode === 'resetPassword') {
      verifyResetCode(oobCode)
        .then(userEmail => {
          setEmail(userEmail);
          setStage('reset-form');
        })
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

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Domestic Connect</h1>
          <p className="text-gray-400 text-sm mt-1">domestic-connect.co.ke</p>
        </div>

        {/* Loading */}
        {stage === 'loading' && (
          <div className="text-center py-8">
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Verifying link…</p>
          </div>
        )}

        {/* Reset password form */}
        {stage === 'reset-form' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Set new password</h2>
            {email && (
              <p className="text-sm text-gray-400 mb-6">for <span className="text-gray-600">{email}</span></p>
            )}
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-gray-600">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="At least 8 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm" className="text-sm text-gray-600">Confirm password</Label>
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat password"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? 'Saving…' : 'Set new password'}
              </Button>
            </form>
          </>
        )}

        {/* Success */}
        {stage === 'success' && (
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {mode === 'verifyEmail' ? 'Email verified!' : 'Password updated!'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {mode === 'verifyEmail'
                ? 'Your email has been verified. You can now sign in.'
                : 'Your password has been changed. You can now sign in with your new password.'}
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to sign in
            </Button>
          </div>
        )}

        {/* Error */}
        {stage === 'error' && (
          <div className="text-center py-4">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Link expired or invalid</h2>
            <p className="text-gray-500 text-sm mb-6">
              This link has already been used or has expired. Request a new one.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Back to sign in
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthActionPage;
