# 🏢 Domestic Connect: Agency Marketplace Plan

This document outlines the strategic integration of verified agencies into the Domestic Connect ecosystem.

---

## 1. Value Proposition

### For the Platform (You)
*   **Scalable Verification**: Agencies handle the primary vetting of workers.
*   **Tiered MRR**: Moving from one-off payments to Monthly Recurring Revenue (MRR).
*   **Quality Control**: Professional agencies maintain the platform's reputation for high-quality placements.

### For Agencies
*   **Qualified Leads**: Direct access to thousands of employers already seeking domestic help.
*   **Trust Badge**: Use the platform's "Verified" status to close deals faster.
*   **Efficiency**: A centralized dashboard to manage placements and availability.

---

## 2. Subscription Tiers (Revenue Model)

| Plan | Monthly Fee (Est.) | Features |
| :--- | :--- | :--- |
| **Basic** | KES 1,500 | Directory listing, 5 worker profiles, basic contact lead access. |
| **Premium** | KES 4,500 | "Featured" badge, unlimited profiles, analytics dashboard, SMS alerts. |
| **International** | KES 12,000 | Licensed for overseas placement, priority listing, API access. |

---

## 3. Transactional Revenue (The "Hiring Fee")

When an employer chooses to hire through an agency rather than a direct unlock:
*   **Employer Pays**: KES 1,500 (Placement Service).
*   **Platform Commission**: 10-20% (KES 150 - KES 300).
*   **Employer Benefit**: 30–90 day replacement guarantee (provided by the agency).

---

## 4. Transactional Flow: How "Placement" Works

Here is the operational chain of events when KES 1,500 is paid:

### Step 1: Verification & Notifications
*   **Database**: A `Placement Record` is created with status `PENDING_CONFIRMATION`.
*   **Notifications**:
    *   **Agency**: Instant SMS/WhatsApp/Email: *"Action Required: [Employer Name] paid to hire [Worker Name]. Contact them now at [Phone]."*
    *   **Employer**: Auto-Email: *"Payment Confirmed. Agency [Name] will contact you within 4 hours to coordinate the interview/start date."*

### Step 2: The Interview & Reporting
*   **Escrow**: Platform holds the KES 1,500 until the worker reports to the home.
*   **Update**: Worker’s profile is temporarily hidden from search so others don’t try to hire them.

### Step 3: Confirmation & Payout
*   **Release**: Agency confirms placement on their dashboard.
*   **Payout**: Platform releases the funds to the agency’s wallet, minus the commission.
*   **Final Status**: Worker marked as `NOT_AVAILABLE`.

---

## 5. The Safety Net (Risk Management)

| Scenario | Resolution Policy |
| :--- | :--- |
| **Worker Unavailable** | Agency must provide an equivalent replacement candidate immediately for free. |
| **Employer Rejects Worker** | Agency provides 2 more candidates. If no fit after 3, a refund is assessed. |
| **Worker Leaves < 1 Month** | **Replacement Guarantee**: Agency finds a new worker for the employer for free. |

---

## 6. Technical Roadmap

### Phase 1: Marketplace 1.0 (Current)
*   [x] Standardized Footer and Navbar.
*   [x] Agency Directory listing via `AgencyMarketplace.tsx`.
*   [x] `AgencyCard` UI component.

### Phase 2: Agency Dashboard (Next)
*   [ ] **Agency Register/Login**: Distinct from employer and housegirl accounts.
*   [ ] **Worker Management**: CRUD for agencies to upload/manage their own "Verified Workers."
*   [ ] **Lead Tracking**: A simple CRM for agencies to see who clicked "Hire via Agency."

### Phase 3: Payment Automation
*   [ ] **Subscription Billing**: Automated M-Pesa/Stripe monthly billing for agencies.
*   [ ] **Commission Splitting**: Instant payout to agencies after platform fee is deducted.

---

## 5. Trust & Verification Policy

Agencies must provide the following to get the **Shield Badge**:
1.  **NITA License**: Copy of National Industrial Training Authority registration.
2.  **Physical Office**: Verified location in a major Kenyan city.
3.  **Positive Reviews**: Minimum 4.0 rating from at least 5 placements.

---

> [!IMPORTANT]
> **Priority #1**: The next structural step is to create the **`AgencyRegistrationModal`** to allow new agencies to join the queue, followed by the **`AgencyDashboard`** for worker management.
