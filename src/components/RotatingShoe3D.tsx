import { useState } from "react";

interface RotatingShoe3DProps {
  imageSrc?: string;
  shoeName?: string;
  priceGhs?: string;
  compareGhs?: string;
  discount?: number;
}

export function RotatingShoe3D({
  imageSrc = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
  shoeName = "Voltage Runner 2",
  priceGhs = "1,490",
  compareGhs,
  discount = 0,
}: RotatingShoe3DProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative mx-auto w-full max-w-md h-[460px] flex items-center justify-center select-none">
      {/* Outer ambient glow rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="absolute h-72 w-72 rounded-full border border-[#00f0ff]/10 animate-[spin_18s_linear_infinite]" />
        <div className="absolute h-80 w-80 rounded-full border border-[#7000ff]/10 animate-[spin_24s_linear_infinite_reverse]" />
        <div className="absolute h-96 w-96 rounded-full bg-gradient-to-r from-[#00f0ff]/5 to-transparent blur-2xl" />
      </div>

      {/* Glowing floor shadow */}
      <div
        className="absolute bottom-10 w-[65%] h-6 rounded-full bg-[#00f0ff]/25 blur-xl"
        style={{ boxShadow: "0 0 40px 12px rgba(0,240,255,0.18)" }}
      />
      <div className="absolute bottom-10 w-[40%] h-2 rounded-full bg-[#00f0ff]/45 blur-md" />

      {/* Sale Banner (shown if discount > 0) */}
      {discount > 0 && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full bg-[#ff3b5c] px-4 py-1.5 shadow-lg shadow-red-900/30">
          <span className="text-xs font-black text-white uppercase tracking-widest">
            🔥 SALE — Save {discount}% Today
          </span>
        </div>
      )}

      {/* 3D Rotating image stage */}
      <div className="relative z-10 flex items-center justify-center" style={{ perspective: "900px" }}>
        <div
          className="relative cursor-pointer"
          style={{
            animation: paused ? "none" : "rotateShoe 10s linear infinite",
            transformStyle: "preserve-3d",
          }}
          onClick={() => setPaused((p) => !p)}
          title={paused ? "Click to resume" : "Click to pause"}
        >
          <img
            src={imageSrc}
            alt={shoeName}
            draggable={false}
            className="w-72 h-72 object-cover rounded-3xl"
            style={{
              boxShadow: "0 30px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0,240,255,0.25)",
              border: "1.5px solid rgba(0,240,255,0.35)",
            }}
          />
          {/* Specular highlight */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 50%, rgba(0,240,255,0.08) 100%)",
            }}
          />
        </div>
      </div>

      {/* Info Badge */}
      <div className="absolute right-0 bottom-16 z-20 rounded-2xl border border-[#00f0ff]/40 bg-[#07090e]/90 backdrop-blur-md px-5 py-3 shadow-2xl">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00f0ff] animate-ping" />
          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            {discount > 0 ? "Featured Sale Drop" : "Featured Drop"}
          </span>
        </div>
        <p className="font-display text-base font-bold text-white truncate max-w-[180px]">{shoeName}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="font-display text-2xl font-black text-[#00f0ff]">GH₵ {priceGhs}</p>
          {compareGhs && (
            <p className="text-sm text-gray-500 line-through font-semibold">GH₵ {compareGhs}</p>
          )}
        </div>
      </div>

      {/* Pause hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 text-[10px] font-bold text-gray-500 tracking-widest uppercase pointer-events-none">
        {paused ? "▶ Click to resume" : "⏸ Click to pause"}
      </div>

      <style>{`
        @keyframes rotateShoe {
          0%   { transform: rotateY(0deg)   rotateX(8deg); }
          25%  { transform: rotateY(90deg)  rotateX(0deg); }
          50%  { transform: rotateY(180deg) rotateX(-8deg); }
          75%  { transform: rotateY(270deg) rotateX(0deg); }
          100% { transform: rotateY(360deg) rotateX(8deg); }
        }
      `}</style>
    </div>
  );
}
