from app import db
from datetime import datetime
from sqlalchemy import Index

class User(db.Model):
    """Base user model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.String(50), primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
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
