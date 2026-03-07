from app.firebase_init import db
from datetime import datetime
import bcrypt

class BaseModel:
    """Base class to allow keyword argument initialization similar to SQLAlchemy"""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class User(BaseModel):
    """Base user model for authentication"""
    
    def __repr__(self):
        return f'<User {getattr(self, "email", "Unknown")}>'
    
    def set_password(self, password):
        """Hash and set password using bcrypt"""
        if not password:
            raise ValueError("Password cannot be empty")
        
        # Validate password strength
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        
        # Hash password with bcrypt
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches the hash"""
        if not getattr(self, 'password_hash', None) or not password:
            return False
        
        try:
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        except Exception:
            return False
    
    @property
    def password(self):
        """Prevent password from being read directly"""
        raise AttributeError('password is not a readable attribute')
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': getattr(self, 'id', None),
            'firebase_uid': getattr(self, 'firebase_uid', None),
            'email': getattr(self, 'email', None),
            'user_type': getattr(self, 'user_type', None),
            'first_name': getattr(self, 'first_name', None),
            'last_name': getattr(self, 'last_name', None),
            'phone_number': getattr(self, 'phone_number', None),
            'is_active': getattr(self, 'is_active', True),
            'is_admin': getattr(self, 'is_admin', False),
            'is_firebase_user': getattr(self, 'is_firebase_user', False),
            'created_at': getattr(self, 'created_at', datetime.utcnow()).isoformat() if isinstance(getattr(self, 'created_at', None), datetime) else getattr(self, 'created_at', datetime.utcnow().isoformat()),
            'updated_at': getattr(self, 'updated_at', datetime.utcnow()).isoformat() if isinstance(getattr(self, 'updated_at', None), datetime) else getattr(self, 'updated_at', datetime.utcnow().isoformat()),
            'password_hash': getattr(self, 'password_hash', None)
        }
    
    def update_profile(self, **kwargs):
        """Update user profile fields using Firestore"""
        for field, value in kwargs.items():
            if value is not None:
                setattr(self, field, value)
        
        if hasattr(self, 'id'):
            self.updated_at = datetime.utcnow()
            db.collection('users').document(self.id).update(kwargs)
        return True
    
    def get_full_profile_data(self):
        """Get complete profile data including type-specific information"""
        profile_data = self.to_dict()
        profile_data.pop('password_hash', None)
        
        if not hasattr(self, 'id'):
            return profile_data
            
        profiles_ref = db.collection('profiles').where('user_id', '==', self.id).limit(1).stream()
        profile_doc = None
        for p in profiles_ref:
            profile_doc = p.to_dict()
            profile_doc['id'] = p.id
            break
            
        if profile_doc:
            profile_data['profile'] = {
                'id': profile_doc.get('id'),
                'created_at': profile_doc.get('created_at'),
                'updated_at': profile_doc.get('updated_at')
            }
            
            # Add type-specific profile data using Firestore docs
            if self.user_type == 'employer':
                emp_ref = db.collection('employer_profiles').where('profile_id', '==', profile_doc['id']).limit(1).stream()
                for doc in emp_ref:
                    p = doc.to_dict()
                    profile_data['profile']['employer'] = {
                        'company_name': p.get('company_name'),
                        'location': p.get('location'),
                        'description': p.get('description')
                    }
            elif self.user_type == 'housegirl':
                hg_ref = db.collection('housegirl_profiles').where('profile_id', '==', profile_doc['id']).limit(1).stream()
                for doc in hg_ref:
                    p = doc.to_dict()
                    profile_data['profile']['housegirl'] = {
                        'age': p.get('age'),
                        'bio': p.get('bio'),
                        'current_location': p.get('current_location'),
                        'location': p.get('location'),
                        'education': p.get('education'),
                        'experience': p.get('experience'),
                        'expected_salary': p.get('expected_salary'),
                        'accommodation_type': p.get('accommodation_type'),
                        'tribe': p.get('tribe'),
                        'is_available': p.get('is_available'),
                        'profile_photo_url': p.get('profile_photo_url')
                    }
            elif self.user_type == 'agency':
                ag_ref = db.collection('agency_profiles').where('profile_id', '==', profile_doc['id']).limit(1).stream()
                for doc in ag_ref:
                    p = doc.to_dict()
                    profile_data['profile']['agency'] = {
                        'agency_name': p.get('agency_name'),
                        'location': p.get('location'),
                        'description': p.get('description'),
                        'license_number': p.get('license_number')
                    }
        
        return profile_data
    
    @classmethod
    def find_by_firebase_uid(cls, firebase_uid):
        """Class method to find user by Firebase UID using Firestore"""
        docs = db.collection('users').where('firebase_uid', '==', firebase_uid).limit(1).stream()
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            return cls(**data)
        return None
    
    @classmethod
    def find_by_email(cls, email):
        """Class method to find user by email using Firestore"""
        docs = db.collection('users').where('email', '==', email).limit(1).stream()
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            return cls(**data)
        return None
    
    @classmethod
    def create_user(cls, firebase_uid, email, user_type=None, **kwargs):
        """Class method to create a new user using Firestore"""
        if user_type not in ['employer', 'housegirl', 'agency']:
            raise ValueError('A valid user_type is required to create a user.')
        
        user_id = f"user_{firebase_uid}"
        user_info = {
            'id': user_id,
            'firebase_uid': firebase_uid,
            'email': email,
            'user_type': user_type,
            'first_name': kwargs.get('first_name', ''),
            'last_name': kwargs.get('last_name', ''),
            'phone_number': kwargs.get('phone_number'),
            'is_active': True,
            'is_admin': False,
            'is_firebase_user': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('users').document(user_id).set(user_info)
        return cls(**user_info)
    
    @classmethod
    def get_user_with_profile(cls, user_id):
        """Get user with profile data using Firestore"""
        doc_ref = db.collection('users').document(user_id).get()
        if not doc_ref.exists:
            return None
            
        user = cls(**doc_ref.to_dict())
        
        profile_ref = db.collection('profiles').where('user_id', '==', user_id).limit(1).stream()
        user.profile = None
        for p in profile_ref:
            user.profile = Profile(**p.to_dict())
            if user.user_type == 'employer':
                emp_ref = db.collection('employer_profiles').where('profile_id', '==', user.profile.id).limit(1).stream()
                user.profile.employer_profile = next((EmployerProfile(**doc.to_dict()) for doc in emp_ref), None)
            elif user.user_type == 'housegirl':
                hg_ref = db.collection('housegirl_profiles').where('profile_id', '==', user.profile.id).limit(1).stream()
                user.profile.housegirl_profile = next((HousegirlProfile(**doc.to_dict()) for doc in hg_ref), None)
            elif user.user_type == 'agency':
                ag_ref = db.collection('agency_profiles').where('profile_id', '==', user.profile.id).limit(1).stream()
                user.profile.agency_profile = next((AgencyProfile(**doc.to_dict()) for doc in ag_ref), None)
            break
            
        return user
    
    @classmethod
    def get_users_by_type(cls, user_type):
        """Get users by type using Firestore"""
        docs = db.collection('users').where('user_type', '==', user_type).stream()
        users = []
        for doc in docs:
            u = cls(**doc.to_dict())
            users.append(u)
        return users
    
    @classmethod
    def search_users(cls, search_term):
        """Search users by name or email using Firestore (Case sensitive simulation)"""
        users = []
        docs = db.collection('users').stream()
        search_lower = search_term.lower()
        for doc in docs:
            d = doc.to_dict()
            fn = d.get('first_name', '').lower()
            ln = d.get('last_name', '').lower()
            em = d.get('email', '').lower()
            if search_lower in fn or search_lower in ln or search_lower in em:
                users.append(cls(**d))
        return users

class Profile(BaseModel):
    """Extended profile information"""
    
    def __repr__(self):
        return f'<Profile {getattr(self, "id", "Unknown")}>'
    
    def create_employer_profile(self, **kwargs):
        """Create employer profile using Firestore"""
        if getattr(self, 'employer_profile', None):
            raise ValueError("Employer profile already exists")
        
        emp_id = f"emp_{self.id}"
        data = {
            'id': emp_id,
            'profile_id': self.id,
            'company_name': kwargs.get('company_name'),
            'location': kwargs.get('location'),
            'description': kwargs.get('description'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('employer_profiles').document(emp_id).set(data)
        emp_prof = EmployerProfile(**data)
        self.employer_profile = emp_prof
        return emp_prof
    
    def create_housegirl_profile(self, **kwargs):
        """Create housegirl profile using Firestore"""
        if getattr(self, 'housegirl_profile', None):
            raise ValueError("Housegirl profile already exists")
        
        hg_id = f"hg_{self.id}"
        data = {
            'id': hg_id,
            'profile_id': self.id,
            'age': kwargs.get('age'),
            'bio': kwargs.get('bio'),
            'current_location': kwargs.get('current_location'),
            'location': kwargs.get('location'),
            'education': kwargs.get('education'),
            'experience': kwargs.get('experience'),
            'expected_salary': kwargs.get('expected_salary'),
            'accommodation_type': kwargs.get('accommodation_type'),
            'tribe': kwargs.get('tribe'),
            'is_available': kwargs.get('is_available', True),
            'profile_photo_url': kwargs.get('profile_photo_url'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('housegirl_profiles').document(hg_id).set(data)
        hg_prof = HousegirlProfile(**data)
        self.housegirl_profile = hg_prof
        return hg_prof
    
    def create_agency_profile(self, **kwargs):
        """Create agency profile using Firestore"""
        if getattr(self, 'agency_profile', None):
            raise ValueError("Agency profile already exists")
        
        ag_id = f"ag_{self.id}"
        data = {
            'id': ag_id,
            'profile_id': self.id,
            'agency_name': kwargs.get('agency_name'),
            'location': kwargs.get('location'),
            'description': kwargs.get('description'),
            'license_number': kwargs.get('license_number'),
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        db.collection('agency_profiles').document(ag_id).set(data)
        ag_prof = AgencyProfile(**data)
        self.agency_profile = ag_prof
        return ag_prof

class EmployerProfile(BaseModel):
    """Employer-specific profile data"""
    def __repr__(self):
        return f'<EmployerProfile {getattr(self, "company_name", "Unknown")}>'

class HousegirlProfile(BaseModel):
    """Housegirl-specific profile data"""
    def __repr__(self):
        return f'<HousegirlProfile {getattr(self, "id", "Unknown")}>'
    
    def to_dict(self):
        """Convert housegirl profile to dictionary for JSON serialization"""
        return dict(self.__dict__)
    
    @classmethod
    def find_available_workers(cls):
        docs = db.collection('housegirl_profiles').where('is_available', '==', True).stream()
        return [cls(**d.to_dict()) for d in docs]
    
    @classmethod
    def find_by_location(cls, location):
        docs = db.collection('housegirl_profiles').stream()
        workers = []
        loc = location.lower()
        for doc in docs:
            d = doc.to_dict()
            ll = d.get('location', '').lower()
            cl = d.get('current_location', '').lower()
            if loc in ll or loc in cl:
                workers.append(cls(**d))
        return workers
    
    @classmethod
    def find_by_salary_range(cls, min_salary, max_salary):
        docs = db.collection('housegirl_profiles').where('expected_salary', '>=', min_salary).where('expected_salary', '<=', max_salary).stream()
        return [cls(**d.to_dict()) for d in docs]
    
    @classmethod
    def find_by_experience(cls, experience_level):
        docs = db.collection('housegirl_profiles').stream()
        return [cls(**d.to_dict()) for d in docs if experience_level.lower() in d.to_dict().get('experience', '').lower()]
    
    @classmethod
    def find_by_education(cls, education_level):
        docs = db.collection('housegirl_profiles').stream()
        return [cls(**d.to_dict()) for d in docs if education_level.lower() in d.to_dict().get('education', '').lower()]
    
    @classmethod
    def search_workers(cls, search_term):
        docs = db.collection('housegirl_profiles').stream()
        workers = []
        s = search_term.lower()
        for doc in docs:
            d = doc.to_dict()
            if s in d.get('bio', '').lower() or s in d.get('location', '').lower() or s in d.get('experience', '').lower() or s in d.get('education', '').lower():
                workers.append(cls(**d))
        return workers
    
    @classmethod
    def get_workers_with_profile(cls):
        docs = db.collection('housegirl_profiles').stream()
        workers = []
        for doc in docs:
            hg = cls(**doc.to_dict())
            if hasattr(hg, 'profile_id'):
                p_doc = db.collection('profiles').document(hg.profile_id).get()
                if p_doc.exists:
                    p = Profile(**p_doc.to_dict())
                    if hasattr(p, 'user_id'):
                        u_doc = db.collection('users').document(p.user_id).get()
                        if u_doc.exists:
                            p.user = User(**u_doc.to_dict())
                    hg.profile = p
            workers.append(hg)
        return workers

class AgencyProfile(BaseModel):
    """Agency-specific profile data"""
    def __repr__(self):
        return f'<AgencyProfile {getattr(self, "agency_name", "Unknown")}>'

class Agency(BaseModel):
    """Agency marketplace data"""
    def __repr__(self):
        return f'<Agency {getattr(self, "name", "Unknown")}>'
    
    def to_dict(self):
        """Convert agency to dictionary for JSON serialization"""
        return dict(self.__dict__)
    
    @classmethod
    def find_verified_agencies(cls):
        docs = db.collection('agencies').where('verification_status', '==', 'verified').stream()
        return [cls(**d.to_dict()) for d in docs]
    
    @classmethod
    def find_by_location(cls, location):
        docs = db.collection('agencies').stream()
        return [cls(**d.to_dict()) for d in docs if location.lower() in d.to_dict().get('location', '').lower()]
    
    @classmethod
    def find_by_rating(cls, min_rating=4.0):
        docs = db.collection('agencies').where('rating', '>=', min_rating).stream()
        agencies = [cls(**d.to_dict()) for d in docs]
        agencies.sort(key=lambda x: getattr(x, 'rating', 0), reverse=True)
        return agencies
    
    @classmethod
    def find_by_subscription_tier(cls, tier):
        docs = db.collection('agencies').where('subscription_tier', '==', tier).stream()
        return [cls(**d.to_dict()) for d in docs]
    
    @classmethod
    def search_agencies(cls, search_term):
        docs = db.collection('agencies').stream()
        agencies = []
        s = search_term.lower()
        for doc in docs:
            d = doc.to_dict()
            if s in d.get('name', '').lower() or s in d.get('description', '').lower():
                agencies.append(cls(**d))
        return agencies

class AgencyWorker(BaseModel):
    def __repr__(self):
        return f'<AgencyWorker {getattr(self, "agency_id", "Unknown")}-{getattr(self, "worker_id", "Unknown")}>'

class AgencyClient(BaseModel):
    def __repr__(self):
        return f'<AgencyClient {getattr(self, "agency_id", "Unknown")}-{getattr(self, "client_id", "Unknown")}>'

class AgencySubscription(BaseModel):
    def __repr__(self):
        return f'<AgencySubscription {getattr(self, "agency_id", "Unknown")}-{getattr(self, "tier", "Unknown")}>'

class PaymentPackage(BaseModel):
    def __repr__(self):
        return f'<PaymentPackage {getattr(self, "name", "Unknown")}>'

class UserPurchase(BaseModel):
    def __repr__(self):
        return f'<UserPurchase {getattr(self, "user_id", "Unknown")}-{getattr(self, "package_id", "Unknown")}>'

class ContactAccess(BaseModel):
    def __repr__(self):
        return f'<ContactAccess {getattr(self, "user_id", "Unknown")}-{getattr(self, "target_profile_id", "Unknown")}>'

class Photo(BaseModel):
    def __repr__(self):
        return f'<Photo {getattr(self, "id", "Unknown")}>'

class AgencyPayment(BaseModel):
    def __repr__(self):
        return f'<AgencyPayment {getattr(self, "agency_id", "Unknown")}-{getattr(self, "payment_type", "Unknown")}>'

class JobPosting(BaseModel):
    def __repr__(self):
        return f'<JobPosting {getattr(self, "title", "Unknown")} by {getattr(self, "employer_id", "Unknown")}>'

class JobApplication(BaseModel):
    def __repr__(self):
        return f'<JobApplication {getattr(self, "housegirl_id", "Unknown")} for {getattr(self, "job_id", "Unknown")}>'
