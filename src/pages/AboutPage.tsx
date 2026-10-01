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
  Scissors
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pt-16 pb-20">
      {/* Hero Section */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 border border-slate-200 text-slate-900 mb-6">
            <Gem className="w-3.5 h-3.5" />
            The Apparrel Atelier
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight leading-[1.12] text-slate-950 mb-6">
            Architects of Modern Luxury & Street Elegance
          </h1>
          <p className="text-base sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Founded on the intersection of architectural tailoring, West African heritage, and avant-garde streetwear minimalism.
          </p>
        </div>
      </div>

      {/* Philosophy / Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">
              Our Genesis
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-950 leading-snug">
              Every seam tells a story of relentless precision.
            </h2>
            <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base">
              Apparrel was born from a singular vision: to dismantle the compromise between runway-tier craftsmanship and everyday utilitarian street garments. Every silhouette is engineered from 450+ GSM organic Japanese and Italian milled textiles, cut with surgical precision, and hand-finished by master artisans.
            </p>
            <p className="text-slate-600 leading-relaxed font-normal text-sm sm:text-base">
              We reject mass overproduction. By releasing strictly numbered capsules and curated drop seasons, each piece retains its intrinsic value, rarity, and generational durability.
            </p>
            <div className="pt-4 flex items-center gap-8 border-t border-slate-200">
              <div>
                <p className="text-3xl font-black font-heading text-slate-950">450+</p>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">GSM Average Weight</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <p className="text-3xl font-black font-heading text-slate-950">100%</p>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">Traceable Fibers</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-200" />
              <div>
                <p className="text-3xl font-black font-heading text-slate-950">Zero</p>
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mt-1">Compromises</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop" 
                alt="Atelier Craftsmanship"
                className="w-full h-full object-cover contrast-110 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 text-xs font-bold text-slate-900 shadow-lg">
                Atelier No. 04 — Master Tailoring & Pattern Studio
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
              The Apparrel Standard
            </span>
            <h2 className="text-3xl font-black font-heading text-slate-950 mt-2">Uncompromising Principles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-heading">Bespoke Architectural Cuts</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every drop utilizes proprietary drape ratios, drop shoulders, and reinforced double-needle chain-stitching designed to outlive seasonal trends.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-sm">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-heading">Circular Sustainability</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                All cottons are certified organic, vegetable dyed without toxic heavy metals, and packaged in 100% biodegradable compostable mailers.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-amber-600 shadow-sm">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 font-heading">Global Express Logistics</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dispatched with insured carbon-neutral courier partnerships with direct express tracking to over 120+ countries worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VIP CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-slate-950 text-white shadow-2xl relative overflow-hidden">
          <Sparkles className="w-10 h-10 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-white mb-4">
            Join the Vanguard of High Luxury
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm leading-relaxed mb-8 font-light">
            Experience private preview privileges, drop reservation keys, and personal atelier consultation through our VIP Club.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/drops"
              className="px-8 py-3.5 bg-white text-slate-950 font-bold text-xs font-mono uppercase tracking-wider rounded-full hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg"
            >
              Explore Drops <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/editorial"
              className="px-8 py-3.5 bg-slate-900 border border-slate-800 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-full hover:bg-slate-800 transition-all"
            >
              Read Editorial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
