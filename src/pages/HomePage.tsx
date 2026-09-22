import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Zap,
  Shirt,
  Footprints,
  Flame,
  Watch,
  Droplets,
  Star,
  Eye,
} from "lucide-react";
import { fetchCategories, fetchProducts, Product, Category } from "../lib/api";
import { ProductCard } from "../components/shop/ProductCard";
import { QuickViewModal } from "../components/shop/QuickViewModal";
import { formatPrice } from "../lib/utils";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.filter((p) => p.isFeatured).slice(0, 4));
        setTrendingProducts(prods.filter((p) => p.isTrending).slice(0, 8));
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "tops":
        return <Shirt className="w-5 h-5" />;
      case "sneakers":
        return <Footprints className="w-5 h-5" />;
      case "perfumes":
        return <Flame className="w-5 h-5" />;
      case "watches":
        return <Watch className="w-5 h-5" />;
      case "body-sprays":
        return <Droplets className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* Hero Section */}
      <section className="relative bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Spring/Summer 2026 Drop 01 Active</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black font-heading tracking-tight text-slate-950 leading-[1.08]">
                MODERN LUXURY. <br />
                <span className="text-slate-400">AUTHENTIC STREETWEAR.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Curated collection of heavyweight boxy tees, authentic retro sneakers, artisanal extrait fragrances, luxury chronographs, and energizing body sprays. Delivered live in under 90 minutes.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/shop"
                  className="btn-primary text-xs sm:text-sm py-3.5 px-8 rounded-full shadow-lg shadow-slate-950/15"
                >
                  <span>Explore All Drops</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/track"
                  className="btn-secondary text-xs sm:text-sm py-3.5 px-6 rounded-full"
                >
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Live Delivery Map</span>
                </Link>
              </div>

              {/* Quick Trust Pillars */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-slate-600 text-xs">
                <div>
                  <strong className="block font-heading font-black text-slate-950 text-base">100%</strong>
                  <span className="text-[11px] text-slate-400">Authentic Guarantee</span>
                </div>
                <div>
                  <strong className="block font-heading font-black text-slate-950 text-base">&lt; 90m</strong>
                  <span className="text-[11px] text-slate-400">Live Express Dispatch</span>
                </div>
                <div>
                  <strong className="block font-heading font-black text-slate-950 text-base">Paystack</strong>
                  <span className="text-[11px] text-slate-400">Mobile Money & Cards</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
                <img
                  src="https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop"
                  alt="Hero Showcase"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full self-start mb-2 border border-white/20">
                    Featured Heat Drop
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading">
                    Court Heritage 85 High-Top
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Full-Grain Italian Tumbled Leather • Encapsulated Air Sole
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <span className="font-heading font-black text-lg text-white">
                      GH₵ 1,450.00
                    </span>
                    <Link
                      to="/product/retro-high-court-heritage-sneakers"
                      className="px-4 py-2 rounded-full bg-white text-slate-950 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                    >
                      <span>View Drop</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950">
              Explore Collections
            </h2>
            <p className="text-xs text-slate-500">Pick a category to filter our curated essentials</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories
            .filter((c) => c.slug !== "all")
            .map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="group relative flex flex-col p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-slate-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-slate-950 group-hover:text-white text-slate-900 flex items-center justify-center transition-colors mb-3">
                  {getCategoryIcon(cat.slug)}
                </div>
                <h3 className="text-sm font-bold font-heading text-slate-950 group-hover:text-black">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                  {cat.description}
                </p>
                <span className="text-[10px] font-bold text-slate-400 mt-3 font-mono">
                  {cat.itemCount} items
                </span>
              </Link>
            ))}
        </div>
      </section>

      {/* Featured Drops Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 mb-1">
              <Zap className="w-4 h-4 fill-rose-500" />
              <span>Limited Quantities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-950">
              Curated Featured Drops
            </h2>
          </div>
          <Link
            to="/shop"
            className="btn-secondary text-xs py-2 px-4 rounded-full"
          >
            View Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Real-time Delivery Callout Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-slate-950 rounded-3xl text-white p-8 sm:p-12 overflow-hidden border border-slate-800 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Delivery System</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-white leading-tight">
              Real-Time Packaging & Dispatch Pipeline.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every checkout connects to our fulfillment system. Watch your order progress seamlessly from payment verification and authentication to luxury packaging and express delivery.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/track"
                className="btn-primary bg-white text-slate-950 hover:bg-slate-100 text-xs py-3 px-6 rounded-full font-bold shadow-lg"
              >
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Track Live Orders</span>
              </Link>
              <Link
                to="/shop"
                className="btn-secondary bg-slate-900 text-white border-slate-700 hover:bg-slate-800 text-xs py-3 px-6 rounded-full"
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Rated & Most Wanted
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-950">
              Trending Across All Categories
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>See Full Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={(p) => setQuickViewProduct(p)}
            />
          ))}
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
