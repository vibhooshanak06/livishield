# LiviShield Backend

Node.js + Express REST API for the LiviShield Health Insurance platform.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4
- **Primary DB:** MySQL 8 (ACID, relational — all business data)
- **Secondary DB:** MongoDB (append-only document audit log)
- **Auth:** JWT (Bearer token in Authorization header)
- **Payments:** Razorpay (orders, signature verification, webhooks)
- **Email:** Nodemailer via Gmail SMTP
- **Uploads:** Multer (disk storage)
- **Logging:** Winston (console only)

## Architecture

Clean feature-based module architecture: `Route → Controller → Service → Repository → DB`

- **Controllers** handle only request/response parsing
- **Services** contain all business logic
- **Repositories** contain all SQL/MongoDB queries — controllers never touch the DB directly

```
src/modules/
├── auth/          register, login, profile, password change
├── health-insurance/  plan catalog, filtering, compare, statistics
├── proposal/      submit, document upload/delete/submit, expiry, reactivation
├── admin/         underwriting queue, doc verification, user mgmt, plan mgmt
└── payment/       Razorpay orders, verify, webhook, payment history
```

## Quick Start

```bash
npm install

# First-time DB setup (run once)
node src/utils/migrate_payments.js
node src/utils/fix_status_enum.js
node src/utils/seed_additional_plans.js

# Development
npm run dev

# Test email
node src/utils/test_email.js your@email.com
```

## Key Endpoints

| Base | Description |
|---|---|
| `POST /api/auth/login` | Returns JWT in `Authorization` header |
| `GET /api/health-insurance/plans` | Filterable, paginated plan catalog |
| `POST /api/proposals/submit` | Submit a new proposal |
| `POST /api/proposals/:id/documents` | Upload document file |
| `POST /api/payments/orders/:proposalId` | Create Razorpay order (incl. 18% GST) |
| `POST /api/payments/verify` | Verify payment + issue policy |
| `GET /api/admin/proposals` | Underwriting queue (admin only) |

See the root `README.md` for the full API reference.

## Database Schema

### MySQL tables
- `users` — auth and profile
- `health_insurance_plans` — 13 plans with JSON features/coverage/exclusions
- `health_insurance_proposals` — proposals with JSON columns for docs/history
- `payments` — Razorpay payment records

### MongoDB collections
- `documentauditlogs` — immutable audit trail (upload/verify/reject events)

## Environment

Copy `.env.example` to `.env` and fill in:
- MySQL credentials
- JWT secret (min 32 chars)
- Razorpay test keys
- Gmail SMTP + App Password
