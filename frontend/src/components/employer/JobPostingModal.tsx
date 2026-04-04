import { Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { KENYA_CITIES, SKILLS_OPTIONS, EXPERIENCE_OPTIONS, WORK_TYPE_OPTIONS, EDUCATION_OPTIONS } from '@/constants/employer';

interface JobFormData {
  title: string;
  description: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  workType: string;
  experience: string;
  education: string;
  skills: string[];
  deadline: string;
}

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  formData: JobFormData;
  setFormData: (data: JobFormData) => void;
  isEditing: boolean;
}

export const JobPostingModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  formData,
  setFormData,
  isEditing,
}: JobPostingModalProps) => {
  const set = (field: keyof JobFormData, value: string | string[]) =>
    setFormData({ ...formData, [field]: value });

  const toggleSkill = (skill: string) => {
    const current = formData.skills || [];
    set('skills', current.includes(skill) ? current.filter(s => s !== skill) : [...current, skill]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-700" />
            {isEditing ? 'Edit Job Posting' : 'Post a New Job'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Job Title *</label>
            <Input
              value={formData.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g., Experienced House Manager"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Job Description *</label>
            <textarea
              value={formData.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe the role, duties, and what you're looking for…"
              rows={4}
              required
              className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Location *</label>
              <select
                value={formData.location}
                onChange={e => set('location', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                <option value="">Select city…</option>
                {KENYA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Work Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Work Type *</label>
              <select
                value={formData.workType}
                onChange={e => set('workType', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                <option value="">Select type…</option>
                {WORK_TYPE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Salary Min */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Min Salary (KSh) *</label>
              <Input
                type="number"
                value={formData.salaryMin}
                onChange={e => set('salaryMin', e.target.value)}
                placeholder="e.g. 15000"
                min="0"
                required
              />
            </div>

            {/* Salary Max */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Max Salary (KSh) *</label>
              <Input
                type="number"
                value={formData.salaryMax}
                onChange={e => set('salaryMax', e.target.value)}
                placeholder="e.g. 25000"
                min="0"
                required
              />
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Experience Required</label>
              <select
                value={formData.experience}
                onChange={e => set('experience', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                <option value="">Any experience</option>
                {EXPERIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Education Required</label>
              <select
                value={formData.education}
                onChange={e => set('education', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-white"
              >
                <option value="">Any education</option>
                {EDUCATION_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Deadline */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Application Deadline</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={e => set('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Skills Required
              {formData.skills?.length > 0 && (
                <span className="ml-2 text-xs text-gray-400">({formData.skills.length} selected)</span>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_OPTIONS.map(skill => {
                const selected = formData.skills?.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      selected
                        ? 'bg-[#111] text-white border-[#111]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#111] hover:bg-[#333] text-white">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEditing ? 'Saving…' : 'Posting…'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {isEditing ? 'Save Changes' : 'Post Job'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
