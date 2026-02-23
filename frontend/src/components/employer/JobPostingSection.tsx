import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, CheckCircle } from 'lucide-react';

interface JobPostingSectionProps {
  onPostJob: () => void;
  postedJobs: Array<{
    id: number;
    title: string;
    location: string;
    salary: string;
    postedDate: string;
    applications: number;
  }>;
}

const JobPostingSection = ({ onPostJob, postedJobs }: JobPostingSectionProps) => {
  return (
    <>
      {/* Job Posting Section */}
      <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">Post a Job Opportunity</h2>
              <p className="text-green-600 text-sm">Find the perfect house help for your family</p>
            </div>
            <Button 
              onClick={onPostJob}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Reach qualified candidates</span>
            </div>
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Quick response time</span>
            </div>
            <div className="flex items-center space-x-4 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Only KES 100</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                M-Pesa Payment
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posted Jobs Section */}
      <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-purple-800 mb-2">Your Posted Jobs</h2>
              <p className="text-purple-600 text-sm">Manage and track your job postings</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {postedJobs.length} Active Jobs
            </Badge>
          </div>
          
          {postedJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-purple-800 mb-2">No jobs posted yet</h3>
              <p className="text-purple-600 mb-4">Post your first job to start finding qualified house help</p>
              <Button 
                onClick={onPostJob}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Post Your First Job
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {postedJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{job.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <span>📍 {job.location}</span>
                        </span>
                        <span className="flex items-center">
                          <span>💰 {job.salary}</span>
                        </span>
                        <span className="flex items-center">
                          <span>⏰ Posted {job.postedDate}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {job.applications} Applications
                      </Badge>
                      <Button variant="outline" size="sm">
                        👁️ View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default JobPostingSection;
