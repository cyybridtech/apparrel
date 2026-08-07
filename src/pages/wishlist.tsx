import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/format";
import { Reveal, Stars } from "@/components/ui";
import { IconBag, IconEye, IconHeart, IconTrash } from "@/components/icons";

export default function WishlistPage() {
  const { products, wishlist, toggleWish, setQuickViewId } = useStore();
  const wished = products.filter((p) => wishlist.includes(p.id));

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // can use toast here but we'd need to import useStore again – already done
  };

  return (
    <main className="min-h-screen bg-[#07090e] pb-20">
      {/* Header band */}
      <div className="border-b border-[#1b2438] bg-[#0e131f] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-black tracking-[0.3em] text-[#ff3b5c] uppercase">
              ❤️ Saved Items
            </span>
            <h1 className="mt-1 font-display text-4xl text-white uppercase tracking-tight">
              My Wishlist
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {wished.length === 0 ? "No saved items yet." : `${wished.length} item${wished.length !== 1 ? "s" : ""} saved`}
            </p>
          </div>
          {wished.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="rounded-xl border border-[#1b2438] px-4 py-2.5 text-xs font-bold tracking-wider text-gray-300 hover:border-[#00f0ff] hover:text-[#00f0ff] transition-all uppercase"
              >
                🔗 Share Wishlist
              </button>
              <Link
                to="/#wall"
                className="btn-cyan rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10">
        {wished.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
            <div className="grid h-24 w-24 place-items-center rounded-3xl border-2 border-dashed border-[#1b2438] text-4xl">
              🤍
            </div>
            <div>
              <h2 className="font-display text-3xl text-white uppercase">Nothing saved yet</h2>
              <p className="mt-2 text-sm text-gray-400 max-w-sm">
                Hit the heart on any item to save it here. Your wishlist persists across visits.
              </p>
            </div>
            <Link to="/#wall" className="btn-cyan rounded-xl px-8 py-3.5 text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              Explore the Collection →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wished.map((p, i) => {
              const discount = p.compareAtCents
                ? Math.round(((p.compareAtCents - p.priceCents) / p.compareAtCents) * 100)
                : 0;
              return (
                <Reveal key={p.id} delay={i * 60}>
                  <article className="group relative flex flex-col rounded-2xl border border-[#1b2438] bg-[#0e131f] overflow-hidden transition-all hover:border-[#ff3b5c]/50 hover:shadow-[0_12px_36px_rgba(255,59,92,0.1)] hover:-translate-y-1">
                    {/* Image */}
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{ backgroundColor: p.accent }}
                      onClick={() => setQuickViewId(p.id)}
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                      />
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 sale-badge bg-[#ff3b5c] px-2 py-0.5 text-[10px] font-black text-white uppercase rounded">
                          −{discount}%
                        </span>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }}
                        className="absolute top-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full border border-[#ff3b5c] bg-[#ff3b5c] text-white transition-all hover:bg-transparent hover:text-[#ff3b5c] z-10"
                        aria-label="Remove from wishlist"
                      >
                        <IconHeart width={15} height={15} filled />
                      </button>

                      {/* Quick view on hover */}
                      <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); setQuickViewId(p.id); }}
                          className="btn-cyan w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold uppercase"
                        >
                          <IconEye width={14} height={14} /> Quick View
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 uppercase tracking-wider font-bold">
                        <span>{p.brand}</span>
                        <span className="text-[#00f0ff]">{p.category}</span>
                      </div>
                      <h3 className="mt-1 font-display text-base text-white font-bold leading-tight line-clamp-1">{p.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{p.colorway}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <Stars rating={p.rating} />
                        <span className="text-[10px] text-gray-500">({p.ratingCount})</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-[#1b2438] pt-3 mt-3">
                        <div>
                          <p className="font-display text-lg font-bold text-white leading-none">{eur(p.priceCents)}</p>
                          {p.compareAtCents && (
                            <span className="text-xs text-gray-500 line-through">{eur(p.compareAtCents)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWish(p.id)}
                            className="grid h-9 w-9 place-items-center rounded-lg border border-[#1b2438] text-gray-400 hover:border-[#ff3b5c] hover:text-[#ff3b5c] transition-all"
                            title="Remove from wishlist"
                          >
                            <IconTrash width={14} height={14} />
                          </button>
                          <button
                            onClick={() => setQuickViewId(p.id)}
                            className="btn-cyan flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                          >
                            <IconBag width={13} height={13} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
