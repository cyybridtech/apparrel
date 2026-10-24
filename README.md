# APPARREL — Modern Luxury E-Commerce Platform

A Ghana-focused multi-seller commerce application for Cyybrid Technology, built with **TypeScript**, **React**, **Express**, **Drizzle**, and a TiDB/MySQL schema. The current storefront and operations portal are an in-progress prototype: active API routes still use in-memory state, and payment verification and webhooks are not implemented. Do not use it to process live orders or deploy it as a production marketplace yet.

---

## 🌟 Key Features

### 1. Multi-Category Taxonomy & Authentic Luxury Drops
- **Tops & Shirts**: Heavyweight graphic tees (290 GSM), resort linen button-downs, architect hoodies, fine knit polos.
- **Sneakers & Kicks**: Retro high-tops, speed runners, minimalist nappa trainers, street dunks.
- **Perfumes & Fragrances**: Royal amber oud extraits, fresh bergamot vetiver EDPs, midnight bourbon vanilla.
- **Watches & Timepieces**: Automatic skeleton chronographs, rose gold dress watches, 200M titanium divers.
- **Body Sprays & Grooming**: All-day cedarwood mists, cooling post-workout sprays, evening tonka mists.
- *Fully extensible dynamic category system for adding future product lines.*

### 2. Payments (Not Production-Ready)
- The repository contains Paystack initialization UI and API code, but it does not yet verify transactions or process signed webhooks.
- Checkout currently must not be used for live payments. Client-side success is not proof of payment.

### 3. Executive Store Operations & Restock Hub
- **Access URL**: `/admin` or `/secret-admin` (or click the subtle lock icon in the footer).
- **Access:** admin/seller sign-in uses server-issued sessions. There are no default admin passwords; configure bootstrap credentials for local development.
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

# TiDB Cloud connection string. Active API routes are not yet wired to this database.
DATABASE_URL=
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

**Live database safety:** the TiDB database is treated as live. Do not run `npm run db:seed` or apply schema changes against it. Before any migration, create and verify a backup, review an additive migration plan, and test against a separate database first. No migration has been run by this project session.
