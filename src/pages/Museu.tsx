import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Library, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Card_ = { id: string; code: string; name: string; description: string | null; era: string | null; rarity: string };
const RARITY: Record<string, string> = {
  comum: "border-muted",
  raro: "border-primary",
  epico: "border-accent",
  lendario: "border-warning shadow-gold",
};

export default function Museu() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  const [cards, setCards] = useState<Card_[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("museum_cards").select("*").then(({ data }) => setCards((data ?? []) as Card_[]));
    if (profile?.user_id) {
      supabase.from("user_museum_cards").select("card_id").eq("user_id", profile.user_id)
        .then(({ data }) => setOwned(new Set((data ?? []).map((d: any) => d.card_id))));
    }
  }, [profile?.user_id]);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="font-display text-2xl flex items-center gap-2"><Library /> Museu Militar</h1>
            <p className="text-xs opacity-85">{owned.size}/{cards.length} colecionáveis conquistados</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const has = owned.has(c.id);
          return (
            <Card key={c.id} className={cn("p-3 border-2 transition-all", RARITY[c.rarity], !has && "opacity-50")}>
              <div className="aspect-square rounded-lg bg-gradient-card grid place-items-center mb-2 text-3xl">
                {has ? "🎖️" : <Lock className="text-muted-foreground" />}
              </div>
              <div className="font-display text-sm">{c.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{has ? c.description : "Carta bloqueada"}</div>
              {c.era && <div className="text-xs mt-1 text-accent">{c.era}</div>}
            </Card>
          );
        })}
      </main>
    </div>
  );
}