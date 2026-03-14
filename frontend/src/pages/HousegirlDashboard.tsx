import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Home, LogOut, MessageCircle, Settings, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthEnhanced';
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

const HousegirlDashboard = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'messages' | 'settings'>('overview');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

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
    const loadPhoto = async () => {
      try {
        const token = await FirebaseAuthService.getIdToken();
        const res = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) {
          const data = await res.json();
          const photoUrl = data.profile_photo_url || data.photo_url || null;
          if (photoUrl) setProfilePhoto(photoUrl);
        }
      } catch {}
    };
    loadPhoto();
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
                👩 Housegirl Account
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <UserAvatar
              src={profilePhoto}
              name={`${user.first_name || ''} ${user.last_name || ''}`}
              size="lg"
              className="border-2 border-gray-100"
            />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">My Profile</p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-blue-600 font-medium"
                onClick={() => setActiveTab('profile')}
              >
                Edit Details
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6 flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'messages', label: 'Messages', icon: MessageCircle },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as 'overview' | 'profile' | 'messages' | 'settings')}
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
        {activeTab === 'messages' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Messages</CardTitle>
              <CardDescription>Communicate with potential employers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 mb-4">
                  When employers contact you about job opportunities, you will see their messages here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default HousegirlDashboard;
