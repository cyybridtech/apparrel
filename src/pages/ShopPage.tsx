import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, SlidersHorizontal, ArrowUpDown, Search, PackageOpen, Store } from "lucide-react";
import { fetchCategories, fetchProducts, fetchSellers, Product, Category, Seller } from "../lib/api";
import { ProductCard } from "../components/shop/ProductCard";
import { FilterSidebar } from "../components/shop/FilterSidebar";
import { QuickViewModal } from "../components/shop/QuickViewModal";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialSeller = searchParams.get("seller") || "all";

  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSellerId, setSelectedSellerId] = useState<string>(initialSeller);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number>(350000);
  const [maxPrice, setMaxPrice] = useState<number>(350000);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync category with URL
  useEffect(() => {
    const cat = searchParams.get("category") || "all";
    const sel = searchParams.get("seller") || "all";
    setSelectedCategory(cat);
    setSelectedSellerId(sel);
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods, sels] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
          fetchSellers(),
        ]);
        setCategories(cats);
        setProducts(prods);
        setSellers(sels);

        // Extract brands
        const uniqueBrands = Array.from(new Set(prods.map((p) => p.brand)));
        setBrands(uniqueBrands);

        // Find max price
        const highestPrice = Math.max(...prods.map((p) => p.priceCents), 350000);
        setMaxPrice(highestPrice);
        setPriceRange(highestPrice);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    const newParams = new URLSearchParams(searchParams);
    if (catSlug === "all") {
      newParams.delete("category");
    } else {
      newParams.set("category", catSlug);
    }
    setSearchParams(newParams);
  };

  const handleSelectSeller = (sellerIdStr: string) => {
    setSelectedSellerId(sellerIdStr);
    const newParams = new URLSearchParams(searchParams);
    if (sellerIdStr === "all") {
      newParams.delete("seller");
    } else {
      newParams.set("seller", sellerIdStr);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedSellerId("all");
    setSelectedBrand("all");
    setSortBy("featured");
    setSearchQuery("");
    setPriceRange(maxPrice);
    setSearchParams({});
  };

  // Filter & Sort logic
  const filteredProducts = products.filter((p) => {
    // Seller
    if (selectedSellerId !== "all" && String(p.sellerId) !== selectedSellerId) {
      return false;
    }
    // Category
    if (selectedCategory !== "all" && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    // Brand
    if (selectedBrand !== "all" && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }
    // Price
    if (p.priceCents > priceRange) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subCategory.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.sellerStore?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Sort
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.priceCents - b.priceCents;
    if (sortBy === "price-desc") return b.priceCents - a.priceCents;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "newest") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  const activeCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>Cyybrid Multi-Seller Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-950">
            {activeCategoryObj?.name || "All Collections & Stores"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {activeCategoryObj?.description ||
              "Discover authenticated drops curated across the 5 Cyybrid founding member stores in Ghana."}
          </p>
        </div>

        {/* Founding Seller Store Quick Filter Bar */}
        <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Store className="w-3.5 h-3.5 text-slate-700" />
            <span>Filter by Founding Member Store:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSelectSeller("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                selectedSellerId === "all"
                  ? "bg-slate-950 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              All Marketplace ({products.length})
            </button>

            {sellers.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSeller(String(s.id))}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  selectedSellerId === String(s.id)
                    ? "bg-slate-950 text-white shadow-xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <span>{s.storeName}</span>
                <span className="text-[10px] opacity-70 font-mono">({s.name.split(" ")[0]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Layout (Sidebar + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block lg:col-span-1">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            brands={brands}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            priceRange={priceRange}
            maxPrice={maxPrice}
            onPriceChange={setPriceRange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Product Results (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Controls Bar (Mobile Filter Toggle, Search, Sort) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters & Categories</span>
            </button>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search products, stores, SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-900 focus:outline-none focus:border-slate-950 placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort & Count */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">
                <strong className="text-slate-900">{sortedProducts.length}</strong> items
              </span>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-slate-950 cursor-pointer"
                >
                  <option value="featured">Featured First</option>
                  <option value="newest">Newest Drops</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
                  <div className="aspect-square bg-slate-100 rounded-xl" />
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  No drops matched your active filters
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try clearing search terms or selecting another seller store.
                </p>
              </div>
              <button onClick={handleResetFilters} className="btn-primary text-xs py-2 px-6">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
            <FilterSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                handleSelectCategory(cat);
                setMobileFilterOpen(false);
              }}
              brands={brands}
              selectedBrand={selectedBrand}
              onSelectBrand={setSelectedBrand}
              priceRange={priceRange}
              maxPrice={maxPrice}
              onPriceChange={setPriceRange}
              onResetFilters={() => {
                handleResetFilters();
                setMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
