import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Caramelo } from "@/components/game/Caramelo";

type Region = {
  code: string;
  name: string;
  short_name: string;
  description: string | null;
  primary_subject: string;
  display_order: number;
  icon: string | null;
};

const SUBJECT_LABEL: Record<string, string> = {
  portugues: "Português", geografia: "Geografia", historia: "História",
  estatuto: "Estatuto", risg: "RISG", rae: "RAE", rde: "RDE",
  licitacoes: "Licitações", cpm: "CPM", cppm: "CPPM",
  doutrina: "Doutrina", sindicancia: "Sindicância", ingles: "Inglês",
  musica: "Música",
};

export default function Mapa() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  const [regions, setRegions] = useState<Region[]>([]);
  const [progress, setProgress] = useState<Record<string, { stars: number; missions: number }>>({});

  useEffect(() => {
    (async () => {
      const { data: r } = await supabase.from("regions").select("*").order("display_order");
      setRegions((r ?? []) as Region[]);
      if (profile?.user_id) {
        const { data: m } = await supabase
          .from("missions")
          .select("id, region_code, mission_progress(stars)")
          .eq("active", true);
        const map: Record<string, { stars: number; missions: number }> = {};
        (m ?? []).forEach((row: any) => {
          const code = row.region_code;
          if (!map[code]) map[code] = { stars: 0, missions: 0 };
          map[code].missions += 1;
          const mp = row.mission_progress?.[0];
          if (mp) map[code].stars += mp.stars;
        });
        setProgress(map);
      }
    })();
  }, [profile?.user_id]);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const unlocked = new Set(profile.region_unlocked ?? ["cma", "cmp"]);

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="font-display text-2xl">Mapa de Operações</h1>
            <p className="text-xs opacity-85">Conquiste cada Comando Militar do Brasil</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        <Caramelo category="mapa" />

        <div className="space-y-3">
          {regions.map((r, idx) => {
            const isUnlocked = unlocked.has(r.code);
            const prog = progress[r.code] ?? { stars: 0, missions: 0 };
            return (
              <motion.div
                key={r.code}
                initial={{ opacity: 0, x: idx % 2 ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card
                  className={cn(
                    "p-4 flex items-center gap-3 transition-all",
                    isUnlocked ? "cursor-pointer hover:shadow-card border-accent/30" : "opacity-60"
                  )}
                  onClick={() => isUnlocked && nav("/missao")}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl grid place-items-center text-xl font-display flex-shrink-0",
                      isUnlocked ? "bg-gradient-hero text-primary-foreground shadow-card" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isUnlocked ? <MapPin size={22} /> : <Lock size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base truncate">{r.short_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                        {SUBJECT_LABEL[r.primary_subject] ?? r.primary_subject}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">{r.name}</div>
                    {isUnlocked && prog.missions > 0 && (
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <Star size={12} className="text-accent fill-accent" />
                        <span className="font-semibold">{prog.stars}</span>
                        <span className="text-muted-foreground">/ {prog.missions * 3}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}