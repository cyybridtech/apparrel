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
  ChevronDown,
  Store,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";
import { SecretAdminModal } from "./SecretAdminModal";

const NAV_LINKS = [
  { label: "Marketplace", path: "/shop" },
  { label: "Footwear", path: "/shop?category=sneakers" },
  { label: "Watches", path: "/shop?category=watches" },
  { label: "Apparel", path: "/shop?category=tops" },
  { label: "Tech & Audio", path: "/shop?category=tech" },
  { label: "Leather & Bags", path: "/shop?category=bags" },
  { label: "Drops Calendar", path: "/drops", badge: "Live" },
  { label: "Editorial", path: "/editorial" },
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

  // Shortcut Ctrl+Shift+A for secret admin / seller portal
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
                  CYYBRID<span className="text-slate-400">.</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-widest uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  MARKETPLACE
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
                title="Search marketplace (Press /)"
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

              {/* Account / Auth Trigger */}
              {user ? (
                <div className="relative group">
                  <button
                    onClick={() => navigate("/account")}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 hover:border-slate-300 text-xs font-medium text-slate-800 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-700" />
                    <span className="hidden md:inline font-bold">{user.name.split(" ")[0]}</span>
                    <span className="text-[10px] font-mono bg-slate-200/70 text-slate-700 px-1.5 py-0.5 rounded capitalize">
                      {user.role}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Seller / Admin Portal Direct Button */}
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-sm"
                title="Cyybrid Seller Center & Admin Cockpit"
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">Seller Center</span>
              </Link>

              {/* Shopping Bag Trigger */}
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 hover:bg-black text-white text-xs font-bold transition-transform active:scale-95 shadow-sm"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span className="font-mono">{totalItemsCount}</span>
                {totalItemsCount > 0 && (
                  <span className="hidden md:inline font-mono text-[11px] opacity-80 border-l border-slate-700 pl-2">
                    {formatPrice(subtotalCents)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                    isActive(link.path)
                      ? "bg-slate-950 text-white"
                      : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Cyybrid Seller Center & Admin Cockpit</span>
              </Link>

              {user ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    openAuthModal("login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Secret Passkey Modal */}
      <SecretAdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </>
  );
}
