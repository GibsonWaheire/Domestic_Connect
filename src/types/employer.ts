export interface Housegirl {
  id: number;
  name: string;
  age: number;
  location: string;
  experience: string;
  salary: string;
  status: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  reviews?: number;
  contactUnlocked: boolean;
  unlockCount: number;
  phone?: string;
  email?: string;
  nationality: string;
  community: string;
  education: string;
  workType: string;
  livingArrangement: string;
  profileImage?: string;
}

export interface JobPosting {
  id: number;
  title: string;
  location: string;
  salary: string;
  status: 'active' | 'paused' | 'closed';
  applications: number;
  views: number;
  postedDate: string;
}

export interface Message {
  id: number;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  color: string;
}
