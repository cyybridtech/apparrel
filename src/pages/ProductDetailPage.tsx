import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { fetchProductBySlug, Product } from "../lib/api";
import { formatPrice } from "../lib/utils";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { ProductCard } from "../components/shop/ProductCard";

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { success } = useToast();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data.product);
        setRelated(data.related);
        setSelectedImg(0);
        setSelectedSize(data.product.sizes[0]?.label || "");
        setQty(1);
      })
      .catch((err) => {
        console.error("Failed to load product", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold font-heading">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you're looking for might have been moved or discontinued.</p>
        <Link to="/shop" className="btn-primary text-xs py-2.5 px-6 inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const activeSize = selectedSize || product.sizes[0]?.label;
  const currentSizeObj = product.sizes.find((s) => s.label === activeSize);
  const isOutOfStock = !currentSizeObj || currentSizeObj.stock <= 0;
  const isFavorited = isInWishlist(product.id);

  const discountPercent = product.compareAtCents
    ? Math.round(((product.compareAtCents - product.priceCents) / product.compareAtCents) * 100)
    : 0;

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
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      success("Link Copied", "Product link copied to your clipboard.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-slate-900 transition-colors">Catalog</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/shop?category=${product.category}`} className="capitalize hover:text-slate-900 transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold line-clamp-1">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14">
        {/* Left Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm group">
            <img
              src={product.images[selectedImg] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-slate-950 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md">
                {product.badge}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-md">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden bg-white border-2 transition-all ${
                    selectedImg === idx
                      ? "border-slate-950 ring-2 ring-slate-950/20 scale-105"
                      : "border-slate-200/80 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Info & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>{product.brand}</span>
                <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {product.sku}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-950 mt-1.5">
                {product.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">{product.colorway}</p>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({product.ratingCount} reviews)</span>
              </div>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Stock</span>
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Price (Paystack Verified)
                </span>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black font-heading text-slate-950">
                    {formatPrice(product.priceCents)}
                  </span>
                  {product.compareAtCents && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatPrice(product.compareAtCents)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                GHS / Pesewas
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Features Specs Bullet Points */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
                  Product Specifications & Notes:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 mt-1.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Size Selector */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Available Sizes / Options:
                </span>
                {currentSizeObj && (
                  <span
                    className={`text-xs font-semibold ${
                      currentSizeObj.stock <= 5 ? "text-amber-600" : "text-emerald-600"
                    }`}
                  >
                    {currentSizeObj.stock <= 0
                      ? "Out of Stock"
                      : currentSizeObj.stock <= 5
                      ? `Only ${currentSizeObj.stock} remaining`
                      : "In Stock Ready for Dispatch"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((sz) => {
                  const isSelected = activeSize === sz.label;
                  const isAvailable = sz.stock > 0;
                  return (
                    <button
                      key={sz.label}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(sz.label)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-slate-950 text-white shadow-md ring-2 ring-slate-950/20"
                          : isAvailable
                          ? "bg-white border border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                          : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed line-through"
                      }`}
                    >
                      <span>{sz.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-200 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold text-slate-900 font-mono">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(currentSizeObj?.stock || 10, qty + 1))}
                  className="px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 btn-primary text-xs sm:text-sm py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? "Out of Stock"
                    : `Add to Bag • ${formatPrice(product.priceCents * qty)}`}
                </span>
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
                className={`p-4 rounded-2xl border transition-colors ${
                  isFavorited
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-rose-500" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                title="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery & Trust Highlights */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Live dispatch in 30-90 mins with Mapbox telemetry in Accra</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-slate-600 shrink-0" />
                <span>7-Day Hassle-Free Size Exchange Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Drops Recommendations */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Complementary Styles
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-slate-950">
                You Might Also Like
              </h3>
            </div>
            <Link
              to={`/shop?category=${product.category}`}
              className="text-xs font-bold text-slate-900 hover:underline"
            >
              View More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
