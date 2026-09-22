# APPARREL — Modern Luxury E-Commerce Platform

A high-performance, contemporary e-commerce web application inspired by leading global fashion & lifestyle brands (SSENSE, Kith, Zara, Nike). Built with **TypeScript**, **React**, **Node.js Express**, **MySQL** (with resilient caching), **Paystack Checkout**, and **Real-Time Step-by-Step Order Packaging & Dispatch Tracking**.

---

## 🌟 Key Features

### 1. Multi-Category Taxonomy & Authentic Luxury Drops
- **Tops & Shirts**: Heavyweight graphic tees (290 GSM), resort linen button-downs, architect hoodies, fine knit polos.
- **Sneakers & Kicks**: Retro high-tops, speed runners, minimalist nappa trainers, street dunks.
- **Perfumes & Fragrances**: Royal amber oud extraits, fresh bergamot vetiver EDPs, midnight bourbon vanilla.
- **Watches & Timepieces**: Automatic skeleton chronographs, rose gold dress watches, 200M titanium divers.
- **Body Sprays & Grooming**: All-day cedarwood mists, cooling post-workout sprays, evening tonka mists.
- *Fully extensible dynamic category system for adding future product lines.*

### 2. Paystack Live Payment Integration
- Ready for live and test mode Paystack integration via `.env`.
- Frontend inline popup modal (`PaystackPop.setup`) with automatic fallback for mobile money (MTN MoMo, Telecel, AT), Visa, Mastercard, and Apple Pay.
- Server-side verification (`/api/paystack/verify/:reference`) and webhook processing.

### 3. Executive Store Operations & Restock Hub
- **Access URL**: `/admin` or `/secret-admin` (or click the subtle lock icon in the footer).
- **Default Passkeys**: `apparrel2026`, `1234`, `admin123`, `admin`.
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

# Paystack API Keys
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_CURRENCY=GHS

# Secret Admin Portal Passkey
ADMIN_SECRET_KEY=apparrel2026

# MySQL Database (Optional: in-memory store runs automatically if MySQL is offline)
DATABASE_URL=mysql://root:password@127.0.0.1:3306/apparrel
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
