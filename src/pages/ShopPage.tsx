import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, SlidersHorizontal, ArrowUpDown, Search, PackageOpen } from "lucide-react";
import { fetchCategories, fetchProducts, Product, Category } from "../lib/api";
import { ProductCard } from "../components/shop/ProductCard";
import { FilterSidebar } from "../components/shop/FilterSidebar";
import { QuickViewModal } from "../components/shop/QuickViewModal";

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
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
    setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          fetchCategories(),
          fetchProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);

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
    if (catSlug === "all") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catSlug });
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSortBy("featured");
    setSearchQuery("");
    setPriceRange(maxPrice);
    setSearchParams({});
  };

  // Filter & Sort logic
  const filteredProducts = products.filter((p) => {
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
        p.description.toLowerCase().includes(q);
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
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curated Apparel Catalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-950">
            {activeCategoryObj?.name || "All Collections"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {activeCategoryObj?.description ||
              "Browse our full assortment of tops, sneakers, fragrances, chronographs, and grooming sprays."}
          </p>
        </div>
      </div>

      {/* Controls Bar (Search, Sort, Mobile Filter Toggle) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this catalog..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="hidden sm:inline text-slate-500 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="featured">Featured & Trending</option>
              <option value="newest">Newest Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Catalog Layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filter Sidebar (Desktop) */}
        <div className="hidden lg:block">
          <FilterSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            selectedBrand={selectedBrand}
            onSelectBrand={setSelectedBrand}
            brands={brands}
            maxPrice={maxPrice}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 flex justify-end animate-fadeIn">
            <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-heading font-bold text-sm">Filter Catalogue</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-xs font-bold text-slate-500 hover:text-black"
                >
                  Close
                </button>
              </div>
              <FilterSidebar
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(cat) => {
                  handleSelectCategory(cat);
                  setMobileFilterOpen(false);
                }}
                selectedBrand={selectedBrand}
                onSelectBrand={(b) => {
                  setSelectedBrand(b);
                  setMobileFilterOpen(false);
                }}
                brands={brands}
                maxPrice={maxPrice}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                onReset={handleResetFilters}
              />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 w-full">
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Showing {sortedProducts.length} results</span>
            {selectedCategory !== "all" && (
              <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                Category: {selectedCategory}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  No products matched your criteria
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try widening your price range, changing selected categories, or clearing your search keywords.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="btn-primary text-xs py-2.5 px-6 rounded-full"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
