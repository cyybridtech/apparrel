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
    success("Subscribed!", "You'll receive exclusive VIP drop announcements.");
    setEmail("");
  };

  return (
    <>
      <footer className="bg-white border-t border-slate-200 mt-20">
        {/* Perks Row */}
        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-900 shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Real-Time Dispatch</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Live packaging & delivery pipeline with same-day turnaround in Accra.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-900 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">100% Authentic</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Direct brand procurement and multi-point verification for every piece.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-900 shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Paystack Verified</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Instant Mobile Money (MTN, Telecel, AT), Visa, Mastercard, and Apple Pay.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-900 shrink-0">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-heading">Effortless Exchanges</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    7-day size and style exchange guarantee with door-to-door courier swap.
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
                <span className="font-heading font-black text-2xl tracking-tighter text-slate-950 uppercase">
                  APPARREL<span className="text-slate-400">.</span>
                </span>
              </Link>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Curated streetwear tops, authentic retro sneakers, artisanal extrait perfumes, luxury chronographs, and everyday grooming sprays. Redefining modern commerce in West Africa.
              </p>

              {/* Newsletter */}
              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-900 block mb-2">
                  Join the Secret Drop List
                </span>
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                  <button type="submit" className="btn-primary text-xs px-4 py-2.5">
                    {subscribed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-heading">
                Categories
              </h5>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li><Link to="/shop?category=tops" className="hover:text-slate-950 transition-colors">Tops & Graphic Tees</Link></li>
                <li><Link to="/shop?category=sneakers" className="hover:text-slate-950 transition-colors">Sneakers & Kicks</Link></li>
                <li><Link to="/shop?category=perfumes" className="hover:text-slate-950 transition-colors">Perfumes & Scents</Link></li>
                <li><Link to="/shop?category=watches" className="hover:text-slate-950 transition-colors">Watches & Chronos</Link></li>
                <li><Link to="/shop?category=body-sprays" className="hover:text-slate-950 transition-colors">Body Sprays & Mist</Link></li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-heading">
                Orders & Live Tracking
              </h5>
              <ul className="space-y-2.5 text-xs text-slate-500">
                <li><Link to="/track" className="hover:text-slate-950 transition-colors">Live Delivery Telemetry</Link></li>
                <li><Link to="/wishlist" className="hover:text-slate-950 transition-colors">Saved Wishlist</Link></li>
                <li><a href="mailto:support@apparrel.store" className="hover:text-slate-950 transition-colors">Customer Care</a></li>
                <li><span className="text-slate-400">Accra Dispatch Hub: Independence Ave</span></li>
              </ul>
            </div>

            {/* Store Manager / Secret Admin */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4 font-heading">
                Store Management
              </h5>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Authorized inventory restocking and real-time courier dispatch controls.
              </p>
              <button
                onClick={() => setAdminModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Restock Inventory</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 APPARREL INC. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Paystack Secured</span>
              <span>•</span>
              <span>Mapbox Telemetry</span>
              <span>•</span>
              <button
                onClick={() => setAdminModalOpen(true)}
                className="hover:text-slate-600 transition-colors flex items-center gap-1"
              >
                <Lock className="w-3 h-3" />
                <span>Admin</span>
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
