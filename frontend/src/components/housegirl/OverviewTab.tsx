import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/apiConfig';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { User } from '@/lib/authUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Briefcase, Clock, DollarSign, Edit, MapPin, RefreshCw, Search, Settings } from 'lucide-react';

interface JobOpportunity {
  id: string;
  title: string;
  location: string;
  salary: string;
  postedDate: string;
  description: string;
  requirements: string[];
}

interface OverviewTabProps {
  user: User;
  resolvedUserId: string;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenJobs: () => void;
}

const OverviewTab = ({ user, resolvedUserId, onOpenProfile, onOpenSettings, onOpenJobs }: OverviewTabProps) => {
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const fetchJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const token = await FirebaseAuthService.getIdToken().catch(() => null);
      const res = await fetch(`${API_BASE_URL}/api/jobs/?per_page=6`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        const jobs: JobOpportunity[] = (data.jobs || []).map((job: any) => ({
          id: job.id,
          title: job.title || 'Job Opening',
          location: job.location || '',
          salary: job.salary_min || job.salary_max
            ? `KSh ${(job.salary_min || 0).toLocaleString()}${job.salary_max ? ` – ${job.salary_max.toLocaleString()}` : '+'}`
            : '',
          postedDate: job.created_at ? new Date(job.created_at).toLocaleDateString() : '',
          description: job.description || '',
          requirements: job.skills_required || [],
        }));
        setJobOpportunities(jobs);
      }
    } catch {
      toast({ title: 'Could not load jobs', variant: 'destructive' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  useEffect(() => {
    const loadProfileStatus = async () => {
      if (!resolvedUserId) return;
      try {
        const token = await FirebaseAuthService.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        setHasProfile(response.ok);
      } catch {
        setHasProfile(null);
      }
    };
    loadProfileStatus();
  }, [resolvedUserId]);

  return (
    <div className="space-y-6">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => fetchJobs(true)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {!hasProfile && hasProfile !== null && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-blue-700 font-medium">
              You haven't completed your professional profile yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4 text-sm">
              Complete your profile to start appearing in employer searches and receive job matches.
              It only takes a few minutes.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={onOpenProfile}>
              Go to Profile Tab
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Available Job Opportunities</CardTitle>
          <CardDescription>Jobs that best match your skills and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading job opportunities...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {jobOpportunities.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No job opportunities available at the moment.</p>
                  <p className="text-sm text-gray-500">Check back later for new opportunities.</p>
                </div>
              ) : (
                jobOpportunities.map((job) => (
                  <Card key={job.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                          {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />{job.salary}/mo</span>}
                          {job.postedDate && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Posted {job.postedDate}</span>}
                        </div>
                        {job.description && <p className="text-gray-600 text-sm line-clamp-2">{job.description}</p>}
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-fit" onClick={onOpenJobs}>
                          Apply in Jobs Tab →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Things you can do to improve your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
              onClick={onOpenProfile}
            >
              <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              <span className="text-xs sm:text-sm">Update Profile</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
              onClick={onOpenJobs}
            >
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              <span className="text-xs sm:text-sm">Search Jobs</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 sm:h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
              onClick={onOpenSettings}
            >
              <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <span className="text-xs sm:text-sm">Preferences</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
