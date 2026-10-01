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
    success("Vault Access Granted", "You are now registered for private drop countdowns and VIP capsules.");
    setEmail("");
  };

  return (
    <>
      <footer className="bg-[#070709] border-t border-white/[0.06] text-neutral-300 mt-24">
        {/* Luxury Pillars Row */}
        <div className="border-b border-white/[0.06] bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-indigo-400 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">Global Express Courier</h4>
                  <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                    Insured direct transit across 120+ countries with white-glove packaging.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">100% Certified Authenticity</h4>
                  <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                    Serialized atelier authentication cards accompanying every collector item.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-amber-400 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">Encrypted Checkout</h4>
                  <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                    Mobile Money, Visa, Mastercard, Apple Pay & bank transfers with Paystack 256-bit encryption.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/[0.08] text-rose-400 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white tracking-wide">Complimentary Exchanges</h4>
                  <p className="text-xs text-neutral-400 mt-1 font-light leading-relaxed">
                    14-day seamless size swaps and bespoke tailoring consultation on all pieces.
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
            <div className="lg:col-span-2 space-y-5">
              <Link to="/" className="inline-block">
                <span className="font-serif tracking-tighter text-2xl text-white uppercase font-bold">
                  APPARREL<span className="text-indigo-400">.</span>
                </span>
              </Link>
              <p className="text-xs text-neutral-400 max-w-sm font-light leading-relaxed">
                Pioneering high-tier contemporary fashion, limited-run streetwear archives, artisanal fragrances, and precision chronographs. Engineered in West Africa for the global avant-garde.
              </p>

              {/* Newsletter */}
              <div className="pt-2">
                <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider block mb-2">
                  Join The Atelier Private List
                </span>
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@apparrel.luxury"
                    required
                    className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-full text-xs text-white focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all font-mono"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-white text-black font-medium text-xs rounded-full hover:bg-neutral-200 transition-colors shrink-0">
                    {subscribed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>

            {/* Atelier Vault */}
            <div>
              <h5 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4">
                Atelier
              </h5>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li><Link to="/shop" className="hover:text-white transition-colors">All Collections</Link></li>
                <li><Link to="/drops" className="hover:text-white transition-colors flex items-center gap-1.5">Drops Calendar <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /></Link></li>
                <li><Link to="/editorial" className="hover:text-white transition-colors">Editorial Journal</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">Craftsmanship Story</Link></li>
              </ul>
            </div>

            {/* Client Services */}
            <div>
              <h5 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4">
                Concierge
              </h5>
              <ul className="space-y-2.5 text-xs text-neutral-400">
                <li><Link to="/account" className="hover:text-white transition-colors">VIP Client Dashboard</Link></li>
                <li><Link to="/track" className="hover:text-white transition-colors">Live Order Telemetry</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">Shipping & FAQ</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Styling Concierge</Link></li>
                <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Vault Items</Link></li>
              </ul>
            </div>

            {/* Atelier Governance */}
            <div>
              <h5 className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-4">
                Executive Portal
              </h5>
              <p className="text-xs text-neutral-500 mb-3 leading-relaxed font-light">
                Enterprise dashboard for supply chain restock, VIP allocations, and inventory management.
              </p>
              <button
                onClick={() => setAdminModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-xs font-mono text-neutral-300 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Executive Terminal</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
            <p>© 2026 APPARREL ATELIER INC. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4">
              <span>PCI-DSS CERTIFIED</span>
              <span>•</span>
              <span>GLOBAL VAULT LOGISTICS</span>
              <span>•</span>
              <button
                onClick={() => setAdminModalOpen(true)}
                className="hover:text-neutral-300 transition-colors flex items-center gap-1"
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
