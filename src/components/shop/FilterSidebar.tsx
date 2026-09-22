import React from "react";
import { Sparkles, Shirt, Footprints, Flame, Watch, Droplets, Filter, RotateCcw } from "lucide-react";
import { Category } from "../../lib/api";
import { formatPrice } from "../../lib/utils";

interface FilterSidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  brands: string[];
  maxPrice: number;
  priceRange: number;
  onPriceChange: (price: number) => void;
  onReset: () => void;
}

export function FilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  brands,
  maxPrice,
  priceRange,
  onPriceChange,
  onReset,
}: FilterSidebarProps) {
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case "tops":
        return <Shirt className="w-4 h-4" />;
      case "sneakers":
        return <Footprints className="w-4 h-4" />;
      case "perfumes":
        return <Flame className="w-4 h-4" />;
      case "watches":
        return <Watch className="w-4 h-4" />;
      case "body-sprays":
        return <Droplets className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-6 shadow-sm">
        {/* Header & Reset */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-900" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
              Filters
            </span>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Categories Section */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-heading">
            Department
          </h4>
          <div className="space-y-1">
            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {getCategoryIcon(cat.slug)}
                    <span>{cat.name}</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {cat.itemCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range Slider */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-heading">
              Max Price
            </h4>
            <span className="text-xs font-bold text-slate-950 font-mono">
              {formatPrice(priceRange)}
            </span>
          </div>
          <input
            type="range"
            min={10000}
            max={maxPrice || 350000}
            step={5000}
            value={priceRange}
            onChange={(e) => onPriceChange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>GH₵ 100</span>
            <span>{formatPrice(maxPrice || 350000)}</span>
          </div>
        </div>

        {/* Brands Section */}
        {brands.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-heading">
              Brands
            </h4>
            <div className="space-y-1">
              <button
                onClick={() => onSelectBrand("all")}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedBrand === "all"
                    ? "bg-slate-100 text-slate-950 font-bold"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => onSelectBrand(b)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedBrand === b
                      ? "bg-slate-100 text-slate-950 font-bold"
                      : "text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
