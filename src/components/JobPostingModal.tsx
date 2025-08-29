import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { X, Plus, Briefcase, MapPin, DollarSign, Users, Clock, FileText } from 'lucide-react';

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

interface JobFormData {
  title: string;
  location: string;
  salary: string;
  salaryType: 'monthly' | 'daily' | 'hourly';
  accommodation: 'provided' | 'not-provided' | 'negotiable';
  jobType: 'full-time' | 'part-time' | 'live-in' | 'live-out';
  experience: 'entry' | 'intermediate' | 'experienced';
  education: 'none' | 'primary' | 'secondary' | 'college';
  requirements: string[];
  description: string;
  startDate: string;
  contactPhone: string;
  contactEmail: string;
}

const JobPostingModal = ({ isOpen, onClose, user }: JobPostingModalProps) => {
  const { user: authUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newRequirement, setNewRequirement] = useState('');

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    location: '',
    salary: '',
    salaryType: 'monthly',
    accommodation: 'not-provided',
    jobType: 'full-time',
    experience: 'entry',
    education: 'none',
    requirements: [],
    description: '',
    startDate: '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || ''
  });

  const handleInputChange = (field: keyof JobFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !formData.requirements.includes(newRequirement.trim())) {
      handleInputChange('requirements', [...formData.requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    handleInputChange('requirements', formData.requirements.filter(r => r !== requirement));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.location || !formData.salary || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting has been published and is now visible to candidates.",
      });

      // Reset form and close modal
      setFormData({
        title: '',
        location: '',
        salary: '',
        salaryType: 'monthly',
        accommodation: 'not-provided',
        jobType: 'full-time',
        experience: 'entry',
        education: 'none',
        requirements: [],
        description: '',
        startDate: '',
        contactPhone: user?.phone || '',
        contactEmail: user?.email || ''
      });
      setCurrentStep(1);
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.title || !formData.location || !formData.salary)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive"
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step < currentStep ? '✓' : step}
            </div>
            {step < 3 && (
              <div className={`w-12 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Basic Job Information</h3>
        <p className="text-gray-600">Tell us about the position you're offering</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Live-in House Help, Part-time Cleaner"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="e.g., Westlands, Nairobi"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary">Salary *</Label>
            <Input
              id="salary"
              placeholder="e.g., 15,000"
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="salaryType">Salary Type</Label>
            <Select value={formData.salaryType} onValueChange={(value: 'monthly' | 'daily' | 'hourly') => handleInputChange('salaryType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="jobType">Job Type</Label>
            <Select value={formData.jobType} onValueChange={(value: 'full-time' | 'part-time' | 'live-in' | 'live-out') => handleInputChange('jobType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="live-in">Live-in</SelectItem>
                <SelectItem value="live-out">Live-out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="accommodation">Accommodation</Label>
            <Select value={formData.accommodation} onValueChange={(value: 'provided' | 'not-provided' | 'negotiable') => handleInputChange('accommodation', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="provided">Provided</SelectItem>
                <SelectItem value="not-provided">Not Provided</SelectItem>
                <SelectItem value="negotiable">Negotiable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Requirements & Qualifications</h3>
        <p className="text-gray-600">Specify what you're looking for in a candidate</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="experience">Experience Level</Label>
            <Select value={formData.experience} onValueChange={(value: 'entry' | 'intermediate' | 'experienced') => handleInputChange('experience', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                <SelectItem value="experienced">Experienced (5+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="education">Education</Label>
            <Select value={formData.education} onValueChange={(value: 'none' | 'primary' | 'secondary' | 'college') => handleInputChange('education', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Formal Education</SelectItem>
                <SelectItem value="primary">Primary School</SelectItem>
                <SelectItem value="secondary">Secondary School</SelectItem>
                <SelectItem value="college">College/University</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Specific Requirements</Label>
          <div className="mt-2 space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., Cooking skills, Childcare experience"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
              />
              <Button type="button" onClick={addRequirement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.requirements.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.requirements.map((req, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{req}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(req)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="startDate">Preferred Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Job Description & Contact</h3>
        <p className="text-gray-600">Provide detailed information about the role</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Job Description *</Label>
          <Textarea
            id="description"
            placeholder="Describe the job responsibilities, working conditions, and any other important details..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={6}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              placeholder="Phone number for inquiries"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="Email for inquiries"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Posting Fee: KES 100</h4>
                <p className="text-sm text-blue-700">
                  Your job will be visible to qualified candidates for 30 days. 
                  Payment will be processed via M-Pesa after you submit the form.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Post a Job Opportunity
          </DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentStep < 3 ? (
              <Button onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting Job...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Post Job (KES 100)</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingModal;
