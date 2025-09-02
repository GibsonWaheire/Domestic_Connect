# Domestic Connect - Implementation Instructions

## 🎯 **Core Vision**
Transform Domestic Connect into a **trusted agency marketplace** that connects verified domestic workers with clients through professional agencies.

## 📋 **Current State Analysis**

### **What We Have:**
- ✅ Basic user authentication (employer, housegirl, agency)
- ✅ Employer dashboard with housegirl browsing
- ✅ Housegirl dashboard with job opportunities
- ✅ Agency dashboard (needs refactoring)
- ✅ Payment system for contact unlocking (KES 200)
- ✅ Photo upload and profile management

### **What We Need to Build:**
- 🔄 Agency verification and trust system
- 🔄 Worker agency membership
- 🔄 Client agency hiring
- 🔄 Dispute resolution and replacement guarantees

## 🏗️ **Phase 1 Implementation Plan**

### **Step 1: Agency Verification System**

#### **Database Updates**
```json
// Add to db.json
{
  "agencies": [
    {
      "id": "agency_1",
      "name": "Professional Domestic Agency",
      "license_number": "AGY-2024-001",
      "verification_status": "verified",
      "subscription_tier": "premium",
      "rating": 4.8,
      "services": ["local", "international", "training"],
      "location": "Nairobi",
      "monthly_fee": 5000,
      "commission_rate": 15,
      "verified_workers": 45,
      "successful_placements": 120
    }
  ],
  "agency_workers": [
    {
      "id": "aw_1",
      "agency_id": "agency_1",
      "worker_id": "worker_1",
      "verification_status": "verified",
      "training_certificates": ["childcare", "cooking"],
      "background_check_status": "cleared",
      "membership_fee": 500,
      "join_date": "2024-01-15"
    }
  ],
  "agency_clients": [
    {
      "id": "ac_1",
      "agency_id": "agency_1",
      "client_id": "client_1",
      "hiring_fee": 1500,
      "placement_status": "active",
      "hire_date": "2024-01-20"
    }
  ]
}
```

#### **UI Components to Create**
1. **Agency Verification Badge** - Shows verification status
2. **Agency Profile Card** - Displays agency info and ratings
3. **Worker Verification Badge** - Shows agency verification
4. **Agency Marketplace Page** - Browse verified agencies

### **Step 2: Worker Agency Integration**

#### **Registration Flow Update**
```typescript
// Add to AuthModal.tsx
const [joinAgency, setJoinAgency] = useState(false);
const [selectedAgency, setSelectedAgency] = useState('');
const [agencyMembershipFee, setAgencyMembershipFee] = useState(500);

// Add agency selection during housegirl registration
{userType === 'housegirl' && (
  <div className="space-y-4">
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={joinAgency}
        onChange={(e) => setJoinAgency(e.target.checked)}
      />
      <label>Join a verified agency for better opportunities</label>
    </div>
    
    {joinAgency && (
      <div className="space-y-2">
        <select 
          value={selectedAgency}
          onChange={(e) => setSelectedAgency(e.target.value)}
        >
          <option value="">Select Agency</option>
          <option value="local">Local Agency (KES 500)</option>
          <option value="international">International Agency (KES 700)</option>
        </select>
        <p className="text-sm text-gray-600">
          Agency membership includes training, verification, and better job opportunities
        </p>
      </div>
    )}
  </div>
)}
```

#### **Housegirl Dashboard Updates**
```typescript
// Add to HousegirlDashboard.tsx
const [agencyMembership, setAgencyMembership] = useState(null);

// Add agency status section
{agencyMembership && (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-green-600" />
        <span>Agency Membership</span>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{agencyMembership.agencyName}</p>
          <p className="text-sm text-gray-600">Verified Member</p>
        </div>
        <Badge variant="default" className="bg-green-600">
          Verified
        </Badge>
      </div>
    </CardContent>
  </Card>
)}
```

### **Step 3: Client Agency Hiring**

#### **Employer Dashboard Updates**
```typescript
// Add to EmployerDashboard.tsx
const [showAgencyOption, setShowAgencyOption] = useState(false);

// Add agency hiring option in housegirl cards
<div className="flex space-x-2">
  <Button 
    variant="outline" 
    onClick={() => setShowUnlockModal(true)}
  >
    Unlock Contact (KES 200)
  </Button>
  <Button 
    onClick={() => setShowAgencyOption(true)}
    className="bg-green-600 hover:bg-green-700"
  >
    Hire via Agency (KES 1,500)
  </Button>
</div>

// Add agency hiring modal
{showAgencyOption && (
  <AgencyHiringModal
    housegirl={selectedHousegirl}
    onClose={() => setShowAgencyOption(false)}
    onHire={handleAgencyHire}
  />
)}
```

#### **Agency Hiring Modal Component**
```typescript
// Create new component: src/components/AgencyHiringModal.tsx
interface AgencyHiringModalProps {
  housegirl: Housegirl;
  onClose: () => void;
  onHire: (agencyId: string) => void;
}

const AgencyHiringModal = ({ housegirl, onClose, onHire }: AgencyHiringModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Hire via Agency</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">Benefits:</h4>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Verified and screened worker</li>
              <li>• Dispute resolution guarantee</li>
              <li>• Free replacement if needed</li>
              <li>• Professional support</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">KES 1,500</p>
            <p className="text-sm text-gray-600">One-time agency fee</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => onHire('agency_1')} className="flex-1 bg-green-600">
              Hire Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### **Step 4: Agency Dashboard Refactor**

#### **New Agency Dashboard Structure**
```typescript
// Update AgencyDashboard.tsx tabs
const tabs = [
  { id: 'shopfront', label: 'My Shopfront', icon: Store },
  { id: 'workers', label: 'Verified Workers', icon: Users },
  { id: 'clients', label: 'Client Leads', icon: User },
  { id: 'placements', label: 'Active Placements', icon: CheckCircle },
  { id: 'revenue', label: 'Revenue & Commissions', icon: DollarSign },
  { id: 'settings', label: 'Agency Settings', icon: Settings }
];
```

#### **Shopfront Management**
```typescript
// Add shopfront section
{activeTab === 'shopfront' && (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Agency Shopfront</CardTitle>
        <CardDescription>Your public profile for clients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Agency Information</h4>
            <div className="space-y-2">
              <p><strong>Name:</strong> Professional Domestic Agency</p>
              <p><strong>Rating:</strong> ⭐⭐⭐⭐⭐ 4.8 (120 reviews)</p>
              <p><strong>Verified Workers:</strong> 45</p>
              <p><strong>Successful Placements:</strong> 120</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Services</h4>
            <div className="flex flex-wrap gap-2">
              <Badge>Local Placements</Badge>
              <Badge>International</Badge>
              <Badge>Training</Badge>
              <Badge>Background Checks</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}
```

## 🎨 **Design System Updates**

### **Verification Badges**
```css
/* Add to global CSS */
.verification-badge {
  @apply inline-flex items-center px-2 py-1 rounded-full text-xs font-medium;
}

.verification-badge.verified {
  @apply bg-green-100 text-green-800;
}

.verification-badge.premium {
  @apply bg-blue-100 text-blue-800;
}

.verification-badge.international {
  @apply bg-purple-100 text-purple-800;
}
```

### **Agency Card Component**
```typescript
// Create: src/components/AgencyCard.tsx
interface AgencyCardProps {
  agency: Agency;
  onSelect: (agencyId: string) => void;
}

const AgencyCard = ({ agency, onSelect }: AgencyCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{agency.name}</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(agency.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({agency.rating})</span>
              </div>
            </div>
          </div>
          <Badge className="verification-badge verified">
            Verified
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Verified Workers:</span>
            <span className="font-medium">{agency.verified_workers}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Successful Placements:</span>
            <span className="font-medium">{agency.successful_placements}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Services:</span>
            <div className="flex space-x-1">
              {agency.services.map(service => (
                <Badge key={service} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
          <Button 
            onClick={() => onSelect(agency.id)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Hire via Agency (KES 1,500)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

## 📊 **Success Metrics**

### **Key Performance Indicators**
1. **Agency Onboarding**: 10+ verified agencies in first month
2. **Worker Adoption**: 20% of housegirls join agencies
3. **Client Conversion**: 30% of employers choose agency hiring
4. **Revenue Growth**: KES 100K+ monthly agency revenue
5. **Satisfaction Rate**: 95% client satisfaction with agency placements

### **Tracking Implementation**
```typescript
// Add analytics tracking
const trackAgencyEvent = (event: string, data: any) => {
  // Implement analytics tracking
  console.log('Agency Event:', event, data);
};

// Track key events
trackAgencyEvent('worker_joined_agency', { agencyId, workerId, fee });
trackAgencyEvent('client_hired_agency', { agencyId, clientId, fee });
trackAgencyEvent('placement_successful', { agencyId, placementId });
```

## 🔄 **Iteration Guidelines**

### **Weekly Reviews**
- Monitor agency onboarding progress
- Track worker agency adoption rates
- Review client agency hiring conversion
- Analyze revenue and commission data

### **Monthly Updates**
- Add new agency features based on feedback
- Optimize pricing and commission structures
- Expand to new service categories
- Improve verification and trust systems

### **Quarterly Goals**
- Achieve 50+ verified agencies
- Reach 1,000+ agency workers
- Generate KES 500K+ monthly revenue
- Expand to international markets

---

**Remember: Focus on building trust and value for all three user types (clients, workers, agencies) while maintaining the core goal of verified quality domestic help.**
