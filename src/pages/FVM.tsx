import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RANK_INFO } from "@/data/ranks";
import { SPECIALTIES } from "@/data/specialties";
import { getAvatarSrc } from "@/data/avatars";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Medal, ArrowLeft } from "lucide-react";

export default function FVM() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  const [medals, setMedals] = useState<{ name: string; awarded_at: string }[]>([]);
  const [attempts, setAttempts] = useState<number>(0);

  useEffect(() => {
    if (!profile) return;
    supabase.from("medals").select("name, awarded_at").eq("user_id", profile.user_id).then(({ data }) => setMedals(data ?? []));
    supabase.from("mission_attempts").select("id", { count: "exact", head: true }).eq("user_id", profile.user_id)
      .then(({ count }) => setAttempts(count ?? 0));
  }, [profile]);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;
  const spec = SPECIALTIES.find((s) => s.id === profile.specialty);

  return (
    <div className="min-h-dvh bg-background pb-10">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav(-1)}>
            <ArrowLeft />
          </Button>
          <h1 className="font-display text-2xl">Ficha de Valorização do Mérito</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        <Card className="p-5 bg-gradient-card flex gap-4 items-center">
          <img src={getAvatarSrc(profile.avatar_id)} alt="" width={80} height={80} className="w-20 h-20 rounded-full border-2 border-accent" />
          <div>
            <div className="font-display text-xl">{profile.display_name}</div>
            <div className="text-sm text-muted-foreground">{RANK_INFO[profile.rank].label} • {spec?.label}</div>
            <div className="font-display text-3xl text-accent mt-1">{profile.fvm_score.toFixed(2)} pts</div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">XP</div><div className="font-display text-2xl text-xp">{profile.xp}</div></Card>
          <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">Gemas</div><div className="font-display text-2xl text-gem">{profile.gems}</div></Card>
          <Card className="p-3 text-center"><div className="text-xs text-muted-foreground">Séries</div><div className="font-display text-2xl text-primary">{attempts}</div></Card>
        </div>

        <Card className="p-4">
          <h2 className="font-display text-lg mb-3 flex items-center gap-2"><Medal className="text-accent" /> Medalhas</h2>
          {medals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma medalha ainda. Conclua promoções com média alta para conquistar.</p>
          ) : (
            <ul className="space-y-2">
              {medals.map((m, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span>🎖️ {m.name}</span>
                  <span className="text-muted-foreground text-xs">{new Date(m.awarded_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}