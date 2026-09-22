import React, { useState } from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside aria-label="Announcement" className="bg-slate-950 text-white text-[11px] font-medium border-b border-slate-800 tracking-wide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Accra Express Dispatch Hub • Same-day delivery active</span>
        </div>

        <div className="flex-1 text-center md:flex-initial">
          <Link
            to="/shop?category=tops"
            className="inline-flex items-center gap-1.5 hover:text-slate-300 transition-colors group"
          >
            <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
              Drop 01 / SS26
            </span>
            <span>New Heavyweight Tops & Sneaker Drops are live</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <Link to="/track" className="hidden sm:inline hover:text-white transition-colors">
            Track Order
          </Link>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-500 hover:text-white p-0.5 transition-colors"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
