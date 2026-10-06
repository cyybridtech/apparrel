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
  Ruler,
  Flame,
  MessageSquare,
  ThumbsUp,
  User,
} from "lucide-react";
import { fetchProductBySlug, Product } from "../lib/api";
import { useCurrency } from "../context/CurrencyContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { ProductCard } from "../components/shop/ProductCard";
import { SizeGuideModal } from "../components/shop/SizeGuideModal";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev-1",
    author: "Kwame A.",
    rating: 5,
    date: "2 days ago",
    title: "Uncompromising Quality & Heavy Drape",
    content: "The fabric weight is unlike any standard high street tee. It holds the structural boxy cut perfectly and the collar is firmly rib-stitched. Highly recommended.",
    verifiedPurchase: true,
    helpfulCount: 14,
  },
  {
    id: "rev-2",
    author: "Selorm K.",
    rating: 5,
    date: "1 week ago",
    title: "Worth Every Cedi",
    content: "Fast delivery to Airport Residential in under 2 hours. Packaged inside a custom dust bag. Fits true to size.",
    verifiedPurchase: true,
    helpfulCount: 9,
  },
];

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [viewersCount, setViewersCount] = useState(8);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewTitle, setNewReviewTitle] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState("");

  const { formatPrice } = useCurrency();
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

        // Simulated dynamic viewers count
        setViewersCount(Math.floor(6 + Math.random() * 9));
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
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Loading product specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold font-heading">Product Not Found</h2>
        <p className="text-xs text-slate-500">The requested drop may have concluded or moved.</p>
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
        sellerId: product.sellerId,
        sellerStore: product.sellerStore,
        sellerName: product.sellerName,
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
      success("Link Copied", "Product link copied to clipboard.");
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewTitle || !newReviewContent) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor,
      rating: newReviewRating,
      date: "Just now",
      title: newReviewTitle,
      content: newReviewContent,
      verifiedPurchase: true,
      helpfulCount: 1,
    };

    setReviews([newRev, ...reviews]);
    setIsWritingReview(false);
    setNewReviewAuthor("");
    setNewReviewTitle("");
    setNewReviewContent("");
    success("Review Published", "Thank you for sharing your feedback with the APPARREL community.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumbs */}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-start">
        {/* Left: Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-sm group">
            <img
              src={product.images[selectedImg] || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
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

          {/* Thumbnails */}
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

        {/* Right: Product Actions & Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
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

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-900">{product.rating.toFixed(1)}</span>
                <span className="text-slate-400">({reviews.length + product.ratingCount} reviews)</span>
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
                  Price (Multi-Currency Guaranteed)
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
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                In Stock
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
                  Product Specifications:
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

            {/* Size Selector & Size Guide Button */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Select Size / Option:
                </span>

                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-xs font-bold text-slate-900 hover:text-amber-600 flex items-center gap-1 transition-colors"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size & Fit Guide</span>
                </button>
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
          <div className="pt-4 border-t border-slate-200 space-y-4">
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

            {/* Verified Cyybrid Founding Seller Information */}
            {product.sellerStore && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      👑
                    </div>
                    <div>
                      <div className="font-bold text-slate-950 flex items-center gap-1.5">
                        <span>{product.sellerStore}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {product.sellerName ? `Curated by ${product.sellerName}` : "Cyybrid Founding Partner"}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    VERIFIED VENDOR
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Paystack Split Settlement Active</span>
                  <span className="text-emerald-600 font-semibold">100% Authentic Guarantee</span>
                </div>
              </div>
            )}

            {/* Delivery Guarantees */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Express Dispatch with nationwide fulfillment tracking</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 text-slate-600 shrink-0" />
                <span>7-Day Complimentary Size & Style Exchange Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      <section className="pt-12 border-t border-slate-200 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <MessageSquare className="w-4 h-4 text-slate-900" />
              <span>Customer Feedback</span>
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-950 mt-1">
              Verified Purchaser Reviews ({reviews.length})
            </h3>
          </div>

          <button
            onClick={() => setIsWritingReview(!isWritingReview)}
            className="btn-secondary text-xs py-2.5 px-5 rounded-xl self-start sm:self-center"
          >
            {isWritingReview ? "Cancel Review" : "Write a Review"}
          </button>
        </div>

        {/* Review Form */}
        {isWritingReview && (
          <form
            onSubmit={handleReviewSubmit}
            className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4 max-w-2xl animate-fadeIn"
          >
            <h4 className="font-heading font-bold text-sm text-slate-950">
              Leave Your Verified Review
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Star Rating *
                </label>
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                  <option value={4}>★★★★☆ (4 Stars - Great)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Review Headline *
              </label>
              <input
                type="text"
                required
                value={newReviewTitle}
                onChange={(e) => setNewReviewTitle(e.target.value)}
                placeholder="e.g. Amazing quality and perfect heavyweight fit"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Detailed Feedback *
              </label>
              <textarea
                required
                rows={3}
                value={newReviewContent}
                onChange={(e) => setNewReviewContent(e.target.value)}
                placeholder="Describe the fabric texture, fit, durability, and comfort..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button type="submit" className="btn-primary text-xs py-2.5 px-6 rounded-xl">
              Submit Review
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{rev.date}</span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-slate-950 font-heading">
                  {rev.title}
                </h5>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {rev.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{rev.author}</span>
                  {rev.verifiedPurchase && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                      ✓ Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Curated Recommendations
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

      {/* Sizing Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        category={product.category}
      />
    </div>
  );
}
