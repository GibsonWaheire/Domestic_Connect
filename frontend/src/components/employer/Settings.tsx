import { ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Shield, Upload, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';

interface SettingsProps {
  stats: {
    activeJobs: number;
  };
}

export const Settings = ({ stats: _stats }: SettingsProps) => {
  const { user } = useAuth();
  const { showSuccessNotification, showErrorNotification, showInfoNotification } = useNotificationActions();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [location, setLocation] = useState((user as { location?: string } | null)?.location || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [profilePhoto, setProfilePhoto] = useState((user as { profile_photo_url?: string } | null)?.profile_photo_url || '');
  const [isSaving, setIsSaving] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const authProvider = localStorage.getItem('dc_auth_provider');
  const isGoogleAuth = authProvider === 'google';

  useEffect(() => {
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setLocation((user as { location?: string } | null)?.location || '');
    setPhone(user?.phone_number || '');
    setProfilePhoto((user as { profile_photo_url?: string } | null)?.profile_photo_url || '');
  }, [user]);

  useEffect(() => {
    if (window.location.hash === '#employer-first-name') {
      document.getElementById('employer-first-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (window.location.hash === '#employer-last-name') {
      document.getElementById('employer-last-name')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (window.location.hash === '#employer-location') {
      document.getElementById('employer-location')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (window.location.hash === '#employer-photo') {
      document.getElementById('employer-photo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setProfilePhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/employers/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          full_name: `${firstName} ${lastName}`.trim(),
          location: location.trim(),
          phone: phone.trim(),
          profile_photo_url: profilePhoto || null,
        }),
      });

      if (response.ok) {
        await fetch(`${API_BASE_URL}/api/employers/${user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        showSuccessNotification('Profile saved', 'Your employer profile has been saved.');
      } else {
        showErrorNotification('Failed to save profile', 'Please try again.');
      }
    } catch {
      showErrorNotification('Failed to save profile', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = () => {
    if (!newPassword || !confirmPassword) {
      showErrorNotification('Missing Fields', 'Enter and confirm your new password.');
      return;
    }

    if (newPassword.length < 8) {
      showErrorNotification('Weak Password', 'New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorNotification('Password Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setNewPassword('');
    setConfirmPassword('');
    showInfoNotification('Password Updated', 'Your password has been changed.');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span>Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div id="employer-first-name">
              <label className="text-sm font-medium text-gray-700 mb-2 block">First Name</label>
              <Input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                placeholder="First name"
              />
            </div>
            <div id="employer-last-name">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</label>
              <Input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                placeholder="Last name"
              />
            </div>
          </div>

          <div id="employer-location">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-300"
              placeholder="Nairobi, Kenya"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Phone</label>
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-300"
              placeholder="07xx xxx xxx"
            />
          </div>

          <div id="employer-photo" className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Profile Photo (optional)</label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Employer profile" className="h-full w-full object-cover" />
                ) : (
                  <span>Avatar</span>
                )}
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                Upload
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} />
              </label>
            </div>
          </div>

          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white"
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <span>Account Security</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isGoogleAuth ? (
            <p className="text-sm text-gray-700">You signed in with Google. No password needed.</p>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">New Password</label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-300 pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword((value) => !value)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm New Password</label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-300 pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button variant="outline" className="hover:bg-green-50 hover:border-green-300" onClick={handlePasswordChange}>
                Change Password
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
