import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  AGE_OPTIONS,
  COMMUNITY_OPTIONS,
  EXPERIENCE_OPTIONS,
  KENYA_CITIES,
  LANGUAGE_OPTIONS,
  ROLE_OPTIONS,
  SALARY_RANGES,
  SKILLS_OPTIONS,
  WORK_TYPE_OPTIONS,
} from '@/lib/constants/housegirl';

export interface EditFormData {
  firstName: string;
  lastName: string;
  bio: string;
  expectedSalary: string;
  location: string;
  experience: string;
  education: string;
  accommodationType: string;
  community: string;
  skills: string[];
  languages: string;
  role: string;
  age: string;
  phone: string;
}

interface EditProfileModalProps {
  open: boolean;
  data: EditFormData;
  isSaving: boolean;
  onClose: () => void;
  onChange: (field: keyof EditFormData, value: string) => void;
  onSkillToggle: (skill: string) => void;
  onSave: () => void;
}

const EditProfileModal = ({
  open,
  data,
  isSaving,
  onClose,
  onChange,
  onSkillToggle,
  onSave,
}: EditProfileModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-5">

            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g. Grace"
                  value={data.firstName || ''}
                  onChange={(e) => onChange('firstName', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g. Wanjiku"
                  value={data.lastName || ''}
                  onChange={(e) => onChange('lastName', e.target.value)}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                placeholder="e.g., 0712345678"
                value={data.phone || ''}
                onChange={(e) => onChange('phone', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Shown to employers only after they pay to unlock your profile.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  value={data.role || ''}
                  onChange={(e) => onChange('role', e.target.value)}
                >
                  <option value="">Select Role</option>
                  {ROLE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Work Type <span className="text-red-500">*</span></label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  value={data.accommodationType || ''}
                  onChange={(e) => onChange('accommodationType', e.target.value)}
                >
                  <option value="">Select Work Type</option>
                  {WORK_TYPE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Experience <span className="text-red-500">*</span></label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  value={data.experience || ''}
                  onChange={(e) => onChange('experience', e.target.value)}
                >
                  <option value="">Select Experience</option>
                  {EXPERIENCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Expected Salary <span className="text-red-500">*</span></label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  value={data.expectedSalary || ''}
                  onChange={(e) => onChange('expectedSalary', e.target.value)}
                >
                  <option value="">Select Salary Range</option>
                  {SALARY_RANGES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Location <span className="text-red-500">*</span></label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  value={data.location || ''}
                  onChange={(e) => onChange('location', e.target.value)}
                >
                  <option value="">Select City</option>
                  {KENYA_CITIES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Age</label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  value={data.age || ''}
                  onChange={(e) => onChange('age', e.target.value)}
                >
                  <option value="">Select Age</option>
                  {AGE_OPTIONS.map((o) => <option key={o} value={o}>{o} years</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Education</label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  value={data.education || ''}
                  onChange={(e) => onChange('education', e.target.value)}
                >
                  <option value="">Select Education</option>
                  {['Primary', 'Class 8+', 'Form 4 and Above', 'Certificate', 'Diploma', 'Degree'].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Community</label>
                <select
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                  value={data.community || ''}
                  onChange={(e) => onChange('community', e.target.value)}
                >
                  <option value="">Select Community</option>
                  {COMMUNITY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Skills</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS_OPTIONS.map((skill) => {
                  const selected = data.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => onSkillToggle(skill)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selected ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Languages — chip select */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Languages Spoken</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const currentLangs = (data.languages || '').split(',').map(l => l.trim()).filter(Boolean);
                  const selected = currentLangs.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        const updated = selected
                          ? currentLangs.filter(l => l !== lang)
                          : [...currentLangs, lang];
                        onChange('languages', updated.join(', '));
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selected ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-sm font-medium text-gray-700">About You</label>
              <textarea
                className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
                rows={4}
                placeholder="Tell employers about yourself..."
                value={data.bio || ''}
                onChange={(e) => onChange('bio', e.target.value)}
              />
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
