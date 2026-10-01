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
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80"
            : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-slate-700 hover:text-slate-950 rounded-xl"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <span className="font-heading font-black tracking-tight text-2xl sm:text-3xl text-slate-950 uppercase group-hover:opacity-80 transition-opacity">
                  APPARREL<span className="text-slate-400">.</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono font-bold tracking-widest uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
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
                      className={`relative px-3.5 py-1.5 text-xs font-semibold tracking-wide rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                        active
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                      }`}
                    >
                      {link.label}
                      {link.badge && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
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
                className="p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors"
                title="Search luxury vault (Press /)"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors"
                title="Wishlist"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {totalWishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-mono font-bold text-white bg-slate-900 rounded-full">
                    {totalWishlistCount}
                  </span>
                )}
              </Link>

              {/* VIP Account / Auth Trigger */}
              {user ? (
                <Link
                  to="/account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-all group"
                  title="VIP Account Dashboard"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-mono font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-xs font-bold text-slate-800 truncate max-w-[100px]">
                    {user.name.split(" ")[0]}
                  </span>
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                </Link>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>VIP Access</span>
                </button>
              )}

              {/* Shopping Bag Button */}
              <button
                onClick={openCart}
                className="bg-slate-950 text-white font-medium text-xs py-2 px-3 sm:px-4 rounded-full flex items-center gap-2 hover:bg-black transition-all shadow-sm ml-1"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline font-semibold tracking-wider uppercase text-[11px]">Bag</span>
                {totalItemsCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-mono font-bold text-slate-900 bg-white rounded-full">
                    {totalItemsCount}
                  </span>
                )}
                {subtotalCents > 0 && (
                  <span className="hidden md:inline text-[11px] text-slate-300 font-mono pl-1 border-l border-slate-700">
                    {formatPrice(subtotalCents)}
                  </span>
                )}
              </button>

              {/* Discreet Secret Admin Button */}
              <button
                onClick={() => setAdminModalOpen(true)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
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
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-4 pb-8 space-y-3 animate-fadeIn shadow-xl">
            {/* VIP Status row on Mobile */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-3 flex items-center justify-between">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-mono text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] font-mono text-amber-600 font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> {user.tier} Tier ({user.points} pts)
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-900">VIP Club Privileges</p>
                  <p className="text-xs text-slate-500">Sign in for member drops & private reservations</p>
                </div>
              )}
              {user ? (
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-xs font-semibold uppercase text-white hover:bg-black"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold uppercase"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
              Collections & Features
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                  isActive(link.path)
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 text-slate-900 text-sm font-semibold"
              >
                <span>Live Order Telemetry</span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Real-Time
                </span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAdminModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-800"
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
