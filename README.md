# Domestic Connect

## System Architecture

Domestic Connect is a full-stack platform with a React/Vite frontend and a Flask backend, backed by Firebase Authentication and Firestore.

- **Frontend:** `frontend/` (React + TypeScript + Vite)
- **Backend API:** `backend/` (Flask blueprints)
- **Primary datastore:** Firestore collections (`users`, `profiles`, `housegirl_profiles`, `employer_profiles`, `jobs`, `payments`, `contact_access`)
- **Auth provider:** Firebase Auth (phone OTP + Google)
- **Deployment targets:** static frontend + Python API runtime

## High-Level Data Flow

1. Client authenticates with Firebase (OTP or Google).
2. Client sends Firebase ID token to backend (`Authorization: Bearer <token>`).
3. Backend verifies token and resolves/creates `users` records.
4. Role-specific operations use Firestore profile collections:
   - `housegirl_profiles`
   - `employer_profiles`
5. Client dashboards fetch and update data through `/api/*` routes.

## Identity and Document IDs

- User document IDs are `user_<firebase_uid>` in `users`.
- Role profile documents are standardized to the same ID pattern (`user_<firebase_uid>`).
- Backend route handlers normalize incoming IDs so both raw `<uid>` and `user_<uid>` resolve to a single canonical document.

## Backend Route Structure

Blueprints are organized under `backend/app/routes/` by domain:

- `auth.py`: Firebase verification, session checks, profile bootstrap
- `housegirls.py`: listing, profile CRUD, visibility metadata
- `employers.py`: employer profile CRUD
- `jobs.py`, `payments.py`, `mpesa.py`, `profiles.py`, etc.: domain-specific operations

Cross-cutting behavior is handled by middleware/services:

- token verification and route guards
- rate limiting and request validation
- structured logging and error wrapping

## Frontend Architecture

Key frontend layers:

- **Pages:** route-level screens under `frontend/src/pages/`
- **Hooks:** auth/session orchestration in `frontend/src/hooks/`
- **API utilities:** request and error handling in `frontend/src/lib/`
- **UI components:** reusable blocks under `frontend/src/components/`

Auth state is centralized in `useAuthEnhanced` and consumed by dashboards/pages for role-based routing and protected calls.

## Integration Boundaries

- All write operations for role profiles flow through backend `PUT` endpoints.
- Frontend must use canonical user IDs for profile routes to avoid split writes/reads.
- Payment and profile domains are separated by route and payload contracts.

## Repository Layout

```text
Domestic_Connect/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── services/
│   └── run.py
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── hooks/
    │   ├── components/
    │   └── lib/
    └── public/
```