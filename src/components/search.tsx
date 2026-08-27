import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/format";
import { Stars } from "@/components/ui";
import { IconSearch, IconX } from "@/components/icons";

export function SearchOverlay() {
  const {
    products,
    searchOpen,
    setSearchOpen,
    setQuickViewId,
    recentlyViewed,
  } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery("");
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.colorway.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query, products]);

  const recentProducts = useMemo(
    () =>
      recentlyViewed
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean),
    [recentlyViewed, products]
  );

  const showRecents = query.trim().length < 2 && recentProducts.length > 0;

  if (!searchOpen) return null;

  const openProduct = (id: number) => {
    setSearchOpen(false);
    setQuickViewId(id);
  };

  return (
    <div
      className="fixed inset-0 z-[65] flex items-start justify-center pt-20 sm:pt-28"
      role="dialog"
      aria-label="Search products"
    >
      <button
        className="absolute inset-0 bg-ink/90 backdrop-blur-md"
        onClick={() => setSearchOpen(false)}
        aria-label="Close search"
      />

      <div className="animate-toast-in relative z-10 w-full max-w-2xl rounded-2xl border border-[#1b2438] bg-[#0e131f] shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-3 border-b border-[#1b2438] px-5 py-4">
          <IconSearch width={20} height={20} className="shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search kicks, tops, brands…"
            aria-label="Search products"
            className="flex-1 bg-transparent text-base font-medium text-white placeholder:text-gray-500 focus:outline-none"
          />
          <span className="hidden text-[10px] font-bold tracking-widest text-gray-500 uppercase sm:inline">
            ESC to close
          </span>
          <button
            onClick={() => setSearchOpen(false)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#1b2438] text-gray-400 transition-colors hover:border-[#ff3b5c] hover:text-[#ff3b5c]"
            aria-label="Close search"
          >
            <IconX width={15} height={15} />
          </button>
        </div>

        {/* results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {showRecents && (
            <div className="px-5 py-4">
              <p className="mb-3 text-[10px] font-bold tracking-[0.22em] text-dust uppercase">
                Recently viewed
              </p>
              <div className="space-y-1">
                {recentProducts.map((p) =>
                  p ? (
                    <button
                      key={p.id}
                      onClick={() => openProduct(p.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-colors hover:border-[#1b2438] hover:bg-[#151c2e]"
                    >
                      <div
                        className="h-10 w-10 shrink-0 overflow-hidden"
                        style={{ backgroundColor: p.accent }}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-gray-400">
                          {p.brand} · {p.colorway}
                        </p>
                      </div>
                      <span className="font-display text-sm text-[#00f0ff]">
                        {eur(p.priceCents)}
                      </span>
                    </button>
                  ) : null
                )}
              </div>
            </div>
          )}

          {query.trim().length >= 2 && results.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-display text-xl text-white uppercase">No matches found</p>
              <p className="mt-1 text-sm text-gray-400">
                Try a brand name, category, or colorway
              </p>
            </div>
          )}

          {results.length > 0 && (
            <div className="px-5 py-3">
              <p className="mb-2 text-[10px] font-bold tracking-[0.22em] text-dust uppercase">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-1">
                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => openProduct(p.id)}
                    className="flex w-full items-center gap-3.5 rounded-xl border border-transparent px-3 py-3 text-left transition-all hover:border-[#1b2438] hover:bg-[#151c2e]"
                  >
                    <div
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-lg"
                      style={{ backgroundColor: p.accent }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase">
                        {p.brand}
                      </p>
                      <p className="truncate font-display text-base font-bold text-white uppercase">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Stars rating={p.rating} />
                        <span className="text-xs text-gray-400">
                          {p.colorway} · {p.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-base font-bold text-[#00f0ff]">
                        {eur(p.priceCents)}
                      </p>
                      {p.compareAtCents && (
                        <p className="text-xs text-gray-500 line-through">
                          {eur(p.compareAtCents)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim().length < 2 && !showRecents && (
            <div className="px-5 py-12 text-center">
              <p className="text-3xl mb-3">🔎</p>
              <p className="text-sm font-semibold text-gray-300">
                Start typing to search kicks, tops, brands…
              </p>
              <p className="mt-2 text-[11px] font-bold tracking-widest text-gray-600 uppercase">
                ⌘K · Ctrl+K to open search anytime
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
