import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Product, fetchProducts } from "../../lib/api";
import { formatPrice } from "../../lib/utils";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const prods = await fetchProducts({ search: query });
        setResults(prods.slice(0, 6));
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleCategorySearch = (cat: string) => {
    onClose();
    navigate(`/shop?category=${cat}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 mt-12 flex flex-col max-h-[85vh]">
        {/* Search Header Bar */}
        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex items-center p-2">
          <Search className="w-5 h-5 ml-3 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tops, retro sneakers, oud perfumes, watches, body mists..."
            className="w-full px-3 py-3 text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            ESC
          </button>
        </div>

        {/* Search Content Body */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-y-auto p-6 space-y-6">
          {/* Quick Category Chips */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Explore Categories</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Tops & Shirts", slug: "tops" },
                { label: "Sneakers & Kicks", slug: "sneakers" },
                { label: "Artisanal Perfumes", slug: "perfumes" },
                { label: "Luxury Watches", slug: "watches" },
                { label: "Body Sprays", slug: "body-sprays" },
              ].map((c) => (
                <button
                  key={c.slug}
                  onClick={() => handleCategorySearch(c.slug)}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 transition-colors"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results List */}
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching catalogue...
            </div>
          ) : results.length > 0 ? (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Found Products ({results.length})</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p.slug)}
                    className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all group"
                  >
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded-lg bg-slate-100 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        {p.brand} • {p.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-slate-950">
                        {p.name}
                      </h4>
                      <p className="text-xs font-black text-slate-900 font-heading mt-0.5">
                        {formatPrice(p.priceCents)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ) : query ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No products found matching "<strong className="text-slate-900">{query}</strong>". Try another keyword or browse categories above.
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-4">
              Type anything to discover tops, sneakers, fragrances, and watches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
