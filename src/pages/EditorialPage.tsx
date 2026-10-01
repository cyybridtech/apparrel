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
    author: "Maison Olfactive Desk",
    contentParagraphs: [
      "Unlike conventional commercial perfumes diluted with excess alcohol, our Extrait collection maintains an uncompromising 30% pure perfume oil concentration.",
      "Smoked Cambodian agarwood is aged for 24 months before blending with resinous amber, pink peppercorns, and Madagascar bourbon vanilla, providing a 14-hour skin projection that matures dynamically with body heat."
    ],
    featuredProduct: {
      slug: "royal-amber-extrait-de-parfum",
      name: "Royal Amber Extrait De Parfum",
      brand: "MAISON NOIR",
      priceCents: 85000,
      image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600",
    },
  },
];

export function EditorialPage() {
  const { formatPrice } = useCurrency();
  const [selectedArticle, setSelectedArticle] = useState<EditorialArticle>(ARTICLES[0]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pt-16 pb-20 space-y-16 animate-fadeIn">
      {/* Editorial Header */}
      <div className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 border border-slate-200 text-slate-900">
            <BookOpen className="w-3.5 h-3.5" />
            Apparrel Journal & Lookbook
          </span>
          <h1 className="text-4xl sm:text-6xl font-black font-heading tracking-tight text-slate-950">
            The Atelier Journal
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Essays on architectural tailoring, material integrity, and the subcultures shaping contemporary West African luxury.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Feature Story */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden space-y-6">
              <div className="aspect-[16/9] w-full overflow-hidden relative bg-slate-100">
                <img
                  src={selectedArticle.heroImage}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-4 left-4 px-3 py-1 bg-slate-950/80 backdrop-blur-md text-white rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                  {selectedArticle.category}
                </span>
              </div>

              <div className="p-6 sm:p-10 space-y-6">
                <div className="flex items-center gap-3 text-xs font-mono text-slate-500 font-bold">
                  <span>{selectedArticle.date}</span>
                  <span>•</span>
                  <span>{selectedArticle.readTime}</span>
                  <span>•</span>
                  <span>By {selectedArticle.author}</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-950 leading-tight">
                  {selectedArticle.title}
                </h2>

                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                  {selectedArticle.excerpt}
                </p>

                {/* Pull Quote */}
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <Quote className="w-8 h-8 text-slate-400" />
                  <p className="text-base sm:text-lg font-serif italic text-slate-900 font-medium">
                    "{selectedArticle.quote}"
                  </p>
                  <span className="text-xs font-mono text-slate-500 block">— {selectedArticle.author}</span>
                </div>

                {/* Body Paragraphs */}
                <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedArticle.contentParagraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {/* Shop The Look Callout */}
                <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedArticle.featuredProduct.image}
                      alt={selectedArticle.featuredProduct.name}
                      className="w-16 h-16 rounded-xl object-cover bg-white border border-slate-200"
                    />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Shop The Look</span>
                      <h4 className="text-sm font-bold text-slate-950 font-heading">
                        {selectedArticle.featuredProduct.name}
                      </h4>
                      <p className="text-xs font-mono font-bold text-slate-900">
                        {formatPrice(selectedArticle.featuredProduct.priceCents)}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/product/${selectedArticle.featuredProduct.slug}`}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 text-white font-bold text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>View Piece</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Articles List */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-mono">
              Curated Articles
            </h3>

            <div className="space-y-4">
              {ARTICLES.map((article) => {
                const isActive = article.id === selectedArticle.id;
                return (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex gap-4 ${
                      isActive
                        ? "bg-white border-slate-900 shadow-md"
                        : "bg-white border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block">
                        {article.category} • {article.readTime}
                      </span>
                      <h4 className="text-xs font-bold text-slate-950 line-clamp-2 mt-1">
                        {article.title}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
