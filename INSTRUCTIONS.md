# Domestic Connect - Implementation Instructions

## 🎯 **Core Vision**
Transform Domestic Connect into a **trusted agency marketplace** that connects verified domestic workers with clients through professional agencies.

## ✅ **PHASE 1 COMPLETED - Current Implementation Status**

### **What We Have Built:**
- ✅ **Agency Marketplace**: Fully functional agency browsing and selection
- ✅ **Housegirl Registration**: Two options - independent or agency-assisted registration
- ✅ **Employer Hiring**: Agency hiring option with payment integration
- ✅ **Agency Dashboard**: Production-ready with real data from database
- ✅ **Payment System**: M-Pesa integration for agency packages and hiring fees
- ✅ **Data Filtering**: Agency-specific data isolation and security
- ✅ **User Authentication**: Complete auth system for all user types
- ✅ **Photo Upload**: Profile photo management system
- ✅ **Contact Unlocking**: Payment-based contact access (KES 200)

### **Key Components Implemented:**
- **AgencyRegistrationModal.tsx**: Dedicated modal for agency registration
- **AgencyMarketplace.tsx**: Agency browsing and selection interface
- **PaymentModal.tsx**: M-Pesa payment integration
- **AgencyDashboard.tsx**: Production-ready agency management dashboard
- **Updated HousegirlPage.tsx**: Dual registration options

### **Database Schema Implemented:**
```json
{
  "agencies": [
    {
      "id": "demo_agency_1",
      "name": "Demo Agency Service",
      "license_number": "DEMO-2024-001",
      "verification_status": "verified",
      "subscription_tier": "premium",
      "rating": 4.9,
      "services": ["local", "international", "training", "background_checks"],
      "location": "Nairobi"
    }
  ],
  "agency_workers": [
    {
      "id": "aw_1",
      "agency_id": "agency_1",
      "worker_id": "worker_1",
      "verification_status": "verified",
      "training_certificates": ["childcare", "cooking"],
      "background_check_status": "cleared"
    }
  ],
  "agency_clients": [
    {
      "id": "ac_1",
      "agency_id": "agency_1",
      "client_id": "client_1",
      "hiring_fee": 1500,
      "placement_status": "active"
    }
  ],
  "agency_payments": []
}
```

## 🚀 **Next Steps - Phase 2: Advanced Features**

### **Priority 1: Payment & Commission System**
- [ ] Implement real M-Pesa integration (replace simulation)
- [ ] Add commission tracking for successful placements
- [ ] Create payment dispute resolution
- [ ] Add financial reporting for agencies

### **Priority 2: Quality Assurance**
- [ ] Add worker verification workflows
- [ ] Implement background check integration
- [ ] Create training certification system
- [ ] Add quality monitoring and feedback

### **Priority 3: Analytics & Reporting**
- [ ] Add agency performance metrics
- [ ] Create placement success tracking
- [ ] Implement client satisfaction surveys
- [ ] Add business intelligence dashboard

## 🛠️ **Technical Implementation Guide**

### **Current Architecture:**
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: JSON Server (development) + Express.js
- **Database**: JSON file (db.json) with real-time updates
- **Payment**: M-Pesa STK Push simulation (ready for real integration)
- **Authentication**: Local storage + context API

### **Key Files Structure:**
```
src/
├── components/
│   ├── AgencyRegistrationModal.tsx    # Housegirl agency registration
│   ├── AgencyMarketplace.tsx          # Agency browsing interface
│   ├── PaymentModal.tsx               # M-Pesa payment integration
│   └── AuthModal.tsx                  # Independent registration
├── pages/
│   ├── AgencyDashboard.tsx            # Agency management dashboard
│   ├── HousegirlPage.tsx              # Landing page with dual options
│   └── EmployerDashboard.tsx          # Employer dashboard with agency hiring
└── hooks/
    └── useAuth.tsx                    # Authentication management
```

### **Database Integration:**
- **Real-time Data**: All components fetch from `http://localhost:3002`
- **Agency Filtering**: Dashboard shows only agency-specific data
- **Payment Tracking**: All transactions logged in `agency_payments`
- **User Isolation**: Each agency sees only their workers and clients

### **Payment Flow:**
1. **Agency Selection**: User chooses agency from marketplace
2. **Package Selection**: Basic (KES 1,200), Premium (KES 1,500), International (KES 2,000)
3. **M-Pesa Integration**: STK push simulation with phone number validation
4. **Database Update**: Creates `agency_payments` and `agency_clients` records
5. **Success Redirect**: User redirected to appropriate dashboard

### **Security Features:**
- **Data Isolation**: Agency-specific data filtering
- **Input Validation**: Phone numbers, passwords, required fields
- **Error Handling**: User-friendly error messages
- **Loading States**: Proper feedback during operations 
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
