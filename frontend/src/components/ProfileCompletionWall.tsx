import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FirebaseAuthService } from '@/lib/firebaseAuth';
import { API_BASE_URL } from '@/lib/apiConfig';
import { User } from '@/lib/authUtils';
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

interface ProfileCompletionWallProps {
  userId: string;
  user: User;
  onComplete: () => void;
}

const EDUCATION_OPTIONS = ['Primary', 'Class 8+', 'Form 4 and Above', 'Certificate', 'Diploma', 'Degree'];

const salaryRangeToNumber = (range: string): number => {
  const match = range.match(/[\d,]+/);
  if (!match) return 0;
  return parseInt(match[0].replace(/,/g, ''), 10) || 0;
};

const numberToSalaryRange = (n: number): string => {
  if (!n) return '';
  if (n >= 35000) return 'KES 35,000+';
  if (n >= 30000) return 'KES 30,000 - 35,000';
  if (n >= 25000) return 'KES 25,000 - 30,000';
  if (n >= 20000) return 'KES 20,000 - 25,000';
  if (n >= 15000) return 'KES 15,000 - 20,000';
  if (n >= 1000) return 'KES 10,000 - 15,000';
  return '';
};

const ProfileCompletionWall = ({ userId, user, onComplete }: ProfileCompletionWallProps) => {
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Form state — pre-populated from fetched profile
  const [firstName, setFirstName] = useState(user.first_name || '');
  const [lastName, setLastName] = useState(user.last_name || '');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [accommodationType, setAccommodationType] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [education, setEducation] = useState('');
  const [community, setCommunity] = useState('');
  const [age, setAge] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load existing profile to pre-populate
  useEffect(() => {
    const load = async () => {
      try {
        // Restore unsaved draft first (saved when validation fails mid-save)
        const draftRaw = sessionStorage.getItem(`profile_draft_${userId}`);
        if (draftRaw) {
          try {
            const draft = JSON.parse(draftRaw);
            if (draft.firstName) setFirstName(draft.firstName);
            if (draft.lastName) setLastName(draft.lastName);
            if (draft.phone) setPhone(draft.phone);
            if (draft.role) setRole(draft.role);
            if (draft.location) setLocation(draft.location);
            if (draft.experience) setExperience(draft.experience);
            if (draft.accommodationType) setAccommodationType(draft.accommodationType);
            if (draft.expectedSalary) setExpectedSalary(draft.expectedSalary);
            if (draft.education) setEducation(draft.education);
            if (draft.community) setCommunity(draft.community);
            if (draft.age) setAge(draft.age);
            if (Array.isArray(draft.skills) && draft.skills.length) setSkills(draft.skills);
            if (Array.isArray(draft.languages) && draft.languages.length) setLanguages(draft.languages);
            if (draft.bio) setBio(draft.bio);
          } catch { /* ignore malformed draft */ }
          setLoadingProfile(false);
          return;
        }

        const token = await FirebaseAuthService.getIdToken().catch(() => null);
        const res = await fetch(`${API_BASE_URL}/api/housegirls/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const d = await res.json();
          if (d.first_name) setFirstName(d.first_name);
          if (d.last_name) setLastName(d.last_name);
          if (d.phone_number && d.phone_number !== 'Unlock to view') setPhone(d.phone_number);
          if (d.role) setRole(d.role);
          if (d.location) setLocation(d.location);
          if (d.experience) setExperience(d.experience);
          if (d.accommodation_type) setAccommodationType(d.accommodation_type);
          if (d.expected_salary) setExpectedSalary(numberToSalaryRange(Number(d.expected_salary)));
          if (d.education) setEducation(d.education);
          if (d.tribe) setCommunity(d.tribe);
          if (d.age) setAge(String(d.age));
          if (Array.isArray(d.skills) && d.skills.length) setSkills(d.skills);
          if (Array.isArray(d.languages) && d.languages.length) setLanguages(d.languages);
          if (d.bio) setBio(d.bio);
        }
      } catch { /* ignore */ }
      finally { setLoadingProfile(false); }
    };
    load();
  }, [userId]);

  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const handleSave = async () => {
    setError('');

    // Persist current form state so fields survive a close/reopen if validation fails
    sessionStorage.setItem(`profile_draft_${userId}`, JSON.stringify({
      firstName, lastName, phone, role, location, experience,
      accommodationType, expectedSalary, education, community,
      age, skills, languages, bio,
    }));

    if (!firstName.trim()) { setError('First name is required.'); return; }
    if (!lastName.trim()) { setError('Last name is required.'); return; }

    const cleaned = phone.trim().replace(/[\s\-()]/g, '');
    if (!cleaned) { setError('Phone number is required.'); return; }
    if (!/^(\+254|254|0)[17]\d{8}$/.test(cleaned)) {
      setError('Enter a valid Kenyan phone number (e.g. 0712345678).');
      return;
    }
    if (!role) { setError('Please select your role.'); return; }
    if (!location) { setError('Please select your location.'); return; }
    if (!experience) { setError('Please select your experience level.'); return; }
    if (!accommodationType) { setError('Please select your work type.'); return; }
    if (!expectedSalary) { setError('Please select your expected salary.'); return; }
    if (skills.length === 0) { setError('Please select at least one skill.'); return; }

    setSaving(true);
    try {
      const token = await FirebaseAuthService.getIdToken();
      const numericSalary = salaryRangeToNumber(expectedSalary);

      const res = await fetch(`${API_BASE_URL}/api/housegirls/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          phone_number: cleaned,
          role,
          location,
          current_location: location,
          experience,
          accommodation_type: accommodationType,
          expected_salary: numericSalary,
          monthly_rate: numericSalary,
          education,
          tribe: community,
          age: age ? Number(age) : null,
          skills,
          languages,
          bio,
        }),
      });

      if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'This phone number is already registered to another account.');
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Could not save profile (${res.status}). Please try again.`);
        return;
      }
      sessionStorage.removeItem(`profile_draft_${userId}`);
      onComplete();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const SelectField = ({ label, value, onChange, options, required = false }: {
    label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean;
  }) => (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="">Select {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const ChipGroup = ({ label, items, selected, onToggle, color = 'blue', required = false }: {
    label: string; items: string[]; selected: string[]; onToggle: (v: string) => void; color?: string; required?: boolean;
  }) => {
    const activeClass = color === 'green'
      ? 'bg-green-600 text-white border-green-600'
      : 'bg-blue-600 text-white border-blue-600';
    const hoverClass = color === 'green' ? 'hover:border-green-400' : 'hover:border-blue-400';
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selected.includes(item) ? activeClass : `bg-white text-gray-700 border-gray-300 ${hoverClass}`
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">

          {/* Sticky header */}
          <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
            <div className="text-center">
              <div className="text-3xl mb-1">👩‍💼</div>
              <h2 className="text-xl font-bold text-gray-900">Complete Your Profile</h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in these details to appear in employer searches and gain full dashboard access.
              </p>
            </div>
          </div>

          <div className="p-6 space-y-7">

            {/* ── Personal Info ── */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Grace"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Wanjiku"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 0712 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">Hidden from employers until they pay to unlock your profile.</p>
              </div>
            </section>

            {/* ── Work Details ── */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Work Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Role" value={role} onChange={setRole} options={ROLE_OPTIONS} required />
                <SelectField label="Work Type" value={accommodationType} onChange={setAccommodationType} options={WORK_TYPE_OPTIONS} required />
                <SelectField label="Experience" value={experience} onChange={setExperience} options={EXPERIENCE_OPTIONS} required />
                <SelectField label="Expected Salary" value={expectedSalary} onChange={setExpectedSalary} options={SALARY_RANGES} required />
                <SelectField label="Preferred Location" value={location} onChange={setLocation} options={KENYA_CITIES} required />
                <SelectField label="Education" value={education} onChange={setEducation} options={EDUCATION_OPTIONS} />
              </div>
            </section>

            {/* ── Background ── */}
            <section className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Background</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField label="Community / Tribe" value={community} onChange={setCommunity} options={COMMUNITY_OPTIONS} />
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Age</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                  >
                    <option value="">Select Age</option>
                    {AGE_OPTIONS.map(a => <option key={a} value={a}>{a} years</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* ── Skills ── */}
            <ChipGroup
              label="Skills"
              items={SKILLS_OPTIONS}
              selected={skills}
              onToggle={s => setSkills(toggle(skills, s))}
              color="blue"
              required
            />

            {/* ── Languages ── */}
            <ChipGroup
              label="Languages Spoken"
              items={LANGUAGE_OPTIONS}
              selected={languages}
              onToggle={l => setLanguages(toggle(languages, l))}
              color="green"
            />

            {/* ── Bio ── */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                About You <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Tell employers a bit about yourself and your experience..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-semibold text-base"
            >
              {saving ? 'Saving...' : 'Save & Access Dashboard →'}
            </Button>

            <button
              type="button"
              onClick={onComplete}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
              Skip for now — I'll complete my profile later
            </button>

            <p className="text-xs text-center text-gray-400">
              Complete your profile to appear in employer searches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionWall;
