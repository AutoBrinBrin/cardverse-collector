import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Album3D } from "@/components/Album3D";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/album")({ component: AlbumPage });

type CardRow = { id: string; name: string; rarity: string; element: string; power: number; art_color: string };

function AlbumPage() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [cards, setCards] = useState<CardRow[]>([]);

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: uc } = await supabase.from("user_cards").select("card_id").eq("user_id", user.id);
      const ids = (uc ?? []).map((r: { card_id: string }) => r.card_id);
      if (!ids.length) { setCards([]); return; }
      const { data: cs } = await supabase.from("cards").select("*").in("id", ids);
      // order by rarity for nicer pages
      const rOrder: Record<string, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };
      const sorted = ((cs ?? []) as CardRow[]).sort((a, b) => (rOrder[a.rarity] - rOrder[b.rarity]) || a.name.localeCompare(b.name));
      // duplicate-aware: include one entry per user_card row
      const idCount: Record<string, number> = {};
      ids.forEach((id) => { idCount[id] = (idCount[id] || 0) + 1; });
      const expanded: CardRow[] = [];
      sorted.forEach((c) => { for (let i = 0; i < (idCount[c.id] || 0); i++) expanded.push(c); });
      setCards(expanded);
    })();
  }, [user]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3"><BookOpen className="size-8 text-amber-400" /> Álbum de Cartas</h1>
          <p className="text-muted-foreground mt-2">Folheie suas {cards.length} carta{cards.length === 1 ? "" : "s"}. Clique em uma para visualização 3D.</p>
        </div>
      </div>

      {cards.length === 0 ? (
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-12 text-center text-muted-foreground space-y-3">
            <p>Você ainda não tem cartas. Compre pacotes e abra-os para começar!</p>
            <Button asChild><Link to="/shop">Ir à loja</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Album3D cards={cards} />
          <div>
            <h2 className="text-xl font-semibold mb-3">Toque para visualizar em 3D</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {dedupe(cards).map((c) => (
                <Link key={c.id} to="/card/$cardId" params={{ cardId: c.id }} className="block rounded-lg ring-1 ring-white/10 hover:ring-violet-500/60 transition-all p-1">
                  <MiniCard card={c} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function dedupe(cards: CardRow[]) {
  const seen = new Set<string>();
  return cards.filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; });
}

function MiniCard({ card }: { card: CardRow }) {
  const colors: Record<string, string> = {
    common: "from-slate-500 to-slate-700",
    rare: "from-sky-400 to-blue-700",
    epic: "from-fuchsia-500 to-purple-800",
    legendary: "from-amber-400 to-rose-600",
  };
  return (
    <div className={`aspect-[5/7] rounded-md bg-gradient-to-br ${colors[card.rarity]} p-1 text-[8px] sm:text-[10px] text-white flex flex-col`}>
      <div className="flex-1 rounded-sm flex items-center justify-center text-2xl" style={{ background: `radial-gradient(circle, ${card.art_color}, #000)` }}>
        {card.element === "fire" ? "🔥" : card.element === "water" ? "💧" : card.element === "earth" ? "🌿" : card.element === "air" ? "🌪️" : "✨"}
      </div>
      <div className="text-center font-bold truncate mt-0.5">{card.name}</div>
    </div>
  );
}
