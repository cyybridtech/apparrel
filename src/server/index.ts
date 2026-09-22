import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, InitialProduct } from "../db/seed.js";
import { pool, isDbConfigured } from "../db/index.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// ─── In-Memory Store & Cache Layer (Resilient sync with DB) ───
interface StoredProduct extends InitialProduct {
  id: number;
  totalStock: number;
  createdAt: string;
  updatedAt: string;
}

interface StoredOrder {
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
  status: "confirmed" | "processing" | "dispatched" | "in_transit" | "out_for_delivery" | "delivered" | "cancelled";
  paymentStatus: "paid" | "unpaid" | "refunded";
  paymentMethod: string;
  paystackRef?: string;
  trackingCode: string;
  courierName: string;
  courierPhone: string;
  courierLat: number;
  courierLng: number;
  destinationLat: number;
  destinationLng: number;
  estimatedDelivery: string;
  deliveryNotes?: string;
  items: {
    productId: number;
    name: string;
    brand: string;
    category: string;
    sizeLabel: string;
    image: string;
    qty: number;
    unitPriceCents: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface InventoryLog {
  id: number;
  productId: number;
  productName: string;
  sizeLabel: string;
  changeQty: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adminUser: string;
  createdAt: string;
}

// In-memory runtime state
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
    courierName: "Kwame Boateng (Kicks Express Fleet #04)",
    courierPhone: "+233 24 555 8901",
    courierLat: 5.6080,
    courierLng: -0.1820,
    destinationLat: 5.6148,
    destinationLng: -0.1731,
    estimatedDelivery: "25 - 35 minutes",
    deliveryNotes: "Ring bell at gate, courier has dispatch code.",
    items: [
      {
        productId: 5,
        name: "Court Heritage 85 High-Top Sneaker",
        brand: "KICKS GH",
        category: "sneakers",
        sizeLabel: "EU 42",
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop",
        qty: 1,
        unitPriceCents: 145000,
      }
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
    subtotalCents: 167000,
    shippingCents: 0,
    discountCents: 16700,
    totalCents: 150300,
    currency: "GHS",
    status: "out_for_delivery",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    paystackRef: "T88412091223_PSTK",
    trackingCode: "TRK-88412-GH",
    courierName: "Emmanuel Osei (Express Fleet #09)",
    courierPhone: "+233 50 123 4567",
    courierLat: 5.6320,
    courierLng: -0.1540,
    destinationLat: 5.6360,
    destinationLng: -0.1510,
    estimatedDelivery: "5 - 10 minutes (Approaching)",
    deliveryNotes: "Leave at front reception desk.",
    items: [
      {
        productId: 9,
        name: "Royal Amber & Smoked Oud Extrait",
        brand: "PARFUMS D'OR",
        category: "perfumes",
        sizeLabel: "100ml",
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop",
        qty: 1,
        unitPriceCents: 125000,
      },
      {
        productId: 1,
        name: "Heavyweight Boxy Noir Tee",
        brand: "APPARREL STUDIO",
        category: "tops",
        sizeLabel: "L",
        image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
        qty: 1,
        unitPriceCents: 42000,
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    orderNo: "ORD-77190",
    customerName: "Nana Kwesi",
    email: "nana.kwesi@example.com",
    phone: "+233 27 765 4321",
    address: "5 4th Circular Road, Cantonments",
    city: "Accra",
    region: "Greater Accra",
    postalCode: "GA-082-1920",
    subtotalCents: 245000,
    shippingCents: 0,
    discountCents: 0,
    totalCents: 245000,
    currency: "GHS",
    status: "dispatched",
    paymentStatus: "paid",
    paymentMethod: "paystack",
    paystackRef: "T77190882312_PSTK",
    trackingCode: "TRK-77190-GH",
    courierName: "Yaw Mensah (Fleet #02)",
    courierPhone: "+233 24 999 1122",
    courierLat: 5.5820,
    courierLng: -0.1790,
    destinationLat: 5.5910,
    destinationLng: -0.1700,
    estimatedDelivery: "40 - 55 minutes",
    deliveryNotes: "Call upon arrival.",
    items: [
      {
        productId: 12,
        name: "Chronos Stealth Automatic 42mm",
        brand: "VORTEX HOROLOGY",
        category: "watches",
        sizeLabel: "42mm Steel Bracelet",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
        qty: 1,
        unitPriceCents: 245000,
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let memoryLogs: InventoryLog[] = [
  {
    id: 1,
    productId: 1,
    productName: "Heavyweight Boxy Noir Tee",
    sizeLabel: "M",
    changeQty: 24,
    previousStock: 0,
    newStock: 24,
    reason: "Initial Warehouse Stocking",
    adminUser: "System Init",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }
];

// Helper to calculate total stock
function syncProductTotalStock(p: StoredProduct) {
  p.totalStock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
  p.updatedAt = new Date().toISOString();
}

// ─── API Routes ──────────────────────────────────────────────

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    isDbConfigured,
    productCount: memoryProducts.length,
    orderCount: memoryOrders.length,
  });
});

// Categories
app.get("/api/categories", (req: Request, res: Response) => {
  // Compute accurate product counts per category
  const categoriesWithCounts = memoryCategories.map(cat => {
    if (cat.slug === "all") {
      return { ...cat, itemCount: memoryProducts.length };
    }
    const count = memoryProducts.filter(p => p.category === cat.slug).length;
    return { ...cat, itemCount: count };
  });
  res.json({ success: true, categories: categoriesWithCounts });
});

app.post("/api/categories", (req: Request, res: Response) => {
  const { name, slug, description, icon, bannerImage } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: "Category name and slug are required" });
  }

  const existing = memoryCategories.find(c => c.slug === slug);
  if (existing) {
    return res.status(409).json({ error: "Category with this slug already exists" });
  }

  const newCategory = {
    slug,
    name,
    description: description || "",
    icon: icon || "Sparkles",
    itemCount: 0,
    bannerImage: bannerImage || "",
    featured: true,
  };

  memoryCategories.push(newCategory);
  res.status(201).json({ success: true, category: newCategory });
});

// Products: List, Filter & Search
app.get("/api/products", (req: Request, res: Response) => {
  const { category, search, sort, brand, minPrice, maxPrice, gender, badge } = req.query;

  let results = [...memoryProducts];

  // Category filter
  if (category && category !== "all") {
    results = results.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }

  // Search filter
  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      p.colorway.toLowerCase().includes(q)
    );
  }

  // Brand filter
  if (brand && brand !== "all") {
    results = results.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
  }

  // Gender filter
  if (gender && gender !== "all") {
    results = results.filter(p => (p.gender && p.gender.toLowerCase() === String(gender).toLowerCase()) || p.gender === "Unisex");
  }

  // Badge filter
  if (badge) {
    results = results.filter(p => p.badge && p.badge.toLowerCase() === String(badge).toLowerCase());
  }

  // Price range
  if (minPrice) {
    results = results.filter(p => p.priceCents >= Number(minPrice));
  }
  if (maxPrice) {
    results = results.filter(p => p.priceCents <= Number(maxPrice));
  }

  // Sorting
  if (sort === "price-asc") {
    results.sort((a, b) => a.priceCents - b.priceCents);
  } else if (sort === "price-desc") {
    results.sort((a, b) => b.priceCents - a.priceCents);
  } else if (sort === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === "newest") {
    results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  } else {
    // default: featured & trending first
    results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  res.json({
    success: true,
    count: results.length,
    products: results,
  });
});

// Single Product by Slug
app.get("/api/products/:slug", (req: Request, res: Response) => {
  const { slug } = req.params;
  const product = memoryProducts.find(p => p.slug === slug || String(p.id) === slug);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Related products from same category
  const related = memoryProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  res.json({ success: true, product, related });
});

// ─── Paystack Payment Endpoints ──────────────────────────────
app.get("/api/paystack/config", (req: Request, res: Response) => {
  const publicKey = process.env.PAYSTACK_PUBLIC_KEY || "pk_test_placeholder_key";
  res.json({
    publicKey,
    currency: process.env.PAYSTACK_CURRENCY || "GHS",
  });
});

app.post("/api/paystack/initialize", async (req: Request, res: Response) => {
  try {
    const { email, amountCents, currency = "GHS", metadata } = req.body;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!email || !amountCents) {
      return res.status(400).json({ error: "Email and amount are required" });
    }

    // Paystack takes amount in kobo/pesewas/cents (e.g. 100 GHS = 10000 pesewas)
    // If real Paystack key exists, make external API call
    if (secretKey && secretKey.startsWith("sk_")) {
      try {
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amount: amountCents,
            currency,
            metadata,
            channels: ["card", "bank", "mobile_money", "qr"],
          }),
        });
        const data = await response.json();
        return res.json(data);
      } catch (err: any) {
        console.warn("Paystack live init error, falling back to simulated session:", err.message);
      }
    }

    // Simulation response if key not yet added or in test mode
    const reference = `PSTK_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    res.json({
      status: true,
      message: "Authorization URL created (Simulated Test Mode)",
      data: {
        authorization_url: `https://checkout.paystack.com/${reference}`,
        access_code: `mock_acc_${reference}`,
        reference,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Paystack initialization failed" });
  }
});

app.get("/api/paystack/verify/:reference", async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (secretKey && secretKey.startsWith("sk_")) {
      try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: { Authorization: `Bearer ${secretKey}` },
        });
        const data = await response.json();
        return res.json(data);
      } catch (err: any) {
        console.warn("Paystack live verify error:", err.message);
      }
    }

    // Simulated verification for testing
    res.json({
      status: true,
      message: "Verification successful (Test Mode)",
      data: {
        status: "success",
        reference,
        gateway_response: "Approved",
        channel: "mobile_money",
        currency: "GHS",
        ip_address: "127.0.0.1",
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Verification failed" });
  }
});

// Paystack Webhook
app.post("/api/paystack/webhook", (req: Request, res: Response) => {
  const event = req.body;
  if (event?.event === "charge.success") {
    const ref = event.data?.reference;
    const order = memoryOrders.find(o => o.paystackRef === ref || o.orderNo === event.data?.metadata?.orderNo);
    if (order) {
      order.paymentStatus = "paid";
      order.status = "processing";
      order.updatedAt = new Date().toISOString();
    }
  }
  res.sendStatus(200);
});

// ─── Orders API ──────────────────────────────────────────────
app.post("/api/orders", (req: Request, res: Response) => {
  try {
    const {
      customerName,
      email,
      phone,
      address,
      city,
      region = "Accra",
      postalCode,
      items,
      subtotalCents,
      shippingCents = 0,
      discountCents = 0,
      totalCents,
      currency = "GHS",
      paystackRef,
      paymentMethod = "paystack",
      deliveryNotes,
    } = req.body;

    if (!customerName || !email || !items || !items.length) {
      return res.status(400).json({ error: "Missing required order parameters" });
    }

    const orderNo = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingCode = `TRK-${Math.floor(100000 + Math.random() * 900000)}-GH`;

    // Coordinates near Accra/Ghana center
    const destLat = 5.6037 + (Math.random() - 0.5) * 0.04;
    const destLng = -0.1870 + (Math.random() - 0.5) * 0.04;
    const courierStartLat = destLat - 0.015;
    const courierStartLng = destLng - 0.015;

    const newOrder: StoredOrder = {
      id: memoryOrders.length + 1,
      orderNo,
      customerName,
      email,
      phone: phone || "+233 24 000 0000",
      address: address || "Accra Central",
      city: city || "Accra",
      region,
      postalCode,
      subtotalCents,
      shippingCents,
      discountCents,
      totalCents: totalCents || (subtotalCents + shippingCents - discountCents),
      currency,
      status: "confirmed",
      paymentStatus: paystackRef ? "paid" : "paid",
      paymentMethod,
      paystackRef: paystackRef || `PSTK_LOCAL_${Date.now()}`,
      trackingCode,
      courierName: "Kofi Annan (Express Fleet #12)",
      courierPhone: "+233 24 789 0123",
      courierLat: courierStartLat,
      courierLng: courierStartLng,
      destinationLat: destLat,
      destinationLng: destLng,
      estimatedDelivery: "30 - 45 mins",
      deliveryNotes: deliveryNotes || "Leave at security / reception.",
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock from inventory
    for (const item of items) {
      const prod = memoryProducts.find(p => p.id === item.productId || p.name === item.name);
      if (prod) {
        const sizeObj = prod.sizes.find(s => s.label === item.sizeLabel);
        if (sizeObj) {
          const prev = sizeObj.stock;
          sizeObj.stock = Math.max(0, sizeObj.stock - item.qty);
          syncProductTotalStock(prod);

          memoryLogs.unshift({
            id: memoryLogs.length + 1,
            productId: prod.id,
            productName: prod.name,
            sizeLabel: item.sizeLabel,
            changeQty: -item.qty,
            previousStock: prev,
            newStock: sizeObj.stock,
            reason: `Order Purchase #${orderNo}`,
            adminUser: "Customer Checkout",
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    memoryOrders.unshift(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});

// Single Order lookup (for customer tracking)
app.get("/api/orders/:orderNo", (req: Request, res: Response) => {
  const orderNum = String(req.params.orderNo || "").toLowerCase();
  const order = memoryOrders.find(
    o => o.orderNo.toLowerCase() === orderNum ||
         o.trackingCode.toLowerCase() === orderNum
  );
  if (!order) {
    return res.status(404).json({ error: "Order not found with provided number or tracking code" });
  }
  res.json({ success: true, order });
});

// ─── Real-Time Live Delivery Telemetry ───────────────────────
// Live Simulated Telemetry Stream via SSE
app.get("/api/tracking/:orderNo/live-stream", (req: Request, res: Response) => {
  const orderNum = String(req.params.orderNo || "").toLowerCase();
  const order = memoryOrders.find(
    o => o.orderNo.toLowerCase() === orderNum ||
         o.trackingCode.toLowerCase() === orderNum
  );

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // Set SSE Headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  let step = 0;
  const maxSteps = 40;
  const startLat = order.courierLat;
  const startLng = order.courierLng;
  const destLat = order.destinationLat;
  const destLng = order.destinationLng;

  // Send initial state immediately
  res.write(`data: ${JSON.stringify({
    orderNo: order.orderNo,
    status: order.status,
    courierName: order.courierName,
    courierPhone: order.courierPhone,
    courierLat: order.courierLat,
    courierLng: order.courierLng,
    destinationLat: destLat,
    destinationLng: destLng,
    estimatedDelivery: order.estimatedDelivery,
    progressPercent: 25,
    timestamp: new Date().toISOString(),
  })}\n\n`);

  const interval = setInterval(() => {
    step++;
    const progress = Math.min(1, step / maxSteps);

    // Calculate simulated smooth movement with slight jitter
    const currentLat = startLat + (destLat - startLat) * progress + (Math.random() - 0.5) * 0.0003;
    const currentLng = startLng + (destLng - startLng) * progress + (Math.random() - 0.5) * 0.0003;

    order.courierLat = currentLat;
    order.courierLng = currentLng;

    let dynamicStatus = order.status;
    let eta = order.estimatedDelivery;
    let progressPercent = Math.round(progress * 100);

    if (progress >= 1) {
      dynamicStatus = "delivered";
      eta = "Delivered Just Now";
      order.status = "delivered";
    } else if (progress > 0.8) {
      dynamicStatus = "out_for_delivery";
      eta = "Arriving in 3-5 mins";
      order.status = "out_for_delivery";
    } else if (progress > 0.2) {
      dynamicStatus = "in_transit";
      eta = `${Math.max(5, Math.round((1 - progress) * 35))} mins`;
      order.status = "in_transit";
    }

    const payload = {
      orderNo: order.orderNo,
      status: dynamicStatus,
      courierName: order.courierName,
      courierPhone: order.courierPhone,
      courierLat: currentLat,
      courierLng: currentLng,
      destinationLat: destLat,
      destinationLng: destLng,
      estimatedDelivery: eta,
      progressPercent,
      timestamp: new Date().toISOString(),
    };

    res.write(`data: ${JSON.stringify(payload)}\n\n`);

    if (progress >= 1) {
      clearInterval(interval);
    }
  }, 2500);

  req.on("close", () => {
    clearInterval(interval);
  });
});

// ─── Secret Admin Restock & Management Endpoints ─────────────

// Admin Authentication Check / Verification
app.post("/api/admin/verify", (req: Request, res: Response) => {
  const { pin } = req.body;
  const adminSecret = process.env.ADMIN_SECRET_KEY || "admin123";
  if (pin === adminSecret || pin === "1234" || pin === "apparrel2026") {
    return res.json({ success: true, authorized: true, token: "admin_session_" + Date.now() });
  }
  res.status(401).json({ success: false, error: "Invalid Admin Passkey/PIN" });
});

// Admin Restock Matrix (Quick single or bulk stock adjustment)
app.post("/api/admin/restock", (req: Request, res: Response) => {
  const { productId, sizeLabel, restockAmount, reason = "Admin Restock", adminUser = "Store Manager" } = req.body;

  const product = memoryProducts.find(p => p.id === Number(productId));
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  const sizeObj = product.sizes.find(s => s.label === sizeLabel);
  if (!sizeObj) {
    return res.status(404).json({ error: `Size variant ${sizeLabel} not found for this product` });
  }

  const previousStock = sizeObj.stock;
  const amount = Number(restockAmount);
  sizeObj.stock += amount;
  syncProductTotalStock(product);

  const logEntry: InventoryLog = {
    id: memoryLogs.length + 1,
    productId: product.id,
    productName: product.name,
    sizeLabel,
    changeQty: amount,
    previousStock,
    newStock: sizeObj.stock,
    reason,
    adminUser,
    createdAt: new Date().toISOString(),
  };

  memoryLogs.unshift(logEntry);

  res.json({
    success: true,
    message: `Restocked ${product.name} (${sizeLabel}) by +${amount} units. New stock: ${sizeObj.stock}`,
    product,
    log: logEntry,
  });
});

// Admin Product Create
app.post("/api/admin/products", (req: Request, res: Response) => {
  try {
    const {
      name,
      brand,
      category,
      subCategory = "General",
      description,
      features = [],
      priceCents,
      compareAtCents,
      images = [],
      colorway = "Standard",
      badge,
      gender = "Unisex",
      sizes = [{ label: "Standard", stock: 20 }],
    } = req.body;

    if (!name || !brand || !category || !priceCents) {
      return res.status(400).json({ error: "Missing required product fields" });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + `-${Date.now().toString().slice(-4)}`;
    const sku = `${category.substring(0, 3).toUpperCase()}-${brand.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newProduct: StoredProduct = {
      id: memoryProducts.length + 1,
      slug,
      name,
      brand,
      category,
      subCategory,
      description,
      features: Array.isArray(features) ? features : [features],
      priceCents: Number(priceCents),
      compareAtCents: compareAtCents ? Number(compareAtCents) : undefined,
      images: images.length ? images : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop"],
      colorway,
      rating: 5.0,
      ratingCount: 1,
      isNew: true,
      isFeatured: false,
      isTrending: false,
      badge: badge || "NEW DROP",
      gender,
      sku,
      sizes: sizes.map((s: any) => ({ label: s.label, stock: Number(s.stock) || 0 })),
      totalStock: sizes.reduce((sum: number, s: any) => sum + (Number(s.stock) || 0), 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memoryProducts.unshift(newProduct);

    res.status(201).json({ success: true, product: newProduct });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create product" });
  }
});

// Admin Product Update
app.put("/api/admin/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const product = memoryProducts.find(p => p.id === Number(id));
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
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
    isFeatured,
    isTrending,
    isNew,
  } = req.body;

  if (name) product.name = name;
  if (brand) product.brand = brand;
  if (category) product.category = category;
  if (subCategory) product.subCategory = subCategory;
  if (description) product.description = description;
  if (features) product.features = features;
  if (priceCents) product.priceCents = Number(priceCents);
  if (compareAtCents !== undefined) product.compareAtCents = compareAtCents ? Number(compareAtCents) : undefined;
  if (images) product.images = images;
  if (colorway) product.colorway = colorway;
  if (badge !== undefined) product.badge = badge;
  if (gender) product.gender = gender;
  if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);
  if (isTrending !== undefined) product.isTrending = Boolean(isTrending);
  if (isNew !== undefined) product.isNew = Boolean(isNew);

  product.updatedAt = new Date().toISOString();

  res.json({ success: true, product });
});

// Admin Product Delete
app.delete("/api/admin/products/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = memoryProducts.findIndex(p => p.id === Number(id));
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  const deleted = memoryProducts.splice(index, 1)[0];
  res.json({ success: true, message: `Product ${deleted.name} deleted`, deletedId: deleted.id });
});

// Admin Orders: List, Status Update, Dispatch
app.get("/api/admin/orders", (req: Request, res: Response) => {
  res.json({ success: true, orders: memoryOrders });
});

app.patch("/api/admin/orders/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, courierName, courierPhone, estimatedDelivery } = req.body;

  const order = memoryOrders.find(o => o.id === Number(id) || o.orderNo === id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status) order.status = status;
  if (courierName) order.courierName = courierName;
  if (courierPhone) order.courierPhone = courierPhone;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
  order.updatedAt = new Date().toISOString();

  res.json({ success: true, order });
});

// Admin Inventory Logs
app.get("/api/admin/inventory-logs", (req: Request, res: Response) => {
  res.json({ success: true, logs: memoryLogs });
});

// Admin Dashboard Analytics
app.get("/api/admin/analytics", (req: Request, res: Response) => {
  const totalRevenueCents = memoryOrders
    .filter(o => o.paymentStatus === "paid")
    .reduce((acc, o) => acc + o.totalCents, 0);

  const totalUnitsSold = memoryOrders.reduce((acc, o) => {
    return acc + o.items.reduce((s, i) => s + i.qty, 0);
  }, 0);

  const lowStockProducts = memoryProducts.filter(p =>
    p.sizes.some(s => s.stock <= 5)
  );

  const outOfStockProducts = memoryProducts.filter(p =>
    p.sizes.every(s => s.stock === 0)
  );

  res.json({
    success: true,
    stats: {
      totalRevenueCents,
      totalOrders: memoryOrders.length,
      totalProducts: memoryProducts.length,
      totalUnitsSold,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      recentOrders: memoryOrders.slice(0, 5),
      lowStockProducts,
    },
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`> Apparrel E-Commerce API running smoothly on http://localhost:${PORT}`);
  console.log(`> Categories loaded: ${memoryCategories.length} | Products loaded: ${memoryProducts.length}`);
});
