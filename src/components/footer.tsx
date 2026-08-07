import { useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/lib/store";
import { PolicyModal } from "@/components/PolicyModal";

const FOOTWEAR_LINKS = ["Road Running", "Trail", "Court / Basketball", "Skate", "Lifestyle", "Boots", "Sandals", "Turf / Football"];
const TOPS_LINKS = ["Shirts", "Club T-Shirts", "Designer Shirts", "Long Sleeves", "Hoodies", "Jerseys"];
const HELP_LINKS = [
  { label: "Ghana Shipping & Rates", action: "shipping" as const },
  { label: "30-Day Size Exchange", action: "returns" as const },
  { label: "Authenticity Guarantee", action: "authenticity" as const },
  { label: "Privacy Policy", action: "privacy" as const },
];

const PAYMENTS = ["MTN MoMo", "Telecel Cash", "Visa", "Mastercard", "AT Cash"];

const SOCIALS = [
  { label: "Instagram", short: "IG", href: "#", color: "#E1306C" },
  { label: "TikTok", short: "TT", href: "#", color: "#69C9D0" },
  { label: "Facebook", short: "FB", href: "#", color: "#1877F2" },
  { label: "X (Twitter)", short: "X", href: "#", color: "#fff" },
];

export function Footer() {
  const { toast, setSizeGuideOpen } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activePolicy, setActivePolicy] = useState<"shipping" | "returns" | "authenticity" | "privacy" | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubscribed(true);
    toast("You're on the list! 🎉 Fresh drops incoming.", "ok");
    setEmail("");
  };

  return (
    <>
      {/* Newsletter Band */}
      <div className="border-t border-[#1b2438] bg-gradient-to-r from-[#0a0f1c] via-[#0e131f] to-[#0a0f1c] py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <h3 className="font-display text-3xl text-white uppercase tracking-tight">
              Join the <span className="cyan-gradient-text">KICKS Squad</span>
            </h3>
            <p className="mt-1 text-sm text-gray-400">Get early access to drops, exclusive Ghana deals, and 10% off your first order.</p>
          </div>
          {subscribed ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[#00f0ff]/30 bg-[#00f0ff]/10 px-6 py-4">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-display text-lg text-[#00f0ff] font-bold">You're in!</p>
                <p className="text-xs text-gray-400">Watch your inbox for the next drop.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 rounded-xl border border-[#1b2438] bg-[#07090e] px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[#00f0ff] focus:outline-none transition-colors"
              />
              <button type="submit" className="btn-cyan rounded-xl px-6 py-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap">
                Subscribe →
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <footer className="border-t border-[#1b2438] bg-[#07090e] text-gray-300">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-8 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">

            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#7000ff] text-black font-black text-xl shadow-[0_0_15px_rgba(0,240,255,0.3)]">K</span>
                <span className="font-display text-2xl tracking-wider text-white">KICKS<span className="text-[#00f0ff]">GHANA</span></span>
              </Link>
              <p className="text-xs leading-relaxed text-gray-400 max-w-[220px]">
                Ghana's premier destination for verified authentic footwear, designer tops & streetwear. Express delivery across Ghana.
              </p>

              {/* Proudly Ghanaian */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#1b2438] bg-[#0e131f] px-3 py-2">
                <span className="text-xl">🇬🇭</span>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-[#00f0ff] uppercase">Proudly Ghanaian</p>
                  <p className="text-[10px] text-gray-500">Est. Accra 2026</p>
                </div>
              </div>

              {/* Socials */}
              <div className="mt-4 flex gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.short}
                    href={s.href}
                    onClick={() => toast(`Follow @KicksGhana on ${s.label}`, "ok")}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-[#1b2438] bg-[#0e131f] text-xs font-black text-gray-300 transition-all hover:scale-110"
                    style={{ ['--hover-color' as string]: s.color }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = s.color)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1b2438")}
                    aria-label={s.label}
                  >
                    {s.short}
                  </a>
                ))}
              </div>
            </div>

            {/* Footwear */}
            <nav>
              <h3 className="text-[10px] font-black tracking-widest text-[#00f0ff] uppercase mb-4">Footwear</h3>
              <ul className="space-y-2">
                {FOOTWEAR_LINKS.map((l) => (
                  <li key={l}>
                    <a href="/#wall" className="text-xs text-gray-400 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Tops */}
            <nav>
              <h3 className="text-[10px] font-black tracking-widest text-[#a855f7] uppercase mb-4">Tops</h3>
              <ul className="space-y-2">
                {TOPS_LINKS.map((l) => (
                  <li key={l}>
                    <a href="/#wall" className="text-xs text-gray-400 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Help */}
            <nav>
              <h3 className="text-[10px] font-black tracking-widest text-[#ffb800] uppercase mb-4">Customer Care</h3>
              <ul className="space-y-2">
                {HELP_LINKS.map(({ label, action }) => (
                  <li key={label}>
                    <button onClick={() => setActivePolicy(action)} className="text-xs text-gray-400 hover:text-[#ffb800] transition-colors text-left">
                      {label}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={() => setSizeGuideOpen(true)} className="text-xs text-gray-400 hover:text-[#ffb800] transition-colors">
                    EU & Clothing Size Guide
                  </button>
                </li>
                <li>
                  <Link to="/orders" className="text-xs text-gray-400 hover:text-[#ffb800] transition-colors">
                    Track My Order
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Ghana Promise */}
            <div>
              <h3 className="text-[10px] font-black tracking-widest text-[#10b981] uppercase mb-4">Ghana Promise</h3>
              <div className="space-y-3">
                {[
                  { emoji: "✅", title: "100% Authentic", sub: "Every item hand-verified" },
                  { emoji: "🚀", title: "Express Delivery", sub: "Accra same-day, nationwide 2–4 days" },
                  { emoji: "🔄", title: "Free Exchanges", sub: "30-day size swap guarantee" },
                  { emoji: "🔒", title: "Secure Payment", sub: "MTN MoMo, Visa & more" },
                ].map((p) => (
                  <div key={p.title} className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5">{p.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{p.title}</p>
                      <p className="text-[10px] text-gray-500">{p.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment methods */}
              <div className="mt-5">
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">Accepted Payments</p>
                <div className="flex flex-wrap gap-1.5">
                  {PAYMENTS.map((p) => (
                    <span key={p} className="rounded-lg border border-[#1b2438] bg-[#0e131f] px-2 py-1 text-[10px] font-bold text-gray-400">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-[#1b2438] pt-6 text-[11px] tracking-wider text-gray-500 uppercase">
            <p>© 2026 KICKS GHANA — All rights reserved.</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setActivePolicy("privacy")} className="hover:text-gray-300 transition-colors">
                Privacy Policy
              </button>
              <span>·</span>
              <Link to="/admin" className="text-[#00f0ff] font-bold hover:underline">
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <PolicyModal type={activePolicy} onClose={() => setActivePolicy(null)} />
    </>
  );
}
