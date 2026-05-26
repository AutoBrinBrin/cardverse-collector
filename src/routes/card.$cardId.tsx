import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CardViewer3D } from "@/components/CardViewer3D";
import { HolographicCard } from "@/components/HolographicCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/card/$cardId")({ component: CardDetail });

type CardRow = { id: string; name: string; rarity: string; element: string; power: number; description: string | null; art_color: string };

function CardDetail() {
  const { cardId } = Route.useParams();
  const [card, setCard] = useState<CardRow | null>(null);

  useEffect(() => {
    supabase.from("cards").select("*").eq("id", cardId).maybeSingle().then(({ data }) => setCard(data as CardRow));
  }, [cardId]);

  if (!card) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/album" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-4" /> Voltar ao álbum</Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <CardViewer3D card={card} />
        <div className="space-y-6">
          <div className="max-w-xs mx-auto">
            <HolographicCard card={card} />
          </div>
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{card.name}</h1>
                <Badge variant="outline" className="uppercase">{card.rarity}</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Elemento: <span className="text-foreground font-semibold uppercase">{card.element}</span></span>
                <span className="text-muted-foreground">Poder: <span className="text-amber-300 font-semibold">⚡ {card.power}</span></span>
              </div>
              {card.description && <p className="text-muted-foreground italic">"{card.description}"</p>}
              <p className="text-xs text-muted-foreground pt-2 border-t border-white/10">Arraste no visualizador 3D para girar a carta e ver o efeito plástico holográfico.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
