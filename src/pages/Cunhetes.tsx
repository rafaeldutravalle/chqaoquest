import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Cunhete = { id: string; rarity: string; opened: boolean; source: string; contents: any };

export default function Cunhetes() {
  const { profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [list, setList] = useState<Cunhete[]>([]);
  const [opening, setOpening] = useState<string | null>(null);

  const load = async () => {
    if (!profile) return;
    const { data } = await supabase.from("user_cunhetes").select("*").eq("user_id", profile.user_id).order("created_at", { ascending: false });
    setList((data ?? []) as Cunhete[]);
  };
  useEffect(() => { load(); }, [profile?.user_id]);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const open = async (c: Cunhete) => {
    setOpening(c.id);
    const municao = c.rarity === "lendario" ? 200 : c.rarity === "epico" ? 100 : c.rarity === "raro" ? 50 : 25;
    const xp = c.rarity === "lendario" ? 100 : 50;
    const contents = { municao, xp };
    await supabase.from("user_cunhetes").update({ opened: true, contents }).eq("id", c.id);
    await supabase.from("profiles").update({
      municao: profile.municao + municao, xp: profile.xp + xp,
    } as any).eq("user_id", profile.user_id);
    await refreshProfile();
    await load();
    setOpening(null);
    toast.success(`+${municao} munição, +${xp} XP!`);
  };

  const claimDaily = async () => {
    await supabase.from("user_cunhetes").insert({ user_id: profile.user_id, rarity: "comum", source: "diario" });
    await load();
    toast.success("Cunhete diário recebido!");
  };

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <h1 className="font-display text-2xl flex items-center gap-2"><Package /> Cunhetes</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-3">
        <Button className="w-full" onClick={claimDaily}>+ Cunhete diário (teste)</Button>
        {list.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Nenhum cunhete. Conclua missões!</p>}
        {list.map((c) => (
          <motion.div key={c.id} whileHover={{ scale: c.opened ? 1 : 1.02 }}>
            <Card className="p-4 flex items-center gap-3">
              <div className="text-4xl">{c.opened ? "📭" : "📦"}</div>
              <div className="flex-1">
                <div className="font-display capitalize">Cunhete {c.rarity}</div>
                <div className="text-xs text-muted-foreground">Fonte: {c.source}</div>
                {c.opened && c.contents && <div className="text-xs text-accent mt-1">+{c.contents.municao} munição, +{c.contents.xp} XP</div>}
              </div>
              {!c.opened && <Button size="sm" disabled={opening === c.id} onClick={() => open(c)}>Abrir</Button>}
            </Card>
          </motion.div>
        ))}
      </main>
    </div>
  );
}