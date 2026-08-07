import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { Reveal } from "@/components/ui";
import { IconArrow } from "@/components/icons";

const BRAND_DATA: Record<
  string,
  { tagline: string; color: string; accent: string }
> = {
  AXIOM: {
    tagline: "Race-day weapons. Carbon plates. Personal bests.",
    color: "#D8F34A",
    accent: "#d8f34a",
  },
  KOVA: {
    tagline: "Court legends. Ankle harnesses. Rim-shaking drops.",
    color: "#BFAFF5",
    accent: "#bfaff5",
  },
  STATIC: {
    tagline: "Board-tested suede. Gum soles. Zero compromise.",
    color: "#E9C878",
    accent: "#e9c878",
  },
  PLUME: {
    tagline: "Pillow-soft EVA. Engineered knit. Velvet touch.",
    color: "#F5A8C8",
    accent: "#f5a8c8",
  },
  DRAFT: {
    tagline: "Trail lugs. Rock plates. Waterproof everything.",
    color: "#8FE3B8",
    accent: "#8fe3b8",
  },
  HALCYON: {
    tagline: "Cork footbeds. Foam slides. Summer essentials.",
    color: "#8FCBF5",
    accent: "#8fcbf5",
  },
};

export function Brands() {
  const { products } = useStore();

  const brandList = useMemo(() => {
    const brandNames = [...new Set(products.map((p) => p.brand))];
    return brandNames
      .map((name) => {
        const meta = BRAND_DATA[name];
        if (!meta) return null;
        const brandProducts = products.filter((p) => p.brand === name);
        const hero = brandProducts[0];
        return { name, ...meta, count: brandProducts.length, hero };
      })
      .filter(Boolean);
  }, [products]);

  if (brandList.length === 0) return null;

  return (
    <section id="brands" className="relative scroll-mt-20 border-b border-line">
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <p className="text-xs font-bold tracking-[0.24em] text-flame uppercase">
            Six independent labels
          </p>
          <h2 className="mt-2 font-display text-5xl tracking-wide uppercase sm:text-6xl">
            The Brands
          </h2>
          <p className="mt-3 max-w-lg text-sm text-dust">
            Every pair on the wall comes from one of these six independent labels.
            No conglomerates. No diffusion lines. Just people who live in the
            shoes they make.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brandList.map((b, i) =>
            b ? (
              <Reveal key={b.name} delay={i * 80}>
                <a
                  href="#wall"
                  className="group relative flex flex-col overflow-hidden border border-line bg-ink-2 transition-all duration-300 hover:-translate-y-1.5 hover:border-dust hover:shadow-[8px_8px_0_rgba(0,0,0,0.4)]"
                >
                  <div
                    className="relative flex h-40 items-center justify-center overflow-hidden"
                    style={{ backgroundColor: b.accent }}
                  >
                    <div className="bg-dots absolute inset-0 opacity-60" aria-hidden="true" />
                    {b.hero && (
                      <img
                        src={b.hero.image}
                        alt={b.hero.name}
                        className="relative h-28 w-28 -rotate-12 rounded object-cover shadow-lg transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110"
                      />
                    )}
                    <span className="absolute top-3 right-3 border border-ink/30 bg-ink/80 px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] text-bone uppercase">
                      {b.count} style{b.count !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3
                      className="font-display text-3xl tracking-wider uppercase"
                      style={{ color: b.color }}
                    >
                      {b.name}
                    </h3>
                    <p className="mt-1 text-sm text-dust">{b.tagline}</p>
                    <div className="mt-auto flex items-center gap-2 pt-4 text-xs font-bold tracking-[0.14em] text-dust uppercase transition-colors group-hover:text-volt">
                      <span>Shop {b.name}</span>
                      <IconArrow
                        width={13}
                        height={13}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </a>
              </Reveal>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}
