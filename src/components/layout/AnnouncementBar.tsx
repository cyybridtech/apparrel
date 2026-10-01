import React, { useState } from "react";
import { Sparkles, ArrowRight, X, Globe, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrency, SupportedCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const { user, openAuthModal } = useAuth();

  if (!visible) return null;

  return (
    <aside aria-label="Announcement" className="bg-[#0b0b0e] text-neutral-300 text-[11px] font-medium border-b border-white/[0.06] tracking-wide relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        {/* Left: Dispatch & Free Shipping status */}
        <div className="hidden md:flex items-center gap-2 text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Complimentary worldwide express shipping on orders over $250 / GH₵3,500</span>
        </div>

        {/* Center: Live Drops / Season alert */}
        <div className="flex-1 text-center md:flex-initial">
          <Link
            to="/drops"
            className="inline-flex items-center gap-2 hover:text-white transition-colors group"
          >
            <span className="text-indigo-400 font-mono text-[10px] uppercase tracking-wider bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              VIP Drops Active
            </span>
            <span className="text-white font-medium">SS26 Capsule Collection II is now live</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-indigo-400" />
          </Link>
        </div>

        {/* Right: Currency Switcher & VIP status */}
        <div className="flex items-center gap-4 text-neutral-400">
          {/* Currency Switcher */}
          <div className="flex items-center gap-1.5 bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.08]">
            <Globe className="w-3 h-3 text-neutral-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="bg-transparent text-white text-[10px] font-mono tracking-wider focus:outline-none cursor-pointer"
              aria-label="Currency Selector"
            >
              {availableCurrencies.map((c) => (
                <option key={c.code} value={c.code} className="bg-neutral-900 text-white">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Quick VIP Link */}
          {user ? (
            <Link
              to="/account"
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
            >
              <Crown className="w-3 h-3" />
              <span>{user.tier} Member</span>
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal("register")}
              className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wider"
            >
              <span>Join VIP Club</span>
            </button>
          )}

          <button
            onClick={() => setVisible(false)}
            className="text-neutral-500 hover:text-white p-0.5 transition-colors"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
