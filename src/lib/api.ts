import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "../db/seed";

export interface Product {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  description: string;
  features: string[];
  priceCents: number;
  compareAtCents?: number;
  images: string[];
  colorway: string;
  rating: number;
  ratingCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  badge?: string;
  gender?: string;
  sku: string;
  sizes: { label: string; stock: number }[];
  totalStock: number;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
  featured?: boolean;
  bannerImage?: string;
}

export interface Order {
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

export interface AdminAnalytics {
  totalRevenueCents: number;
  totalOrders: number;
  totalProducts: number;
  totalUnitsSold: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

export interface InventoryLog {
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

const API_BASE = "";

// Helper to get auth header
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("apparrel_admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Fallback products transformed from seed
const FALLBACK_PRODUCTS: Product[] = INITIAL_PRODUCTS.map((p, idx) => ({
  ...p,
  id: idx + 1,
  totalStock: p.sizes.reduce((sum, s) => sum + s.stock, 0),
}));

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (res.ok) {
      const data = await res.json();
      if (data.categories && data.categories.length) return data.categories;
    }
  } catch {
    // Graceful fallback
  }
  return INITIAL_CATEGORIES;
}

export async function fetchProducts(params?: Record<string, string>): Promise<Product[]> {
  try {
    const query = params ? new URLSearchParams(params).toString() : "";
    const res = await fetch(`${API_BASE}/api/products${query ? `?${query}` : ""}`);
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length) return data.products;
    }
  } catch {
    // Graceful fallback
  }

  let results = [...FALLBACK_PRODUCTS];
  if (params?.category && params.category !== "all") {
    results = results.filter((p) => p.category.toLowerCase() === params.category.toLowerCase());
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  return results;
}

export async function fetchProductBySlug(slug: string): Promise<{ product: Product; related: Product[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${slug}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Graceful fallback
  }

  const product = FALLBACK_PRODUCTS.find((p) => p.slug === slug || String(p.id) === slug) || FALLBACK_PRODUCTS[0];
  const related = FALLBACK_PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
  return { product, related };
}

export async function fetchPaystackConfig(): Promise<{ publicKey: string; currency: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/paystack/config`);
    if (res.ok) return await res.json();
  } catch {}
  return { publicKey: "pk_test_placeholder", currency: "GHS" };
}

export async function createOrder(orderData: any): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to place order.");
  }
  return data;
}

export async function fetchOrderByNumber(orderNo: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderNo}`);
  if (res.ok) {
    const data = await res.json();
    return data.order;
  }
  throw new Error("Order not found with provided reference code");
}

// ─── Admin API Calls (Secure Session Token) ─────────────────────

export async function verifyAdminPasskey(pin: string): Promise<{ authorized: boolean; token?: string }> {
  const cleanPin = (pin || "").trim();

  try {
    const res = await fetch(`${API_BASE}/api/admin/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: cleanPin }),
    });
    if (res.ok) {
      const data = await res.json();
      return { authorized: Boolean(data.authorized), token: data.token };
    }
  } catch (err) {
    console.error("Verification endpoint unreachable", err);
  }

  return { authorized: false };
}

export async function restockProduct(productId: number, sizeLabel: string, restockAmount: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/restock`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, sizeLabel, restockAmount }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Restock operation failed");
  return data;
}

export async function fetchAdminAnalytics(): Promise<AdminAnalytics> {
  const res = await fetch(`${API_BASE}/api/admin/analytics`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.stats;
  }
  throw new Error("Failed to load admin analytics");
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/admin/orders`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.orders || [];
  }
  throw new Error("Failed to load admin orders");
}

export async function updateOrderStatus(orderId: number, status: string, deliveryDetails?: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, ...deliveryDetails }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update order status");
  return data;
}

export async function saveProduct(productData: any, isEdit = false, id?: number): Promise<any> {
  const url = isEdit ? `${API_BASE}/api/admin/products/${id}` : `${API_BASE}/api/admin/products`;
  const method = isEdit ? "PUT" : "POST";
  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save product");
  return data;
}

export async function fetchInventoryLogs(): Promise<InventoryLog[]> {
  const res = await fetch(`${API_BASE}/api/admin/inventory-logs`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.logs || [];
  }
  throw new Error("Failed to fetch inventory audit logs");
}

export async function deleteProduct(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete product");
  return data;
}
