import { BarChart3, Briefcase, Users, MessageCircle, Settings, Building2 } from 'lucide-react';
import { NavItem } from '@/types/employer';

export const NAV_ITEMS: NavItem[] = [
  { id: 'housegirls', label: 'Housegirls', icon: Users, color: 'purple' },
  { id: 'agency-marketplace', label: 'Agency Marketplace', icon: Building2, color: 'blue' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, color: 'green' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, color: 'indigo' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' }
];

export const COMMUNITY_OPTIONS = [
  'Kikuyu', 'Luo', 'Kamba', 'Luhya', 'Kisii', 'Meru', 'Kalenjin', 'Taita', 
  'Mijikenda', 'Pokot', 'Turkana', 'Samburu', 'Maasai', 'Embu', 'Tharaka', 'Other'
];

export const AGE_RANGE_OPTIONS = [
  '18-25', '26-30', '31-35', '36-40', '41-45', '46-50', '50+'
];

export const SALARY_RANGE_OPTIONS = [
  'KES 10,000 - 15,000', 'KES 15,000 - 20,000', 'KES 20,000 - 25,000', 
  'KES 25,000 - 30,000', 'KES 30,000 - 35,000', 'KES 35,000+'
];

export const EDUCATION_OPTIONS = [
  'Class 8 and Above', 'Form 4 and Above', 'College/University', 'Other'
];

export const WORK_TYPE_OPTIONS = [
  'Lives in', 'Day job', 'Part-time', 'Weekend only'
];

export const EXPERIENCE_OPTIONS = [
  '0-2 years', '3-5 years', '6-8 years', '9-12 years', '12+ years'
];

export const LIVING_ARRANGEMENT_OPTIONS = [
  'Live-in', 'Live-out', 'Flexible'
];
