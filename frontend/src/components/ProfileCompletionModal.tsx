import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';

interface ProfileCompletionModalProps {
  userId: string;
  onComplete: (phone: string) => void;
}

const ProfileCompletionModal = ({ userId, onComplete }: ProfileCompletionModalProps) => {
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const trimmed = phone.trim();
    if (!trimmed) {
      setError('Phone number is required.');
      return;
    }
    // Basic Kenyan phone validation
    const cleaned = trimmed.replace(/[\s\-()]/g, '');
    const validPhone = /^(\+254|254|0)[17]\d{8}$/.test(cleaned);
    if (!validPhone) {
      setError('Enter a valid Kenyan phone number (e.g. 0712345678).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const token = await FirebaseAuthService.getIdToken();
      const res = await fetch(`${API_BASE_URL}/api/housegirls/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phone_number: trimmed }),
      });
      if (!res.ok) throw new Error('Failed to save');
      onComplete(trimmed);
    } catch {
      setError('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-5">
        <div className="text-center space-y-1">
          <div className="text-4xl">📞</div>
          <h2 className="text-xl font-bold text-gray-900">One last step</h2>
          <p className="text-sm text-gray-500">
            Add your phone number so employers can reach you after unlocking your profile.
            This is required to appear in search results.
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="e.g. 0712 345 678"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
              <span>⚠️</span> {error}
            </p>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-black hover:bg-gray-900 text-white rounded-xl h-11 font-semibold"
        >
          {saving ? 'Saving...' : 'Save & Continue'}
        </Button>

        <p className="text-xs text-center text-gray-400">
          Your number is hidden until an employer pays to unlock your profile.
        </p>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
