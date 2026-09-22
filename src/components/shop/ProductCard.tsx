import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, Eye, ShoppingBag, Sparkles } from "lucide-react";
import { Product } from "../../lib/api";
import { formatPrice } from "../../lib/utils";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product.id);
  const primaryImg = product.images[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000";
  const secondaryImg = product.images[1] || primaryImg;

  const discountPercent = product.compareAtCents
    ? Math.round(((product.compareAtCents - product.priceCents) / product.compareAtCents) * 100)
    : 0;

  const isLowStock = product.totalStock > 0 && product.totalStock <= 8;
  const isOutOfStock = product.totalStock === 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.sizes.length === 1) {
      // Direct add if single size
      addToCart({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        category: product.category,
        sizeLabel: product.sizes[0].label,
        image: primaryImg,
        unitPriceCents: product.priceCents,
        sku: product.sku,
      });
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden">
      {/* Top Media Container */}
      <div
        className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
        onMouseEnter={() => setImageIndex(1)}
        onMouseLeave={() => setImageIndex(0)}
      >
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={imageIndex === 1 ? secondaryImg : primaryImg}
            alt={product.name}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
          {product.badge && (
            <span className="bg-slate-950/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              {product.badge}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              Only {product.totalStock} left
            </span>
          )}
        </div>

        {/* Action Overlay Buttons (Wishlist & Quick View) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist({
                id: product.id,
                slug: product.slug,
                name: product.name,
                brand: product.brand,
                category: product.category,
                priceCents: product.priceCents,
                image: primaryImg,
                rating: product.rating,
                badge: product.badge,
              });
            }}
            className={`p-2.5 rounded-full backdrop-blur-md shadow-md transition-all ${
              isFavorited
                ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                : "bg-white/90 text-slate-700 hover:bg-white hover:text-slate-950"
            }`}
            title={isFavorited ? "Remove from Wishlist" : "Save to Wishlist"}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-rose-500" : ""}`} />
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white hover:text-slate-950 shadow-md opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Add Bottom Bar */}
        <div className="absolute bottom-3 inset-x-3 z-10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="w-full bg-slate-950/95 hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-xl backdrop-blur-md shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isOutOfStock ? "Out of Stock" : product.sizes.length === 1 ? "Quick Add" : "Select Size"}</span>
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span>{product.brand}</span>
            <span className="capitalize text-slate-500">{product.subCategory}</span>
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`} className="group-hover:text-slate-900 transition-colors">
            <h3 className="font-heading text-sm font-bold text-slate-900 line-clamp-1 group-hover:underline">
              {product.name}
            </h3>
          </Link>

          {/* Colorway / Specs */}
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{product.colorway}</p>
        </div>

        {/* Rating & Pricing */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-sm text-slate-950">
              {formatPrice(product.priceCents)}
            </span>
            {product.compareAtCents && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.compareAtCents)}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-[11px]">{product.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[10px]">({product.ratingCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
