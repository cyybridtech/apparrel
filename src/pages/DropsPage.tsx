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

export function DropsPage() {
  const { formatPrice } = useCurrency();
  const { success } = useToast();
  const [notifiedDrops, setNotifiedDrops] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 47,
    minutes: 59,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNotifyMe = (dropId: string, title: string) => {
    if (notifiedDrops.includes(dropId)) return;
    setNotifiedDrops([...notifiedDrops, dropId]);
    success("VIP Alert Set", `We will send you early access SMS & email notifications 15 minutes before ${title} drops!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn pb-16">
      {/* Hero Header */}
      <div className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Limited Release Calendar</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight text-white leading-tight">
            Curated Drops & Private Releases.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Every drop is strictly limited, authenticated, and individually numbered. Set your alerts to secure access before quantities sell out.
          </p>

          {/* Countdown Clock */}
          <div className="pt-2 flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-2xl font-mono font-black text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hours</span>
            </div>
            <span className="text-2xl font-black text-slate-600">:</span>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-2xl font-mono font-black text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Mins</span>
            </div>
            <span className="text-2xl font-black text-slate-600">:</span>
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-center">
              <span className="block text-2xl font-mono font-black text-amber-400">{String(timeLeft.seconds).padStart(2, "0")}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drops Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-950">
              Upcoming & Live Releases
            </h2>
            <p className="text-xs text-slate-500">Scheduled luxury drops for the Spring/Summer 2026 season</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {DROPS.length} Scheduled Drops
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {DROPS.map((drop) => {
            const isNotified = notifiedDrops.includes(drop.id);
            const isLive = drop.status === "LIVE NOW";

            return (
              <div
                key={drop.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between group hover:shadow-xl hover:border-slate-300 transition-all duration-300"
              >
                {/* Visual image */}
                <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                  <img
                    src={drop.image}
                    alt={drop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md ${
                        isLive
                          ? "bg-emerald-500 text-white animate-pulse"
                          : "bg-slate-950/90 backdrop-blur-md text-amber-400 border border-amber-400/30"
                      }`}
                    >
                      {drop.status}
                    </span>
                    <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1 rounded-full border border-white/20">
                      {drop.piecesCount} Units Worldwide
                    </span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-white font-heading font-black text-sm">
                    {formatPrice(drop.priceCents)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      {drop.category} • Scheduled Drop
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-950">
                      {drop.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{drop.subtitle}</p>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {drop.description}
                    </p>

                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900 block mb-1.5">
                        Key Specifications:
                      </span>
                      <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                        {drop.specs.map((spec, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                            <span>{spec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    {isLive ? (
                      <Link
                        to="/shop"
                        className="w-full btn-primary text-xs py-3 rounded-2xl flex items-center justify-center gap-2"
                      >
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Shop Drop Right Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleNotifyMe(drop.id, drop.title)}
                        className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isNotified
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-slate-950 hover:bg-slate-800 text-white shadow-lg"
                        }`}
                      >
                        {isNotified ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>VIP Notification Active</span>
                          </>
                        ) : (
                          <>
                            <Bell className="w-4 h-4 text-amber-400" />
                            <span>Notify Me on Release</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
