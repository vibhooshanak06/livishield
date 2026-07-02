# LiviShield — Health Insurance Platform

A full-stack health insurance platform built with React, Node.js, MySQL, and MongoDB.
Covers the complete insurance lifecycle: plan discovery → quote → proposal → document upload → underwriting → payment → policy issuance.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |

---

## Tech Stack

### Frontend
- **React 19** + **Vite** (Rolldown)
- **Tailwind CSS** + **shadcn/ui** component library
- **React Router v7** for client-side routing
- **Razorpay JS SDK** for payment checkout

### Backend
- **Node.js** + **Express 4**
- **MySQL** (primary database — all business data)
- **MongoDB** (secondary — immutable document audit log)
- **Razorpay Node SDK** for payment orders & verification
- **Nodemailer** (Gmail SMTP) for transactional emails
- **JWT** authentication
- **Winston** for console logging
- **Multer** for file uploads

---

## Architecture

### Backend — Clean Feature-Based Module Architecture

```
Client → Routes → Controller → Service → Repository → Database
```

Each feature is a self-contained module:

```
backend/src/
├── modules/
│   ├── auth/
│   │   ├── repositories/auth.repository.js     ← all SQL for users table
│   │   ├── services/auth.service.js             ← register, login, profile logic
│   │   ├── controllers/auth.controller.js       ← HTTP layer only
│   │   ├── routes/auth.routes.js
│   │   └── index.js
│   ├── health-insurance/
│   │   ├── repositories/healthInsurance.repository.js
│   │   ├── services/healthInsurance.service.js
│   │   ├── controllers/healthInsurance.controller.js
│   │   ├── routes/healthInsurance.routes.js
│   │   └── index.js
│   ├── proposal/
│   │   ├── repositories/proposal.repository.js
│   │   ├── services/proposal.service.js
│   │   ├── controllers/proposal.controller.js
│   │   ├── routes/proposal.routes.js
│   │   └── index.js
│   ├── admin/
│   │   ├── repositories/admin.repository.js
│   │   ├── services/admin.service.js
│   │   ├── controllers/admin.controller.js
│   │   ├── routes/admin.routes.js
│   │   └── index.js
│   └── payment/
│       ├── repositories/payment.repository.js
│       ├── services/payment.service.js          ← GST calc, Razorpay, email trigger
│       ├── controllers/payment.controller.js
│       ├── routes/payment.routes.js
│       └── index.js
├── config/
│   ├── mysql.js                                 ← connection pool
│   └── mongodb.js                               ← Mongoose connect
├── middleware/
│   ├── auth.js                                  ← JWT authenticate/authorize
│   ├── errorHandler.js
│   └── upload.js                                ← Multer file upload
├── models/
│   └── DocumentAuditLog.js                      ← MongoDB audit schema
├── utils/
│   ├── helpers.js                               ← JWT/bcrypt utilities
│   ├── logger.js                                ← Winston (console only)
│   ├── mailer.js                                ← Nodemailer email templates
│   ├── validation.js                            ← Joi schemas
│   ├── migrate_payments.js                      ← Creates payments table
│   ├── fix_status_enum.js                       ← Fixes ENUM values
│   ├── seed_additional_plans.js                 ← Seeds 7 extra plans
│   └── test_email.js                            ← SMTP smoke test
└── app.js
```

### Frontend — Page-Based React Architecture

```
frontend/src/
├── pages/
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Home.jsx
│   ├── About.jsx
│   ├── HealthInsurance.jsx              ← info/landing page
│   ├── HealthInsurancePlans.jsx         ← filterable plan catalog
│   ├── HealthInsurancePlanDetails.jsx   ← tabbed plan detail
│   ├── HealthInsuranceQuote.jsx         ← 5-step proposal form
│   ├── ProposalSuccess.jsx              ← document upload (48hr window)
│   ├── ProposalDetail.jsx               ← proposal status + policy details
│   ├── PaymentPage.jsx                  ← Razorpay checkout with GST
│   ├── PaymentSuccess.jsx               ← receipt page
│   ├── CustomerDashboard.jsx            ← proposals / policies / docs / payments
│   ├── Profile.jsx                      ← profile + password management
│   └── admin/
│       ├── AdminDashboard.jsx           ← underwriting queue + users + plans tabs
│       └── AdminProposalDetail.jsx      ← full proposal review + doc verification
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx               ← redirects admin → /admin
│   ├── AdminRoute.jsx                   ← blocks non-admins
│   └── FeaturedHealthPlans.jsx
├── services/
│   ├── authService.js
│   ├── healthInsuranceService.js
│   ├── proposalService.js
│   ├── adminService.js
│   └── paymentService.js
└── context/AuthContext.jsx
```

---

## Database Design

### MySQL (Primary — ACID, relational)

| Table | Purpose |
|---|---|
| `users` | Auth: email, bcrypt password, role (customer/admin/agent), profile |
| `health_insurance_plans` | 13 plans with full JSON features, coverage, add-ons, exclusions |
| `health_insurance_proposals` | Proposals: personal/family/medical info, documents (JSON), status history (JSON), payment_status |
| `payments` | Razorpay order/payment IDs, amount (incl. GST), status, paid_at |

### MongoDB (Secondary — append-only audit log)

| Collection | Purpose |
|---|---|
| `documentauditlogs` | Immutable event log for every upload/verify/reject/submit action |

### File Storage

```
backend/uploads/proposals/<proposalId>/<docType>_<timestamp>.<ext>
```

---

## Complete Feature List

### Customer Journey
- Register / Login (JWT via Authorization header)
- Browse 13 health insurance plans with filtering, sorting, pagination
- Compare up to 4 plans side-by-side
- 5-step quote/proposal form: personal → address → medical → add-ons → review
- Document upload with 48-hour window, progress tracking, reactivation (7-day window)
- Submit documents for review → proposal goes to underwriting
- View proposal detail: status, documents, policy info, status history timeline
- Pay premium via Razorpay (test mode) — amount includes 18% GST
- Payment success page with full GST receipt
- Profile settings: update name/phone/address, change password
- Customer dashboard: proposals, active policies, documents, payment history

### Admin Panel
- Login redirects directly to `/admin` — isolated from customer UI
- Dashboard with 8 real-time stat cards
- Filterable proposal queue with search, status filter, pagination
- Full proposal detail with 3 tabs: Overview, Documents, Audit Log
- Actions: Move to Review, Verify/Reject documents, Request re-upload, Require medical checkup, Approve (generates policy number), Reject
- Approve requires all mandatory documents verified first
- User management: view all users, change roles
- Plan management: view all 13 plans, discontinue plans

### Payment (Razorpay Test Mode)
- Creates Razorpay order with 18% GST included
- Razorpay Checkout opens in-page
- Signature verification on backend before marking paid
- Proposal status → `policy_issued` after payment
- Full GST breakdown shown in UI and receipt email

### Email Notifications (Gmail SMTP)
| Trigger | Email |
|---|---|
| Proposal submitted | Confirmation + mandatory document checklist |
| Proposal approved | Approval notice + Pay Now link with amount incl. GST |
| Proposal rejected | Rejection reason + browse plans + contact support |
| Payment success | Policy details, policy number, dates, full GST receipt |

### Security
- JWT tokens in `Authorization: Bearer` header
- bcrypt password hashing (rounds: 10)
- Helmet security headers
- CORS configured for localhost dev
- Rate limiting (100 req / 15 min)
- Role-based access: customer routes blocked for admins, admin routes blocked for customers

---

## Health Insurance Plans (13 total)

| # | Plan | Provider | Type | Sum Insured |
|---|---|---|---|---|
| 1 | HealthGuard Individual | Star Health | Individual | ₹5L |
| 2 | FamilyShield Floater | HDFC ERGO | Family | ₹10L |
| 3 | SeniorCare Plus | Niva Bupa | Senior Citizen | ₹3L |
| 4 | CriticalCare Shield | ICICI Lombard | Critical Illness | ₹20L |
| 5 | ComprehensiveCare 360 | Bajaj Allianz | Individual | ₹7.5L |
| 6 | GroupHealth Pro | United India | Group | ₹3L |
| 7 | MaternaCare Plus | Aditya Birla | Individual | ₹5L |
| 8 | SuperTopUp Shield | Oriental Insurance | Individual | ₹20L |
| 9 | DiabetesCare 360 | Niva Bupa | Individual | ₹5L |
| 10 | MindWell Mental Health | HDFC ERGO | Individual | ₹3L |
| 11 | Elite Health Platinum | Bajaj Allianz | Individual | ₹50L |
| 12 | SmartFamily Floater Plus | ICICI Lombard | Family | ₹15L |
| 13 | YouthActive OPD Plan | Star Health | Individual | ₹3L |

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Returns JWT in `Authorization` header |
| POST | `/logout` | JWT | Logout |
| GET | `/me` | JWT | Current user |
| PUT | `/profile` | JWT | Update profile |
| PUT | `/change-password` | JWT | Change password |

### Plans — `/api/health-insurance`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/plans` | — | Paginated, filterable, sortable plan list |
| GET | `/plans/featured` | — | Popular/recommended plans |
| GET | `/plans/statistics` | — | Aggregate stats |
| GET | `/plans/:id` | — | Single plan detail |
| POST | `/plans/compare` | — | Compare 2–4 plans |

### Proposals — `/api/proposals`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/submit` | Optional | Submit new proposal |
| GET | `/user/:userId` | — | User proposals (paginated) |
| GET | `/dashboard/:userId` | JWT | Dashboard data + stats |
| GET | `/:id` | — | Single proposal detail |
| POST | `/:id/documents` | Optional | Upload document file |
| DELETE | `/:id/documents/:docType` | Optional | Remove document |
| POST | `/:id/documents/submit` | Optional | Lock docs + move to under_review |
| POST | `/:id/reactivate` | Optional | Reactivate expired proposal (7-day window) |
| GET | `/` | Admin | All proposals |
| PUT | `/:id/status` | Admin | Update status |
| POST | `/:id/communication` | Admin | Log communication |

### Payments — `/api/payments`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders/:proposalId` | JWT | Create Razorpay order (incl. 18% GST) |
| POST | `/verify` | JWT | Verify payment signature, issue policy |
| GET | `/my` | JWT | Current user payment history |
| GET | `/proposal/:proposalId` | JWT | Payment for a specific proposal |
| POST | `/webhook` | — | Razorpay webhook (raw body) |

### Admin — `/api/admin` (JWT + admin role)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stats` | Dashboard stats |
| GET | `/proposals` | Proposal queue (filterable) |
| GET | `/proposals/:id` | Full proposal detail |
| POST | `/proposals/:id/under-review` | Pick up proposal |
| POST | `/proposals/:id/approve` | Approve + generate policy number |
| POST | `/proposals/:id/reject` | Reject with reason |
| POST | `/proposals/:id/request-documents` | Request re-upload |
| POST | `/proposals/:id/medical-checkup` | Flag for medical examination |
| POST | `/proposals/:id/assign` | Assign agent |
| POST | `/proposals/:id/documents/:docType/verify` | Verify document |
| POST | `/proposals/:id/documents/:docType/reject` | Reject document with reason |
| GET | `/proposals/:id/audit-log` | MongoDB audit trail |
| GET | `/users` | Paginated user list |
| PATCH | `/users/:id/role` | Change user role |
| GET | `/plans` | All plans |
| POST | `/plans` | Create plan |
| PUT | `/plans/:id` | Update plan |
| DELETE | `/plans/:id` | Discontinue plan |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- Git

### 1. Clone & install

```bash
git clone <repo-url>
cd livishield

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=livishield

# JWT
JWT_SECRET=your_32_char_minimum_secret_key

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Email (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=LiviShield <your@gmail.com>

FRONTEND_URL=http://localhost:5173
```

### 3. Set up the database

```bash
cd backend

# Create tables and seed 6 base plans
node src/utils/migrate_payments.js

# Fix ENUM values (run once)
node src/utils/fix_status_enum.js

# Seed additional 7 plans (total 13)
node src/utils/seed_additional_plans.js
```

### 4. Create an admin account

Run the app, register normally, then run in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Start development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

### 6. Test email setup (optional)

```bash
cd backend
node src/utils/test_email.js your@email.com
```

---

## Proposal Status Flow

```
submitted
   │
   ▼  (admin picks up)
under_review
   │
   ├─→ documents_required  (admin requests re-upload)
   │       │
   │       └─→ submitted  (customer re-uploads)
   │
   ├─→ medical_checkup_required
   │
   ├─→ approved  ─→  Payment Pending  ─→  policy_issued
   │
   └─→ rejected

documents_expired  ─→  submitted  (reactivate, 7-day window)
```

---

## Payment Flow

```
Proposal Approved
       │
       ▼
POST /api/payments/orders/:proposalId
       │  (backend creates Razorpay order, computes base + 18% GST)
       ▼
Razorpay Checkout opens in browser
       │  (user pays with test card or UPI: success@razorpay)
       ▼
POST /api/payments/verify
       │  (backend verifies HMAC signature)
       ▼
Proposal status → policy_issued
Payment status  → paid
       │
       ▼
Policy Issued Email sent to customer
```

### Razorpay Test Credentials
| Method | Details |
|---|---|
| UPI (recommended) | `success@razorpay` |
| Visa | `4111 1111 1111 1111` · Expiry `12/28` · CVV `123` · OTP `123456` |
| Mastercard | `5267 3181 8797 5449` · Expiry `12/28` · CVV `123` · OTP `123456` |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Backend port (default: 5001) |
| `NODE_ENV` | No | `development` or `production` |
| `JWT_SECRET` | Yes | Min 32 chars |
| `JWT_EXPIRE` | No | Token expiry (default: 7d) |
| `MYSQL_HOST` | Yes | MySQL host |
| `MYSQL_PORT` | No | MySQL port (default: 3306) |
| `MYSQL_USER` | Yes | MySQL user |
| `MYSQL_PASSWORD` | Yes | MySQL password |
| `MYSQL_DATABASE` | Yes | Database name |
| `MONGODB_URI` | No | MongoDB URI (audit log — optional) |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | Razorpay webhook secret |
| `SMTP_HOST` | No | SMTP host (default: smtp.gmail.com) |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | Gmail address |
| `SMTP_PASS` | No | Gmail App Password |
| `EMAIL_FROM` | No | Sender name + email |
| `FRONTEND_URL` | No | Frontend URL for email links |
| `RATE_LIMIT_WINDOW` | No | Rate limit window in minutes (default: 15) |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 100) |
