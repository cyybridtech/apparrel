import { Reveal, Stars } from "@/components/ui";
import { IconQuote } from "@/components/icons";

const REVIEWS = [
  {
    name: "Lara M.",
    location: "Berlin",
    product: "Voltage Runner 2",
    rating: 5,
    text: "Wore these for a half-marathon and PR'd by three minutes. The nitrogen midsole is real — my legs felt fresh at km 18 for the first time ever.",
    accent: "#D8F34A",
  },
  {
    name: "Mateo R.",
    location: "Barcelona",
    product: "Static Low",
    rating: 5,
    text: "The flick is chef's kiss. Six months of skating and the suede is barely worn. Best board shoe I've owned, and the gum sole grips everything.",
    accent: "#E9C878",
  },
  {
    name: "Sophie K.",
    location: "Amsterdam",
    product: "Plume Drift",
    rating: 5,
    text: "I bought these as house shoes and now I wear them to brunch, the studio, the airport. They feel like walking on actual clouds. Got my mom a pair.",
    accent: "#F5A8C8",
  },
  {
    name: "Jonas W.",
    location: "Munich",
    product: "Field Boot",
    rating: 5,
    text: "Two winters and they look better than day one. The leather has developed this perfect patina. Already told DRAFT they can have all my money.",
    accent: "#8FE3B8",
  },
  {
    name: "Aisha T.",
    location: "Copenhagen",
    product: "Trail Havoc",
    rating: 4,
    text: "Took these through 80km of Norwegian trails. Wet rocks, mud, roots — zero slips. Only reason it's not 5 stars: I wish they came in pink.",
    accent: "#8FE3B8",
  },
  {
    name: "Leo D.",
    location: "Vienna",
    product: "Halo Slide",
    rating: 5,
    text: "Post-run recovery game changed forever. My feet sink in and all the fatigue just disappears. At €59 this is the best purchase I've made all year.",
    accent: "#F5A8C8",
  },
];

export function Testimonials() {
  return (
    <section className="relative border-b border-line bg-ink">
      <div className="bg-grid-dark absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.24em] text-flame uppercase">
              Wall-tested, human-approved
            </p>
            <h2 className="mt-2 font-display text-5xl tracking-wide uppercase sm:text-6xl">
              Real talk
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-dust">
              Unedited words from people who actually lace up, slide on, and
              wear these every day.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={i} delay={i * 70}>
              <article className="group flex h-full flex-col border border-line bg-ink-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-dust hover:shadow-[6px_6px_0_rgba(0,0,0,0.4)]">
                <div className="flex items-start justify-between gap-3">
                  <IconQuote
                    width={24}
                    height={24}
                    className="shrink-0 text-dust/40"
                  />
                  <Stars rating={r.rating} />
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-bone/90">
                  &ldquo;{r.text}&rdquo;
                </p>

                <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <div
                    className="grid h-9 w-9 place-items-center text-xs font-bold text-ink"
                    style={{ backgroundColor: r.accent }}
                  >
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {r.name}{" "}
                      <span className="font-normal text-dust">
                        · {r.location}
                      </span>
                    </p>
                    <p className="text-[11px] text-dust">
                      Bought the{" "}
                      <span className="font-semibold text-volt">
                        {r.product}
                      </span>
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
