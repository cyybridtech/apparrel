import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eur } from "@/lib/format";
import type { OrderWithItems, ProductWithSizes } from "@/lib/types";
import { useStore } from "@/lib/store";
import {
  IconArrow,
  IconCheck,
  IconPlus,
  IconSearch,
  IconTrash,
  IconX,
} from "@/components/icons";

type AdminTab = "products" | "orders" | "analytics";

interface AnalyticsData {
  totalRevenueCents: number;
  totalOrders: number;
  totalProducts: number;
  lowStockSizes: number;
}

export function AdminPage() {
  const { toast } = useStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("products");
  const [products, setProducts] = useState<ProductWithSizes[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  // Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithSizes | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    brand: string;
    productType: "footwear" | "tops";
    category: string;
    colorway: string;
    description: string;
    image: string;
    priceGhs: string;
    compareAtGhs: string;
    weightGrams: string;
    terrain: string;
    accent: string;
    stockMap: Record<number, number>;
  }>({
    name: "",
    brand: "",
    productType: "footwear",
    category: "Road",
    colorway: "",
    description: "",
    image: "",
    priceGhs: "",
    compareAtGhs: "",
    weightGrams: "280",
    terrain: "Street",
    accent: "#00f0ff",
    stockMap: { 36: 5, 37: 5, 38: 5, 39: 5, 40: 5, 41: 5, 42: 5, 43: 5, 44: 5, 45: 5, 46: 5 },
  });

  const fetchData = async () => {
    try {
      const [resProd, resOrd, resAna] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/admin/analytics"),
      ]);

      if (resProd.ok) {
        const d = await resProd.json();
        setProducts(d.products || []);
      }
      if (resOrd.ok) {
        const d = await resOrd.json();
        setOrders(d.orders || []);
      }
      if (resAna.ok) {
        const d = await resAna.json();
        setAnalytics(d);
      }
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "",
      productType: "footwear",
      category: "Road",
      colorway: "",
      description: "",
      image: "",
      priceGhs: "",
      compareAtGhs: "",
      weightGrams: "280",
      terrain: "Street",
      accent: "#00f0ff",
      stockMap: { 36: 5, 37: 5, 38: 5, 39: 5, 40: 5, 41: 5, 42: 5, 43: 5, 44: 5, 45: 5, 46: 5 },
    });
    setImageInputKey((key) => key + 1);
    setFileError(null);
  };

  const openEditModal = (p: ProductWithSizes) => {
    setEditingProduct(p);
    const stockObj: Record<number, number> = {};
    p.sizes.forEach((s) => { stockObj[s.eu] = s.stock; });
    setFormData({
      name: p.name,
      brand: p.brand,
      productType: (p as any).productType ?? "footwear",
      category: p.category,
      colorway: p.colorway,
      description: p.description,
      image: p.image,
      priceGhs: (p.priceCents / 100).toString(),
      compareAtGhs: p.compareAtCents ? (p.compareAtCents / 100).toString() : "",
      weightGrams: p.weightGrams.toString(),
      terrain: p.terrain,
      accent: p.accent || "#00f0ff",
      stockMap: stockObj,
    });
    setImageInputKey((key) => key + 1);
    setFileError(null);
    setIsAddModalOpen(true);
  };

  const handleSetFeatured = async (id: number, featured: boolean) => {
    const targetProd = products.find((p) => p.id === id);

    if (featured && targetProd) {
      localStorage.setItem("kicks_hero_slug", targetProd.slug);
      localStorage.setItem("kicks_hero_product", JSON.stringify(targetProd));
    } else {
      localStorage.removeItem("kicks_hero_slug");
      localStorage.removeItem("kicks_hero_product");
    }

    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        isFeatured: p.id === id ? featured : false,
      }))
    );

    try {
      const res = await fetch(`/api/admin/products/${id}/featured`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured, slug: targetProd?.slug }),
      });

      toast(
        featured
          ? `★ "${targetProd?.name || 'Product'}" set as active Hero Drop!`
          : `Removed "${targetProd?.name || 'Product'}" from Hero Drop.`,
        "ok"
      );
      fetchData();
    } catch (err) {
      console.error(err);
      toast(
        featured
          ? `★ "${targetProd?.name || 'Product'}" set as active Hero Drop!`
          : `Removed "${targetProd?.name || 'Product'}" from Hero Drop.`,
        "ok"
      );
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceCents = Math.round(parseFloat(formData.priceGhs) * 100);
    const compareAtCents = formData.compareAtGhs
      ? Math.round(parseFloat(formData.compareAtGhs) * 100)
      : null;

    const payload = {
      name: formData.name,
      brand: formData.brand,
      productType: formData.productType,
      category: formData.category,
      colorway: formData.colorway || formData.brand,
      description: formData.description,
      image: formData.image,
      accent: formData.accent,
      priceCents,
      compareAtCents,
      weightGrams: parseInt(formData.weightGrams) || 280,
      terrain: formData.terrain,
      stockMap: formData.stockMap,
    };

    try {
      let res;
      if (editingProduct) {
        res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsAddModalOpen(false);
        resetForm();
        fetchData();
      } else {
        alert("Failed to save footwear product. Please check form fields.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving footwear product.");
    }
  };

  const handleDeleteProduct = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}" from KICKS GHANA catalog?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    setStatusUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 pb-20">
      {/* Admin Top Banner */}
      <div className="border-b border-[#1b2438] bg-[#0e131f]/90 backdrop-blur-md px-6 py-6 sticky top-0 z-30">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#7000ff] text-black font-black text-xl shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              K
            </div>
            <div>
              <h1 className="font-display text-2xl tracking-wider text-white uppercase flex items-center gap-2">
                KICKS GHANA <span className="rounded bg-[#00f0ff]/10 px-2 py-0.5 text-xs text-[#00f0ff] font-sans font-semibold uppercase tracking-widest border border-[#00f0ff]/30">Admin Control</span>
              </h1>
              <p className="text-xs text-gray-400">Footwear Inventory & Fulfillment Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="btn-cyan flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold uppercase tracking-wider"
            >
              <IconPlus width={16} height={16} /> Add New Item
            </button>
            <Link
              to="/"
              className="rounded-lg border border-[#1b2438] bg-[#151c2e] px-4 py-2.5 text-xs text-gray-300 hover:text-white transition-all hover:border-[#00f0ff]/40"
            >
              View Storefront →
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8">
        {/* Metric Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="glass-panel-glow rounded-xl p-5">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Total Store Sales</span>
              <div className="mt-2 text-2xl font-black font-display text-[#00f0ff]">
                {eur(analytics.totalRevenueCents)}
              </div>
              <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
                <span>↑ Live Customer Orders</span>
              </div>
            </div>

            <div className="glass-panel rounded-xl p-5">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Total Orders</span>
              <div className="mt-2 text-2xl font-black font-display text-white">
                {analytics.totalOrders}
              </div>
              <div className="mt-1 text-[11px] text-gray-400">Order fulfillments logged</div>
            </div>

            <div className="glass-panel rounded-xl p-5">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Active Kicks Catalog</span>
              <div className="mt-2 text-2xl font-black font-display text-[#ffb800]">
                {analytics.totalProducts} Shoes
              </div>
              <div className="mt-1 text-[11px] text-gray-400">Across 6 footwear categories</div>
            </div>

            <div className="glass-panel rounded-xl p-5">
              <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Low Stock Sizes</span>
              <div className="mt-2 text-2xl font-black font-display text-rose-400">
                {analytics.lowStockSizes} Alert Sizes
              </div>
              <div className="mt-1 text-[11px] text-rose-300/80">Require restocking</div>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-[#1b2438] mb-6">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-display text-base tracking-wider uppercase transition-all border-b-2 ${
              activeTab === "products"
                ? "border-[#00f0ff] text-[#00f0ff]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-display text-base tracking-wider uppercase transition-all border-b-2 ${
              activeTab === "orders"
                ? "border-[#00f0ff] text-[#00f0ff]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Orders & Shipping ({orders.length})
          </button>
        </div>

        {/* ================= TAB 1: PRODUCTS INVENTORY ================= */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 glass-panel rounded-xl p-4">
              <div className="relative flex-1 min-w-[280px]">
                <IconSearch width={16} height={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search kicks by name, brand or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              <div className="text-xs text-gray-400">
                Showing <span className="text-white font-semibold">{filteredProducts.length}</span> of {products.length} items
              </div>
            </div>

            {/* Products Table */}
            <div className="glass-panel rounded-xl overflow-hidden border border-[#1b2438]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#151c2e] text-xs uppercase tracking-wider text-gray-400 border-b border-[#1b2438]">
                    <tr>
                      <th className="px-6 py-4">Item</th>
                      <th className="px-6 py-4">Brand / Cat</th>
                      <th className="px-6 py-4">Price (GH₵)</th>
                      <th className="px-6 py-4">Sizes & Stock</th>
                      <th className="px-6 py-4">Hero Drop</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2438]">
                    {filteredProducts.map((p) => {
                      const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
                      const isFeatured = (p as any).isFeatured;
                      const pType = (p as any).productType ?? "footwear";
                      const CLOTHING_MAP: Record<number, string> = {1:"XS",2:"S",3:"M",4:"L",5:"XL",6:"XXL"};
                      return (
                        <tr key={p.id} className={`hover:bg-[#151c2e]/50 transition-colors ${isFeatured ? "bg-[#00f0ff]/5 ring-1 ring-inset ring-[#00f0ff]/20" : ""}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg object-cover bg-black border border-[#1b2438]" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white font-display text-base tracking-wide">{p.name}</span>
                                  {isFeatured && (
                                    <span className="rounded-full bg-[#00f0ff] px-2 py-0.5 text-[9px] font-black text-black uppercase tracking-widest">★ HERO DROP</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">{p.colorway} • {pType === "tops" ? "Apparel" : p.terrain}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-block rounded bg-[#00f0ff]/10 px-2 py-0.5 text-xs text-[#00f0ff] font-semibold uppercase tracking-wider border border-[#00f0ff]/20">
                              {p.brand}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">{p.category}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">{pType}</div>
                          </td>

                          <td className="px-6 py-4 font-bold text-white font-display text-base">
                            {eur(p.priceCents)}
                            {p.compareAtCents && (
                              <><br/><span className="text-xs text-gray-500 line-through font-normal">{eur(p.compareAtCents)}</span>
                              <span className="ml-1 text-xs text-[#ff3b5c] font-bold">
                                −{Math.round(((p.compareAtCents - p.priceCents) / p.compareAtCents) * 100)}%
                              </span></>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {p.sizes.map((s) => {
                                const label = pType === "tops" ? CLOTHING_MAP[s.eu] : `EU${s.eu}`;
                                return (
                                  <span key={s.eu} className={`px-1.5 py-0.5 text-[10px] rounded border font-mono ${
                                    s.stock === 0 ? "bg-rose-950/40 text-rose-400 border-rose-800/40"
                                    : s.stock < 3 ? "bg-amber-950/40 text-amber-400 border-amber-800/40"
                                    : "bg-[#07090e] text-gray-300 border-[#1b2438]"}`}>
                                    {label}:{s.stock}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="text-[11px] text-gray-400 mt-1">Stock: <span className="text-white font-semibold">{totalStock}</span></div>
                          </td>

                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleSetFeatured(p.id, !isFeatured)}
                              title={isFeatured ? "Remove from hero showcase" : "Set as hero rotating showcase"}
                              className={`w-full rounded-lg px-3 py-2 text-[10px] font-black tracking-wider uppercase transition-all ${
                                isFeatured
                                  ? "bg-[#00f0ff] text-black shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                                  : "border border-[#1b2438] text-gray-400 hover:border-[#00f0ff]/50 hover:text-[#00f0ff]"
                              }`}
                            >
                              {isFeatured ? "★ Active" : "Set Hero"}
                            </button>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEditModal(p)} className="rounded px-3 py-1.5 text-xs font-semibold text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 hover:bg-[#00f0ff] hover:text-black transition-all">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id, p.name)} className="rounded p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                                <IconTrash width={16} height={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDERS & FULFILLMENT ================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="glass-panel rounded-xl overflow-hidden border border-[#1b2438]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#151c2e] text-xs uppercase tracking-wider text-gray-400 border-b border-[#1b2438]">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Items Ordered</th>
                      <th className="px-6 py-4">Total (GH₵)</th>
                      <th className="px-6 py-4">Fulfillment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2438]">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#151c2e]/50 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-[#00f0ff]">
                            {o.orderNo}
                            <div className="text-xs font-sans text-gray-400 font-normal">
                              {new Date(o.createdAt).toLocaleDateString("en-GH", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-semibold text-white">{o.customerName}</div>
                            <div className="text-xs text-gray-400">{o.email}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {o.address}, {o.city}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {o.items.map((it) => (
                                <div key={it.id} className="text-xs text-gray-300 flex items-center gap-2">
                                  <span className="font-bold text-[#00f0ff]">{it.qty}x</span>
                                  <span>{it.name} (EU {it.eu})</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          <td className="px-6 py-4 font-bold text-white font-display text-base">
                            {eur(o.totalCents)}
                          </td>

                          <td className="px-6 py-4">
                            <select
                              value={o.status}
                              disabled={statusUpdatingId === o.id}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              className={`rounded px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-[#07090e] border focus:outline-none ${
                                o.status === "delivered"
                                  ? "text-emerald-400 border-emerald-800/60"
                                  : o.status === "shipped"
                                  ? "text-[#00f0ff] border-[#00f0ff]/60"
                                  : "text-amber-400 border-amber-800/60"
                              }`}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT FOOTWEAR ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="glass-panel-glow w-full max-w-3xl rounded-2xl border border-[#00f0ff]/30 p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#1b2438] pb-4">
              <h2 className="font-display text-2xl text-white uppercase tracking-wider flex items-center gap-2">
                {editingProduct ? "Edit Footwear" : "Insert New Footwear Drop"}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded p-1 text-gray-400 hover:text-white"
              >
                <IconX width={20} height={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-6 space-y-6">
              {/* Image Preview & URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#1b2438] rounded-xl p-3 bg-[#07090e] h-44">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLElement).setAttribute(
                          "src",
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
                        );
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-500 text-center">Image Preview</span>
                  )}
                </div>

                <div className="md:col-span-2 space-y-4">
                  {/* Product Type Selector */}
                  <div className="flex gap-3">
                    {(["footwear", "tops"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          const defaultCat = type === "tops" ? "Shirts" : "Road";
                          const stockMap = type === "tops"
                            ? ({1:5,2:5,3:5,4:5,5:5,6:5} as Record<number, number>)
                            : ({36:5,37:5,38:5,39:5,40:5,41:5,42:5,43:5,44:5,45:5,46:5} as Record<number, number>);
                          setFormData({ ...formData, productType: type, category: defaultCat, stockMap });
                        }}
                        className={`flex-1 rounded-lg border py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
                          formData.productType === type
                            ? "bg-[#00f0ff] text-black border-[#00f0ff]"
                            : "border-[#1b2438] text-gray-400 hover:border-[#00f0ff]/40"
                        }`}
                      >
                        {type === "footwear" ? "👟 Footwear" : "👕 Tops / Apparel"}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Select Product Image *</label>
                    <input
                      key={imageInputKey}
                      type="file"
                      accept="image/*"
                      required={!formData.image}
                      onChange={(e) => {
                        setFileError(null);
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith("image/")) {
                          setFileError("Please select a valid image file.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            setFormData({ ...formData, image: reader.result });
                          }
                        };
                        reader.onerror = () => {
                          console.error("Failed to read selected image file.");
                          setFileError("Unable to load the selected image. Please choose a different file.");
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-[#1b2438] file:px-3 file:py-2 file:text-sm file:text-white file:shadow-none focus:border-[#00f0ff] focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Choose an image file from your device. The selected image will preview above.
                    </p>
                    {fileError ? (
                      <p className="text-[11px] text-red-400 mt-1">{fileError}</p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Item Name *
                      </label>
                      <input type="text" required placeholder={formData.productType === "tops" ? "e.g. Club Tee Black" : "e.g. Voltage Runner Pro"}
                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                        Brand *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KICKS, AXIOM, KOVA"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category, Colorway, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none">
                    {formData.productType === "tops" ? (
                      <>
                        <option value="Shirts">Shirts</option>
                        <option value="Club T-Shirts">Club T-Shirts</option>
                        <option value="Designer Shirts">Designer Shirts</option>
                        <option value="Long Sleeves">Long Sleeves</option>
                        <option value="Hoodies">Hoodies</option>
                        <option value="Jerseys">Jerseys</option>
                      </>
                    ) : (
                      <>
                        <option value="Road">Road Running</option>
                        <option value="Court">Court / Basketball</option>
                        <option value="Skate">Skate / Street</option>
                        <option value="Lifestyle">Lifestyle</option>
                        <option value="Trail">Trail / Outdoor</option>
                        <option value="Boots">Leather Boots</option>
                        <option value="Sandals">Sandals / Slides</option>
                        <option value="Turf">Turf / Football</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Price in Ghana Cedis (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1450"
                    value={formData.priceGhs}
                    onChange={(e) => setFormData({ ...formData, priceGhs: e.target.value })}
                    className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none font-bold text-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Compare Price (GH₵)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1800"
                    value={formData.compareAtGhs}
                    onChange={(e) => setFormData({ ...formData, compareAtGhs: e.target.value })}
                    className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
              </div>

              {/* Colorway & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Colorway
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ink / Electric Cyan"
                    value={formData.colorway}
                    onChange={(e) => setFormData({ ...formData, colorway: e.target.value })}
                    className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Weight (grams)
                  </label>
                  <input
                    type="number"
                    placeholder="280"
                    value={formData.weightGrams}
                    onChange={(e) => setFormData({ ...formData, weightGrams: e.target.value })}
                    className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    Terrain Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Road, Court, Street"
                    value={formData.terrain}
                    onChange={(e) => setFormData({ ...formData, terrain: e.target.value })}
                    className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Footwear description and performance features..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg bg-[#07090e] border border-[#1b2438] px-3.5 py-2 text-sm text-white focus:border-[#00f0ff] focus:outline-none"
                />
              </div>

              {/* Per-Size Stock Inputs — adaptive for footwear vs tops */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                  {formData.productType === "tops" ? "Stock by Size (XS → XXL)" : "Stock by EU Size (36 → 46)"}
                </label>
                <div className={`grid gap-2 bg-[#07090e] border border-[#1b2438] rounded-xl p-3 ${
                  formData.productType === "tops" ? "grid-cols-6" : "grid-cols-4 sm:grid-cols-6 md:grid-cols-11"
                }`}>
                  {formData.productType === "tops"
                    ? ([1,2,3,4,5,6] as const).map((n) => {
                        const LABEL: Record<number,string> = {1:"XS",2:"S",3:"M",4:"L",5:"XL",6:"XXL"};
                        return (
                          <div key={n} className="text-center">
                            <span className="block text-[10px] text-gray-400 font-mono mb-1">{LABEL[n]}</span>
                            <input type="number" min="0" value={formData.stockMap[n] ?? 5}
                              onChange={(e) => setFormData({ ...formData, stockMap: { ...formData.stockMap, [n]: parseInt(e.target.value)||0 } })}
                              className="w-full rounded bg-[#151c2e] border border-[#1b2438] py-1 text-center text-xs font-bold text-[#00f0ff] focus:border-[#00f0ff] focus:outline-none" />
                          </div>
                        );
                      })
                    : Array.from({ length: 11 }, (_, i) => 36 + i).map((eu) => (
                        <div key={eu} className="text-center">
                          <span className="block text-[10px] text-gray-400 font-mono mb-1">EU {eu}</span>
                          <input type="number" min="0" value={formData.stockMap[eu] ?? 0}
                            onChange={(e) => setFormData({ ...formData, stockMap: { ...formData.stockMap, [eu]: parseInt(e.target.value)||0 } })}
                            className="w-full rounded bg-[#151c2e] border border-[#1b2438] py-1 text-center text-xs font-bold text-[#00f0ff] focus:border-[#00f0ff] focus:outline-none" />
                        </div>
                      ))
                  }
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#1b2438] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-[#1b2438] px-5 py-2.5 text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-cyan rounded-lg px-6 py-2.5 text-xs uppercase tracking-wider font-bold"
                >
                  {editingProduct ? "Save Changes" : "Create Drop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
