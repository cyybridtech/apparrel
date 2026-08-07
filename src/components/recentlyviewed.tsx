import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { eur } from "@/lib/format";
import { Stars, Reveal } from "@/components/ui";
import { IconClock, IconEye } from "@/components/icons";

export function RecentlyViewed() {
  const { products, recentlyViewed, setQuickViewId } = useStore();

  const items = useMemo(
    () =>
      recentlyViewed
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean),
    [recentlyViewed, products]
  );

  if (items.length === 0) return null;

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal>
          <div className="flex items-center gap-3 mb-8">
            <IconClock width={18} height={18} className="text-dust" />
            <h2 className="font-display text-2xl tracking-wide uppercase">
              Recently viewed
            </h2>
          </div>
        </Reveal>

        <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar">
          {items.map((p, i) =>
            p ? (
              <Reveal key={p.id} delay={i * 60}>
                <button
                  onClick={() => setQuickViewId(p.id)}
                  className="group flex w-56 shrink-0 flex-col border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1 hover:border-dust hover:shadow-[6px_6px_0_rgba(0,0,0,0.35)]"
                >
                  <div
                    className="relative h-44 overflow-hidden"
                    style={{ backgroundColor: p.accent }}
                  >
                    <div className="bg-dots absolute inset-0 opacity-50" aria-hidden="true" />
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1.5 bg-ink/80 py-1.5 text-[10px] font-bold tracking-wider text-bone uppercase opacity-0 transition-opacity group-hover:opacity-100">
                      <IconEye width={12} height={12} />
                      Quick view
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] font-bold tracking-[0.2em] text-dust uppercase">
                      {p.brand}
                    </p>
                    <p className="truncate font-display text-base tracking-wide uppercase">
                      {p.name}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <Stars rating={p.rating} />
                      <span className="font-display text-sm text-volt">
                        {eur(p.priceCents)}
                      </span>
                    </div>
                  </div>
                </button>
              </Reveal>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}
