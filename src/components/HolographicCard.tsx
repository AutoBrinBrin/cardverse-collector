import * as React from "react";
import { cn } from "@/lib/utils";

type Card = {
  id: string;
  name: string;
  rarity: string;
  element: string;
  power: number;
  description?: string | null;
  art_color: string;
};

const rarityBg: Record<string, string> = {
  common: "from-slate-500 to-slate-700",
  rare: "from-sky-400 to-blue-700",
  epic: "from-fuchsia-500 to-purple-800",
  legendary: "from-amber-400 via-orange-500 to-rose-600",
};

export function HolographicCard({ card, className, interactive = true }: { card: Card; className?: string; interactive?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  const onMove = (e: React.MouseEvent) => {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt({ rx: (0.5 - y) * 18, ry: (x - 0.5) * 18, mx: x * 100, my: y * 100 });
  };
  const reset = () => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={cn("relative aspect-[5/7] w-full select-none [perspective:1000px]", className)}
    >
      <div
        className="relative h-full w-full rounded-2xl transition-transform duration-150 ease-out [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        {/* Card body */}
        <div className={cn("absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br", rarityBg[card.rarity] ?? rarityBg.common)}>
          {/* Art area */}
          <div className="absolute inset-x-3 top-3 bottom-20 rounded-xl overflow-hidden ring-1 ring-white/20" style={{ background: `radial-gradient(circle at 30% 30%, ${card.art_color}, #000 80%)` }}>
            <div className="absolute inset-0 flex items-center justify-center text-6xl">
              {elementGlyph(card.element)}
            </div>
          </div>
          {/* Header */}
          <div className="absolute top-2 inset-x-3 flex items-center justify-between text-xs font-bold text-white/90">
            <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur uppercase tracking-wider">{card.rarity}</span>
            <span className="px-2 py-0.5 rounded-full bg-black/40 backdrop-blur">⚡ {card.power}</span>
          </div>
          {/* Name + element */}
          <div className="absolute bottom-2 inset-x-3 rounded-lg bg-black/55 backdrop-blur px-3 py-2 text-white">
            <div className="font-bold leading-tight text-sm truncate">{card.name}</div>
            <div className="text-[10px] opacity-70 uppercase tracking-wider">{card.element}</div>
          </div>
          {/* Plastic / holo overlays */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-color-dodge opacity-60"
            style={{
              background: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, rgba(255,255,255,0.55), transparent 45%)`,
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-overlay opacity-40"
            style={{
              background:
                "conic-gradient(from 0deg, #ff00cc, #3333ff, #00ffcc, #ffcc00, #ff00cc)",
              maskImage: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, black 0%, transparent 60%)`,
              WebkitMaskImage: `radial-gradient(circle at ${tilt.mx}% ${tilt.my}%, black 0%, transparent 60%)`,
            }}
          />
          {/* Glossy plastic sheen */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 via-transparent to-white/5" />
        </div>
      </div>
    </div>
  );
}

function elementGlyph(el: string) {
  switch (el) {
    case "fire": return "🔥";
    case "water": return "💧";
    case "earth": return "🌿";
    case "air": return "🌪️";
    case "arcane": return "✨";
    default: return "❖";
  }
}
