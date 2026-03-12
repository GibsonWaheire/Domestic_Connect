# Domestic Connect 🇰🇪

**Kenya's Premier Platform for Domestic Workers & Families**

## 🚀 **Live Demo**

**👉 [Try it now: https://domestic-connect.co.ke/](https://domestic-connect.co.ke/)**

## 🛠️ **Local Development (Frontend + Backend)**

Run these steps to start the API and frontend in sync.

### 1) Start backend API (`http://localhost:5000`)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Health checks:

- `http://localhost:5000/api/health`
- `http://localhost:5000/api/health/detailed`

### 2) Start frontend (`http://localhost:5173`)

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

### 3) Confirm API base URL alignment

Frontend defaults to `http://localhost:5000` in development via `frontend/src/lib/apiConfig.ts`.

Optional override:

```bash
cd frontend
echo "VITE_API_BASE_URL=http://localhost:5000" > .env.local
```

## 🏠 **What We Do**

Connect Kenyan families with trusted domestic workers and professional agencies. Simple, safe, and efficient.

## 👥 **For Everyone**

### **👨‍👩‍👧‍👦 Families**
- Find verified domestic workers
- Browse by location, skills, experience
- Secure payments with M-Pesa
- Agency support available

### **👩‍💼 Domestic Workers**
- Create professional profiles
- Find great job opportunities
- Set your own rates
- Build your reputation

### **🏢 Agencies**
- Showcase your workers
- Manage client relationships
- Track placements and payments
- Grow your business

## 💰 **Simple Pricing**

- **Contact Workers**: KES 200 (one-time)
- **Agency Packages**: KES 1,200 - KES 2,000
- **Worker Profiles**: Free to create
- **All Payments**: Secure M-Pesa integration

## 🔒 **Safe & Trusted**

✅ All workers verified  
✅ Background checks  
✅ Secure payments  
✅ Dispute resolution  
✅ Replacement guarantees  

## 📱 **How It Works**

1. **Sign Up** → Choose your role (Family/Worker/Agency)
2. **Browse** → Find what you're looking for
3. **Connect** → Start conversations
4. **Hire** → Complete with secure payments
5. **Support** → Get ongoing help

## 📞 **Get Started**

**Ready to find your perfect match?**

👉 **[Visit Domestic Connect](https://domestic-connect.co.ke/)**

**Contact Us:**
- 📧 g.waheir00@gmail.com
- 📱 +254 726899113

---

**Building a better future for domestic work in Kenya** 🇰🇪