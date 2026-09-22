import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, Star, ShoppingBag, Heart, ShieldCheck, Check, ArrowRight } from "lucide-react";
import { Product } from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [qty, setQty] = useState(1);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) return null;

  // Set default size if none selected
  const activeSize = selectedSize || (product.sizes[0]?.label ?? "");
  const currentSizeObj = product.sizes.find((s) => s.label === activeSize);
  const isOutOfStock = !currentSizeObj || currentSizeObj.stock <= 0;
  const isFavorited = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        sizeLabel: activeSize,
        image: product.images[selectedImg] || product.images[0],
        unitPriceCents: product.priceCents,
        sku: product.sku,
      },
      qty
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-slate-500 hover:text-slate-900 hover:bg-white shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Gallery (Left) */}
        <div className="md:w-1/2 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-inner">
            <img
              src={product.images[selectedImg] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImg === idx
                      ? "border-slate-950 ring-2 ring-slate-950/20 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details (Right) */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>{product.brand}</span>
                <span className="text-slate-600 font-mono">SKU: {product.sku}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950 mt-1">
                {product.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1">{product.colorway}</p>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black font-heading text-slate-950">
                  {formatPrice(product.priceCents)}
                </span>
                {product.compareAtCents && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.compareAtCents)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({product.ratingCount} reviews)</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Select Size / Option:
                </label>
                {currentSizeObj && (
                  <span
                    className={`text-[11px] font-medium ${
                      currentSizeObj.stock <= 5 ? "text-amber-600 font-semibold" : "text-emerald-600"
                    }`}
                  >
                    {currentSizeObj.stock <= 0
                      ? "Out of Stock"
                      : currentSizeObj.stock <= 5
                      ? `Only ${currentSizeObj.stock} left in stock`
                      : "In Stock & Ready to Ship"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => {
                  const isSelected = activeSize === sz.label;
                  const isAvailable = sz.stock > 0;
                  return (
                    <button
                      key={sz.label}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(sz.label)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-slate-950 text-white shadow-sm ring-2 ring-slate-950/20"
                          : isAvailable
                          ? "bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                          : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed line-through"
                      }`}
                    >
                      {sz.label}
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-slate-900 font-mono">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(currentSizeObj?.stock || 10, qty + 1))}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 space-y-3 mt-4">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-primary text-xs py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? "Out of Stock" : `Add to Bag • ${formatPrice(product.priceCents * qty)}`}</span>
              </button>

              <button
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    brand: product.brand,
                    category: product.category,
                    priceCents: product.priceCents,
                    image: product.images[0],
                    rating: product.rating,
                    badge: product.badge,
                  })
                }
                className={`p-3 rounded-xl border transition-colors ${
                  isFavorited
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
                title="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Authentic & Covered by Guarantee</span>
              </div>
              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="text-slate-900 font-bold hover:underline flex items-center gap-1"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
