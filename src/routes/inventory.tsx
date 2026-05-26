import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { boosterImage } from "@/lib/booster-images";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export const Route = createFileRoute("/inventory")({ component: Inventory });

type Item = { id: string; booster_id: string; opened: boolean; acquired_at: string };
type Booster = { id: string; name: string; kind: string; pack_count: number; image_key: string };

function Inventory() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [boosters, setBoosters] = useState<Record<string, Booster>>({});

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth" });
  }, [loading, user, nav]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: inv }, { data: bs }] = await Promise.all([
        supabase.from("inventory_items").select("*").eq("user_id", user.id).eq("opened", false).order("acquired_at", { ascending: false }),
        supabase.from("boosters").select("*"),
      ]);
      setItems((inv ?? []) as Item[]);
      setBoosters(Object.fromEntries(((bs ?? []) as Booster[]).map((b) => [b.id, b])));
    })();
  }, [user]);

  if (!user) return null;

  // group by booster type
  const grouped = items.reduce<Record<string, Item[]>>((acc, it) => {
    (acc[it.booster_id] ||= []).push(it);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3"><Package className="size-8 text-violet-400" /> Inventário</h1>
          <p className="text-muted-foreground mt-2">Seus pacotes não abertos. Clique para visualizar em 3D e abrir.</p>
        </div>
        <Button asChild variant="outline"><Link to="/shop">Ir à loja</Link></Button>
      </div>

      {items.length === 0 ? (
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-12 text-center text-muted-foreground">
            Seu inventário está vazio. Visite a <Link to="/shop" className="text-violet-400 hover:underline">loja</Link> para comprar pacotes.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(grouped).map(([bid, list]) => {
            const b = boosters[bid];
            if (!b) return null;
            return list.map((it) => (
              <Link key={it.id} to="/inventory/$itemId" params={{ itemId: it.id }}>
                <Card className="group bg-black/40 border-white/10 hover:border-violet-500/50 transition-all cursor-pointer overflow-hidden">
                  <div className="aspect-square bg-gradient-to-b from-violet-950/30 to-black flex items-center justify-center p-4">
                    <img src={boosterImage(b.image_key)} alt={b.name} className="max-h-full group-hover:scale-105 transition-transform drop-shadow-[0_10px_20px_rgba(168,85,247,0.4)]" loading="lazy" />
                  </div>
                  <CardContent className="p-3">
                    <div className="font-semibold truncate text-sm">{b.name}</div>
                    <Badge variant="outline" className="mt-1 text-xs">{b.kind === "box" ? `${b.pack_count} pacotes` : "5 cartas"}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ));
          })}
        </div>
      )}
    </div>
  );
}
