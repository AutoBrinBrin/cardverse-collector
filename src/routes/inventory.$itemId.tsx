import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { boosterImage } from "@/lib/booster-images";
import { BoosterViewer3D } from "@/components/BoosterViewer3D";
import { PackOpener } from "@/components/PackOpener";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/inventory/$itemId")({ component: OpenPack });

type Booster = { id: string; name: string; kind: "pack" | "box"; pack_count: number; image_key: string };
type CardRow = { id: string; name: string; rarity: string; element: string; power: number; art_color: string };

function pickByRarity(cards: CardRow[]): CardRow {
  const r = Math.random();
  let rarity: string;
  if (r < 0.6) rarity = "common";
  else if (r < 0.88) rarity = "rare";
  else if (r < 0.98) rarity = "epic";
  else rarity = "legendary";
  const pool = cards.filter((c) => c.rarity === rarity);
  const finalPool = pool.length ? pool : cards;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function OpenPack() {
  const { itemId } = Route.useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [booster, setBooster] = useState<Booster | null>(null);
  const [opened, setOpened] = useState<CardRow[] | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: it } = await supabase.from("inventory_items").select("*").eq("id", itemId).maybeSingle();
      if (!it) return;
      const { data: b } = await supabase.from("boosters").select("*").eq("id", it.booster_id).maybeSingle();
      setBooster(b as Booster);
    })();
  }, [itemId, user]);

  async function openIt() {
    if (!user || !booster) return;
    setOpening(true);
    const { data: cards } = await supabase.from("cards").select("*");
    const all = (cards ?? []) as CardRow[];
    const totalCards = booster.kind === "box" ? booster.pack_count * 5 : 5;
    const drawn: CardRow[] = Array.from({ length: totalCards }, () => pickByRarity(all));

    // mark opened
    await supabase.from("inventory_items").update({ opened: true }).eq("id", itemId);
    // insert user_cards
    const rows = drawn.map((c) => ({ user_id: user.id, card_id: c.id }));
    const { error } = await supabase.from("user_cards").insert(rows);
    setOpening(false);
    if (error) return toast.error(error.message);
    setOpened(drawn);
  }

  if (!user) return null;
  if (!booster) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/inventory" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="size-4" /> Voltar ao inventário
      </Link>

      {!opened ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BoosterViewer3D image={boosterImage(booster.image_key)} isBox={booster.kind === "box"} />
          <Card className="bg-black/40 border-white/10">
            <CardContent className="p-6 space-y-4">
              <h1 className="text-3xl font-bold">{booster.name}</h1>
              <p className="text-muted-foreground">
                {booster.kind === "box"
                  ? `Você está prestes a abrir ${booster.pack_count} pacotes (${booster.pack_count * 5} cartas).`
                  : "Você está prestes a abrir um pacote com 5 cartas."}
              </p>
              <Button size="lg" className="w-full" disabled={opening} onClick={openIt}>
                <Sparkles className="size-4 mr-2" />
                {opening ? "Abrindo..." : "Abrir agora"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">Arraste para girar o pacote.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <PackOpener cards={opened} onDone={() => nav({ to: "/album" })} />
      )}
    </div>
  );
}
