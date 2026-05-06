import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingBag, Gem } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Item = { id: string; code: string; name: string; description: string | null; category: string; rarity: string; price_municao: number };
const RARITY_COLOR: Record<string, string> = {
  comum: "bg-muted text-muted-foreground",
  raro: "bg-primary/20 text-primary",
  epico: "bg-accent/30 text-accent-foreground",
  lendario: "bg-gradient-to-r from-accent to-warning text-accent-foreground",
};

export default function Loja() {
  const { profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("store_items").select("*").eq("active", true).then(({ data }) => setItems((data ?? []) as Item[]));
  }, []);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const buy = async (it: Item) => {
    if (profile.municao < it.price_municao) { toast.warning("Munição insuficiente"); return; }
    setBusy(it.id);
    const { error: e1 } = await supabase.from("user_inventory").insert({ user_id: profile.user_id, item_id: it.id, qty: 1 });
    if (e1) { toast.error("Erro ao comprar"); setBusy(null); return; }
    await supabase.from("profiles").update({ municao: profile.municao - it.price_municao } as any).eq("user_id", profile.user_id);
    await refreshProfile();
    toast.success(`${it.name} adquirido!`);
    setBusy(null);
  };

  const cats = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl flex items-center gap-2"><ShoppingBag /> Loja do Quartel</h1>
            <p className="text-xs opacity-85">Uniformes, distintivos e suprimentos</p>
          </div>
          <div className="flex items-center gap-1 bg-card/15 px-3 py-1.5 rounded-full">
            <Gem size={16} className="text-gem" />
            <span className="font-display">{profile.municao}</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-6">
        {cats.map((cat) => (
          <section key={cat}>
            <h2 className="font-display text-lg text-primary capitalize mb-2">{cat}</h2>
            <div className="space-y-2">
              {items.filter((i) => i.category === cat).map((it) => (
                <Card key={it.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display">{it.name}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full uppercase", RARITY_COLOR[it.rarity])}>{it.rarity}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{it.description}</p>
                  </div>
                  <Button size="sm" disabled={busy === it.id} onClick={() => buy(it)}>
                    <Gem size={14} className="mr-1" /> {it.price_municao}
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}