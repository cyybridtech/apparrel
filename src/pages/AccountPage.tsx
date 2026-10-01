import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  LogOut,
  FileText,
  Printer,
  ChevronRight,
} from "lucide-react";
import { useAuth, UserAddress } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { fetchOrderByNumber, Order } from "../lib/api";
import { formatDateTime } from "../lib/utils";

export function AccountPage() {
  const { user, isAuthenticated, logout, openAuthModal, updateProfile, addAddress, removeAddress, setDefaultAddress } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "vip" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    recipientName: "",
    phone: "",
    street: "",
    city: "Accra",
    region: "Greater Accra",
    isDefault: false,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    // Load user orders
    setLoadingOrders(true);
    Promise.all([
      fetchOrderByNumber("ORD-92841").catch(() => null),
      fetchOrderByNumber("ORD-88412").catch(() => null),
    ])
      .then(([o1, o2]) => {
        const loaded = [o1, o2].filter(Boolean) as Order[];
        setOrders(loaded);
      })
      .finally(() => setLoadingOrders(false));
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 text-amber-400 flex items-center justify-center mx-auto shadow-xl">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold font-heading text-slate-950">
            Account Sign In Required
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Sign in to access your saved delivery addresses, order history, and exclusive VIP rewards.
          </p>
        </div>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => openAuthModal("login")}
            className="btn-primary text-xs py-3 px-6 rounded-2xl"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal("register")}
            className="btn-secondary text-xs py-3 px-6 rounded-2xl"
          >
            Join VIP Club
          </button>
        </div>
      </div>
    );
  }

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.recipientName || !newAddress.phone) return;
    addAddress(newAddress);
    setIsAddAddressOpen(false);
    setNewAddress({
      label: "Home",
      recipientName: "",
      phone: "",
      street: "",
      city: "Accra",
      region: "Greater Accra",
      isDefault: false,
    });
  };

  const printInvoice = (ord: Order) => {
    const printWin = window.open("", "_blank", "width=800,height=900");
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>Invoice #${ord.orderNo} - APPARREL</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
            .meta { font-size: 12px; color: #64748b; margin-top: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            .table th { text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; }
            .table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .totals { margin-top: 30px; margin-left: auto; width: 300px; font-size: 13px; }
            .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
            .total-row { font-size: 16px; font-weight: bold; border-top: 2px solid #0f172a; padding-top: 10px; margin-top: 10px; }
            .footer { margin-top: 60px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">APPARREL.</div>
              <div class="meta">Luxury Streetwear & Essentials • Accra, Ghana</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 18px;">OFFICIAL INVOICE</h2>
              <div class="meta">Order Ref: <strong>${ord.orderNo}</strong></div>
              <div class="meta">Date: ${new Date(ord.createdAt).toLocaleDateString()}</div>
              <div class="meta">Payment: <strong>VERIFIED (Paystack)</strong></div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 30px; font-size: 13px;">
            <div>
              <strong>Billed To:</strong><br />
              ${ord.customerName}<br />
              ${ord.phone}<br />
              ${ord.email}
            </div>
            <div style="text-align: right;">
              <strong>Delivery Destination:</strong><br />
              ${ord.address}<br />
              ${ord.city}, ${ord.region}
            </div>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Size / Option</th>
                <th>Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${ord.items.map(item => `
                <tr>
                  <td><strong>${item.name}</strong><br /><span style="color: #64748b; font-size: 11px;">${item.brand}</span></td>
                  <td>${item.sizeLabel}</td>
                  <td>${item.qty}</td>
                  <td style="text-align: right;">GH₵ ${(item.unitPriceCents * item.qty / 100).toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="totals">
            <div><span>Subtotal:</span> <span>GH₵ ${(ord.subtotalCents / 100).toFixed(2)}</span></div>
            <div><span>Delivery Dispatch:</span> <span>${ord.shippingCents === 0 ? "FREE" : "GH₵ " + (ord.shippingCents / 100).toFixed(2)}</span></div>
            ${ord.discountCents > 0 ? `<div><span>Discount:</span> <span>-GH₵ ${(ord.discountCents / 100).toFixed(2)}</span></div>` : ""}
            <div class="total-row"><span>Total Paid:</span> <span>GH₵ ${(ord.totalCents / 100).toFixed(2)}</span></div>
          </div>

          <div class="footer">
            Thank you for shopping with APPARREL. All items are authenticated and covered by our 7-day exchange guarantee.
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn pb-16">
      {/* Top Profile Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black text-2xl font-heading shadow-xl shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  {user.tier} MEMBER
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {user.points} VIP Points
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white mt-1">
                {user.name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">{user.email} • {user.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold flex items-center gap-2"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Loyalty Tier Progress */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              VIP Tier Status
            </span>
            <span className="text-lg font-black font-heading text-amber-400 mt-0.5 block">
              {user.tier}
            </span>
            <span className="text-[11px] text-slate-400">
              Unlocked Free Express Shipping & Early Drops
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Loyalty Rewards Points
            </span>
            <span className="text-lg font-black font-heading text-white mt-0.5 block">
              {user.points.toLocaleString()} PTS
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              Worth {formatPrice(user.points * 10)} in store credits
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Lifetime Catalog Spend
            </span>
            <span className="text-lg font-black font-heading text-white mt-0.5 block">
              {formatPrice(user.totalSpentCents)}
            </span>
            <span className="text-[11px] text-slate-400">
              {user.ordersCount} Completed Orders
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "orders", label: `Order History (${orders.length})`, icon: Package },
          { id: "addresses", label: `Saved Addresses (${user.addresses.length})`, icon: MapPin },
          { id: "vip", label: "VIP Club & Perks", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                active
                  ? "bg-slate-950 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ORDER HISTORY */}
      {/* ========================================================================= */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {loadingOrders ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading order history...</div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.orderNo}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {ord.orderNo}
                        </span>
                        <span className="text-xs font-bold capitalize text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{ord.status.replace(/_/g, " ")}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Placed on {formatDateTime(ord.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => printInvoice(ord)}
                        className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Invoice</span>
                      </button>
                      <Link
                        to={`/track?order=${ord.orderNo}`}
                        className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                      >
                        <span>Track Status</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {item.brand} • {item.sizeLabel}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-xs font-black font-heading text-slate-950 mt-0.5 block">
                            {formatPrice(item.unitPriceCents * item.qty)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer total */}
                  <div className="pt-2 flex justify-between items-center text-xs text-slate-500 border-t border-slate-100">
                    <span>Paid with {ord.paymentMethod.toUpperCase()} (Ref: {ord.paystackRef})</span>
                    <span className="font-heading font-black text-sm text-slate-950">
                      Total: {formatPrice(ord.totalCents)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-900 text-base font-heading">No Orders Placed Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore our current catalog drops to start earning VIP reward points.
              </p>
              <Link to="/shop" className="btn-primary text-xs py-2.5 px-6 rounded-full inline-block mt-2">
                Explore Catalog
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SAVED ADDRESSES */}
      {/* ========================================================================= */}
      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-heading text-slate-950">
                Delivery Addresses
              </h3>
              <p className="text-xs text-slate-500">
                Manage your saved addresses for instant 1-click checkout.
              </p>
            </div>

            <button
              onClick={() => setIsAddAddressOpen(true)}
              className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-6 rounded-3xl border transition-all ${
                  addr.isDefault
                    ? "bg-slate-50/80 border-slate-950 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Primary Default
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => removeAddress(addr.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p className="font-semibold text-slate-900">{addr.recipientName}</p>
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.region}</p>
                  <p className="text-slate-400 pt-1">{addr.phone}</p>
                </div>

                {!addr.isDefault && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs font-bold text-slate-950 hover:underline"
                    >
                      Set as Primary Address
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Address Modal */}
          {isAddAddressOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-heading font-bold text-base text-slate-950">
                    Add New Shipping Address
                  </h4>
                  <button
                    onClick={() => setIsAddAddressOpen(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleAddAddressSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Label (e.g. Home, Office)
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Street Address & Landmarks
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Region
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.region}
                        onChange={(e) => setNewAddress({ ...newAddress, region: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="isDefault" className="text-xs text-slate-700 font-semibold">
                      Set as primary default address
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary text-xs py-3 rounded-xl mt-3"
                  >
                    Save Address
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VIP CLUB & PERKS */}
      {/* ========================================================================= */}
      {activeTab === "vip" && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Exclusive Member Privileges
            </span>
            <h3 className="text-2xl font-black font-heading text-slate-950">
              Your NOIR VIP Benefits
            </h3>
            <p className="text-xs text-slate-500">
              As a top-tier customer, you receive personalized privileges across all global drops and private concierge services.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {[
              { title: "Free Priority Delivery", desc: "Zero delivery fees on all orders nationwide with priority dispatch." },
              { title: "Early Drop Access", desc: "Shop high-demand sneaker and perfume drops 2 hours before general release." },
              { title: "Private Concierge", desc: "Direct WhatsApp concierge support for styling guidance and size reserving." },
              { title: "Double Rewards Points", desc: "Earn 20 points for every GH₵ 1 spent, redeemable on future drops." },
            ].map((perk, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-xs">
                  ★
                </div>
                <h4 className="text-xs font-bold text-slate-900 font-heading">{perk.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
