import { useEffect, useState } from 'react';
import { useRealTimeData } from '@/hooks/useRealTimeData';
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/apiConfig';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { User } from '@/lib/authUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Briefcase, Clock, DollarSign, Edit, MapPin, RefreshCw, Search, Settings } from 'lucide-react';

interface JobOpportunity {
  id: string;
  title: string;
  location: string;
  salary: string;
  postedDate: string;
  employer: string;
  description: string;
  requirements: string[];
  matchScore: number;
}

interface OverviewTabProps {
  user: User;
  resolvedUserId: string;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

const OverviewTab = ({ user, resolvedUserId, onOpenProfile, onOpenSettings }: OverviewTabProps) => {
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const {
    dashboardData,
    loading,
    error,
    refreshing,
    lastUpdated,
    refreshData,
  } = useRealTimeData({
    refreshInterval: 30000,
    enabled: !!user,
  });

  useEffect(() => {
    if (dashboardData?.available_data.job_opportunities) {
      const transformedJobs: JobOpportunity[] = dashboardData.available_data.job_opportunities.map((job) => ({
        id: job.id,
        title: job.title,
        location: job.location,
        salary: `KSh ${job.salary_min?.toLocaleString() || '0'} - ${job.salary_max?.toLocaleString() || '0'}`,
        postedDate: new Date(job.created_at).toLocaleDateString(),
        employer: job.employer?.name || 'Unknown Employer',
        description: job.description,
        requirements: job.skills_required || [],
        matchScore: 0,
      }));
      setJobOpportunities(transformedJobs);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Data Sync Error',
        description: 'Failed to sync latest data. Some information may be outdated.',
        variant: 'destructive',
      });
    }
  }, [error]);

  useEffect(() => {
    const loadProfileStatus = async () => {
      if (!resolvedUserId) return;
      try {
        const token = await FirebaseAuthService.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/housegirls/${resolvedUserId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        setHasProfile(response.ok);
      } catch {
        setHasProfile(null);
      }
    };
    loadProfileStatus();
  }, [resolvedUserId]);

  const handleApplyNow = (jobTitle: string) => {
    toast({
      title: 'Application Started',
      description: `Application flow for ${jobTitle} is being prepared.`,
    });
  };

  const handleSaveJob = (jobTitle: string) => {
    toast({
      title: 'Job Saved',
      description: `${jobTitle} has been saved to your shortlist.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="outline" onClick={() => refreshData(false)} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      {lastUpdated && (
        <p className="text-xs text-gray-500">Last updated: {lastUpdated.toLocaleTimeString()}</p>
      )}

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
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {job.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            {job.salary}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Posted {job.postedDate}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm">{job.description}</p>
                        <p className="text-sm text-gray-600">
                          <strong>Employer:</strong> {job.employer}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 flex-1"
                            onClick={() => handleApplyNow(job.title)}
                          >
                            Apply Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSaveJob(job.title)}
                          >
                            Save
                          </Button>
                        </div>
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
              onClick={() => toast({ title: 'Search Jobs', description: 'Browse open opportunities in your dashboard list.' })}
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
