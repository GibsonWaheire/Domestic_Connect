# Domestic Connect - Agency Marketplace Refactor Plan

## 🎯 **Main Goal**
Transform Domestic Connect into a **verified agency marketplace** where:
- **Clients** can hire through trusted agencies (KES 1,500) with dispute resolution and replacements
- **Workers** can join agencies for training and opportunities (KES 500 local, KES 700 international)
- **Agencies** can showcase verified profiles and earn through subscriptions/commissions

## 🚀 **Current Status: Phase 1 COMPLETED**

### **✅ What's Been Implemented:**
- **Agency Marketplace**: Fully functional agency browsing and selection
- **Housegirl Registration**: Two options - independent or agency-assisted registration
- **Employer Hiring**: Agency hiring option with payment integration
- **Agency Dashboard**: Production-ready with real data from database
- **Payment System**: M-Pesa integration for agency packages and hiring fees
- **Data Filtering**: Agency-specific data isolation and security

### **🎯 Key Achievements:**
- **Database Integration**: Real-time data fetching from `db.json`
- **User Experience**: Clean separation between independent and agency registration
- **Payment Flow**: Complete M-Pesa STK push simulation
- **Agency Management**: Dashboard shows only agency-specific data
- **Mobile Responsive**: Works perfectly on all devices

## ✅ **COMPLETED - Phase 1: Core Agency Marketplace**

### **1. Agency Profile & Verification System**
- [x] Create agency verification badges and trust indicators
- [x] Add agency profile pages with services, ratings, and verified workers
- [x] Implement agency subscription tiers (Basic, Premium, International)
- [x] Add agency verification process (license, insurance, background checks)

### **2. Worker Agency Integration**
- [x] Add "Join Agency" option for housegirls during registration
- [x] Create agency membership fees (KES 500 local, KES 700 international)
- [x] Implement agency training and certification tracking
- [x] Add agency worker profiles with verification badges

### **3. Client Agency Hiring**
- [x] Add "Hire via Agency" option for employers
- [x] Implement agency hiring fee (KES 1,500)
- [x] Create dispute resolution system
- [x] Add replacement guarantee features

### **4. Agency Dashboard Refactor**
- [x] Transform into agency shopfront management
- [x] Add verified worker showcase
- [x] Implement lead management and client tracking
- [x] Add commission and subscription tracking

### **5. Marketplace Features**
- [x] Create agency marketplace page
- [x] Add agency search and filtering
- [x] Implement agency ratings and reviews
- [x] Add agency service categories (local, international, specialized)

## 📋 **TODO List - Phase 2: Advanced Features**

### **6. Payment & Commission System**
- [ ] Implement agency subscription payments
- [ ] Add commission tracking for successful placements
- [ ] Create payment dispute resolution
- [ ] Add financial reporting for agencies

### **7. Quality Assurance**
- [ ] Add worker verification workflows
- [ ] Implement background check integration
- [ ] Create training certification system
- [ ] Add quality monitoring and feedback

### **8. International Expansion**
- [ ] Add international agency partnerships
- [ ] Implement visa and work permit tracking
- [ ] Create international placement workflows
- [ ] Add multi-language support

## 📋 **TODO List - Phase 3: Platform Optimization**

### **9. Analytics & Reporting**
- [ ] Add agency performance metrics
- [ ] Create placement success tracking
- [ ] Implement client satisfaction surveys
- [ ] Add business intelligence dashboard

### **10. Mobile & Accessibility**
- [ ] Optimize for mobile devices
- [ ] Add offline capabilities
- [ ] Implement push notifications
- [ ] Add accessibility features

## 🏗️ **Technical Architecture**

### **Database Schema Updates**
```sql
-- Agency Profiles
agencies: {
  id, name, license_number, verification_status, 
  subscription_tier, rating, services, location
}

-- Agency Workers
agency_workers: {
  id, agency_id, worker_id, verification_status,
  training_certificates, background_check_status
}

-- Agency Clients
agency_clients: {
  id, agency_id, client_id, placement_id,
  hiring_fee, commission_rate, status
}

-- Agency Subscriptions
agency_subscriptions: {
  id, agency_id, tier, monthly_fee,
  features, start_date, end_date
}
```

### **API Endpoints**
```
GET /api/agencies - List verified agencies
GET /api/agencies/:id - Agency profile with workers
POST /api/agencies/:id/join - Worker joins agency
POST /api/agencies/:id/hire - Client hires through agency
GET /api/agencies/:id/workers - Agency's verified workers
```

## 🎨 **UI/UX Design Principles**

### **Trust & Verification**
- Prominent verification badges
- Clear agency ratings and reviews
- Transparent pricing and fees
- Dispute resolution visibility

### **User Experience**
- Simple agency selection process
- Clear pricing for different services
- Easy dispute filing and resolution
- Mobile-first responsive design

## 📊 **Business Metrics to Track**

### **Agency Performance**
- Number of verified workers
- Placement success rate
- Client satisfaction score
- Revenue per agency

### **Platform Performance**
- Total agency subscriptions
- Commission revenue
- Dispute resolution time
- User retention rates

## 🚀 **Implementation Priority**

### **High Priority (Phase 1)**
1. Agency verification system
2. Worker agency integration
3. Client agency hiring
4. Basic agency dashboard

### **Medium Priority (Phase 2)**
1. Payment system
2. Quality assurance
3. Advanced marketplace features

### **Low Priority (Phase 3)**
1. Analytics and reporting
2. Mobile optimization
3. International features

## 📝 **Success Criteria**

### **Phase 1 Success**
- [ ] 10+ verified agencies onboarded
- [ ] 100+ workers joined agencies
- [ ] 50+ successful agency placements
- [ ] 95% client satisfaction rate

### **Phase 2 Success**
- [ ] KES 500K+ monthly agency revenue
- [ ] 90% dispute resolution success
- [ ] 80% worker retention in agencies
- [ ] 5+ international agency partnerships

### **Phase 3 Success**
- [ ] KES 2M+ monthly platform revenue
- [ ] 95% mobile user satisfaction
- [ ] 50+ agency partnerships
- [ ] 10,000+ verified workers

## 🔄 **Iteration Process**

1. **Build** - Implement features based on priority
2. **Test** - User testing and feedback collection
3. **Measure** - Track key metrics and performance
4. **Iterate** - Refine based on data and feedback
5. **Scale** - Expand successful features

## 📞 **Support & Maintenance**

### **Agency Support**
- Dedicated agency onboarding process
- Training and certification programs
- Technical support and troubleshooting
- Regular performance reviews

### **Client Support**
- Dispute resolution assistance
- Replacement guarantee enforcement
- Payment and refund processing
- Quality assurance monitoring

---

**Remember: The goal is to create a trusted marketplace where agencies provide verified, quality domestic workers with guaranteed satisfaction for clients.**
