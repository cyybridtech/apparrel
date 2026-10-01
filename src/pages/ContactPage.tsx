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
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pt-16 pb-20">
      {/* Header */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200/80 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 border border-slate-200 text-slate-900 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Direct Concierge Service
          </span>
          <h1 className="text-4xl sm:text-5xl font-black font-heading text-slate-950 tracking-tight mb-4">
            Private Client Relations
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Our luxury styling advisors and order concierge specialists are at your command 24 hours a day, 7 days a week.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Details & Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-2xl font-black font-heading text-slate-950 mb-2">Atelier Channels</h2>
              <p className="text-slate-500 text-xs sm:text-sm">
                Reach out directly or connect with an authorized VIP representative.
              </p>
            </div>

            <div className="space-y-4">
              <a 
                href="mailto:concierge@apparrel.luxury"
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-400 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 font-heading">Client Concierge Email</h3>
                  <p className="text-xs text-slate-500 mt-0.5">concierge@apparrel.luxury</p>
                  <p className="text-[11px] font-mono text-emerald-600 font-semibold mt-1">Average response: &lt; 20 minutes</p>
                </div>
              </a>

              <a 
                href="https://wa.me/233240000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 font-heading">VIP WhatsApp Direct Desk</h3>
                  <p className="text-xs text-slate-500 mt-0.5">+233 24 000 0000 (Global Client Desk)</p>
                  <p className="text-[11px] font-mono text-emerald-600 font-semibold mt-1">Instant priority routing</p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 font-heading">Flagship Atelier & Showroom</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    No. 18 Airport High Street, Residential Area<br />
                    Accra, Greater Accra Region, Ghana
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">Visits by private appointment only</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xl">
              <div className="flex items-center gap-3 mb-2 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="text-sm font-bold font-heading text-white">VIP Priority Protection</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-light">
                All order inquiries, size swaps, and custom alterations undergo white-glove review with complimentary insured courier pickup.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden">
              {submitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-slate-950">Inquiry Dispatched to Concierge</h3>
                  <p className="text-slate-600 text-sm max-w-md mx-auto">
                    Thank you, {formData.name}. A luxury styling consultant has received your ticket and will follow up at <strong className="text-slate-900">{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: "", email: "", orderId: "", subject: "concierge", message: "" });
                    }}
                    className="mt-6 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors font-mono"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold font-heading text-slate-950 mb-1">Direct Consultation Form</h3>
                    <p className="text-xs text-slate-500">
                      Please provide details regarding your inquiry for dedicated routing.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Alexander McQueen"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="client@domain.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
                        Inquiry Nature
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="concierge">Personal Styling & Sizing Concierge</option>
                        <option value="order">Existing Order Status & Logistics</option>
                        <option value="returns">White-Glove Exchange / Returns</option>
                        <option value="press">Editorial, Press & Wholesale</option>
                        <option value="bespoke">Bespoke Atelier Commission</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
                        Order Reference (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.orderId}
                        onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                        placeholder="ORD-92841"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-mono">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify your sizing requirements, custom request, or delivery questions..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-slate-950 text-white font-bold text-xs font-mono uppercase tracking-widest rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 group shadow-lg"
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
