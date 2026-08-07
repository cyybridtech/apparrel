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

      <div className="animate-toast-in relative z-10 w-full max-w-2xl border border-line bg-ink-2 shadow-[12px_12px_0_rgba(0,0,0,0.5)]">
        {/* input bar */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <IconSearch width={20} height={20} className="shrink-0 text-dust" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sneakers, boots, brands…"
            className="flex-1 bg-transparent text-lg font-medium placeholder:text-dust/50 focus:outline-none"
          />
          <span className="hidden text-[10px] font-bold tracking-wider text-dust uppercase sm:inline">
            ESC to close
          </span>
          <button
            onClick={() => setSearchOpen(false)}
            className="grid h-8 w-8 shrink-0 place-items-center border border-line text-dust transition-colors hover:border-flame hover:text-flame"
            aria-label="Close"
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
                      className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-left transition-colors hover:border-line hover:bg-ink-3"
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
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-dust">
                          {p.brand} · {p.colorway}
                        </p>
                      </div>
                      <span className="text-sm font-display text-volt">
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
              <p className="font-display text-2xl uppercase">No matches</p>
              <p className="mt-1 text-sm text-dust">
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
                    className="flex w-full items-center gap-3.5 border border-transparent px-3 py-3 text-left transition-all hover:border-line hover:bg-ink-3"
                  >
                    <div
                      className="h-14 w-14 shrink-0 overflow-hidden"
                      style={{ backgroundColor: p.accent }}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold tracking-[0.2em] text-dust uppercase">
                        {p.brand}
                      </p>
                      <p className="truncate font-display text-lg tracking-wide uppercase">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Stars rating={p.rating} />
                        <span className="text-xs text-dust">
                          {p.colorway} · {p.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-volt">
                        {eur(p.priceCents)}
                      </p>
                      {p.compareAtCents && (
                        <p className="text-xs text-dust line-through">
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
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-dust">
                Start typing to find your next pair…
              </p>
              <p className="mt-2 text-[10px] font-bold tracking-wider text-dust/60 uppercase">
                ⌘K to open search anytime
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
