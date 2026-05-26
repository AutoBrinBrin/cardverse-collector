import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Package, BookOpen, Box } from "lucide-react";
import { useAuth } from "@/lib/auth";
import mystic from "@/assets/booster-mystic.png";
import inferno from "@/assets/booster-inferno.png";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user } = useAuth();
  return (
    <div className="relative overflow-hidden">
      {/* hero */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.25),_transparent_50%)]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-violet-300 mb-5">
              <Sparkles className="size-3.5" /> Coleção viva. Cartas vivas.
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight bg-gradient-to-br from-white via-violet-200 to-fuchsia-300 bg-clip-text text-transparent">
              Abra pacotes,<br /> revele cartas lendárias.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              Compre boosters, gire-os em 3D, abra cinco cartas por pacote e folheie seu álbum colecionável com efeito plástico holográfico.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/shop">Ir à loja</Link></Button>
              {user ? (
                <Button asChild size="lg" variant="outline"><Link to="/album">Meu álbum</Link></Button>
              ) : (
                <Button asChild size="lg" variant="outline"><Link to="/auth">Criar conta grátis</Link></Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Comece com 1.000 moedas. Pacote a partir de 100.</p>
          </div>
          <div className="relative h-[420px]">
            <img src={mystic} alt="Pacote místico" className="absolute left-1/4 top-0 h-full drop-shadow-[0_25px_60px_rgba(168,85,247,0.5)] -rotate-12 hover:rotate-0 transition-transform duration-500" />
            <img src={inferno} alt="Pacote inferno" className="absolute right-0 top-10 h-[90%] drop-shadow-[0_25px_60px_rgba(239,68,68,0.5)] rotate-12 hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-7xl px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Feature icon={<Box className="size-5" />} title="Loja 3D" desc="Clique em qualquer pacote ou caixa para visualizá-lo em 3D antes de comprar." />
        <Feature icon={<Package className="size-5" />} title="Inventário" desc="Tudo que você compra vai para o inventário. Abra quando quiser." />
        <Feature icon={<BookOpen className="size-5" />} title="Álbum folheável" desc="Suas cartas em um álbum 3D real, página por página, com brilho plástico." />
      </section>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition">
      <div className="flex items-center gap-2 text-violet-300 mb-2">{icon}<span className="font-semibold">{title}</span></div>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
