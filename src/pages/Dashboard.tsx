import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAvatarSrc } from "@/data/avatars";
import { RANK_INFO, nextRank } from "@/data/ranks";
import { SPECIALTIES } from "@/data/specialties";
import { HUD } from "@/components/game/HUD";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tv, Trophy, ShieldCheck, Settings, LogOut, Play, Users } from "lucide-react";
import { useState } from "react";
import { AdRewardDialog } from "@/components/game/AdRewardDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SERIES_PER_PROMOTION = 3;

export default function Dashboard() {
  const { profile, loading, isAdmin, signOut, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [adOpen, setAdOpen] = useState(false);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;
  if (!profile.onboarded) return <Navigate to="/setup" replace />;

  const spec = SPECIALTIES.find((s) => s.id === profile.specialty);
  const next = nextRank(profile.rank);
  const energyPct = Math.round((profile.energy / profile.energy_max) * 100);

  const startMission = () => {
    if (profile.energy <= 0) { toast.warning("Sem energia! Assista um anúncio."); return; }
    nav("/missao");
  };

  const refillEnergy = async () => {
    const newEnergy = Math.min(profile.energy_max, profile.energy + 3);
    await supabase.from("profiles").update({ energy: newEnergy, gems: profile.gems + 1 }).eq("user_id", profile.user_id);
    await refreshProfile();
    toast.success("+3 energia, +1 gema!");
  };

  return (
    <div className="min-h-dvh bg-background pb-24">
      <header className="bg-gradient-hero text-primary-foreground px-4 pt-6 pb-8 rounded-b-3xl shadow-card">
        <div className="max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={getAvatarSrc(profile.avatar_id)} alt="" width={64} height={64} className="w-16 h-16 rounded-full bg-card/20 border-2 border-accent" />
              <div>
                <div className="font-display text-xl">{profile.display_name}</div>
                <div className="text-sm opacity-85">
                  {RANK_INFO[profile.rank].label} • {spec?.label}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {isAdmin && (
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/admin")} aria-label="Admin">
                  <Settings size={20} />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={signOut} aria-label="Sair">
                <LogOut size={20} />
              </Button>
            </div>
          </div>
          <HUD />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 -mt-4 space-y-4">
        <Card className="p-5 bg-gradient-card shadow-card border-accent/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Próxima missão</div>
              <div className="font-display text-2xl text-primary">
                Promoção a {next ? RANK_INFO[next].label : "Oficial"}
              </div>
            </div>
            <span className="text-3xl">{spec?.icon}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Português e Geografia do Brasil • {SERIES_PER_PROMOTION} séries
          </p>
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Energia</span>
              <span className="font-semibold">{profile.energy}/{profile.energy_max}</span>
            </div>
            <Progress value={energyPct} className="h-2" />
          </div>
          <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display text-lg shadow-gold" onClick={startMission}>
            <Play className="mr-2" size={20} /> Iniciar série
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 cursor-pointer hover:shadow-card transition-shadow" onClick={() => setAdOpen(true)}>
            <Tv className="mb-2 text-xp" />
            <div className="font-display text-base">Recarregar</div>
            <div className="text-xs text-muted-foreground">Anúncio → +3 energia</div>
          </Card>
          <Link to="/fvm">
            <Card className="p-4 cursor-pointer hover:shadow-card transition-shadow">
              <Trophy className="mb-2 text-accent" />
              <div className="font-display text-base">Minha FVM</div>
              <div className="text-xs text-muted-foreground">Ver pontuação e medalhas</div>
            </Card>
          </Link>
        </div>

        <Link to="/social" className="block">
          <Card className="p-4 cursor-pointer hover:shadow-card transition-shadow flex items-center gap-3">
            <Users className="text-primary" />
            <div className="flex-1">
              <div className="font-display text-base">Praça da Tropa</div>
              <div className="text-xs text-muted-foreground">Ranking semanal e enquete diária</div>
            </div>
          </Card>
        </Link>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-success" />
            <div className="flex-1">
              <div className="font-display text-base">Trilha do CHQAO</div>
              <div className="text-xs text-muted-foreground">
                Soldado → Cabo → 3º Sgt → 2º Sgt → 1º Sgt → S Ten → 2º Ten QAO
              </div>
            </div>
          </div>
        </Card>
      </main>

      <AdRewardDialog
        open={adOpen}
        onOpenChange={setAdOpen}
        onReward={refillEnergy}
        rewardLabel="+3 energia e +1 gema"
      />
    </div>
  );
}