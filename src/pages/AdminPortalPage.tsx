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
  UserPlus,
  ToggleLeft,
  ToggleRight,
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
  fetchAdminTeam,
  addAdminTeamMember,
  updateAdminTeamMember,
  deleteAdminTeamMember,
  completeSecuritySetup,
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
  TeamMember,
} from "../lib/api";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatDateTime } from "../lib/utils";

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

  // Login form state (Accepts Username or Email)
  const [loginEmail, setLoginEmail] = useState("admin");
  const [loginPass, setLoginPass] = useState("admin");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // First-time Security Setup state for Sellers
  const [secEmail, setSecEmail] = useState("");
  const [secPhone, setSecPhone] = useState("");
  const [secPassword, setSecPassword] = useState("");
  const [secConfirmPassword, setSecConfirmPassword] = useState("");
  const [secError, setSecError] = useState("");
  const [secLoading, setSecLoading] = useState(false);
  const [showSecPassword, setShowSecPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "overview" | "team" | "restock" | "products" | "orders" | "audit"
  >("overview");

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
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

  // Team Member Modal (Add / Edit) - Admin sets Name & Username
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [teamFormName, setTeamFormName] = useState("");
  const [teamFormUsername, setTeamFormUsername] = useState("");
  const [teamFormPhone, setTeamFormPhone] = useState("");
  const [teamFormStore, setTeamFormStore] = useState("");
  const [teamFormCategory, setTeamFormCategory] = useState("Footwear & Sneakers");
  const [teamFormRole, setTeamFormRole] = useState("Footwear Specialist");
  const [teamFormCommission, setTeamFormCommission] = useState(5);
  const [teamFormBank, setTeamFormBank] = useState("MTN Mobile Money");
  const [teamFormAccount, setTeamFormAccount] = useState("");
  const [teamLoading, setTeamLoading] = useState(false);

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
        const [overview, prods, ords, audLogs, invLogs, team] = await Promise.all([
          fetchAdminOverview().catch(() => null),
          fetchSellerProducts().catch(() => []),
          fetchSellerOrders().catch(() => []),
          fetchAuditLogs().catch(() => []),
          fetchInventoryLogs().catch(() => []),
          fetchAdminTeam().catch(() => []),
        ]);
        if (overview) setAdminOverview(overview);
        setProducts(prods);
        setOrders(ords);
        setAuditLogs(audLogs);
        setInventoryLogs(invLogs);
        setTeamMembers(team);
      } else {
        const [analytics, prods, ords, invLogs] = await Promise.all([
          fetchSellerAnalytics(currentUser.sellerId).catch(() => null),
          fetchSellerProducts(currentUser.sellerId).catch(() => []),
          fetchSellerOrders(currentUser.sellerId).catch(() => []),
          fetchInventoryLogs().catch(() => []),
        ]);
        if (analytics) setSellerAnalytics(analytics);
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

  const handleLoginSubmit = async () => {
    if (!loginEmail || !loginPass) {
      setLoginError("Please enter your email and password.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await authLogin(loginEmail, loginPass);
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

  // ─── Team Management Handlers ───────────────────────────────────

  const openAddTeamModal = (memberToEdit?: TeamMember) => {
    if (memberToEdit) {
      setEditingTeamMember(memberToEdit);
      setTeamFormName(memberToEdit.name);
      setTeamFormUsername(memberToEdit.username || memberToEdit.name.toLowerCase().replace(/[^a-z0-9_]/g, ""));
      setTeamFormPhone(memberToEdit.phone || "");
      setTeamFormStore(memberToEdit.storeName);
      setTeamFormCategory(memberToEdit.categorySpecialty);
      setTeamFormRole(memberToEdit.memberRole);
      setTeamFormCommission(Math.round((memberToEdit.commissionRate || 0.05) * 100));
      setTeamFormBank(memberToEdit.payoutBank || "MTN Mobile Money");
      setTeamFormAccount(memberToEdit.payoutAccount || "");
    } else {
      setEditingTeamMember(null);
      setTeamFormName("");
      setTeamFormUsername("");
      setTeamFormPhone("");
      setTeamFormStore("");
      setTeamFormCategory("Footwear & Sneakers");
      setTeamFormRole("Footwear Specialist");
      setTeamFormCommission(5);
      setTeamFormBank("MTN Mobile Money");
      setTeamFormAccount("");
    }
    setIsTeamModalOpen(true);
  };

  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = teamFormUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!teamFormName.trim() || !cleanUsername) {
      error("Missing Required Fields", "Please provide both Full Name and Username.");
      return;
    }

    setTeamLoading(true);
    try {
      const payload = {
        name: teamFormName.trim(),
        username: cleanUsername,
        email: `${cleanUsername}@cyybrid.internal`,
        phone: teamFormPhone.trim() || "+233 24 000 0000",
        storeName: teamFormStore.trim() || `${teamFormName.trim()}'s Boutique`,
        categorySpecialty: teamFormCategory,
        memberRole: teamFormRole,
        commissionRate: teamFormCommission / 100,
        payoutBank: teamFormBank,
        payoutAccount: teamFormAccount.trim() || "0240000000",
        password: cleanUsername,
      };

      if (editingTeamMember) {
        const res = await updateAdminTeamMember(editingTeamMember.id, payload);
        if (res.success) {
          success("Team Updated", `Profile for ${teamFormName} updated.`);
          setIsTeamModalOpen(false);
          loadPortalData();
        }
      } else {
        const res = await addAdminTeamMember(payload);
        if (res.success) {
          success(
            "Team Member Added",
            `${teamFormName} provisioned with temporary login: Username "${cleanUsername}", Password "${cleanUsername}".`
          );
          setIsTeamModalOpen(false);
          loadPortalData();
        }
      }
    } catch (err: any) {
      error("Operation Failed", err.message);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleToggleMemberStatus = async (member: TeamMember) => {
    const nextStatus = member.status === "active" ? "suspended" : "active";
    try {
      const res = await updateAdminTeamMember(member.id, { status: nextStatus });
      if (res.success) {
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
        );
        success("Status Updated", `${member.name} is now ${nextStatus}.`);
      }
    } catch (err: any) {
      error("Update Failed", err.message);
    }
  };

  const handleDeleteTeamMember = async (member: TeamMember) => {
    if (!window.confirm(`Are you sure you want to remove ${member.name} and their seller account from the platform?`)) return;
    try {
      const res = await deleteAdminTeamMember(member.id);
      if (res.success) {
        setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
        success("Member Removed", `${member.name} was removed from the team.`);
      }
    } catch (err: any) {
      error("Delete Failed", err.message);
    }
  };

  const copyCredentials = (member: TeamMember) => {
    const un = member.username || member.name.toLowerCase().replace(/[^a-z0-9_]/g, "");
    const text = `CYYBRID SELLER ONBOARDING CREDENTIALS\nPortal: /admin\nUsername: ${un}\nTemporary Password: ${un}\nStore: ${member.storeName}\n\nNote: On first login, you will be prompted to set your personal email and private password.`;
    navigator.clipboard.writeText(text);
    success("Copied to Clipboard", `Login credentials for ${member.name} (@${un}) copied.`);
  };

  const handleCompleteSecuritySetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecError("");

    if (!secEmail || !secEmail.includes("@")) {
      setSecError("Please enter a valid official email address.");
      return;
    }
    if (!secPassword || secPassword.length < 6) {
      setSecError("New secure password must be at least 6 characters long.");
      return;
    }
    if (secPassword !== secConfirmPassword) {
      setSecError("Passwords do not match. Please re-enter carefully.");
      return;
    }

    setSecLoading(true);
    try {
      const res = await completeSecuritySetup({
        email: secEmail.trim(),
        phone: secPhone.trim(),
        password: secPassword,
      });

      if (res.success && res.user) {
        setCurrentUser({ ...res.user, mustSetPassword: false });
        success("Security Configured", `Your credentials have been secured, ${res.user.name}.`);
      }
    } catch (err: any) {
      setSecError(err.message || "Failed to update security credentials.");
    } finally {
      setSecLoading(false);
    }
  };

  // ─── Inventory & Delivery Handlers ──────────────────────────────

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 space-y-6 relative z-10 animate-fadeIn">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-slate-950 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Store className="w-7 h-7 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black font-heading text-slate-950">
              Cyybrid Seller & Admin Portal
            </h2>
            <p className="text-xs text-slate-500">
              Unified management system for Super Admins and authorized Team Sellers.
            </p>
          </div>

          {/* Single Universal Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLoginSubmit();
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username or Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin or your username"
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

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-950 font-semibold underline">
              ← Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── FIRST-TIME SECURITY SETUP SCREEN (FOR ONBOARDING TEAM MEMBERS) ───
  if (currentUser && currentUser.mustSetPassword) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 sm:p-10 space-y-6 relative z-10 animate-fadeIn">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-heading text-slate-950">
              Account Security Activation
            </h2>
            <p className="text-xs text-slate-600">
              Welcome to Cyybrid Marketplace, <strong className="text-slate-900">{currentUser.name}</strong>! Please configure your official contact email and choose a secure permanent password to activate your seller portal.
            </p>
          </div>

          <form onSubmit={handleCompleteSecuritySetup} className="space-y-4 text-xs pt-2">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={secEmail}
                  onChange={(e) => setSecEmail(e.target.value)}
                  placeholder="e.g. kwame.mensah@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                This email will be used for all order notifications and future logins.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Contact Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={secPhone}
                  onChange={(e) => setSecPhone(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                New Permanent Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSecPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={secPassword}
                  onChange={(e) => setSecPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
                <button
                  type="button"
                  onClick={() => setShowSecPassword(!showSecPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showSecPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={secConfirmPassword}
                  onChange={(e) => setSecConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>
            </div>

            {secError && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{secError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={secLoading}
              className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-bold shadow-lg"
            >
              {secLoading ? "Activating Account..." : "Save Credentials & Open Dashboard"}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-900 pt-2 font-medium"
            >
              Cancel & Sign Out
            </button>
          </form>
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
                    ? "Cyybrid Platform Super Administration"
                    : `${currentUser?.name} • ${currentUser?.sellerStore || "Store Management"}`}
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-800">
                  {currentUser?.role === "admin" ? "SUPER ADMIN" : "SELLER"}
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

          {currentUser?.role === "admin" && (
            <button
              onClick={() => setActiveTab("team")}
              className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap ${
                activeTab === "team"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team & Sellers</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
                {teamMembers.length}
              </span>
            </button>
          )}

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
                      Active Team Sellers
                    </div>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-slate-950 font-mono">
                      {teamMembers.length || adminOverview.totalSellersCount}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-slate-950">
                        Sellers Financial Ledger & Balances
                      </h3>
                      <p className="text-xs text-slate-500">Live earnings breakdown per team member.</p>
                    </div>

                    <button
                      onClick={() => setActiveTab("team")}
                      className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
                    >
                      <span>Manage Team Members</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <th className="pb-3">Seller</th>
                          <th className="pb-3">Store Name</th>
                          <th className="pb-3">Category Specialty</th>
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
                            <td className="py-4 text-slate-600">{seller.categorySpecialty}</td>
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

        {/* ─── TEAM & SELLERS MANAGEMENT TAB (SUPER ADMIN ONLY) ─── */}
        {activeTab === "team" && currentUser?.role === "admin" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-950">Team & Sellers Management</h2>
                <p className="text-xs text-slate-500">
                  Add team members, assign category specialties, and provision seller credentials.
                </p>
              </div>

              <button
                onClick={() => openAddTeamModal()}
                className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2 rounded-xl shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Team Member</span>
              </button>
            </div>

            {teamMembers.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-900 text-sm">No Team Members Added Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click the "Add Team Member" button above to register your first team member or seller.
                </p>
                <button
                  onClick={() => openAddTeamModal()}
                  className="btn-primary text-xs py-2 px-5 rounded-full inline-block mt-2"
                >
                  Add First Team Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 relative"
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800">
                          {member.memberRole || "Specialist"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            member.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>

                      {/* Profile details */}
                      <div className="flex items-center gap-3.5 mt-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white font-bold text-base flex items-center justify-center font-heading shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-heading font-black text-sm text-slate-950 truncate">
                            {member.name}
                          </h3>
                          <div className="text-xs text-slate-700 font-bold font-mono truncate">
                            @{member.username || member.email.split("@")[0]}
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold truncate">
                            {member.storeName}
                          </div>
                          {member.mustSetPassword ? (
                            <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              First-Time Setup Pending
                            </span>
                          ) : (
                            <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Active & Configured
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Metrics & bank */}
                      <div className="grid grid-cols-2 gap-2 mt-4 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Specialty
                          </span>
                          <span className="font-semibold text-slate-800 line-clamp-1">
                            {member.categorySpecialty}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Platform Cut
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            {Math.round((member.commissionRate || 0.05) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Payout Bank
                          </span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {member.payoutBank || "MTN MoMo"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Payout Number
                          </span>
                          <span className="font-mono text-slate-700 truncate block">
                            {member.payoutAccount || member.phone}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                      <button
                        onClick={() => copyCredentials(member)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1"
                        title="Copy login details"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Login Info</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleMemberStatus(member)}
                          className={`p-1.5 rounded-lg ${
                            member.status === "active"
                              ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={member.status === "active" ? "Suspend Account" : "Activate Account"}
                        >
                          {member.status === "active" ? (
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        <button
                          onClick={() => openAddTeamModal(member)}
                          className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteTeamMember(member)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

      {/* ─── ADD / EDIT TEAM MEMBER MODAL ─── */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-heading font-black text-base text-slate-950">
                  {editingTeamMember ? `Edit Team Member: ${editingTeamMember.name}` : "Add Team Member / Seller"}
                </h3>
                <p className="text-xs text-slate-500">Provision dedicated store and seller dashboard access.</p>
              </div>
              <button onClick={() => setIsTeamModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-950">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamFormName}
                    onChange={(e) => {
                      setTeamFormName(e.target.value);
                      if (!editingTeamMember && !teamFormUsername) {
                        setTeamFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                      }
                      if (!editingTeamMember && !teamFormStore) {
                        setTeamFormStore(`${e.target.value.trim()}'s Store`);
                      }
                    }}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Assigned Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teamFormUsername}
                    onChange={(e) => setTeamFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="e.g. kwame"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              {/* Security onboarding note */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-[11px] text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-emerald-950">High-Security First-Time Setup</strong>
                  Seller logs in with Username: <code className="font-mono font-bold bg-emerald-100 px-1 rounded">{teamFormUsername || "username"}</code> and Password: <code className="font-mono font-bold bg-emerald-100 px-1 rounded">{teamFormUsername || "username"}</code>. Upon login, they will be prompted to set their private email & secure password.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Store / Brand Name</label>
                  <input
                    type="text"
                    required
                    value={teamFormStore}
                    onChange={(e) => setTeamFormStore(e.target.value)}
                    placeholder="e.g. Kicks & Soles Hub"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone (Optional)</label>
                  <input
                    type="tel"
                    value={teamFormPhone}
                    onChange={(e) => setTeamFormPhone(e.target.value)}
                    placeholder="+233 24 000 0000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category Specialty</label>
                  <select
                    value={teamFormCategory}
                    onChange={(e) => setTeamFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950 font-semibold"
                  >
                    <option value="Footwear & Sneakers">Footwear & Sneakers</option>
                    <option value="Watches & Horology">Watches & Horology</option>
                    <option value="Streetwear & Apparel">Streetwear & Apparel</option>
                    <option value="Electronics & Smart Tech">Electronics & Smart Tech</option>
                    <option value="Leather Bags & Perfumes">Leather Bags & Perfumes</option>
                    <option value="General Catalog">General Catalog</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Member Role Title</label>
                  <input
                    type="text"
                    required
                    value={teamFormRole}
                    onChange={(e) => setTeamFormRole(e.target.value)}
                    placeholder="e.g. Footwear Lead"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Platform Commission (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={teamFormCommission}
                    onChange={(e) => setTeamFormCommission(parseInt(e.target.value || "5", 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-950"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payout Method / Bank</label>
                  <select
                    value={teamFormBank}
                    onChange={(e) => setTeamFormBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-950"
                  >
                    <option value="MTN Mobile Money">MTN Mobile Money</option>
                    <option value="Telecel Cash">Telecel Cash</option>
                    <option value="Access Bank Ghana">Access Bank Ghana</option>
                    <option value="Ecobank Ghana">Ecobank Ghana</option>
                    <option value="GCB Bank">GCB Bank</option>
                    <option value="Stanbic Bank Ghana">Stanbic Bank Ghana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payout Account / MoMo No.</label>
                <input
                  type="text"
                  value={teamFormAccount}
                  onChange={(e) => setTeamFormAccount(e.target.value)}
                  placeholder="0244129902"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2 font-bold text-slate-600">
                  Cancel
                </button>
                <button type="submit" disabled={teamLoading} className="btn-primary py-2 px-5 font-bold">
                  {teamLoading ? "Saving..." : editingTeamMember ? "Save Changes" : "Create Team Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
