import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Reveal, Stars } from "@/components/ui";
import { eur } from "@/lib/format";
import type { ProductWithSizes } from "@/lib/types";
import {
  IconArrow,
  IconBag,
  IconChevronLeft,
  IconEye,
  IconHeart,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconRuler,
  IconShield,
  IconTruck,
} from "@/components/icons";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;
  const {
    addToCart,
    setCartOpen,
    wishlist,
    toggleWish,
    trackView,
    setSizeGuideOpen,
  } = useStore();

  const [product, setProduct] = useState<ProductWithSizes | null>(null);
  const [related, setRelated] = useState<ProductWithSizes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [eu, setEu] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setProduct(data.product);
      setRelated(data.related ?? []);
      if (data.product) trackView(data.product.id);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug, trackView]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setEu(null);
    setQty(1);
    setSizeError(false);
  }, [slug]);

  const selected = useMemo(
    () => product?.sizes.find((s) => s.eu === eu) ?? null,
    [product, eu]
  );
  const maxQty = selected ? Math.max(selected.stock, 1) : 1;
  const wished = product ? wishlist.includes(product.id) : false;
  const totalStock = product
    ? product.sizes.reduce((n, s) => n + s.stock, 0)
    : 0;
  const discount = product?.compareAtCents
    ? Math.round(
        ((product.compareAtCents - product.priceCents) /
          product.compareAtCents) *
          100
      )
    : 0;

  const handleAdd = async () => {
    if (!product || !eu) {
      setSizeError(true);
      return;
    }
    setAdding(true);
    const ok = await addToCart(product.id, eu, qty);
    setAdding(false);
    if (ok) setCartOpen(true);
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid animate-pulse gap-10 lg:grid-cols-2">
          <div className="aspect-square bg-ink-2" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-ink-2" />
            <div className="h-10 w-64 bg-ink-2" />
            <div className="h-6 w-32 bg-ink-2" />
            <div className="h-24 bg-ink-2" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid place-items-center border border-dashed border-line py-32 text-center">
          <div>
            <p className="font-display text-4xl uppercase">Shoe not found</p>
            <p className="mt-2 text-sm text-dust">
              This pair might have sold out or doesn&apos;t exist.
            </p>
            <Link
              to="/#wall"
              className="mt-6 inline-flex items-center gap-2 bg-volt px-5 py-3 font-display text-base tracking-wide text-ink uppercase transition-all hover:-translate-y-0.5"
            >
              Back to the wall <IconArrow width={16} height={16} />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* breadcrumb */}
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 text-xs text-dust sm:px-6">
          <Link
            to="/#wall"
            className="inline-flex items-center gap-1 transition-colors hover:text-volt"
          >
            <IconChevronLeft width={12} height={12} />
            The Wall
          </Link>
          <span>/</span>
          <span className="text-bone">{product.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* image */}
          <Reveal>
            <div className="group relative">
              <div
                className="relative aspect-square overflow-hidden"
                style={{ backgroundColor: product.accent }}
              >
                <div
                  className="bg-dots absolute inset-0 opacity-60"
                  aria-hidden="true"
                />
                <img
                  src={product.image}
                  alt={`${product.brand} ${product.name} in ${product.colorway}`}
                  className={`relative h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                    totalStock === 0 ? "opacity-40 grayscale" : ""
                  }`}
                />

                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-volt px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-ink uppercase">
                      New
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="bg-flame px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-ink uppercase">
                      −{discount}%
                    </span>
                  )}
                  {totalStock === 0 && (
                    <span className="border border-bone bg-ink/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-bone uppercase">
                      Sold out
                    </span>
                  )}
                </div>

                <button
                  onClick={() => toggleWish(product.id)}
                  className={`absolute top-4 right-4 grid h-10 w-10 place-items-center border transition-all active:scale-90 ${
                    wished
                      ? "border-flame bg-flame text-ink"
                      : "border-ink/30 bg-bone/85 text-ink hover:bg-bone"
                  }`}
                  aria-label="Toggle wishlist"
                >
                  <IconHeart width={18} height={18} filled={wished} />
                </button>
              </div>

              <div className="absolute -bottom-4 -right-4 z-10 rotate-3 border border-line bg-ink-2 px-4 py-2.5 shadow-[5px_5px_0_rgba(255,77,28,0.9)]">
                <p className="text-[10px] font-bold tracking-[0.18em] text-dust uppercase">
                  {product.colorway}
                </p>
                <p className="font-display text-xl text-volt">
                  {eur(product.priceCents)}
                </p>
              </div>
            </div>
          </Reveal>

          {/* details */}
          <div className="flex flex-col">
            <Reveal delay={100}>
              <p className="text-[11px] font-bold tracking-[0.24em] text-dust uppercase">
                {product.brand} · {product.releaseYear} · {product.category}
              </p>
              <h1 className="mt-1 font-display text-4xl tracking-wide uppercase sm:text-5xl">
                {product.name}
              </h1>
              <div className="mt-3 flex items-center gap-3 text-xs text-dust">
                <Stars rating={product.rating} />
                <span>
                  {product.rating.toFixed(1)} ({product.ratingCount} reviews)
                </span>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-4xl text-volt">
                  {eur(product.priceCents)}
                </span>
                {product.compareAtCents && (
                  <span className="text-base text-dust line-through">
                    {eur(product.compareAtCents)}
                  </span>
                )}
              </p>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-5 text-sm leading-relaxed text-dust">
                {product.description}
              </p>
            </Reveal>

            {/* specs grid */}
            <Reveal delay={240}>
              <dl className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ["Weight", `${product.weightGrams} g`],
                  ["Terrain", product.terrain],
                  ["Drop year", `${product.releaseYear}`],
                ].map(([k, v]) => (
                  <div key={k} className="border border-line bg-ink px-3 py-3">
                    <dt className="text-[9px] font-bold tracking-[0.2em] text-dust uppercase">
                      {k}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-bone">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {/* size picker */}
            <Reveal delay={280}>
              <div className="mt-6">
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold tracking-[0.22em] uppercase">
                    Select size (EU)
                  </h3>
                  <div className="flex items-center gap-3">
                    {sizeError && (
                      <span className="animate-pop text-[11px] font-bold tracking-wider text-flame uppercase">
                        Pick a size first
                      </span>
                    )}
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="flex items-center gap-1 text-[11px] font-bold tracking-wider text-dust uppercase transition-colors hover:text-volt"
                    >
                      <IconRuler width={13} height={13} />
                      Size guide
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
                  {product.sizes.map((s) => {
                    const out = s.stock <= 0;
                    const on = eu === s.eu;
                    return (
                      <button
                        key={s.eu}
                        disabled={out}
                        onClick={() => {
                          setEu(s.eu);
                          setSizeError(false);
                        }}
                        className={`relative border py-3 text-sm font-semibold transition-all active:scale-90 ${
                          on
                            ? "border-volt bg-volt text-ink"
                            : out
                              ? "cursor-not-allowed border-line text-dust/40 line-through"
                              : "border-line hover:border-dust hover:text-bone"
                        }`}
                      >
                        {s.eu}
                        {!out && s.stock <= 2 && (
                          <span
                            className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-flame"
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
            </Reveal>

            {/* qty + add */}
            <Reveal delay={320}>
              <div className="mt-6 flex gap-3">
                <div className="flex items-center border border-line">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="grid h-14 w-12 place-items-center text-dust transition-colors hover:bg-ink-3 hover:text-bone"
                    aria-label="Decrease quantity"
                  >
                    <IconMinus width={16} height={16} />
                  </button>
                  <span className="w-12 text-center font-display text-xl">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    className="grid h-14 w-12 place-items-center text-dust transition-colors hover:bg-ink-3 hover:text-bone"
                    aria-label="Increase quantity"
                  >
                    <IconPlus width={16} height={16} />
                  </button>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={adding}
                  className="group flex flex-1 items-center justify-center gap-3 bg-flame px-6 py-4 font-display text-xl tracking-wide text-ink uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(255,77,28,0.3)] active:translate-y-0 disabled:opacity-60"
                >
                  <IconBag
                    width={21}
                    height={21}
                    className="transition-transform group-hover:-rotate-12"
                  />
                  {adding ? "Adding…" : "Add to bag"}
                </button>
              </div>
            </Reveal>

            {/* perks */}
            <Reveal delay={360}>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-6 text-center">
                {[
                  {
                    icon: <IconTruck width={20} height={20} />,
                    label: "Free ship €150+",
                  },
                  {
                    icon: <IconRefresh width={20} height={20} />,
                    label: "30-day returns",
                  },
                  {
                    icon: <IconShield width={20} height={20} />,
                    label: "2-yr warranty",
                  },
                ].map((perk) => (
                  <div
                    key={perk.label}
                    className="flex flex-col items-center gap-2 text-dust"
                  >
                    <span className="text-volt">{perk.icon}</span>
                    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase">
                      {perk.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* related products */}
        {related.length > 0 && (
          <div className="mt-20 border-t border-line pt-14">
            <Reveal>
              <h2 className="font-display text-3xl tracking-wide uppercase">
                You might also like
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r, i) => (
                <Reveal key={r.id} delay={i * 80}>
                  <Link
                    to={`/product/${r.slug}`}
                    className="group flex flex-col border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1.5 hover:border-dust hover:shadow-[6px_6px_0_rgba(0,0,0,0.35)]"
                  >
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{ backgroundColor: r.accent }}
                    >
                      <div
                        className="bg-dots absolute inset-0 opacity-60"
                        aria-hidden="true"
                      />
                      <img
                        src={r.image}
                        alt={`${r.brand} ${r.name}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1.5 bg-ink/80 py-1.5 text-[10px] font-bold tracking-wider text-bone uppercase opacity-0 transition-opacity group-hover:opacity-100">
                        <IconEye width={12} height={12} />
                        View details
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-bold tracking-[0.2em] text-dust uppercase">
                        {r.brand}
                      </p>
                      <h3 className="font-display text-lg tracking-wide uppercase">
                        {r.name}
                      </h3>
                      <div className="mt-1 flex items-center justify-between">
                        <Stars rating={r.rating} />
                        <span className="font-display text-base text-volt">
                          {eur(r.priceCents)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
