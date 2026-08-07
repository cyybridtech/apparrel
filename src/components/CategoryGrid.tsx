import { Reveal } from "@/components/ui";

interface Category {
  label: string;
  sub: string;
  emoji: string;
  href: string;
  accent: string;
  image: string;
}

const CATS: Category[] = [
  {
    label: "Footwear",
    sub: "Kicks, boots, slides & more",
    emoji: "👟",
    href: "/#wall",
    accent: "#00f0ff",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop&auto=format",
  },
  {
    label: "Tops",
    sub: "Shirts, club tees & designer",
    emoji: "👕",
    href: "/#wall",
    accent: "#a855f7",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop&auto=format",
  },
  {
    label: "On Sale",
    sub: "Up to 30% off selected items",
    emoji: "🔥",
    href: "/#wall",
    accent: "#ff3b5c",
    image:
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&fit=crop&auto=format",
  },
  {
    label: "New Arrivals",
    sub: "Fresh drops — updated weekly",
    emoji: "⚡",
    href: "/#wall",
    accent: "#ffb800",
    image:
      "https://images.unsplash.com/photo-1608231387042-720250b22ea8?w=600&h=400&fit=crop&auto=format",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-14 px-4 sm:px-6 bg-[#07090e] border-b border-[#1b2438]">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[10px] font-black tracking-[0.3em] text-[#00f0ff] uppercase">
                Shop by Category
              </span>
              <h2 className="mt-1 font-display text-3xl sm:text-4xl text-white uppercase tracking-tight">
                Find Your Style
              </h2>
            </div>
            <a
              href="/#wall"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-gray-400 uppercase hover:text-[#00f0ff] transition-colors"
            >
              View all →
            </a>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CATS.map((cat, i) => (
            <Reveal key={cat.label} delay={i * 70}>
              <a
                href={cat.href}
                className="cat-card group block rounded-2xl overflow-hidden border border-[#1b2438] hover:border-opacity-0 transition-all duration-300"
                style={{
                  boxShadow: `0 0 0 0 ${cat.accent}`,
                  transition: "box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 8px 32px ${cat.accent}30`;
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = `${cat.accent}60`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 0 0 ${cat.accent}`;
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "#1b2438";
                }}
              >
                {/* Image */}
                <div className="relative h-40 sm:h-52 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="cat-overlay absolute inset-0" />

                  {/* Emoji pill */}
                  <span
                    className="absolute top-3 left-3 text-xl leading-none rounded-xl px-2.5 py-1.5 font-black"
                    style={{ background: `${cat.accent}22`, border: `1px solid ${cat.accent}44` }}
                  >
                    {cat.emoji}
                  </span>
                </div>

                {/* Text */}
                <div className="bg-[#0e131f] p-4 group-hover:bg-[#151c2e] transition-colors">
                  <p
                    className="font-display text-lg font-black uppercase tracking-wide transition-colors"
                    style={{ color: "white" }}
                  >
                    {cat.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.sub}</p>
                  <p
                    className="mt-2 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: cat.accent }}
                  >
                    Shop now →
                  </p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
