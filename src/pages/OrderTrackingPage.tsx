import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
  ArrowRight,
  User,
  Sparkles,
  Phone,
  Mail,
} from "lucide-react";
import { fetchOrderByNumber, Order } from "../lib/api";
import { TrackingTimeline } from "../components/tracking/TrackingTimeline";
import { formatPrice, formatDateTime } from "../lib/utils";

export function OrderTrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrder = searchParams.get("order") || "ORD-92841";

  const [inputOrderNo, setInputOrderNo] = useState(initialOrder);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadOrder = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const ord = await fetchOrderByNumber(orderNum.trim());
      setOrder(ord);
    } catch (err: any) {
      setErrorMsg("No order found with that reference. Please check your order code (e.g. ORD-92841).");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      loadOrder(initialOrder);
    }
  }, [initialOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOrderNo) return;
    setSearchParams({ order: inputOrderNo });
    loadOrder(inputOrderNo);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Search & Lookup Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Order Fulfillment & Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-950">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Track your order as it progresses through payment confirmation, warehouse inspection, luxury packaging, and courier delivery.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex max-w-lg gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputOrderNo}
                onChange={(e) => setInputOrderNo(e.target.value)}
                placeholder="Enter Order # or Tracking Code (e.g. ORD-92841)"
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white uppercase font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs py-3 px-6 rounded-2xl shadow-md disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </form>

          {/* Quick Demo Testing Chips */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Test Orders:
            </span>
            {[
              { code: "ORD-92841", label: "ORD-92841 (In Transit)", statusColor: "text-emerald-700 bg-emerald-50 border-emerald-200" },
              { code: "ORD-88412", label: "ORD-88412 (Out for Delivery)", statusColor: "text-amber-700 bg-amber-50 border-amber-200" },
            ].map((demo) => (
              <button
                key={demo.code}
                type="button"
                onClick={() => {
                  setInputOrderNo(demo.code);
                  setSearchParams({ order: demo.code });
                  loadOrder(demo.code);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105 ${demo.statusColor}`}
              >
                {demo.label}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-600 font-semibold pt-1">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {order && (
        <div className="space-y-8">
          {/* Top Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Current Status
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-heading capitalize mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{order.status.replace(/_/g, " ")}</span>
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-900">
                <Package className="w-5 h-5" />
              </div>
            </div>

            {/* Estimated Arrival Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Estimated Delivery
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-heading mt-0.5">
                  {order.estimatedDelivery}
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* Order Date Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Order Date
                </span>
                <h4 className="text-xs font-semibold text-slate-900 mt-0.5">
                  {formatDateTime(order.createdAt)}
                </h4>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            {/* Paystack Reference Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Payment Status
                </span>
                <h4 className="text-xs font-mono font-bold text-slate-900 mt-0.5 line-clamp-1">
                  {order.paystackRef || "VERIFIED"}
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                  Payment Authorized
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Main Content: Progress Pipeline & Order Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Progress Pipeline (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <TrackingTimeline
                status={order.status}
                orderNo={order.orderNo}
                createdAt={order.createdAt}
              />

              {/* Delivery Destination Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    Recipient & Delivery Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Customer Contact
                    </span>
                    <p className="font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-slate-500 mt-0.5">{order.phone}</p>
                    <p className="text-slate-500">{order.email}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Delivery Address
                    </span>
                    <p className="font-bold text-slate-900">{order.address}</p>
                    <p className="text-slate-500 mt-0.5">{order.city}, {order.region}</p>
                    {order.deliveryNotes && (
                      <p className="text-slate-600 italic mt-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        Note: {order.deliveryNotes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Package Contents & Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    Package Items ({order.items.length})
                  </h4>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {order.orderNo}
                  </span>
                </div>

                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {item.brand} • {item.sizeLabel}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {item.name}
                        </h5>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>Qty: {item.qty}</span>
                          <span className="font-bold text-slate-900 font-heading">
                            {formatPrice(item.unitPriceCents * item.qty)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">{formatPrice(order.subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold text-emerald-600">
                      {order.shippingCents === 0 ? "FREE" : formatPrice(order.shippingCents)}
                    </span>
                  </div>
                  {order.discountCents > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discountCents)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-950">
                    <span>Total Paid</span>
                    <span className="font-heading font-black">{formatPrice(order.totalCents)}</span>
                  </div>
                </div>

                {/* Support CTA */}
                <div className="pt-2">
                  <a
                    href="mailto:support@apparrel.store"
                    className="w-full btn-secondary text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <span>Need Help with Order?</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
