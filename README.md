# APPARREL — Multi-tenant Retail SaaS

A retail operations SaaS foundation for malls, supermarkets, and independent shops, built with **TypeScript**, **React**, **Express**, **Drizzle**, and TiDB/MySQL. Each customer business is modeled as an isolated organization with its own branches, staff, roles, products, inventory, orders, and audit history. The project remains an in-progress prototype: a dedicated Vercel auth function is being wired to TiDB, while the legacy catalog and operations API still uses in-memory state, tenant authorization is not yet enforced in those endpoints, and payment verification/webhooks are not implemented. Do not use it to process live orders or deploy it as a production retail system yet.

See the [multi-tenant architecture, RBAC model, and safe migration plan](docs/architecture/multi-tenant-retail-saas.md).

---

## 🌟 Key Features

### 1. Tenant-scoped retail catalog (foundation in progress)
- The inherited demo UI contains apparel and lifestyle sample products; those categories are not a SaaS tenant limitation.
- The target catalog supports tenant-owned products, variants, branch-level stock, and retailer-specific categories.
- Organization scoping is being added to the Drizzle schema; the current API still needs persistent, tenant-filtered repositories before these controls are live.

### 2. Payments (Not Production-Ready)
- The repository contains Paystack initialization UI and API code, but it does not yet verify transactions or process signed webhooks.
- Checkout currently must not be used for live payments. Client-side success is not proof of payment.

### 3. Executive Store Operations & Restock Hub
- **Access URL**: `/admin` or `/secret-admin` (or click the subtle lock icon in the footer).
- **Access:** admin/seller sign-in uses server-issued sessions. There are no default admin passwords; configure the persistent production auth variables described below before provisioning an administrator.
- **⚡ 1-Click Restock Matrix**: Instant `+5`, `+20`, `+50` stock adjustments per size variant with custom quantity inputs, health meters, and bulk `+10 All Sizes` actions.
- **Product Drop Studio (CRUD)**: Create new product drops with 1-click image presets, size variant builders, live GH₵ price converters, and badges.
- **Live Packaging & Dispatch Pipeline**: 6-stage interactive fulfillment controller (`Confirmed` $\rightarrow$ `Packaging & QC` $\rightarrow$ `Dispatched` $\rightarrow$ `In Transit` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`) with 1-click stage advancement.
- **Financial Analytics & Audit Trail**: Real-time revenue reporting, AOV, inventory valuation, and chronological stock movement logs.

### 4. Step-by-Step Order Packaging & Dispatch Tracker
- Clean visual lifecycle stepper (Placed $\rightarrow$ Packaging & QC $\rightarrow$ Dispatched $\rightarrow$ Out for Delivery $\rightarrow$ Delivered).
- Dynamic courier rider assignment, live progress timeline, and delivery notes.

---

## 🚀 Quick Start

### 1. Environment Configuration (`.env`)
Create or edit your `.env` file:
```env
PORT=3001
VITE_API_URL=http://localhost:3001

# Generate with: openssl rand -hex 32
SESSION_SECRET=

# Local development bootstrap account (password must be at least 14 characters)
ADMIN_BOOTSTRAP_EMAIL=
ADMIN_BOOTSTRAP_PASSWORD=

# Payment settings (verification is not implemented yet)
PAYSTACK_SECRET_KEY=
PAYSTACK_CURRENCY=GHS

# TiDB Cloud connection string used by the persistent Vercel auth function.
DATABASE_URL=
DATABASE_SSL_CA=
```

### 2. Start Development Servers
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Storefront**: `http://localhost:3002`
- **Backend API**: `http://localhost:3001`
- **Live Order Tracking**: `http://localhost:3002/track`
- **Executive Admin Portal**: `http://localhost:3002/admin`

### Production Authentication
The Vercel routes `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, and `/api/auth/complete-security-setup` use the TiDB `users` table. Configure these Vercel Production variables before enabling them:

- `DATABASE_URL` and `DATABASE_SSL_CA` for the existing TiDB connection.
- `SESSION_SECRET`: a random value at least 32 bytes long (for example, generate with `openssl rand -hex 32`). Rotating it invalidates active sessions.
- `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD`: one-time first-admin bootstrap values; use an email you control and a password of at least 14 characters. Bootstrap only inserts a new admin when that email is unused; it never promotes an existing customer account or overwrites an existing admin password. Remove the bootstrap password variable after the account has been created.

Customer registrations and passwords are stored in TiDB with scrypt password hashes. The legacy Express API used by product, inventory, and admin operations is still not persistent in production; successful sign-in alone does not make those business endpoints production-ready.

**Live database safety:** the TiDB database is treated as live. Do not run `npm run db:seed` or apply schema changes against it. Before any migration, create and verify a backup, review an additive migration plan, and test against a separate database first. No migration has been run by this project session.
