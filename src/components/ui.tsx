import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useStore } from "@/lib/store";
import { IconCheck, IconX } from "@/components/icons";

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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
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

export function Ticker({
  items,
  tone = "flame",
}: {
  items: string[];
  tone?: "flame" | "volt" | "ink";
}) {
  const tones = {
    flame: "bg-flame text-ink",
    volt: "bg-volt text-ink",
    ink: "bg-ink-2 text-bone border-y border-line",
  };
  const chunk = items.map((s, i) => (
    <span key={i} className="mx-5 inline-flex items-center gap-5">
      <span className="font-display text-sm tracking-[0.14em] uppercase">{s}</span>
      <span aria-hidden="true">✱</span>
    </span>
  ));
  return (
    <div className={`overflow-hidden py-2.5 select-none ${tones[tone]}`}>
      <div className="marquee-track flex w-max whitespace-nowrap">
        <div className="flex">{chunk}{chunk}{chunk}{chunk}</div>
        <div className="flex" aria-hidden="true">{chunk}{chunk}{chunk}{chunk}</div>
      </div>
    </div>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed bottom-5 left-5 z-[90] flex flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`animate-toast-in flex items-center gap-2.5 border px-4 py-3 text-left text-sm font-medium shadow-[6px_6px_0_rgba(0,0,0,0.45)] ${
            t.kind === "ok"
              ? "border-volt bg-volt text-ink"
              : "border-flame bg-flame text-ink"
          }`}
        >
          {t.kind === "ok" ? (
            <IconCheck width={16} height={16} strokeWidth={2.4} />
          ) : (
            <IconX width={16} height={16} strokeWidth={2.4} />
          )}
          {t.msg}
        </button>
      ))}
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-volt">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          className={i <= Math.round(rating) ? "" : "text-dust"}
        >
          <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9L12 3.5z" />
        </svg>
      ))}
    </span>
  );
}
