import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SELLERS } from "../db/seed";

export interface User {
  id: number;
  username?: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "seller" | "customer";
  sellerId?: number;
  sellerStore?: string;
  mustSetPassword?: boolean;
  address?: string;
  city?: string;
  region?: string;
}

export interface Seller {
  id: number;
  memberNumber: number;
  username?: string;
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
  mustSetPassword?: boolean;
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
  courierVehicle?: string;
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
  actorRole: "admin" | "seller" | "customer" | "system";
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

const API_BASE = "";

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("cyybrid_session_token");
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
    sellerName: s?.name,
    sellerStore: s?.storeName,
    sellerSlug: s?.storeSlug,
  };
});

// ─── Unified Authentication ────────────────────────────────────

export async function authLogin(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; token: string; user: User; seller?: Seller; mustSetPassword?: boolean }> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailOrUsername, username: emailOrUsername, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Unable to sign in. Please check your credentials.");
  if (!data.token || !data.user) throw new Error("The server returned an invalid session response.");

  localStorage.setItem("cyybrid_session_token", data.token);
  localStorage.setItem("cyybrid_user", JSON.stringify(data.user));
  localStorage.setItem("cyybrid_role", data.user.role);
  if (data.user.sellerId) localStorage.setItem("cyybrid_seller_id", String(data.user.sellerId));
  else localStorage.removeItem("cyybrid_seller_id");
  return data;
}

export async function completeSecuritySetup(payload: {
  email: string;
  password: string;
  phone?: string;
}): Promise<{ success: boolean; user: User; token?: string }> {
  const res = await fetch(`${API_BASE}/api/auth/complete-security-setup`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update security credentials.");
  if (!data.user) throw new Error("The server did not return the updated account.");
  if (data.token) localStorage.setItem("cyybrid_session_token", data.token);
  localStorage.setItem("cyybrid_user", JSON.stringify(data.user));
  return data;
}

export async function authRegister(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  city?: string;
  region?: string;
}): Promise<{ success: boolean; token: string; user: User }> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Registration failed. Please check your details.");
  if (!data.token || !data.user) throw new Error("The server returned an invalid registration response.");
  localStorage.setItem("cyybrid_session_token", data.token);
  localStorage.setItem("cyybrid_user", JSON.stringify(data.user));
  localStorage.setItem("cyybrid_role", data.user.role);
  return data;
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("cyybrid_session_token");
      localStorage.removeItem("cyybrid_user");
      localStorage.removeItem("cyybrid_role");
      localStorage.removeItem("cyybrid_seller_id");
    }
  } catch {}
  return null;
}

// ─── Public Catalog Endpoints ───────────────────────────────────

export async function fetchSellers(): Promise<Seller[]> {
  try {
    const res = await fetch(`${API_BASE}/api/sellers`);
    if (res.ok) {
      const data = await res.json();
      if (data.sellers && Array.isArray(data.sellers)) return data.sellers;
    }
  } catch {}

  const persisted = getPersistedTeam();
  if (persisted.length > 0) {
    return persisted.map((s) => ({
      ...s,
      productCount: FALLBACK_PRODUCTS.filter((p) => p.sellerId === s.id).length,
    }));
  }

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
  const allSellers = getPersistedTeam().length > 0 ? getPersistedTeam() : INITIAL_SELLERS;
  const match = allSellers.find(
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
        p.description.toLowerCase().includes(q)
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
    publicKey: "",
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
    throw new Error(data.error || "Failed to place order.");
  }
  return data;
}

export async function fetchOrders(email?: string): Promise<Order[]> {
  try {
    const query = email ? `?email=${encodeURIComponent(email)}` : "";
    const res = await fetch(`${API_BASE}/api/orders${query}`);
    if (res.ok) {
      const data = await res.json();
      return data.orders || [];
    }
  } catch {}
  return [];
}

export async function fetchOrderByNumber(code: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(code)}`);
  if (res.ok) {
    const data = await res.json();
    return data.order;
  }
  throw new Error("Order not found with provided tracking code.");
}

export async function verifyAdminPasskey(passkey: string): Promise<{ authorized: boolean; token?: string; seller?: any }> {
  try {
    const res = await authLogin("admin", passkey);
    if (res.user?.role === "admin") {
      return { authorized: true, token: res.token, seller: res.user };
    }
  } catch {}
  return { authorized: false };
}

export async function updateOrderDelivery(orderId: number, deliveryDetails: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/delivery`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(deliveryDetails),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update order delivery.");
  return data;
}

// ─── Seller & Admin Dashboard Endpoints ─────────────────────────

export async function fetchSellerProducts(sellerId?: number): Promise<Product[]> {
  const query = sellerId ? `?sellerId=${sellerId}` : "";
  const res = await fetch(`${API_BASE}/api/seller/products${query}`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.products || [];
  }
  throw new Error("Failed to load catalog");
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
  reason = "Restock"
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
  throw new Error("Failed to load orders");
}

export async function updateSellerOrderStatus(
  orderId: number,
  status: string,
  deliveryDetails?: any
): Promise<any> {
  return updateOrderDelivery(orderId, { status, ...deliveryDetails });
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
  throw new Error("Failed to load analytics");
}

export async function fetchAdminOverview(): Promise<SuperAdminOverview> {
  const res = await fetch(`${API_BASE}/api/admin/overview`, {
    headers: getAuthHeaders(),
  });
  if (res.ok) {
    const data = await res.json();
    return data.overview;
  }
  throw new Error("Failed to load admin overview");
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
  if (!res.ok) throw new Error(data.error || "Failed to dispatch payout");
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

// ─── Super Admin Team & Sellers Management ─────────────────────

const PERSISTED_TEAM_KEY = "cyybrid_persisted_team_v2";

export function getPersistedTeam(): TeamMember[] {
  try {
    const saved = localStorage.getItem(PERSISTED_TEAM_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

export function setPersistedTeam(team: TeamMember[]) {
  try {
    localStorage.setItem(PERSISTED_TEAM_KEY, JSON.stringify(team));
  } catch {}
}

export interface TeamMember extends Seller {
  userId?: number;
  userRole?: string;
  hasActiveLogin?: boolean;
}

export async function fetchAdminTeam(): Promise<TeamMember[]> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/team`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.team)) {
        setPersistedTeam(data.team);
        return data.team;
      }
    }
  } catch {}

  // Return persisted team or empty array
  return getPersistedTeam();
}

export async function addAdminTeamMember(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/team`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to add team member.");
  if (data.seller) {
    const current = getPersistedTeam();
    const updated = [...current.filter((member) => member.id !== data.seller.id), { ...data.seller, userRole: "seller", hasActiveLogin: true }];
    setPersistedTeam(updated);
  }
  return data;
}

export async function updateAdminTeamMember(id: number, payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/team/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to update team member.");
  const current = getPersistedTeam();
  const updated = current.map((m) => (m.id === id ? { ...m, ...payload } : m));
  setPersistedTeam(updated);
  return data;
}

export async function deleteAdminTeamMember(id: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/admin/team/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to delete team member.");
  const current = getPersistedTeam();
  setPersistedTeam(current.filter((m) => m.id !== id));
  return data;
}
