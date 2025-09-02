import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, Eye, Edit, Trash2, Plus, TrendingUp, Users, Calendar
} from 'lucide-react';
import { JobPosting } from '@/types/employer';
import { useNotificationActions } from '@/hooks/useNotificationActions';

interface JobsProps {
  jobPostings: JobPosting[];
  setShowJobModal: (show: boolean) => void;
}

export const Jobs = ({ jobPostings, setShowJobModal }: JobsProps) => {
  const { showInfoNotification } = useNotificationActions();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobPostings.map((job) => (
          <Card key={job.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {job.salary}
                  </div>
                </div>
                <Badge className={getStatusColor(job.status)}>
                  {getStatusLabel(job.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{job.applications}</p>
                      <p className="text-gray-500">Applications</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">{job.views}</p>
                      <p className="text-gray-500">Views</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>Posted {job.postedDate}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    onClick={() => {
                      showInfoNotification(
                        "View Job", 
                        "Job details feature coming soon!"
                      );
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-green-50 hover:border-green-300 transition-colors"
                    onClick={() => {
                      showInfoNotification(
                        "Edit Job", 
                        "Job editing feature coming soon!"
                      );
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                    onClick={() => {
                      showInfoNotification(
                        "Delete Job", 
                        "Job deletion feature coming soon!"
                      );
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {jobPostings.length === 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Postings Yet</h3>
            <p className="text-gray-600 mb-4">Create your first job posting to start attracting housegirls</p>
            <Button
              onClick={() => setShowJobModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
