# Domestic Connect - Backend Migration Plan

## 🎯 **Overview**
Migrate from JSON-based mock data to a proper Python Flask backend with SQLite database, maintaining all existing relationships and functionality while adding proper authentication, data validation, and API endpoints.

## 📊 **Current Data Analysis**

### **Existing Data Models & Relationships**
Based on `db.json` analysis, we have these main entities:

1. **profiles** (Base user profiles)
   - Links to: employer_profiles, housegirl_profiles, agency_profiles
   - Fields: id, user_id, first_name, last_name, email, phone_number, user_type, timestamps

2. **employer_profiles** (Employer-specific data)
   - Links to: profiles (via profile_id)
   - Fields: company_name, location, description

3. **housegirl_profiles** (Worker-specific data)
   - Links to: profiles (via profile_id)
   - Fields: age, bio, location, education, experience, salary, accommodation, tribe, availability, photo

4. **agency_profiles** (Agency-specific data)
   - Links to: profiles (via profile_id)
   - Fields: agency_name, location, description, license_number

5. **agencies** (Agency marketplace data)
   - Links to: agency_workers, agency_clients, agency_subscriptions
   - Fields: verification_status, subscription_tier, rating, services, fees, contact info

6. **agency_workers** (Worker-agency relationships)
   - Links to: agencies (via agency_id), housegirl_profiles (via worker_id)
   - Fields: verification_status, training_certificates, background_check, membership_fee

7. **agency_clients** (Client-agency relationships)
   - Links to: agencies (via agency_id), employer_profiles (via client_id)
   - Fields: hiring_fee, placement_status, commission_paid, dispute_resolution

8. **agency_subscriptions** (Agency subscription management)
   - Links to: agencies (via agency_id)
   - Fields: tier, monthly_fee, features, subscription dates

9. **payment_packages** (Contact access packages)
   - Links to: user_purchases
   - Fields: name, description, price, contacts_included

10. **user_purchases** (Payment tracking)
    - Links to: profiles (via user_id), payment_packages (via package_id)
    - Fields: purchase_date, amount, status

11. **contact_access** (Contact unlocking tracking)
    - Links to: profiles (via user_id), housegirl_profiles (via target_profile_id)
    - Fields: access_date

12. **photos** (Photo management)
    - Links to: profiles (via profile_id)
    - Fields: photo_url, upload_date

13. **agency_payments** (Agency payment tracking)
    - Links to: agencies (via agency_id)
    - Fields: payment_type, amount, status, payment_date

## 🏗️ **Backend Architecture Plan**

### **Technology Stack**
- **Framework**: Flask (Python)
- **Database**: SQLite (for development) / PostgreSQL (for production)
- **ORM**: SQLAlchemy
- **Authentication**: Firebase Authentication
- **API**: RESTful API with proper HTTP status codes
- **Validation**: Marshmallow for data serialization/validation
- **CORS**: Flask-CORS for frontend integration
- **File Storage**: Local storage / Render cloud storage

### **Project Structure**
```
backend/
├── app/
│   ├── __init__.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── profile.py
│   │   ├── employer.py
│   │   ├── housegirl.py
│   │   ├── agency.py
│   │   ├── payment.py
│   │   └── photo.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── profiles.py
│   │   ├── employers.py
│   │   ├── housegirls.py
│   │   ├── agencies.py
│   │   ├── payments.py
│   │   └── photos.py
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user_schemas.py
│   │   ├── profile_schemas.py
│   │   └── payment_schemas.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── payment_service.py
│   │   └── photo_service.py
│   └── utils/
│       ├── __init__.py
│       ├── database.py
│       ├── validators.py
│       └── helpers.py
├── migrations/
├── tests/
├── requirements.txt
├── config.py
├── run.py
└── README.md
```

## 📋 **Migration Tasks**

### **Phase 1: Backend Foundation**
- [ ] **1.1** Set up Flask project structure
- [ ] **1.2** Configure SQLAlchemy with SQLite
- [ ] **1.3** Create database models with proper relationships
- [ ] **1.4** Set up database migrations with Flask-Migrate
- [ ] **1.5** Create JWT authentication system
- [ ] **1.6** Set up CORS and basic error handling

### **Phase 2: Data Models & Relationships**
- [ ] **2.1** Create User model (base authentication)
- [ ] **2.2** Create Profile model (extends User)
- [ ] **2.3** Create EmployerProfile model (one-to-one with Profile)
- [ ] **2.4** Create HousegirlProfile model (one-to-one with Profile)
- [ ] **2.5** Create AgencyProfile model (one-to-one with Profile)
- [ ] **2.6** Create Agency model (marketplace agencies)
- [ ] **2.7** Create AgencyWorker model (many-to-many: Agency ↔ HousegirlProfile)
- [ ] **2.8** Create AgencyClient model (many-to-many: Agency ↔ EmployerProfile)
- [ ] **2.9** Create AgencySubscription model (one-to-many: Agency)
- [ ] **2.10** Create PaymentPackage model
- [ ] **2.11** Create UserPurchase model (many-to-many: User ↔ PaymentPackage)
- [ ] **2.12** Create ContactAccess model (many-to-many: User ↔ HousegirlProfile)
- [ ] **2.13** Create Photo model (one-to-many: Profile)
- [ ] **2.14** Create AgencyPayment model (one-to-many: Agency)

### **Phase 3: API Endpoints**
- [ ] **3.1** Authentication endpoints (login, register, refresh token)
- [ ] **3.2** Profile CRUD endpoints
- [ ] **3.3** Employer profile endpoints
- [ ] **3.4** Housegirl profile endpoints (with filtering)
- [ ] **3.5** Agency profile endpoints
- [ ] **3.6** Agency marketplace endpoints
- [ ] **3.7** Agency worker management endpoints
- [ ] **3.8** Agency client management endpoints
- [ ] **3.9** Payment package endpoints
- [ ] **3.10** User purchase endpoints
- [ ] **3.11** Contact access endpoints
- [ ] **3.12** Photo upload endpoints
- [ ] **3.13** Agency payment endpoints

### **Phase 4: Data Migration**
- [ ] **4.1** Create data migration script from db.json
- [ ] **4.2** Migrate profiles data
- [ ] **4.3** Migrate employer profiles
- [ ] **4.4** Migrate housegirl profiles
- [ ] **4.5** Migrate agency profiles
- [ ] **4.6** Migrate agencies data
- [ ] **4.7** Migrate agency relationships
- [ ] **4.8** Migrate payment data
- [ ] **4.9** Migrate photos data
- [ ] **4.10** Verify data integrity and relationships

### **Phase 5: Frontend Integration**
- [ ] **5.1** Update API base URL in frontend
- [ ] **5.2** Replace localStorage auth with JWT
- [ ] **5.3** Update all API calls to use new endpoints
- [ ] **5.4** Handle authentication errors properly
- [ ] **5.5** Update photo upload to use backend
- [ ] **5.6** Update payment integration
- [ ] **5.7** Test all user flows end-to-end

### **Phase 6: Testing & Validation**
- [ ] **6.1** Write unit tests for models
- [ ] **6.2** Write integration tests for API endpoints
- [ ] **6.3** Test authentication flows
- [ ] **6.4** Test data relationships
- [ ] **6.5** Performance testing
- [ ] **6.6** Security testing

### **Phase 7: Cleanup & Documentation**
- [ ] **7.1** Remove mock data files
- [ ] **7.2** Remove localStorage authentication
- [ ] **7.3** Update documentation
- [ ] **7.4** Create API documentation
- [ ] **7.5** Create deployment guide

## 🔗 **Database Schema Design**

### **Core Relationships**
```
User (1) ←→ (1) Profile
Profile (1) ←→ (0..1) EmployerProfile
Profile (1) ←→ (0..1) HousegirlProfile  
Profile (1) ←→ (0..1) AgencyProfile

Agency (1) ←→ (many) AgencyWorker ←→ (1) HousegirlProfile
Agency (1) ←→ (many) AgencyClient ←→ (1) EmployerProfile
Agency (1) ←→ (many) AgencySubscription
Agency (1) ←→ (many) AgencyPayment

User (many) ←→ (many) PaymentPackage (via UserPurchase)
User (many) ←→ (many) HousegirlProfile (via ContactAccess)
Profile (1) ←→ (many) Photo
```

### **Key Constraints**
- Email must be unique across all users
- User can only have one profile type (employer/housegirl/agency)
- Agency workers must be verified housegirls
- Contact access requires payment
- All timestamps automatically managed

## 🚀 **CLI Commands Plan**

### **Database Management**
```bash
# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Create superuser
python create_admin.py

# Migrate data from JSON
python migrate_data.py

# Reset database (development)
python reset_db.py
```

### **Development Commands**
```bash
# Run development server
flask run --debug

# Run tests
python -m pytest

# Generate API documentation
python generate_docs.py
```

### **Production Commands**
```bash
# Run production server
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Database backup
python backup_db.py

# Database restore
python restore_db.py backup_file.sqlite
```

## 🔒 **Security Considerations**

### **Authentication & Authorization**
- JWT tokens with expiration
- Password hashing with bcrypt
- Role-based access control
- API rate limiting
- Input validation and sanitization

### **Data Protection**
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection
- CORS configuration
- Environment variable management
- Database connection security

## 📈 **Performance Optimizations**

### **Database**
- Proper indexing on foreign keys
- Query optimization
- Connection pooling
- Database query caching

### **API**
- Response pagination
- Data serialization optimization
- API response caching
- File upload optimization

## 🧪 **Testing Strategy**

### **Test Coverage**
- Unit tests for all models
- Integration tests for API endpoints
- Authentication flow tests
- Data relationship tests
- Error handling tests

### **Test Data**
- Fixtures for all models
- Mock external services
- Test database isolation
- Performance benchmarks

## 📝 **Success Criteria**

### **Functional Requirements**
- [ ] All existing features work with backend
- [ ] Data relationships maintained
- [ ] Authentication system working
- [ ] Payment integration functional
- [ ] Photo upload working
- [ ] Agency marketplace functional

### **Non-Functional Requirements**
- [ ] API response time < 200ms
- [ ] 99% uptime
- [ ] Secure authentication
- [ ] Data integrity maintained
- [ ] Scalable architecture

## 🎯 **Next Steps**

1. **Review and approve this plan**
2. **Set up development environment**
3. **Begin Phase 1: Backend Foundation**
4. **Create database models**
5. **Implement API endpoints**
6. **Migrate existing data**
7. **Update frontend integration**
8. **Test and validate**
9. **Deploy to production**

---

**Estimated Timeline**: 2-3 weeks for complete migration
**Priority**: High - Foundation for scaling the application
**Risk Level**: Medium - Requires careful data migration and relationship management
