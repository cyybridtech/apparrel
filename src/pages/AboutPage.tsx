import React from "react";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ShieldCheck, 
  Globe2, 
  Leaf, 
  Award, 
  ArrowRight,
  Gem,
  Scissors,
  Store,
  Building2,
  Users,
  CreditCard
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pt-16 pb-20">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 border border-slate-200 text-slate-900 mb-6">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            Cyybrid Technology Marketplace
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight leading-[1.12] text-slate-950 mb-6">
            Pioneering Multi-Seller Commerce in Ghana
          </h1>
          <p className="text-base sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            A unified digital marketplace powered by Cyybrid Technology, connecting customers to authenticated founding member stores with automated Paystack split settlement.
          </p>
        </div>
      </div>

      {/* Philosophy / Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">
              The Cyybrid Vision
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-950 leading-snug">
              One unified shopping experience, five specialized vendor guilds.
            </h2>
            <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base">
              Cyybrid Marketplace was architected from the ground up to solve multi-seller commerce in West Africa. Customers experience one cohesive luxury shopping bag and single Paystack checkout, while our backend ensures strict data isolation, real-time split attribution, and automated payouts for every seller node.
            </p>
            <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base">
              From retro high-heat footwear and precision automatic horology to heavyweight loopback French terry and titanium audio engineering, each founding member operates an independent authenticated specialty store.
            </p>
            <div className="pt-4 flex items-center gap-8 border-t border-slate-200">
              <div>
                <p className="text-3xl font-black font-heading text-slate-950">5</p>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">Founding Stores</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <p className="text-3xl font-black font-heading text-slate-950">100%</p>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">Paystack Split MoMo</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <p className="text-3xl font-black font-heading text-slate-950">&lt; 90m</p>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">Courier Dispatch</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop" 
                alt="Cyybrid Atelier Craftsmanship"
                className="w-full h-full object-cover contrast-110 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-900 shadow-lg">
                Cyybrid Technology HQ — Multi-Seller Commerce Engine
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              The Cyybrid Standard
            </span>
            <h2 className="text-3xl font-black font-heading text-slate-950 mt-2">Architecture & Integrity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <Store className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-heading">Data-Isolated Seller Nodes</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every seller operates inside a secure environment where products, variant matrices, and financial ledgers are isolated and encrypted.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-heading">Automated Split Settlements</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Paystack subaccounts automatically distribute 95% net revenue to sellers and 5% company platform share with transparent audit trails.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-heading">Quality & Authenticity Verification</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Super Admin product approval workflows ensure every drop conforms to international luxury and durability standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-20">
        <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-950 mb-4">
          Experience the Future of West African E-Commerce
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto mb-8">
          Browse our curated collections or access the Cyybrid Seller Center.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/shop"
            className="btn-primary py-3.5 px-8 rounded-full text-xs sm:text-sm font-bold shadow-lg"
          >
            <span>Explore Marketplace Drops</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link
            to="/admin"
            className="btn-secondary py-3.5 px-8 rounded-full text-xs sm:text-sm font-bold"
          >
            <span>Launch Seller Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
