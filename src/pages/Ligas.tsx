import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LIGAS = [
  { id: "recruta", label: "Recruta", color: "hsl(var(--muted-foreground))" },
  { id: "bronze", label: "Bronze", color: "#cd7f32" },
  { id: "prata", label: "Prata", color: "#c0c0c0" },
  { id: "ouro", label: "Ouro", color: "hsl(var(--accent))" },
  { id: "osorio", label: "Osório", color: "hsl(var(--primary))" },
  { id: "vilagran_cabrita", label: "Vilagran Cabrita", color: "hsl(var(--primary-glow))" },
  { id: "mallet", label: "Mallet", color: "hsl(var(--gem))" },
  { id: "bitencourt", label: "Bitencourt", color: "hsl(var(--success))" },
  { id: "max_wolf_filho", label: "Max-Wolf Filho", color: "hsl(var(--warning))" },
  { id: "caxias", label: "Caxias", color: "hsl(var(--destructive))" },
];

type Member = {
  user_id: string;
  xp_week: number;
  position: number | null;
  display_name?: string;
  avatar_id?: string | null;
};

export default function Ligas() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const weekStart = new Date();
      weekStart.setUTCHours(0, 0, 0, 0);
      weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay() + 1);
      const wk = weekStart.toISOString().slice(0, 10);

      let { data: leagues } = await supabase
        .from("leagues_weekly")
        .select("id")
        .eq("week_start", wk)
        .eq("liga", profile.liga_atual as any)
        .limit(1);

      let leagueId = leagues?.[0]?.id as string | undefined;
      if (!leagueId) {
        const { data: created } = await supabase
          .from("leagues_weekly")
          .insert({ week_start: wk, liga: profile.liga_atual as any, group_index: 0 })
          .select("id")
          .single();
        leagueId = created?.id;
      }
      if (!leagueId) { setLoadingMembers(false); return; }

      const { data: existing } = await supabase
        .from("league_members")
        .select("id")
        .eq("league_id", leagueId)
        .eq("user_id", profile.user_id)
        .maybeSingle();
      if (!existing) {
        await supabase.from("league_members").insert({
          league_id: leagueId, user_id: profile.user_id, xp_week: 0,
        });
      }

      const { data: rows } = await supabase
        .from("league_members")
        .select("user_id, xp_week, position")
        .eq("league_id", leagueId)
        .order("xp_week", { ascending: false })
        .limit(30);

      const ids = (rows ?? []).map((r) => r.user_id);
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_id")
        .in("user_id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.user_id, p]));

      setMembers(
        (rows ?? []).map((r: any) => ({
          ...r,
          display_name: map.get(r.user_id)?.display_name ?? "Recruta",
          avatar_id: map.get(r.user_id)?.avatar_id,
        }))
      );
      setLoadingMembers(false);
    })();
  }, [profile]);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const liga = LIGAS.find((l) => l.id === profile.liga_atual) ?? LIGAS[0];
  const myPos = members.findIndex((m) => m.user_id === profile.user_id) + 1;
  const total = members.length;

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <div className="flex-1">
            <h1 className="font-display text-2xl flex items-center gap-2">
              <Trophy className="text-accent" /> Liga {liga.label}
            </h1>
            <p className="text-xs opacity-85">Ranking semanal • Top 5 promove • Bottom 5 cai</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Sua posição</div>
            <div className="font-display text-2xl">{myPos || "-"}º</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">XP semanal</div>
            <div className="font-display text-2xl">{members.find((m) => m.user_id === profile.user_id)?.xp_week ?? 0}</div>
          </Card>
          <Card className="p-3">
            <div className="text-xs text-muted-foreground">Recrutas</div>
            <div className="font-display text-2xl">{total}</div>
          </Card>
        </div>

        {loadingMembers ? (
          <div className="text-center text-muted-foreground py-8">Carregando ranking…</div>
        ) : (
          <div className="space-y-2">
            {members.map((m, idx) => {
              const isMe = m.user_id === profile.user_id;
              const zone =
                idx < 5 ? "promote" : idx >= total - 5 && total > 10 ? "demote" : "stay";
              return (
                <motion.div
                  key={m.user_id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <Card
                    className={cn(
                      "p-3 flex items-center gap-3",
                      isMe && "border-accent shadow-gold",
                      zone === "promote" && "border-l-4 border-l-success",
                      zone === "demote" && "border-l-4 border-l-destructive"
                    )}
                  >
                    <div className="w-8 text-center font-display text-lg text-muted-foreground">{idx + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-sm">{m.display_name}</div>
                      <div className="text-xs text-muted-foreground">{m.xp_week} XP</div>
                    </div>
                    {zone === "promote" ? (
                      <TrendingUp className="text-success" size={18} />
                    ) : zone === "demote" ? (
                      <TrendingDown className="text-destructive" size={18} />
                    ) : (
                      <Minus className="text-muted-foreground" size={18} />
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}