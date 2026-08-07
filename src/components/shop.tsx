import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/format";
import type { ProductWithSizes } from "@/lib/types";
import { Reveal, Stars } from "@/components/ui";
import {
  IconBag,
  IconEye,
  IconFilter,
  IconHeart,
  IconX,
} from "@/components/icons";
import { TiltCard } from "@/components/TiltCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest" | "sale";
type TypeTab = "all" | "footwear" | "tops";

const SORTS: Array<[SortKey, string]> = [
  ["featured", "Featured"],
  ["price-asc", "Price ↑"],
  ["price-desc", "Price ↓"],
  ["rating", "Top Rated"],
  ["newest", "New In"],
  ["sale", "On Sale"],
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CLOTHING_SIZE_MAP: Record<number, string> = { 1: "XS", 2: "S", 3: "M", 4: "L", 5: "XL", 6: "XXL" };

function totalStock(p: ProductWithSizes): number {
  return p.sizes.reduce((n, s) => n + s.stock, 0);
}

function getSizeLabel(eu: number, isTops: boolean): string {
  if (isTops) return CLOTHING_SIZE_MAP[eu] ?? "";
  return `EU${eu}`;
}

function ProductCard({ product, index }: { product: ProductWithSizes; index: number }) {
  const { setQuickViewId, wishlist, toggleWish } = useStore();
  const wished = wishlist.includes(product.id);
  const soldOut = totalStock(product) === 0;
  const isTops = (product as any).productType === "tops";
  const discount = product.compareAtCents
    ? Math.round(((product.compareAtCents - product.priceCents) / product.compareAtCents) * 100)
    : 0;

  // Available sizes with stock > 0
  const availSizes = product.sizes
    .filter((s) => s.stock > 0)
    .slice(0, 5)
    .map((s) => getSizeLabel(s.eu, isTops));

  const hasFreeship = product.priceCents >= 150000;

  return (
    <Reveal delay={(index % 4) * 65}>
      <TiltCard className="h-full">
        <article
          className="group relative flex h-full cursor-pointer flex-col rounded-2xl border border-[#1b2438] bg-[#0e131f] transition-all duration-300 hover:border-[#00f0ff]/50 hover:shadow-[0_12px_36px_rgba(0,240,255,0.12)] hover:-translate-y-1"
          onClick={() => setQuickViewId(product.id)}
        >
          {/* Image */}
          <div
            className="relative aspect-square overflow-hidden rounded-t-2xl"
            style={{ backgroundColor: product.accent || "#0e131f" }}
          >
            <img
              src={product.image}
              alt={`${product.brand} ${product.name}`}
              loading="lazy"
              className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? "opacity-40 grayscale" : ""}`}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
              {isTops && (
                <span className="bg-[#a855f7] px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase rounded shadow-md">
                  Tops
                </span>
              )}
              {product.isNew && !isTops && (
                <span className="bg-[#00f0ff] px-2 py-0.5 text-[10px] font-black tracking-widest text-black uppercase rounded shadow-md">
                  New
                </span>
              )}
              {discount > 0 && (
                <span className="sale-badge bg-[#ff3b5c] px-2 py-0.5 text-[10px] font-black tracking-widest text-white uppercase rounded shadow-md">
                  −{discount}%
                </span>
              )}
              {soldOut && (
                <span className="border border-white bg-black/80 px-2 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase rounded">
                  Sold out
                </span>
              )}
              {hasFreeship && !soldOut && (
                <span className="bg-[#10b981]/20 border border-[#10b981]/40 px-2 py-0.5 text-[10px] font-bold text-[#10b981] uppercase rounded">
                  Free ship
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleWish(product.id); }}
              aria-label="Toggle wishlist"
              className={`absolute top-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full border transition-all active:scale-90 z-10 ${
                wished
                  ? "border-[#ff3b5c] bg-[#ff3b5c] text-white"
                  : "border-[#1b2438] bg-[#07090e]/80 text-gray-400 hover:text-white hover:border-white/40"
              }`}
            >
              <IconHeart width={15} height={15} filled={wished} />
            </button>

            {/* Quick view overlay */}
            <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-100 transition-all duration-300 lg:translate-y-12 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); setQuickViewId(product.id); }}
                className="btn-cyan flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg"
              >
                <IconEye width={14} height={14} /> Quick View
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <span>{product.brand}</span>
                <span className="text-[#00f0ff]">{product.category}</span>
              </div>
              <h3 className="mt-1 font-display text-base text-white font-bold leading-tight group-hover:text-[#00f0ff] transition-colors line-clamp-1">
                {product.name}
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{product.colorway}</p>

              {/* Star rating */}
              <div className="mt-1.5 flex items-center gap-1.5">
                <Stars rating={product.rating} />
                <span className="text-[10px] text-gray-500">({product.ratingCount})</span>
              </div>

              {/* Available sizes strip */}
              {availSizes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {availSizes.map((sz) => (
                    <span
                      key={sz}
                      className="px-1.5 py-0.5 text-[9px] font-bold rounded border border-[#1b2438] bg-[#07090e] text-gray-400"
                    >
                      {sz}
                    </span>
                  ))}
                  {product.sizes.filter((s) => s.stock > 0).length > 5 && (
                    <span className="text-[9px] text-gray-500 self-center">+{product.sizes.filter((s) => s.stock > 0).length - 5}</span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-[#1b2438] pt-3">
              <div>
                <p className="font-display text-lg font-bold text-white leading-none">
                  {eur(product.priceCents)}
                </p>
                {product.compareAtCents && (
                  <span className="text-xs text-gray-500 line-through">
                    {eur(product.compareAtCents)}
                  </span>
                )}
              </div>
              <Link
                to={`/product/${product.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 rounded-xl border border-[#1b2438] bg-[#07090e] px-3 py-2 text-xs font-bold text-gray-300 hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all"
              >
                <IconBag width={13} height={13} /> Buy
              </Link>
            </div>
          </div>
        </article>
      </TiltCard>
    </Reveal>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#1b2438] bg-[#0e131f] overflow-hidden">
      <div className="aspect-square shimmer" />
      <div className="space-y-2.5 p-4">
        <div className="h-2.5 w-1/3 shimmer rounded" />
        <div className="h-4 w-2/3 shimmer rounded" />
        <div className="h-3 w-1/2 shimmer rounded" />
        <div className="mt-3 h-8 shimmer rounded-xl" />
      </div>
    </div>
  );
}

const PAGE_SIZE = 12;

export function Shop() {
  const { products, loadingProducts } = useStore();
  const [typeTab, setTypeTab] = useState<TypeTab>("all");
  const [category, setCategory] = useState("All");
  const [brands, setBrands] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]); // now strings for unified footwear + tops
  const [maxPrice, setMaxPrice] = useState(3000);
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);

  // Derive categories for the active tab
  const categories = useMemo(() => {
    let list = products;
    if (typeTab === "footwear") list = products.filter((p) => (p as any).productType !== "tops");
    if (typeTab === "tops") list = products.filter((p) => (p as any).productType === "tops");
    const map = new Map<string, number>();
    for (const p of list) map.set(p.category, (map.get(p.category) ?? 0) + 1);
    return ["All", ...[...map.keys()].sort()];
  }, [products, typeTab]);

  const allBrands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products]);

  const allSizes = useMemo(() => {
    const foot = new Set<string>();
    const tops = new Set<string>();
    for (const p of products) {
      const isTops = (p as any).productType === "tops";
      for (const sz of p.sizes) {
        if (sz.stock > 0) {
          if (isTops) tops.add(CLOTHING_SIZE_MAP[sz.eu] ?? `${sz.eu}`);
          else foot.add(`EU${sz.eu}`);
        }
      }
    }
    const footArr = [...foot].sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2)));
    const topsArr = CLOTHING_SIZES.filter((s) => tops.has(s));
    if (typeTab === "tops") return topsArr;
    if (typeTab === "footwear") return footArr;
    return [...footArr, ...topsArr];
  }, [products, typeTab]);

  const filtered = useMemo(() => {
    let list = products;
    if (typeTab === "footwear") list = list.filter((p) => (p as any).productType !== "tops");
    if (typeTab === "tops") list = list.filter((p) => (p as any).productType === "tops");
    list = list.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (brands.length > 0 && !brands.includes(p.brand)) return false;
      if (p.priceCents > maxPrice * 100) return false;
      if (sizes.length > 0) {
        const isTops = (p as any).productType === "tops";
        const hasSize = p.sizes.some((s) => {
          if (s.stock <= 0) return false;
          const label = isTops ? CLOTHING_SIZE_MAP[s.eu] : `EU${s.eu}`;
          return sizes.includes(label);
        });
        if (!hasSize) return false;
      }
      return true;
    });
    switch (sort) {
      case "price-asc": return [...list].sort((a, b) => a.priceCents - b.priceCents);
      case "price-desc": return [...list].sort((a, b) => b.priceCents - a.priceCents);
      case "rating": return [...list].sort((a, b) => b.rating - a.rating);
      case "newest": return [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew));
      case "sale": return [...list].filter((p) => p.compareAtCents).sort((a, b) => {
        const da = a.compareAtCents ? (a.compareAtCents - a.priceCents) / a.compareAtCents : 0;
        const db = b.compareAtCents ? (b.compareAtCents - b.priceCents) / b.compareAtCents : 0;
        return db - da;
      });
      default: return [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.rating - a.rating);
    }
  }, [products, typeTab, category, brands, sizes, maxPrice, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  const activeCount =
    (category !== "All" ? 1 : 0) + brands.length + sizes.length + (maxPrice < 3000 ? 1 : 0);

  const reset = () => {
    setCategory("All");
    setBrands([]);
    setSizes([]);
    setMaxPrice(3000);
    setPage(1);
  };

  const handleTabChange = (tab: TypeTab) => {
    setTypeTab(tab);
    setCategory("All");
    setSizes([]);
    setPage(1);
  };

  const TYPE_TABS: Array<{ key: TypeTab; label: string; emoji: string }> = [
    { key: "all", label: "All Items", emoji: "🛍" },
    { key: "footwear", label: "Footwear", emoji: "👟" },
    { key: "tops", label: "Tops", emoji: "👕" },
  ];

  return (
    <section id="wall" className="relative scroll-mt-20 border-b border-[#1b2438] bg-[#07090e] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6 border-b border-[#1b2438]">
          <div>
            <span className="rounded bg-[#00f0ff]/10 px-3 py-1 text-xs font-bold text-[#00f0ff] uppercase tracking-widest border border-[#00f0ff]/20">
              Verified Authentic
            </span>
            <h2 className="mt-3 font-display text-4xl text-white uppercase tracking-tight">
              The Full Collection
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Showing <span className="text-white font-bold">{filtered.length}</span> of {products.length} styles in Ghana
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button onClick={reset} className="text-xs font-bold text-[#ff3b5c] hover:underline">
                Clear ({activeCount})
              </button>
            )}
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortKey); setPage(1); }}
              className="rounded-xl border border-[#1b2438] bg-[#0e131f] px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wider focus:border-[#00f0ff] focus:outline-none"
            >
              {SORTS.map(([k, label]) => (
                <option key={k} value={k}>Sort: {label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Tabs */}
        <div className="mt-6 flex gap-1 border-b border-[#1b2438]">
          {TYPE_TABS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`relative flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                typeTab === key
                  ? "text-[#00f0ff] tab-active"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <span>{emoji}</span>
              {label}
              {key !== "all" && (
                <span className="text-[10px] opacity-60">
                  ({products.filter((p) => key === "tops" ? (p as any).productType === "tops" : (p as any).productType !== "tops").length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-[#1b2438] bg-[#0e131f] p-5 space-y-6">
              <h3 className="flex items-center gap-2 text-xs font-black tracking-widest text-white uppercase">
                <IconFilter width={14} height={14} /> Filters
                {activeCount > 0 && (
                  <span className="ml-auto rounded-full bg-[#00f0ff] text-black text-[10px] font-black w-4 h-4 flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </h3>

              {/* Categories */}
              <div>
                <h4 className="mb-3 text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase">Category</h4>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCategory(c); setPage(1); }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                        category === c
                          ? "border-[#00f0ff] bg-[#00f0ff] text-black font-bold"
                          : "border-[#1b2438] bg-[#07090e] text-gray-400 hover:border-[#00f0ff]/50 hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h4 className="mb-3 text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase">Brand</h4>
                <div className="space-y-1">
                  {allBrands.map((b) => {
                    const on = brands.includes(b);
                    return (
                      <button
                        key={b}
                        onClick={() => { setBrands((prev) => on ? prev.filter((x) => x !== b) : [...prev, b]); setPage(1); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-[#151c2e]"
                      >
                        <span className={`grid h-4 w-4 place-items-center rounded border transition-colors text-[10px] font-bold ${on ? "border-[#00f0ff] bg-[#00f0ff] text-black" : "border-[#1b2438] bg-[#07090e]"}`}>
                          {on && "✓"}
                        </span>
                        <span className={`font-semibold tracking-wider ${on ? "text-[#00f0ff]" : "text-gray-300"}`}>{b}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="mb-3 text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase">
                  {typeTab === "tops" ? "Clothing Size" : "Size"}
                </h4>
                <div className={`grid gap-1.5 ${typeTab === "tops" ? "grid-cols-3" : "grid-cols-4"}`}>
                  {allSizes.map((s) => {
                    const on = sizes.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => { setSizes((prev) => on ? prev.filter((x) => x !== s) : [...prev, s]); setPage(1); }}
                        className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                          on ? "bg-[#00f0ff] text-black" : "bg-[#07090e] text-gray-300 border border-[#1b2438] hover:border-[#00f0ff]/50"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase">Max Price</h4>
                  <span className="font-display text-sm font-bold text-white">GH₵ {maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range" min={300} max={3000} step={50} value={maxPrice}
                  onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span>GH₵ 300</span><span>GH₵ 3,000</span>
                </div>
              </div>

              {activeCount > 0 && (
                <button onClick={reset} className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#ff3b5c]/40 bg-[#ff3b5c]/10 py-2 text-xs font-bold text-[#ff3b5c] hover:bg-[#ff3b5c]/20 transition-all">
                  <IconX width={12} height={12} /> Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-3">
            {loadingProducts ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1b2438] bg-[#0e131f] p-16 text-center">
                <span className="text-5xl mb-4">🔍</span>
                <h3 className="font-display text-2xl text-white uppercase tracking-wider">Nothing found</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-400">Try adjusting your filters or switching tabs.</p>
                <button onClick={reset} className="btn-cyan mt-6 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider">
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {visible.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-10 flex flex-col items-center gap-3">
                    <p className="text-xs text-gray-500">
                      Showing <span className="text-white font-bold">{visible.length}</span> of {filtered.length}
                    </p>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="btn-cyan rounded-xl px-10 py-3.5 text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                    >
                      Load More →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
