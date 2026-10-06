import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Lock,
  ArrowRight,
  CheckCircle2,
  Gem,
  Sparkles,
  Globe2,
  Store,
  Building2,
} from "lucide-react";
import { SecretAdminModal } from "./SecretAdminModal";
import { useToast } from "../../context/ToastContext";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const { success } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    success("VIP Privileges Activated", "You are now registered for private drop countdowns and VIP capsule previews.");
    setEmail("");
  };

  return (
    <>
      <footer className="bg-white border-t border-slate-200 text-slate-600 mt-24">
        {/* Luxury Pillars Row */}
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-900 shadow-sm shrink-0">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Ghana Express Dispatch</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Live courier dispatch with Mapbox coordinate tracking in under 90 minutes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-900 shadow-sm shrink-0">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">5 Curated Founding Stores</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Footwear, Horology, Streetwear, Audio Tech & Artisan Leather by Cyybrid team leads.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-900 shadow-sm shrink-0">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Paystack Split Settlement</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    MTN Mobile Money, Telecel Cash & Cards with automated subaccount distribution.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-900 shadow-sm shrink-0">
                  <RotateCcw className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Complimentary Exchanges</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    7-day seamless size swaps and concierge support across all catalog drops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <span className="font-heading font-black text-2xl tracking-tight text-slate-950 uppercase">
                  CYYBRID<span className="text-slate-400">.</span>
                </span>
                <span className="block text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
                  Technology Marketplace
                </span>
              </Link>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Ghana's premier multi-seller e-commerce marketplace. Combining unified customer discovery with vendor-isolated inventory matrices and automated split payments.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950 text-white text-xs font-bold hover:bg-black transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Seller Operations Hub</span>
                </Link>
              </div>
            </div>

            {/* Department columns */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
                Founding Stores
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/shop?category=sneakers" className="hover:text-slate-950 transition-colors">
                    Kicks & Soles Hub (Kwame)
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=watches" className="hover:text-slate-950 transition-colors">
                    Chrono & Heritage (Ama)
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=tops" className="hover:text-slate-950 transition-colors">
                    Cyybrid Atelier (Kofi)
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=tech" className="hover:text-slate-950 transition-colors">
                    Volt Audio & Tech (Esi)
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=bags" className="hover:text-slate-950 transition-colors">
                    Artisan Leather (Yaw)
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
                Marketplace Client
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/account" className="hover:text-slate-950 transition-colors">
                    VIP Customer Profile
                  </Link>
                </li>
                <li>
                  <Link to="/track" className="hover:text-slate-950 transition-colors">
                    Live Courier Tracking
                  </Link>
                </li>
                <li>
                  <Link to="/drops" className="hover:text-slate-950 transition-colors">
                    Release Calendar
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-slate-950 transition-colors">
                    About Cyybrid
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-slate-950 transition-colors">
                    Client Concierge Desk
                  </Link>
                </li>
              </ul>
            </div>

            {/* VIP Newsletter column */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
                Marketplace Bulletin
              </h5>
              <p className="text-xs text-slate-500">
                Receive instant notifications when new team drops and limited capsules go live.
              </p>
              {subscribed ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Welcome to Cyybrid VIP</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-950"
                  />
                  <button
                    type="submit"
                    className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-12 mt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 Cyybrid Technology. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/faq" className="hover:text-slate-600 transition-colors">
                Privacy & Terms
              </Link>
              <span>•</span>
              <Link to="/contact" className="hover:text-slate-600 transition-colors">
                Support
              </Link>
              <span>•</span>
              <button
                onClick={() => setAdminModalOpen(true)}
                className="text-slate-300 hover:text-slate-600 transition-colors flex items-center gap-1"
                title="Super Admin Passkey"
              >
                <Lock className="w-3 h-3" />
                <span>Console</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Secret Passkey Modal */}
      <SecretAdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </>
  );
}
