import { useEffect, useState } from 'react';
import { Lock, Phone, Mail, XCircle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UnlockModal, PESAPAL_PENDING_KEY } from '@/components/employer/UnlockModal';
import { MessageThread } from '@/components/employer/MessageThread';

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
  const [openChatId, setOpenChatId] = useState<string | null>(null);

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
      const res = await fetch(
        `${API_BASE_URL}/api/employers/jobs/${jobId}/applied-housegirls`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        setAppliedHousegirls(data.applied_housegirls || []);
      } else {
        const err = await res.json();
        toast({ title: 'Error loading applicants', description: err.error || 'Please try again.', variant: 'destructive' });
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
      const { package_id, job_id: pendingJobId, housegirl_id: pendingHousegirlId } = JSON.parse(raw);
      if (package_id === 'apply_contact_unlock' && pendingJobId === jobId) {
        localStorage.removeItem(PESAPAL_PENDING_KEY);
        toast({ title: 'Payment received!', description: 'Contact details are now unlocked.' });
        await fetchAppliedHousegirls();
        const unlockedHg = appliedHousegirls.find(hg => hg.housegirl_id === pendingHousegirlId);
        if (unlockedHg) {
          setSelectedHousegirl(unlockedHg);
          setIsUnlockModalOpen(true);
        }
      }
    } catch {
      localStorage.removeItem(PESAPAL_PENDING_KEY);
    }
  };

  const handleUnlockClick = (housegirl: AppliedHousegirl) => {
    setSelectedHousegirl(housegirl);
    setIsUnlockModalOpen(true);
  };

  const toggleChat = (housegirlId: string) => {
    setOpenChatId(prev => (prev === housegirlId ? null : housegirlId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Applicants
          {!loading && appliedHousegirls.length > 0 && (
            <Badge className="ml-2 bg-gray-100 text-gray-700 border-0">{appliedHousegirls.length}</Badge>
          )}
        </h2>
        {!loading && appliedHousegirls.length > 0 && (
          <p className="text-xs text-gray-400">Pay KSh 200 per applicant to reveal contact details</p>
        )}
      </div>

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
          <CardContent className="text-center py-12">
            <XCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No one has applied to this job yet.</p>
            <p className="text-xs text-gray-400 mt-1">Share your job posting to attract applicants.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appliedHousegirls.map(housegirl => {
            const name = `${housegirl.public_profile.first_name} ${housegirl.public_profile.last_name}`;
            const initials = `${housegirl.public_profile.first_name?.[0] ?? ''}${housegirl.public_profile.last_name?.[0] ?? ''}`;
            const isChatOpen = openChatId === housegirl.housegirl_id;

            return (
              <Card
                key={housegirl.housegirl_id}
                className={`overflow-hidden transition-shadow ${isChatOpen ? 'shadow-md' : 'hover:shadow-md'}`}
              >
                <CardContent className="p-0">
                  {/* Profile row */}
                  <div className="flex items-start gap-4 p-4">
                    <Avatar className="w-14 h-14 flex-shrink-0 border">
                      <AvatarImage src={housegirl.public_profile.profile_photo_url} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base leading-tight">{name}</CardTitle>
                          {housegirl.public_profile.experience && (
                            <CardDescription className="text-xs mt-0.5">
                              {housegirl.public_profile.experience} experience
                            </CardDescription>
                          )}
                        </div>
                        {housegirl.contact_unlocked && (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs flex-shrink-0">
                            Unlocked
                          </Badge>
                        )}
                      </div>

                      {housegirl.public_profile.bio && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                          {housegirl.public_profile.bio}
                        </p>
                      )}

                      {housegirl.public_profile.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {housegirl.public_profile.skills.slice(0, 4).map(s => (
                            <span key={s} className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact section */}
                  <div className="border-t mx-4" />
                  <div className="px-4 py-3">
                    {housegirl.contact_unlocked ? (
                      <div className="space-y-2">
                        {/* Actual contact details */}
                        {housegirl.contact_details.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="h-3.5 w-3.5 text-green-500" />
                            <span className="font-medium">{housegirl.contact_details.phone_number}</span>
                          </div>
                        )}
                        {housegirl.contact_details.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="h-3.5 w-3.5 text-green-500" />
                            <span className="font-medium">{housegirl.contact_details.email}</span>
                          </div>
                        )}
                        {!housegirl.contact_details.phone_number && !housegirl.contact_details.email && (
                          <p className="text-xs text-gray-400">No contact details on file.</p>
                        )}

                        {/* Message button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full rounded-lg text-xs border-gray-200 hover:bg-gray-50"
                          onClick={() => toggleChat(housegirl.housegirl_id)}
                        >
                          <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                          {isChatOpen ? 'Hide Chat' : 'Message Applicant'}
                          {isChatOpen
                            ? <ChevronUp className="h-3 w-3 ml-1.5" />
                            : <ChevronDown className="h-3 w-3 ml-1.5" />
                          }
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        {/* Redacted contact info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Phone className="h-3.5 w-3.5" />
                            <span className="tracking-widest select-none">07•• ••• •••</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="tracking-widest select-none">••••@•••.com</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleUnlockClick(housegirl)}
                          className="rounded-lg text-xs px-3 bg-[#111] hover:bg-[#333] text-white flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Lock className="h-3 w-3" />
                          Unlock — KSh 200
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Inline chat panel */}
                  {isChatOpen && housegirl.contact_unlocked && (
                    <div className="border-t px-4 pb-4 pt-3">
                      <MessageThread
                        jobId={jobId}
                        housegirlId={housegirl.housegirl_id}
                        housegirlName={name}
                        myId={employerId}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedHousegirl && (
        <UnlockModal
          isOpen={isUnlockModalOpen}
          onClose={() => {
            setIsUnlockModalOpen(false);
            setSelectedHousegirl(null);
            fetchAppliedHousegirls();
          }}
          housegirlId={selectedHousegirl.housegirl_id}
          housegirlName={`${selectedHousegirl.public_profile.first_name} ${selectedHousegirl.public_profile.last_name}`}
          jobId={jobId}
          onPaymentInitiated={() => {}}
          onContactUnlocked={fetchAppliedHousegirls}
        />
      )}
    </div>
  );
};

export default AppliedHousegirlsList;
