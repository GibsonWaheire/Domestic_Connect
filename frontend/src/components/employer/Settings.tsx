import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Shield, Upload, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import { useNotificationActions } from '@/hooks/useNotificationActions';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { uploadPhoto } from '@/lib/photoUpload';
import { KENYA_CITIES } from '@/constants/employer';

interface SettingsProps {
  stats: {
    activeJobs: number;
  };
  profileData?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    location?: string;
    phone?: string;
    profile_photo_url?: string;
    company_name?: string;
    description?: string;
  } | null;
}

export const Settings = ({ stats: _stats, profileData }: SettingsProps) => {
  const { user, signOut } = useAuth();
  const { showSuccessNotification, showErrorNotification } = useNotificationActions();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [location, setLocation] = useState((user as { location?: string } | null)?.location || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [profilePhoto, setProfilePhoto] = useState((user as { profile_photo_url?: string } | null)?.profile_photo_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const authProvider = localStorage.getItem('dc_auth_provider');
  const isGoogleAuth = authProvider === 'google';

  const applyProfileData = (data: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    location?: string;
    phone?: string;
    profile_photo_url?: string;
    company_name?: string;
    description?: string;
  }) => {
    const fullName = (data.full_name || '').trim();
    const [firstFromFull = '', ...rest] = fullName.split(' ');
    const lastFromFull = rest.join(' ').trim();
    setFirstName(data.first_name || firstFromFull || '');
    setLastName(data.last_name || lastFromFull || '');
    setLocation(data.location || '');
    setPhone(data.phone || '');
    setProfilePhoto(data.profile_photo_url || '');
    setCompanyName(data.company_name || '');
    setCompanyDescription(data.description || '');
  };

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (profileData) {
      applyProfileData(profileData);
      hasInitialized.current = true;
    }
  }, [profileData]);

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

  const handleProfilePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingPhoto(true);
    try {
      const photoUrl = await uploadPhoto(file, user.id);
      setProfilePhoto(photoUrl);
      // Auto-save immediately with the fresh URL (don't read from state, use local var)
      setIsSavingPhoto(true);
      try {
        const token = await FirebaseAuthService.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/employers/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ profile_photo_url: photoUrl }),
        });
        if (response.ok) {
          showSuccessNotification('Photo saved', 'Your profile photo has been updated.');
        } else {
          showErrorNotification('Save failed', 'Please try again.');
        }
      } finally {
        setIsSavingPhoto(false);
      }
    } catch {
      showErrorNotification('Upload failed', 'Please try again.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSavePhotoOnly = async () => {
    if (!user || !profilePhoto) return;
    setIsSavingPhoto(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/employers/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ profile_photo_url: profilePhoto }),
      });
      if (response.ok) {
        showSuccessNotification('Photo saved', 'Your profile photo has been updated.');
      } else {
        showErrorNotification('Save failed', 'Please try again.');
      }
    } catch {
      showErrorNotification('Save failed', 'Please try again.');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeletingAccount(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      await fetch(`${API_BASE_URL}/api/employers/${user.id}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      await signOut();
    } catch {
      showErrorNotification('Delete failed', 'Please try again.');
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
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
          company_name: companyName.trim(),
          description: companyDescription.trim(),
          location: location.trim(),
          phone: phone.trim(),
          profile_photo_url: profilePhoto || null,
        }),
      });

      if (response.ok) {
        const freshRes = await fetch(`${API_BASE_URL}/api/employers/${user.id}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          applyProfileData(freshData);
        }
        showSuccessNotification('Profile saved', 'Your employer profile has been saved and verified.');
      } else {
        showErrorNotification('Failed to save profile', 'Please try again.');
      }
    } catch {
      showErrorNotification('Failed to save profile', 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
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

    setIsUpdatingPassword(true);
    try {
      await FirebaseAuthService.updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      showSuccessNotification('Password Updated', 'Your password has been changed successfully.');
    } catch (error: any) {
      showErrorNotification('Update Failed', error.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6" id="employer-settings-root">
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
          {/* Name row */}
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

          {/* Company Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Company Name</label>
            <Input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-300"
              placeholder="e.g. Acme Household Services"
            />
          </div>

          {/* Location dropdown */}
          <div id="employer-location">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
            >
              <option value="">Select city</option>
              {KENYA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Phone</label>
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-300"
              placeholder="07xx xxx xxx"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
            <Input
              value={user?.email || ''}
              readOnly
              className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed"
            />
          </div>

          {/* Company Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Company Description</label>
            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
              placeholder="Brief description of your household / company..."
            />
          </div>

          {/* Profile Photo */}
          <div id="employer-photo" className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">Profile Photo</label>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="h-16 w-16 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-sm text-gray-500 shrink-0">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Employer profile" className="h-full w-full object-cover" />
                ) : (
                  <span>Avatar</span>
                )}
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                {isUploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isUploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePhotoChange} disabled={isUploadingPhoto} />
              </label>
              {profilePhoto && (
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSavePhotoOnly}
                  disabled={isSavingPhoto}
                >
                  {isSavingPhoto ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {isSavingPhoto ? 'Saving...' : 'Save Photo'}
                </Button>
              )}
            </div>
          </div>

          <Button
            className="bg-slate-900 hover:bg-slate-800 text-white"
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : 'Save Profile'}
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
                    disabled={isUpdatingPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowNewPassword((value) => !value)}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    disabled={isUpdatingPassword}
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
                    disabled={isUpdatingPassword}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    disabled={isUpdatingPassword}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="hover:bg-green-50 hover:border-green-300" 
                onClick={handlePasswordChange}
                disabled={isUpdatingPassword}
                id="change-password-button"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : 'Change Password'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-white border border-red-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Deleting your account will permanently remove your employer profile and all data. This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </Button>
          ) : (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50 space-y-3">
              <p className="text-sm font-medium text-red-800">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingAccount}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                  ) : 'Yes, Delete My Account'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
