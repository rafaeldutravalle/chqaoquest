import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Utensils, Tv, Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { AdRewardDialog } from "@/components/game/AdRewardDialog";

export default function Rancho() {
  const { profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [adOpen, setAdOpen] = useState(false);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const restore = async (amount: number, label: string, costGems = 0) => {
    if (costGems && profile.municao < costGems) { toast.warning("Munição insuficiente"); return; }
    const newPront = Math.min(profile.prontidao_max, profile.prontidao + amount);
    const updates: any = { prontidao: newPront, prontidao_updated_at: new Date().toISOString() };
    if (costGems) updates.municao = profile.municao - costGems;
    await supabase.from("profiles").update(updates).eq("user_id", profile.user_id);
    await refreshProfile();
    toast.success(`${label} concluído! +${amount}% de Prontidão`);
  };

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="font-display text-2xl flex items-center gap-2"><Utensils /> Rancho</h1>
            <p className="text-xs opacity-85">Recupere sua Prontidão Operacional</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-3">
        <Card className="p-5 bg-gradient-card text-center">
          <p className="text-sm text-muted-foreground">Prontidão atual</p>
          <p className="font-display text-5xl text-primary">{profile.prontidao}<span className="text-xl text-muted-foreground">/{profile.prontidao_max}</span></p>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-card" onClick={() => setAdOpen(true)}>
          <div className="flex items-center gap-3">
            <Tv className="text-xp" />
            <div className="flex-1">
              <div className="font-display">Refeição no Rancho</div>
              <div className="text-xs text-muted-foreground">Assista um anúncio • +50%</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-card" onClick={() => restore(60, "Treinamento Leve")}>
          <div className="flex items-center gap-3">
            <Dumbbell className="text-success" />
            <div className="flex-1">
              <div className="font-display">Treinamento Leve</div>
              <div className="text-xs text-muted-foreground">Revisão rápida • +60%</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-card border-accent/30" onClick={() => restore(100, "Rancho Completo", 60)}>
          <div className="flex items-center gap-3">
            <Utensils className="text-accent" />
            <div className="flex-1">
              <div className="font-display">Rancho Completo</div>
              <div className="text-xs text-muted-foreground">60 munição • restaura 100%</div>
            </div>
          </div>
        </Card>

        <p className="text-xs text-center text-muted-foreground pt-4">
          Descanso automático recupera 25% a cada 4h. Assinantes <strong>SuperSub</strong> têm Prontidão Permanente.
        </p>
      </main>

      <AdRewardDialog open={adOpen} onOpenChange={setAdOpen} onReward={() => restore(50, "Refeição")} rewardLabel="+50% Prontidão" />
    </div>
  );
}