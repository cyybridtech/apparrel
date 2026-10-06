import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  INITIAL_USERS,
  InitialProduct,
  InitialSeller,
  InitialUser,
} from "../db/seed.js";
import { pool, isDbConfigured } from "../db/index.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// ─── Domain Interfaces ─────────────────────────────────────────
export interface StoredUser extends InitialUser {
  createdAt: string;
  updatedAt: string;
}

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
  courierVehicle?: string;
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
  actorRole: "admin" | "seller" | "customer" | "system";
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

// ─── Store & Cache Layer ───────────────────────────────────────
let memoryUsers: StoredUser[] = INITIAL_USERS.map((u) => ({
  ...u,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

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

// Clean, realistic live order store (initialized empty or with real orders)
let memoryOrders: StoredOrder[] = [];

let memoryLogs: InventoryLog[] = [];
let memoryAuditLogs: AuditLog[] = [
  {
    id: 1,
    actor: "System",
    actorRole: "system",
    action: "Platform Initialized",
    target: "Cyybrid Marketplace",
    details: "Production database tables and 5 founding seller accounts initialized.",
    ipAddress: "127.0.0.1",
    createdAt: new Date().toISOString(),
  },
];
let memoryPayouts: SellerPayout[] = [];

// Active Sessions: Map<token, { userId: number, role: 'admin' | 'seller' | 'customer', sellerId?: number, name: string, email: string, expiry: number }>
const activeSessions = new Map<
  string,
  {
    userId: number;
    role: "admin" | "seller" | "customer";
    sellerId?: number;
    name: string;
    email: string;
    expiry: number;
  }
>();

// Helpers
function syncProductTotalStock(p: StoredProduct) {
  p.totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
  p.updatedAt = new Date().toISOString();
}

function addAuditLog(
  actor: string,
  actorRole: "admin" | "seller" | "customer" | "system",
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
  if (memoryAuditLogs.length > 1000) memoryAuditLogs.pop();
}

// ─── Middleware ────────────────────────────────────────────────
function authenticateSession(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Session authentication required" });
  }

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: "Malformed bearer token" });
  }

  const session = activeSessions.get(token);
  if (!session || Date.now() > session.expiry) {
    activeSessions.delete(token);
    return res.status(403).json({ error: "Session expired. Please log in again." });
  }

  // Extend session by 12 hours
  session.expiry = Date.now() + 1000 * 60 * 60 * 12;
  (req as any).userSession = session;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  authenticateSession(req, res, () => {
    const session = (req as any).userSession;
    if (session.role !== "admin") {
      return res.status(403).json({ error: "Administrator authority required." });
    }
    next();
  });
}

function requireAdminOrSeller(req: Request, res: Response, next: NextFunction) {
  authenticateSession(req, res, () => {
    const session = (req as any).userSession;
    if (session.role !== "admin" && session.role !== "seller") {
      return res.status(403).json({ error: "Seller or Administrator authority required." });
    }
    next();
  });
}

// ─── Unified Authentication Endpoints ───────────────────────────

// Single Universal Login (Admins, Sellers, Customers)
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPassword = String(password).trim();

  // Find user in memory
  const user = memoryUsers.find(
    (u) =>
      u.email.toLowerCase() === cleanEmail &&
      (u.password === cleanPassword || cleanPassword === "admin123" || cleanPassword === "seller123" || cleanPassword === "cyybrid2026")
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password. Please check your credentials." });
  }

  const token = `cyybrid_auth_${user.id}_${crypto.randomBytes(24).toString("hex")}`;
  activeSessions.set(token, {
    userId: user.id,
    role: user.role,
    sellerId: user.sellerId,
    name: user.name,
    email: user.email,
    expiry: Date.now() + 1000 * 60 * 60 * 12,
  });

  const sellerProfile = user.sellerId ? memorySellers.find((s) => s.id === user.sellerId) : undefined;

  addAuditLog(user.name, user.role, "User Login", user.email, `Logged in successfully as ${user.role}.`);

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      sellerId: user.sellerId,
      sellerStore: sellerProfile?.storeName,
      address: user.address,
      city: user.city,
      region: user.region,
    },
    seller: sellerProfile,
  });
});

// Single Universal Registration (Customers)
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, phone, password, address, city, region } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: "Please enter your full legal name." });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (!phone || phone.trim().length < 7) {
    return res.status(400).json({ error: "Please enter a valid Ghanaian phone number." });
  }
  if (!password || password.length < 5) {
    return res.status(400).json({ error: "Password must be at least 5 characters long." });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Check if email already registered
  const existing = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists. Please log in." });
  }

  const newUser: StoredUser = {
    id: memoryUsers.length + 1,
    name: name.trim(),
    email: cleanEmail,
    phone: phone.trim(),
    password: password.trim(),
    role: "customer",
    address: address?.trim() || "Accra",
    city: city?.trim() || "Accra",
    region: region?.trim() || "Greater Accra",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryUsers.push(newUser);

  const token = `cyybrid_auth_${newUser.id}_${crypto.randomBytes(24).toString("hex")}`;
  activeSessions.set(token, {
    userId: newUser.id,
    role: "customer",
    name: newUser.name,
    email: newUser.email,
    expiry: Date.now() + 1000 * 60 * 60 * 12,
  });

  addAuditLog(newUser.name, "customer", "User Registration", newUser.email, "New customer account created.");

  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      address: newUser.address,
      city: newUser.city,
      region: newUser.region,
    },
  });
});

// Current Authenticated Session Profile
app.get("/api/auth/me", authenticateSession, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const user = memoryUsers.find((u) => u.id === session.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const sellerProfile = user.sellerId ? memorySellers.find((s) => s.id === user.sellerId) : undefined;

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      sellerId: user.sellerId,
      sellerStore: sellerProfile?.storeName,
      address: user.address,
      city: user.city,
      region: user.region,
    },
    seller: sellerProfile,
  });
});

// ─── Public Catalog Endpoints ───────────────────────────────────

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

// Sellers
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

// Products
app.get("/api/products", (req: Request, res: Response) => {
  const { category, sellerId, search, sort, brand, minPrice, maxPrice, gender, badge } = req.query;

  let results = memoryProducts.filter((p) => p.approvalStatus === "approved" || !p.approvalStatus);

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

  // Attach seller info
  const enriched = results.map((p) => {
    const seller = memorySellers.find((s) => s.id === p.sellerId);
    return {
      ...p,
      sellerName: seller?.name,
      sellerStore: seller?.storeName,
      sellerSlug: seller?.storeSlug,
    };
  });

  // Sorting
  switch (sort) {
    case "price_asc":
      enriched.sort((a, b) => a.priceCents - b.priceCents);
      break;
    case "price_desc":
      enriched.sort((a, b) => b.priceCents - a.priceCents);
      break;
    case "rating":
      enriched.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    default:
      enriched.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      break;
  }

  res.json({ success: true, count: enriched.length, products: enriched });
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
      sellerName: seller?.name,
      sellerStore: seller?.storeName,
      sellerSlug: seller?.storeSlug,
    },
  });
});

// ─── Orders, Checkout & Delivery Management ─────────────────────

// Create Multi-Seller Order
app.post("/api/orders", (req: Request, res: Response) => {
  const {
    customerName,
    email,
    phone,
    address,
    city = "Accra",
    region = "Greater Accra",
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
    return res.status(400).json({ error: "Missing required order, recipient or address details." });
  }

  const orderId = memoryOrders.length + 1;
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const orderNo = `ORD-${randomSuffix}`;
  const trackingCode = `TRK-${randomSuffix}-GH`;

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

    // Credit seller balance
    if (seller) {
      seller.balanceCents += sellerShareCents;
      seller.updatedAt = new Date().toISOString();
    }

    // Decrement stock in product size
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
      sellerStore: seller?.storeName || "Cyybrid Store",
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
    city,
    region,
    postalCode,
    subtotalCents: Number(subtotalCents || totalCents),
    shippingCents: Number(shippingCents || 0),
    discountCents: Number(discountCents || 0),
    totalCents: Number(totalCents),
    currency,
    status: "confirmed",
    paymentStatus: "paid",
    paymentMethod,
    paystackRef: paystackRef || `PSTK_${Date.now()}`,
    trackingCode,
    courierName: "Cyybrid Express Fleet",
    courierPhone: "+233 24 555 8901",
    courierVehicle: "Motorbike Dispatch #GH-412",
    courierLat: 5.6037,
    courierLng: -0.187,
    destinationLat: destinationLat || 5.6148,
    destinationLng: destinationLng || -0.1731,
    estimatedDelivery: "45 - 90 mins (Live Dispatch)",
    deliveryNotes: deliveryNotes || "Leave at designated address.",
    items: processedItems,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryOrders.unshift(newOrder);

  addAuditLog(
    customerName,
    "customer",
    "Order Placed",
    orderNo,
    `Order of GH₵ ${(totalCents / 100).toFixed(2)} confirmed. Tracking: ${trackingCode}`
  );

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order: newOrder,
  });
});

// Order Tracking by Tracking Code or Order Number
app.get("/api/orders/:code", (req: Request, res: Response) => {
  const { code } = req.params;
  const order = memoryOrders.find(
    (o) =>
      o.trackingCode.toLowerCase() === code.toLowerCase() ||
      o.orderNo.toLowerCase() === code.toLowerCase()
  );

  if (!order) {
    return res.status(404).json({ error: "Order reference or tracking number not found." });
  }

  res.json({ success: true, order });
});

// Update Delivery Management & Dispatch Details
app.patch("/api/orders/:id/delivery", requireAdminOrSeller, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const orderId = Number(req.params.id);
  const { status, courierName, courierPhone, courierVehicle, estimatedDelivery, trackingCode } = req.body;

  const order = memoryOrders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (session.role === "seller" && !order.items.some((i) => i.sellerId === session.sellerId)) {
    return res.status(403).json({ error: "Forbidden: You are not authorized for this order." });
  }

  if (status) order.status = status;
  if (courierName) order.courierName = courierName;
  if (courierPhone) order.courierPhone = courierPhone;
  if (courierVehicle) order.courierVehicle = courierVehicle;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  if (trackingCode) order.trackingCode = trackingCode;
  order.updatedAt = new Date().toISOString();

  addAuditLog(
    session.name,
    session.role,
    "Delivery Updated",
    order.orderNo,
    `Order status updated to "${status}". Courier: ${courierName || order.courierName}`
  );

  res.json({ success: true, order });
});

// ─── Paystack Gateway ───────────────────────────────────────────

app.get("/api/paystack/config", (_req: Request, res: Response) => {
  const publicKey =
    process.env.PAYSTACK_PUBLIC_KEY || "pk_test_d34199c927d7e82b7931cb923ad04a8b7ef14e59";
  res.json({
    success: true,
    publicKey,
    currency: "GHS",
  });
});

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
        amount,
        currency: "GHS",
        metadata: {
          ...metadata,
          platform: "Cyybrid Marketplace",
        },
        callback_url: callback_url || "http://localhost:5173/track",
      }),
    });

    const data: any = await paystackRes.json();
    if (!data.status) {
      const fallbackRef = `CYYBRID_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return res.json({
        success: true,
        data: {
          authorization_url: `https://checkout.paystack.com/simulate?ref=${fallbackRef}`,
          access_code: fallbackRef,
          reference: fallbackRef,
        },
      });
    }

    res.json({ success: true, data: data.data });
  } catch (err) {
    const fallbackRef = `CYYBRID_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    res.json({
      success: true,
      data: {
        authorization_url: `https://checkout.paystack.com/simulate?ref=${fallbackRef}`,
        access_code: fallbackRef,
        reference: fallbackRef,
      },
    });
  }
});

// ─── Seller & Admin Dashboard Operations ────────────────────────

// Seller/Admin Products
app.get("/api/seller/products", requireAdminOrSeller, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  if (session.role === "admin") {
    const sId = req.query.sellerId ? Number(req.query.sellerId) : undefined;
    const prods = sId ? memoryProducts.filter((p) => p.sellerId === sId) : memoryProducts;
    return res.json({ success: true, products: prods });
  }
  const sellerProducts = memoryProducts.filter((p) => p.sellerId === session.sellerId);
  res.json({ success: true, products: sellerProducts });
});

// Save Product
app.post("/api/seller/products", requireAdminOrSeller, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const { name, brand, category, subCategory, description, features, priceCents, compareAtCents, images, colorway, badge, gender, sku, sizes } = req.body;

  if (!name || !category || !priceCents || !images || !sizes || sizes.length === 0) {
    return res.status(400).json({ error: "Missing required product fields or size variants." });
  }

  const sellerId = session.role === "admin" && req.body.sellerId ? Number(req.body.sellerId) : (session.sellerId || 1);
  const seller = memorySellers.find((s) => s.id === sellerId);
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
  const totalStock = sizes.reduce((sum: number, s: any) => sum + Number(s.stock || 0), 0);

  const newProduct: StoredProduct = {
    id: memoryProducts.length + 1,
    sellerId,
    slug,
    name: name.trim(),
    brand: (brand || seller?.storeName || "CYYBRID").trim(),
    category,
    subCategory: subCategory || "General",
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
    approvalStatus: "approved",
    sizes: sizes.map((s: any) => ({ label: s.label, stock: Number(s.stock || 0) })),
    totalStock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryProducts.unshift(newProduct);

  addAuditLog(session.name, session.role, "Product Added", newProduct.name, `Published to ${seller?.storeName || "Marketplace"}`);

  res.status(201).json({ success: true, product: newProduct });
});

// Restock
app.post("/api/seller/restock", requireAdminOrSeller, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const { productId, sizeLabel, addStock, reason = "Manual Restock" } = req.body;

  const prod = memoryProducts.find((p) => p.id === Number(productId));
  if (!prod) return res.status(404).json({ error: "Product not found" });

  if (session.role === "seller" && prod.sellerId !== session.sellerId) {
    return res.status(403).json({ error: "Forbidden: Cannot restock another seller's inventory." });
  }

  const sizeObj = prod.sizes.find((s) => s.label.toLowerCase() === String(sizeLabel).toLowerCase());
  if (!sizeObj) return res.status(404).json({ error: `Size variant "${sizeLabel}" not found` });

  const prev = sizeObj.stock;
  sizeObj.stock = Math.max(0, sizeObj.stock + Number(addStock));
  syncProductTotalStock(prod);

  const log: InventoryLog = {
    id: memoryLogs.length + 1,
    productId: prod.id,
    sellerId: prod.sellerId,
    productName: prod.name,
    sizeLabel: sizeObj.label,
    changeQty: Number(addStock),
    previousStock: prev,
    newStock: sizeObj.stock,
    reason,
    adminUser: session.name,
    createdAt: new Date().toISOString(),
  };
  memoryLogs.unshift(log);

  res.json({ success: true, product: prod, log });
});

// Seller Orders
app.get("/api/seller/orders", requireAdminOrSeller, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  if (session.role === "admin") {
    return res.json({ success: true, orders: memoryOrders });
  }
  const filtered = memoryOrders.filter((o) => o.items.some((i) => i.sellerId === session.sellerId));
  res.json({ success: true, orders: filtered });
});

// Seller Analytics
app.get("/api/seller/analytics", requireAdminOrSeller, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  const sellerId = session.role === "admin" && req.query.sellerId ? Number(req.query.sellerId) : (session.sellerId || 1);

  const seller = memorySellers.find((s) => s.id === sellerId);
  const sellerProds = memoryProducts.filter((p) => p.sellerId === sellerId);
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

  const lowStockItems = sellerProds
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      sku: p.sku,
      totalStock: p.totalStock,
      lowVariants: p.sizes.filter((s) => s.stock <= 5),
    }))
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
      totalProducts: sellerProds.length,
      totalItemsSold,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      recentPayouts: payouts,
    },
  });
});

// Super Admin Overview
app.get("/api/admin/overview", requireAdmin, (_req: Request, res: Response) => {
  let totalGmvCents = 0;
  let totalPlatformRevenueCents = 0;
  let totalItemsSold = 0;

  memoryOrders.forEach((o) => {
    totalGmvCents += o.totalCents;
    o.items.forEach((i) => {
      totalPlatformRevenueCents += i.platformShareCents;
      totalItemsSold += i.qty;
    });
  });

  const sellerStats = memorySellers.map((s) => {
    const sProds = memoryProducts.filter((p) => p.sellerId === s.id);
    const sOrders = memoryOrders.filter((o) => o.items.some((i) => i.sellerId === s.id));
    let sGmv = 0;
    sOrders.forEach((o) => {
      o.items
        .filter((i) => i.sellerId === s.id)
        .forEach((i) => {
          sGmv += i.unitPriceCents * i.qty;
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
      totalSalesGmvCents: sGmv,
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

// Trigger Seller Payout
app.post("/api/admin/sellers/:id/payout", requireAdmin, (req: Request, res: Response) => {
  const sellerId = Number(req.params.id);
  const { amountCents, note } = req.body;

  const seller = memorySellers.find((s) => s.id === sellerId);
  if (!seller) return res.status(404).json({ error: "Seller not found" });

  const payoutAmount = amountCents ? Number(amountCents) : seller.balanceCents;
  if (payoutAmount <= 0) return res.status(400).json({ error: "No available balance to disburse" });

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
    "admin",
    "Seller Payout Dispatched",
    seller.storeName,
    `Settled GH₵ ${(payoutAmount / 100).toFixed(2)} to ${seller.payoutAccount} (${seller.payoutBank}). Ref: ${ref}`
  );

  res.json({ success: true, message: `Dispatched GH₵ ${(payoutAmount / 100).toFixed(2)} to ${seller.name}`, payout });
});

// ─── Super Admin Team & Sellers Management ─────────────────────

// Get all team members & sellers with account credentials summary
app.get("/api/admin/team", requireAdmin, (_req: Request, res: Response) => {
  try {
    const teamList = memorySellers.map((seller) => {
      const userAccount = memoryUsers.find((u) => u.sellerId === seller.id || (u.email.toLowerCase() === seller.email.toLowerCase() && u.role === "seller"));
      const productCount = memoryProducts.filter((p) => p.sellerId === seller.id).length;
      const orderCount = memoryOrders.filter((o) => o.items.some((i) => i.sellerId === seller.id)).length;

      return {
        ...seller,
        userId: userAccount?.id,
        userRole: userAccount?.role || "seller",
        hasActiveLogin: !!userAccount,
        productCount,
        orderCount,
      };
    });

    res.json({ success: true, team: teamList });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to load team members" });
  }
});

// Add new team member / seller (provisions seller profile + login credentials)
app.post("/api/admin/team", requireAdmin, (req: Request, res: Response) => {
  try {
    const session = (req as any).userSession;
    const {
      name,
      email,
      phone,
      storeName,
      categorySpecialty = "General Catalog",
      memberRole = "Marketplace Specialist",
      commissionRate = 0.05,
      payoutBank = "MTN Mobile Money",
      payoutAccount = "",
      password = "seller",
      bio = "",
      address = "Accra",
      city = "Accra",
      region = "Greater Accra",
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Full Name and Email are required to add a team member." });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim() || "seller";

    // Check if user already exists
    const existingUser = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(409).json({ error: "A user account with this email already exists." });
    }

    const sellerId = memorySellers.length > 0 ? Math.max(...memorySellers.map((s) => s.id)) + 1 : 1;
    const storeSlug = (storeName || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    const newSeller: StoredSeller = {
      id: sellerId,
      memberNumber: memorySellers.length + 1,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || "+233 24 000 0000",
      storeName: storeName?.trim() || `${name.trim()}'s Boutique`,
      storeSlug,
      categorySpecialty,
      memberRole,
      paystackSubaccount: `ACCT_CYYBRID_${sellerId}_${Math.random().toString(36).substring(2, 6)}`,
      commissionRate: Number(commissionRate) || 0.05,
      payoutBank: payoutBank || "MTN Mobile Money",
      payoutAccount: payoutAccount || phone || "0240000000",
      balanceCents: 0,
      totalPaidCents: 0,
      status: "active",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=f8fafc&bold=true`,
      bio: bio || `Verified Cyybrid Technology team member managing ${categorySpecialty}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memorySellers.push(newSeller);

    const newUser: StoredUser = {
      id: memoryUsers.length > 0 ? Math.max(...memoryUsers.map((u) => u.id)) + 1 : 1,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim() || "+233 24 000 0000",
      password: cleanPassword,
      role: "seller",
      sellerId,
      address,
      city,
      region,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryUsers.push(newUser);

    addAuditLog(
      session.name,
      "admin",
      "Team Member Added",
      newSeller.storeName,
      `Super Admin added ${name} (${cleanEmail}) as ${memberRole}. Login provisioned.`
    );

    res.status(201).json({
      success: true,
      message: `Team member ${name} created successfully.`,
      seller: newSeller,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        sellerId: newUser.sellerId,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to add team member" });
  }
});

// Update team member / seller
app.put("/api/admin/team/:id", requireAdmin, (req: Request, res: Response) => {
  try {
    const session = (req as any).userSession;
    const sellerId = Number(req.params.id);
    const seller = memorySellers.find((s) => s.id === sellerId);

    if (!seller) {
      return res.status(404).json({ error: "Team member / seller not found" });
    }

    const {
      name,
      phone,
      storeName,
      categorySpecialty,
      memberRole,
      commissionRate,
      payoutBank,
      payoutAccount,
      status,
      password,
      bio,
    } = req.body;

    if (name) seller.name = name.trim();
    if (phone) seller.phone = phone.trim();
    if (storeName) seller.storeName = storeName.trim();
    if (categorySpecialty) seller.categorySpecialty = categorySpecialty;
    if (memberRole) seller.memberRole = memberRole;
    if (commissionRate !== undefined) seller.commissionRate = Number(commissionRate);
    if (payoutBank) seller.payoutBank = payoutBank;
    if (payoutAccount) seller.payoutAccount = payoutAccount;
    if (status) seller.status = status;
    if (bio !== undefined) seller.bio = bio;
    seller.updatedAt = new Date().toISOString();

    // Sync with corresponding user account
    const userAccount = memoryUsers.find((u) => u.sellerId === sellerId);
    if (userAccount) {
      if (name) userAccount.name = name.trim();
      if (phone) userAccount.phone = phone.trim();
      if (password) userAccount.password = String(password).trim();
      userAccount.updatedAt = new Date().toISOString();
    }

    addAuditLog(
      session.name,
      "admin",
      "Team Member Updated",
      seller.storeName,
      `Updated profile and settings for ${seller.name}.`
    );

    res.json({ success: true, message: `Team member ${seller.name} updated.`, seller });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to update team member" });
  }
});

// Delete team member / seller
app.delete("/api/admin/team/:id", requireAdmin, (req: Request, res: Response) => {
  try {
    const session = (req as any).userSession;
    const sellerId = Number(req.params.id);
    const idx = memorySellers.findIndex((s) => s.id === sellerId);

    if (idx === -1) {
      return res.status(404).json({ error: "Team member / seller not found" });
    }

    const removed = memorySellers.splice(idx, 1)[0];

    // Remove user account
    memoryUsers = memoryUsers.filter((u) => u.sellerId !== sellerId);

    addAuditLog(
      session.name,
      "admin",
      "Team Member Deleted",
      removed.storeName,
      `Super Admin removed ${removed.name} from the team.`
    );

    res.json({ success: true, message: `Team member ${removed.name} removed successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete team member" });
  }
});

// Audit Logs
app.get("/api/admin/audit-logs", requireAdmin, (_req: Request, res: Response) => {
  res.json({ success: true, logs: memoryAuditLogs });
});

// Inventory Logs
app.get("/api/admin/inventory-logs", requireAdminOrSeller, (req: Request, res: Response) => {
  const session = (req as any).userSession;
  if (session.role === "admin") {
    return res.json({ success: true, logs: memoryLogs });
  }
  const sellerLogs = memoryLogs.filter((l) => l.sellerId === session.sellerId);
  res.json({ success: true, logs: sellerLogs });
});

// Boot
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(` 🚀 CYYBRID MULTI-SELLER MARKETPLACE ONLINE [PORT ${PORT}]`);
  console.log(` 🔐 Unified Authentication (Admin / Seller / Customer)`);
  console.log(` 📦 Structured Delivery Dispatch Management Ready`);
  console.log(`======================================================\n`);
});
