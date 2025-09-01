import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  GraduationCap, 
  Eye, 
  Phone, 
  Star,
  Users,
  Calendar,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface JobApplication {
  id: number;
  housegirl: {
    id: number;
    name: string;
    age: number;
    nationality: string;
    location: string;
    community: string;
    experience: string;
    education: string;
    salary: string;
    accommodation: string;
    status: string;
    image?: string;
    bio?: string;
    skills?: string[];
    rating?: number;
    reviews?: number;
  };
  jobTitle: string;
  appliedDate: string;
  status: 'pending' | 'shortlisted' | 'interviewed' | 'hired' | 'rejected';
  coverLetter: string;
  expectedSalary: string;
  availability: string;
  interviewDate?: string;
  notes?: string;
}

interface CandidatesSectionProps {
  onViewProfile: (housegirl: JobApplication['housegirl']) => void;
  onContact: (application: JobApplication) => void;
}

const CandidatesSection = ({ onViewProfile, onContact }: CandidatesSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Mock data - in real app this would come from API
  const [applications] = useState<JobApplication[]>([
    {
      id: 1,
      housegirl: {
        id: 1,
        name: "Sarah Wanjiku",
        age: 28,
        nationality: "Kenyan",
        location: "Westlands, Nairobi",
        community: "Kikuyu",
        experience: "5 years",
        education: "Secondary",
        salary: "KES 18,000",
        accommodation: "Live-in",
        status: "Available",
        bio: "Experienced house help with excellent cooking skills and childcare experience. Very reliable and trustworthy.",
        skills: ["Cooking", "Cleaning", "Childcare", "Laundry", "Ironing"],
        rating: 4.8,
        reviews: 12
      },
      jobTitle: "Live-in House Help",
      appliedDate: "2 days ago",
      status: 'shortlisted',
      coverLetter: "I am very interested in this position and believe my experience in childcare and housekeeping makes me an excellent candidate. I am reliable, hardworking, and love working with families.",
      expectedSalary: "KES 18,000",
      availability: "Immediate",
      interviewDate: "2024-01-15",
      notes: "Great candidate, very experienced with children. Schedule interview."
    },
    {
      id: 2,
      housegirl: {
        id: 2,
        name: "Grace Akinyi",
        age: 32,
        nationality: "Kenyan",
        location: "Kilimani, Nairobi",
        community: "Luo",
        experience: "8 years",
        education: "College",
        salary: "KES 22,000",
        accommodation: "Live-out",
        status: "Available",
        bio: "Professional house manager with extensive experience in large households. Excellent organizational skills.",
        skills: ["House Management", "Cooking", "Cleaning", "Event Planning", "Budgeting"],
        rating: 4.9,
        reviews: 18
      },
      jobTitle: "House Manager",
      appliedDate: "1 day ago",
      status: 'pending',
      coverLetter: "I have extensive experience managing large households and would love to bring my organizational skills to your family. I am detail-oriented and ensure everything runs smoothly.",
      expectedSalary: "KES 25,000",
      availability: "2 weeks notice",
      notes: "Highly qualified, but salary expectation is higher than budget."
    },
    {
      id: 3,
      housegirl: {
        id: 3,
        name: "Mary Muthoni",
        age: 25,
        nationality: "Kenyan",
        location: "Lavington, Nairobi",
        community: "Kikuyu",
        experience: "3 years",
        education: "Secondary",
        salary: "KES 15,000",
        accommodation: "Live-in",
        status: "Available",
        bio: "Young and energetic house help. Great with children and pets. Learning new skills quickly.",
        skills: ["Cleaning", "Childcare", "Pet Care", "Basic Cooking"],
        rating: 4.5,
        reviews: 8
      },
      jobTitle: "Part-time Cleaner",
      appliedDate: "3 days ago",
      status: 'interviewed',
      coverLetter: "I am excited about this opportunity to work with your family. I am energetic, reliable, and love keeping homes clean and organized.",
      expectedSalary: "KES 15,000",
      availability: "Immediate",
      interviewDate: "2024-01-12",
      notes: "Good interview, seems reliable. Consider for position."
    },
    {
      id: 4,
      housegirl: {
        id: 4,
        name: "Jane Adhiambo",
        age: 35,
        nationality: "Kenyan",
        location: "Karen, Nairobi",
        community: "Luo",
        experience: "10 years",
        education: "Primary",
        salary: "KES 25,000",
        accommodation: "Live-in",
        status: "Available",
        bio: "Senior house help with vast experience. Excellent cook specializing in traditional Kenyan dishes.",
        skills: ["Traditional Cooking", "Cleaning", "Laundry", "Garden Maintenance"],
        rating: 4.7,
        reviews: 25
      },
      jobTitle: "Live-in House Help",
      appliedDate: "1 week ago",
      status: 'hired',
      coverLetter: "I am honored to be considered for this position. With my 10 years of experience, I can provide excellent service to your family.",
      expectedSalary: "KES 25,000",
      availability: "1 month notice",
      notes: "Excellent candidate, hired. Start date: February 1st."
    }
  ]);

  const filteredApplications = applications.filter(application => {
    const matchesSearch = application.housegirl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.coverLetter.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    const matchesJob = jobFilter === 'all' || application.jobTitle.includes(jobFilter);

    return matchesSearch && matchesStatus && matchesJob;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, jobFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'shortlisted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'interviewed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hired': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'shortlisted': return <CheckCircle className="h-4 w-4" />;
      case 'interviewed': return <MessageCircle className="h-4 w-4" />;
      case 'hired': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interviewed': return 'Interviewed';
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-purple-800 mb-2">Job Applications</h2>
              <p className="text-purple-600">Review and manage applications from qualified housegirls</p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {filteredApplications.length} Applications
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2 text-purple-700">
              <Users className="h-4 w-4" />
              <span>Qualified candidates</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-700">
              <Calendar className="h-4 w-4" />
              <span>Track application status</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-700">
              <MessageCircle className="h-4 w-4" />
              <span>Schedule interviews</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-700">
              <CheckCircle className="h-4 w-4" />
              <span>Make hiring decisions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, job title, or cover letter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                <SelectItem value="Live-in House Help">Live-in House Help</SelectItem>
                <SelectItem value="House Manager">House Manager</SelectItem>
                <SelectItem value="Part-time Cleaner">Part-time Cleaner</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="flex items-center justify-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {paginatedApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    {application.housegirl.image ? (
                      <img 
                        src={application.housegirl.image} 
                        alt={application.housegirl.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-8 w-8 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {application.housegirl.name}
                    </h3>
                    <p className="text-gray-600 mb-2">Applied for: <span className="font-medium">{application.jobTitle}</span></p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied {application.appliedDate}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {application.housegirl.location}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        {application.housegirl.rating} ({application.housegirl.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={`${getStatusColor(application.status)} flex items-center space-x-1`}>
                    {getStatusIcon(application.status)}
                    <span>{getStatusLabel(application.status)}</span>
                  </Badge>
                  
                  {application.interviewDate && (
                    <div className="text-sm text-gray-600 text-right">
                      <div className="font-medium">Interview:</div>
                      <div>{application.interviewDate}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Letter Preview */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                <p className="text-gray-600 text-sm line-clamp-2">{application.coverLetter}</p>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Expected Salary:</span>
                  <div className="font-medium text-green-600">{application.expectedSalary}</div>
                </div>
                <div>
                  <span className="text-gray-600">Availability:</span>
                  <div className="font-medium">{application.availability}</div>
                </div>
                <div>
                  <span className="text-gray-600">Experience:</span>
                  <div className="font-medium">{application.housegirl.experience}</div>
                </div>
                <div>
                  <span className="text-gray-600">Education:</span>
                  <div className="font-medium">{application.housegirl.education}</div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {application.housegirl.skills?.slice(0, 5).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {application.notes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                  <p className="text-gray-600 text-sm">{application.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProfile(application.housegirl)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onContact(application)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  {application.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                        Shortlist
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                        Reject
                      </Button>
                    </>
                  )}
                  {application.status === 'shortlisted' && (
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                      Schedule Interview
                    </Button>
                  )}
                  {application.status === 'interviewed' && (
                    <>
                      <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                        Hire
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredApplications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || jobFilter !== 'all'
                ? "Try adjusting your search criteria or filters"
                : "You haven't received any job applications yet"
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || jobFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setJobFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10 h-10"
              >
                {page}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      {filteredApplications.length > 0 && (
        <div className="text-center text-sm text-gray-600 mt-4">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredApplications.length)} of {filteredApplications.length} applications
        </div>
      )}
    </div>
  );
};

export default CandidatesSection;
