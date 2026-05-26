import * as React from "react";
import { HolographicCard } from "./HolographicCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Card = { id: string; name: string; rarity: string; element: string; power: number; art_color: string };

const PER_PAGE = 4; // 2x2 grid per page side

export function Album3D({ cards }: { cards: Card[] }) {
  // group cards into pages of PER_PAGE
  const pages = React.useMemo(() => {
    const out: Card[][] = [];
    for (let i = 0; i < cards.length; i += PER_PAGE) out.push(cards.slice(i, i + PER_PAGE));
    if (out.length === 0) out.push([]);
    // ensure even number of pages so spreads work
    if (out.length % 2 === 1) out.push([]);
    return out;
  }, [cards]);

  const totalSpreads = Math.max(1, pages.length / 2);
  const [spread, setSpread] = React.useState(0);
  const [flipping, setFlipping] = React.useState<number | null>(null);

  const goNext = () => {
    if (spread >= totalSpreads - 1) return;
    setFlipping(spread);
    setTimeout(() => { setSpread((s) => s + 1); setFlipping(null); }, 700);
  };
  const goPrev = () => {
    if (spread <= 0) return;
    setFlipping(spread - 1);
    setTimeout(() => { setSpread((s) => s - 1); setFlipping(null); }, 700);
  };

  const leftIdx = spread * 2;
  const rightIdx = spread * 2 + 1;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div
        className="relative w-full max-w-5xl aspect-[2/1.3] sm:aspect-[2/1.2]"
        style={{ perspective: "2400px" }}
      >
        {/* Book cover backdrop */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-900/40 via-stone-900 to-stone-950 shadow-2xl border border-amber-700/30" />

        <div
          className="absolute inset-2 sm:inset-4 grid grid-cols-2 gap-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Left static page */}
          <PageFace cards={pages[leftIdx] ?? []} pageNum={leftIdx + 1} side="left" />
          {/* Right static page (under flipping) */}
          <PageFace cards={pages[rightIdx] ?? []} pageNum={rightIdx + 1} side="right" />

          {/* Flipping page overlay (right side flips left) */}
          {flipping !== null && (
            <FlipPage
              frontCards={pages[flipping * 2 + 1] ?? []}
              backCards={pages[(flipping + 1) * 2] ?? []}
              frontPage={flipping * 2 + 2}
              backPage={(flipping + 1) * 2 + 1}
              forward={flipping === spread}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={goPrev} disabled={spread === 0 || flipping !== null}>
          <ChevronLeft />
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          Página {leftIdx + 1}-{rightIdx + 1} de {pages.length}
        </span>
        <Button variant="outline" size="icon" onClick={goNext} disabled={spread >= totalSpreads - 1 || flipping !== null}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

function PageFace({ cards, pageNum, side }: { cards: Card[]; pageNum: number; side: "left" | "right" }) {
  return (
    <div className={cn(
      "relative h-full bg-gradient-to-br from-stone-100 to-stone-300 dark:from-stone-200 dark:to-stone-400 p-3 sm:p-5 shadow-inner",
      side === "left" ? "rounded-l-xl border-r border-stone-400/40" : "rounded-r-xl border-l border-stone-400/40"
    )}>
      <PageContent cards={cards} pageNum={pageNum} />
    </div>
  );
}

function PageContent({ cards, pageNum }: { cards: Card[]; pageNum: number }) {
  return (
    <div className="relative h-full flex flex-col">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1">
        {Array.from({ length: PER_PAGE }).map((_, i) => {
          const card = cards[i];
          return (
            <div key={i} className="rounded-lg bg-stone-900/5 ring-1 ring-stone-900/10 p-1 flex items-center justify-center">
              {card ? (
                <HolographicCard card={card} className="max-h-full" />
              ) : (
                <div className="text-stone-400 text-xs">Vazio</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="absolute bottom-1 right-3 text-[10px] text-stone-600 font-serif italic">— {pageNum} —</div>
    </div>
  );
}

function FlipPage({
  frontCards, backCards, frontPage, backPage, forward,
}: { frontCards: Card[]; backCards: Card[]; frontPage: number; backPage: number; forward: boolean }) {
  return (
    <div
      className="absolute top-0 right-0 w-1/2 h-full origin-left animate-flip"
      style={{
        transformStyle: "preserve-3d",
        animation: `${forward ? "flipFwd" : "flipBack"} 0.7s ease-in-out forwards`,
      }}
    >
      <div className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-stone-100 to-stone-300 rounded-r-xl p-3 sm:p-5 shadow-2xl">
        <PageContent cards={frontCards} pageNum={frontPage} />
      </div>
      <div
        className="absolute inset-0 [backface-visibility:hidden] bg-gradient-to-br from-stone-200 to-stone-400 rounded-l-xl p-3 sm:p-5 shadow-2xl"
        style={{ transform: "rotateY(180deg)" }}
      >
        <PageContent cards={backCards} pageNum={backPage} />
      </div>
      <style>{`
        @keyframes flipFwd { from { transform: rotateY(0deg); } to { transform: rotateY(-180deg); } }
        @keyframes flipBack { from { transform: rotateY(-180deg); } to { transform: rotateY(0deg); } }
      `}</style>
    </div>
  );
}
