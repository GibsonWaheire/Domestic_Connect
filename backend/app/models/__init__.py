from app import db
from datetime import datetime
from sqlalchemy import Index
import bcrypt

class User(db.Model):
    """Base user model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(50), primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=True, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=True)  # For local auth
    user_type = db.Column(db.Enum('employer', 'housegirl', 'agency', name='user_type'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(20))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = db.relationship('Profile', backref='user', uselist=False, cascade='all, delete-orphan')
    purchases = db.relationship('UserPurchase', backref='user', lazy='dynamic')
    contact_access = db.relationship('ContactAccess', backref='user', lazy='dynamic')
    
    def __repr__(self):
        return f'<User {self.email}>'
    
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
        if not self.password_hash or not password:
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
            'id': self.id,
            'email': self.email,
            'user_type': self.user_type,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone_number': self.phone_number,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    def update_profile(self, **kwargs):
        """Update user profile fields using SQLAlchemy ORM"""
        from app import db
        
        for field, value in kwargs.items():
            if hasattr(self, field) and value is not None:
                setattr(self, field, value)
        
        try:
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            raise e
    
    def get_full_profile_data(self):
        """Get complete profile data including type-specific information"""
        profile_data = self.to_dict()
        
        if self.profile:
            profile_data['profile'] = {
                'id': self.profile.id,
                'created_at': self.profile.created_at.isoformat(),
                'updated_at': self.profile.updated_at.isoformat()
            }
            
            # Add type-specific profile data using SQLAlchemy relationships
            if self.user_type == 'employer' and self.profile.employer_profile:
                profile_data['profile']['employer'] = {
                    'company_name': self.profile.employer_profile.company_name,
                    'location': self.profile.employer_profile.location,
                    'description': self.profile.employer_profile.description
                }
            elif self.user_type == 'housegirl' and self.profile.housegirl_profile:
                profile_data['profile']['housegirl'] = {
                    'age': self.profile.housegirl_profile.age,
                    'bio': self.profile.housegirl_profile.bio,
                    'current_location': self.profile.housegirl_profile.current_location,
                    'location': self.profile.housegirl_profile.location,
                    'education': self.profile.housegirl_profile.education,
                    'experience': self.profile.housegirl_profile.experience,
                    'expected_salary': self.profile.housegirl_profile.expected_salary,
                    'accommodation_type': self.profile.housegirl_profile.accommodation_type,
                    'tribe': self.profile.housegirl_profile.tribe,
                    'is_available': self.profile.housegirl_profile.is_available,
                    'profile_photo_url': self.profile.housegirl_profile.profile_photo_url
                }
            elif self.user_type == 'agency' and self.profile.agency_profile:
                profile_data['profile']['agency'] = {
                    'agency_name': self.profile.agency_profile.agency_name,
                    'location': self.profile.agency_profile.location,
                    'description': self.profile.agency_profile.description,
                    'license_number': self.profile.agency_profile.license_number
                }
        
        return profile_data
    
    @classmethod
    def find_by_firebase_uid(cls, firebase_uid):
        """Class method to find user by Firebase UID using SQLAlchemy ORM"""
        return cls.query.filter_by(firebase_uid=firebase_uid).first()
    
    @classmethod
    def find_by_email(cls, email):
        """Class method to find user by email using SQLAlchemy ORM"""
        return cls.query.filter_by(email=email).first()
    
    @classmethod
    def create_user(cls, firebase_uid, email, user_type='employer', **kwargs):
        """Class method to create a new user using SQLAlchemy ORM"""
        from app import db
        
        user = cls(
            id=f"user_{firebase_uid}",
            firebase_uid=firebase_uid,
            email=email,
            user_type=user_type,
            first_name=kwargs.get('first_name', ''),
            last_name=kwargs.get('last_name', ''),
            phone_number=kwargs.get('phone_number')
        )
        
        db.session.add(user)
        db.session.commit()
        return user
    
    @classmethod
    def get_user_with_profile(cls, user_id):
        """Get user with profile data using SQLAlchemy joinedload for optimization"""
        from sqlalchemy.orm import joinedload
        
        return cls.query.options(
            joinedload(cls.profile).joinedload(Profile.employer_profile),
            joinedload(cls.profile).joinedload(Profile.housegirl_profile),
            joinedload(cls.profile).joinedload(Profile.agency_profile)
        ).filter_by(id=user_id).first()
    
    @classmethod
    def get_users_by_type(cls, user_type):
        """Get users by type with optimized relationship loading"""
        from sqlalchemy.orm import joinedload
        
        return cls.query.options(
            joinedload(cls.profile)
        ).filter_by(user_type=user_type).all()
    
    @classmethod
    def search_users(cls, search_term):
        """Search users by name or email using SQLAlchemy ORM with case-insensitive search"""
        return cls.query.filter(
            cls.first_name.ilike(f'%{search_term}%') |
            cls.last_name.ilike(f'%{search_term}%') |
            cls.email.ilike(f'%{search_term}%')
        ).all()

class Profile(db.Model):
    """Extended profile information"""
    __tablename__ = 'profiles'
    
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employer_profile = db.relationship('EmployerProfile', backref='profile', uselist=False, cascade='all, delete-orphan')
    housegirl_profile = db.relationship('HousegirlProfile', backref='profile', uselist=False, cascade='all, delete-orphan')
    agency_profile = db.relationship('AgencyProfile', backref='profile', uselist=False, cascade='all, delete-orphan')
    photos = db.relationship('Photo', backref='profile', lazy='dynamic', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Profile {self.id}>'
    
    def create_employer_profile(self, **kwargs):
        """Create employer profile using SQLAlchemy ORM"""
        from app import db
        
        if self.employer_profile:
            raise ValueError("Employer profile already exists")
        
        employer_profile = EmployerProfile(
            id=f"emp_{self.id}",
            profile_id=self.id,
            company_name=kwargs.get('company_name'),
            location=kwargs.get('location'),
            description=kwargs.get('description')
        )
        
        db.session.add(employer_profile)
        db.session.commit()
        return employer_profile
    
    def create_housegirl_profile(self, **kwargs):
        """Create housegirl profile using SQLAlchemy ORM"""
        from app import db
        
        if self.housegirl_profile:
            raise ValueError("Housegirl profile already exists")
        
        housegirl_profile = HousegirlProfile(
            id=f"hg_{self.id}",
            profile_id=self.id,
            age=kwargs.get('age'),
            bio=kwargs.get('bio'),
            current_location=kwargs.get('current_location'),
            location=kwargs.get('location'),
            education=kwargs.get('education'),
            experience=kwargs.get('experience'),
            expected_salary=kwargs.get('expected_salary'),
            accommodation_type=kwargs.get('accommodation_type'),
            tribe=kwargs.get('tribe'),
            is_available=kwargs.get('is_available', True),
            profile_photo_url=kwargs.get('profile_photo_url')
        )
        
        db.session.add(housegirl_profile)
        db.session.commit()
        return housegirl_profile
    
    def create_agency_profile(self, **kwargs):
        """Create agency profile using SQLAlchemy ORM"""
        from app import db
        
        if self.agency_profile:
            raise ValueError("Agency profile already exists")
        
        agency_profile = AgencyProfile(
            id=f"ag_{self.id}",
            profile_id=self.id,
            agency_name=kwargs.get('agency_name'),
            location=kwargs.get('location'),
            description=kwargs.get('description'),
            license_number=kwargs.get('license_number')
        )
        
        db.session.add(agency_profile)
        db.session.commit()
        return agency_profile

class EmployerProfile(db.Model):
    """Employer-specific profile data"""
    __tablename__ = 'employer_profiles'
    
    id = db.Column(db.String(50), primary_key=True)
    profile_id = db.Column(db.String(50), db.ForeignKey('profiles.id'), nullable=False, unique=True)
    company_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agency_clients = db.relationship('AgencyClient', backref='employer_profile', lazy='dynamic')
    
    def __repr__(self):
        return f'<EmployerProfile {self.company_name}>'

class HousegirlProfile(db.Model):
    """Housegirl-specific profile data"""
    __tablename__ = 'housegirl_profiles'
    
    id = db.Column(db.String(50), primary_key=True)
    profile_id = db.Column(db.String(50), db.ForeignKey('profiles.id'), nullable=False, unique=True)
    age = db.Column(db.Integer)
    bio = db.Column(db.Text)
    current_location = db.Column(db.String(100))
    location = db.Column(db.String(100))
    education = db.Column(db.String(50))
    experience = db.Column(db.String(50))
    expected_salary = db.Column(db.Integer)
    accommodation_type = db.Column(db.String(20))
    tribe = db.Column(db.String(50))
    is_available = db.Column(db.Boolean, default=True)
    profile_photo_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agency_workers = db.relationship('AgencyWorker', backref='housegirl_profile', lazy='dynamic')
    contact_access = db.relationship('ContactAccess', backref='housegirl_profile', lazy='dynamic')
    
    def __repr__(self):
        return f'<HousegirlProfile {self.id}>'
    
    def to_dict(self):
        """Convert housegirl profile to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'age': self.age,
            'bio': self.bio,
            'current_location': self.current_location,
            'location': self.location,
            'education': self.education,
            'experience': self.experience,
            'expected_salary': self.expected_salary,
            'accommodation_type': self.accommodation_type,
            'tribe': self.tribe,
            'is_available': self.is_available,
            'profile_photo_url': self.profile_photo_url,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @classmethod
    def find_available_workers(cls):
        """Find all available housegirls using SQLAlchemy ORM"""
        return cls.query.filter_by(is_available=True).all()
    
    @classmethod
    def find_by_location(cls, location):
        """Find housegirls by location using SQLAlchemy ORM with case-insensitive search"""
        return cls.query.filter(
            cls.location.ilike(f'%{location}%') |
            cls.current_location.ilike(f'%{location}%')
        ).all()
    
    @classmethod
    def find_by_salary_range(cls, min_salary, max_salary):
        """Find housegirls within salary range using SQLAlchemy ORM"""
        return cls.query.filter(
            cls.expected_salary >= min_salary,
            cls.expected_salary <= max_salary
        ).all()
    
    @classmethod
    def find_by_experience(cls, experience_level):
        """Find housegirls by experience level using SQLAlchemy ORM"""
        return cls.query.filter(cls.experience.ilike(f'%{experience_level}%')).all()
    
    @classmethod
    def find_by_education(cls, education_level):
        """Find housegirls by education level using SQLAlchemy ORM"""
        return cls.query.filter(cls.education.ilike(f'%{education_level}%')).all()
    
    @classmethod
    def search_workers(cls, search_term):
        """Search housegirls by bio, location, or experience using SQLAlchemy ORM"""
        return cls.query.filter(
            cls.bio.ilike(f'%{search_term}%') |
            cls.location.ilike(f'%{search_term}%') |
            cls.experience.ilike(f'%{search_term}%') |
            cls.education.ilike(f'%{search_term}%')
        ).all()
    
    @classmethod
    def get_workers_with_profile(cls):
        """Get housegirls with their user profile using SQLAlchemy joinedload"""
        from sqlalchemy.orm import joinedload
        
        return cls.query.options(
            joinedload(cls.profile).joinedload(Profile.user)
        ).all()

class AgencyProfile(db.Model):
    """Agency-specific profile data"""
    __tablename__ = 'agency_profiles'
    
    id = db.Column(db.String(50), primary_key=True)
    profile_id = db.Column(db.String(50), db.ForeignKey('profiles.id'), nullable=False, unique=True)
    agency_name = db.Column(db.String(100))
    location = db.Column(db.String(100))
    description = db.Column(db.Text)
    license_number = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<AgencyProfile {self.agency_name}>'

class Agency(db.Model):
    """Agency marketplace data"""
    __tablename__ = 'agencies'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True)
    verification_status = db.Column(db.String(20), default='pending')
    subscription_tier = db.Column(db.String(20), default='basic')
    rating = db.Column(db.Float, default=0.0)
    services = db.Column(db.JSON)  # List of services
    location = db.Column(db.String(100))
    monthly_fee = db.Column(db.Integer, default=0)
    commission_rate = db.Column(db.Float, default=0.0)
    verified_workers = db.Column(db.Integer, default=0)
    successful_placements = db.Column(db.Integer, default=0)
    description = db.Column(db.Text)
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))
    website = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    agency_workers = db.relationship('AgencyWorker', backref='agency', lazy='dynamic')
    agency_clients = db.relationship('AgencyClient', backref='agency', lazy='dynamic')
    subscriptions = db.relationship('AgencySubscription', backref='agency', lazy='dynamic')
    payments = db.relationship('AgencyPayment', backref='agency', lazy='dynamic')
    
    def __repr__(self):
        return f'<Agency {self.name}>'
    
    def to_dict(self):
        """Convert agency to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'license_number': self.license_number,
            'verification_status': self.verification_status,
            'subscription_tier': self.subscription_tier,
            'rating': self.rating,
            'services': self.services,
            'location': self.location,
            'monthly_fee': self.monthly_fee,
            'commission_rate': self.commission_rate,
            'verified_workers': self.verified_workers,
            'successful_placements': self.successful_placements,
            'description': self.description,
            'contact_email': self.contact_email,
            'contact_phone': self.contact_phone,
            'website': self.website,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
    
    @classmethod
    def find_verified_agencies(cls):
        """Find all verified agencies using SQLAlchemy ORM"""
        return cls.query.filter_by(verification_status='verified').all()
    
    @classmethod
    def find_by_location(cls, location):
        """Find agencies by location using SQLAlchemy ORM"""
        return cls.query.filter(cls.location.ilike(f'%{location}%')).all()
    
    @classmethod
    def find_by_rating(cls, min_rating=4.0):
        """Find agencies with minimum rating using SQLAlchemy ORM"""
        return cls.query.filter(cls.rating >= min_rating).order_by(cls.rating.desc()).all()
    
    @classmethod
    def find_by_subscription_tier(cls, tier):
        """Find agencies by subscription tier using SQLAlchemy ORM"""
        return cls.query.filter_by(subscription_tier=tier).all()
    
    @classmethod
    def search_agencies(cls, search_term):
        """Search agencies by name or description using SQLAlchemy ORM"""
        return cls.query.filter(
            cls.name.ilike(f'%{search_term}%') | 
            cls.description.ilike(f'%{search_term}%')
        ).all()

class AgencyWorker(db.Model):
    """Agency-worker relationships"""
    __tablename__ = 'agency_workers'
    
    id = db.Column(db.String(50), primary_key=True)
    agency_id = db.Column(db.String(50), db.ForeignKey('agencies.id'), nullable=False)
    worker_id = db.Column(db.String(50), db.ForeignKey('housegirl_profiles.id'), nullable=False)
    verification_status = db.Column(db.String(20), default='pending')
    training_certificates = db.Column(db.JSON)  # List of certificates
    background_check_status = db.Column(db.String(20), default='pending')
    membership_fee = db.Column(db.Integer, default=500)
    join_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_agency_worker', 'agency_id', 'worker_id'),
    )
    
    def __repr__(self):
        return f'<AgencyWorker {self.agency_id}-{self.worker_id}>'

class AgencyClient(db.Model):
    """Agency-client relationships"""
    __tablename__ = 'agency_clients'
    
    id = db.Column(db.String(50), primary_key=True)
    agency_id = db.Column(db.String(50), db.ForeignKey('agencies.id'), nullable=False)
    client_id = db.Column(db.String(50), db.ForeignKey('employer_profiles.id'), nullable=False)
    hiring_fee = db.Column(db.Integer, default=1500)
    placement_status = db.Column(db.String(20), default='pending')
    hire_date = db.Column(db.DateTime, default=datetime.utcnow)
    worker_id = db.Column(db.String(50))
    commission_paid = db.Column(db.Integer, default=0)
    dispute_resolution = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<AgencyClient {self.agency_id}-{self.client_id}>'

class AgencySubscription(db.Model):
    """Agency subscription management"""
    __tablename__ = 'agency_subscriptions'
    
    id = db.Column(db.String(50), primary_key=True)
    agency_id = db.Column(db.String(50), db.ForeignKey('agencies.id'), nullable=False)
    tier = db.Column(db.String(20), nullable=False)
    monthly_fee = db.Column(db.Integer, nullable=False)
    features = db.Column(db.JSON)  # List of features
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<AgencySubscription {self.agency_id}-{self.tier}>'

class PaymentPackage(db.Model):
    """Contact access packages"""
    __tablename__ = 'payment_packages'
    
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    contacts_included = db.Column(db.Integer, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    purchases = db.relationship('UserPurchase', backref='payment_package', lazy='dynamic')
    
    def __repr__(self):
        return f'<PaymentPackage {self.name}>'

class UserPurchase(db.Model):
    """User payment tracking"""
    __tablename__ = 'user_purchases'
    
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    package_id = db.Column(db.String(50), db.ForeignKey('payment_packages.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='completed')
    payment_reference = db.Column(db.String(100))
    
    def __repr__(self):
        return f'<UserPurchase {self.user_id}-{self.package_id}>'

class ContactAccess(db.Model):
    """Contact unlocking tracking"""
    __tablename__ = 'contact_access'
    
    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id'), nullable=False)
    target_profile_id = db.Column(db.String(50), db.ForeignKey('housegirl_profiles.id'), nullable=False)
    accessed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Indexes
    __table_args__ = (
        Index('idx_user_target', 'user_id', 'target_profile_id'),
    )
    
    def __repr__(self):
        return f'<ContactAccess {self.user_id}-{self.target_profile_id}>'

class Photo(db.Model):
    """Photo management"""
    __tablename__ = 'photos'
    
    id = db.Column(db.String(50), primary_key=True)
    profile_id = db.Column(db.String(50), db.ForeignKey('profiles.id'), nullable=False)
    photo_url = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_primary = db.Column(db.Boolean, default=False)
    
    def __repr__(self):
        return f'<Photo {self.id}>'

class AgencyPayment(db.Model):
    """Agency payment tracking"""
    __tablename__ = 'agency_payments'
    
    id = db.Column(db.String(50), primary_key=True)
    agency_id = db.Column(db.String(50), db.ForeignKey('agencies.id'), nullable=False)
    payment_type = db.Column(db.String(20), nullable=False)  # subscription, commission, etc.
    amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), default='pending')
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)
    payment_reference = db.Column(db.String(100))
    description = db.Column(db.Text)
    
    def __repr__(self):
        return f'<AgencyPayment {self.agency_id}-{self.payment_type}>'
