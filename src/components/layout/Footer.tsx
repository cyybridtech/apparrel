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
  Globe2
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
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Global Express Logistics</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Insured direct express dispatch across 120+ countries with white-glove packaging.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-900 shadow-sm shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">100% Certified Authenticity</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Serialized atelier authentication cards accompanying every collector item.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-900 shadow-sm shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Encrypted Checkout</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Mobile Money, Visa, Mastercard & Apple Pay with Paystack 256-bit encryption.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-900 shadow-sm shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Complimentary Exchanges</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    14-day seamless size swaps and bespoke styling consultation on all catalog drops.
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
                  APPARREL<span className="text-slate-400">.</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Pioneering high-tier contemporary fashion, limited-run streetwear archives, artisanal extrait fragrances, and precision chronographs. Engineered in West Africa for the global avant-garde.
              </p>

              {/* Newsletter */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2 font-heading">
                  Join The Atelier Private List
                </span>
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@apparrel.luxury"
                    required
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-mono"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-slate-950 text-white font-semibold text-xs rounded-full hover:bg-black transition-colors shrink-0 shadow-sm">
                    {subscribed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>

            {/* Atelier Vault */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-heading">
                Atelier
              </h5>
              <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
                <li><Link to="/shop" className="hover:text-slate-950 transition-colors">All Collections</Link></li>
                <li><Link to="/drops" className="hover:text-slate-950 transition-colors flex items-center gap-1.5">Drops Calendar <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /></Link></li>
                <li><Link to="/editorial" className="hover:text-slate-950 transition-colors">Editorial Lookbook</Link></li>
                <li><Link to="/about" className="hover:text-slate-950 transition-colors">Craftsmanship Story</Link></li>
              </ul>
            </div>

            {/* Client Services */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-heading">
                Concierge
              </h5>
              <ul className="space-y-2.5 text-xs text-slate-500 font-medium">
                <li><Link to="/account" className="hover:text-slate-950 transition-colors">VIP Client Dashboard</Link></li>
                <li><Link to="/track" className="hover:text-slate-950 transition-colors">Live Order Telemetry</Link></li>
                <li><Link to="/faq" className="hover:text-slate-950 transition-colors">Shipping & Exchanges FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-slate-950 transition-colors">Personal Styling Desk</Link></li>
                <li><Link to="/wishlist" className="hover:text-slate-950 transition-colors">Saved Vault Items</Link></li>
              </ul>
            </div>

            {/* Atelier Governance */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-heading">
                Executive Portal
              </h5>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Enterprise operations portal for inventory restock, live orders, and catalog management.
              </p>
              <button
                onClick={() => setAdminModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                <span>Executive Terminal</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
            <p>© 2026 APPARREL ATELIER INC. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4">
              <span>PAYSTACK SECURED</span>
              <span>•</span>
              <span>PCI-DSS CERTIFIED</span>
              <span>•</span>
              <button
                onClick={() => setAdminModalOpen(true)}
                className="hover:text-slate-700 transition-colors flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>STAFF AUTH</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Secret Admin Passkey Modal */}
      <SecretAdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />
    </>
  );
}
