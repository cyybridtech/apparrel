import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Ticker } from "@/components/ui";
import { IconBag, IconHeart, IconMenu, IconRuler, IconSearch, IconX } from "@/components/icons";

const TICKER_ITEMS = [
  "🇬🇭  Free shipping in Ghana over GH₵ 1,500",
  "⚡  New drops every Friday at 18:00 GMT",
  "✅  100% Authentic Kicks Guarantee",
  "🚀  Accra, Kumasi & Takoradi Express Delivery",
  "👕  New: Designer Tops & Club Tees now in stock",
];

const FOOTWEAR_CATS = ["Road", "Trail", "Court", "Skate", "Lifestyle", "Boots", "Sandals", "Turf"];
const TOPS_CATS = ["Shirts", "Club T-Shirts", "Designer Shirts", "Long Sleeves", "Hoodies", "Jerseys"];

export function Header() {
  const { cartCount, setCartOpen, badgePulse, setSearchOpen, setSizeGuideOpen, wishlist } = useStore();
  const location = useLocation();
  const pathname = location.pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<"collection" | "tops" | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mega on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <Ticker items={TICKER_ITEMS} tone="flame" />
      <header
        className={`sticky top-0 z-40 border-b border-[#1b2438] transition-all duration-300 ${
          scrolled
            ? "bg-[#07090e]/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            : "bg-[#07090e]/90 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

          {/* Left: logo + mobile burger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#1b2438] text-gray-300 transition-colors hover:border-[#00f0ff] hover:text-[#00f0ff] md:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <IconX width={17} height={17} /> : <IconMenu width={17} height={17} />}
            </button>

            <Link to="/" className="group flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#7000ff] text-black font-black text-xl transition-transform duration-300 group-hover:scale-105 shadow-[0_0_20px_rgba(0,240,255,0.35)]">
                K
              </span>
              <span className="font-display text-xl tracking-wider text-white">
                KICKS<span className="text-[#00f0ff]">GHANA</span>
              </span>
            </Link>
          </div>

          {/* Centre: mega-menu nav */}
          <nav
            ref={megaRef}
            className="hidden items-center gap-1 md:flex"
          >
            {/* Collection mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen("collection")}
              onMouseLeave={() => setMegaOpen(null)}
            >
              <button className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all ${megaOpen === "collection" ? "text-[#00f0ff]" : "text-gray-300 hover:text-white"}`}>
                Footwear <span className="text-[10px] opacity-60">{megaOpen === "collection" ? "▲" : "▼"}</span>
              </button>

              {megaOpen === "collection" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-72 rounded-2xl border border-[#1b2438] bg-[#0e131f]/98 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-4 z-50">
                  <p className="text-[10px] font-bold tracking-widest text-[#00f0ff] uppercase mb-3">Shop Footwear</p>
                  <div className="grid grid-cols-2 gap-1">
                    {FOOTWEAR_CATS.map((c) => (
                      <a
                        key={c}
                        href="/#wall"
                        onClick={() => setMegaOpen(null)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-[#151c2e] hover:text-[#00f0ff] transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]/40" />
                        {c}
                      </a>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#1b2438]">
                    <a href="/#wall" className="flex items-center justify-between text-xs font-bold text-[#00f0ff] hover:underline" onClick={() => setMegaOpen(null)}>
                      View all footwear <span>→</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Tops mega-menu */}
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen("tops")}
              onMouseLeave={() => setMegaOpen(null)}
            >
              <button className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all ${megaOpen === "tops" ? "text-[#a855f7]" : "text-gray-300 hover:text-white"}`}>
                Tops <span className="text-[10px] opacity-60">{megaOpen === "tops" ? "▲" : "▼"}</span>
              </button>

              {megaOpen === "tops" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 rounded-2xl border border-[#1b2438] bg-[#0e131f]/98 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] p-4 z-50">
                  <p className="text-[10px] font-bold tracking-widest text-[#a855f7] uppercase mb-3">Shop Tops</p>
                  <div className="space-y-0.5">
                    {TOPS_CATS.map((c) => (
                      <a
                        key={c}
                        href="/#wall"
                        onClick={() => setMegaOpen(null)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-[#151c2e] hover:text-[#a855f7] transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]/40" />
                        {c}
                      </a>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#1b2438]">
                    <a href="/#wall" className="flex items-center justify-between text-xs font-bold text-[#a855f7] hover:underline" onClick={() => setMegaOpen(null)}>
                      View all tops <span>→</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSizeGuideOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-all"
            >
              <IconRuler width={13} height={13} /> Size Guide
            </button>

            <Link
              to="/orders"
              className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all ${pathname === "/orders" ? "text-[#00f0ff]" : "text-gray-300 hover:text-white"}`}
            >
              Orders
            </Link>

            <Link
              to="/admin"
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider border transition-all ${
                pathname === "/admin"
                  ? "bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]"
                  : "bg-[#151c2e] text-[#00f0ff] border-[#00f0ff]/40 hover:bg-[#00f0ff] hover:text-black"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-ping" />
              Admin
            </Link>
          </nav>

          {/* Right: search + wishlist + bag */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-lg border border-[#1b2438] bg-[#0e131f] text-gray-300 transition-all hover:border-[#00f0ff] hover:text-[#00f0ff]"
              aria-label="Search"
            >
              <IconSearch width={17} height={17} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative grid h-10 w-10 place-items-center rounded-lg border border-[#1b2438] bg-[#0e131f] text-gray-300 transition-all hover:border-[#ff3b5c] hover:text-[#ff3b5c]"
              aria-label="Wishlist"
            >
              <IconHeart width={17} height={17} />
              {wishlist.length > 0 && (
                <span
                  key={wishlist.length}
                  className="animate-pop absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#ff3b5c] px-1 text-[10px] font-black text-white shadow-md"
                >
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-lg border border-[#00f0ff]/40 bg-[#00f0ff]/10 px-4 py-2 text-xs font-bold tracking-widest uppercase text-[#00f0ff] transition-all hover:bg-[#00f0ff] hover:text-black active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.12)]"
              aria-label="Open bag"
            >
              <IconBag width={18} height={18} />
              <span className="hidden sm:inline">Bag</span>
              {cartCount > 0 && (
                <span
                  key={badgePulse}
                  className="animate-pop absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#ffb800] px-1 text-[11px] font-black text-black shadow-md"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="border-t border-[#1b2438] bg-[#0e131f] md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-0 px-4 py-2">
              {[
                { label: "👟 Footwear", href: "/#wall" },
                { label: "👕 Tops", href: "/#wall" },
                { label: "🔥 On Sale", href: "/#wall" },
                { label: "⚡ New Arrivals", href: "/#wall" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center border-b border-[#1b2438] py-4 font-display text-lg tracking-wide uppercase text-white hover:text-[#00f0ff] transition-colors"
                >
                  {label}
                </a>
              ))}
              <button
                onClick={() => { setMobileOpen(false); setSizeGuideOpen(true); }}
                className="flex items-center gap-3 border-b border-[#1b2438] py-4 text-left font-display text-lg tracking-wide uppercase text-white hover:text-[#00f0ff] transition-colors"
              >
                <IconRuler width={18} height={18} /> Size Guide
              </button>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="flex items-center border-b border-[#1b2438] py-4 font-display text-lg tracking-wide uppercase text-white hover:text-[#00f0ff]">
                My Orders
              </Link>
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 border-b border-[#1b2438] py-4 font-display text-lg tracking-wide uppercase text-[#ff3b5c]">
                <IconHeart width={18} height={18} /> Wishlist {wishlist.length > 0 && `(${wishlist.length})`}
              </Link>
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-4 font-display text-lg tracking-wide uppercase text-[#00f0ff]">
                ⚡ Admin Portal
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
