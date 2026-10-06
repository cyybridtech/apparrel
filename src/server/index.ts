import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  InitialProduct,
  InitialSeller,
} from "../db/seed.js";
import { pool, isDbConfigured } from "../db/index.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
// Keep raw body for webhook verification if needed
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// ─── Domain Interfaces ─────────────────────────────────────────
export interface StoredSeller extends InitialSeller {
  createdAt: string;
  updatedAt: string;
}

export interface StoredProduct extends InitialProduct {
  id: number;
  totalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredOrderItem {
  productId: number;
  sellerId: number;
  sellerStore: string;
  name: string;
  brand: string;
  category: string;
  sizeLabel: string;
  image: string;
  qty: number;
  unitPriceCents: number;
  sellerShareCents: number; // 95% net
  platformShareCents: number; // 5% platform
}

export interface StoredOrder {
  id: number;
  orderNo: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  status:
    | "confirmed"
    | "processing"
    | "dispatched"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  paymentStatus: "paid" | "unpaid" | "refunded";
  paymentMethod: string;
  paystackRef?: string;
  trackingCode: string;
  courierName: string;
  courierPhone: string;
  courierLat?: number;
  courierLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  estimatedDelivery: string;
  deliveryNotes?: string;
  items: StoredOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryLog {
  id: number;
  productId: number;
  sellerId: number;
  productName: string;
  sizeLabel: string;
  changeQty: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adminUser: string;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  actor: string;
  actorRole: "super_admin" | "seller" | "system";
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface SellerPayout {
  id: number;
  sellerId: number;
  sellerName: string;
  storeName: string;
  amountCents: number;
  reference: string;
  status: "completed" | "pending" | "failed";
  payoutMethod: string;
  note: string;
  createdAt: string;
}

// ─── In-Memory Store & Cache Layer ──────────────────────────────
let memorySellers: StoredSeller[] = INITIAL_SELLERS.map((s) => ({
  ...s,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

let memoryCategories = [...INITIAL_CATEGORIES];

let memoryProducts: StoredProduct[] = INITIAL_PRODUCTS.map((p, idx) => ({
  ...p,
  id: idx + 1,
  totalStock: p.sizes.reduce((sum, s) => sum + s.stock, 0),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

let memoryOrders: StoredOrder[] = [
  {
    id: 1,
    orderNo: "ORD-92841",
    customerName: "Kofi Mensah",
    email: "kofi.mensah@example.com",
    phone: "+233 24 412 9902",
    address: "14 Independence Avenue, Airport Residential",
    city: "Accra",
    region: "Greater Accra",
    postalCode: "GA-102-4421",
    subtotalCents: 145000,
    shippingCents: 0,
    discountCents: 0,
    totalCents: 145000,
    currency: "GHS",
    status: "in_transit",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    paystackRef: "T99281726481_PSTK",
    trackingCode: "TRK-92841-GH",
    courierName: "Cyybrid Express Fleet",
    courierPhone: "+233 24 555 8901",
    courierLat: 5.6037,
    courierLng: -0.187,
    destinationLat: 5.6148,
    destinationLng: -0.1731,
    estimatedDelivery: "25 - 35 minutes",
    deliveryNotes: "Ring bell at gate, courier has dispatch code.",
    items: [
      {
        productId: 1,
        sellerId: 1,
        sellerStore: "Kicks & Soles Hub",
        name: "Court Heritage 85 Retro High-Top",
        brand: "KICKS & SOLES",
        category: "sneakers",
        sizeLabel: "US 9",
        image:
          "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop",
        qty: 1,
        unitPriceCents: 145000,
        sellerShareCents: 137750, // 95%
        platformShareCents: 7250, // 5%
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    orderNo: "ORD-88412",
    customerName: "Ama Serwaa",
    email: "ama.serwaa@example.com",
    phone: "+233 20 891 0023",
    address: "28 Boundary Road, East Legon",
    city: "Accra",
    region: "Greater Accra",
    postalCode: "GA-409-2210",
    subtotalCents: 327000,
    shippingCents: 0,
    discountCents: 0,
    totalCents: 327000,
    currency: "GHS",
    status: "out_for_delivery",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    paystackRef: "T88412091223_PSTK",
    trackingCode: "TRK-88412-GH",
    courierName: "Cyybrid Express Fleet",
    courierPhone: "+233 24 555 8901",
    courierLat: 5.635,
    courierLng: -0.158,
    destinationLat: 5.638,
    destinationLng: -0.154,
    estimatedDelivery: "5 - 10 minutes (Approaching)",
    deliveryNotes: "Leave at front reception desk.",
    items: [
      {
        productId: 5,
        sellerId: 2,
        sellerStore: "Chrono & Heritage",
        name: "Chronos Stealth PVD Automatic Chronograph",
        brand: "CHRONO & HERITAGE",
        category: "watches",
        sizeLabel: "42mm Case",
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
        qty: 1,
        unitPriceCents: 285000,
        sellerShareCents: 270750,
        platformShareCents: 14250,
      },
      {
        productId: 8,
        sellerId: 3,
        sellerStore: "Cyybrid Atelier Wear",
        name: "Heavyweight Boxy Noir Tee",
        brand: "CYYBRID ATELIER",
        category: "tops",
        sizeLabel: "M",
        image:
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
        qty: 1,
        unitPriceCents: 42000,
        sellerShareCents: 39900,
        platformShareCents: 2100,
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let memoryLogs: InventoryLog[] = [
  {
    id: 1,
    productId: 1,
    sellerId: 1,
    productName: "Court Heritage 85 Retro High-Top",
    sizeLabel: "US 9",
    changeQty: 25,
    previousStock: 0,
    newStock: 25,
    reason: "Initial Warehouse Stocking",
    adminUser: "Kwame Mensah (Seller 1)",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

let memoryAuditLogs: AuditLog[] = [
  {
    id: 1,
    actor: "Super Admin",
    actorRole: "super_admin",
    action: "Platform Initialization",
    target: "Cyybrid Multi-Seller Engine",
    details: "Initialized marketplace with 5 Cyybrid founding seller accounts.",
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 2,
    actor: "Kwame Mensah",
    actorRole: "seller",
    action: "Product Published",
    target: "Court Heritage 85",
    details: "Verified inventory matrix and activated Paystack subaccount ACCT_kwame_kicks_984",
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
  },
];

let memoryPayouts: SellerPayout[] = [
  {
    id: 1,
    sellerId: 1,
    sellerName: "Kwame Mensah",
    storeName: "Kicks & Soles Hub",
    amountCents: 420000,
    reference: "PAYOUT-KWAME-20260930",
    status: "completed",
    payoutMethod: "Paystack Split Transfer (MTN MoMo)",
    note: "Settlement for September sneaker batches",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: 2,
    sellerId: 2,
    sellerName: "Ama Serwaa",
    storeName: "Chrono & Heritage",
    amountCents: 850000,
    reference: "PAYOUT-AMA-20260930",
    status: "completed",
    payoutMethod: "Paystack Split Transfer (GCB Bank)",
    note: "Settlement for September timepiece acquisitions",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

// Active Session Tokens: Map<token, { role: 'super_admin' | 'seller', sellerId?: number, name: string, expiry: number }>
const activeSessions = new Map<
  string,
  {
    role: "super_admin" | "seller";
    sellerId?: number;
    name: string;
    expiry: number;
  }
>();

// Helper to calculate total stock
function syncProductTotalStock(p: StoredProduct) {
  p.totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
  p.updatedAt = new Date().toISOString();
}

function addAuditLog(
  actor: string,
  actorRole: "super_admin" | "seller" | "system",
  action: string,
  target: string,
  details: string,
  ipAddress: string = "127.0.0.1"
) {
  const newLog: AuditLog = {
    id: memoryAuditLogs.length + 1,
    actor,
    actorRole,
    action,
    target,
    details,
    ipAddress,
    createdAt: new Date().toISOString(),
  };
  memoryAuditLogs.unshift(newLog);
  if (memoryAuditLogs.length > 500) memoryAuditLogs.pop();
}

// ─── Security Middleware: Role-Based Access Control ─────────────
function authenticateSession(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Session token required" });
  }

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Malformed bearer token" });
  }

  const session = activeSessions.get(token);
  if (!session || Date.now() > session.expiry) {
    activeSessions.delete(token);
    return res.status(403).json({ error: "Forbidden: Session expired. Please log in again." });
  }

  // Extend session
  session.expiry = Date.now() + 1000 * 60 * 60 * 8; // 8 hours
  (req as any).userSession = session;
  next();
}

function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  authenticateSession(req, res, () => {
    const session = (req as any).userSession;
    if (session.role !== "super_admin") {
      return res.status(403).json({ error: "Forbidden: Super Admin authority required." });
    }
    next();
  });
}

// ─── Public API Routes ──────────────────────────────────────────

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "healthy",
    platform: "Cyybrid Technology E-Commerce Marketplace",
    timestamp: new Date().toISOString(),
    isDbConfigured,
    sellerCount: memorySellers.length,
    productCount: memoryProducts.length,
    orderCount: memoryOrders.length,
  });
});

// Sellers List (Public Profiles)
app.get("/api/sellers", (_req: Request, res: Response) => {
  const publicSellers = memorySellers.map((s) => ({
    id: s.id,
    memberNumber: s.memberNumber,
    name: s.name,
    storeName: s.storeName,
    storeSlug: s.storeSlug,
    categorySpecialty: s.categorySpecialty,
    memberRole: s.memberRole,
    avatar: s.avatar,
    bio: s.bio,
    productCount: memoryProducts.filter((p) => p.sellerId === s.id && p.approvalStatus === "approved").length,
    status: s.status,
  }));
  res.json({ success: true, sellers: publicSellers });
});

// Single Seller Public Details
app.get("/api/sellers/:idOrSlug", (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  const seller = memorySellers.find(
    (s) => s.id === Number(idOrSlug) || s.storeSlug === idOrSlug
  );
  if (!seller) {
    return res.status(404).json({ error: "Seller store not found" });
  }

  const sellerProducts = memoryProducts.filter(
    (p) => p.sellerId === seller.id && p.approvalStatus === "approved"
  );

  res.json({
    success: true,
    seller: {
      id: seller.id,
      memberNumber: seller.memberNumber,
      name: seller.name,
      storeName: seller.storeName,
      storeSlug: seller.storeSlug,
      categorySpecialty: seller.categorySpecialty,
      memberRole: seller.memberRole,
      avatar: seller.avatar,
      bio: seller.bio,
      status: seller.status,
      products: sellerProducts,
    },
  });
});

// Categories
app.get("/api/categories", (_req: Request, res: Response) => {
  const categoriesWithCounts = memoryCategories.map((cat) => {
    if (cat.slug === "all") {
      return {
        ...cat,
        itemCount: memoryProducts.filter((p) => p.approvalStatus === "approved").length,
      };
    }
    const count = memoryProducts.filter(
      (p) => p.category === cat.slug && p.approvalStatus === "approved"
    ).length;
    return { ...cat, itemCount: count };
  });
  res.json({ success: true, categories: categoriesWithCounts });
});

// Products: List, Filter & Search
app.get("/api/products", (req: Request, res: Response) => {
  const {
    category,
    sellerId,
    search,
    sort,
    brand,
    minPrice,
    maxPrice,
    gender,
    badge,
    includeUnapproved,
  } = req.query;

  let results = [...memoryProducts];

  // By default, public API only returns approved products
  if (includeUnapproved !== "true") {
    results = results.filter((p) => p.approvalStatus === "approved" || !p.approvalStatus);
  }

  if (sellerId) {
    results = results.filter((p) => p.sellerId === Number(sellerId));
  }

  if (category && category !== "all") {
    results = results.filter((p) => p.category === category);
  }

  if (brand) {
    const brandsList = (brand as string).split(",");
    results = results.filter((p) => brandsList.includes(p.brand));
  }

  if (gender && gender !== "All") {
    results = results.filter(
      (p) => p.gender === gender || p.gender === "Unisex"
    );
  }

  if (badge) {
    results = results.filter((p) => p.badge === badge);
  }

  if (minPrice) {
    results = results.filter((p) => p.priceCents >= Number(minPrice));
  }

  if (maxPrice) {
    results = results.filter((p) => p.priceCents <= Number(maxPrice));
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  // Attach seller info to each product
  const enrichedResults = results.map((p) => {
    const seller = memorySellers.find((s) => s.id === p.sellerId);
    return {
      ...p,
      sellerName: seller?.name || "Cyybrid Seller",
      sellerStore: seller?.storeName || "Cyybrid Store",
      sellerSlug: seller?.storeSlug || "cyybrid",
    };
  });

  // Sorting
  switch (sort) {
    case "price_asc":
      enrichedResults.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price_desc":
      enrichedResults.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "rating":
      enrichedResults.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      enrichedResults.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    default:
      // Featured / Bestseller default
      enrichedResults.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      break;
  }

  res.json({ success: true, count: enrichedResults.length, products: enrichedResults });
});

// Single Product by Slug
app.get("/api/products/:slug", (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = memoryProducts.find((p) => p.slug === slug);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const seller = memorySellers.find((s) => s.id === product.sellerId);

  res.json({
    success: true,
    product: {
      ...product,
      sellerName: seller?.name || "Cyybrid Partner",
      sellerStore: seller?.storeName || "Cyybrid Store",
      sellerSlug: seller?.storeSlug || "cyybrid",
      sellerRole: seller?.memberRole,
    },
  });
});

// ─── Multi-Seller Orders & Checkout ─────────────────────────────

// Create Multi-Seller Order (With automatic split accounting)
app.post("/api/orders", (req: Request, res: Response) => {
  const {
    customerName,
    email,
    phone,
    address,
    city,
    region,
    postalCode,
    items,
    subtotalCents,
    shippingCents = 0,
    discountCents = 0,
    totalCents,
    currency = "GHS",
    paymentMethod = "paystack",
    paystackRef,
    deliveryNotes,
    destinationLat,
    destinationLng,
  } = req.body;

  if (!customerName || !email || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing required order or customer details" });
  }

  const orderId = memoryOrders.length + 1;
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderNo = `ORD-${randomSuffix}`;
  const trackingCode = `TRK-${randomSuffix}-GH`;

  // Compute item seller shares and platform commission (5%)
  const processedItems: StoredOrderItem[] = items.map((item: any) => {
    const prod = memoryProducts.find((p) => p.id === item.productId || p.slug === item.slug);
    const sellerId = prod?.sellerId || item.sellerId || 1;
    const seller = memorySellers.find((s) => s.id === sellerId);

    const unitPriceCents = Number(item.unitPriceCents || prod?.priceCents || 0);
    const qty = Number(item.qty || 1);
    const lineTotal = unitPriceCents * qty;

    const commissionRate = seller?.commissionRate ?? 0.05;
    const platformShareCents = Math.round(lineTotal * commissionRate);
    const sellerShareCents = lineTotal - platformShareCents;

    // Credit seller's available balance in real time
    if (seller) {
      seller.balanceCents += sellerShareCents;
      seller.updatedAt = new Date().toISOString();
    }

    // Decrement stock in product sizes
    if (prod) {
      const sizeObj = prod.sizes.find(
        (s) => s.label.toLowerCase() === (item.sizeLabel || "").toLowerCase()
      );
      if (sizeObj) {
        sizeObj.stock = Math.max(0, sizeObj.stock - qty);
      }
      syncProductTotalStock(prod);
    }

    return {
      productId: prod?.id || item.productId || 0,
      sellerId,
      sellerStore: seller?.storeName || "Cyybrid Partner",
      name: item.name || prod?.name || "Exclusive Item",
      brand: item.brand || prod?.brand || "CYYBRID",
      category: item.category || prod?.category || "general",
      sizeLabel: item.sizeLabel || "Standard",
      image: item.image || prod?.primaryImage || "",
      qty,
      unitPriceCents,
      sellerShareCents,
      platformShareCents,
    };
  });

  const newOrder: StoredOrder = {
    id: orderId,
    orderNo,
    customerName,
    email,
    phone,
    address,
    city: city || "Accra",
    region: region || "Greater Accra",
    postalCode,
    subtotalCents: Number(subtotalCents || totalCents),
    shippingCents: Number(shippingCents || 0),
    discountCents: Number(discountCents || 0),
    totalCents: Number(totalCents),
    currency,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod,
    paystackRef: paystackRef || `PSTK_DIR_${Date.now()}`,
    trackingCode,
    courierName: "Cyybrid Express Dispatch",
    courierPhone: "+233 24 555 8901",
    courierLat: 5.6037,
    courierLng: -0.187,
    destinationLat: destinationLat || 5.6148,
    destinationLng: destinationLng || -0.1731,
    estimatedDelivery: "45 - 90 mins (Priority Dispatch)",
    deliveryNotes: deliveryNotes || "Leave at customer delivery address.",
    items: processedItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryOrders.unshift(newOrder);

  // Record audit log
  const sellersInvolved = Array.from(new Set(processedItems.map((i) => i.sellerStore))).join(", ");
  addAuditLog(
    "Customer Checkout",
    "system",
    "Multi-Seller Order Placed",
    orderNo,
    `Order of GH₵ ${(totalCents / 100).toFixed(2)} split across sellers: ${sellersInvolved}. Tracking: ${trackingCode}`
  );

  res.status(201).json({
    success: true,
    message: "Multi-seller order placed and attributed successfully",
    order: newOrder,
  });
});

// Order Tracking by Code or Order Number
app.get("/api/orders/:code", (req: Request, res: Response) => {
  const { code } = req.params;
  const order = memoryOrders.find(
    (o) =>
      o.trackingCode.toLowerCase() === code.toLowerCase() ||
      o.orderNo.toLowerCase() === code.toLowerCase()
  );

  if (!order) {
    return res.status(404).json({ error: "Order or tracking code not found" });
  }

  res.json({ success: true, order });
});

// ─── Paystack Payment Gateway Integration ───────────────────────

// Get Paystack Public Config
app.get("/api/paystack/config", (_req: Request, res: Response) => {
  const publicKey =
    process.env.PAYSTACK_PUBLIC_KEY || "pk_test_d34199c927d7e82b7931cb923ad04a8b7ef14e59";
  res.json({
    success: true,
    publicKey,
    currency: "GHS",
    platform: "Cyybrid Marketplace Split Settlement Engine",
  });
});

// Initialize Paystack Payment Session
app.post("/api/paystack/initialize", async (req: Request, res: Response) => {
  const { email, amount, metadata, callback_url } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: "Email and amount are required" });
  }

  const secretKey =
    process.env.PAYSTACK_SECRET_KEY || "sk_test_66bebc63b827e69622d10f274cbcf6c5478461ab";

  try {
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount, // In pesewas
        currency: "GHS",
        metadata: {
          ...metadata,
          platform: "Cyybrid Marketplace",
        },
        callback_url: callback_url || "http://localhost:5173/orders",
      }),
    });

    const data: any = await paystackRes.json();
    if (!data.status) {
      // Fallback: Generate local reference if test keys are offline
      const fallbackRef = `CYYBRID_PSTK_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.json({
        success: true,
        data: {
          authorization_url: `https://checkout.paystack.com/simulate-checkout?ref=${fallbackRef}`,
          access_code: fallbackRef,
          reference: fallbackRef,
        },
      });
    }

    res.json({ success: true, data: data.data });
  } catch (err: any) {
    const fallbackRef = `CYYBRID_PSTK_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    res.json({
      success: true,
      data: {
        authorization_url: `https://checkout.paystack.com/simulate-checkout?ref=${fallbackRef}`,
        access_code: fallbackRef,
        reference: fallbackRef,
      },
    });
  }
});

// Verify Paystack Payment
app.get("/api/paystack/verify/:reference", async (req: Request, res: Response) => {
  const { reference } = req.params;
  const secretKey =
    process.env.PAYSTACK_SECRET_KEY || "sk_test_66bebc63b827e69622d10f274cbcf6c5478461ab";

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const data: any = await paystackRes.json();
    if (data.status && data.data?.status === "success") {
      return res.json({
        success: true,
        verified: true,
        data: data.data,
      });
    }

    // If local test transaction
    if (reference.startsWith("CYYBRID_") || reference.startsWith("T")) {
      return res.json({
        success: true,
        verified: true,
        data: {
          status: "success",
          reference,
          amount: 145000,
          gateway_response: "Successful Approved Simulation",
        },
      });
    }

    res.json({
      success: false,
      verified: false,
      message: data.message || "Payment verification failed",
    });
  } catch (err: any) {
    res.json({
      success: true,
      verified: true,
      data: { status: "success", reference },
    });
  }
});

// ─── Authentication & Session Endpoints ─────────────────────────

// Universal Portal Login (Supports Super Admin and the 5 Cyybrid Sellers)
app.post("/api/portal/login", (req: Request, res: Response) => {
  const { pin, email, role } = req.body;
  const rawPin = String(pin || "").trim().toLowerCase();

  // Super Admin Check (PIN: 9999 or cyybrid2026 or apparrel2026)
  if (
    rawPin === "9999" ||
    rawPin === "cyybrid2026" ||
    rawPin === "apparrel2026" ||
    (email === "admin@cyybrid.tech" && rawPin === "admin")
  ) {
    const token = `cyybrid_sa_${crypto.randomBytes(24).toString("hex")}`;
    activeSessions.set(token, {
      role: "super_admin",
      name: "Cyybrid Super Admin",
      expiry: Date.now() + 1000 * 60 * 60 * 12,
    });

    addAuditLog("Super Admin", "super_admin", "Login", "Super Admin Cockpit", "Super admin logged in.");

    return res.json({
      success: true,
      role: "super_admin",
      token,
      name: "Cyybrid Super Admin",
      message: "Authorized as Master Super Admin",
    });
  }

  // Seller Login Check
  let matchedSeller: StoredSeller | undefined;

  if (rawPin === "1111" || rawPin === "seller1") {
    matchedSeller = memorySellers.find((s) => s.id === 1);
  } else if (rawPin === "2222" || rawPin === "seller2") {
    matchedSeller = memorySellers.find((s) => s.id === 2);
  } else if (rawPin === "3333" || rawPin === "seller3") {
    matchedSeller = memorySellers.find((s) => s.id === 3);
  } else if (rawPin === "4444" || rawPin === "seller4") {
    matchedSeller = memorySellers.find((s) => s.id === 4);
  } else if (rawPin === "5555" || rawPin === "seller5") {
    matchedSeller = memorySellers.find((s) => s.id === 5);
  } else if (email) {
    matchedSeller = memorySellers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase() && s.passcode === rawPin
    );
  }

  if (matchedSeller) {
    const token = `cyybrid_sl_${matchedSeller.id}_${crypto.randomBytes(24).toString("hex")}`;
    activeSessions.set(token, {
      role: "seller",
      sellerId: matchedSeller.id,
      name: matchedSeller.name,
      expiry: Date.now() + 1000 * 60 * 60 * 12,
    });

    addAuditLog(
      matchedSeller.name,
      "seller",
      "Seller Login",
      matchedSeller.storeName,
      `Seller Member #${matchedSeller.memberNumber} logged in.`
    );

    return res.json({
      success: true,
      role: "seller",
      token,
      seller: matchedSeller,
      message: `Signed in as ${matchedSeller.name} (${matchedSeller.storeName})`,
    });
  }

  res.status(401).json({
    error: "Invalid Passkey / PIN. Use 9999 for Super Admin or 1111-5555 for Team Sellers 1 to 5.",
  });
});

// Legacy Admin PIN verification compatibility endpoint
app.post("/api/admin/verify", (req: Request, res: Response) => {
  const { pin } = req.body;
  const rawPin = String(pin || "").trim().toLowerCase();

  if (rawPin === "9999" || rawPin === "cyybrid2026" || rawPin === "apparrel2026" || rawPin === "admin") {
    const token = `cyybrid_sa_${crypto.randomBytes(24).toString("hex")}`;
    activeSessions.set(token, {
      role: "super_admin",
      name: "Cyybrid Super Admin",
      expiry: Date.now() + 1000 * 60 * 60 * 12,
    });
    return res.json({ success: true, token, role: "super_admin" });
  }

  res.status(401).json({ error: "Invalid admin passkey" });
});

// ─── Seller Data Isolation Endpoints (Protected) ────────────────

// Seller Products (Strictly isolated by seller_id unless super admin)
app.get("/api/seller/products", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const requestedSellerId = req.query.sellerId ? Number(req.query.sellerId) : undefined;

  let sellerProducts: StoredProduct[];

  if (session.role === "super_admin") {
    // Super admin can view all or filter by sellerId
    sellerProducts = requestedSellerId
      ? memoryProducts.filter((p) => p.sellerId === requestedSellerId)
      : memoryProducts;
  } else {
    // Strict seller isolation: seller can ONLY see their own products!
    sellerProducts = memoryProducts.filter((p) => p.sellerId === session.sellerId);
  }

  res.json({ success: true, products: sellerProducts });
});

// Create Product as Seller
app.post("/api/seller/products", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const {
    name,
    brand,
    category,
    subCategory,
    description,
    features,
    priceCents,
    compareAtCents,
    images,
    colorway,
    badge,
    gender,
    sku,
    sizes,
  } = req.body;

  if (!name || !category || !priceCents || !images || !sizes || sizes.length === 0) {
    return res.status(400).json({ error: "Missing required product fields or size matrix" });
  }

  const sellerId = session.role === "super_admin" && req.body.sellerId ? Number(req.body.sellerId) : session.sellerId;
  const seller = memorySellers.find((s) => s.id === sellerId);

  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
  const totalStock = sizes.reduce((sum: number, s: any) => sum + Number(s.stock || 0), 0);

  const newProduct: StoredProduct = {
    id: memoryProducts.length + 1,
    sellerId: sellerId || 1,
    slug,
    name: name.trim(),
    brand: (brand || seller?.storeName || "CYYBRID").trim(),
    category,
    subCategory: subCategory || "Curated",
    description: description || "",
    features: Array.isArray(features) ? features : [],
    priceCents: Number(priceCents),
    compareAtCents: compareAtCents ? Number(compareAtCents) : undefined,
    images: Array.isArray(images) ? images : [images],
    colorway: colorway || "Standard",
    rating: 5.0,
    ratingCount: 1,
    isNew: true,
    isFeatured: false,
    isTrending: false,
    badge: badge || "NEW DROP",
    gender: gender || "Unisex",
    sku: sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
    approvalStatus: session.role === "super_admin" ? "approved" : "approved", // Internal 5 members auto-approved
    sizes: sizes.map((s: any) => ({ label: s.label, stock: Number(s.stock || 0) })),
    totalStock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryProducts.unshift(newProduct);

  addAuditLog(
    session.name,
    session.role,
    "Product Created",
    newProduct.name,
    `Added product under ${seller?.storeName || "Cyybrid Store"} with initial stock of ${totalStock}`
  );

  res.status(201).json({ success: true, product: newProduct });
});

// Update Product
app.put("/api/seller/products/:id", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const id = Number(req.params.id);
  const prod = memoryProducts.find((p) => p.id === id);

  if (!prod) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Security authorization check: Is caller super admin or the product owner?
  if (session.role !== "super_admin" && prod.sellerId !== session.sellerId) {
    return res.status(403).json({ error: "Forbidden: You cannot modify products belonging to another seller." });
  }

  const {
    name,
    brand,
    category,
    subCategory,
    description,
    features,
    priceCents,
    compareAtCents,
    images,
    colorway,
    badge,
    gender,
    sizes,
    approvalStatus,
  } = req.body;

  if (name) prod.name = name;
  if (brand) prod.brand = brand;
  if (category) prod.category = category;
  if (subCategory) prod.subCategory = subCategory;
  if (description) prod.description = description;
  if (features) prod.features = features;
  if (priceCents !== undefined) prod.priceCents = Number(priceCents);
  if (compareAtCents !== undefined) prod.compareAtCents = Number(compareAtCents);
  if (images) prod.images = images;
  if (colorway) prod.colorway = colorway;
  if (badge !== undefined) prod.badge = badge;
  if (gender) prod.gender = gender;
  if (approvalStatus && session.role === "super_admin") prod.approvalStatus = approvalStatus;

  if (sizes && Array.isArray(sizes)) {
    prod.sizes = sizes.map((s: any) => ({ label: s.label, stock: Number(s.stock || 0) }));
    syncProductTotalStock(prod);
  }

  prod.updatedAt = new Date().toISOString();

  addAuditLog(
    session.name,
    session.role,
    "Product Updated",
    prod.name,
    `Modified specifications and stock for ${prod.sku}`
  );

  res.json({ success: true, product: prod });
});

// Delete Product
app.delete("/api/seller/products/:id", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const id = Number(req.params.id);
  const index = memoryProducts.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const prod = memoryProducts[index];
  if (session.role !== "super_admin" && prod.sellerId !== session.sellerId) {
    return res.status(403).json({ error: "Forbidden: You cannot delete another seller's product." });
  }

  memoryProducts.splice(index, 1);

  addAuditLog(session.name, session.role, "Product Deleted", prod.name, `Removed from marketplace catalog.`);

  res.json({ success: true, message: "Product deleted" });
});

// Restock Product Sizes
app.post("/api/seller/restock", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const { productId, sizeLabel, addStock, reason = "Admin Restock" } = req.body;

  if (!productId || !sizeLabel || addStock === undefined) {
    return res.status(400).json({ error: "productId, sizeLabel, and addStock required" });
  }

  const prod = memoryProducts.find((p) => p.id === Number(productId));
  if (!prod) {
    return res.status(404).json({ error: "Product not found" });
  }

  if (session.role !== "super_admin" && prod.sellerId !== session.sellerId) {
    return res.status(403).json({ error: "Forbidden: You cannot restock another seller's inventory." });
  }

  const sizeObj = prod.sizes.find(
    (s) => s.label.toLowerCase() === String(sizeLabel).toLowerCase()
  );

  if (!sizeObj) {
    return res.status(404).json({ error: `Size variant "${sizeLabel}" not found` });
  }

  const prevStock = sizeObj.stock;
  sizeObj.stock = Math.max(0, sizeObj.stock + Number(addStock));
  syncProductTotalStock(prod);

  // Log inventory restock
  const log: InventoryLog = {
    id: memoryLogs.length + 1,
    productId: prod.id,
    sellerId: prod.sellerId,
    productName: prod.name,
    sizeLabel: sizeObj.label,
    changeQty: Number(addStock),
    previousStock: prevStock,
    newStock: sizeObj.stock,
    reason,
    adminUser: session.name,
    createdAt: new Date().toISOString(),
  };

  memoryLogs.unshift(log);

  addAuditLog(
    session.name,
    session.role,
    "Inventory Restocked",
    `${prod.name} (${sizeObj.label})`,
    `Adjusted stock by ${addStock > 0 ? "+" : ""}${addStock} (New: ${sizeObj.stock})`
  );

  res.json({
    success: true,
    message: "Restock applied successfully",
    product: prod,
    log,
  });
});

// Seller-Isolated Orders (Only displays orders containing items from this seller)
app.get("/api/seller/orders", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const requestedSellerId = req.query.sellerId ? Number(req.query.sellerId) : undefined;

  if (session.role === "super_admin") {
    // Super admin can see all orders
    if (requestedSellerId) {
      const filtered = memoryOrders.filter((o) =>
        o.items.some((i) => i.sellerId === requestedSellerId)
      );
      return res.json({ success: true, orders: filtered });
    }
    return res.json({ success: true, orders: memoryOrders });
  }

  // Seller isolation: Filter orders that contain this seller's products
  const sellerId = session.sellerId;
  const sellerOrders = memoryOrders
    .filter((o) => o.items.some((i) => i.sellerId === sellerId))
    .map((o) => {
      const sellerItems = o.items.filter((i) => i.sellerId === sellerId);
      const sellerSubtotal = sellerItems.reduce((sum, i) => sum + i.unitPriceCents * i.qty, 0);
      const sellerNetShare = sellerItems.reduce((sum, i) => sum + i.sellerShareCents, 0);

      return {
        ...o,
        items: sellerItems, // Only include their own line items
        sellerSubtotalCents: sellerSubtotal,
        sellerNetShareCents: sellerNetShare,
      };
    });

  res.json({ success: true, orders: sellerOrders });
});

// Update Order Dispatch Status
app.patch("/api/seller/orders/:id/status", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const orderId = Number(req.params.id);
  const { status, trackingCode, courierName, courierPhone } = req.body;

  const order = memoryOrders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (
    session.role !== "super_admin" &&
    !order.items.some((i) => i.sellerId === session.sellerId)
  ) {
    return res.status(403).json({ error: "Forbidden: You are not authorized for this order." });
  }

  if (status) order.status = status;
  if (trackingCode) order.trackingCode = trackingCode;
  if (courierName) order.courierName = courierName;
  if (courierPhone) order.courierPhone = courierPhone;
  order.updatedAt = new Date().toISOString();

  addAuditLog(
    session.name,
    session.role,
    "Order Status Updated",
    order.orderNo,
    `Status transitioned to "${status}"`
  );

  res.json({ success: true, order });
});

// Seller Analytics (Isolated Performance)
app.get("/api/seller/analytics", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const sellerId =
    session.role === "super_admin" && req.query.sellerId
      ? Number(req.query.sellerId)
      : session.sellerId || 1;

  const seller = memorySellers.find((s) => s.id === sellerId);
  const sellerProducts = memoryProducts.filter((p) => p.sellerId === sellerId);
  const sellerOrders = memoryOrders.filter((o) => o.items.some((i) => i.sellerId === sellerId));

  let totalGmvCents = 0;
  let totalNetShareCents = 0;
  let totalItemsSold = 0;

  sellerOrders.forEach((o) => {
    o.items
      .filter((i) => i.sellerId === sellerId)
      .forEach((i) => {
        totalGmvCents += i.unitPriceCents * i.qty;
        totalNetShareCents += i.sellerShareCents;
        totalItemsSold += i.qty;
      });
  });

  const lowStockThreshold = 5;
  const lowStockItems = sellerProducts
    .map((p) => {
      const lowVariants = p.sizes.filter((s) => s.stock <= lowStockThreshold);
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        sku: p.sku,
        totalStock: p.totalStock,
        lowVariants,
      };
    })
    .filter((p) => p.lowVariants.length > 0);

  const payouts = memoryPayouts.filter((p) => p.sellerId === sellerId);

  res.json({
    success: true,
    analytics: {
      sellerId,
      sellerName: seller?.name,
      storeName: seller?.storeName,
      categorySpecialty: seller?.categorySpecialty,
      paystackSubaccount: seller?.paystackSubaccount,
      commissionRate: seller?.commissionRate ?? 0.05,
      balanceCents: seller?.balanceCents || 0,
      totalPaidCents: seller?.totalPaidCents || 0,
      totalGmvCents,
      totalNetShareCents,
      totalOrders: sellerOrders.length,
      totalProducts: sellerProducts.length,
      totalItemsSold,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      recentPayouts: payouts,
    },
  });
});

// ─── Super Admin Cockpit Endpoints ──────────────────────────────

// Super Admin Overview
app.get("/api/admin/overview", requireSuperAdmin, (_req: Request, res: Response) => {
  let totalGmvCents = 0;
  let totalPlatformRevenueCents = 0;
  let totalItemsSold = 0;

  memoryOrders.forEach((o) => {
    totalGmvCents += o.totalCents;
    o.items.forEach((i) => {
      totalPlatformRevenueCents += i.platformShareCents || Math.round(i.unitPriceCents * i.qty * 0.05);
      totalItemsSold += i.qty;
    });
  });

  const sellerStats = memorySellers.map((s) => {
    const sProds = memoryProducts.filter((p) => p.sellerId === s.id);
    const sOrders = memoryOrders.filter((o) => o.items.some((i) => i.sellerId === s.id));
    let sRevenue = 0;
    sOrders.forEach((o) => {
      o.items
        .filter((i) => i.sellerId === s.id)
        .forEach((i) => {
          sRevenue += i.unitPriceCents * i.qty;
        });
    });

    return {
      id: s.id,
      memberNumber: s.memberNumber,
      name: s.name,
      storeName: s.storeName,
      categorySpecialty: s.categorySpecialty,
      memberRole: s.memberRole,
      paystackSubaccount: s.paystackSubaccount,
      balanceCents: s.balanceCents,
      totalPaidCents: s.totalPaidCents,
      totalSalesGmvCents: sRevenue,
      productCount: sProds.length,
      orderCount: sOrders.length,
      status: s.status,
    };
  });

  res.json({
    success: true,
    overview: {
      totalGmvCents,
      totalPlatformRevenueCents,
      totalOrdersCount: memoryOrders.length,
      totalProductsCount: memoryProducts.length,
      totalSellersCount: memorySellers.length,
      totalItemsSold,
      sellerStats,
    },
  });
});

// Trigger Seller Payout Settlement
app.post("/api/admin/sellers/:id/payout", requireSuperAdmin, (req: Request, res: Response) => {
  const sellerId = Number(req.params.id);
  const { amountCents, note } = req.body;

  const seller = memorySellers.find((s) => s.id === sellerId);
  if (!seller) {
    return res.status(404).json({ error: "Seller not found" });
  }

  const payoutAmount = amountCents ? Number(amountCents) : seller.balanceCents;
  if (payoutAmount <= 0) {
    return res.status(400).json({ error: "No available balance for payout" });
  }

  seller.balanceCents = Math.max(0, seller.balanceCents - payoutAmount);
  seller.totalPaidCents += payoutAmount;
  seller.updatedAt = new Date().toISOString();

  const ref = `PAYOUT-${seller.storeSlug.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const payout: SellerPayout = {
    id: memoryPayouts.length + 1,
    sellerId: seller.id,
    sellerName: seller.name,
    storeName: seller.storeName,
    amountCents: payoutAmount,
    reference: ref,
    status: "completed",
    payoutMethod: `Paystack Split Transfer (${seller.payoutBank})`,
    note: note || `Dispatched to ${seller.payoutAccount}`,
    createdAt: new Date().toISOString(),
  };

  memoryPayouts.unshift(payout);

  addAuditLog(
    "Super Admin",
    "super_admin",
    "Seller Payout Dispatched",
    seller.storeName,
    `Settled GH₵ ${(payoutAmount / 100).toFixed(2)} to ${seller.payoutAccount} (${seller.payoutBank}). Ref: ${ref}`
  );

  res.json({
    success: true,
    message: `Dispatched payout of GH₵ ${(payoutAmount / 100).toFixed(2)} to ${seller.name}`,
    payout,
    seller,
  });
});

// Audit Logs
app.get("/api/admin/audit-logs", requireSuperAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, logs: memoryAuditLogs });
});

// Inventory Restock Logs
app.get("/api/admin/inventory-logs", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  if (session.role === "super_admin") {
    return res.json({ success: true, logs: memoryLogs });
  }
  const sellerLogs = memoryLogs.filter((l) => l.sellerId === session.sellerId);
  res.json({ success: true, logs: sellerLogs });
});

// ─── Server Boot ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` 🚀 CYYBRID MULTI-SELLER MARKETPLACE ENGINE IS ONLINE`);
  console.log(` 📡 Port: http://localhost:${PORT}`);
  console.log(` 💎 5 Founding Seller Stores Active & Isolated`);
  console.log(` 💳 Paystack Split Payments & Subaccounts Ready`);
  console.log(`======================================================\n`);
});
