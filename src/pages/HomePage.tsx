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
  Store,
  CreditCard,
  Building2,
  Package,
} from "lucide-react";
import { fetchCategories, fetchProducts, fetchSellers, Product, Category, Seller } from "../lib/api";
import { ProductCard } from "../components/shop/ProductCard";
import { QuickViewModal } from "../components/shop/QuickViewModal";
import { formatPrice } from "../lib/utils";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods, sels] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
          fetchSellers(),
        ]);
        setCategories(cats.filter((c) => c.slug !== "all"));
        setSellers(sels);
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
      case "tech":
        return <Zap className="w-5 h-5" />;
      case "bags":
        return <Package className="w-5 h-5" />;
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
                <span>Cyybrid Multi-Seller Marketplace • 2026 Drop Active</span>
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black font-heading tracking-tight text-slate-950 leading-[1.08]">
                AUTHENTIC LUXURY. <br />
                <span className="text-slate-400">ONE UNIFIED MARKETPLACE.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Discover authenticated collections curated across 5 specialized founding member stores in Ghana: Footwear, Swiss horology, luxury French terry apparel, high-fidelity audio tech, and full-grain leather bags.
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
                  to="/admin"
                  className="btn-secondary text-xs sm:text-sm py-3.5 px-6 rounded-full flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>Seller Operations</span>
                </Link>
              </div>

              {/* Quick Trust Pillars */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-4 text-slate-600 text-xs">
                <div>
                  <strong className="block font-heading font-black text-slate-950 text-base">5 Stores</strong>
                  <span className="text-[11px] text-slate-400">Curated Vendor Nodes</span>
                </div>
                <div>
                  <strong className="block font-heading font-black text-slate-950 text-base">Paystack</strong>
                  <span className="text-[11px] text-slate-400">Instant Split Settlement</span>
                </div>
                <div>
                  <strong className="block font-heading font-black text-slate-950 text-base">&lt; 90m</strong>
                  <span className="text-[11px] text-slate-400">Express Courier Delivery</span>
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
                    Kicks & Soles Hub • Kwame Mensah
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold font-heading">
                    Court Heritage 85 Retro High
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Full-Grain Italian Tumbled Leather • Encapsulated Air Sole
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                    <span className="font-heading font-black text-lg text-white font-mono">
                      GH₵ 1,450.00
                    </span>
                    <Link
                      to="/product/court-heritage-85-retro-high"
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

      {/* Featured Drops Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-950 mt-1">
              Featured Marketplace Drops
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-950">
              Explore by Category
            </h2>
            <p className="text-xs text-slate-500">Pick a specialized department</p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-slate-950 group-hover:text-white transition-all">
                {getCategoryIcon(cat.slug)}
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs text-slate-900">{cat.name}</h4>
                <span className="text-[10px] text-slate-400 font-mono">{cat.itemCount} items</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Flame className="w-4 h-4 text-rose-500" />
              <span>In High Demand</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-950 mt-1">
              Trending Across All Stores
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            <span>View Catalog</span>
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
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
