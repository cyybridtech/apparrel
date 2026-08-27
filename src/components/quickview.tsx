import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/format";
import { Stars } from "@/components/ui";
import {
  IconArrow,
  IconBag,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconShield,
  IconTruck,
  IconX,
} from "@/components/icons";

export function QuickView() {
  const { products, quickViewId, setQuickViewId, addToCart, setCartOpen, trackView } =
    useStore();
  const [eu, setEu] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [adding, setAdding] = useState(false);

  const product = useMemo(
    () => products.find((p) => p.id === quickViewId) ?? null,
    [products, quickViewId]
  );

  useEffect(() => {
    setEu(null);
    setQty(1);
    setSizeError(false);
    if (quickViewId !== null) trackView(quickViewId);
  }, [quickViewId, trackView]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuickViewId(null);
    };
    if (quickViewId !== null) {
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [quickViewId, setQuickViewId]);

  if (!product) return null;

  const isTops = (product as any).productType === "tops";
  const CLOTHING_MAP: Record<number, string> = { 1:"XS",2:"S",3:"M",4:"L",5:"XL",6:"XXL" };
  const selected = product.sizes.find((s) => s.eu === eu) ?? null;
  const maxQty = selected ? Math.max(selected.stock, 1) : 1;

  const handleAdd = async () => {
    if (!eu) {
      setSizeError(true);
      return;
    }
    setAdding(true);
    const ok = await addToCart(product.id, eu, qty);
    setAdding(false);
    if (ok) {
      setQuickViewId(null);
      setCartOpen(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${product.brand} ${product.name}`}
    >
      <button
        className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
        onClick={() => setQuickViewId(null)}
        aria-label="Close quick view"
      />
      <div className="animate-toast-in relative z-10 grid max-h-[92vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-2xl border border-[#1b2438] bg-[#0e131f] shadow-[0_24px_60px_rgba(0,0,0,0.7)] md:grid-cols-2">
        {/* image side */}
        <div
          className="relative flex items-center justify-center overflow-hidden p-8 min-h-72"
          style={{ backgroundColor: product.accent }}
        >
          <div className="bg-dots absolute inset-0 opacity-60" aria-hidden="true" />
          <span className="absolute top-4 left-4 border border-ink/40 bg-ink/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.2em] text-bone uppercase">
            {product.category}
          </span>
          <img
            src={product.image}
            alt={`${product.brand} ${product.name}`}
            className="relative w-full max-w-sm -rotate-6 object-cover shadow-[0_24px_50px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:rotate-0 hover:scale-105"
          />
          <span className="absolute bottom-4 right-4 rotate-[-4deg] bg-ink px-3 py-1.5 font-display text-sm tracking-wider text-volt uppercase shadow-[4px_4px_0_rgba(255,77,28,0.9)]">
            {product.colorway}
          </span>
        </div>

        {/* details side */}
        <div className="flex flex-col p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.24em] text-dust uppercase">
                {product.brand} · {product.releaseYear}
              </p>
              <h2 className="mt-1 font-display text-3xl tracking-wide uppercase">
                {product.name}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-dust">
                <Stars rating={product.rating} />
                <span>
                  {product.rating.toFixed(1)} ({product.ratingCount} reviews)
                </span>
              </div>
            </div>
            <button
              onClick={() => setQuickViewId(null)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#1b2438] text-gray-400 transition-colors hover:border-[#ff3b5c] hover:text-[#ff3b5c]"
              aria-label="Close"
            >
              <IconX width={17} height={17} />
            </button>
          </div>

          <p className="mt-3 flex items-baseline gap-3">
            <span className="font-display text-3xl text-volt">
              {eur(product.priceCents)}
            </span>
            {product.compareAtCents && (
              <span className="text-sm text-dust line-through">
                {eur(product.compareAtCents)}
              </span>
            )}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-dust">
            {product.description}
          </p>

          {/* size picker */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-[11px] font-bold tracking-[0.22em] uppercase">
                {isTops ? "Select size" : "Select size (EU)"}
              </h3>
              {sizeError && (
                <span className="animate-pop text-[11px] font-bold tracking-wider text-flame uppercase">
                  Pick a size first
                </span>
              )}
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {product.sizes.map((s) => {
                const out = s.stock <= 0;
                const on = eu === s.eu;
                const label = isTops ? (CLOTHING_MAP[s.eu] ?? s.eu) : s.eu;
                return (
                  <button
                    key={s.eu}
                    disabled={out}
                    onClick={() => {
                      setEu(s.eu);
                      setSizeError(false);
                    }}
                    className={`relative border py-2.5 text-sm font-semibold transition-all active:scale-90 ${
                      on
                        ? "border-[#00f0ff] bg-[#00f0ff] text-black"
                        : out
                          ? "cursor-not-allowed border-line text-dust/40 line-through"
                          : "border-line hover:border-[#00f0ff]/60 hover:text-white"
                    }`}
                  >
                    {label}
                    {!out && s.stock <= 2 && (
                      <span
                        className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#ff3b5c]"
                        title={`Only ${s.stock} left`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {selected && selected.stock <= 2 && (
              <p className="mt-2 text-[11px] font-semibold tracking-wider text-flame uppercase">
                Only {selected.stock} left in EU {selected.eu}
              </p>
            )}
          </div>

          {/* qty + add */}
          <div className="mt-6 flex gap-3">
            <div className="flex items-center border border-line">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-12 w-11 place-items-center text-dust transition-colors hover:bg-ink-3 hover:text-bone"
                aria-label="Decrease quantity"
              >
                <IconMinus width={15} height={15} />
              </button>
              <span className="w-10 text-center font-display text-lg">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="grid h-12 w-11 place-items-center text-dust transition-colors hover:bg-ink-3 hover:text-bone"
                aria-label="Increase quantity"
              >
                <IconPlus width={15} height={15} />
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="group flex flex-1 items-center justify-center gap-2.5 bg-flame px-5 font-display text-lg tracking-wide text-ink uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(255,77,28,0.3)] active:translate-y-0 disabled:opacity-60"
            >
              <IconBag
                width={19}
                height={19}
                className="transition-transform group-hover:-rotate-12"
              />
              {adding ? "Adding…" : "Add to bag"}
            </button>
          </div>

          {/* perks */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-[#1b2438] pt-5 text-center">
            {[
              { icon: <IconTruck width={18} height={18} />, label: "Free ship GH₵1,500+" },
              { icon: <IconRefresh width={18} height={18} />, label: "30-day exchange" },
              { icon: <IconShield width={18} height={18} />, label: "100% Authentic" },
            ].map((perk) => (
              <div
                key={perk.label}
                className="flex flex-col items-center gap-1.5 text-dust"
              >
                <span className="text-volt">{perk.icon}</span>
                <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                  {perk.label}
                </span>
              </div>
            ))}
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              ["Weight", `${product.weightGrams} g`],
              ["Terrain", product.terrain],
              ["Drop", `${product.releaseYear}`],
            ].map(([k, v]) => (
              <div key={k} className="border border-line bg-ink px-2 py-2.5">
                <dt className="text-[9px] font-bold tracking-[0.2em] text-dust uppercase">
                  {k}
                </dt>
                <dd className="mt-0.5 text-xs font-semibold text-bone">{v}</dd>
              </div>
            ))}
          </dl>

          <Link
            to={`/product/${product.slug}`}
            onClick={() => setQuickViewId(null)}
            className="group mt-5 flex items-center justify-center gap-2 border border-line py-3 text-xs font-bold tracking-[0.14em] uppercase transition-all hover:border-volt hover:text-volt"
          >
            View full details
            <IconArrow
              width={13}
              height={13}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
