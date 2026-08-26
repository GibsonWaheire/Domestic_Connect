import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Camera, Heart, Home, LogOut, MessageCircle, Settings, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthEnhanced';
import PhoneNumberModal from '@/components/PhoneNumberModal';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ReturnToHome from '@/components/ReturnToHome';
import UserAvatar from '@/components/ui/UserAvatar';
import OverviewTab from '@/components/housegirl/OverviewTab';
import ProfileTab from '@/components/housegirl/ProfileTab';
import SettingsTab from '@/components/housegirl/SettingsTab';
import JobsTab from '@/components/housegirl/JobsTab';
import { toAbsolutePhotoUrl } from '@/lib/photoUtils';
import ProfileCompletionWall from '@/components/ProfileCompletionWall';

const statusStyles: Record<string, string> = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const HousegirlMessages = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await FirebaseAuthService.getIdToken().catch(() => null);
        const res = await fetch(`${API_BASE_URL}/api/jobs/my-applications`, {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications || []);
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          My Applications
        </CardTitle>
        <CardDescription>Status updates for jobs you have applied to</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-7 h-7 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-14 w-14 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-700 mb-1">No applications yet</h3>
            <p className="text-sm text-gray-500">Apply to jobs from the Jobs tab and track their status here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div key={app.id} className="rounded-xl border border-gray-200 bg-white p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{app.job_title || 'Job Opening'}</p>
                  {app.job_location && <p className="text-xs text-gray-500 mt-0.5">{app.job_location}</p>}
                  {app.cover_letter && (
                    <p className="text-xs text-gray-400 italic mt-1.5 line-clamp-2">"{app.cover_letter}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${statusStyles[app.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {app.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const HousegirlDashboard = () => {
  const { user, signOut, loading, patchUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'jobs' | 'messages' | 'settings'>('overview');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<Record<string, any> | null>(null);
  const [showCompletionWall, setShowCompletionWall] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPhotoReminder, setShowPhotoReminder] = useState(false);
  const photoReminderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phoneConfirmedRef = useRef(false);

  const isProfileComplete = (data: Record<string, unknown>): boolean => {
    // Primary: backend sets this flag once all required fields are saved — never re-prompt
    if (data.profile_complete === true) return true;
    // Fallback for legacy users (no flag yet): check non-gated fields only
    // (phone_number is gated and can return '' even for own profile — skip it)
    return !!(
      data.experience &&
      data.location &&
      data.accommodation_type &&
      data.expected_salary &&
      Array.isArray(data.skills) && (data.skills as string[]).length > 0
    );
  };

  const resolvedUserId =
    user?.id ||
    ((user as { uid?: string; firebase_uid?: string } | null)?.uid
      ? `user_${(user as { uid?: string; firebase_uid?: string } | null)?.uid}`
      : (user as { uid?: string; firebase_uid?: string } | null)?.firebase_uid
        ? `user_${(user as { uid?: string; firebase_uid?: string } | null)?.firebase_uid}`
        : '');

  useEffect(() => {
    if (!loading && user) {
      if (user.user_type !== 'housegirl' && !user.is_admin) {
        toast({
          title: 'Access Denied',
          description: 'This dashboard is only accessible to housegirls.',
          variant: 'destructive',
        });
        if (user.user_type === 'employer') navigate('/employer-dashboard');
        else if (user.user_type === 'agency') navigate('/agency-dashboard');
        else navigate('/');
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && (!user || user.user_type !== 'housegirl')) {
      navigate('/housegirls');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!resolvedUserId) return;
    const loadProfileData = async () => {
      try {
        const token = await FirebaseAuthService.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);

          // Phone is highest priority — gate everything else behind it
          if (data.phone_number) {
            phoneConfirmedRef.current = true;
          }
          if (!data.phone_number && !phoneConfirmedRef.current) {
            setShowPhoneModal(true);
            return;
          }
          setShowPhoneModal(false);

          const photoUrl = toAbsolutePhotoUrl(data.profile_photo_url || data.photo_url);
          if (photoUrl) {
            setProfilePhoto(photoUrl);
          } else {
            // No photo — show reminder after 5 seconds (once per session)
            const reminderKey = `photo_reminder_shown_${resolvedUserId}`;
            if (!sessionStorage.getItem(reminderKey)) {
              photoReminderTimerRef.current = setTimeout(() => {
                setShowPhotoReminder(true);
                sessionStorage.setItem(reminderKey, '1');
              }, 5000);
            }
          }
          if (!isProfileComplete(data)) {
            setShowCompletionWall(true);
          }
        }
      } catch {}
    };
    loadProfileData();
    return () => {
      if (photoReminderTimerRef.current) clearTimeout(photoReminderTimerRef.current);
    };
  }, [resolvedUserId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/housegirls');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.user_type !== 'housegirl') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {showPhoneModal && user && (
        <PhoneNumberModal
          user={user}
          onSaved={(phone) => {
            phoneConfirmedRef.current = true;
            setShowPhoneModal(false);
            patchUser({ phone_number: phone });
          }}
        />
      )}

      {showCompletionWall && resolvedUserId && (
        <ProfileCompletionWall
          userId={resolvedUserId}
          user={user}
          onComplete={() => {
            setShowCompletionWall(false);
            toast({ title: 'Profile saved!', description: 'You are now visible to employers.' });
          }}
        />
      )}

      {/* Profile photo reminder popup */}
      {showPhotoReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in zoom-in-95 duration-300">
            {/* Close button */}
            <button
              onClick={() => setShowPhotoReminder(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="bg-blue-50 rounded-full p-4">
                <Camera className="h-10 w-10 text-blue-600" />
              </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Add your profile photo
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Employers are <span className="font-semibold text-gray-700">3× more likely</span> to contact housegirls with a clear profile photo. Upload yours to stand out!
            </p>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-semibold"
                onClick={() => {
                  setShowPhotoReminder(false);
                  setActiveTab('profile');
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo Now
              </Button>
              <button
                onClick={() => setShowPhotoReminder(false)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center py-1"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 border border-gray-200 bg-white rounded-lg">
                  <Heart className="h-5 w-5 text-gray-700" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 ml-2">Domestic Connect</h1>
              </div>
              <ReturnToHome variant="outline" size="sm" className="border-blue-300 text-blue-600 hover:bg-blue-50 hidden sm:flex" />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border border-gray-200 text-xs">
                {user.user_type}
              </Badge>
              <span className="text-sm text-gray-600 hidden sm:block">Karibu, {user.first_name}</span>
              <Button variant="outline" onClick={handleSignOut} className="border-gray-300 hover:bg-gray-100 p-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.first_name ? `Welcome, ${user.first_name}` : 'Welcome!'}
              </h2>
              <span className="bg-green-50 text-green-700 rounded-full px-3 py-1 text-xs font-medium border border-green-200 shadow-sm flex items-center">
                {(() => {
                  const cat = profileData?.category || (user as any)?.category || '';
                  if (!cat) return '👷 Worker Account';
                  if (cat.includes('Gardener')) return '🌿 Gardener Account';
                  if (cat.includes('Gateman') || cat.includes('Security')) return '🛡️ Security Account';
                  if (cat.includes('Nurse') || cat.includes('Caregiver')) return '💊 Caregiver Account';
                  if (cat.includes('Daily') || cat.includes('Casual')) return '📋 Casual Worker Account';
                  return '🧹 Housegirl Account';
                })()}
              </span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm" />
        </div>

        <div className="mb-6 flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
            { id: 'messages', label: 'Messages', icon: MessageCircle },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 text-xs sm:text-sm ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-blue-600'}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <OverviewTab
            user={user}
            resolvedUserId={resolvedUserId}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenSettings={() => setActiveTab('settings')}
            onOpenJobs={() => setActiveTab('jobs')}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileTab
            user={user}
            resolvedUserId={resolvedUserId}
            profilePhoto={profilePhoto}
            onProfilePhotoChange={setProfilePhoto}
          />
        )}
        {activeTab === 'jobs' && <JobsTab user={user} />}
        {activeTab === 'messages' && <HousegirlMessages />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default HousegirlDashboard;
