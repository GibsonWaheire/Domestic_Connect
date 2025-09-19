# Domestic Connect

**Connecting Kenyan families with trusted domestic workers and professional agencies**

## 🚀 **Live Demo**

**Experience the platform:** [https://domestic-connect.vercel.app/](https://domestic-connect.vercel.app/)

## 🏠 **What We Do**

Domestic Connect is Kenya's premier platform for connecting families with reliable domestic workers and professional agencies. We make finding trustworthy house help simple, safe, and efficient.

## 👥 **For Families (Employers)**

### **Find Trusted Domestic Workers**
- Browse verified profiles with photos and detailed information
- Filter by location, experience, skills, and availability
- Read reviews and ratings from other families
- Contact workers directly or through verified agencies

### **Safe & Secure Hiring**
- All workers are verified and background-checked
- Secure payment system with M-Pesa integration
- Dispute resolution support
- Replacement guarantees through agencies

### **Flexible Hiring Options**
- **Direct Hiring**: Connect with independent workers
- **Agency Hiring**: Work with professional agencies for premium service
- **Day Workers**: Find temporary help for specific needs

## 👩‍💼 **For Domestic Workers**

### **Create Professional Profiles**
- Build detailed profiles showcasing your skills and experience
- Upload professional photos and certifications
- Set your preferred salary and working conditions
- Highlight your specialties (cooking, childcare, elderly care, etc.)

### **Find Great Opportunities**
- Browse job postings from families across Kenya
- Apply for positions that match your skills
- Communicate directly with potential employers
- Work independently or join verified agencies

### **Grow Your Career**
- Access training and certification programs
- Build your reputation through reviews
- Increase your earning potential
- Join professional networks

## 🏢 **For Agencies**

### **Manage Your Business**
- Showcase your verified workers to families
- Manage client relationships and placements
- Track payments and commissions
- Access business analytics and reporting

### **Premium Services**
- **Basic Package**: KES 1,200 (Standard placement service)
- **Premium Package**: KES 1,500 (Enhanced support and guarantees)
- **International Package**: KES 2,000 (Specialized international placements)

## 💳 **Payment & Pricing**

### **For Families**
- **Contact Unlocking**: KES 200 (one-time fee to contact workers)
- **Agency Packages**: KES 1,200 - KES 2,000 (comprehensive service)
- **Secure Payments**: All payments processed through M-Pesa

### **For Workers**
- **Profile Creation**: Free
- **Job Applications**: Free
- **Agency Membership**: KES 500 (local) / KES 700 (international)

### **For Agencies**
- **Platform Commission**: 15-25% of placement fees
- **Premium Features**: Advanced analytics and support tools

## 🔒 **Safety & Trust**

### **Verification System**
- Identity verification for all users
- Background checks for workers
- Agency licensing verification
- Secure payment processing

### **Quality Assurance**
- Review and rating system
- Dispute resolution process
- Replacement guarantees
- Ongoing support and monitoring

## 📱 **How It Works**

### **For Families**
1. **Sign Up**: Create your family profile
2. **Browse**: Search for workers or agencies
3. **Connect**: Unlock contacts and start conversations
4. **Hire**: Complete the hiring process with secure payments
5. **Support**: Get ongoing support and assistance

### **For Workers**
1. **Register**: Create your professional profile
2. **Showcase**: Add photos, skills, and experience
3. **Apply**: Browse and apply for job opportunities
4. **Connect**: Communicate with potential employers
5. **Work**: Start your new position with confidence

### **For Agencies**
1. **Join**: Register your agency on the platform
2. **Verify**: Complete verification and licensing process
3. **Manage**: Upload and manage your worker profiles
4. **Connect**: Match workers with families
5. **Grow**: Build your business with our tools and support

## 🌟 **Why Choose Domestic Connect?**

### **For Families**
- ✅ **Verified Workers**: All profiles are verified and trustworthy
- ✅ **Multiple Options**: Choose from independent workers or agencies
- ✅ **Secure Payments**: Safe and transparent payment system
- ✅ **Support**: Ongoing assistance and dispute resolution
- ✅ **Flexibility**: Find workers for any schedule or need

### **For Workers**
- ✅ **Free to Start**: No upfront costs to create your profile
- ✅ **Better Opportunities**: Access to more job opportunities
- ✅ **Fair Pay**: Set your own rates and working conditions
- ✅ **Professional Growth**: Training and certification opportunities
- ✅ **Support Network**: Join a community of domestic workers

### **For Agencies**
- ✅ **Business Growth**: Access to a larger client base
- ✅ **Professional Tools**: Advanced management and analytics
- ✅ **Trust Building**: Verified platform increases client trust
- ✅ **Efficient Operations**: Streamlined placement process
- ✅ **Revenue Growth**: Multiple revenue streams and packages

## 📞 **Get Started Today**

**Ready to find your perfect match?** [Visit Domestic Connect](https://domestic-connect.vercel.app/)

### **Contact Us**
- **Email**: g.waheir00@gmail.com
- **Phone**: +254 726899113
- **WhatsApp**: +254 726899113

## 🚀 **Deployment Status**

✅ **Live and Ready**: The platform is fully deployed and operational
✅ **Mobile Optimized**: Works perfectly on all devices
✅ **Secure**: All data is protected and encrypted
✅ **Scalable**: Built to handle growth and increased usage

---

**Building a better future for domestic work in Kenya** 🇰🇪

## 🛠️ **Development Setup**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Domestic_Connect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python cli.py init
   python run.py
   ```

3. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### **Environment Configuration**

Create `.env` files in both `backend/` and root directories:

**Backend (.env)**
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///domestic_connect_dev.db
UPLOAD_FOLDER=uploads
CORS_ORIGINS=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Domestic Connect
```

### **Project Structure**

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
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
├── package.json           # Frontend dependencies
├── vite.config.ts         # Vite configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

### **Technology Stack**

**Backend**
- Flask (Python web framework)
- SQLAlchemy (ORM)
- Firebase Authentication
- SQLite/PostgreSQL (Database)
- Marshmallow (Serialization)

**Frontend**
- React 18 (UI framework)
- TypeScript (Type safety)
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router (Routing)
- TanStack Query (Data fetching)

**DevOps**
- Git (Version control)
- ESLint (Code linting)
- Prettier (Code formatting)
- Jest (Testing)

### **API Documentation**

The backend provides a RESTful API with the following endpoints:

- **Authentication**: `/api/auth/*`
- **Profiles**: `/api/profiles/*`
- **Employers**: `/api/employers/*`
- **Workers**: `/api/housegirls/*`
- **Agencies**: `/api/agencies/*`
- **Payments**: `/api/payments/*`
- **Photos**: `/api/photos/*`
- **Admin**: `/api/admin/*`

### **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **License**

This project is licensed under the MIT License.