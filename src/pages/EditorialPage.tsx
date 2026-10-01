import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShoppingBag, BookOpen, Quote, Eye } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

interface EditorialArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  heroImage: string;
  excerpt: string;
  quote: string;
  author: string;
  contentParagraphs: string[];
  featuredProduct: {
    slug: string;
    name: string;
    brand: string;
    priceCents: number;
    image: string;
  };
}

const ARTICLES: EditorialArticle[] = [
  {
    id: "art-1",
    slug: "crafting-the-ultimate-heavyweight-tee",
    title: "The Anatomy of 320 GSM French Terry: Why Weight Matters",
    category: "CRAFTSMANSHIP",
    date: "Spring 2026",
    readTime: "4 min read",
    heroImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200",
    excerpt: "Exploring the tactile evolution of luxury streetwear silhouettes through structural organic cotton and bespoke enzyme washing.",
    quote: "True luxury is felt in the drape before it is ever noticed by the eye.",
    author: "Apparrel Design Studio",
    contentParagraphs: [
      "In contemporary streetwear, the silhouette is dictated by weight. By sourcing 320 GSM organic combed cotton, our design team engineered an architectural drape that holds its boxy geometry without clinging or losing shape over repeated wear.",
      "Each garment undergoes an artisanal enzyme wash that softens the outer fibers while preserving the structural integrity of the tight French terry loopback weave. Twin-needle chain stitching on the shoulders guarantees that the collar maintains its clean neckline silhouette indefinitely."
    ],
    featuredProduct: {
      slug: "heavyweight-boxy-noir-tee",
      name: "Heavyweight Boxy Noir Tee",
      brand: "APPARREL STUDIO",
      priceCents: 42000,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600",
    },
  },
  {
    id: "art-2",
    slug: "distilling-royal-amber-oud",
    title: "Artisanal Perfumery: Extracting Aged Smoked Oud & Amber",
    category: "FRAGRANCE LAB",
    date: "Spring 2026",
    readTime: "5 min read",
    heroImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200",
    excerpt: "A deep dive into the 30% concentration extrait de parfum formulation behind our most coveted olfactive creation.",
    quote: "A fragrance should arrive before you enter the room and linger long after you depart.",
    author: "Master Parfumeur",
    contentParagraphs: [
      "Crafted at a 30% pure oil concentration, Royal Amber & Smoked Oud combines wild-harvested Cambodian agarwood with golden amber resin and dry Haitian vetiver. The formulation undergoes a 90-day cold maceration process to achieve its intoxicating, multifaceted trail.",
      "The result is an extrait de parfum with over 16 hours of projection on skin, opening with crisp pink peppercorn and frankincense before settling into a warm, intoxicating veil of smoked woods."
    ],
    featuredProduct: {
      slug: "royal-amber-smoked-oud-extrait",
      name: "Royal Amber & Smoked Oud Extrait",
      brand: "PARFUMS D'OR",
      priceCents: 125000,
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600",
    },
  },
  {
    id: "art-3",
    slug: "court-heritage-footwear-engineering",
    title: "The 1985 Court Silhouette Reimagined in Italian Leather",
    category: "FOOTWEAR ARCHIVE",
    date: "Spring 2026",
    readTime: "6 min read",
    heroImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200",
    excerpt: "Merging vintage basketball heritage with Tuscan full-grain tumbled calfskin and encapsulated air cushioning.",
    quote: "Heritage is not about replicating the past; it is about honoring timeless craftsmanship.",
    author: "Kicks Ghana Workshop",
    contentParagraphs: [
      "The Court Heritage 85 began with a simple ambition: to take the quintessential retro high-top silhouette and rebuild it using luxury bespoke bootmaking standards. We selected full-grain tumbled Italian leather that molds uniquely to the wearer's foot over time.",
      "The sole unit integrates an encapsulated polyurethane air bladder for modern shock absorption, hand-stitched to the upper with durable waxed nylon cord to eliminate adhesive separation."
    ],
    featuredProduct: {
      slug: "retro-high-court-heritage-sneakers",
      name: "Court Heritage 85 High-Top Sneaker",
      brand: "KICKS GH",
      priceCents: 145000,
      image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=600",
    },
  },
];

export function EditorialPage() {
  const { formatPrice } = useCurrency();
  const [selectedArticle, setSelectedArticle] = useState<EditorialArticle>(ARTICLES[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <BookOpen className="w-4 h-4 text-slate-900" />
            <span>The Style Journal & Craftsmanship Archive</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-slate-950">
            The Apparrel Editorial.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            In-depth stories on bespoke textile engineering, artisanal fragrance distillation, luxury horology, and high-fashion aesthetics.
          </p>
        </div>
      </div>

      {/* Featured Main Story */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left Visual (7 cols) */}
        <div className="lg:col-span-7 relative aspect-[4/3] lg:aspect-auto bg-slate-950 overflow-hidden">
          <img
            src={selectedArticle.heroImage}
            alt={selectedArticle.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-slate-950/90 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-400/20 backdrop-blur-md">
              {selectedArticle.category}
            </span>
          </div>
        </div>

        {/* Right Article Body (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span>{selectedArticle.readTime}</span>
              <span>•</span>
              <span>By {selectedArticle.author}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-950 leading-tight">
              {selectedArticle.title}
            </h2>

            {/* Quote callout */}
            <div className="p-4 rounded-2xl bg-slate-50 border-l-4 border-slate-950 text-slate-800 text-xs italic space-y-1">
              <Quote className="w-4 h-4 text-slate-400" />
              <p>"{selectedArticle.quote}"</p>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              {selectedArticle.contentParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>

          {/* Shop the Story Card */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 font-heading">
              Featured In This Story:
            </span>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <img
                  src={selectedArticle.featuredProduct.image}
                  alt={selectedArticle.featuredProduct.name}
                  className="w-12 h-12 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {selectedArticle.featuredProduct.brand}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {selectedArticle.featuredProduct.name}
                  </h4>
                  <span className="text-xs font-black text-slate-950 font-heading">
                    {formatPrice(selectedArticle.featuredProduct.priceCents)}
                  </span>
                </div>
              </div>

              <Link
                to={`/product/${selectedArticle.featuredProduct.slug}`}
                className="btn-primary text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop Piece</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Article Navigation Carousel */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold font-heading text-slate-950">
          More Journal Stories
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ARTICLES.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer space-y-3 ${
                selectedArticle.id === art.id
                  ? "bg-slate-950 text-white border-slate-950 shadow-xl"
                  : "bg-white text-slate-900 border-slate-200 hover:border-slate-400"
              }`}
            >
              <span
                className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                  selectedArticle.id === art.id
                    ? "bg-amber-400/20 text-amber-400 border border-amber-400/30"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {art.category}
              </span>
              <h4 className="text-sm font-bold font-heading line-clamp-2">
                {art.title}
              </h4>
              <p
                className={`text-xs line-clamp-2 ${
                  selectedArticle.id === art.id ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {art.excerpt}
              </p>
              <div className="flex items-center justify-between text-[11px] font-semibold pt-2">
                <span>{art.readTime}</span>
                <span className="flex items-center gap-1 font-bold">
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
