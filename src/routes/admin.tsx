import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, Upload } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Booster = { id: string; name: string; model_url: string | null };
type CardRow = { id: string; name: string; rarity: string; model_url: string | null };

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const [boosters, setBoosters] = useState<Booster[]>([]);
  const [cards, setCards] = useState<CardRow[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const [{ data: b }, { data: c }] = await Promise.all([
      supabase.from("boosters").select("id,name,model_url").order("name"),
      supabase.from("cards").select("id,name,rarity,model_url").order("name"),
    ]);
    setBoosters((b ?? []) as Booster[]);
    setCards((c ?? []) as CardRow[]);
  };

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  if (!user) return (
    <div className="p-8 text-center">
      <p className="text-muted-foreground">Você precisa entrar para acessar o painel.</p>
      <Button asChild className="mt-4"><Link to="/auth">Entrar</Link></Button>
    </div>
  );
  if (!isAdmin) return (
    <div className="p-8 text-center">
      <Shield className="mx-auto size-12 text-destructive mb-3" />
      <h1 className="text-2xl font-bold">Acesso negado</h1>
      <p className="text-muted-foreground mt-2">Apenas administradores podem acessar esta área.</p>
    </div>
  );

  async function uploadAndAssign(table: "boosters" | "cards", id: string, file: File) {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "glb";
      const path = `${table}/${id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("models").upload(path, file, { upsert: true, contentType: "model/gltf-binary" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("models").getPublicUrl(path);
      const { error: updErr } = await supabase.from(table).update({ model_url: pub.publicUrl }).eq("id", id);
      if (updErr) throw updErr;
      toast.success("Modelo enviado e atribuído!");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="size-6 text-violet-300" />
        <h1 className="text-3xl font-bold">Painel Admin</h1>
      </div>
      <Tabs defaultValue="boosters">
        <TabsList>
          <TabsTrigger value="boosters">Boosters & Caixas</TabsTrigger>
          <TabsTrigger value="cards">Cartas</TabsTrigger>
        </TabsList>
        <TabsContent value="boosters" className="mt-4">
          <ModelUploader title="Atribuir modelo .glb a um booster/caixa" items={boosters} onUpload={(id, file) => uploadAndAssign("boosters", id, file)} busy={busy} />
        </TabsContent>
        <TabsContent value="cards" className="mt-4">
          <ModelUploader title="Atribuir modelo .glb a uma carta" items={cards.map(c => ({ id: c.id, name: `${c.name} (${c.rarity})`, model_url: c.model_url }))} onUpload={(id, file) => uploadAndAssign("cards", id, file)} busy={busy} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ModelUploader({ title, items, onUpload, busy }: { title: string; items: { id: string; name: string; model_url: string | null }[]; onUpload: (id: string, file: File) => void; busy: boolean }) {
  const [selected, setSelected] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <Card className="bg-black/40 border-white/10">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Item</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              {items.map(i => (
                <SelectItem key={i.id} value={i.id}>{i.name} {i.model_url ? "✓" : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Arquivo .glb</Label>
          <Input type="file" accept=".glb,model/gltf-binary" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <Button disabled={!selected || !file || busy} onClick={() => file && onUpload(selected, file)}>
          <Upload className="size-4 mr-2" /> {busy ? "Enviando..." : "Enviar modelo"}
        </Button>
        <div className="pt-4 border-t border-white/10">
          <h3 className="text-sm font-semibold mb-2">Status</h3>
          <ul className="text-xs space-y-1 max-h-60 overflow-auto">
            {items.map(i => (
              <li key={i.id} className="flex justify-between">
                <span>{i.name}</span>
                <span className={i.model_url ? "text-emerald-400" : "text-muted-foreground"}>{i.model_url ? "modelo OK" : "sem modelo"}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
