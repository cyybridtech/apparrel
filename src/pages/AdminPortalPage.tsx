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
  ShieldAlert,
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
  portalLogin,
  Product,
  Order,
  SellerAnalytics,
  SuperAdminOverview,
  SellerPayout,
  AuditLog,
  InventoryLog,
  Seller,
} from "../lib/api";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatDateTime } from "../lib/utils";

const SELLER_PROFILES_PRESET = [
  {
    id: 1,
    name: "Kwame Mensah",
    storeName: "Kicks & Soles Hub",
    category: "Footwear & Sneakers",
    pin: "1111",
    role: "Seller 1 / Footwear Lead",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300",
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: 2,
    name: "Ama Serwaa",
    storeName: "Chrono & Heritage",
    category: "Watches & Horology",
    pin: "2222",
    role: "Seller 2 / Horology Specialist",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300",
    color: "from-amber-600 to-yellow-700",
  },
  {
    id: 3,
    name: "Kofi Boateng",
    storeName: "Cyybrid Atelier Wear",
    category: "Streetwear & Apparel",
    pin: "3333",
    role: "Seller 3 / Fashion Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300",
    color: "from-slate-700 to-slate-900",
  },
  {
    id: 4,
    name: "Esi Darko",
    storeName: "Volt Audio & Gadgets",
    category: "Electronics & Smart Tech",
    pin: "4444",
    role: "Seller 4 / Tech Lead",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300",
    color: "from-emerald-600 to-teal-700",
  },
  {
    id: 5,
    name: "Yaw Osei",
    storeName: "Artisan Leather & Scents",
    category: "Leather Bags & Perfumes",
    pin: "5555",
    role: "Seller 5 / Craft Specialist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300",
    color: "from-rose-600 to-red-800",
  },
];

const IMAGE_PRESETS = [
  { label: "Noir Heavyweight Tee", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000", cat: "tops" },
  { label: "Oversized Minimalist Tee", url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000", cat: "tops" },
  { label: "Court Heritage Retro High", url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000", cat: "sneakers" },
  { label: "Monochrome Minimalist Low", url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000", cat: "sneakers" },
  { label: "Chronos Stealth PVD Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000", cat: "watches" },
  { label: "Bauhaus Minimalist Watch", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000", cat: "watches" },
  { label: "Volt Studio ANC Headphones", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000", cat: "tech" },
  { label: "Pulse Wireless ANC Earbuds", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000", cat: "tech" },
  { label: "Sovereign Leather Weekender", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000", cat: "bags" },
  { label: "Smoked Amber Extrait Parfum", url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000", cat: "perfumes" },
];

const CATEGORY_SIZE_TEMPLATES: Record<string, string[]> = {
  tops: ["XS", "S", "M", "L", "XL", "XXL"],
  sneakers: ["US 7", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 12"],
  watches: ["38mm Case", "40mm Case", "42mm Case", "One Size"],
  tech: ["Universal", "One Size", "Standard"],
  bags: ["Standard", "One Size", "45L Carry-On"],
  perfumes: ["50ml Flacon", "100ml Flacon", "200ml Flacon"],
};

const ORDER_STAGES: { key: Order["status"]; label: string; step: number; desc: string }[] = [
  { key: "confirmed", label: "1. Confirmed / Paid", step: 1, desc: "Order verified via Paystack" },
  { key: "processing", label: "2. Packaging & QC", step: 2, desc: "Items boxed & authenticated" },
  { key: "dispatched", label: "3. Dispatched", step: 3, desc: "Handed over to Accra Courier Hub" },
  { key: "in_transit", label: "4. In Transit", step: 4, desc: "En route to delivery zone" },
  { key: "out_for_delivery", label: "5. Out for Delivery", step: 5, desc: "Rider arriving at location" },
  { key: "delivered", label: "6. Delivered", step: 6, desc: "Package handed to customer" },
];

export function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem("cyybrid_session_token"));
  });
  const [sessionRole, setSessionRole] = useState<"super_admin" | "seller">(() => {
    return (localStorage.getItem("cyybrid_role") as any) || "super_admin";
  });
  const [activeSellerId, setActiveSellerId] = useState<number>(() => {
    const s = localStorage.getItem("cyybrid_seller_id");
    return s ? Number(s) : 1;
  });

  const [loginPin, setLoginPin] = useState("");
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

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockHealthFilter, setStockHealthFilter] = useState<"all" | "critical" | "low" | "healthy">("all");

  // Add / Edit Product Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Payout Modal (Super Admin)
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedSellerForPayout, setSelectedSellerForPayout] = useState<any>(null);
  const [payoutAmountGhs, setPayoutAmountGhs] = useState<string>("");
  const [payoutNote, setPayoutNote] = useState<string>("");
  const [payoutLoading, setPayoutLoading] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("CYYBRID");
  const [formCategory, setFormCategory] = useState("sneakers");
  const [formSubCategory, setFormSubCategory] = useState("Footwear");
  const [formDescription, setFormDescription] = useState("");
  const [formPriceCents, setFormPriceCents] = useState(120000);
  const [formCompareAtCents, setFormCompareAtCents] = useState<number | undefined>(150000);
  const [formColorway, setFormColorway] = useState("Standard");
  const [formBadge, setFormBadge] = useState("NEW DROP");
  const [formGender, setFormGender] = useState("Unisex");
  const [formSku, setFormSku] = useState("");
  const [formImages, setFormImages] = useState<string[]>([IMAGE_PRESETS[2].url]);
  const [formFeatures, setFormFeatures] = useState<string[]>([
    "Premium hand-finished materials",
    "Tailored ergonomic construction",
  ]);
  const [formSizes, setFormSizes] = useState<{ label: string; stock: number }[]>([
    { label: "US 8.5", stock: 12 },
    { label: "US 9.5", stock: 15 },
    { label: "US 10.5", stock: 8 },
  ]);

  const { success, error, info } = useToast();

  const loadPortalData = async () => {
    setLoading(true);
    try {
      if (sessionRole === "super_admin") {
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
          fetchSellerAnalytics(activeSellerId),
          fetchSellerProducts(activeSellerId),
          fetchSellerOrders(activeSellerId),
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
  }, [isAuthenticated, sessionRole, activeSellerId]);

  const handleLogin = async (pinToUse?: string) => {
    const pin = pinToUse || loginPin;
    if (!pin.trim()) {
      setLoginError("Please enter your PIN or Passkey.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await portalLogin(pin);
      if (res.success) {
        setIsAuthenticated(true);
        setSessionRole(res.role);
        if (res.seller) {
          setActiveSellerId(res.seller.id);
        }
        success("Access Granted", res.message || "Welcome to Cyybrid Portal");
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid passkey. Use 9999 for Super Admin or 1111-5555 for Sellers.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSwitchRole = (newRole: "super_admin" | "seller", sellerId?: number) => {
    if (newRole === "super_admin") {
      handleLogin("9999");
    } else if (sellerId) {
      handleLogin(String(sellerId).repeat(4));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cyybrid_session_token");
    localStorage.removeItem("apparrel_admin_token");
    localStorage.removeItem("cyybrid_role");
    localStorage.removeItem("cyybrid_seller_id");
    setIsAuthenticated(false);
    setSessionRole("super_admin");
    info("Signed Out", "Portal session terminated safely.");
  };

  const handleQuickRestock = async (productId: number, sizeLabel: string, amount: number) => {
    try {
      const res = await restockSellerProduct(productId, sizeLabel, amount, "Quick 1-Click Restock");
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

  const handleUpdateStatus = async (orderId: number, newStatus: Order["status"]) => {
    try {
      const res = await updateSellerOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        success("Order Updated", `Order transitioned to "${newStatus.toUpperCase()}"`);
      }
    } catch (err: any) {
      error("Update Failed", err.message);
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
      setFormFeatures(prodToEdit.features);
      setFormSizes(prodToEdit.sizes);
    } else {
      setEditingProduct(null);
      setFormName("");
      const activeSeller = SELLER_PROFILES_PRESET.find((s) => s.id === activeSellerId);
      setFormBrand(activeSeller?.storeName || "CYYBRID");
      setFormCategory(
        activeSellerId === 1
          ? "sneakers"
          : activeSellerId === 2
          ? "watches"
          : activeSellerId === 3
          ? "tops"
          : activeSellerId === 4
          ? "tech"
          : "bags"
      );
      setFormSubCategory("Curated");
      setFormDescription("");
      setFormPriceCents(85000);
      setFormCompareAtCents(110000);
      setFormColorway("Standard");
      setFormBadge("NEW DROP");
      setFormGender("Unisex");
      setFormSku(`SKU-${Date.now().toString(36).toUpperCase()}`);
      setFormImages([IMAGE_PRESETS[0].url]);
      setFormFeatures(["Hand-selected materials", "Authenticity guaranteed"]);
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
        sellerId: activeSellerId,
        name: formName.trim(),
        brand: formBrand.trim(),
        category: formCategory,
        subCategory: formSubCategory,
        description: formDescription,
        features: formFeatures.filter((f) => f.trim().length > 0),
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
        success("Product Saved", `"${formName}" saved to ${sessionRole === "super_admin" ? "Catalog" : "Store"}.`);
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
          {/* Decorative blur */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="text-center space-y-2 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-950 text-white flex items-center justify-center mx-auto shadow-md">
              <Store className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
              CYYBRID MARKETPLACE
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Multi-Seller Operations & Super Admin Cockpit. Select a team account or enter your passkey.
            </p>
          </div>

          {/* Quick Login for the 5 Founding Sellers + Super Admin */}
          <div className="space-y-4 mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1-Click Fast Simulation Accounts
            </div>

            {/* Super Admin Tile */}
            <button
              onClick={() => handleLogin("9999")}
              className="w-full p-4 rounded-2xl bg-slate-950 text-white hover:bg-black transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-emerald-400">
                  👑
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm flex items-center gap-2">
                    Super Admin Cockpit
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
                      PIN: 9999
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Platform Revenue, All 5 Sellers, Product Approvals & Payouts
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* The 5 Sellers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SELLER_PROFILES_PRESET.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleLogin(s.pin)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-all text-left flex items-center gap-3 group"
                >
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-950 truncate flex items-center justify-between">
                      <span>{s.name}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-500">
                        {s.pin}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium truncate">
                      {s.storeName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{s.category}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual PIN Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4 pt-4 border-t border-slate-200"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Or Enter Custom Secret PIN / Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="e.g. 9999 or 1111"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 pl-11 text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:border-slate-950"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
              {loginLoading ? "Authenticating..." : "Authorize Access"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center mt-6">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-950 font-semibold underline">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active seller details if logged in as seller
  const currentSellerInfo = SELLER_PROFILES_PRESET.find((s) => s.id === activeSellerId) || SELLER_PROFILES_PRESET[0];

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pb-20">
      {/* ─── Top Control Header ───────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Identity Pill */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                sessionRole === "super_admin"
                  ? "bg-slate-950"
                  : "bg-gradient-to-br " + currentSellerInfo.color
              }`}
            >
              {sessionRole === "super_admin" ? (
                <Sparkles className="w-5 h-5 text-emerald-400" />
              ) : (
                <Store className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-base sm:text-lg text-slate-950 tracking-tight">
                  {sessionRole === "super_admin"
                    ? "Cyybrid Super Admin Cockpit"
                    : `${currentSellerInfo.name} • ${currentSellerInfo.storeName}`}
                </h1>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    sessionRole === "super_admin"
                      ? "bg-slate-900 text-emerald-400"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {sessionRole === "super_admin" ? "Master Governance" : "Seller Isolated"}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2">
                <span>Paystack Subaccount:</span>
                <span className="font-mono text-slate-700 font-semibold">
                  {sessionRole === "super_admin"
                    ? "SPLIT-MASTER-POOL (5% Platform)"
                    : `ACCT_${currentSellerInfo.name.toLowerCase().split(" ")[0]}_984 (95% Net)`}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Account Switcher & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Account Switcher Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => handleSwitchRole("super_admin")}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-colors ${
                  sessionRole === "super_admin"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                👑 Super Admin
              </button>
              {SELLER_PROFILES_PRESET.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSwitchRole("seller", s.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-colors ${
                    sessionRole === "seller" && activeSellerId === s.id
                      ? "bg-white text-slate-950 shadow-xs"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                  title={s.storeName}
                >
                  S{s.id} ({s.name.split(" ")[0]})
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsRefreshing(true);
                loadPortalData();
              }}
              disabled={isRefreshing}
              className="p-2 text-slate-600 hover:text-slate-950 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>

            <Link
              to="/shop"
              className="px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Storefront</span>
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

        {/* Navigation Tabs */}
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
            <span>{sessionRole === "super_admin" ? "Marketplace GMV & Sellers" : "My Dashboard & Sales"}</span>
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
            <span>Inventory Matrix & Fast Restock</span>
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
            <span>{sessionRole === "super_admin" ? "Catalog & Approvals" : "My Product Drops"}</span>
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
            <span>{sessionRole === "super_admin" ? "Consolidated Orders" : "My Store Orders"}</span>
            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              {orders.length}
            </span>
          </button>

          {sessionRole === "super_admin" && (
            <button
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "audit"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Audit & Governance Trail</span>
            </button>
          )}
        </div>
      </header>

      {/* ─── Main Content Container ───────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ─── TAB 1: OVERVIEW ────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {sessionRole === "super_admin" && adminOverview ? (
              <>
                {/* Master Financial Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Total Marketplace GMV
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {formatPrice(adminOverview.totalGmvCents)}
                    </div>
                    <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Across all 5 Cyybrid Stores</span>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Cyybrid 5% Platform Pool
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 font-mono">
                      {formatPrice(adminOverview.totalPlatformRevenueCents)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Company Retained Commission</div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Active Seller Stores
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {adminOverview.totalSellersCount} <span className="text-sm text-slate-400 font-normal">Sellers</span>
                    </div>
                    <div className="text-xs text-blue-600 font-medium mt-1">100% Operational & Isolated</div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Total Units Dispatched
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {adminOverview.totalItemsSold} <span className="text-sm text-slate-400 font-normal">Units</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{adminOverview.totalOrdersCount} Total Customer Orders</div>
                  </div>
                </div>

                {/* 5 Sellers Financials & Payout Settlement Grid */}
                <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-slate-950">
                        Founding Sellers Financial & Payout Ledger
                      </h3>
                      <p className="text-xs text-slate-500">
                        Paystack split accounts, real-time balances, and 1-click settlement disbursements.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                      5 Active Vendor Nodes
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-3">Seller / Store</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Paystack Subaccount</th>
                          <th className="pb-3">Gross Sales</th>
                          <th className="pb-3">Available Balance</th>
                          <th className="pb-3">Total Paid Out</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminOverview.sellerStats.map((seller) => (
                          <tr key={seller.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4">
                              <div className="font-bold text-slate-950 text-sm">{seller.name}</div>
                              <div className="text-xs text-slate-500 font-medium">{seller.storeName}</div>
                            </td>
                            <td className="py-4 font-medium text-slate-700">{seller.categorySpecialty}</td>
                            <td className="py-4">
                              <span className="font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold border border-slate-200">
                                {seller.paystackSubaccount}
                              </span>
                            </td>
                            <td className="py-4 font-mono font-bold text-slate-900">
                              {formatPrice(seller.totalSalesGmvCents)}
                            </td>
                            <td className="py-4 font-mono font-extrabold text-emerald-600 text-sm">
                              {formatPrice(seller.balanceCents)}
                            </td>
                            <td className="py-4 font-mono text-slate-500">
                              {formatPrice(seller.totalPaidCents)}
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedSellerForPayout(seller);
                                  setPayoutAmountGhs((seller.balanceCents / 100).toFixed(2));
                                  setPayoutNote(`Settlement for ${seller.storeName}`);
                                  setIsPayoutModalOpen(true);
                                }}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95"
                              >
                                Disburse Payout
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
              <>
                {/* Single Seller Isolated Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      My Gross Sales (GMV)
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {formatPrice(sellerAnalytics.totalGmvCents)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{sellerAnalytics.totalOrders} Orders for my store</div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Available Balance (95% Net)
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-600 font-mono">
                      {formatPrice(sellerAnalytics.balanceCents)}
                    </div>
                    <div className="text-xs text-emerald-700 font-medium mt-1">Ready for next payout cycle</div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Total Disbursed to Date
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {formatPrice(sellerAnalytics.totalPaidCents)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Paid via Paystack MoMo / Bank</div>
                  </div>

                  <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Stock Alert Status
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {sellerAnalytics.lowStockCount}{" "}
                      <span className="text-sm text-slate-400 font-normal">Low Items</span>
                    </div>
                    <div className="text-xs text-amber-600 font-medium mt-1">Check Inventory Matrix</div>
                  </div>
                </div>

                {/* Seller Store Overview & Payout Accounts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="font-heading font-bold text-base text-slate-950">
                      Store Operations & Account Profile
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="text-slate-400 font-medium">Assigned Store Name</div>
                        <div className="font-bold text-slate-900 text-sm">{sellerAnalytics.storeName}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="text-slate-400 font-medium">Category Specialty</div>
                        <div className="font-bold text-slate-900 text-sm">{sellerAnalytics.categorySpecialty}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="text-slate-400 font-medium">Paystack Subaccount Code</div>
                        <div className="font-mono font-bold text-slate-900 text-sm">{sellerAnalytics.paystackSubaccount}</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="text-slate-400 font-medium">Platform Commission Split</div>
                        <div className="font-bold text-emerald-600 text-sm">5% Cyybrid / 95% Seller Net</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
                    <h3 className="font-heading font-bold text-base text-slate-950">Recent Payouts</h3>
                    {sellerAnalytics.recentPayouts && sellerAnalytics.recentPayouts.length > 0 ? (
                      <div className="space-y-3">
                        {sellerAnalytics.recentPayouts.map((p) => (
                          <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="text-slate-900 font-mono">{formatPrice(p.amountCents)}</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                                {p.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">{p.reference}</div>
                            <div className="text-[10px] text-slate-400">{formatDateTime(p.createdAt)}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No payout history recorded yet.</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">Loading metrics...</div>
            )}
          </div>
        )}

        {/* ─── TAB 2: INVENTORY & RESTOCK MATRIX ───────────────────── */}
        {activeTab === "restock" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-950">
                  {sessionRole === "super_admin" ? "All Marketplace Inventory Matrices" : "My Store Inventory Matrix"}
                </h2>
                <p className="text-xs text-slate-500">
                  Monitor stock levels across all size variants and execute 1-click instant restocks.
                </p>
              </div>

              <button
                onClick={() => openAddModal()}
                className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product Drop</span>
              </button>
            </div>

            {/* Product Cards with Size Matrices */}
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
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          {prod.sku}
                        </span>
                        {prod.sellerStore && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                            {prod.sellerStore}
                          </span>
                        )}
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {prod.totalStock} Total Units
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-slate-950 truncate">
                        {prod.name}
                      </h3>
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {formatPrice(prod.priceCents)}
                      </div>
                    </div>
                  </div>

                  {/* Size Matrix Grid */}
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Variant Stock & Instant Add
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                      {prod.sizes.map((sz) => (
                        <div
                          key={sz.label}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-bold text-slate-800">{sz.label}</span>
                            <span
                              className={`font-mono font-bold text-xs ${
                                sz.stock <= 3
                                  ? "text-rose-600"
                                  : sz.stock <= 7
                                  ? "text-amber-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {sz.stock} in stock
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1">
                            <button
                              onClick={() => handleQuickRestock(prod.id, sz.label, 5)}
                              className="py-1 text-[10px] font-bold bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleQuickRestock(prod.id, sz.label, 10)}
                              className="py-1 text-[10px] font-bold bg-white hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleQuickRestock(prod.id, sz.label, 25)}
                              className="py-1 text-[10px] font-bold bg-slate-900 hover:bg-black text-white rounded-lg transition-colors"
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

        {/* ─── TAB 3: PRODUCTS & DROP CREATOR ─────────────────────── */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-950">
                  {sessionRole === "super_admin" ? "Marketplace Global Catalog" : "My Product Catalog"}
                </h2>
                <p className="text-xs text-slate-500">
                  {sessionRole === "super_admin"
                    ? "Manage all product listings across the 5 founding seller accounts."
                    : "Create, edit, or adjust drop specifications for your assigned category."}
                </p>
              </div>

              <button
                onClick={() => openAddModal()}
                className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product Drop</span>
              </button>
            </div>

            {/* Product Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Store / Seller</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Stock</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-950 truncate max-w-xs">{prod.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{prod.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-medium text-slate-700">{prod.sellerStore || "Cyybrid Store"}</td>
                      <td className="py-3.5 font-medium uppercase text-slate-600">{prod.category}</td>
                      <td className="py-3.5 font-mono font-bold text-slate-900">{formatPrice(prod.priceCents)}</td>
                      <td className="py-3.5 font-mono font-bold">{prod.totalStock}</td>
                      <td className="py-3.5">
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {prod.approvalStatus || "Approved"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => openAddModal(prod)}
                          className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
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

        {/* ─── TAB 4: ORDERS & DISPATCH ────────────────────────────── */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-heading font-bold text-xl text-slate-950">
                {sessionRole === "super_admin" ? "Master Orders & Fulfillment Queue" : "My Store Customer Orders"}
              </h2>
              <p className="text-xs text-slate-500">
                Update packaging, dispatch, and delivery stages for customer purchases.
              </p>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-black text-base text-slate-950">
                          {order.orderNo}
                        </span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                          {order.trackingCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Customer: <strong className="text-slate-800">{order.customerName}</strong> ({order.phone}) •{" "}
                        {order.address}, {order.city}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Order Value</div>
                        <div className="font-heading font-black text-sm text-slate-950 font-mono">
                          {formatPrice(order.totalCents)}
                        </div>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-slate-950"
                      >
                        {ORDER_STAGES.map((st) => (
                          <option key={st.key} value={st.key}>
                            {st.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Order Line Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-950 truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-500">
                            Size: {item.sizeLabel} • Qty: {item.qty}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-slate-900 mt-0.5">
                            {formatPrice(item.unitPriceCents * item.qty)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 5: AUDIT & GOVERNANCE (SUPER ADMIN ONLY) ────────── */}
        {activeTab === "audit" && sessionRole === "super_admin" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="font-heading font-bold text-xl text-slate-950">
                Security & Platform Audit Log
              </h2>
              <p className="text-xs text-slate-500">
                Complete traceability across all seller inventory adjustments, logins, payouts, and order events.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs overflow-x-auto">
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
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-slate-900">{log.actor}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">({log.actorRole})</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">{log.action}</td>
                      <td className="py-3 font-medium text-slate-700">{log.target}</td>
                      <td className="py-3 text-slate-600 max-w-md">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ─── PRODUCT MODAL (ADD / EDIT) ───────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-950">
                  {editingProduct ? "Edit Product Drop" : "Create New Product Drop"}
                </h3>
                <p className="text-xs text-slate-500">
                  Assign specs, images, colorway, and structured size matrix.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-950 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Court Heritage Retro High"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Studio</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value);
                      const tpl = CATEGORY_SIZE_TEMPLATES[e.target.value] || ["Standard"];
                      setFormSizes(tpl.map((lbl) => ({ label: lbl, stock: 10 })));
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950 font-medium"
                  >
                    <option value="sneakers">Footwear & Sneakers</option>
                    <option value="watches">Watches & Horology</option>
                    <option value="tops">Streetwear & Apparel</option>
                    <option value="tech">Electronics & Audio</option>
                    <option value="bags">Leather & Travel Bags</option>
                    <option value="perfumes">Fragrances & Scents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (Pesewas / GH₵)</label>
                  <input
                    type="number"
                    required
                    value={formPriceCents / 100}
                    onChange={(e) => setFormPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-950 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Badge</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. LIMITED DROP"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={formImages[0] || ""}
                  onChange={(e) => setFormImages([e.target.value])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              {/* Size Matrix Config */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Size Variant Matrix & Initial Stock
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {formSizes.map((sz, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{sz.label}</span>
                      <input
                        type="number"
                        min="0"
                        value={sz.stock}
                        onChange={(e) => {
                          const updated = [...formSizes];
                          updated[idx].stock = parseInt(e.target.value || "0", 10);
                          setFormSizes(updated);
                        }}
                        className="w-14 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs text-center font-mono font-bold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-6">
                  {editingProduct ? "Save Changes" : "Publish Drop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PAYOUT DISBURSEMENT MODAL (SUPER ADMIN) ─────────────── */}
      {isPayoutModalOpen && selectedSellerForPayout && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-950">
                    Disburse Seller Settlement
                  </h3>
                  <p className="text-xs text-slate-500">{selectedSellerForPayout.storeName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-950 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchPayout} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-slate-500">Destination Account</div>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedSellerForPayout.name} ({selectedSellerForPayout.paystackSubaccount})
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payout Amount (GH₵)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payoutAmountGhs}
                  onChange={(e) => setPayoutAmountGhs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Internal Reference Note</label>
                <input
                  type="text"
                  value={payoutNote}
                  onChange={(e) => setPayoutNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutLoading}
                  className="btn-primary py-2.5 px-6 font-bold"
                >
                  {payoutLoading ? "Processing Settlement..." : "Confirm & Disburse GH₵"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
