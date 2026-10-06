import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Plus,
  RefreshCw,
  Package,
  Truck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ArrowRight,
  LogOut,
  KeyRound,
  Eye,
  Check,
  Zap,
  Clock,
  DollarSign,
  ChevronRight,
  Layers,
  History,
  Boxes,
  Sparkles,
  Phone,
  MapPin,
  FileText,
  Copy,
  Image as ImageIcon,
  Minus,
  X,
  Store,
  Users,
  CreditCard,
  Building2,
  Send,
  UserCheck,
  Mail,
  Navigation,
} from "lucide-react";
import {
  fetchSellerProducts,
  saveSellerProduct,
  deleteSellerProduct,
  restockSellerProduct,
  fetchSellerOrders,
  updateSellerOrderStatus,
  fetchSellerAnalytics,
  fetchAdminOverview,
  triggerSellerPayout,
  fetchAuditLogs,
  fetchInventoryLogs,
  authLogin,
  Product,
  Order,
  SellerAnalytics,
  SuperAdminOverview,
  SellerPayout,
  AuditLog,
  InventoryLog,
  Seller,
  User,
} from "../lib/api";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatDateTime } from "../lib/utils";

const SELLER_PROFILES_PRESET = [
  {
    id: 1,
    name: "Kwame Mensah",
    email: "kwame.mensah@cyybrid.tech",
    storeName: "Kicks & Soles Hub",
    category: "Footwear & Sneakers",
    role: "Footwear Lead",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
  },
  {
    id: 2,
    name: "Ama Serwaa",
    email: "ama.serwaa@cyybrid.tech",
    storeName: "Chrono & Heritage",
    category: "Watches & Horology",
    role: "Horology Specialist",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300",
  },
  {
    id: 3,
    name: "Kofi Boateng",
    email: "kofi.boateng@cyybrid.tech",
    storeName: "Cyybrid Atelier Wear",
    category: "Streetwear & Apparel",
    role: "Fashion Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
  },
  {
    id: 4,
    name: "Esi Darko",
    email: "esi.darko@cyybrid.tech",
    storeName: "Volt Audio & Gadgets",
    category: "Electronics & Smart Tech",
    role: "Tech Lead",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300",
  },
  {
    id: 5,
    name: "Yaw Osei",
    email: "yaw.osei@cyybrid.tech",
    storeName: "Artisan Leather & Scents",
    category: "Leather Bags & Perfumes",
    role: "Leather Craftsman",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300",
  },
];

const ORDER_STAGES: { key: Order["status"]; label: string }[] = [
  { key: "confirmed", label: "1. Confirmed / Paid" },
  { key: "processing", label: "2. Packaging & QC" },
  { key: "dispatched", label: "3. Dispatched" },
  { key: "in_transit", label: "4. In Transit" },
  { key: "out_for_delivery", label: "5. Out for Delivery" },
  { key: "delivered", label: "6. Delivered" },
];

export function AdminPortalPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("cyybrid_user");
      return saved ? JSON.parse(saved) : null;
    } catch {}
    return null;
  });

  const [sessionRole, setSessionRole] = useState<"admin" | "seller">(() => {
    return (localStorage.getItem("cyybrid_role") as any) || "admin";
  });

  // Login form state
  const [loginEmail, setLoginEmail] = useState("admin@cyybrid.tech");
  const [loginPass, setLoginPass] = useState("admin");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "overview" | "restock" | "products" | "orders" | "payouts" | "audit"
  >("overview");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerAnalytics, setSellerAnalytics] = useState<SellerAnalytics | null>(null);
  const [adminOverview, setAdminOverview] = useState<SuperAdminOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Delivery Edit Modal
  const [editingDeliveryOrder, setEditingDeliveryOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState("");
  const [courierPhone, setCourierPhone] = useState("");
  const [courierVehicle, setCourierVehicle] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<Order["status"]>("processing");
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Add / Edit Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Payout Modal
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedSellerForPayout, setSelectedSellerForPayout] = useState<any>(null);
  const [payoutAmountGhs, setPayoutAmountGhs] = useState<string>("");
  const [payoutNote, setPayoutNote] = useState<string>("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Product Form State
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("CYYBRID");
  const [formCategory, setFormCategory] = useState("sneakers");
  const [formSubCategory, setFormSubCategory] = useState("General");
  const [formDescription, setFormDescription] = useState("");
  const [formPriceCents, setFormPriceCents] = useState(120000);
  const [formCompareAtCents, setFormCompareAtCents] = useState<number | undefined>(150000);
  const [formColorway, setFormColorway] = useState("Standard");
  const [formBadge, setFormBadge] = useState("NEW DROP");
  const [formGender, setFormGender] = useState("Unisex");
  const [formSku, setFormSku] = useState("");
  const [formImages, setFormImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000",
  ]);
  const [formSizes, setFormSizes] = useState<{ label: string; stock: number }[]>([
    { label: "Standard", stock: 15 },
  ]);

  const { success, error, info } = useToast();

  const isAuthenticated = Boolean(currentUser && (currentUser.role === "admin" || currentUser.role === "seller"));

  const loadPortalData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (currentUser.role === "admin") {
        const [overview, prods, ords, audLogs, invLogs] = await Promise.all([
          fetchAdminOverview(),
          fetchSellerProducts(),
          fetchSellerOrders(),
          fetchAuditLogs(),
          fetchInventoryLogs(),
        ]);
        setAdminOverview(overview);
        setProducts(prods);
        setOrders(ords);
        setAuditLogs(audLogs);
        setInventoryLogs(invLogs);
      } else {
        const [analytics, prods, ords, invLogs] = await Promise.all([
          fetchSellerAnalytics(currentUser.sellerId),
          fetchSellerProducts(currentUser.sellerId),
          fetchSellerOrders(currentUser.sellerId),
          fetchInventoryLogs(),
        ]);
        setSellerAnalytics(analytics);
        setProducts(prods);
        setOrders(ords);
        setInventoryLogs(invLogs);
      }
    } catch (err: any) {
      console.error("Failed to load portal data", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPortalData();
    }
  }, [currentUser]);

  const handleLoginSubmit = async (emailToUse?: string, passToUse?: string) => {
    const email = emailToUse || loginEmail;
    const pass = passToUse || loginPass;

    if (!email || !pass) {
      setLoginError("Please enter email and password.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await authLogin(email, pass);
      if (res.success && res.user) {
        if (res.user.role !== "admin" && res.user.role !== "seller") {
          setLoginError("Your account does not have management permissions.");
          return;
        }
        setCurrentUser(res.user);
        setSessionRole(res.user.role as any);
        success("Access Granted", `Welcome back, ${res.user.name}.`);
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cyybrid_session_token");
    localStorage.removeItem("cyybrid_role");
    localStorage.removeItem("cyybrid_seller_id");
    localStorage.removeItem("cyybrid_user");
    setCurrentUser(null);
    info("Signed Out", "Portal session terminated safely.");
  };

  const handleQuickRestock = async (productId: number, sizeLabel: string, amount: number) => {
    try {
      const res = await restockSellerProduct(productId, sizeLabel, amount, "Fast Stock Adjustment");
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? res.product : p))
        );
        success("Restock Applied", `${res.product.name} (${sizeLabel}) +${amount} units.`);
      }
    } catch (err: any) {
      error("Restock Failed", err.message);
    }
  };

  const openDeliveryModal = (order: Order) => {
    setEditingDeliveryOrder(order);
    setCourierName(order.courierName || "Cyybrid Express Dispatch");
    setCourierPhone(order.courierPhone || "+233 24 555 8901");
    setCourierVehicle(order.courierVehicle || "Motorbike #GH-412");
    setTrackingCode(order.trackingCode);
    setDeliveryStatus(order.status);
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeliveryOrder) return;

    setDeliveryLoading(true);
    try {
      const res = await updateSellerOrderStatus(editingDeliveryOrder.id, deliveryStatus, {
        courierName,
        courierPhone,
        courierVehicle,
        trackingCode,
      });
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === editingDeliveryOrder.id ? res.order : o))
        );
        success("Delivery Updated", `Order #${editingDeliveryOrder.orderNo} dispatched with courier ${courierName}.`);
        setEditingDeliveryOrder(null);
      }
    } catch (err: any) {
      error("Update Failed", err.message);
    } finally {
      setDeliveryLoading(false);
    }
  };

  const openAddModal = (prodToEdit?: Product) => {
    if (prodToEdit) {
      setEditingProduct(prodToEdit);
      setFormName(prodToEdit.name);
      setFormBrand(prodToEdit.brand);
      setFormCategory(prodToEdit.category);
      setFormSubCategory(prodToEdit.subCategory);
      setFormDescription(prodToEdit.description);
      setFormPriceCents(prodToEdit.priceCents);
      setFormCompareAtCents(prodToEdit.compareAtCents);
      setFormColorway(prodToEdit.colorway);
      setFormBadge(prodToEdit.badge || "");
      setFormGender(prodToEdit.gender || "Unisex");
      setFormSku(prodToEdit.sku);
      setFormImages(prodToEdit.images);
      setFormSizes(prodToEdit.sizes);
    } else {
      setEditingProduct(null);
      setFormName("");
      setFormBrand("CYYBRID");
      setFormCategory("sneakers");
      setFormSubCategory("General");
      setFormDescription("");
      setFormPriceCents(85000);
      setFormCompareAtCents(110000);
      setFormColorway("Standard");
      setFormBadge("NEW DROP");
      setFormGender("Unisex");
      setFormSku(`SKU-${Date.now().toString(36).toUpperCase()}`);
      setFormImages(["https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000"]);
      setFormSizes([
        { label: "M", stock: 15 },
        { label: "L", stock: 20 },
      ]);
    }
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPriceCents <= 0 || formSizes.length === 0) {
      error("Missing Information", "Please fill name, price, and at least one size variant.");
      return;
    }

    try {
      const payload = {
        name: formName.trim(),
        brand: formBrand.trim(),
        category: formCategory,
        subCategory: formSubCategory,
        description: formDescription,
        priceCents: formPriceCents,
        compareAtCents: formCompareAtCents || undefined,
        images: formImages.filter((img) => img.trim().length > 0),
        colorway: formColorway,
        badge: formBadge,
        gender: formGender,
        sku: formSku,
        sizes: formSizes,
      };

      const res = await saveSellerProduct(payload, Boolean(editingProduct), editingProduct?.id);
      if (res.success) {
        success("Product Saved", `"${formName}" saved to marketplace catalog.`);
        setIsAddModalOpen(false);
        loadPortalData();
      }
    } catch (err: any) {
      error("Save Failed", err.message);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to remove this product from the marketplace?")) return;
    try {
      const res = await deleteSellerProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        success("Product Removed", "The item was deleted.");
      }
    } catch (err: any) {
      error("Delete Failed", err.message);
    }
  };

  const handleDispatchPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSellerForPayout) return;

    const amountGhs = parseFloat(payoutAmountGhs);
    if (isNaN(amountGhs) || amountGhs <= 0) {
      error("Invalid Amount", "Please enter a valid payout amount.");
      return;
    }

    setPayoutLoading(true);
    try {
      const amountCents = Math.round(amountGhs * 100);
      const res = await triggerSellerPayout(selectedSellerForPayout.id, amountCents, payoutNote);
      if (res.success) {
        success("Payout Dispatched", res.message);
        setIsPayoutModalOpen(false);
        loadPortalData();
      }
    } catch (err: any) {
      error("Payout Error", err.message);
    } finally {
      setPayoutLoading(false);
    }
  };

  // ─── LOGIN SCREEN ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-900/5 relative overflow-hidden">
          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center mx-auto shadow-md">
              <Store className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
              CYYBRID PORTAL
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Administrator & Seller Management Portal. Enter your email and password to sign in.
            </p>
          </div>

          {/* Preset Quick Login Buttons */}
          <div className="space-y-3 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quick Test Credentials
            </div>

            <button
              onClick={() => handleLoginSubmit("admin@cyybrid.tech", "admin")}
              className="w-full p-3.5 rounded-2xl bg-slate-950 text-white hover:bg-black transition-all flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-emerald-400">
                  ADM
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs">Super Admin Master Account</div>
                  <div className="text-[11px] text-slate-400">admin@cyybrid.tech</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SELLER_PROFILES_PRESET.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLoginSubmit(s.email, "seller")}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-left flex items-center gap-2.5"
                >
                  <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-xl object-cover border border-slate-200" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-950 truncate">{s.name}</div>
                    <div className="text-[10px] text-slate-500 truncate">{s.storeName}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Email & Password Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLoginSubmit();
            }}
            className="space-y-4 pt-4 border-t border-slate-200"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@cyybrid.tech"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>
              {loginError && (
                <p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-bold"
            >
              {loginLoading ? "Authenticating..." : "Sign In to Management Portal"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-950 font-semibold underline">
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pb-20">
      {/* ─── Control Header ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-base sm:text-lg text-slate-950 tracking-tight">
                  {currentUser?.role === "admin"
                    ? "Cyybrid Platform Administration"
                    : `${currentUser?.name} • ${currentUser?.sellerStore || "Store Management"}`}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-800">
                  {currentUser?.role}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Signed in as <strong className="text-slate-700">{currentUser?.email}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setIsRefreshing(true);
                loadPortalData();
              }}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-950 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <Link
              to="/shop"
              className="px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-rose-600 hover:text-rose-700 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-100 py-1.5">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{currentUser?.role === "admin" ? "Marketplace Overview" : "Store Dashboard"}</span>
          </button>

          <button
            onClick={() => setActiveTab("restock")}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "restock"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Inventory & Restock</span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "products"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products</span>
            <span className="text-[10px] font-mono bg-slate-200/80 text-slate-800 px-1.5 py-0.2 rounded-full">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === "orders"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders & Delivery Dispatch</span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              {orders.length}
            </span>
          </button>

          {currentUser?.role === "admin" && (
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "audit"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit Trail</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {currentUser?.role === "admin" && adminOverview ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Total Marketplace GMV
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {formatPrice(adminOverview.totalGmvCents)}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Cyybrid 5% Platform Revenue
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 font-mono">
                      {formatPrice(adminOverview.totalPlatformRevenueCents)}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Active Seller Stores
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {adminOverview.totalSellersCount}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Total Orders Placed
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {adminOverview.totalOrdersCount}
                    </div>
                  </div>
                </div>

                {/* Sellers Financials */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <h3 className="font-heading font-bold text-lg text-slate-950">
                    Sellers Financial Ledger & Payout Disbursements
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-3">Seller</th>
                          <th className="pb-3">Store Name</th>
                          <th className="pb-3">Subaccount</th>
                          <th className="pb-3">Sales GMV</th>
                          <th className="pb-3">Available Balance</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminOverview.sellerStats.map((seller) => (
                          <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 font-bold text-slate-950">{seller.name}</td>
                            <td className="py-4 text-slate-700">{seller.storeName}</td>
                            <td className="py-4 font-mono text-slate-600">{seller.paystackSubaccount}</td>
                            <td className="py-4 font-mono font-bold text-slate-900">
                              {formatPrice(seller.totalSalesGmvCents)}
                            </td>
                            <td className="py-4 font-mono font-bold text-emerald-600 text-sm">
                              {formatPrice(seller.balanceCents)}
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedSellerForPayout(seller);
                                  setPayoutAmountGhs((seller.balanceCents / 100).toFixed(2));
                                  setPayoutNote(`Settlement for ${seller.storeName}`);
                                  setIsPayoutModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl"
                              >
                                Settle Payout
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : sellerAnalytics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Store Gross Sales
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                    {formatPrice(sellerAnalytics.totalGmvCents)}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Available Balance (95% Net)
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 font-mono">
                    {formatPrice(sellerAnalytics.balanceCents)}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Total Disbursed
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                    {formatPrice(sellerAnalytics.totalPaidCents)}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Total Orders
                  </div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                    {sellerAnalytics.totalOrders}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">Loading data...</div>
            )}
          </div>
        )}

        {/* INVENTORY & RESTOCK TAB */}
        {activeTab === "restock" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-950">Inventory Restock</h2>
                <p className="text-xs text-slate-500">Manage size variant stock levels.</p>
              </div>

              <button
                onClick={() => openAddModal()}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="space-y-4">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-500 font-bold">{prod.sku}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {prod.totalStock} in stock
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-slate-950 truncate">{prod.name}</h3>
                      <div className="text-xs font-mono font-bold text-slate-900">{formatPrice(prod.priceCents)}</div>
                    </div>
                  </div>

                  <div className="flex-1 w-full lg:w-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {prod.sizes.map((sz) => (
                        <div key={sz.label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-slate-800">{sz.label}</span>
                            <span className="font-mono font-bold text-slate-900">{sz.stock}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => handleQuickRestock(prod.id, sz.label, 5)}
                              className="py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-800 hover:bg-slate-100"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleQuickRestock(prod.id, sz.label, 10)}
                              className="py-0.5 text-[10px] font-bold bg-white border border-slate-200 rounded text-slate-800 hover:bg-slate-100"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleQuickRestock(prod.id, sz.label, 25)}
                              className="py-0.5 text-[10px] font-bold bg-slate-900 text-white rounded hover:bg-black"
                            >
                              +25
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-950">Catalog Products</h2>
                <p className="text-xs text-slate-500">Edit or publish products.</p>
              </div>

              <button
                onClick={() => openAddModal()}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Total Stock</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={prod.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200" />
                          <div>
                            <div className="font-bold text-slate-950">{prod.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{prod.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 uppercase text-slate-600 font-medium">{prod.category}</td>
                      <td className="py-3.5 font-mono font-bold">{formatPrice(prod.priceCents)}</td>
                      <td className="py-3.5 font-mono font-bold">{prod.totalStock}</td>
                      <td className="py-3.5 text-right space-x-2">
                        <button
                          onClick={() => openAddModal(prod)}
                          className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS & DELIVERY DISPATCH TAB */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-heading font-bold text-xl text-slate-950">Orders & Delivery Dispatch</h2>
              <p className="text-xs text-slate-500">
                Manage order fulfillment, assign couriers, and track live status.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
                No orders placed yet. As customers checkout, orders appear here in real time.
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-black text-base text-slate-950">{order.orderNo}</span>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                            {order.trackingCode}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Recipient: <strong className="text-slate-800">{order.customerName}</strong> ({order.phone}) •{" "}
                          {order.address}, {order.city}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400">Total</div>
                          <div className="font-mono font-black text-sm text-slate-950">{formatPrice(order.totalCents)}</div>
                        </div>

                        <button
                          onClick={() => openDeliveryModal(order)}
                          className="px-3.5 py-1.5 bg-slate-950 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Manage Delivery</span>
                        </button>
                      </div>
                    </div>

                    {/* Delivery & Courier Assigned */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                      <div>
                        <span className="text-slate-400 font-medium block text-[10px]">Courier Name</span>
                        <strong className="text-slate-900">{order.courierName || "Fleet Courier"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block text-[10px]">Courier Phone</span>
                        <strong className="text-slate-900">{order.courierPhone || "Unassigned"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium block text-[10px]">Vehicle / Dispatch</span>
                        <strong className="text-slate-900">{order.courierVehicle || "Motorbike Dispatch"}</strong>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2.5">
                          <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-900 truncate">{item.name}</div>
                            <div className="text-[10px] text-slate-500">
                              Size: {item.sizeLabel} • Qty: {item.qty}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUDIT TAB */}
        {activeTab === "audit" && currentUser?.role === "admin" && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs overflow-x-auto space-y-4">
            <h2 className="font-heading font-bold text-lg text-slate-950">Security Audit Trail</h2>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Actor</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Target</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-2.5 font-bold text-slate-900">{log.actor}</td>
                    <td className="py-2.5 font-semibold text-slate-800">{log.action}</td>
                    <td className="py-2.5 text-slate-700">{log.target}</td>
                    <td className="py-2.5 text-slate-600 max-w-md">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* DELIVERY DISPATCH MODAL */}
      {editingDeliveryOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-black text-base text-slate-950">
                  Update Delivery Dispatch
                </h3>
                <p className="text-xs text-slate-500">{editingDeliveryOrder.orderNo}</p>
              </div>
              <button
                onClick={() => setEditingDeliveryOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-950 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDelivery} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Fulfillment Status</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-950"
                >
                  {ORDER_STAGES.map((st) => (
                    <option key={st.key} value={st.key}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Courier Driver Name</label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Samuel Adjei"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Courier Phone Number</label>
                <input
                  type="text"
                  required
                  value={courierPhone}
                  onChange={(e) => setCourierPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch Vehicle / ID</label>
                <input
                  type="text"
                  value={courierVehicle}
                  onChange={(e) => setCourierVehicle(e.target.value)}
                  placeholder="e.g. Motorbike #GH-412"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tracking Code</label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDeliveryOrder(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deliveryLoading}
                  className="btn-primary py-2 px-5 font-bold"
                >
                  {deliveryLoading ? "Saving..." : "Save Delivery Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-base text-slate-950">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Court Heritage Retro High"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  >
                    <option value="sneakers">Footwear & Sneakers</option>
                    <option value="watches">Watches & Horology</option>
                    <option value="tops">Streetwear & Apparel</option>
                    <option value="tech">Electronics & Audio</option>
                    <option value="bags">Leather & Travel Bags</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (Pesewas / GH₵)</label>
                  <input
                    type="number"
                    required
                    value={formPriceCents / 100}
                    onChange={(e) => setFormPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formImages[0] || ""}
                  onChange={(e) => setFormImages([e.target.value])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sizes & Stock Levels</label>
                <div className="grid grid-cols-3 gap-2">
                  {formSizes.map((sz, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{sz.label}</span>
                      <input
                        type="number"
                        min="0"
                        value={sz.stock}
                        onChange={(e) => {
                          const updated = [...formSizes];
                          updated[idx].stock = parseInt(e.target.value || "0", 10);
                          setFormSizes(updated);
                        }}
                        className="w-12 bg-white border border-slate-300 rounded px-1 py-0.5 text-center font-mono font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 px-5 font-bold">
                  {editingProduct ? "Save Changes" : "Publish Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYOUT MODAL */}
      {isPayoutModalOpen && selectedSellerForPayout && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-black text-base text-slate-950">Settle Seller Payout</h3>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchPayout} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Seller Destination</span>
                <strong className="text-slate-900 text-sm">
                  {selectedSellerForPayout.name} ({selectedSellerForPayout.paystackSubaccount})
                </strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payout Amount (GH₵)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payoutAmountGhs}
                  onChange={(e) => setPayoutAmountGhs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsPayoutModalOpen(false)} className="px-4 py-2 font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={payoutLoading} className="btn-primary py-2 px-5 font-bold">
                  {payoutLoading ? "Processing..." : "Confirm & Settle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
