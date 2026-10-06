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
  Store,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";

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
  const { formatPrice } = useCurrency();
  const { isAuthenticated, openAuthModal } = useAuth();

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
                Marketplace Bag ({cart.reduce((s, i) => s + i.qty, 0)})
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
                    Explore curated drops across Footwear, Horology, Streetwear, Audio Tech, and Luxury Leather.
                  </p>
                </div>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="inline-block btn-primary text-xs py-2.5 px-6"
                >
                  Explore Marketplace
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.productId}-${item.sizeLabel}`}
                  className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-white border border-slate-200/80 shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
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

                      {/* Seller Tag */}
                      {item.sellerStore && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium mt-0.5">
                          <Store className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{item.sellerStore}</span>
                        </div>
                      )}

                      <div className="inline-block text-[10px] font-semibold bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded-md mt-1">
                        Size / Spec: {item.sizeLabel}
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

          {/* Footer with Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-white space-y-4">
              {/* Promo Code Input */}
              {promoCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-medium">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Promo Applied: <strong className="font-mono">{promoCode}</strong> (-10%)</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (e.g. VIP10)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-slate-950"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Calculation Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatPrice(subtotalCents)}
                  </span>
                </div>

                {discountCents > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Marketplace Discount</span>
                    <span className="font-mono">-{formatPrice(discountCents)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Express Courier Dispatch</span>
                  <span className="font-mono font-medium text-slate-900">
                    {shippingCents === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-[10px]">FREE</span>
                    ) : (
                      formatPrice(shippingCents)
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-extrabold text-slate-950">
                  <span>Total Due</span>
                  <span className="font-mono">{formatPrice(totalCents)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              {isAuthenticated ? (
                <button
                  onClick={openCheckout}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-bold shadow-md shadow-slate-950/10"
                >
                  <span>Proceed to Paystack Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      closeCart();
                      openAuthModal("login");
                    }}
                    className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 text-xs font-bold shadow-md shadow-slate-950/10"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Sign In to Complete Purchase</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-center text-slate-500 font-medium">
                    New to Cyybrid? You can create a VIP account in 15 seconds.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  MoMo & Card Split Settlement
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  Cyybrid Guaranteed Authentic
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
