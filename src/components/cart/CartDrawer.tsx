import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Truck,
  Sparkles,
  Tag,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../lib/utils";

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotalCents,
    shippingCents,
    discountCents,
    totalCents,
    promoCode,
    applyPromoCode,
    removePromoCode,
    openCheckout,
    freeShippingThresholdCents,
  } = useCart();

  const [inputCode, setInputCode] = useState("");

  if (!isCartOpen) return null;

  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotalCents / freeShippingThresholdCents) * 100)
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThresholdCents - subtotalCents);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    if (applyPromoCode(inputCode)) {
      setInputCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-slate-950" />
              <h3 className="font-heading font-bold text-base text-slate-950">
                Your Shopping Bag ({cart.reduce((s, i) => s + i.qty, 0)})
              </h3>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <div className="flex items-center gap-1.5 text-slate-800">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>
                  {remainingForFreeShipping === 0
                    ? "Unlocked Free Express Delivery! 🚀"
                    : `Add ${formatPrice(remainingForFreeShipping)} for FREE Delivery`}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {progressToFreeShipping}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-base">
                    Your bag is empty
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Explore our latest drops across tops, sneakers, fragrances, and timepieces.
                  </p>
                </div>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="inline-block btn-primary text-xs py-2.5 px-6"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.sizeLabel}`}
                  className="flex gap-3.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-white border border-slate-200/80 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {item.brand}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId, item.sizeLabel)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                        {item.name}
                      </h4>
                      <div className="inline-block text-[10px] font-semibold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md mt-1">
                        Size: {item.sizeLabel}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.productId, item.sizeLabel, item.qty - 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-slate-900 font-mono">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.sizeLabel, item.qty + 1)}
                          className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-heading font-extrabold text-xs text-slate-950">
                        {formatPrice(item.unitPriceCents * item.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-4">
              {/* Promo code */}
              {promoCode ? (
                <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Promo Applied: {promoCode}</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder="Promo code (e.g. FIRST10)"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 uppercase font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatPrice(subtotalCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Dispatch</span>
                  <span className="font-semibold text-slate-900">
                    {shippingCents === 0 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      formatPrice(shippingCents)
                    )}
                  </span>
                </div>
                {discountCents > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-bold text-slate-950">
                  <span className="font-heading">Total Amount</span>
                  <span className="font-heading font-black">{formatPrice(totalCents)}</span>
                </div>
              </div>

              {/* Checkout Trigger Button */}
              <button
                onClick={openCheckout}
                className="w-full btn-primary text-xs py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay with Paystack • {formatPrice(totalCents)}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-bit Encrypted Paystack & Mobile Money Gateway</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
