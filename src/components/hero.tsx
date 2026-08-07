import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui";
import { IconArrow, IconBolt } from "@/components/icons";
import { RotatingShoe3D } from "@/components/RotatingShoe3D";
import type { ProductWithSizes } from "@/lib/types";

const STATS: Array<[string, string]> = [
  ["23+", "Fresh Styles"],
  ["GH₵ 1,500", "Free Ghana Shipping"],
  ["XS–XXL & EU 36–46", "All Sizes"],
  ["100%", "Authentic Guaranteed"],
];

export function Hero() {
  const [featured, setFeatured] = useState<ProductWithSizes | null>(null);

  useEffect(() => {
    fetch("/api/featured-product")
      .then((r) => r.json())
      .then((d) => {
        if (d.product) setFeatured(d.product);
      })
      .catch(() => {});
  }, []);

  const discount = featured?.compareAtCents && featured.priceCents
    ? Math.round(((featured.compareAtCents - featured.priceCents) / featured.compareAtCents) * 100)
    : 0;

  return (
    <section className="relative overflow-hidden border-b border-[#1b2438] bg-[#07090e]">
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#00f0ff]/15 blur-[140px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#7000ff]/15 blur-[120px]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-12 sm:px-6 lg:grid-cols-12 lg:pt-20">
        {/* Left: Hero Copy */}
        <div className="lg:col-span-6 z-10">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00f0ff] px-3.5 py-1 text-xs font-extrabold tracking-widest text-black uppercase shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                <IconBolt width={12} height={12} />
                ACCRA HEAT DROP — LIVE NOW
              </span>
              {discount > 0 && (
                <span className="rounded-full bg-[#ff3b5c] px-3 py-1 text-xs font-black text-white tracking-wider uppercase shadow-md">
                  SALE −{discount}% OFF
                </span>
              )}
              <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                EST. 2026 • GHANA
              </span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-6 font-display leading-[0.9] tracking-tight uppercase text-white">
              <span className="block text-5xl sm:text-7xl lg:text-[6.5rem] font-extrabold">STEP IN</span>
              <span className="cyan-gradient-text block text-5xl sm:text-7xl lg:text-[6.5rem] font-black">STYLE.</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-300 font-normal">
              Ghana's premier destination for premium kicks, designer shirts, club tees & streetwear. Express delivery to Accra, Kumasi, Takoradi & Tema.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#wall"
                className="btn-cyan group inline-flex items-center gap-3 rounded-xl px-7 py-4 font-display text-lg tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(0,240,255,0.3)]"
              >
                Explore Collection
                <IconArrow width={18} height={18} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-[#00f0ff]/40 bg-[#0e131f] px-6 py-4 text-xs font-bold tracking-widest text-[#00f0ff] uppercase transition-all hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]"
              >
                ⚡ Admin Portal
              </a>
            </div>
          </Reveal>
        </div>

        {/* Right: Rotating Featured Product */}
        <div className="relative lg:col-span-6 flex items-center justify-center">
          <Reveal delay={140} className="w-full">
            {featured ? (
              <RotatingShoe3D
                imageSrc={featured.image}
                shoeName={featured.name}
                priceGhs={(featured.priceCents / 100).toLocaleString("en-GH", { minimumFractionDigits: 0 })}
                compareGhs={featured.compareAtCents ? (featured.compareAtCents / 100).toLocaleString("en-GH") : undefined}
                discount={discount}
              />
            ) : (
              /* Loading skeleton */
              <div className="relative mx-auto w-full max-w-md h-[440px] flex items-center justify-center">
                <div className="w-72 h-72 rounded-3xl bg-[#0e131f] border border-[#1b2438] animate-pulse" />
              </div>
            )}
          </Reveal>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="relative border-t border-[#1b2438] bg-[#0e131f]/50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-[#1b2438] md:grid-cols-4">
          {STATS.map(([num, label], i) => (
            <Reveal key={label} delay={i * 80} className="h-full">
              <div className="flex h-full flex-col gap-1 px-6 py-5 transition-colors hover:bg-[#151c2e]/40">
                <span className="font-display text-2xl text-white font-bold">{num}</span>
                <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">{label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
