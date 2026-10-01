import React, { useState } from "react";
import { X, Ruler, Sparkles, Check } from "lucide-react";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"tops" | "sneakers" | "perfumes" | "watches">(() => {
    if (category === "sneakers") return "sneakers";
    if (category === "perfumes" || category === "body-sprays") return "perfumes";
    if (category === "watches") return "watches";
    return "tops";
  });

  const [unit, setUnit] = useState<"cm" | "in">("cm");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-950">
                Official Sizing & Measurement Guide
              </h3>
              <p className="text-xs text-slate-500">
                Find your perfect tailored fit across our international size conversions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-950 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls (Category Selector & Unit Toggle) */}
        <div className="px-6 pt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: "tops", label: "Tops & Shirts" },
              { id: "sneakers", label: "Sneakers" },
              { id: "perfumes", label: "Fragrances" },
              { id: "watches", label: "Watches" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-950 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== "perfumes" && activeTab !== "watches" && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold font-mono">
              <button
                onClick={() => setUnit("cm")}
                className={`px-2.5 py-1 rounded-lg ${unit === "cm" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
              >
                CM
              </button>
              <button
                onClick={() => setUnit("in")}
                className={`px-2.5 py-1 rounded-lg ${unit === "in" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
              >
                INCH
              </button>
            </div>
          )}
        </div>

        {/* Content Tables */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "tops" && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase font-mono text-[10px]">
                    <th className="p-3">Size</th>
                    <th className="p-3">Chest Width</th>
                    <th className="p-3">Body Length</th>
                    <th className="p-3">Shoulder Width</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { size: "S", chest: unit === "cm" ? "54 cm" : "21.2 in", length: unit === "cm" ? "71 cm" : "28.0 in", shoulder: unit === "cm" ? "50 cm" : "19.7 in" },
                    { size: "M", chest: unit === "cm" ? "57 cm" : "22.4 in", length: unit === "cm" ? "73 cm" : "28.7 in", shoulder: unit === "cm" ? "52 cm" : "20.5 in" },
                    { size: "L", chest: unit === "cm" ? "60 cm" : "23.6 in", length: unit === "cm" ? "75 cm" : "29.5 in", shoulder: unit === "cm" ? "54 cm" : "21.3 in" },
                    { size: "XL", chest: unit === "cm" ? "63 cm" : "24.8 in", length: unit === "cm" ? "77 cm" : "30.3 in", shoulder: unit === "cm" ? "56 cm" : "22.0 in" },
                    { size: "XXL", chest: unit === "cm" ? "66 cm" : "26.0 in", length: unit === "cm" ? "79 cm" : "31.1 in", shoulder: unit === "cm" ? "58 cm" : "22.8 in" },
                  ].map((row) => (
                    <tr key={row.size} className="hover:bg-slate-50 font-medium">
                      <td className="p-3 font-bold text-slate-950 font-mono">{row.size}</td>
                      <td className="p-3">{row.chest}</td>
                      <td className="p-3">{row.length}</td>
                      <td className="p-3">{row.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-slate-500 italic">
                * Note: Apparrel tops feature our signature relaxed boxy drop-shoulder cut. If you prefer a tailored fit, choose one size down.
              </p>
            </div>
          )}

          {activeTab === "sneakers" && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase font-mono text-[10px]">
                    <th className="p-3">EU Size</th>
                    <th className="p-3">US Men</th>
                    <th className="p-3">UK Size</th>
                    <th className="p-3">Foot Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    { eu: "EU 40", us: "US 7.5", uk: "UK 6.5", len: unit === "cm" ? "25.0 cm" : "9.8 in" },
                    { eu: "EU 41", us: "US 8.0", uk: "UK 7.0", len: unit === "cm" ? "26.0 cm" : "10.2 in" },
                    { eu: "EU 42", us: "US 8.5 / 9", uk: "UK 8.0", len: unit === "cm" ? "26.5 cm" : "10.4 in" },
                    { eu: "EU 43", us: "US 9.5", uk: "UK 8.5", len: unit === "cm" ? "27.5 cm" : "10.8 in" },
                    { eu: "EU 44", us: "US 10", uk: "UK 9.0", len: unit === "cm" ? "28.0 cm" : "11.0 in" },
                    { eu: "EU 45", us: "US 11", uk: "UK 10.0", len: unit === "cm" ? "29.0 cm" : "11.4 in" },
                  ].map((row) => (
                    <tr key={row.eu} className="hover:bg-slate-50 font-medium">
                      <td className="p-3 font-bold text-slate-950 font-mono">{row.eu}</td>
                      <td className="p-3">{row.us}</td>
                      <td className="p-3">{row.uk}</td>
                      <td className="p-3">{row.len}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-slate-500 italic">
                * Note: Sneaker drops run true to size (TTS). All orders are covered by our 7-day complimentary size exchange guarantee.
              </p>
            </div>
          )}

          {activeTab === "perfumes" && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 font-heading mb-1">50ml Travel Bottle</h4>
                  <p className="text-[11px] text-slate-500">Provides approximately 600 - 750 sprays. Compact for travel and daily carry.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 font-heading mb-1">100ml Signature Flacon</h4>
                  <p className="text-[11px] text-slate-500">Provides approximately 1,200 - 1,500 sprays. Heavyweight French crystal glass with magnetic cap.</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                All fragrances are formulated at <strong>Extrait de Parfum concentration (30%)</strong> with over 14+ hours of projection.
              </p>
            </div>
          )}

          {activeTab === "watches" && (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 font-heading mb-1">40mm - 42mm Case Diameter</h4>
                  <p className="text-[11px] text-slate-500">Standard luxury dimension suitable for wrist circumferences between 15cm - 20cm (6.0" - 8.0").</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 font-heading mb-1">Adjustable Links & Tool</h4>
                  <p className="text-[11px] text-slate-500">Includes complimentary link removal pin tool and interchangeable silicone sport strap.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
