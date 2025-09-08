# Domestic Connect Backend

A Flask-based REST API backend for the Domestic Connect application.

## Features

- **Firebase Authentication**: Secure user authentication using Firebase
- **SQLite Database**: Local database with SQLAlchemy ORM
- **RESTful API**: Complete API endpoints for all entities
- **Data Migration**: Script to migrate from JSON to SQLite
- **File Upload**: Photo upload functionality
- **Payment Integration**: Contact access and payment tracking

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///domestic_connect.db
UPLOAD_FOLDER=uploads
CORS_ORIGINS=http://localhost:5173

# Firebase Configuration (optional for development)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

### 3. Initialize Database

```bash
python cli.py init
```

### 4. Migrate Data (Optional)

To migrate existing data from `db.json`:

```bash
python cli.py migrate
```

### 5. Run the Server

```bash
python run.py
```

The API will be available at `http://localhost:5000`

## CLI Commands

```bash
# Initialize database
python cli.py init

# Reset database (WARNING: Deletes all data)
python cli.py reset

# Migrate data from db.json
python cli.py migrate

# Show database statistics
python cli.py stats

# Create admin user
python cli.py create-admin
```

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/update-profile` - Update user profile

### Profiles
- `GET /api/profiles/` - Get all profiles (with filtering)
- `GET /api/profiles/<id>` - Get specific profile
- `POST /api/profiles/` - Create new profile
- `PUT /api/profiles/<id>` - Update profile

### Housegirls
- `GET /api/housegirls/` - Get all housegirls (with filtering)
- `GET /api/housegirls/<id>` - Get specific housegirl

### Employers
- `GET /api/employers/` - Get all employers
- `GET /api/employers/<id>` - Get specific employer

### Agencies
- `GET /api/agencies/` - Get all agencies
- `GET /api/agencies/<id>` - Get specific agency

### Payments
- `GET /api/payments/packages` - Get payment packages
- `POST /api/payments/purchase` - Create purchase
- `POST /api/payments/contact-access` - Unlock contact
- `GET /api/payments/my-purchases` - Get user purchases

### Photos
- `POST /api/photos/upload` - Upload photo
- `DELETE /api/photos/<id>` - Delete photo
- `GET /api/photos/profile/<profile_id>` - Get profile photos

## Database Schema

### Core Models
- **User**: Base authentication model
- **Profile**: Extended profile information
- **EmployerProfile**: Employer-specific data
- **HousegirlProfile**: Worker-specific data
- **AgencyProfile**: Agency-specific data

### Agency System
- **Agency**: Agency marketplace data
- **AgencyWorker**: Worker-agency relationships
- **AgencyClient**: Client-agency relationships
- **AgencySubscription**: Subscription management
- **AgencyPayment**: Payment tracking

### Payment System
- **PaymentPackage**: Contact access packages
- **UserPurchase**: Purchase tracking
- **ContactAccess**: Contact unlocking

### Media
- **Photo**: Photo management

## Development

### Running Tests
```bash
python -m pytest
```

### Database Migrations
```bash
flask db init
flask db migrate -m "Description"
flask db upgrade
```

## Production Deployment

1. Set environment variables for production
2. Use PostgreSQL instead of SQLite
3. Configure Firebase production credentials
4. Set up proper file storage (AWS S3, etc.)
5. Use Gunicorn for production server

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```
