import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock, 
  MessageSquare, 
  CheckCircle2,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderId: "",
    subject: "concierge",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white pt-24 pb-20">
      {/* Header */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono uppercase tracking-widest bg-white/[0.04] border border-white/[0.08] text-indigo-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Direct Concierge Service
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight mb-4">
            Private Client Relations
          </h1>
          <p className="text-neutral-400 font-light text-base sm:text-lg max-w-xl mx-auto">
            Our luxury styling advisors and order concierge specialists are at your command 24 hours a day, 7 days a week.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details & Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-2xl font-serif text-white mb-3">Atelier Channels</h2>
              <p className="text-neutral-400 text-sm font-light">
                Reach out directly or connect with an authorized VIP representative.
              </p>
            </div>

            <div className="space-y-4">
              <a 
                href="mailto:concierge@apparrel.luxury"
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Client Concierge Email</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">concierge@apparrel.luxury</p>
                  <p className="text-[11px] font-mono text-indigo-400 mt-1">Average response: &lt; 20 minutes</p>
                </div>
              </a>

              <a 
                href="https://wa.me/233240000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">VIP WhatsApp Direct Desk</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">+233 24 000 0000 (Global Client Desk)</p>
                  <p className="text-[11px] font-mono text-emerald-400 mt-1">Instant priority routing</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">Flagship Atelier & Showroom</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    No. 18 Airport High Street, Residential Area<br />
                    Accra, Greater Accra Region, Ghana
                  </p>
                  <p className="text-[11px] font-mono text-neutral-500 mt-1">Visits by private appointment only</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-transparent border border-white/[0.06]">
              <div className="flex items-center gap-3 mb-2 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-sm font-semibold text-white">VIP Priority Protection</h4>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                All order issues, size swaps, and custom alterations undergo white-glove review with complimentary insured pickup.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white/[0.02] border border-white/[0.08] relative overflow-hidden">
              {submitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-serif text-white">Inquiry Dispatched to Concierge</h3>
                  <p className="text-neutral-400 text-sm max-w-md mx-auto font-light">
                    Thank you, {formData.name}. A luxury styling consultant has received your ticket and will follow up with you at <strong className="text-white">{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", orderId: "", subject: "concierge", message: "" });
                    }}
                    className="mt-6 px-6 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-serif text-white mb-1">Direct Consultation Form</h3>
                    <p className="text-xs text-neutral-400 font-light">
                      Please provide details regarding your inquiry for dedicated routing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Alexander McQueen"
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@domain.com"
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                        Inquiry Nature
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111116] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/60"
                      >
                        <option value="concierge">Personal Styling & Sizing Concierge</option>
                        <option value="order">Existing Order Status & Logistics</option>
                        <option value="returns">White-Glove Exchange / Returns</option>
                        <option value="press">Editorial, Press & Wholesale</option>
                        <option value="bespoke">Bespoke Atelier Commission</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                        Order Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.orderId}
                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                        placeholder="ORD-92841"
                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/60 font-mono focus:bg-white/[0.05] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-400 mb-2 uppercase">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify your sizing requirements, custom request, or delivery questions..."
                      className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.05] transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-white text-black font-medium text-xs font-mono uppercase tracking-widest rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Transmit Inquiry to Atelier
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
