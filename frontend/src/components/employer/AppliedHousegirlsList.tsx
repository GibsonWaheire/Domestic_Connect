import { useEffect, useState } from 'react';
import { Briefcase, MapPin, Loader2, Phone, Mail, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import UnlockModal, { PESAPAL_PENDING_KEY } from '@/components/employer/UnlockModal';

interface AppliedHousegirlsListProps {
  jobId: string;
  employerId: string;
}

interface AppliedHousegirl {
  application_id: string;
  housegirl_id: string;
  public_profile: {
    first_name: string;
    last_name: string;
    bio: string;
    experience: string;
    education: string;
    skills: string[];
    languages: string[];
    profile_photo_url: string;
  };
  contact_unlocked: boolean;
  contact_details: {
    email: string | null;
    phone_number: string | null;
  };
}

const AppliedHousegirlsList = ({ jobId, employerId }: AppliedHousegirlsListProps) => {
  const [appliedHousegirls, setAppliedHousegirls] = useState<AppliedHousegirl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHousegirl, setSelectedHousegirl] = useState<AppliedHousegirl | null>(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  useEffect(() => {
    fetchAppliedHousegirls();
    checkPendingUnlock();
  }, [jobId]);

  const authHeaders = async () => {
    const token = await FirebaseAuthService.getIdToken().catch(() => null);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchAppliedHousegirls = async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/employers/jobs/${jobId}/applied-housegirls`, { headers });
      if (res.ok) {
        const data = await res.json();
        setAppliedHousegirls(data.applied_housegirls || []);
      } else {
        const errorData = await res.json();
        toast({ title: 'Error loading applicants', description: errorData.error || 'Please try again.', variant: 'destructive' });
      }
    } catch (e: any) {
      toast({ title: 'Error loading applicants', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const checkPendingUnlock = async () => {
    const raw = localStorage.getItem(PESAPAL_PENDING_KEY);
    if (!raw) return;
    try {
      const { order_tracking_id, package_id, job_id: pendingJobId, housegirl_id: pendingHousegirlId, redirect_after } = JSON.parse(raw);
      // Only process if this is related to a contact unlock payment for this job
      if (package_id === 'apply_contact_unlock' && pendingJobId === jobId) {
        localStorage.removeItem(PESAPAL_PENDING_KEY);
        // We don't need to re-initiate anything, just refetch to update status
        toast({ title: 'Payment received!', description: 'Contact details unlocked.' });
        fetchAppliedHousegirls();
        // Optionally, find the housegirl and set them as selected if the modal should reopen
        const unlockedHg = appliedHousegirls.find(hg => hg.housegirl_id === pendingHousegirlId);
        if (unlockedHg) {
          setSelectedHousegirl(unlockedHg);
          setIsUnlockModalOpen(true);
        }
      }
    } catch (e: any) {
      console.error('Error checking pending unlock:', e);
      localStorage.removeItem(PESAPAL_PENDING_KEY);
    }
  };

  const handleUnlockClick = (housegirl: AppliedHousegirl) => {
    setSelectedHousegirl(housegirl);
    setIsUnlockModalOpen(true);
    setPaymentInitiated(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Applicants for Job {jobId}</h2>
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex-row items-center gap-4">
                <Avatar className="w-12 h-12 bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : appliedHousegirls.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <XCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No housegirls have applied to this job yet.</p>
            <p className="text-xs text-gray-400 mt-1">Share your job posting to attract applicants.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {appliedHousegirls.map((housegirl) => (
            <Card key={housegirl.housegirl_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex-row items-center gap-4 pb-2">
                <Avatar className="w-16 h-16 border">
                  <AvatarImage src={housegirl.public_profile.profile_photo_url} />
                  <AvatarFallback>{housegirl.public_profile.first_name?.[0]}{housegirl.public_profile.last_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">
                    {housegirl.public_profile.first_name} {housegirl.public_profile.last_name}
                  </CardTitle>
                  {housegirl.public_profile.experience && (
                    <CardDescription className="text-sm text-gray-500 mt-0.5">
                      {housegirl.public_profile.experience} Experience
                    </CardDescription>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                {housegirl.public_profile.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{housegirl.public_profile.bio}</p>
                )}
                {housegirl.public_profile.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {housegirl.public_profile.skills.slice(0, 4).map((s: string) => (
                      <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  {housegirl.contact_unlocked ? (
                    <Button
                      size="sm"
                      // onClick={() => handleMessageHousegirl(housegirl.housegirl_id)} // Placeholder for future messaging
                      className="rounded-full text-xs px-4 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Message Housegirl
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleUnlockClick(housegirl)}
                      className="rounded-full text-xs px-4 bg-[#111] hover:bg-[#333] text-white"
                    >
                      Unlock Contact (KSh 100)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedHousegirl && (
        <UnlockModal
          isOpen={isUnlockModalOpen}
          onClose={() => {
            setIsUnlockModalOpen(false);
            setSelectedHousegirl(null);
            fetchAppliedHousegirls(); // Refresh after modal closes
          }}
          housegirlId={selectedHousegirl.housegirl_id}
          housegirlName={`${selectedHousegirl.public_profile.first_name} ${selectedHousegirl.public_profile.last_name}`}
          jobId={jobId}
          onPaymentInitiated={() => setPaymentInitiated(true)}
          onContactUnlocked={fetchAppliedHousegirls}
        />
      )}
    </div>
  );
};

export default AppliedHousegirlsList;
