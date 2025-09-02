import { Housegirl } from '@/types/employer';

export const filterHousegirls = (
  housegirls: Housegirl[],
  searchTerm: string,
  selectedCommunity: string,
  selectedAgeRange: string,
  selectedSalaryRange: string,
  selectedEducation: string,
  selectedWorkType: string,
  selectedExperience: string,
  selectedLivingArrangement: string
): Housegirl[] => {
  return housegirls.filter((housegirl) => {
    // Search term filter
    if (searchTerm && !housegirl.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !housegirl.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !housegirl.bio?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Community filter
    if (selectedCommunity && housegirl.community !== selectedCommunity) {
      return false;
    }

    // Age range filter
    if (selectedAgeRange) {
      const [minAge, maxAge] = selectedAgeRange.split('-').map(Number);
      if (selectedAgeRange === '50+') {
        if (housegirl.age < 50) return false;
      } else if (housegirl.age < minAge || housegirl.age > maxAge) {
        return false;
      }
    }

    // Salary range filter
    if (selectedSalaryRange) {
      const salary = parseInt(housegirl.salary.replace(/[^\d]/g, ''));
      const [minSalary, maxSalary] = selectedSalaryRange
        .replace(/[^\d\s-]/g, '')
        .split('-')
        .map(s => parseInt(s.replace(/\s/g, '')));
      
      if (selectedSalaryRange.includes('35,000+')) {
        if (salary < 35000) return false;
      } else if (salary < minSalary || salary > maxSalary) {
        return false;
      }
    }

    // Education filter
    if (selectedEducation && housegirl.education !== selectedEducation) {
      return false;
    }

    // Work type filter
    if (selectedWorkType && housegirl.workType !== selectedWorkType) {
      return false;
    }

    // Experience filter
    if (selectedExperience) {
      const experienceYears = parseInt(housegirl.experience.split(' ')[0]);
      const [minExp, maxExp] = selectedExperience.split('-').map(s => parseInt(s.split(' ')[0]));
      
      if (selectedExperience.includes('12+')) {
        if (experienceYears < 12) return false;
      } else if (experienceYears < minExp || experienceYears > maxExp) {
        return false;
      }
    }

    // Living arrangement filter
    if (selectedLivingArrangement && housegirl.livingArrangement !== selectedLivingArrangement) {
      return false;
    }

    return true;
  });
};
