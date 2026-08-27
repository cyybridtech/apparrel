import { useEffect, useState } from "react";
import { Reveal } from "@/components/ui";
import { IconArrow, IconBolt } from "@/components/icons";
import { RotatingShoe3D } from "@/components/RotatingShoe3D";
import type { ProductWithSizes } from "@/lib/types";

const STATS: Array<[string, string]> = [
  ["23+", "Fresh Drops"],
  ["GH₵ 1,500", "Free Ghana Delivery"],
  ["XS–XXL & EU 36–46", "All Sizes"],
  ["100%", "Authentic Guaranteed"],
];

type ThemeMood = "cyan" | "volt" | "flame" | "purple";

const MOOD_CONFIGS: Record<ThemeMood, { name: string; hex: string; gradientClass: string; badgeBg: string; textHex: string }> = {
  cyan: {
    name: "Cyber Cyan",
    hex: "#00f0ff",
    gradientClass: "cyan-gradient-text",
    badgeBg: "bg-[#00f0ff] text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]",
    textHex: "#00f0ff",
  },
  volt: {
    name: "Volt Gold",
    hex: "#d8f34a",
    gradientClass: "volt-gradient-text",
    badgeBg: "bg-[#d8f34a] text-black shadow-[0_0_20px_rgba(216,243,74,0.4)]",
    textHex: "#d8f34a",
  },
  flame: {
    name: "Crimson Flame",
    hex: "#ff3b5c",
    gradientClass: "flame-gradient-text",
    badgeBg: "bg-[#ff3b5c] text-white shadow-[0_0_20px_rgba(255,59,92,0.4)]",
    textHex: "#ff3b5c",
  },
  purple: {
    name: "Cyber Purple",
    hex: "#a855f7",
    gradientClass: "purple-gradient-text",
    badgeBg: "bg-[#a855f7] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]",
    textHex: "#a855f7",
  },
};

const DEFAULT_FEATURED: ProductWithSizes = {
  id: 1,
  slug: "voltage-runner-2",
  name: "Voltage Runner 2",
  brand: "AXIOM",
  productType: "footwear",
  category: "Road",
  colorway: "Ink / Volt",
  description: "Our fastest daily trainer. A nitrogen-injected midsole returns 87% of your energy while the volt outsole makes sure everyone sees you coming.",
  image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=900&fit=crop&auto=format&q=85",
  accent: "#00f0ff",
  priceCents: 149000,
  compareAtCents: 189000,
  rating: 4.8,
  ratingCount: 412,
  isNew: true,
  isFeatured: true,
  releaseYear: 2026,
  weightGrams: 238,
  terrain: "Road",
  sizes: [],
};

export function Hero() {
  const [featured, setFeatured] = useState<ProductWithSizes>(DEFAULT_FEATURED);
  const [mood, setMood] = useState<ThemeMood>("cyan");

  useEffect(() => {
    // 1. Check local storage hero drop set by admin for instant rendering
    const storedHero = localStorage.getItem("kicks_hero_product");
    if (storedHero) {
      try {
        const parsed = JSON.parse(storedHero);
        if (parsed && parsed.name && parsed.image) {
          setFeatured(parsed);
        }
      } catch {}
    }

    // 2. Fetch latest live featured product from API
    fetch("/api/featured-product")
      .then((r) => r.json())
      .then((d) => {
        if (d.product && d.product.name) {
          setFeatured(d.product);
        }
      })
      .catch(() => {});
  }, []);

  const discount = featured?.compareAtCents && featured.priceCents
    ? Math.round(((featured.compareAtCents - featured.priceCents) / featured.compareAtCents) * 100)
    : 0;

  const currentMood = MOOD_CONFIGS[mood];

  return (
    <section className="relative overflow-hidden border-b border-[#1b2438] bg-[#07090e] bg-grid-pattern">
      {/* Dynamic Ambient Glowing Orbs */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-[550px] w-[550px] rounded-full blur-[140px] animate-pulse-glow transition-all duration-700"
        style={{ backgroundColor: currentMood.hex, opacity: 0.18 }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-10 h-80 w-80 rounded-full blur-[130px] animate-float-orb transition-all duration-700"
        style={{ backgroundColor: "#7000ff", opacity: 0.15 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-12 sm:px-6 lg:grid-cols-12 lg:pt-20">
        {/* Left: Hero Content & Controls */}
        <div className="lg:col-span-6 z-10">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold tracking-widest uppercase ${currentMood.badgeBg}`}>
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
              <span className={`${currentMood.gradientClass} block text-5xl sm:text-7xl lg:text-[6.5rem] font-black transition-all duration-500`}>
                STYLE.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-gray-300 font-normal">
              Ghana's premier destination for premium kicks, designer shirts, club tees & streetwear. Express delivery to Accra, Kumasi, Takoradi & Tema.
            </p>
          </Reveal>

          {/* Delivery & Mood Selector Bar */}
          <Reveal delay={220}>
            <div className="mt-6 flex flex-wrap items-center gap-4 pt-2">
              {/* Delivery Countdown Pill */}
              <div className="inline-flex items-center gap-2 rounded-xl bg-[#0e131f] border border-[#1b2438] px-3.5 py-2 text-xs text-gray-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>🚀 Order in next <strong className="text-white font-bold font-mono">2h 14m</strong> for Accra Same-Day Delivery</span>
              </div>

              {/* Neon Theme Mood Switcher */}
              <div className="flex items-center gap-1.5 rounded-xl bg-[#0e131f] border border-[#1b2438] p-1">
                {(["cyan", "volt", "flame", "purple"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    title={`Switch hero mood to ${MOOD_CONFIGS[m].name}`}
                    className={`h-5 w-5 rounded-full transition-all ${
                      mood === m ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#07090e]" : "opacity-60 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: MOOD_CONFIGS[m].hex }}
                  />
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#wall"
                style={{ backgroundColor: currentMood.hex }}
                className="btn-cyan group inline-flex items-center gap-3 rounded-xl px-7 py-4 font-display text-lg tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(0,240,255,0.3)] !text-black"
              >
                Explore Collection
                <IconArrow width={18} height={18} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl border border-[#1b2438] bg-[#0e131f] px-6 py-4 text-xs font-bold tracking-widest text-gray-300 uppercase transition-all hover:bg-[#151c2e] hover:border-[#00f0ff]/40 hover:text-[#00f0ff]"
              >
                ⚡ Admin Control
              </a>
            </div>
          </Reveal>
        </div>

        {/* Right: Rotating Featured Product */}
        <div className="relative lg:col-span-6 flex items-center justify-center">
          <Reveal delay={140} className="w-full">
            <RotatingShoe3D
              imageSrc={featured.image}
              shoeName={featured.name}
              priceGhs={(featured.priceCents / 100).toLocaleString("en-GH", { minimumFractionDigits: 0 })}
              compareGhs={featured.compareAtCents ? (featured.compareAtCents / 100).toLocaleString("en-GH") : undefined}
              discount={discount}
            />
          </Reveal>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="relative border-t border-[#1b2438] bg-[#0e131f]/60 backdrop-blur-md">
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
