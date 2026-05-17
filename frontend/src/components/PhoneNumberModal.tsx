import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { User } from '@/lib/authUtils';

interface PhoneNumberModalProps {
  user: User;
  onSaved: (phone: string) => void;
  onDismiss?: () => void;
}

const PhoneNumberModal = ({ user, onSaved, onDismiss }: PhoneNumberModalProps) => {
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    const cleaned = phone.trim().replace(/[\s\-()]/g, '');
    if (!cleaned) { setError('Phone number is required.'); return; }
    if (!/^(\+254|254|0)[17]\d{8}$/.test(cleaned)) {
      setError('Enter a valid Kenyan phone number (e.g. 0712345678).');
      return;
    }

    setSaving(true);
    try {
      const token = await FirebaseAuthService.getIdToken().catch(() => null);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const isHousegirl = user.user_type === 'housegirl';
      const url = isHousegirl
        ? `${API_BASE_URL}/api/housegirls/${user.id}`
        : `${API_BASE_URL}/api/employers/${user.id}`;
      const body = isHousegirl ? { phone_number: cleaned } : { phone: cleaned };

      const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(body) });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'This phone number is already registered to another account.');
        return;
      }
      if (!res.ok) {
        setError('Could not save. Please try again.');
        return;
      }
      onSaved(cleaned);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const description = user.user_type === 'housegirl'
    ? 'Your phone number is required so employers can contact you. It stays hidden until they unlock your profile.'
    : 'Add your phone number so we can keep you updated on workers you contact.';

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-sm [&>button.absolute]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <DialogHeader>
          <DialogTitle>Add Your Phone Number</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-500">{description}</p>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 0712 345 678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
        >
          {saving ? 'Saving...' : 'Save Phone Number'}
        </Button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors text-center mt-1"
          >
            I'll update this in my profile later
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PhoneNumberModal;
