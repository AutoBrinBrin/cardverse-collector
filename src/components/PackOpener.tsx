import * as React from "react";
import { HolographicCard } from "./HolographicCard";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type Card = { id: string; name: string; rarity: string; element: string; power: number; art_color: string };

export function PackOpener({ cards, onDone }: { cards: Card[]; onDone: () => void }) {
  const [revealed, setRevealed] = React.useState(0);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Suas novas cartas</h2>
        <p className="text-muted-foreground text-sm">Toque para revelar ({revealed}/{cards.length})</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 w-full max-w-4xl">
        {cards.map((c, i) => (
          <RevealCard key={i} card={c} onReveal={() => setRevealed((r) => Math.min(cards.length, r + 1))} delayMs={i * 120} />
        ))}
      </div>
      <Button size="lg" onClick={onDone} variant={revealed === cards.length ? "default" : "outline"}>
        Adicionar ao álbum
      </Button>
    </div>
  );
}

function RevealCard({ card, onReveal, delayMs }: { card: Card; onReveal: () => void; delayMs: number }) {
  const [flipped, setFlipped] = React.useState(false);
  const [appeared, setAppeared] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setAppeared(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  const flip = () => {
    if (flipped) return;
    setFlipped(true);
    onReveal();
  };

  return (
    <div className={cn("relative aspect-[5/7] cursor-pointer transition-all duration-500", appeared ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")} style={{ perspective: "1000px" }} onClick={flip}>
      <div className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700" style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}>
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-gradient-to-br from-indigo-900 to-violet-950 ring-2 ring-violet-500/40 flex items-center justify-center text-5xl shadow-2xl">
          ✦
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
          <HolographicCard card={card} />
        </div>
      </div>
    </div>
  );
}
