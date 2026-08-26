# plan_main.md — Domestic Connect Refactor Plan
# domestic-connect.co.ke

## Core Shift

**Old model:** Open directory — employers browse publicly listed housegirls
**New model:** Vetted agency — YOU hold the talent pool privately; employers pay KES 1,500 to submit a request and get matched by you

The site speaks to one primary audience: **employers looking for trustworthy domestic help.**
Workers still register, but their data is yours — admin-only, never public.

---

## Guiding Rules

1. No file deletions. Adjust, repurpose, or conditionally suppress rendering.
2. Auth stack is untouched (`useAuth`, `useAuthEnhanced`, `firebase.ts`, auth routes).
3. "Housegirl" as a system/database term stays. Only the **public-facing UI language** changes to "Worker" or the specific role name.
4. Worker profiles, photos, and personal details are never rendered publicly.
5. KES 1,500 employer registration fee is the gateway to making a staffing request.

---

## Terminology Map (UI only)

| Old UI label          | New UI label                          |
|-----------------------|---------------------------------------|
| Housegirl             | Domestic Worker / Worker              |
| Browse Housegirls     | (removed from nav — not public)       |
| For Housegirls        | Join as a Worker                      |
| Housegirl Dashboard   | Worker Dashboard (internal label)     |
| Agency (keep)         | Agency (keep — same concept)          |

---

## Page Inventory & Actions

### Pages — KEEP AS-IS
| File | Route | Reason |
|---|---|---|
| `AdminLoginPage.tsx` | `/admin-login` | Internal admin access |
| `AdminDashboard.tsx` | `/admin-dashboard` | Internal, no public change |
| `HousegirlDashboard.tsx` | `/housegirl-dashboard` | Internal for vetted workers |
| `AgencyDashboard.tsx` | `/agency-dashboard` | Agency partners |
| `EmployerDashboard.tsx` | `/employer-dashboard` | Employer, keep + expand |
| `PrivacyPolicy.tsx` | `/privacy-policy` | Legal |
| `TermsOfService.tsx` | `/terms-of-service` | Legal |
| `NotFound.tsx` | `*` | Error page |
| `PaymentCallbackPage.tsx` | `/payment-callback` | Reuse for KES 1,500 flow |
| `AuthActionPage.tsx` | `/auth-action` | Firebase auth redirect |
| `LoginPage.tsx` | `/login` | Auth — untouched |
| `ContactUsPage.tsx` | `/contact-us` | Keep |
| `StatsPage.tsx` | `/stats` | Keep (admin view) |

---

### Pages — REFACTOR (rewrite content, keep file)

#### 1. `LandingPage.tsx` → `/` (Home)
**Current:** Generic "connect" page with hero image, some stats
**New:** Employer-focused agency landing page

Sections to build (in order):
- **HeroSection** — "Find Trusted Domestic Staff in Kenya" headline, two CTAs: "Find a Worker →" (to `/register`) and "How It Works" (to `/how-it-works`). Trust badge row: "ID Verified · Interviewed · Background Checked"
- **ServicesGrid** — 5 category cards: Housegirls/House Managers, Gardeners, Gatemen/Security, Nursing/Caregivers, Daily Casuals. Each card: icon, name, brief description, "Request Now" CTA
- **HowItWorksSection** — 3 numbered steps: 1) Register & Pay KES 1,500 · 2) Tell Us Your Needs · 3) We Match You Within 48hrs
- **TrustSection** — Vetting process detail: ID check, in-person interview, reference check, trial period support
- **PricingSection** — Single tier: KES 1,500 registration fee (one-time), what you get, M-Pesa payment
- **TestimonialsSection** — 2–3 placeholder employer quotes (to be replaced with real ones)
- **FAQSection** — 6 common employer questions
- Keep existing `Navbar` and `Footer` wrapping

---

#### 2. `HousegirlPage.tsx` → repurpose to `/for-housegirls` — **Worker Registration Page**
**Current:** Marketing page with photos, badges, sign-up CTA for housegirls
**New:** Simple, private worker onboarding page

What to render:
- Clear headline: "Register as a Domestic Worker"
- Short explanation: "We will contact you for an interview and vetting. Your details are never posted online."
- Registration form: Full name, phone number, location (county), worker category (dropdown: Housegirl, Gardener, Gateman, Caregiver, Casual), years of experience, live-in/live-out preference, brief note
- Submit button → POST to `/api/worker-inquiries` (new backend endpoint)
- Success message: "Thank you. We have received your details and will call you within 2 business days for an interview."
- WhatsApp CTA alternative: "Prefer WhatsApp? Message us directly →" (link to WhatsApp with pre-filled text)
- Remove: all public profile showcasing, the photo upload on this page, the agency registration modal trigger
- Retain: auth check — if user is already a logged-in housegirl, redirect to their dashboard

---

#### 3. `BrowseHousegirls.tsx` → route `/housegirls` — **Block public access**
**Current:** Renders paginated public worker listing with photos and details
**New:** Route is kept but renders a redirect or access-denied screen

Action: Wrap entire render in a guard — if user is not admin, show: "This page is available to administrators only." Redirect non-admins to `/`. The data is never exposed publicly.

---

#### 4. `HousegirlsListPage.tsx` → same treatment as BrowseHousegirls
**Action:** Same admin-only guard. Non-admins → redirect to `/`.

---

#### 5. `ForHousegirlsPage.tsx` → `/for-workers`
**Current:** Shows employer job listings for housegirls to apply
**New:** Lightweight "Join as a Worker" entry page — just two CTAs:
- "Register your details" → `/for-housegirls` (the full registration form)
- "Contact us on WhatsApp" → WhatsApp deep link
- Remove: public job listings from this page (they are employer-side data)
- Add route alias: `/for-workers` → same component

---

#### 6. `HowItWorksPage.tsx` → `/how-it-works`
**Current:** Exists, content unknown
**New:** Employer-focused 3-step flow with visuals + FAQ. Also add a small "Are you a worker?" section at the bottom with link to `/for-housegirls`

---

#### 7. `AgencyMarketplace.tsx` → `/agency-marketplace`
**Current:** Lists agencies
**New:** Keep listing. Update copy — agencies are described as "Verified Partner Agencies" who supply additional workers to complement our own vetted pool. Employers can optionally contact agencies after paying the registration fee.

---

#### 8. `AgencyPage.tsx` → `/agencies`
**Current:** Agency marketing/landing page
**New:** Retain. Adjust headline copy to position agencies as trusted partners. Remove any language that implies workers are publicly browsable through the agency.

---

#### 9. `AgencyPackagesPage.tsx` → `/agency-packages`
**Current:** Pricing for agencies
**New:** Add an employer pricing section at the top: "Employer Registration — KES 1,500 (one-time)" before the agency pricing. Keep agency tier info.

---

#### 10. `WhyChoosePage.tsx` → `/why-choose-us`
**Current:** About/trust page
**New:** Rewrite copy around: rigorous vetting, ID verification, your personal guarantee, no anonymous listings. Keep structure.

---

### Pages — CREATE NEW

#### `EmployerRegisterPage.tsx` → `/register`
Full employer registration + payment flow:
- Step 1: Account (already logged in? skip. Not logged in? prompt login/signup)
- Step 2: Payment Gate
  - Show: "Pay KES 1,500 via M-Pesa to access our vetted talent pool"
  - Option A: M-Pesa STK Push — input phone number → call `/api/mpesa/stk-push`
  - Option B: Manual — "Pay to Till No. XXXXXX, then enter your M-Pesa transaction code below"
  - Option B handler: POST to `/api/payments/confirm-manual` with transaction code
- Step 3: Needs Form (unlocked after payment verified)
  - Worker category needed (multi-select from 5 categories)
  - Location / estate / town
  - Live-in or live-out
  - Start date
  - Monthly salary budget (KES range)
  - Key duties / special requirements (textarea)
  - Employer contact phone (for your callback)
  - Submit → POST to `/api/employer-requests`
- Step 4: Confirmation — "Request received. We will call you within 24–48 hours with suitable candidates."

---

## Navbar Changes (`Navbar.tsx`)

| Current link | Action |
|---|---|
| "Browse" → `/housegirls` | Remove — no public worker browse |
| "For Housegirls" → `/for-housegirls` | Change label to "Join as a Worker" → `/for-housegirls` |
| "Agencies" → `/agency-marketplace` | Keep |
| (none) | Add "Our Services" → `/` (scrolls to ServicesGrid) or `/services` |
| (none) | Add "How It Works" → `/how-it-works` (already in drawer, add to desktop nav) |
| "Find a Worker" CTA | Add primary CTA button → `/register` |
| "Join Today" signup | Keep, but label: "Login / Sign Up" |

Desktop nav order: Our Services · Agencies · How It Works · [Find a Worker button] · Login

---

## Backend Changes

### New endpoints to add

#### `POST /api/worker-inquiries`
- No auth required (allows unregistered workers to submit)
- Rate-limited (5/hour per IP)
- Fields: `name`, `phone`, `county`, `category`, `experience_years`, `live_in`, `notes`
- Saves to Firestore collection `worker_inquiries` (admin-read only)
- No public GET endpoint for this collection
- File: `backend/app/routes/worker_inquiries.py`

#### `POST /api/employer-requests`
- Auth required (Firebase token)
- Payment verification required (check `employer.payment_verified == true` in Firestore)
- Fields: `categories[]`, `location`, `live_in`, `start_date`, `salary_budget`, `duties`, `contact_phone`
- Saves to Firestore `employer_requests`
- Notifies admin (email or WhatsApp — placeholder hook)
- File: `backend/app/routes/employer_requests.py`

#### `POST /api/payments/confirm-manual`
- Auth required
- Fields: `transaction_code`, `phone_used`
- Saves to Firestore `pending_manual_payments` for admin review
- Does NOT auto-verify — admin must confirm in dashboard
- After admin approval: sets `employer.payment_verified = true`

### Existing endpoints — access changes

| Endpoint | Change |
|---|---|
| `GET /api/housegirls/` | Add admin-only guard — return 403 if caller is not admin |
| `GET /api/housegirls/:id` | Same admin-only guard |
| `GET /api/housegirls/:id/photo` | Admin-only guard |
| All other endpoints | Unchanged |

---

## Worker Categories (used across the site)

```
1. Housegirl / House Manager    (icon: Home)
2. Gardener                     (icon: Leaf)
3. Gateman / Security           (icon: Shield)
4. Nurse / Caregiver            (icon: Heart)
5. Daily Casual                 (icon: Clock)
```

These are used in: ServicesGrid (landing page), worker registration form dropdown, employer needs form multi-select, and backend category field validation.

---

## Design Direction

- **Colors:** Primary teal `#0B6B5E`, Accent amber `#F59E0B`, Background `#F9FAFB`, Text `#111`
- **Tone:** Professional, warm, trustworthy — "We know these workers personally"
- **Mobile-first:** Most Kenyan users on phones. Large tap targets, WhatsApp CTA always visible
- **CTAs:** Two clear paths everywhere — "Find a Worker" (employer) and "Register as a Worker" (worker)

---

## Implementation Phases

### Phase 1 — Landing Page Refactor
- Rewrite `LandingPage.tsx` with all 7 sections
- Update `Navbar.tsx` links and add "Find a Worker" CTA
- Update `Footer.tsx` with new nav structure and WhatsApp contact link

### Phase 2 — Worker Onboarding
- Refactor `HousegirlPage.tsx` into worker registration form
- Refactor `ForHousegirlsPage.tsx` into lightweight entry page
- Add backend: `POST /api/worker-inquiries`
- Add admin-only guard to `GET /api/housegirls/` and `/api/housegirls/:id`
- Block `BrowseHousegirls.tsx` and `HousegirlsListPage.tsx` for non-admins

### Phase 3 — Employer Registration & Payment
- Create `EmployerRegisterPage.tsx` with 4-step flow
- Add backend: `POST /api/employer-requests`, `POST /api/payments/confirm-manual`
- Wire M-Pesa STK push (existing `/api/mpesa` — reuse)
- Update `PaymentCallbackPage.tsx` to handle employer registration context

### Phase 4 — Content Pages
- Rewrite `HowItWorksPage.tsx`
- Rewrite `WhyChoosePage.tsx`
- Update `AgencyPackagesPage.tsx` to include employer fee
- Update `AgencyMarketplace.tsx` copy

### Phase 5 — Employer Dashboard
- Add "My Request" view in `EmployerDashboard.tsx` — shows submitted needs form status, "Matched" or "In Progress"
- Add payment status badge — "Payment Verified" or "Pending Payment"

---

## Files NOT touched
- `useAuth.tsx`, `useAuthEnhanced.tsx`, `firebase.ts`, `authUtils.ts`, `authErrors.ts`
- All `backend/app/routes/auth.py`
- All shadcn/ui components in `components/ui/`
- `backend/app/__init__.py` CORS, rate-limiting, security middleware
- `backend/app/routes/mpesa.py` (reused, not rewritten)
