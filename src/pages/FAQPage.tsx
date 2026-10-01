import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Truck, RotateCcw, CreditCard, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "Orders & Shipping" | "Authenticity & Quality" | "Returns & Exchanges" | "Payments & Currency";
}

const FAQS: FAQItem[] = [
  {
    category: "Orders & Shipping",
    question: "How fast is delivery across Ghana and internationally?",
    answer: "For Greater Accra (Airport Residential, East Legon, Cantonments, Osu, Ridge, Dzorwulu), orders placed before 3:00 PM are delivered same-day in under 90 to 180 minutes. Nationwide regional delivery to Kumasi, Takoradi, and Tamale takes 24 to 48 hours. International express courier takes 3 to 5 business days.",
  },
  {
    category: "Orders & Shipping",
    question: "How do I track the fulfillment progress of my order?",
    answer: "You can track your order status in real time by entering your Order Reference Number (e.g. ORD-92841) or Tracking Code on our Track Order page or directly from your Customer Account dashboard.",
  },
  {
    category: "Authenticity & Quality",
    question: "Are all sneakers, garments, and fragrances 100% authentic?",
    answer: "Yes, every single drop in our catalog is authenticated through our multi-point inspection process before being certified, packaged into luxury custom dust bags, and sealed for dispatch.",
  },
  {
    category: "Authenticity & Quality",
    question: "What is the concentration of your extrait de parfum fragrances?",
    answer: "All APPARREL fragrances are formulated at Extrait de Parfum concentration (30% pure perfume oil), guaranteeing 14+ hours of rich sillage and long-lasting projection on skin and garments.",
  },
  {
    category: "Returns & Exchanges",
    question: "What is your size exchange and return policy?",
    answer: "We offer a 7-day complimentary hassle-free size and style exchange on all unworn items in original packaging with intact security tags. Contact our concierge via email or WhatsApp to initiate an instant exchange.",
  },
  {
    category: "Payments & Currency",
    question: "What payment methods are supported?",
    answer: "We accept MTN Mobile Money, Telecel Cash, AT Money, Visa, Mastercard, and Apple Pay powered by Paystack's 256-bit encrypted gateway. You can also view real-time converted prices in USD, EUR, GBP, or NGN using our multi-currency selector.",
  },
];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Orders & Shipping", "Authenticity & Quality", "Returns & Exchanges", "Payments & Currency"];

  const filteredFaqs = selectedCategory === "all"
    ? FAQS
    : FAQS.filter(f => f.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-bold uppercase tracking-wider text-slate-900 font-heading">
          <HelpCircle className="w-4 h-4 text-amber-500" />
          <span>Client Concierge & Help Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-950">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Everything you need to know regarding authentication standards, express dispatch timelines, returns, and VIP benefits.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all capitalize ${
              selectedCategory === cat
                ? "bg-slate-950 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
            }`}
          >
            {cat === "all" ? "All Questions" : cat}
          </button>
        ))}
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    {faq.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-heading">
                    {faq.question}
                  </h4>
                </div>

                <div className="p-1 rounded-full bg-slate-100 text-slate-600 shrink-0">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact CTA */}
      <div className="p-8 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-bold font-heading">Still have questions?</h3>
          <p className="text-xs text-slate-400 mt-1">Our private concierge team is available 24/7 for custom requests.</p>
        </div>
        <Link to="/contact" className="btn-primary bg-white text-slate-950 hover:bg-slate-100 text-xs py-3 px-6 rounded-2xl shrink-0">
          Contact Concierge
        </Link>
      </div>
    </div>
  );
}
