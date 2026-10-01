import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Clock, Bell, ArrowRight, ShieldCheck, Flame, Zap, Check, Eye } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { useCurrency } from "../context/CurrencyContext";

interface DropEvent {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  releaseDate: Date;
  priceCents: number;
  image: string;
  status: "UPCOMING" | "LIVE NOW" | "ARCHIVED";
  piecesCount: number;
  description: string;
  specs: string[];
}

const DROPS: DropEvent[] = [
  {
    id: "drop-02",
    title: "Nocturne Leather & Suede High-Top Series",
    subtitle: "Handcrafted Italian Calfskin & Raw Gum Soles",
    category: "sneakers",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 48), // in 48 hours
    priceCents: 165000,
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200",
    status: "UPCOMING",
    piecesCount: 50,
    description: "Limited to exactly 50 serialized pairs worldwide. Each unit is individually numbered with laser engraving and packaged in an archival cedarwood box.",
    specs: ["Hand-buffed Tuscan leather", "Double-stitched Goodyear welt", "Encapsulated cloud cushioning", "Custom silver aglets"],
  },
  {
    id: "drop-03",
    title: "Vortex Chronos Stealth Ceramic Edition",
    subtitle: "Automatic Swiss Movement • 300M Water Resistant",
    category: "watches",
    releaseDate: new Date(Date.now() + 1000 * 60 * 60 * 120), // in 5 days
    priceCents: 320000,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200",
    status: "UPCOMING",
    piecesCount: 25,
    description: "Ultra-matte forged carbon bezel with exhibition sapphire caseback and luminescent markers engineered for extreme resilience.",
    specs: ["Forged carbon & ceramic chassis", "Automatic 48-hr power reserve", "Anti-reflective sapphire crystal", "Quick-release silicone & steel straps"],
  },
  {
    id: "drop-01",
    title: "Heavyweight Boxy Noir SS26 Drop 01",
    subtitle: "320 GSM Organic Combed French Terry",
    category: "tops",
    releaseDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    priceCents: 45000,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200",
    status: "LIVE NOW",
    piecesCount: 100,
    description: "Architectural boxy silhouette with dropped shoulders and reinforced ribbed collar. Pre-shrunk and enzyme washed for an exceptionally soft drape.",
    specs: ["100% Organic combed cotton", "Reinforced twin-needle stitching", "Silk-screened tonal insignia", "Relaxed oversized fit"],
  },
];

function CountdownClock({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-2 sm:gap-3 text-center">
      <div className="px-3 py-2 bg-slate-900 text-white rounded-xl min-w-[54px] shadow-sm">
        <span className="text-base sm:text-xl font-mono font-black block">{String(timeLeft.days).padStart(2, "0")}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Days</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className="px-3 py-2 bg-slate-900 text-white rounded-xl min-w-[54px] shadow-sm">
        <span className="text-base sm:text-xl font-mono font-black block">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Hours</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className="px-3 py-2 bg-slate-900 text-white rounded-xl min-w-[54px] shadow-sm">
        <span className="text-base sm:text-xl font-mono font-black block">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Mins</span>
      </div>
      <span className="text-slate-400 font-bold">:</span>
      <div className="px-3 py-2 bg-slate-900 text-amber-400 rounded-xl min-w-[54px] shadow-sm">
        <span className="text-base sm:text-xl font-mono font-black block">{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Secs</span>
      </div>
    </div>
  );
}

export function DropsPage() {
  const { formatPrice } = useCurrency();
  const { success } = useToast();
  const [subscribedDrops, setSubscribedDrops] = useState<string[]>([]);

  const handleNotifyMe = (dropId: string, title: string) => {
    if (subscribedDrops.includes(dropId)) return;
    setSubscribedDrops([...subscribedDrops, dropId]);
    success("VIP Alert Reserved", `You will receive an exclusive release link 15 minutes before ${title} goes live.`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pt-16 pb-20 space-y-16 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Official Atelier Release Calendar</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight text-slate-950">
            Limited Edition Drops
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Strictly limited releases engineered with artisanal craftsmanship. Each piece is individually numbered and never re-issued once allocated.
          </p>
        </div>
      </div>

      {/* Drops Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {DROPS.map((drop, idx) => {
          const isLive = drop.status === "LIVE NOW";
          const isSubbed = subscribedDrops.includes(drop.id);

          return (
            <div
              key={drop.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 transition-all hover:border-slate-400"
            >
              {/* Media Half */}
              <div className="lg:col-span-7 relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-100 min-h-[340px]">
                <img
                  src={drop.image}
                  alt={drop.title}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase backdrop-blur-md shadow-sm ${
                      isLive
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-950/80 text-white border border-white/20"
                    }`}
                  >
                    {drop.status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-white/90 text-slate-900 backdrop-blur-md shadow-sm">
                    {drop.piecesCount} Pieces Only
                  </span>
                </div>
              </div>

              {/* Information Half */}
              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-bold">
                      Drop 0{idx + 1} • {drop.category.toUpperCase()}
                    </span>
                    <span className="text-lg font-black font-heading text-slate-950">
                      {formatPrice(drop.priceCents)}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black font-heading text-slate-950 leading-snug">
                      {drop.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">{drop.subtitle}</p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {drop.description}
                  </p>

                  {/* Bullet Specs */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                    {drop.specs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  {!isLive ? (
                    <>
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 font-bold">
                          Release Countdown
                        </span>
                        <CountdownClock targetDate={drop.releaseDate} />
                      </div>

                      <button
                        onClick={() => handleNotifyMe(drop.id, drop.title)}
                        disabled={isSubbed}
                        className={`w-full py-3.5 px-6 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                          isSubbed
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                            : "bg-slate-950 hover:bg-black text-white"
                        }`}
                      >
                        {isSubbed ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>VIP Notification Confirmed</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 text-amber-400" />
                            <span>Notify Me When Live</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/shop"
                      className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider bg-slate-950 text-white hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span>Shop Live Capsule Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
