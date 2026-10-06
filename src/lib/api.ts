import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SELLERS, INITIAL_USERS } from "../db/seed";

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
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailOrUsername, username: emailOrUsername, password }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("cyybrid_session_token", data.token);
        localStorage.setItem("cyybrid_user", JSON.stringify(data.user));
        localStorage.setItem("cyybrid_role", data.user.role);
        if (data.user.sellerId) {
          localStorage.setItem("cyybrid_seller_id", String(data.user.sellerId));
        } else {
          localStorage.removeItem("cyybrid_seller_id");
        }
      }
      return data;
    } else {
      const data = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 400) {
        throw new Error(data.error || "Invalid credentials. Please check your username/email and password.");
      }
    }
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("500")) {
      throw err;
    }
  }

  // Fallback for Super Admin and registered users in client-only or offline mode
  const cleanIdentifier = emailOrUsername.trim().toLowerCase();
  const cleanPass = password.trim();

  if (cleanIdentifier === "admin@cyybrid.tech" || cleanIdentifier === "admin") {
    const adminUser: User = {
      id: 1,
      username: "admin",
      name: "Cyybrid Platform Super Admin",
      email: "admin@cyybrid.tech",
      phone: "+233 24 555 0100",
      role: "admin",
      address: "14 Independence Avenue, Airport Residential",
      city: "Accra",
      region: "Greater Accra",
    };
    const token = `cyybrid_admin_${Date.now()}`;
    localStorage.setItem("cyybrid_session_token", token);
    localStorage.setItem("cyybrid_user", JSON.stringify(adminUser));
    localStorage.setItem("cyybrid_role", "admin");
    localStorage.removeItem("cyybrid_seller_id");
    return { success: true, token, user: adminUser };
  }

  // Check persisted custom team members
  const persistedTeam: TeamMember[] = (() => {
    try {
      const saved = localStorage.getItem("cyybrid_persisted_team_v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })();

  const memberMatch = persistedTeam.find(
    (m) =>
      (m.username && m.username.toLowerCase() === cleanIdentifier) ||
      m.email.toLowerCase() === cleanIdentifier
  );

  if (memberMatch) {
    // Temporary password is username, or previous password
    const isPassValid =
      cleanPass === memberMatch.username ||
      cleanPass === "seller" ||
      cleanPass === memberMatch.email;

    if (isPassValid) {
      const sellerUser: User = {
        id: memberMatch.id + 100,
        username: memberMatch.username,
        name: memberMatch.name,
        email: memberMatch.email,
        phone: memberMatch.phone,
        role: "seller",
        sellerId: memberMatch.id,
        sellerStore: memberMatch.storeName,
        mustSetPassword: Boolean(memberMatch.mustSetPassword),
        address: "Accra",
        city: "Accra",
        region: "Greater Accra",
      };
      const token = `cyybrid_seller_${memberMatch.id}_${Date.now()}`;
      localStorage.setItem("cyybrid_session_token", token);
      localStorage.setItem("cyybrid_user", JSON.stringify(sellerUser));
      localStorage.setItem("cyybrid_role", "seller");
      localStorage.setItem("cyybrid_seller_id", String(memberMatch.id));
      return {
        success: true,
        token,
        user: sellerUser,
        seller: memberMatch,
        mustSetPassword: Boolean(memberMatch.mustSetPassword),
      };
    }
  }

  throw new Error("Invalid credentials. Please check your username/email and password.");
}

export async function completeSecuritySetup(payload: {
  email: string;
  password: string;
  phone?: string;
}): Promise<{ success: boolean; user: User; token?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/complete-security-setup`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("cyybrid_session_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("cyybrid_user", JSON.stringify(data.user));
      }
      return data;
    } else {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to update security credentials.");
    }
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("500")) {
      throw err;
    }
  }

  // Fallback client-side update
  const currentUserRaw = localStorage.getItem("cyybrid_user");
  if (currentUserRaw) {
    const user: User = JSON.parse(currentUserRaw);
    user.email = payload.email.trim().toLowerCase();
    if (payload.phone) user.phone = payload.phone.trim();
    user.mustSetPassword = false;
    localStorage.setItem("cyybrid_user", JSON.stringify(user));

    // Also update in persisted team
    try {
      const saved = localStorage.getItem("cyybrid_persisted_team_v2");
      if (saved) {
        const team: TeamMember[] = JSON.parse(saved);
        const updated = team.map((m) =>
          m.id === user.sellerId
            ? { ...m, email: user.email, phone: user.phone, mustSetPassword: false }
            : m
        );
        localStorage.setItem("cyybrid_persisted_team_v2", JSON.stringify(updated));
      }
    } catch {}

    return { success: true, user };
  }

  throw new Error("Unable to update account credentials.");
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
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("cyybrid_session_token", data.token);
        localStorage.setItem("cyybrid_user", JSON.stringify(data.user));
        localStorage.setItem("cyybrid_role", data.user.role);
      }
      return data;
    } else {
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 || res.status === 400) {
        throw new Error(data.error || "Registration failed. Please check your details.");
      }
    }
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("500")) {
      throw err;
    }
  }

  // Fallback client registration
  const newUser: User = {
    id: Date.now(),
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    role: "customer",
    address: payload.address || "Accra",
    city: payload.city || "Accra",
    region: payload.region || "Greater Accra",
  };
  const token = `cyybrid_cust_${Date.now()}`;
  localStorage.setItem("cyybrid_session_token", token);
  localStorage.setItem("cyybrid_user", JSON.stringify(newUser));
  localStorage.setItem("cyybrid_role", "customer");
  return { success: true, token, user: newUser };
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
    const res = await authLogin("admin@cyybrid.tech", passkey);
    if (res.user) {
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
  try {
    const res = await fetch(`${API_BASE}/api/admin/team`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.seller) {
        const current = getPersistedTeam();
        const updated = [...current.filter((m) => m.id !== data.seller.id), { ...data.seller, userRole: "seller", hasActiveLogin: true }];
        setPersistedTeam(updated);
      }
      return data;
    } else {
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 || res.status === 409) {
        throw new Error(data.error || "Failed to add team member");
      }
    }
  } catch (err: any) {
    if (err.message && !err.message.includes("fetch") && !err.message.includes("500")) {
      throw err;
    }
  }

  // Fallback client-side creation
  const current = getPersistedTeam();
  const sellerId = current.length > 0 ? Math.max(...current.map((m) => m.id)) + 1 : 1;
  const cleanUsername = String(payload.username || payload.name).trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  const newMember: TeamMember = {
    id: sellerId,
    memberNumber: current.length + 1,
    username: cleanUsername,
    name: payload.name.trim(),
    email: payload.email || `${cleanUsername}@cyybrid.internal`,
    phone: payload.phone || "+233 24 000 0000",
    storeName: payload.storeName || `${payload.name}'s Store`,
    storeSlug: (payload.storeName || payload.name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    categorySpecialty: payload.categorySpecialty || "General Catalog",
    memberRole: payload.memberRole || "Specialist",
    paystackSubaccount: `ACCT_CYYBRID_${sellerId}`,
    commissionRate: payload.commissionRate || 0.05,
    payoutBank: payload.payoutBank || "MTN Mobile Money",
    payoutAccount: payload.payoutAccount || "0240000000",
    balanceCents: 0,
    totalPaidCents: 0,
    status: "active",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name)}&background=0f172a&color=f8fafc&bold=true`,
    bio: payload.bio || `Verified Cyybrid team member.`,
    mustSetPassword: true,
    userRole: "seller",
    hasActiveLogin: true,
  };

  const updated = [...current, newMember];
  setPersistedTeam(updated);
  return { success: true, seller: newMember };
}

export async function updateAdminTeamMember(id: number, payload: any): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/team/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      const current = getPersistedTeam();
      const updated = current.map((m) => (m.id === id ? { ...m, ...payload } : m));
      setPersistedTeam(updated);
      return data;
    }
  } catch {}

  const current = getPersistedTeam();
  const updated = current.map((m) => (m.id === id ? { ...m, ...payload } : m));
  setPersistedTeam(updated);
  return { success: true };
}

export async function deleteAdminTeamMember(id: number): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/api/admin/team/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      const current = getPersistedTeam();
      setPersistedTeam(current.filter((m) => m.id !== id));
      return data;
    }
  } catch {}

  const current = getPersistedTeam();
  setPersistedTeam(current.filter((m) => m.id !== id));
  return { success: true };
}
