import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { boosterImage } from "@/lib/booster-images";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Package2, Box } from "lucide-react";

export const Route = createFileRoute("/shop")({ component: Shop });

type Booster = { id: string; name: string; kind: "pack" | "box"; price: number; pack_count: number; theme: string; image_key: string };

function Shop() {
  const location = useLocation();
  const [boosters, setBoosters] = useState<Booster[]>([]);
  useEffect(() => {
    supabase.from("boosters").select("*").order("price").then(({ data }) => setBoosters((data ?? []) as Booster[]));
  }, []);

  if (location.pathname !== "/shop") {
    return <Outlet />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Loja Arcana</h1>
        <p className="text-muted-foreground mt-2">Compre pacotes (5 cartas) ou caixas (10 pacotes) e expanda sua coleção.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {boosters.map((b) => (
          <Link key={b.id} to="/shop/$boosterId" params={{ boosterId: b.id }}>
            <Card className="group bg-black/40 border-white/10 hover:border-violet-500/50 hover:scale-[1.02] transition-all overflow-hidden cursor-pointer">
              <div className="aspect-[3/4] bg-gradient-to-b from-violet-950/30 to-black flex items-center justify-center p-6">
                <img src={boosterImage(b.image_key)} alt={b.name} className="max-h-full drop-shadow-[0_15px_30px_rgba(168,85,247,0.4)] group-hover:scale-105 transition-transform" loading="lazy" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-lg">{b.name}</h3>
                    <Badge variant="outline" className="mt-1 gap-1">
                      {b.kind === "box" ? <Box className="size-3" /> : <Package2 className="size-3" />}
                      {b.kind === "box" ? `${b.pack_count} pacotes` : "5 cartas"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-amber-300 font-bold">
                    <Coins className="size-4" /> {b.price}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
