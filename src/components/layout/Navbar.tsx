import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Lock,
  User,
  Crown,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  ChevronDown
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";
import { SecretAdminModal } from "./SecretAdminModal";

const NAV_LINKS = [
  { label: "Collection", path: "/shop" },
  { label: "Drops Calendar", path: "/drops", badge: "Live" },
  { label: "Editorial", path: "/editorial" },
  { label: "Tops", path: "/shop?category=tops" },
  { label: "Sneakers", path: "/shop?category=sneakers" },
  { label: "Fragrances", path: "/shop?category=perfumes" },
  { label: "Timepieces", path: "/shop?category=watches" },
];

interface NavbarProps {
  onOpenSearch: () => void;
}

export function Navbar({ onOpenSearch }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { openCart, totalItemsCount, subtotalCents } = useCart();
  const { totalWishlistCount } = useWishlist();
  const { formatPrice } = useCurrency();
  const { user, openAuthModal, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Shortcut Ctrl+Shift+A for secret admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setAdminModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isActive = (path: string) => {
    if (path === "/shop" && location.pathname === "/shop" && !location.search) return true;
    return location.pathname + location.search === path;
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#070709]/95 backdrop-blur-xl shadow-2xl border-b border-white/[0.08]"
            : "bg-[#070709] border-b border-white/[0.05]"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-neutral-300 hover:text-white rounded-lg"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <span className="font-serif tracking-tighter text-2xl sm:text-3xl text-white uppercase group-hover:opacity-90 transition-opacity font-bold">
                  APPARREL<span className="text-indigo-400">.</span>
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono font-medium tracking-widest uppercase bg-white/[0.04] text-neutral-400 px-2 py-0.5 rounded-full border border-white/[0.08]">
                  ATELIER
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1 xl:gap-2 ml-4">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3.5 py-1.5 text-xs font-medium tracking-wider uppercase rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                        active
                          ? "bg-white text-black font-semibold shadow-sm"
                          : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {link.label}
                      {link.badge && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/[0.04] rounded-full transition-colors"
                title="Search luxury vault (Press /)"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2 text-neutral-400 hover:text-white hover:bg-white/[0.04] rounded-full transition-colors"
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {totalWishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[9px] font-mono font-bold text-white bg-indigo-600 rounded-full">
                    {totalWishlistCount}
                  </span>
                )}
              </Link>

              {/* VIP Account / Auth Trigger */}
              {user ? (
                <Link
                  to="/account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition-all group"
                  title="VIP Account Dashboard"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-mono">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-medium text-white truncate max-w-[100px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>VIP Access</span>
                </button>
              )}

              {/* Shopping Bag Button */}
              <button
                onClick={openCart}
                className="bg-white text-black font-medium text-xs py-2 px-3 sm:px-4 rounded-full flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-md ml-1"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline font-semibold tracking-wider uppercase text-[11px]">Vault</span>
                {totalItemsCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-bold text-white bg-black rounded-full">
                    {totalItemsCount}
                  </span>
                )}
                {subtotalCents > 0 && (
                  <span className="hidden md:inline text-[11px] text-neutral-600 font-mono pl-1 border-l border-neutral-300">
                    {formatPrice(subtotalCents)}
                  </span>
                )}
              </button>

              {/* Discreet Secret Admin Button */}
              <button
                onClick={() => setAdminModalOpen(true)}
                className="p-2 text-neutral-600 hover:text-neutral-300 hover:bg-white/[0.04] rounded-full transition-colors"
                title="Atelier Admin Portal (Ctrl+Shift+A)"
                aria-label="Secret Admin Restock"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.08] bg-[#0b0b0e] px-4 pt-4 pb-8 space-y-3 animate-fadeIn">
            {/* VIP Status row on Mobile */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-3 flex items-center justify-between">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> {user.tier} Tier ({user.points} pts)
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-white">VIP Club Privileges</p>
                  <p className="text-xs text-neutral-400">Sign in for member drops & private reservations</p>
                </div>
              )}
              {user ? (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-mono uppercase text-white hover:bg-white/20"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-mono uppercase font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="text-[10px] font-mono font-semibold text-neutral-500 uppercase tracking-widest px-2">
              Collections & Features
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium tracking-wide transition-colors ${
                  isActive(link.path)
                    ? "bg-white text-black font-semibold"
                    : "text-neutral-300 hover:bg-white/[0.04]"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] text-neutral-200 text-sm font-medium"
              >
                <span>Live Order Telemetry</span>
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdminModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-neutral-500 hover:text-neutral-300"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Atelier Administration Vault</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Secret Admin Passkey Modal */}
      <SecretAdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </>
  );
}
