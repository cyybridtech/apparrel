import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  Search,
  Truck,
  Menu,
  X,
  Lock,
  ChevronDown,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { SecretAdminModal } from "./SecretAdminModal";
import { formatPrice } from "../../lib/utils";

const NAV_LINKS = [
  { label: "All Drops", path: "/shop" },
  { label: "Tops & Shirts", path: "/shop?category=tops" },
  { label: "Sneakers", path: "/shop?category=sneakers" },
  { label: "Perfumes", path: "/shop?category=perfumes" },
  { label: "Watches", path: "/shop?category=watches" },
  { label: "Body Sprays", path: "/shop?category=body-sprays" },
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

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Shortcut Ctrl+Shift+A or Cmd+Shift+A for secret admin
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
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100" : "bg-white border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -ml-2 text-slate-700 hover:text-black rounded-lg"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="font-heading font-extrabold text-2xl tracking-tighter text-slate-950 uppercase group-hover:opacity-80 transition-opacity">
                  APPARREL<span className="text-slate-400">.</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold tracking-widest uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                  EST. 2026
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
                      className={`px-3 py-1.5 text-xs font-semibold tracking-wide rounded-full transition-all duration-150 ${
                        active
                          ? "bg-slate-950 text-white"
                          : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Live Real-Time Tracking Link */}
              <Link
                to="/track"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/80 transition-all"
                title="Track Live Delivery"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Truck className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline">Live Tracking</span>
              </Link>

              {/* Search Trigger */}
              <button
                onClick={onOpenSearch}
                className="p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-full transition-colors"
                title="Search products (Press /)"
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
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-slate-900 rounded-full">
                    {totalWishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Button */}
              <button
                onClick={openCart}
                className="btn-primary text-xs py-2 px-3 sm:px-4 ml-1 flex items-center gap-2 shadow-sm"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline font-semibold">Bag</span>
                {totalItemsCount > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-slate-900 bg-white rounded-full">
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
                className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                title="Admin Restock Portal (Ctrl+Shift+A)"
                aria-label="Secret Admin Restock"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2">
              Browse Collections
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive(link.path)
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/track"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 text-slate-900 text-sm font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Track Live Delivery</span>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
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
                <span>Restock / Admin Login</span>
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
