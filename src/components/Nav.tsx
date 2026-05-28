import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Coins, Sparkles, Package, BookOpen, ShoppingBag, LogOut, LogIn, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

export function Nav() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <Link to="/shop" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <ShoppingBag className="size-4" /> Loja
      </Link>
      <Link to="/inventory" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <Package className="size-4" /> Inventário
      </Link>
      <Link to="/album" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
        <BookOpen className="size-4" /> Álbum
      </Link>
      {isAdmin && (
        <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-100 transition-colors">
          <Shield className="size-4" /> Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <Sparkles className="size-5 text-primary" />
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Arcana TCG</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">{links}</nav>

        <div className="flex items-center gap-3">
          {user && profile && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300 border border-amber-500/30">
              <Coins className="size-4" /> {profile.coins}
            </div>
          )}
          {user ? (
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
              <LogOut className="size-4" />
            </Button>
          ) : (
            <Button asChild size="sm" variant="default">
              <Link to="/auth"><LogIn className="size-4 mr-1" /> Entrar</Link>
            </Button>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu /></Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>Menu</SheetTitle>
              <div className="mt-8 flex flex-col gap-5">
                {links}
                {profile && (
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Coins className="size-4" /> {profile.coins} moedas
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
