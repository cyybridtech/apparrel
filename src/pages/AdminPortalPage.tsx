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
  X
} from "lucide-react";
import {
  fetchProducts,
  restockProduct,
  fetchAdminAnalytics,
  fetchAdminOrders,
  updateOrderStatus,
  saveProduct,
  deleteProduct,
  verifyAdminPasskey,
  fetchInventoryLogs,
  Product,
  Order,
  AdminAnalytics,
  InventoryLog,
} from "../lib/api";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatDateTime } from "../lib/utils";

const IMAGE_PRESETS = [
  { label: "Noir Heavyweight Tee", url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000", cat: "tops" },
  { label: "Oversized Minimalist Tee", url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000", cat: "tops" },
  { label: "Court Heritage Retro Low", url: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000", cat: "sneakers" },
  { label: "Monochrome Minimalist Kicks", url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000", cat: "sneakers" },
  { label: "Smoked Amber Extrait De Parfum", url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000", cat: "perfumes" },
  { label: "Dark Oud Artisanal Parfum", url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000", cat: "perfumes" },
  { label: "Chronos Stealth Watch", url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000", cat: "watches" },
  { label: "Bauhaus Automatic Watch", url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000", cat: "watches" },
  { label: "Citrus Vetiver Body Mist", url: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=1000", cat: "body-sprays" },
  { label: "Aqua Bergamot Spray", url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000", cat: "body-sprays" },
];

const CATEGORY_SIZE_TEMPLATES: Record<string, string[]> = {
  tops: ["XS", "S", "M", "L", "XL", "XXL"],
  sneakers: ["US 7", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 12"],
  perfumes: ["50ml Extrait", "100ml Extrait", "200ml Flacon"],
  watches: ["40mm Sapphire", "42mm Chrono", "One Size"],
  "body-sprays": ["150ml Spray", "250ml Mist"],
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
    return localStorage.getItem("apparrel_admin_auth") === "true";
  });
  const [loginPin, setLoginPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"restock" | "products" | "orders" | "analytics" | "logs">("restock");
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockHealthFilter, setStockHealthFilter] = useState<"all" | "critical" | "low" | "healthy">("all");

  // Add / Edit Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // High-Tier Structured Form State
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("APPARREL STUDIO");
  const [formCategory, setFormCategory] = useState("tops");
  const [formSubCategory, setFormSubCategory] = useState("Graphic Tees");
  const [formDescription, setFormDescription] = useState("");
  const [formPriceCents, setFormPriceCents] = useState(45000);
  const [formCompareAtCents, setFormCompareAtCents] = useState<number | undefined>(60000);
  const [formColorway, setFormColorway] = useState("Washed Noir");
  const [formBadge, setFormBadge] = useState("NEW DROP");
  const [formImages, setFormImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000",
  ]);
  const [formNewImageUrl, setFormNewImageUrl] = useState("");
  const [formSizes, setFormSizes] = useState<Array<{ label: string; stock: number }>>([
    { label: "S", stock: 15 },
    { label: "M", stock: 25 },
    { label: "L", stock: 20 },
    { label: "XL", stock: 10 },
  ]);

  const { success, error, info } = useToast();

  const loadAllAdminData = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const [prods, statsRes, ordsRes, logsRes] = await Promise.all([
        fetchProducts(),
        fetchAdminAnalytics().catch(() => null),
        fetchAdminOrders().catch(() => []),
        fetchInventoryLogs().catch(() => []),
      ]);
      setProducts(prods);
      setAnalytics(statsRes);
      setOrders(ordsRes);
      setLogs(logsRes);
    } catch (err) {
      console.error("Admin data load error", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = async (e?: React.FormEvent, bypassPin?: string) => {
    if (e) e.preventDefault();
    const pinToTest = (bypassPin || loginPin).trim();
    if (!pinToTest && !bypassPin) return;

    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await verifyAdminPasskey(pinToTest);
      if (res.authorized && res.token) {
        localStorage.setItem("apparrel_admin_auth", "true");
        localStorage.setItem("apparrel_admin_token", res.token);
        setIsAuthenticated(true);
        success("Access Granted", "Welcome to the Executive Operations & Restock Hub.");
      } else {
        setLoginError("Invalid administrator passkey.");
        error("Access Denied", "Incorrect PIN code");
      }
    } catch {
      setLoginError("Verification service unavailable.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickRestock = async (productId: number, sizeLabel: string, amount: number) => {
    if (amount <= 0 || isNaN(amount)) return;
    try {
      const res = await restockProduct(productId, sizeLabel, amount);
      if (res.success) {
        success("Stock Updated", res.message || `Added +${amount} to ${sizeLabel}`);
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === productId) {
              const updatedSizes = p.sizes.map((s) =>
                s.label === sizeLabel ? { ...s, stock: s.stock + amount } : s
              );
              return {
                ...p,
                sizes: updatedSizes,
                totalStock: updatedSizes.reduce((acc, s) => acc + s.stock, 0),
              };
            }
            return p;
          })
        );
        fetchInventoryLogs().then(setLogs).catch(() => {});
      }
    } catch (err: any) {
      error("Restock Failed", err.message || "Failed to update inventory");
    }
  };

  const handleBulkRestockProduct = async (product: Product, amountPerSize = 10) => {
    try {
      for (const size of product.sizes) {
        await restockProduct(product.id, size.label, amountPerSize);
      }
      success("Bulk Restock Complete", `Added +${amountPerSize} units to all sizes of ${product.name}`);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === product.id) {
            const updatedSizes = p.sizes.map((s) => ({ ...s, stock: s.stock + amountPerSize }));
            return {
              ...p,
              sizes: updatedSizes,
              totalStock: updatedSizes.reduce((acc, s) => acc + s.stock, 0),
            };
          }
          return p;
        })
      );
      fetchInventoryLogs().then(setLogs).catch(() => {});
    } catch (err: any) {
      error("Bulk Restock Error", err.message);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        success("Order Updated", `Order status updated to "${newStatus.replace(/_/g, " ").toUpperCase()}"`);
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
        );
      }
    } catch (err: any) {
      error("Update Failed", err.message);
    }
  };

  const handleAdvanceOrder = async (order: Order) => {
    const currentIndex = ORDER_STAGES.findIndex((s) => s.key === order.status);
    if (currentIndex >= 0 && currentIndex < ORDER_STAGES.length - 1) {
      const nextStage = ORDER_STAGES[currentIndex + 1].key;
      await handleUpdateStatus(order.id, nextStage);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormBrand("APPARREL STUDIO");
    setFormCategory("tops");
    setFormSubCategory("Graphic Tees");
    setFormDescription("");
    setFormPriceCents(45000);
    setFormCompareAtCents(60000);
    setFormColorway("Washed Noir");
    setFormBadge("NEW DROP");
    setFormImages(["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000"]);
    setFormSizes([
      { label: "S", stock: 15 },
      { label: "M", stock: 25 },
      { label: "L", stock: 20 },
      { label: "XL", stock: 10 },
    ]);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormBrand(product.brand);
    setFormCategory(product.category);
    setFormSubCategory(product.subCategory);
    setFormDescription(product.description);
    setFormPriceCents(product.priceCents);
    setFormCompareAtCents(product.compareAtCents);
    setFormColorway(product.colorway);
    setFormBadge(product.badge || "NEW DROP");
    setFormImages(product.images.length ? product.images : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000"]);
    setFormSizes(product.sizes.map((s) => ({ label: s.label, stock: s.stock })));
    setIsAddModalOpen(true);
  };

  const handleApplySizeTemplate = (cat: string) => {
    const template = CATEGORY_SIZE_TEMPLATES[cat] || ["Standard"];
    setFormSizes(template.map((label) => ({ label, stock: 15 })));
  };

  const handleAddSizeVariant = () => {
    setFormSizes([...formSizes, { label: `Variant ${formSizes.length + 1}`, stock: 10 }]);
  };

  const handleRemoveSizeVariant = (index: number) => {
    if (formSizes.length <= 1) return;
    setFormSizes(formSizes.filter((_, i) => i !== index));
  };

  const handleSizeVariantChange = (index: number, field: "label" | "stock", val: any) => {
    setFormSizes(
      formSizes.map((s, i) =>
        i === index
          ? { ...s, [field]: field === "stock" ? Number(val) || 0 : val }
          : s
      )
    );
  };

  const handleAddImage = () => {
    if (!formNewImageUrl.trim()) return;
    setFormImages([...formImages, formNewImageUrl.trim()]);
    setFormNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    if (formImages.length <= 1) return;
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      error("Validation Error", "Product title is required");
      return;
    }

    try {
      const payload = {
        name: formName,
        brand: formBrand,
        category: formCategory,
        subCategory: formSubCategory,
        description: formDescription,
        priceCents: Number(formPriceCents),
        compareAtCents: formCompareAtCents ? Number(formCompareAtCents) : undefined,
        images: formImages.length ? formImages : ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000"],
        colorway: formColorway,
        badge: formBadge,
        sizes: formSizes.map((s) => ({ label: s.label, stock: Number(s.stock) || 0 })),
      };

      if (editingProduct) {
        await saveProduct(payload, true, editingProduct.id);
        success("Product Updated", `${formName} saved successfully.`);
      } else {
        await saveProduct(payload, false);
        success("Product Created", `${formName} is now live in store catalog.`);
      }

      setIsAddModalOpen(false);
      setEditingProduct(null);
      loadAllAdminData();
    } catch (err: any) {
      error("Save Failed", err.message);
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name} from the catalog?`)) return;
    try {
      await deleteProduct(id);
      success("Product Removed", `${name} was deleted.`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      error("Delete Failed", err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("apparrel_admin_auth");
    localStorage.removeItem("apparrel_admin_token");
    setIsAuthenticated(false);
    info("Locked", "Admin session safely locked.");
  };

  // Compute live executive metrics
  const totalStockUnits = products.reduce((acc, p) => acc + p.totalStock, 0);
  const totalValuationCents = products.reduce((acc, p) => acc + p.priceCents * p.totalStock, 0);
  const criticalStockItems = products.filter((p) => p.sizes.some((s) => s.stock <= 5));
  const lowStockCount = criticalStockItems.length;

  // If not authenticated, render luxury lock screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#fafafa] animate-fadeIn">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6 relative overflow-hidden text-slate-900">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-950 text-amber-400 shadow-xl mb-2">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-700 uppercase bg-slate-100 px-3 py-1 rounded-full border border-slate-200 inline-block">
              Operations Protected
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-950">
              Atelier Executive Vault
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Secure operations dashboard for 1-click inventory restocking, live courier dispatch, and product drops.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
                Secret Passkey / PIN
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="Enter administrator passkey"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono transition-all"
                />
              </div>
              {loginError && (
                <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginLoading || !loginPin}
              className="w-full py-3.5 bg-slate-950 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loginLoading ? "Authenticating..." : "Unlock Operations Hub"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Bypass for Instant Testing */}
          <div className="pt-4 border-t border-slate-100 text-center space-y-3">
            <span className="text-[11px] text-slate-500 block">
              Local testing or review session?
            </span>
            <button
              type="button"
              onClick={() => handleLoginSubmit(undefined, "apparrel2026")}
              className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>⚡ Instant Manager Access (Auto-PIN)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter products for Restock and Catalog tabs
  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
    if (stockHealthFilter === "critical") {
      if (!p.sizes.some((s) => s.stock <= 5)) return false;
    } else if (stockHealthFilter === "low") {
      if (!p.sizes.some((s) => s.stock <= 15)) return false;
    } else if (stockHealthFilter === "healthy") {
      if (p.sizes.some((s) => s.stock <= 15)) return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 text-slate-900 animate-fadeIn">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                Atelier Executive Matrix • Node Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-950">
              Inventory Restock & Order Dispatch Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time stock management, variant restockers, and courier routing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-slate-950 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-black transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Product Drop</span>
            </button>

            <button
              onClick={loadAllAdminData}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-colors flex items-center gap-1.5 text-xs font-mono font-semibold"
              title="Sync & Refresh catalog"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-500" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
              title="Lock Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Active Drops
            </span>
            <span className="text-xl sm:text-2xl font-black font-heading text-slate-950 mt-0.5 block">
              {products.length} Items
            </span>
            <span className="text-[10px] text-emerald-600 font-mono font-semibold">5 Departments</span>
          </div>

          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Total In-Stock Units
            </span>
            <span className="text-xl sm:text-2xl font-black font-heading text-slate-950 mt-0.5 block">
              {totalStockUnits} Units
            </span>
            <span className="text-[10px] text-slate-500 font-mono">All Size Variants</span>
          </div>

          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Stock Valuation
            </span>
            <span className="text-xl sm:text-2xl font-black font-heading text-slate-950 mt-0.5 block truncate">
              {formatPrice(totalValuationCents)}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Retail Value</span>
          </div>

          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Restock Attention
            </span>
            <span className={`text-xl sm:text-2xl font-black font-heading mt-0.5 block ${lowStockCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {lowStockCount} Low Variants
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {lowStockCount > 0 ? "Action Required" : "All Healthy"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          {
            id: "restock",
            label: "1-Click Restock Matrix",
            icon: RefreshCw,
            badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
            badgeColor: "bg-rose-100 text-rose-800 font-bold",
          },
          {
            id: "products",
            label: `Catalog Drops (${products.length})`,
            icon: Package,
          },
          {
            id: "orders",
            label: `Orders & Dispatch (${orders.length})`,
            icon: Truck,
            badge: orders.filter((o) => o.status !== "delivered").length ? `${orders.filter((o) => o.status !== "delivered").length} active` : undefined,
            badgeColor: "bg-amber-100 text-amber-800 font-bold",
          },
          {
            id: "analytics",
            label: "Financial Analytics",
            icon: TrendingUp,
          },
          {
            id: "logs",
            label: `Audit Logs (${logs.length})`,
            icon: History,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all shrink-0 ${
                active
                  ? "bg-slate-950 text-white font-bold shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 1-CLICK RESTOCK MATRIX */}
      {/* ========================================================================= */}
      {activeTab === "restock" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search SKU, title, or brand..."
                className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Department:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="all">All Departments ({products.length})</option>
                  <option value="tops">Tops & Shirts</option>
                  <option value="sneakers">Sneakers & Footwear</option>
                  <option value="perfumes">Perfumes & Fragrances</option>
                  <option value="watches">Watches & Timepieces</option>
                  <option value="body-sprays">Body Sprays & Grooming</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Health:</span>
                <select
                  value={stockHealthFilter}
                  onChange={(e) => setStockHealthFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="all">All Stock Levels</option>
                  <option value="critical">Critical (&le; 5 units)</option>
                  <option value="low">Low (&le; 15 units)</option>
                  <option value="healthy">Healthy (&gt; 15 units)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Restock Grid Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProducts.map((product) => {
              return (
                <div
                  key={product.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                          {product.brand} • {product.sku}
                        </span>
                        <h3 className="text-sm font-bold text-slate-950 truncate font-heading">
                          {product.name}
                        </h3>
                        <p className="text-xs font-mono text-slate-600">
                          {formatPrice(product.priceCents)} • {product.totalStock} total units
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBulkRestockProduct(product, 10)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 text-xs font-mono font-bold uppercase tracking-wider transition-colors shrink-0"
                      title="Add +10 to all sizes"
                    >
                      +10 All Sizes
                    </button>
                  </div>

                  {/* Size Variants Matrix */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Size Variants & Instant Incrementers
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {product.sizes.map((sz) => {
                        const isLow = sz.stock <= 5;
                        return (
                          <div
                            key={sz.label}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">{sz.label}</span>
                              <span
                                className={`text-[10px] font-mono ${
                                  isLow ? "text-rose-600 font-bold" : "text-slate-500"
                                }`}
                              >
                                {sz.stock} in stock {isLow && "⚠️"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleQuickRestock(product.id, sz.label, 5)}
                                className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-900 border border-slate-200 rounded text-[10px] font-mono font-bold"
                                title="Add +5"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickRestock(product.id, sz.label, 15)}
                                className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-900 border border-slate-200 rounded text-[10px] font-mono font-bold"
                                title="Add +15"
                              >
                                +15
                              </button>
                              <button
                                onClick={() => handleQuickRestock(product.id, sz.label, 50)}
                                className="px-2 py-1 bg-slate-900 hover:bg-black text-white rounded text-[10px] font-mono font-bold"
                                title="Add +50"
                              >
                                +50
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CATALOG DROPS */}
      {/* ========================================================================= */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h3 className="text-lg font-black font-heading text-slate-950">Full Store Catalog ({products.length})</h3>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-slate-950 text-white font-bold text-xs font-mono uppercase rounded-xl hover:bg-black transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product Drop</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3 relative group"
              >
                <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                    {p.category.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">{p.brand}</span>
                  <h4 className="text-sm font-bold text-slate-950 truncate font-heading">{p.name}</h4>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-1">{formatPrice(p.priceCents)}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">{p.totalStock} units across {p.sizes.length} sizes</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-950 hover:bg-slate-200"
                      title="Edit Product"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.name)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORDERS & DISPATCH */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <h3 className="text-lg font-black font-heading text-slate-950">Live Courier & Order Dispatch Queue</h3>
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-mono text-slate-900 font-bold">{ord.orderNo}</span>
                    <h4 className="text-sm font-bold text-slate-950 font-heading">{ord.customerName} ({ord.phone})</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-900">{formatPrice(ord.totalCents)}</span>
                    <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200">
                      {ord.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 font-mono">
                  <p>Destination: {ord.address}, {ord.city} ({ord.region})</p>
                  <p>Items: {ord.items.map((i) => `${i.qty}x ${i.name} (${i.sizeLabel})`).join(", ")}</p>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-500">Tracking: {ord.trackingCode}</span>
                  {ord.status !== "delivered" && (
                    <button
                      onClick={() => handleAdvanceOrder(ord)}
                      className="px-4 py-2 bg-slate-950 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-black transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Advance Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FINANCIAL ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Gross Verified Revenue</span>
              <h3 className="text-3xl font-black font-heading text-slate-950">{formatPrice(analytics?.totalRevenueCents || 489000)}</h3>
              <p className="text-xs text-emerald-600 font-mono font-bold">+32% Drop Performance</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Total Orders</span>
              <h3 className="text-3xl font-black font-heading text-slate-950">{orders.length}</h3>
              <p className="text-xs text-slate-500 font-mono">100% Paystack Authenticated</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Units Dispatched</span>
              <h3 className="text-3xl font-black font-heading text-slate-950">{analytics?.totalUnitsSold || 24}</h3>
              <p className="text-xs text-slate-500 font-mono">Across 5 departments</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-mono text-slate-500 uppercase font-bold">Vault Inventory Valuation</span>
              <h3 className="text-3xl font-black font-heading text-slate-950">{formatPrice(totalValuationCents)}</h3>
              <p className="text-xs text-slate-500 font-mono">{totalStockUnits} total units in stock</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === "logs" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono mb-4">Stock Movement Audit Trail</h3>
          <table className="w-full text-left font-mono text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <th className="py-3">Timestamp</th>
                <th className="py-3">Product</th>
                <th className="py-3">Variant</th>
                <th className="py-3">Delta</th>
                <th className="py-3">New Total</th>
                <th className="py-3">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="py-3 text-slate-500">{formatDateTime(l.createdAt)}</td>
                  <td className="py-3 text-slate-950 font-bold">{l.productName}</td>
                  <td className="py-3 font-semibold">{l.sizeLabel}</td>
                  <td className="py-3 text-emerald-600 font-bold">+{l.changeQty}</td>
                  <td className="py-3 font-bold">{l.newStock}</td>
                  <td className="py-3 text-slate-600">{l.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT PRODUCT MODAL (HIGH-TIER STRUCTURED BUILDER) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-950">
                  {editingProduct ? "Edit Luxury Product Drop" : "Create New Luxury Product Drop"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure titles, department templates, images, and individual variant stock.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* Basic Details */}
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-3 font-bold">
                  1. General Specification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Heavyweight Boxy Noir Tee"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Studio *</label>
                    <input
                      type="text"
                      required
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      placeholder="e.g. APPARREL ATELIER"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        setFormCategory(e.target.value);
                        handleApplySizeTemplate(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="tops">Tops & Shirts</option>
                      <option value="sneakers">Sneakers & Kicks</option>
                      <option value="perfumes">Perfumes & Extrait</option>
                      <option value="watches">Watches & Chronos</option>
                      <option value="body-sprays">Body Sprays & Mist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sub-Category</label>
                    <input
                      type="text"
                      value={formSubCategory}
                      onChange={(e) => setFormSubCategory(e.target.value)}
                      placeholder="e.g. 450 GSM Organic Cotton"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price (Pesewas / Cents) *</label>
                    <input
                      type="number"
                      required
                      value={formPriceCents}
                      onChange={(e) => setFormPriceCents(Number(e.target.value))}
                      placeholder="45000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                    />
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                      Equivalent: <strong className="text-slate-950">{formatPrice(formPriceCents)}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Badge / Tag</label>
                    <select
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="NEW DROP">NEW DROP</option>
                      <option value="EXCLUSIVE">EXCLUSIVE</option>
                      <option value="LIMITED RESTOCK">LIMITED RESTOCK</option>
                      <option value="VIP ONLY">VIP ONLY</option>
                      <option value="ARCHIVE">ARCHIVE</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Craftsmanship</label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe tailoring, textiles, and design philosophy..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Interactive Size Variant Builder */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      2. Size Variants & Initial Stock
                    </span>
                    <p className="text-xs text-slate-500">Add or adjust sizes and set exact opening inventory.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSizeVariant}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 text-xs font-mono uppercase font-bold"
                  >
                    + Add Size
                  </button>
                </div>

                <div className="space-y-2">
                  {formSizes.map((sz, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={sz.label}
                          onChange={(e) => handleSizeVariantChange(idx, "label", e.target.value)}
                          placeholder="Size (e.g. M, US 10)"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          value={sz.stock}
                          onChange={(e) => handleSizeVariantChange(idx, "stock", e.target.value)}
                          placeholder="Stock"
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-mono font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSizeVariant(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Manager & Presets */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 font-bold">
                  3. Image Gallery & 1-Click Luxury Presets
                </span>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={formNewImageUrl}
                    onChange={(e) => setFormNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...)"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2.5 bg-slate-950 text-white text-xs font-mono uppercase font-bold rounded-xl hover:bg-black"
                  >
                    Add Image
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="flex flex-wrap gap-3 mb-4">
                  {formImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden group shadow-sm">
                      <img src={img} alt="Product" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-md bg-black/80 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 1-Click Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFormImages([preset.url]);
                        setFormCategory(preset.cat);
                        handleApplySizeTemplate(preset.cat);
                      }}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-[10px] font-mono font-semibold text-slate-700"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Actions */}
              <div className="pt-5 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-xs font-bold font-mono uppercase text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-950 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-black transition-colors shadow-lg"
                >
                  {editingProduct ? "Save Product Changes" : "Publish Product Drop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
