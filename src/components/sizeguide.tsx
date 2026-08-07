import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { IconX } from "@/components/icons";

const SIZES = [
  { eu: 36, us_m: 4.5, us_w: 6, uk: 3.5, cm: 22.5 },
  { eu: 37, us_m: 5, us_w: 6.5, uk: 4, cm: 23 },
  { eu: 38, us_m: 5.5, us_w: 7, uk: 4.5, cm: 23.5 },
  { eu: 39, us_m: 6.5, us_w: 8, uk: 5.5, cm: 24.5 },
  { eu: 40, us_m: 7.5, us_w: 9, uk: 6.5, cm: 25.5 },
  { eu: 41, us_m: 8, us_w: 9.5, uk: 7, cm: 26 },
  { eu: 42, us_m: 8.5, us_w: 10, uk: 7.5, cm: 26.5 },
  { eu: 43, us_m: 9.5, us_w: 11, uk: 8.5, cm: 27.5 },
  { eu: 44, us_m: 10, us_w: 11.5, uk: 9, cm: 28 },
  { eu: 45, us_m: 11, us_w: 12.5, uk: 10, cm: 29 },
  { eu: 46, us_m: 12, us_w: 13.5, uk: 11, cm: 30 },
];

const TIPS = [
  "Measure your feet in the evening when they're slightly swollen for the most accurate fit.",
  "If you're between sizes, go half a size up — especially for running and trail shoes.",
  "Court shoes (basketball, tennis) should fit snug. Lifestyle shoes can have a bit more room.",
  "Boot category runs true to size. Break-in period: 1–2 weeks.",
  "Slide and sandal sizes correspond to EU sizing. When in doubt, size up.",
];

export function SizeGuide() {
  const { sizeGuideOpen, setSizeGuideOpen } = useStore();

  useEffect(() => {
    if (sizeGuideOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sizeGuideOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSizeGuideOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSizeGuideOpen]);

  if (!sizeGuideOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[62] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Size guide"
    >
      <button
        className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
        onClick={() => setSizeGuideOpen(false)}
        aria-label="Close size guide"
      />

      <div className="animate-toast-in relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-line bg-ink-2 shadow-[12px_12px_0_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-flame uppercase">
              Find your fit
            </p>
            <h2 className="font-display text-3xl tracking-wide uppercase">
              Size guide
            </h2>
          </div>
          <button
            onClick={() => setSizeGuideOpen(false)}
            className="grid h-9 w-9 shrink-0 place-items-center border border-line text-dust transition-colors hover:border-flame hover:text-flame"
            aria-label="Close"
          >
            <IconX width={17} height={17} />
          </button>
        </div>

        {/* chart */}
        <div className="overflow-x-auto px-6 py-6">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] font-bold tracking-[0.2em] text-dust uppercase">
                <th className="py-3 text-left">EU</th>
                <th className="py-3 text-center">US Men</th>
                <th className="py-3 text-center">US Women</th>
                <th className="py-3 text-center">UK</th>
                <th className="py-3 text-right">CM</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map((s, i) => (
                <tr
                  key={s.eu}
                  className={`border-b border-line/50 transition-colors hover:bg-ink-3 ${
                    i % 2 === 0 ? "bg-ink" : ""
                  }`}
                >
                  <td className="py-3 font-display text-base text-volt">
                    {s.eu}
                  </td>
                  <td className="py-3 text-center">{s.us_m}</td>
                  <td className="py-3 text-center">{s.us_w}</td>
                  <td className="py-3 text-center">{s.uk}</td>
                  <td className="py-3 text-right">{s.cm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* tips */}
        <div className="border-t border-line px-6 py-6">
          <h3 className="mb-4 text-[11px] font-bold tracking-[0.22em] text-dust uppercase">
            Fit tips
          </h3>
          <div className="space-y-3">
            {TIPS.map((tip, i) => (
              <div key={i} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-flame text-[10px] font-bold text-ink">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed text-dust">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* how to measure */}
        <div className="border-t border-line bg-ink px-6 py-6">
          <h3 className="mb-3 text-[11px] font-bold tracking-[0.22em] text-dust uppercase">
            How to measure
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Stand on paper",
                desc: "Place a sheet of paper on a hard floor. Stand on it with your heel against a wall.",
              },
              {
                step: "02",
                title: "Mark & measure",
                desc: "Mark the tip of your longest toe. Measure the distance from the wall to the mark in cm.",
              },
              {
                step: "03",
                title: "Find your EU",
                desc: "Match your cm measurement to the chart above. Between sizes? Go up, not down.",
              },
            ].map((s) => (
              <div key={s.step} className="border border-line p-4">
                <span className="font-display text-2xl text-flame">{s.step}</span>
                <p className="mt-1 text-sm font-bold">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-dust">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
