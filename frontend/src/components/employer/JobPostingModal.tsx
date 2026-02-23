import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Briefcase, MapPin, DollarSign, FileText, Calendar, Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface JobPostingModalProps {
  showJobModal: boolean;
  setShowJobModal: (show: boolean) => void;
}

export const JobPostingModal = ({ showJobModal, setShowJobModal }: JobPostingModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    workType: 'Lives in',
    experience: '3-5 years'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ 
      title: "Job Posted Successfully", 
      description: "Your job posting has been created and is now live.",
      variant: "default"
    });
    setShowJobModal(false);
    setFormData({
      title: '',
      location: '',
      salary: '',
      description: '',
      requirements: '',
      workType: 'Lives in',
      experience: '3-5 years'
    });
  };

  return (
    <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <span>Post New Job</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Job Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Experienced House Manager"
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Karen, Nairobi"
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Salary Range</label>
              <Input
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g., KES 20,000 - 25,000"
                className="bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Work Type</label>
              <select
                value={formData.workType}
                onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="Lives in">Lives in</option>
                <option value="Day job">Day job</option>
                <option value="Part-time">Part-time</option>
                <option value="Weekend only">Weekend only</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Experience Required</label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
              >
                <option value="0-2 years">0-2 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="6-8 years">6-8 years</option>
                <option value="9-12 years">9-12 years</option>
                <option value="12+ years">12+ years</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Job Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the job responsibilities and what you're looking for..."
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm resize-none"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Requirements</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="List any specific requirements or skills needed..."
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm resize-none"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowJobModal(false)}
              className="hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Post Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
