# Domestic Connect - Development Guide

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### **Setup Commands**

**Option 1: Automated Setup (Recommended)**
```bash
# For Unix/Linux/macOS
chmod +x setup.sh
./setup.sh

# For Windows
setup.bat
```

**Option 2: Manual Setup**
```bash
# 1. Install frontend dependencies
npm install

# 2. Setup backend
cd backend
pip install -r requirements.txt
python cli.py init

# 3. Create environment files
cp env.example .env
cp ../env.example ../.env
```

### **Running the Application**

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### **Access Points**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

## 🏗️ **Project Structure**

```
Domestic_Connect/
├── backend/                 # Flask API backend
│   ├── app/                # Application code
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── migrations/         # Database migrations
│   ├── tests/              # Backend tests
│   ├── uploads/            # File uploads
│   ├── requirements.txt    # Python dependencies
│   ├── config.py          # Configuration
│   ├── cli.py             # CLI commands
│   └── run.py             # Application entry point
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and API
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── public/                 # Static assets
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

## 🔧 **Configuration**

### **Environment Variables**

**Backend (.env)**
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///domestic_connect_dev.db
UPLOAD_FOLDER=uploads
CORS_ORIGINS=http://localhost:5173

# Firebase Configuration (optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# M-Pesa Configuration (optional)
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_PASSKEY=your_passkey_here
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_ENVIRONMENT=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Domestic Connect
VITE_APP_VERSION=1.0.0

# Firebase Configuration (if using Firebase Auth)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 🛠️ **Development Commands**

### **Backend Commands**
```bash
cd backend

# Initialize database
python cli.py init

# Reset database (WARNING: Deletes all data)
python cli.py reset

# Migrate data from JSON (if needed)
python cli.py migrate

# Show database statistics
python cli.py stats

# Create admin user
python cli.py create-admin

# Run development server
python run.py

# Run tests
python -m pytest
```

### **Frontend Commands**
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Start backend (from root)
npm run start:backend

# Setup backend (from root)
npm run setup:backend
```

## 🔌 **API Endpoints**

### **Authentication**
- `POST /api/auth/verify` - Verify Firebase token
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/update-profile` - Update user profile

### **Profiles**
- `GET /api/profiles/` - Get all profiles (with filtering)
- `GET /api/profiles/<id>` - Get specific profile
- `POST /api/profiles/` - Create new profile
- `PUT /api/profiles/<id>` - Update profile

### **Employers**
- `GET /api/employers/` - Get all employers
- `GET /api/employers/<id>` - Get specific employer

### **Workers**
- `GET /api/housegirls/` - Get all housegirls (with filtering)
- `GET /api/housegirls/<id>` - Get specific housegirl

### **Agencies**
- `GET /api/agencies/` - Get all agencies
- `GET /api/agencies/<id>` - Get specific agency

### **Payments**
- `GET /api/payments/packages` - Get payment packages
- `POST /api/payments/purchase` - Create purchase
- `POST /api/payments/contact-access` - Unlock contact
- `GET /api/payments/my-purchases` - Get user purchases

### **M-Pesa Integration**
- `POST /api/mpesa/stkpush` - Initiate STK Push
- `POST /api/mpesa/transaction-status` - Check transaction status
- `POST /api/mpesa/callback` - M-Pesa callback webhook
- `GET /api/mpesa/health` - Health check

### **Photos**
- `POST /api/photos/upload` - Upload photo
- `DELETE /api/photos/<id>` - Delete photo
- `GET /api/photos/profile/<profile_id>` - Get profile photos

### **Admin**
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/agencies` - Get all agencies
- `PUT /api/admin/agencies/<id>/verify` - Verify agency

## 🗄️ **Database Schema**

### **Core Models**
- **User**: Base authentication model
- **Profile**: Extended profile information
- **EmployerProfile**: Employer-specific data
- **HousegirlProfile**: Worker-specific data
- **AgencyProfile**: Agency-specific data

### **Agency System**
- **Agency**: Agency marketplace data
- **AgencyWorker**: Worker-agency relationships
- **AgencyClient**: Client-agency relationships
- **AgencySubscription**: Subscription management
- **AgencyPayment**: Payment tracking

### **Payment System**
- **PaymentPackage**: Contact access packages
- **UserPurchase**: Purchase tracking
- **ContactAccess**: Contact unlocking

### **Media**
- **Photo**: Photo management

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend
python -m pytest
```

### **Frontend Testing**
```bash
npm test
```

## 🚀 **Deployment**

### **Production Setup**

1. **Environment Configuration**
   - Set production environment variables
   - Use PostgreSQL instead of SQLite
   - Configure Firebase production credentials
   - Set up M-Pesa production credentials

2. **Backend Deployment**
   ```bash
   cd backend
   pip install -r requirements.txt
   python cli.py init
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Frontend Deployment**
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting service
   ```

### **Docker Deployment**
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔒 **Security Considerations**

- All passwords are hashed with bcrypt
- JWT tokens with expiration
- Input validation and sanitization
- CORS configuration
- Rate limiting (to be implemented)
- HTTPS in production

## 📊 **Monitoring & Logging**

- Application logs in backend/logs/
- Error tracking with proper HTTP status codes
- Database query logging in development
- Performance monitoring (to be implemented)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 **Support**

For technical support:
- Check the logs in `backend/logs/`
- Verify environment variables
- Test API endpoints with Postman/curl
- Check database connectivity

## 🏷️ **Version History**

- **v1.0.0**: Initial release with Flask backend
- **v0.9.0**: JSON Server backend (deprecated)
- **v0.8.0**: M-Pesa integration
- **v0.7.0**: Agency marketplace features

---

**Happy coding! 🎉**
