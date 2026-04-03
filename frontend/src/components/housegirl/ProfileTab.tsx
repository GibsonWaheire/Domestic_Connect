import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Camera, Edit, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toAbsolutePhotoUrl } from '@/lib/photoUtils';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { User } from '@/lib/authUtils';
import EditProfileModal, { EditFormData } from './EditProfileModal';

interface ProfileTabProps {
  user: User;
  resolvedUserId: string;
  profilePhoto: string | null;
  onProfilePhotoChange: (photoUrl: string | null) => void;
}

const salaryToRange = (salary: number): string => {
  if (salary >= 35000) return 'KES 35,000+';
  if (salary >= 30000) return 'KES 30,000 - 35,000';
  if (salary >= 25000) return 'KES 25,000 - 30,000';
  if (salary >= 20000) return 'KES 20,000 - 25,000';
  if (salary >= 15000) return 'KES 15,000 - 20,000';
  if (salary >= 1000) return 'KES 10,000 - 15,000'; // covers any real value incl. corrupted small numbers
  return '';
};

const salaryRangeToNumber = (range: string): number => {
  // Extract the first number, keeping commas so "10,000" parses as 10000 not 10
  const match = range.match(/[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/,/g, ''), 10) || 0;
};

const defaultFormData: EditFormData = {
  bio: '',
  expectedSalary: '',
  location: '',
  experience: '',
  education: '',
  accommodationType: '',
  community: '',
  skills: [],
  languages: '',
  role: '',
  age: '',
};

const ProfileTab = ({ user, resolvedUserId, profilePhoto, onProfilePhotoChange }: ProfileTabProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>(defaultFormData);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!resolvedUserId) return;
      try {
        const token = await FirebaseAuthService.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!response.ok) return;
        const result = await response.json();
        const apiPhoto = toAbsolutePhotoUrl(result?.profile_photo_url || result?.photo_url);
        const apiSkills = Array.isArray(result?.skills) ? result.skills : [];
        const apiLanguages = Array.isArray(result?.languages) ? result.languages : [];
        if (apiPhoto) {
          onProfilePhotoChange(apiPhoto);
        }
        setEditFormData({
          bio: result?.bio || '',
          expectedSalary: result?.expected_salary ? salaryToRange(Number(result.expected_salary)) : '',
          location: result?.location || result?.current_location || '',
          experience: result?.experience || '',
          education: result?.education || '',
          accommodationType: result?.accommodation_type || '',
          community: result?.tribe || '',
          skills: apiSkills,
          languages: apiLanguages.join(', '),
          role: result?.role || '',
          age: result?.age ? String(result.age) : '',
        });
      } catch {
        setEditFormData(defaultFormData);
      }
    };
    loadProfileData();
  }, [resolvedUserId, onProfilePhotoChange]);

  const userData = useMemo(() => {
    const normalizedLanguages = (editFormData.languages || '')
      .split(',')
      .map((language) => language.trim())
      .filter(Boolean);

    return {
      age: editFormData.age || String(user?.age || ''),
      location: editFormData.location || user?.location || '',
      experience: editFormData.experience || user?.experience || '',
      education: editFormData.education || user?.education || '',
      expectedSalary: editFormData.expectedSalary || user?.expectedSalary || '',
      accommodationType: editFormData.accommodationType || user?.accommodationType || '',
      community: editFormData.community || user?.community || '',
      skills: editFormData.skills.length > 0 ? editFormData.skills : (user?.skills || []),
      languages: normalizedLanguages.length > 0 ? normalizedLanguages : (user?.languages || []),
      bio: editFormData.bio || user?.bio || '',
    };
  }, [editFormData, user]);

  const handleFormChange = (field: keyof EditFormData, value: string) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSkillToggle = (skill: string) => {
    setEditFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((current) => current !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image (JPEG, PNG, etc.)', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Maximum size is 5 MB', variant: 'destructive' });
      return;
    }
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPendingPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!pendingFile || !user) return;
    if (!resolvedUserId) return;
    setIsSavingPhoto(true);
    try {
      const { uploadPhoto } = await import('@/lib/photoUpload');
      const photoUrl = await uploadPhoto(pendingFile, user.id);

      // Optimistically update UI
      onProfilePhotoChange(photoUrl);
      setPendingFile(null);
      setPendingPreview(null);

      const token = await FirebaseAuthService.getIdToken();
      const saveRes = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ profile_photo_url: photoUrl }),
      });
      if (!saveRes.ok) throw new Error('Failed to save photo');

      const verifyRes = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (verifyRes.ok) {
        const saved = await verifyRes.json();
        const confirmedUrl = toAbsolutePhotoUrl(saved.profile_photo_url || saved.photo_url);
        if (confirmedUrl) onProfilePhotoChange(confirmedUrl);
      }

      toast({ title: 'Photo saved', description: 'Your profile photo has been updated and will show to employers.' });
    } catch {
      toast({
        title: 'Save failed',
        description: 'Photo could not be saved. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!resolvedUserId) return;

    const requiredFields = [
      { key: 'role', label: 'Role' },
      { key: 'location', label: 'Location' },
      { key: 'expectedSalary', label: 'Expected Salary' },
      { key: 'experience', label: 'Experience' },
      { key: 'accommodationType', label: 'Work type' },
    ] as const;
    const missing = requiredFields.filter((field) => !editFormData[field.key]);
    if (missing.length > 0) {
      toast({
        title: 'Please fill in all required fields',
        description: missing.map((field) => field.label).join(', '),
        variant: 'destructive',
      });
      return;
    }

    setIsSavingProfile(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const normalizedLanguages = (editFormData.languages || '')
        .split(',')
        .map((language) => language.trim())
        .filter(Boolean);
      const numericRate = salaryRangeToNumber(editFormData.expectedSalary);

      const response = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
          role: editFormData.role,
          skills: editFormData.skills,
          languages: normalizedLanguages,
          expected_salary: numericRate,
          monthly_rate: numericRate,
          bio: editFormData.bio,
          location: editFormData.location,
          current_location: editFormData.location,
          experience: editFormData.experience,
          education: editFormData.education,
          accommodation_type: editFormData.accommodationType,
          tribe: editFormData.community,
          age: editFormData.age ? Number(editFormData.age) : null,
          profile_photo_url: profilePhoto || null,
        }),
      });

      if (!response.ok) {
        throw new Error('save failed');
      }

      const freshResponse = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const saved = freshResponse.ok
        ? await freshResponse.json()
        : await response.json().catch(() => ({}));

      const savedSkills = Array.isArray(saved?.skills) ? saved.skills : editFormData.skills;
      const savedLanguages = Array.isArray(saved?.languages) ? saved.languages : normalizedLanguages;
      setEditFormData({
        bio: saved?.bio || editFormData.bio,
        expectedSalary: saved?.expected_salary ? salaryToRange(Number(saved.expected_salary)) : editFormData.expectedSalary,
        location: saved?.location || editFormData.location,
        experience: saved?.experience || editFormData.experience,
        education: saved?.education || editFormData.education,
        accommodationType: saved?.accommodation_type || editFormData.accommodationType,
        community: saved?.tribe || editFormData.community,
        skills: savedSkills,
        languages: savedLanguages.join(', '),
        role: saved?.role || editFormData.role,
        age: saved?.age ? String(saved.age) : editFormData.age,
      });
      if (saved?.profile_photo_url) {
        onProfilePhotoChange(toAbsolutePhotoUrl(saved.profile_photo_url) || saved.profile_photo_url);
      }
      setShowEditModal(false);
      toast({
        title: 'Profile saved',
        description: 'Your profile has been updated successfully.',
      });
    } catch {
      toast({
        title: 'Failed to save. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Photo Card (completely separate from profile form) ────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Profile Photo</CardTitle>
          <CardDescription>
            This photo is shown to employers. Upload a clear, real photo of yourself.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Preview: pending new photo, or current saved photo, or placeholder */}
          <div className="w-44 h-44 rounded-xl overflow-hidden border-4 border-gray-200 shadow-md bg-pink-50 flex items-center justify-center">
            {(pendingPreview || profilePhoto) ? (
              <img
                src={pendingPreview || profilePhoto!}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect width="100" height="100" fill="#fce7f3" />
                <ellipse cx="50" cy="32" rx="16" ry="18" fill="#f9a8d4" />
                <rect x="30" y="30" width="40" height="10" rx="5" fill="#be185d" />
                <rect x="42" y="49" width="16" height="8" rx="4" fill="#f9a8d4" />
                <ellipse cx="50" cy="72" rx="22" ry="18" fill="#ec4899" />
              </svg>
            )}
          </div>

          {pendingPreview && (
            <p className="text-sm text-blue-600 font-medium">New photo ready — click Save Photo to confirm</p>
          )}

          {/* Hidden file input */}
          <input
            ref={photoFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoFileSelect}
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => photoFileInputRef.current?.click()}
              disabled={isSavingPhoto}
            >
              <Camera className="h-4 w-4 mr-2" />
              {profilePhoto || pendingPreview ? 'Change Photo' : 'Choose Photo'}
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSavePhoto}
              disabled={!pendingFile || isSavingPhoto}
            >
              {isSavingPhoto ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Photo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Profile Information Card ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Profile Information</CardTitle>
              <CardDescription>Manage your profile details and preferences</CardDescription>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowEditModal(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Update Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{user.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Age</label>
                    <p className="text-gray-900">{userData.age || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Community</label>
                    <p className="text-gray-900">{userData.community || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Work Preferences</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preferred Location</label>
                    <p className="text-gray-900">{userData.location || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience Level</label>
                    <p className="text-gray-900">{userData.experience || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Education</label>
                    <p className="text-gray-900">{userData.education || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Expected Salary</label>
                    <p className="text-gray-900">{userData.expectedSalary || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Accommodation</label>
                    <p className="text-gray-900">{userData.accommodationType || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">About You</h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {userData.bio || 'No bio added yet.'}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills & Languages</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.length > 0 ? userData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-blue-100 text-blue-800">
                        {skill}
                      </Badge>
                    )) : (
                      <p className="text-sm text-gray-500">No skills selected.</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {userData.languages.length > 0 ? userData.languages.map((language) => (
                      <Badge key={language} variant="outline" className="bg-green-100 text-green-800">
                        {language}
                      </Badge>
                    )) : (
                      <p className="text-sm text-gray-500">No languages added.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* ── End Profile Information Card ──────────────────────────────────── */}

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700 mt-0.5" />
          <p className="text-sm text-amber-800">
            Keep your profile up to date to improve visibility in employer searches.
          </p>
        </CardContent>
      </Card>

      <EditProfileModal
        open={showEditModal}
        data={editFormData}
        isSaving={isSavingProfile}
        onClose={() => setShowEditModal(false)}
        onChange={handleFormChange}
        onSkillToggle={handleSkillToggle}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default ProfileTab;
