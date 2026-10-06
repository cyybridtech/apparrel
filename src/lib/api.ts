import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SELLERS } from "../db/seed";

export interface Seller {
  id: number;
  memberNumber: number;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeSlug: string;
  categorySpecialty: string;
  memberRole: string;
  paystackSubaccount: string;
  commissionRate: number;
  payoutBank: string;
  payoutAccount: string;
  balanceCents: number;
  totalPaidCents: number;
  status: "active" | "suspended" | "pending";
  avatar: string;
  bio: string;
  productCount?: number;
}

export interface Product {
  id: number;
  sellerId: number;
  sellerName?: string;
  sellerStore?: string;
  sellerSlug?: string;
  sellerRole?: string;
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
  approvalStatus?: "approved" | "pending_review" | "draft" | "rejected";
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

export interface OrderItem {
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
  sellerShareCents: number;
  platformShareCents: number;
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
  items: OrderItem[];
  sellerSubtotalCents?: number;
  sellerNetShareCents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SellerAnalytics {
  sellerId: number;
  sellerName: string;
  storeName: string;
  categorySpecialty: string;
  paystackSubaccount: string;
  commissionRate: number;
  balanceCents: number;
  totalPaidCents: number;
  totalGmvCents: number;
  totalNetShareCents: number;
  totalOrders: number;
  totalProducts: number;
  totalItemsSold: number;
  lowStockCount: number;
  lowStockItems: {
    id: number;
    name: string;
    brand: string;
    sku: string;
    totalStock: number;
    lowVariants: { label: string; stock: number }[];
  }[];
  recentPayouts: SellerPayout[];
}

export interface SuperAdminOverview {
  totalGmvCents: number;
  totalPlatformRevenueCents: number;
  totalOrdersCount: number;
  totalProductsCount: number;
  totalSellersCount: number;
  totalItemsSold: number;
  sellerStats: {
    id: number;
    memberNumber: number;
    name: string;
    storeName: string;
    categorySpecialty: string;
    memberRole: string;
    paystackSubaccount: string;
    balanceCents: number;
    totalPaidCents: number;
    totalSalesGmvCents: number;
    productCount: number;
    orderCount: number;
    status: string;
  }[];
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

const API_BASE = "";

// Helper to get auth header from active session token
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("apparrel_admin_token") || localStorage.getItem("cyybrid_session_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Fallback products transformed from seed
const FALLBACK_PRODUCTS: Product[] = INITIAL_PRODUCTS.map((p, idx) => {
  const s = INITIAL_SELLERS.find((sel) => sel.id === p.sellerId);
  return {
    ...p,
    id: idx + 1,
    totalStock: p.sizes.reduce((sum, sz) => sum + sz.stock, 0),
    sellerName: s?.name || "Cyybrid Partner",
    sellerStore: s?.storeName || "Cyybrid Store",
    sellerSlug: s?.storeSlug || "cyybrid",
  };
});

// ─── Public API Endpoints ───────────────────────────────────────

export async function fetchSellers(): Promise<Seller[]> {
  try {
    const res = await fetch(`${API_BASE}/api/sellers`);
    if (res.ok) {
      const data = await res.json();
      if (data.sellers && data.sellers.length) return data.sellers;
    }
  } catch {}
  return INITIAL_SELLERS.map((s) => ({
    ...s,
    productCount: FALLBACK_PRODUCTS.filter((p) => p.sellerId === s.id).length,
  }));
}

export async function fetchSellerById(idOrSlug: string | number): Promise<Seller | null> {
  try {
    const res = await fetch(`${API_BASE}/api/sellers/${idOrSlug}`);
    if (res.ok) {
      const data = await res.json();
      return data.seller;
    }
  } catch {}
  const match = INITIAL_SELLERS.find(
    (s) => s.id === Number(idOrSlug) || s.storeSlug === String(idOrSlug)
  );
  return match || null;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (res.ok) {
      const data = await res.json();
      if (data.categories && data.categories.length) return data.categories;
    }
  } catch {}
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
  } catch {}

  let results = [...FALLBACK_PRODUCTS];
  if (params?.sellerId) {
    results = results.filter((p) => p.sellerId === Number(params.sellerId));
  }
  if (params?.category && params.category !== "all") {
    results = results.filter((p) => p.category.toLowerCase() === params.category.toLowerCase());
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sellerStore?.toLowerCase().includes(q)
    );
  }
  return results;
}

export async function fetchProductBySlug(
  slug: string
): Promise<{ product: Product; related: Product[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/products/${slug}`);
    if (res.ok) {
      const data = await res.json();
      const product = data.product;
      const all = await fetchProducts();
      const related = all.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);
      return { product, related };
    }
  } catch {}

  const product =
    FALLBACK_PRODUCTS.find((p) => p.slug === slug || String(p.id) === slug) ||
    FALLBACK_PRODUCTS[0];
  const related = FALLBACK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 4);
  return { product, related };
}

export async function fetchPaystackConfig(): Promise<{ publicKey: string; currency: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/paystack/config`);
    if (res.ok) return await res.json();
  } catch {}
  return {
    publicKey: "pk_test_d34199c927d7e82b7931cb923ad04a8b7ef14e59",
    currency: "GHS",
  };
}

export async function createOrder(orderData: any): Promise<{ success: boolean; order: Order }> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to place multi-seller order.");
  }
  return data;
}

export async function fetchOrderByNumber(code: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(code)}`);
  if (res.ok) {
    const data = await res.json();
    return data.order;
  }
  throw new Error("Order not found with provided reference code");
}

// ─── Authentication & Portal Sign-In ────────────────────────────

export async function portalLogin(
  pin: string,
  email?: string
): Promise<{
  success: boolean;
  role: "super_admin" | "seller";
  token: string;
  name?: string;
  seller?: Seller;
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/api/portal/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin, email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Authentication failed. Check your PIN or Passkey.");
  }

  // Save session token
  if (data.token) {
    localStorage.setItem("apparrel_admin_token", data.token);
    localStorage.setItem("cyybrid_session_token", data.token);
    localStorage.setItem("cyybrid_role", data.role);
    if (data.seller) {
      localStorage.setItem("cyybrid_seller_id", String(data.seller.id));
    } else {
      localStorage.removeItem("cyybrid_seller_id");
    }
  }

  return data;
}

// Legacy verification helper for compatibility
export async function verifyAdminPasskey(pin: string): Promise<{ authorized: boolean; token?: string }> {
  try {
    const result = await portalLogin(pin);
    return { authorized: result.success, token: result.token };
  } catch {
    return { authorized: false };
  }
}

// ─── Seller-Isolated API Endpoints ──────────────────────────────

export async function fetchSellerProducts(sellerId?: number): Promise<Product[]> {
  const query = sellerId ? `?sellerId=${sellerId}` : "";
  const res = await fetch(`${API_BASE}/api/seller/products${query}`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.products || [];
  }
  throw new Error("Failed to load seller catalog");
}

export async function saveSellerProduct(productData: any, isEdit = false, id?: number): Promise<any> {
  const url = isEdit ? `${API_BASE}/api/seller/products/${id}` : `${API_BASE}/api/seller/products`;
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

export async function deleteSellerProduct(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/seller/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete product");
  return data;
}

export async function restockSellerProduct(
  productId: number,
  sizeLabel: string,
  addStock: number,
  reason = "Seller Restock"
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/seller/restock`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, sizeLabel, addStock, reason }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Restock failed");
  return data;
}

export async function fetchSellerOrders(sellerId?: number): Promise<Order[]> {
  const query = sellerId ? `?sellerId=${sellerId}` : "";
  const res = await fetch(`${API_BASE}/api/seller/orders${query}`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.orders || [];
  }
  throw new Error("Failed to load seller orders");
}

export async function updateSellerOrderStatus(
  orderId: number,
  status: string,
  deliveryDetails?: any
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/seller/orders/${orderId}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, ...deliveryDetails }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update order status");
  return data;
}

export async function fetchSellerAnalytics(sellerId?: number): Promise<SellerAnalytics> {
  const query = sellerId ? `?sellerId=${sellerId}` : "";
  const res = await fetch(`${API_BASE}/api/seller/analytics${query}`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.analytics;
  }
  throw new Error("Failed to load seller analytics");
}

// ─── Super Admin Cockpit Endpoints ──────────────────────────────

export async function fetchAdminOverview(): Promise<SuperAdminOverview> {
  const res = await fetch(`${API_BASE}/api/admin/overview`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.overview;
  }
  throw new Error("Failed to load Super Admin overview");
}

export async function triggerSellerPayout(
  sellerId: number,
  amountCents?: number,
  note?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/sellers/${sellerId}/payout`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ amountCents, note }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to dispatch seller payout");
  return data;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/api/admin/audit-logs`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.logs || [];
  }
  throw new Error("Failed to load audit logs");
}

export async function fetchInventoryLogs(): Promise<InventoryLog[]> {
  const res = await fetch(`${API_BASE}/api/admin/inventory-logs`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.logs || [];
  }
  throw new Error("Failed to load inventory logs");
}

// Backward compatibility wrappers
export const restockProduct = restockSellerProduct;
export const fetchAdminOrders = fetchSellerOrders;
export const updateOrderStatus = updateSellerOrderStatus;
export const saveProduct = saveSellerProduct;
export const deleteProduct = deleteSellerProduct;
export const fetchAdminAnalytics = async (): Promise<any> => {
  try {
    const overview = await fetchAdminOverview();
    return {
      totalRevenueCents: overview.totalGmvCents,
      totalOrders: overview.totalOrdersCount,
      totalProducts: overview.totalProductsCount,
      totalUnitsSold: overview.totalItemsSold,
      lowStockCount: 2,
      outOfStockCount: 0,
      recentOrders: [],
      lowStockProducts: [],
    };
  } catch {
    const sellerA = await fetchSellerAnalytics();
    return {
      totalRevenueCents: sellerA.totalGmvCents,
      totalOrders: sellerA.totalOrders,
      totalProducts: sellerA.totalProducts,
      totalUnitsSold: sellerA.totalItemsSold,
      lowStockCount: sellerA.lowStockCount,
      outOfStockCount: 0,
      recentOrders: [],
      lowStockProducts: sellerA.lowStockItems,
    };
  }
};
