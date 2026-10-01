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
    <div className="min-h-screen bg-[#070709] text-white pt-24 pb-20">
      {/* Hero Section */}
      <div className="relative py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-white/[0.04] border border-white/[0.08] text-indigo-400 mb-6">
            <Gem className="w-3.5 h-3.5" />
            The Apparrel Atelier
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif tracking-tight leading-[1.15] mb-6">
            Architects of Modern Luxury & Global Street Elegance
          </h1>
          <p className="text-lg sm:text-xl text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto">
            Founded on the intersection of architectural tailoring, West African heritage, and avant-garde streetwear minimalism.
          </p>
        </div>
      </div>

      {/* Philosophy / Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase">
              Our Genesis
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-white leading-snug">
              Every seam tells a story of relentless precision.
            </h2>
            <p className="text-neutral-400 leading-relaxed font-light">
              Apparrel was born from a singular vision: to dismantle the compromise between runway-tier craftsmanship and everyday utilitarian street garments. Every silhouette is engineered from 450+ GSM organic Japanese and Italian milled textiles, cut with surgical precision, and hand-finished by master artisans.
            </p>
            <p className="text-neutral-400 leading-relaxed font-light">
              We reject mass overproduction. By releasing strictly numbered capsules and curated drop seasons, each piece retains its intrinsic value, rarity, and generational durability.
            </p>
            <div className="pt-4 flex items-center gap-8 border-t border-white/[0.06]">
              <div>
                <p className="text-3xl font-serif text-white">450+</p>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mt-1">GSM Average Weight</p>
              </div>
              <div className="h-10 w-[1px] bg-white/[0.08]" />
              <div>
                <p className="text-3xl font-serif text-white">100%</p>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mt-1">Traceable Fibers</p>
              </div>
              <div className="h-10 w-[1px] bg-white/[0.08]" />
              <div>
                <p className="text-3xl font-serif text-white">Zero</p>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-wider mt-1">Compromises</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop" 
                alt="Atelier Craftsmanship"
                className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-neutral-300">
                Atelier No. 04 — Master Tailoring & Pattern Studio
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="bg-white/[0.02] border-y border-white/[0.06] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase">
              The Apparrel Standard
            </span>
            <h2 className="text-3xl font-serif text-white mt-2">Uncompromising Principles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white">Bespoke Architectural Cuts</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed">
                Every drop utilizes proprietary drape ratios, drop shoulders, and reinforced double-needle chain-stitching designed to outlive trends.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white">Circular Sustainability</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed">
                All cottons are certified organic, vegetable dyed without toxic heavy metals, and packaged in 100% biodegradable compostable mailers.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 hover:border-white/20 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white">Global Express Logistics</h3>
              <p className="text-sm text-neutral-400 font-light leading-relaxed">
                Dispatched with insured carbon-neutral courier partnerships with direct express tracking to over 120+ countries worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* VIP CTA */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-b from-indigo-950/40 via-white/[0.02] to-transparent border border-indigo-500/20 relative overflow-hidden">
          <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-serif text-white mb-4">
            Join the Vanguard of High Luxury
          </h2>
          <p className="text-neutral-400 max-w-xl mx-auto font-light mb-8">
            Experience private preview privileges, drop reservation keys, and personal atelier consultation through our VIP Club.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/drops"
              className="px-8 py-4 bg-white text-black font-medium text-sm tracking-wider uppercase rounded-full hover:bg-neutral-200 transition-all flex items-center gap-2"
            >
              Explore Drops <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/editorial"
              className="px-8 py-4 bg-white/[0.05] border border-white/10 text-white font-medium text-sm tracking-wider uppercase rounded-full hover:bg-white/10 transition-all"
            >
              Read Editorial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
