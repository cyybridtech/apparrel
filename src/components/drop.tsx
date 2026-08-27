import { useEffect, useState, type FormEvent } from "react";
import { Reveal } from "@/components/ui";
import { IconArrow, IconCheck } from "@/components/icons";

function nextFriday18(): Date {
  const now = new Date();
  const d = new Date(now);
  d.setHours(18, 0, 0, 0);
  let diff = (5 - d.getDay() + 7) % 7;
  if (diff === 0 && d <= now) diff = 7;
  d.setDate(d.getDate() + diff);
  return d;
}

function useCountdown(target: Date) {
  const [left, setLeft] = useState(() => target.getTime() - Date.now());
  useEffect(() => {
    const t = window.setInterval(
      () => setLeft(target.getTime() - Date.now()),
      1000
    );
    return () => window.clearInterval(t);
  }, [target]);
  const clamped = Math.max(0, left);
  return {
    days: Math.floor(clamped / 86400000),
    hours: Math.floor((clamped / 3600000) % 24),
    mins: Math.floor((clamped / 60000) % 60),
    secs: Math.floor((clamped / 1000) % 60),
  };
}

export function DropSection() {
  const [target] = useState(nextFriday18);
  const { days, hours, mins, secs } = useCountdown(target);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [err, setErr] = useState(false);

  const join = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr(true);
      return;
    }
    setErr(false);
    setJoined(true);
  };

  const cells: Array<[string, number]> = [
    ["Days", days],
    ["Hrs", hours],
    ["Min", mins],
    ["Sec", secs],
  ];

  return (
    <section id="drop" className="relative scroll-mt-20 overflow-hidden bg-bone text-ink">
      <div className="bg-grid-light absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 bg-ink px-3 py-1.5 text-[11px] font-bold tracking-[0.22em] text-volt uppercase">
              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full animate-ping rounded-full bg-volt opacity-70" />
                <span className="relative h-2 w-2 rounded-full bg-volt" />
              </span>
              Coming Friday 18:00
            </p>
            <h2 className="mt-5 font-display text-6xl leading-[0.9] tracking-wide uppercase sm:text-7xl">
              Drop 08
              <span className="block text-flame">Static Bloom</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-ink/70">
              Two colorways of the Static Low you have never seen, a
              glow-in-the-dark Grind Mid, and exactly 120 pairs total. When
              the timer hits zero, the wall changes.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-8 flex gap-3">
              {cells.map(([label, val], i) => (
                <div
                  key={label}
                  className={`flex w-20 flex-col items-center border-2 border-ink py-3 ${
                    i === 3 ? "bg-flame text-ink" : "bg-ink text-bone"
                  }`}
                >
                  <span className="font-display text-3xl tabular-nums">
                    {String(val).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            {joined ? (
              <p className="mt-8 inline-flex items-center gap-2.5 bg-volt px-4 py-3 text-sm font-bold tracking-wider uppercase">
                <IconCheck width={16} height={16} strokeWidth={2.6} />
                You're on the list — see you Friday
              </p>
            ) : (
              <form onSubmit={join} className="mt-8 max-w-md">
                <div className="flex border-2 border-ink bg-bone-2 p-1.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErr(false);
                    }}
                    placeholder="you@loud.sh"
                    aria-label="Email for drop notification"
                    className={`w-full bg-transparent px-3 text-sm placeholder:text-ink/40 focus:outline-none ${
                      err ? "text-flame" : ""
                    }`}
                  />
                  <button
                    type="submit"
                    className="group inline-flex shrink-0 items-center gap-2 bg-ink px-5 py-3 font-display text-base tracking-wide text-volt uppercase transition-colors hover:bg-flame hover:text-ink"
                  >
                    Notify me
                    <IconArrow
                      width={15}
                      height={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                </div>
                {err && (
                  <p className="mt-2 text-[11px] font-bold tracking-wider text-flame uppercase">
                    Enter a valid email to get the alert
                  </p>
                )}
              </form>
            )}
          </Reveal>
        </div>

        <Reveal delay={140}>
          <div className="group relative mx-auto max-w-md">
            <div
              className="absolute -inset-3 rotate-3 border-2 border-ink bg-volt transition-transform duration-500 group-hover:rotate-1"
              aria-hidden="true"
            />
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=600&fit=crop&auto=format"
              alt="Drop 08 Static Bloom teaser"
              className="relative w-full -rotate-2 border-2 border-ink object-cover transition-transform duration-500 group-hover:rotate-0"
              width={900}
              height={600}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&h=600&fit=crop";
              }}
            />
            <span className="absolute -top-5 -right-4 rotate-6 bg-flame px-4 py-2 font-display text-2xl text-ink shadow-[5px_5px_0_rgba(19,19,22,1)]">
              120 pairs
            </span>
            <span className="absolute -bottom-4 -left-3 -rotate-3 bg-ink px-3 py-1.5 font-display text-lg tracking-wider text-volt uppercase">
              08 / Static Bloom
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
