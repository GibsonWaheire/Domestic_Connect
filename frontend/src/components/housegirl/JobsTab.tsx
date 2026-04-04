import { useEffect, useState } from 'react';
import { Briefcase, Lock, MapPin, CheckCircle2, Loader2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { PESAPAL_PENDING_KEY } from '@/components/employer/UnlockModal';

interface JobsTabProps {
  user: any;
}

const accommodationLabel: Record<string, string> = {
  live_in: 'Live-in',
  live_out: 'Live-out',
  both: 'Live-in / Live-out',
};

const statusBadge: Record<string, { label: string; className: string }> = {
  pending:  { label: 'Pending',  className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  reviewed: { label: 'Reviewed', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  accepted: { label: 'Accepted', className: 'bg-green-50 text-green-700 border-green-200' },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-200' },
};

const JobsTab = ({ user }: JobsTabProps) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [paying, setPaying] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Cover letter modal
  const [modalJob, setModalJob] = useState<any | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // My Applications
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) {
      fetchJobs();
      fetchMyApplications();
    }
  }, [hasAccess]);

  const authHeaders = async () => {
    const token = await FirebaseAuthService.getIdToken().catch(() => null);
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const checkAccess = async () => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/payments/job-access-status`, { headers });
      const data = await res.json();
      setHasAccess(data.has_access === true);
    } catch {
      setHasAccess(false);
    } finally {
      setCheckingAccess(false);
    }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/jobs/?per_page=50`, { headers });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch {
      toast({ title: 'Error loading jobs', variant: 'destructive' });
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchMyApplications = async () => {
    setLoadingApps(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/jobs/my-applications`, { headers });
      if (res.ok) {
        const data = await res.json();
        const apps: any[] = data.applications || [];
        setMyApplications(apps);
        setAppliedJobIds(new Set(apps.map((a: any) => a.job_id)));
      }
    } catch {
      // silently ignore
    } finally {
      setLoadingApps(false);
    }
  };

  const handlePayForAccess = async () => {
    setPaying(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/payments/purchase`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ package_id: 'job_access', amount: 100 }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Payment error', description: data.error || 'Please try again.', variant: 'destructive' });
        return;
      }
      const redirectUrl: string = data.redirect_url || '';
      try {
        const parsed = new URL(redirectUrl);
        if (!parsed.hostname.endsWith('pesapal.com')) throw new Error('Invalid redirect');
      } catch {
        toast({ title: 'Invalid payment URL', variant: 'destructive' });
        return;
      }
      localStorage.setItem(PESAPAL_PENDING_KEY, JSON.stringify({
        order_tracking_id: data.order_tracking_id,
        package_id: 'job_access',
        redirect_after: '/housegirl-dashboard',
      }));
      window.location.href = redirectUrl;
    } catch {
      toast({ title: 'Payment initiation failed', variant: 'destructive' });
    } finally {
      setPaying(false);
    }
  };

  const openApplyModal = (job: any) => {
    setModalJob(job);
    setCoverLetter('');
  };

  const handleSubmitApplication = async () => {
    if (!modalJob) return;
    setSubmitting(true);
    try {
      const headers = await authHeaders();
      const res = await fetch(`${API_BASE_URL}/api/jobs/${modalJob.id}/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ cover_letter: coverLetter }),
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedJobIds(prev => new Set([...prev, modalJob.id]));
        setMyApplications(prev => [{
          id: data.id,
          job_id: modalJob.id,
          job_title: modalJob.title,
          job_location: modalJob.location,
          job_salary_min: modalJob.salary_min,
          job_salary_max: modalJob.salary_max,
          cover_letter: coverLetter,
          status: 'pending',
          applied_at: new Date().toISOString(),
        }, ...prev]);
        toast({ title: 'Application submitted!', description: 'Good luck!' });
        setModalJob(null);
      } else if (res.status === 400 && data.error?.includes('already applied')) {
        setAppliedJobIds(prev => new Set([...prev, modalJob.id]));
        toast({ title: 'Already applied', description: 'You have already applied to this job.' });
        setModalJob(null);
      } else {
        toast({ title: 'Could not apply', description: data.error || 'Please try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error applying', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-5">
            <Lock className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Unlock All Job Listings</h3>
          <p className="text-gray-500 text-sm mb-1">
            Pay <span className="font-bold text-[#111]">KSh 100</span> once to access all job postings from verified families across Kenya.
          </p>
          <p className="text-gray-400 text-xs mb-6">One-time payment. No recurring fees.</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            {['Browse 100+ active job listings', 'Apply directly to employers', 'Jobs in Nairobi, Mombasa, Kisumu & more', 'Direct contact — no agency cut'].map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>

          <Button
            onClick={handlePayForAccess}
            disabled={paying}
            className="w-full rounded-full bg-[#111] hover:bg-[#333] text-white h-12 text-base font-semibold"
          >
            {paying ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processing...</> : 'Pay KSh 100 — Unlock Jobs'}
          </Button>
          <p className="text-xs text-gray-400 mt-3">Secure payment via M-Pesa, card or bank through Pesapal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Available Jobs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Available Jobs</h3>
            <p className="text-sm text-gray-500 mt-0.5">{jobs.length} listing{jobs.length !== 1 ? 's' : ''} found</p>
          </div>
          <Button onClick={fetchJobs} variant="outline" size="sm" disabled={loadingJobs}>
            {loadingJobs ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>

        {loadingJobs ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-14">
              <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="font-medium text-gray-700 mb-1">No job listings yet</h3>
              <p className="text-sm text-gray-400">Check back soon — employers post new jobs regularly.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const applied = appliedJobIds.has(job.id);
              return (
                <Card key={job.id} className="border-gray-200 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">{job.title}</CardTitle>
                      <span className="shrink-0 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full border border-green-200">
                        Active
                      </span>
                    </div>
                    <CardDescription className="flex flex-wrap gap-2 mt-1 text-xs">
                      {job.location && <span className="flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                      {(job.salary_min || job.salary_max) && (
                        <span>💰 KSh {(job.salary_min || 0).toLocaleString()}{job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}/mo</span>
                      )}
                      {job.accommodation_type && <span>🏠 {accommodationLabel[job.accommodation_type] || job.accommodation_type}</span>}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {job.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                    )}
                    {job.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills_required.slice(0, 4).map((s: string) => (
                          <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{job.applications_count || 0} applicant{job.applications_count !== 1 ? 's' : ''}</span>
                      <Button
                        size="sm"
                        onClick={() => !applied && openApplyModal(job)}
                        disabled={applied}
                        className={`rounded-full text-xs px-4 ${applied ? 'bg-green-600 hover:bg-green-600' : 'bg-[#111] hover:bg-[#333]'} text-white`}
                      >
                        {applied ? '✓ Applied' : 'Apply Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* My Applications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-900">My Applications</h3>
          {myApplications.length > 0 && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">{myApplications.length}</span>
          )}
        </div>

        {loadingApps ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : myApplications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">You haven't applied to any jobs yet.</p>
              <p className="text-xs text-gray-400 mt-1">Browse available listings above and hit Apply Now.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {myApplications.map((app) => {
              const sb = statusBadge[app.status] || { label: app.status, className: 'bg-gray-100 text-gray-600 border-gray-200' };
              return (
                <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{app.job_title || 'Job'}</p>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                      {app.job_location && <span className="flex items-center gap-1"><MapPin size={10} />{app.job_location}</span>}
                      {(app.job_salary_min || app.job_salary_max) && (
                        <span>KSh {(app.job_salary_min || 0).toLocaleString()}{app.job_salary_max ? ` – ${app.job_salary_max.toLocaleString()}` : '+'}</span>
                      )}
                    </div>
                    {app.cover_letter && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 italic">"{app.cover_letter}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Applied {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <Badge className={`shrink-0 border text-xs ${sb.className}`}>{sb.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cover Letter Modal */}
      <Dialog open={!!modalJob} onOpenChange={(open) => { if (!open) setModalJob(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply — {modalJob?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-sm text-gray-600 flex flex-wrap gap-3">
              {modalJob?.location && <span className="flex items-center gap-1"><MapPin size={12} />{modalJob.location}</span>}
              {(modalJob?.salary_min || modalJob?.salary_max) && (
                <span>💰 KSh {(modalJob?.salary_min || 0).toLocaleString()}{modalJob?.salary_max ? ` – ${modalJob.salary_max.toLocaleString()}` : '+'}/mo</span>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 resize-none"
                rows={4}
                placeholder="Introduce yourself and explain why you're a great fit for this role..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalJob(null)} disabled={submitting}>Cancel</Button>
            <Button
              onClick={handleSubmitApplication}
              disabled={submitting}
              className="bg-[#111] hover:bg-[#333] text-white"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</> : 'Submit Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobsTab;
