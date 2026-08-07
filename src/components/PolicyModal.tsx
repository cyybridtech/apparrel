import { IconCheck, IconX } from "@/components/icons";

interface PolicyModalProps {
  type: "shipping" | "returns" | "authenticity" | "privacy" | null;
  onClose: () => void;
}

export function PolicyModal({ type, onClose }: PolicyModalProps) {
  if (!type) return null;

  const content = {
    shipping: {
      title: "Ghana Shipping & Delivery",
      badge: "Express Nationwide Dispatch",
      points: [
        "Greater Accra Region: Same-day or Next-day door delivery (GH₵ 25, or FREE over GH₵ 1,500).",
        "Kumasi, Takoradi & Cape Coast: 1–2 business days express dispatch.",
        "Other Regional Capitals: 2–3 business days via VIP / STC Courier or Home Delivery.",
        "All packages are double-boxed and sealed with tamper-evident security tape.",
      ],
    },
    returns: {
      title: "30-Day Hassle-Free Exchange",
      badge: "100% Satisfaction Guarantee",
      points: [
        "Unworn footwear with original tags can be exchanged or returned within 30 days.",
        "Free size exchanges available across all EU 36–46 sizes in Ghana.",
        "Instant store credit or full bank transfer refund upon inspection.",
        "Simply drop off at our Accra hub or request a courier pickup.",
      ],
    },
    authenticity: {
      title: "100% Authentic Kicks Guarantee",
      badge: "Verified Legit Check",
      points: [
        "Every single sneaker is double-inspected by certified authenticators before listing.",
        "Direct sourcing from authorized distributor networks and verified independent brands.",
        "Includes KICKS GHANA Holographic Serial Tag with cryptographic verification.",
        "Double your money back if any item is ever proven non-authentic.",
      ],
    },
    privacy: {
      title: "Privacy & Data Protection",
      badge: "Encrypted & Secure",
      points: [
        "Your payment and delivery information is encrypted end-to-end.",
        "We never share your phone number or address with third-party marketers.",
        "Full compliance with Ghana Data Protection Act 2012 (Act 843).",
      ],
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel-glow w-full max-w-lg rounded-2xl border border-[#00f0ff]/40 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1b2438] pb-4">
          <div>
            <span className="rounded bg-[#00f0ff]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#00f0ff] uppercase tracking-widest border border-[#00f0ff]/20">
              {content.badge}
            </span>
            <h3 className="font-display text-2xl text-white uppercase tracking-wider mt-2">
              {content.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-[#151c2e] hover:text-white"
          >
            <IconX width={20} height={20} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {content.points.map((pt, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#00f0ff]/20 text-[#00f0ff] mt-0.5">
                <IconCheck width={12} height={12} />
              </span>
              <p className="text-sm text-gray-300 leading-relaxed">{pt}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-[#1b2438] pt-4 text-right">
          <button
            onClick={onClose}
            className="btn-cyan rounded-lg px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
