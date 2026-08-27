import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useStore } from "@/lib/store";
import { IconCheck, IconX } from "@/components/icons";

// ─── Reveal ──────────────────────────────────────────────────────────────────
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -32px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
const TONE_STYLES: Record<string, string> = {
  flame: "bg-[#ff3b5c] text-white",
  volt: "bg-[#0e131f] text-[#00f0ff] border-b border-[#1b2438]",
  ink: "bg-[#07090e] text-gray-400 border-y border-[#1b2438]",
};

export function Ticker({
  items,
  tone = "flame",
}: {
  items: string[];
  tone?: "flame" | "volt" | "ink";
}) {
  const style = TONE_STYLES[tone] ?? TONE_STYLES.flame;

  const chunk = items.map((s, i) => (
    <span key={i} className="mx-6 inline-flex items-center gap-5 shrink-0">
      <span className="font-display text-xs tracking-[0.18em] font-bold uppercase whitespace-nowrap">
        {s}
      </span>
      <span aria-hidden="true" className="opacity-40">✦</span>
    </span>
  ));

  return (
    <div className={`overflow-hidden py-2.5 select-none ${style}`} aria-hidden="true">
      <div className="marquee-track flex w-max whitespace-nowrap">
        <div className="flex">{chunk}{chunk}{chunk}{chunk}</div>
        <div className="flex" aria-hidden="true">{chunk}{chunk}{chunk}{chunk}</div>
      </div>
    </div>
  );
}

// ─── Toasts ───────────────────────────────────────────────────────────────────
export function Toasts() {
  const { toasts, dismissToast } = useStore();

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-5 left-5 z-[90] flex flex-col gap-2.5"
    >
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`animate-toast-in flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all hover:scale-[1.02] ${
            t.kind === "ok"
              ? "border-[#00f0ff]/40 bg-[#0e131f]/95 text-white"
              : "border-[#ff3b5c]/40 bg-[#0e131f]/95 text-white"
          }`}
        >
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
              t.kind === "ok" ? "bg-[#00f0ff] text-black" : "bg-[#ff3b5c] text-white"
            }`}
          >
            {t.kind === "ok" ? (
              <IconCheck width={14} height={14} strokeWidth={2.6} />
            ) : (
              <IconX width={14} height={14} strokeWidth={2.4} />
            )}
          </span>
          <span className="max-w-[240px] leading-snug">{t.msg}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────
export function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i <= rounded ? "#ffb800" : "none"}
          stroke={i <= rounded ? "#ffb800" : "#475569"}
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9L12 3.5z" />
        </svg>
      ))}
    </span>
  );
}
