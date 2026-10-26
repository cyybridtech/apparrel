import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Footprints,
  Flame,
  Package,
  Shirt,
  Sparkles,
  Store,
  Watch,
  Zap,
} from "lucide-react";
import { fetchCategories, fetchProducts, Product, Category } from "../lib/api";
import { ProductCard } from "../components/shop/ProductCard";
import { QuickViewModal } from "../components/shop/QuickViewModal";
import SpotlightCard from "../components/SpotlightCard";
import "../styles/home.css";

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [cats, products] = await Promise.all([fetchCategories(), fetchProducts()]);
        if (!active) return;
        setCategories(cats.filter((category) => category.slug !== "all"));
        setFeaturedProducts(products.filter((product) => product.isFeatured).slice(0, 4));
        setTrendingProducts(products.filter((product) => product.isTrending).slice(0, 8));
      } catch (error) {
        console.error("Failed to load home data", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "tops":
        return <Shirt className="h-5 w-5" />;
      case "sneakers":
        return <Footprints className="h-5 w-5" />;
      case "perfumes":
        return <Flame className="h-5 w-5" />;
      case "watches":
        return <Watch className="h-5 w-5" />;
      case "tech":
        return <Zap className="h-5 w-5" />;
      case "bags":
        return <Package className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="home-page space-y-16 pb-16 sm:space-y-24">
      <section className="home-hero relative isolate overflow-hidden text-white">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-20">
          <div className="relative z-10 space-y-7 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100 shadow-lg shadow-black/10 backdrop-blur-md sm:text-[11px]">
              <span className="live-indicator h-2 w-2 rounded-full bg-emerald-300" />
              <span>Curated retail · one welcoming storefront</span>
            </div>

            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-200/80">
                Discover something different
              </p>
              <h1 className="max-w-3xl font-heading text-[3.15rem] font-black leading-[0.99] tracking-[-0.065em] sm:text-6xl lg:text-[5.2rem]">
                Good finds.
                <br />
                <span className="hero-highlight">Great stories.</span>
              </h1>
              <p className="max-w-xl text-sm leading-7 text-slate-200/80 sm:text-base sm:leading-8">
                Explore a growing collection of footwear, apparel, timepieces, audio tech and everyday favourites from specialist shops—all in one easy-to-browse place.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
              <Link to="/shop" className="hero-button-primary group">
                <span>Explore the catalogue</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/admin" className="hero-button-secondary">
                <Store className="h-4 w-4 text-emerald-300" />
                <span>Retailer workspace</span>
              </Link>
            </div>

            <div className="hero-meta-row grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-5 sm:gap-5">
              <div>
                <span className="block font-heading text-sm font-extrabold text-white sm:text-base">One catalog</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-300/70 sm:text-[11px]">A simple place to explore</span>
              </div>
              <div>
                <span className="block font-heading text-sm font-extrabold text-white sm:text-base">Many finds</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-300/70 sm:text-[11px]">Across specialist categories</span>
              </div>
              <div>
                <span className="block font-heading text-sm font-extrabold text-white sm:text-base">Ghana-first</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-300/70 sm:text-[11px]">Prices shown in local currency</span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:col-span-5 lg:max-w-none">
            <SpotlightCard className="hero-spotlight">
              <div className="hero-showcase relative isolate aspect-[5/5.7] overflow-hidden rounded-[1.7rem] sm:aspect-[5/4.7] lg:aspect-[5/6]">
                <img
                  src="/images/retail-shop-hero.jpg"
                  alt="A bright, modern boutique with curated clothing displays"
                  className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-1000 hover:scale-[1.04]"
                />
                <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3 sm:left-6 sm:right-6 sm:top-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-lg sm:text-[10px]">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-200" />
                    The Cyybrid edit
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/15 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-lg">
                    Accra · Ghana
                  </span>
                </div>

                <div className="hero-showcase-copy absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                    <span className="h-px w-7 bg-emerald-300" />
                    Made for discovery
                  </div>
                  <h2 className="max-w-sm font-heading text-2xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-3xl">
                    A fresh perspective on what to shop next.
                  </h2>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/20 pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-medium text-white/75 sm:text-xs">
                      <Building2 className="h-4 w-4 text-emerald-200" />
                      Shops, styles &amp; small discoveries
                    </div>
                    <Link
                      to="/shop"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-950 transition hover:scale-105 hover:bg-emerald-100"
                      aria-label="Browse the catalogue"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                <div className="hero-photo-index absolute bottom-6 right-6 hidden flex-col items-end gap-1 text-white/65 sm:flex">
                  <span className="font-mono text-[9px] tracking-[0.2em]">01 / DISCOVER</span>
                  <span className="h-10 w-px bg-white/40" />
                </div>
              </div>
            </SpotlightCard>

            <div className="hero-floating-note absolute -bottom-5 -left-2 z-10 hidden items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3.5 text-slate-900 shadow-[0_20px_55px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:flex lg:-left-8">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">A shared storefront</span>
                <span className="mt-0.5 block text-xs font-extrabold">Find your next favourite</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-bottom-line relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 pb-5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45 sm:px-6 lg:px-8">
          <span>Footwear</span><span className="hidden sm:inline">Apparel</span><span>Timepieces</span><span className="hidden sm:inline">Tech &amp; audio</span><span>Everyday essentials</span>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 sm:grid-cols-3 sm:gap-4 sm:px-6 lg:px-8">
        <SpotlightCard className="home-value-card">
          <div className="flex h-full items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-800"><Sparkles className="h-5 w-5" /></div>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-emerald-800">01 · The edit</p><h3 className="mt-2 font-heading text-base font-extrabold tracking-tight text-slate-950">Good things, made easy to find.</h3><p className="mt-1.5 text-xs leading-5 text-slate-500">Explore a growing selection without jumping between stores.</p></div>
          </div>
        </SpotlightCard>
        <SpotlightCard className="home-value-card">
          <div className="flex h-full items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700"><Building2 className="h-5 w-5" /></div>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-blue-700">02 · The network</p><h3 className="mt-2 font-heading text-base font-extrabold tracking-tight text-slate-950">Distinct shops. One destination.</h3><p className="mt-1.5 text-xs leading-5 text-slate-500">A shared storefront with room for each seller’s own character.</p></div>
          </div>
        </SpotlightCard>
        <SpotlightCard className="home-value-card">
          <div className="flex h-full items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-50 text-amber-700"><Store className="h-5 w-5" /></div>
            <div><p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-amber-700">03 · The future</p><h3 className="mt-2 font-heading text-base font-extrabold tracking-tight text-slate-950">A retail platform built to grow.</h3><p className="mt-1.5 text-xs leading-5 text-slate-500">Cyybrid is evolving for shops, supermarkets and multi-location teams.</p></div>
          </div>
        </SpotlightCard>
      </section>

      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-3 sm:mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-emerald-800 sm:text-xs"><Sparkles className="h-4 w-4" /><span>Selected for you</span></div>
              <h2 className="mt-2 font-heading text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Featured finds</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-1.5 pb-1 text-xs font-bold text-slate-700 transition hover:text-emerald-800 sm:text-sm"><span>View catalogue</span><ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />)}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 sm:text-xs">Shop your way</p>
            <h2 className="mt-2 font-heading text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Explore by category</h2>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Find a new favourite in the department you love.</p>
          </div>
          <Link to="/shop" className="hidden items-center gap-1.5 pb-1 text-xs font-bold text-slate-700 transition hover:text-emerald-800 sm:inline-flex"><span>All categories</span><ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {categories.map((category, index) => (
            <SpotlightCard key={category.slug} className={`category-spotlight category-spotlight-${index % 4}`}>
              <Link to={`/shop?category=${category.slug}`} className="category-tile group flex h-full min-h-[142px] flex-col items-start justify-between">
                <div className="flex w-full items-start justify-between">
                  <div className="category-icon grid h-11 w-11 place-items-center rounded-2xl border border-white/70 bg-white/75 text-slate-800 shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-4deg]">{getCategoryIcon(category.slug)}</div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-extrabold tracking-tight text-slate-950">{category.name}</h3>
                  <span className="mt-1 block text-[10px] font-medium text-slate-500">{category.itemCount} items to explore</span>
                </div>
              </Link>
            </SpotlightCard>
          ))}
        </div>
        {categories.length === 0 && !loading && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Categories will appear here as the catalogue grows.</div>
        )}
      </section>

      <section className="home-editorial-band relative mx-4 overflow-hidden rounded-[2rem] sm:mx-6 lg:mx-auto lg:max-w-7xl">
        <div className="relative flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
          <div className="max-w-xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-emerald-200">A new kind of retail home</p>
            <h2 className="mt-2 font-heading text-2xl font-black tracking-tight text-white sm:text-3xl">One storefront, made for discovery.</h2>
            <p className="mt-2 max-w-lg text-xs leading-6 text-slate-300 sm:text-sm">Cyybrid is growing from a multi-seller shop into a more flexible retail platform for the people behind the shelves.</p>
          </div>
          <Link to="/about" className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950">Our story<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </section>

      {trendingProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between gap-3 sm:mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-rose-700 sm:text-xs"><Flame className="h-4 w-4" /><span>Worth a closer look</span></div>
              <h2 className="mt-2 font-heading text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Popular in the catalogue</h2>
            </div>
            <Link to="/shop" className="inline-flex items-center gap-1.5 pb-1 text-xs font-bold text-slate-700 transition hover:text-emerald-800 sm:text-sm"><span>Browse all</span><ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {trendingProducts.map((product) => <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />)}
          </div>
        </section>
      )}

      {loading && (
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:gap-5 sm:px-6 lg:grid-cols-4 lg:px-8" aria-label="Loading catalogue">
          {Array.from({ length: 4 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-[1.35rem] bg-slate-200/70" />)}
        </div>
      )}

      {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
    </div>
  );
}
