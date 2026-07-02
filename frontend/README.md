# LiviShield Frontend

React + Vite frontend for the LiviShield Health Insurance platform.

## Stack

- **Framework:** React 19 + Vite (Rolldown)
- **Styling:** Tailwind CSS + shadcn/ui
- **Routing:** React Router v7
- **Payments:** Razorpay Checkout JS SDK (loaded dynamically)
- **HTTP:** Native fetch with auth headers from localStorage

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Public |
| `/signup` | Signup | Public |
| `/home` | Home | Customer |
| `/about` | About | Customer |
| `/health-insurance` | Health Insurance info | Customer |
| `/health-insurance/plans` | Plan catalog | Customer |
| `/health-insurance/plan/:id` | Plan detail (tabbed) | Customer |
| `/health-insurance/quote/:id` | 5-step proposal form | Customer |
| `/health-insurance/proposal-success` | Document upload page | Customer |
| `/proposals/:id` | Proposal detail + status | Customer |
| `/proposals/:proposalId/pay` | Payment checkout (GST) | Customer |
| `/payment-success` | Payment receipt | Customer |
| `/dashboard` | Customer dashboard | Customer |
| `/profile` | Profile & password | Customer |
| `/admin` | Admin dashboard | Admin only |
| `/admin/proposals/:id` | Admin proposal review | Admin only |

## Access Control

- `ProtectedRoute` — blocks unauthenticated users, redirects admins to `/admin`
- `AdminRoute` — blocks non-admins, redirects customers to `/dashboard`
- Admins are completely isolated to the admin panel and never see customer UI

## Services

| Service | Responsibility |
|---|---|
| `authService.js` | Register, login, logout, profile, token storage |
| `healthInsuranceService.js` | Plans, compare, statistics |
| `proposalService.js` | Submit, dashboard, documents, status |
| `adminService.js` | Underwriting actions, users, plans |
| `paymentService.js` | Razorpay orders, verify, payment history, SDK loader |

## Key Features

### Customer
- Browse and filter 13 health insurance plans
- 5-step proposal: personal → address → medical → add-ons → review
- Document upload (PDF/JPG/PNG, max 5 MB) with 48-hour window countdown
- Proposal detail page showing status, docs, verification state, policy info
- Pay premium with Razorpay (18% GST shown in breakdown)
- Payment success receipt with GST breakdown
- Dashboard tabs: My Proposals, Active Policies, Documents, Payments

### Admin
- Underwriting dashboard with stat cards
- Proposal queue with filter/search/pagination
- Per-document verify/reject with reason
- Approve (generates policy number) / Reject / Request docs / Medical checkup
- Users tab: view all users, change roles
- Plans tab: view all 13 plans, discontinue plans

## Razorpay Test Mode

| Method | Details |
|---|---|
| UPI | `success@razorpay` |
| Card | `4111 1111 1111 1111` · Expiry `12/28` · CVV `123` · OTP `123456` |

## Environment

Create `frontend/.env` (optional — defaults to localhost):

```env
VITE_API_URL=http://localhost:5001/api
```
