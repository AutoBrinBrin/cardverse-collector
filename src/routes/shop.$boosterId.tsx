import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { boosterImage } from "@/lib/booster-images";
import { BoosterViewer3D } from "@/components/BoosterViewer3D";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Coins, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/shop/$boosterId")({ component: BoosterDetail });

type Booster = { id: string; name: string; kind: "pack" | "box"; price: number; pack_count: number; theme: string; image_key: string };

function BoosterDetail() {
  const { boosterId } = Route.useParams();
  const nav = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [booster, setBooster] = useState<Booster | null>(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("boosters").select("*").eq("id", boosterId).maybeSingle().then(({ data }) => setBooster(data as Booster));
  }, [boosterId]);

  if (!booster) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;

  const total = booster.price * qty;
  const canBuy = !!user && !!profile && profile.coins >= total;

  async function purchase() {
    if (!user) { nav({ to: "/auth" }); return; }
    if (!profile || !booster) return;
    if (profile.coins < total) { toast.error("Moedas insuficientes"); return; }
    setBusy(true);
    const { error: cErr } = await supabase.from("profiles").update({ coins: profile.coins - total }).eq("id", user.id);
    if (cErr) { setBusy(false); return toast.error(cErr.message); }
    const rows = Array.from({ length: qty }, () => ({ user_id: user.id, booster_id: booster!.id }));
    const { error: iErr } = await supabase.from("inventory_items").insert(rows);
    setBusy(false);
    if (iErr) return toast.error(iErr.message);
    await refreshProfile();
    toast.success(`${qty}× ${booster.name} adicionado ao inventário!`);
    nav({ to: "/inventory" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-4" /> Voltar à loja</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <BoosterViewer3D image={boosterImage(booster.image_key)} isBox={booster.kind === "box"} />

        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-6 space-y-5">
            <div>
              <Badge variant="outline">{booster.kind === "box" ? "Booster Box" : "Booster Pack"}</Badge>
              <h1 className="text-3xl font-bold mt-2">{booster.name}</h1>
              <p className="text-muted-foreground mt-2">
                {booster.kind === "box"
                  ? `Caixa contendo ${booster.pack_count} pacotes — ${booster.pack_count * 5} cartas no total.`
                  : "Pacote contendo 5 cartas aleatórias com chance de raras, épicas e lendárias."}
              </p>
            </div>

            <div className="flex items-center gap-2 text-amber-300 text-2xl font-bold">
              <Coins className="size-6" /> {booster.price}
              <span className="text-sm text-muted-foreground font-normal">por unidade</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Quantidade</span>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="outline" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="size-4" /></Button>
                <span className="w-10 text-center font-bold tabular-nums">{qty}</span>
                <Button size="icon" variant="outline" onClick={() => setQty(qty + 1)}><Plus className="size-4" /></Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-amber-300 flex items-center gap-1"><Coins className="size-5" /> {total}</span>
            </div>

            {user && profile && (
              <div className="text-xs text-muted-foreground">
                Saldo atual: <span className="text-amber-300 font-semibold">{profile.coins}</span>
              </div>
            )}

            <Button size="lg" className="w-full" disabled={busy || (!!user && !canBuy)} onClick={purchase}>
              <ShoppingCart className="size-4 mr-2" />
              {!user ? "Entrar para comprar" : !canBuy ? "Moedas insuficientes" : busy ? "Comprando..." : `Comprar ${qty}× ${booster.kind === "box" ? "caixa" : "pacote"}`}
            </Button>
            <p className="text-xs text-muted-foreground text-center">Gire o booster arrastando para visualizá-lo de todos os ângulos.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
