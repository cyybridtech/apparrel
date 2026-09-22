import React from "react";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ShieldCheck,
  Home,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface TrackingTimelineProps {
  status: string;
  orderNo: string;
  createdAt: string;
}

export interface ProgressStep {
  key: string;
  title: string;
  shortLabel: string;
  desc: string;
  details: string;
  icon: any;
}

export const ORDER_STEPS: ProgressStep[] = [
  {
    key: "confirmed",
    title: "Order Placed & Payment Verified",
    shortLabel: "Confirmed",
    desc: "Payment authorized via Paystack gateway",
    details: "Your order has been logged into our warehouse dispatch queue and payment receipt has been issued.",
    icon: ShieldCheck,
  },
  {
    key: "processing",
    title: "Quality Inspection & Luxury Packaging",
    shortLabel: "Packaging",
    desc: "Multi-point authentic check & packaged in custom dust bags",
    details: "Our warehouse team is conducting product authentication and packaging your items in luxury protective boxes.",
    icon: Package,
  },
  {
    key: "dispatched",
    title: "Dispatched from Accra Central Hub",
    shortLabel: "Dispatched",
    desc: "Handed over to dedicated express courier fleet",
    details: "Package has departed the fulfillment facility and is securely sealed with your delivery manifest.",
    icon: Clock,
  },
  {
    key: "in_transit",
    title: "In Transit to Your Area",
    shortLabel: "In Transit",
    desc: "Courier navigating the express transit corridor",
    details: "Courier is en route to your local district with priority same-day handling.",
    icon: Truck,
  },
  {
    key: "out_for_delivery",
    title: "Out for Final Delivery",
    shortLabel: "Out for Delivery",
    desc: "Courier approaching delivery address with direct contact",
    details: "The courier driver is in your neighborhood. Please ensure your phone is accessible.",
    icon: Truck,
  },
  {
    key: "delivered",
    title: "Delivered & Signed",
    shortLabel: "Delivered",
    desc: "Handed over safely to recipient",
    details: "Delivery successfully completed and package received. Thank you for shopping with APPARREL.",
    icon: Home,
  },
];

export function TrackingTimeline({ status, orderNo, createdAt }: TrackingTimelineProps) {
  const getStepIndex = (st: string) => {
    switch (st) {
      case "confirmed":
        return 0;
      case "processing":
        return 1;
      case "dispatched":
        return 2;
      case "in_transit":
        return 3;
      case "out_for_delivery":
        return 4;
      case "delivered":
        return 5;
      default:
        return 3;
    }
  };

  const currentIndex = getStepIndex(status);
  const currentStep = ORDER_STEPS[currentIndex] || ORDER_STEPS[0];
  const progressPercent = Math.round(((currentIndex + 1) / ORDER_STEPS.length) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Header & Overall Status Progress */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Live Order Pipeline
            </span>
            <h3 className="font-heading font-black text-xl text-slate-950 mt-0.5">
              {currentStep.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {currentStep.details}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Step {currentIndex + 1} of {ORDER_STEPS.length}</span>
            </span>
          </div>
        </div>

        {/* Horizontal Progress Bar Meter */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Overall Order Progress</span>
            <span className="font-mono font-bold text-slate-900">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-1"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Step Nodes Horizontal Strip (Desktop) */}
      <div className="hidden lg:grid grid-cols-6 gap-2 pt-2">
        {ORDER_STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center text-center justify-between gap-2 ${
                isCurrent
                  ? "bg-slate-950 text-white border-slate-950 shadow-md scale-105"
                  : isDone
                  ? "bg-slate-50 border-slate-200 text-slate-900"
                  : "bg-white border-slate-100 text-slate-400 opacity-60"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isCurrent
                    ? "bg-emerald-500 text-white shadow-sm"
                    : isDone
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>

              <div>
                <span className="text-[11px] font-bold block leading-tight">
                  {step.shortLabel}
                </span>
                <span
                  className={`text-[9px] font-medium block mt-0.5 ${
                    isCurrent ? "text-slate-300" : isDone ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {isCurrent ? "Active" : isDone ? "Done" : "Pending"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vertical Detailed Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {ORDER_STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Step Node Dot */}
              <div
                className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                  isCurrent
                    ? "bg-emerald-500 border-white text-white ring-4 ring-emerald-100 scale-110 shadow-md"
                    : isDone
                    ? "bg-slate-900 border-white text-white"
                    : "bg-white border-slate-300 text-slate-300"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Step Content */}
              <div
                className={`flex-1 p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? "bg-slate-50 border-emerald-200 shadow-sm"
                    : isDone
                    ? "bg-white border-slate-200/80"
                    : "bg-slate-50/50 border-slate-100 opacity-60"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4
                    className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${
                      isCurrent ? "text-emerald-950 font-heading" : isDone ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    <span>{step.title}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
                        Current Status
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {isDone ? "Checkpoint Verified" : "Upcoming"}
                  </span>
                </div>

                <p
                  className={`text-xs mt-1 leading-relaxed ${
                    isCurrent ? "text-slate-700 font-medium" : isDone ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {step.details}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
