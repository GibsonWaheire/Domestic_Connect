import { Housegirl, JobPosting, Message } from '@/types/employer';

export const mockHousegirls: Housegirl[] = [
  {
    id: 1, name: "Sarah Wanjiku", age: 28, location: "Westlands, Nairobi",
    experience: "5 years", salary: "KES 18,000", status: "Available",
    bio: "Experienced house help with excellent cooking skills.",
    skills: ["Cooking", "Cleaning", "Childcare"], rating: 4.8, reviews: 12,
    contactUnlocked: false, unlockCount: 0,
    nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 2, name: "Grace Akinyi", age: 32, location: "Kilimani, Nairobi",
    experience: "8 years", salary: "KES 22,000", status: "Available",
    bio: "Professional house manager with extensive experience.",
    skills: ["House Management", "Cooking", "Cleaning"], rating: 4.9, reviews: 18,
    contactUnlocked: false, unlockCount: 0,
    nationality: "Kenya", community: "Luo", education: "Form 4 and Above", workType: "Day job", livingArrangement: "Live-out",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 3, name: "Mary Muthoni", age: 25, location: "Lavington, Nairobi",
    experience: "3 years", salary: "KES 15,000", status: "Available",
    bio: "Young and energetic house help. Great with children.",
    skills: ["Cleaning", "Childcare", "Pet Care"], rating: 4.5, reviews: 8,
    contactUnlocked: false, unlockCount: 0,
    nationality: "Kenya", community: "Kikuyu", education: "Class 8 and Above", workType: "Lives in", livingArrangement: "Live-in",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 4, name: "Jane Njeri", age: 35, location: "Karen, Nairobi",
    experience: "10 years", salary: "KES 25,000", status: "Available",
    bio: "Senior house manager with excellent organizational skills.",
    skills: ["House Management", "Cooking", "Childcare", "Gardening"], rating: 4.9, reviews: 25,
    contactUnlocked: false, unlockCount: 0,
    nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 5, name: "Faith Wambui", age: 27, location: "Muthaiga, Nairobi",
    experience: "4 years", salary: "KES 20,000", status: "Available",
    bio: "Reliable and hardworking house help with cooking expertise.",
    skills: ["Cooking", "Cleaning", "Laundry"], rating: 4.7, reviews: 15,
    contactUnlocked: false, unlockCount: 0,
    nationality: "Kenya", community: "Kamba", education: "Form 4 and Above", workType: "Day job", livingArrangement: "Live-out",
    profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 6, name: "Lucy Wangari", age: 30, location: "Runda, Nairobi",
    experience: "6 years", salary: "KES 21,000", status: "Available",
    bio: "Experienced house help specializing in childcare and cooking.",
    skills: ["Childcare", "Cooking", "Cleaning"], rating: 4.6, reviews: 20,
    contactUnlocked: false, unlockCount: 0,
    nationality: "Kenya", community: "Kikuyu", education: "Form 4 and Above", workType: "Lives in", livingArrangement: "Live-in",
    profileImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 7, name: "Esther Achieng", age: 29, location: "Kilimani, Nairobi",
    experience: "7 years", salary: "KES 23,000", status: "Available",
    bio: "Professional house manager with excellent communication skills.",
    skills: ["House Management", "Cooking", "Childcare", "Pet Care"], rating: 4.8, reviews: 16,
    contactUnlocked: false, unlockCount: 0,
    nationality: "Kenya", community: "Luo", education: "College/University", workType: "Lives in", livingArrangement: "Live-in",
    profileImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
  },
  {
    id: 8, name: "Ruth Mwikali", age: 26, location: "Westlands, Nairobi",
    experience: "4 years", salary: "KES 19,000", status: "Available",
    bio: "Young and energetic house help with great cooking skills.",
    skills: ["Cooking", "Cleaning", "Laundry"], rating: 4.4, reviews: 10,
    contactUnlocked: false, unlockCount: 0,
    nationality: "Kenya", community: "Kamba", education: "Form 4 and Above", workType: "Day job", livingArrangement: "Live-out",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  }
];

export const mockJobPostings: JobPosting[] = [
  {
    id: 1,
    title: "Experienced House Manager Needed",
    location: "Karen, Nairobi",
    salary: "KES 25,000 - 30,000",
    status: "active",
    applications: 12,
    views: 45,
    postedDate: "2024-01-15"
  },
  {
    id: 2,
    title: "House Help for Family of 4",
    location: "Westlands, Nairobi",
    salary: "KES 18,000 - 22,000",
    status: "active",
    applications: 8,
    views: 32,
    postedDate: "2024-01-20"
  },
  {
    id: 3,
    title: "Part-time House Help",
    location: "Kilimani, Nairobi",
    salary: "KES 15,000 - 18,000",
    status: "paused",
    applications: 5,
    views: 28,
    postedDate: "2024-01-10"
  }
];

export const mockMessages: Message[] = [
  {
    id: 1,
    from: "Sarah Wanjiku",
    subject: "Application for House Manager Position",
    preview: "Hello, I'm interested in your house manager position...",
    timestamp: "2 hours ago",
    isRead: false
  },
  {
    id: 2,
    from: "Grace Akinyi",
    subject: "Re: Interview Schedule",
    preview: "Thank you for the opportunity. I'm available for...",
    timestamp: "1 day ago",
    isRead: true
  },
  {
    id: 3,
    from: "Mary Muthoni",
    subject: "Question about Job Requirements",
    preview: "Hi, I have a question about the cooking requirements...",
    timestamp: "2 days ago",
    isRead: true
  }
];
