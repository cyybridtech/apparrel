import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Heart, ShoppingBag, Star, Store } from "lucide-react";
import { Product } from "../../lib/api";
import { useCurrency } from "../../context/CurrencyContext";
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
  const { formatPrice } = useCurrency();

  const isFavorited = isInWishlist(product.id);
  const primaryImg = product.images[0] || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000";
  const secondaryImg = product.images[1] || primaryImg;
  const discountPercent = product.compareAtCents && product.compareAtCents > product.priceCents
    ? Math.round(((product.compareAtCents - product.priceCents) / product.compareAtCents) * 100)
    : 0;
  const isLowStock = product.totalStock > 0 && product.totalStock <= 8;
  const isOutOfStock = product.totalStock === 0;

  const handleQuickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isOutOfStock) return;

    if (product.sizes.length === 1) {
      addToCart({
        productId: product.id,
        sellerId: product.sellerId,
        sellerStore: product.sellerStore,
        sellerName: product.sellerName,
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

  const handleWishlist = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleWishlist({
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      priceCents: product.priceCents,
      image: primaryImg,
      rating: product.rating,
    });
  };

  return (
    <article className="spotlight-card product-spotlight group relative flex min-w-0 flex-col overflow-hidden rounded-[1.3rem] bg-transparent transition duration-300">
      <div
        className="relative isolate aspect-[4/5] overflow-hidden bg-[#f2f1ed]"
        onMouseEnter={() => product.images.length > 1 && setImageIndex(1)}
        onMouseLeave={() => setImageIndex(0)}
      >
        <Link to={`/product/${product.slug}`} className="absolute inset-0 block" aria-label={`View ${product.name}`}>
          <img
            src={imageIndex === 1 ? secondaryImg : primaryImg}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            loading="lazy"
          />
        </Link>
        <div className="absolute left-2.5 top-2.5 z-10 flex max-w-[70%] flex-col items-start gap-1.5 sm:left-3 sm:top-3">
          {(product.badge || product.isNew) && (
            <span className="max-w-full truncate rounded-full bg-white/95 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-900 shadow-sm backdrop-blur sm:text-[10px]">
              {product.badge || "New arrival"}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="rounded-full bg-[#b94f36] px-2.5 py-1 text-[9px] font-bold tracking-wide text-white shadow-sm sm:text-[10px]">
              {discountPercent}% OFF
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="rounded-full bg-[#fff8e8]/95 px-2 py-1 text-[9px] font-bold text-[#79520c] shadow-sm backdrop-blur sm:text-[10px]">
              {product.totalStock} left
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isFavorited ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isFavorited}
          className={`absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/70 shadow-sm backdrop-blur-md transition sm:right-3 sm:top-3 sm:h-10 sm:w-10 ${
            isFavorited
              ? "bg-rose-50 text-rose-600"
              : "bg-white/90 text-slate-800 hover:bg-white hover:text-rose-600"
          }`}
        >
          <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
        </button>

        {onQuickView && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onQuickView(product);
            }}
            aria-label={`Quick view ${product.name}`}
            className="absolute bottom-2.5 right-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/90 text-slate-800 shadow-sm backdrop-blur-md transition hover:bg-white sm:bottom-3 sm:right-3"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 z-[5] grid place-items-center bg-slate-950/35">
            <span className="rounded-full bg-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-900 shadow-lg">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-2.5 sm:gap-3 sm:p-4">
        <div className="min-w-0">
          <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
            <span className="truncate text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500 sm:text-[10px]">
              {product.brand}
            </span>
            {product.sellerStore && (
              <span className="flex min-w-0 items-center gap-1 text-[9px] font-medium text-slate-500">
                <Store className="h-3 w-3 shrink-0" />
                <span className="max-w-[72px] truncate sm:max-w-[110px]">{product.sellerStore}</span>
              </span>
            )}
          </div>

          <Link to={`/product/${product.slug}`} className="block text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2">
            <h3 className="line-clamp-2 min-h-[2.5em] font-heading text-[12px] font-bold leading-[1.25] tracking-[-0.015em] transition-colors group-hover:text-[#44605a] sm:text-sm">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 truncate text-[10px] text-slate-500 sm:text-xs">{product.colorway}</p>
        </div>

        <div className="mt-auto">
          <div className="mb-2 flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-slate-100 pt-2.5">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
              <span className="font-heading text-[13px] font-black tracking-tight text-slate-950 sm:text-base">
                {formatPrice(product.priceCents)}
              </span>
              {product.compareAtCents && product.compareAtCents > product.priceCents && (
                <span className="text-[10px] text-slate-400 line-through sm:text-xs">
                  {formatPrice(product.compareAtCents)}
                </span>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-slate-600 sm:text-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
              <span className="font-normal text-slate-400">({product.ratingCount})</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#17211f] px-2 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#30423d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 sm:gap-2 sm:py-3 sm:text-xs"
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {isOutOfStock ? "Unavailable" : product.sizes.length === 1 ? "Add to bag" : "Choose options"}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
