import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, MessageCircle, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAvatarSrc } from "@/data/avatars";
import { RANK_INFO, type Rank } from "@/data/ranks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type RankingRow = {
  user_id: string;
  display_name: string | null;
  avatar_id: string | null;
  rank: Rank;
  week_fvm: number;
  missions_done: number;
};
type Poll = {
  id: string;
  question: string;
  option_a: string; option_b: string;
  option_c: string | null; option_d: string | null;
};

export default function Social() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [myVote, setMyVote] = useState<"A"|"B"|"C"|"D"|null>(null);
  const [results, setResults] = useState<Record<string, number>>({});

  const loadAll = async () => {
    const { data: rk } = await supabase
      .from("weekly_ranking" as any)
      .select("*")
      .limit(20);
    setRanking((rk as any) ?? []);

    const today = new Date().toISOString().slice(0, 10);
    const { data: p } = await supabase
      .from("polls")
      .select("id, question, option_a, option_b, option_c, option_d")
      .lte("active_date", today)
      .order("active_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    setPoll((p as Poll) ?? null);

    if (p && profile) {
      const { data: v } = await supabase
        .from("poll_votes")
        .select("choice")
        .eq("poll_id", p.id)
        .eq("user_id", profile.user_id)
        .maybeSingle();
      const choice = (v?.choice as "A"|"B"|"C"|"D" | undefined) ?? null;
      setMyVote(choice);
      if (choice) loadResults(p.id);
    }
  };

  const loadResults = async (pollId: string) => {
    const { data } = await supabase.rpc("poll_results", { _poll_id: pollId });
    const map: Record<string, number> = {};
    (data ?? []).forEach((r: any) => { map[r.choice] = Number(r.votes); });
    setResults(map);
  };

  useEffect(() => { if (profile) loadAll(); /* eslint-disable-next-line */ }, [profile]);

  const vote = async (choice: "A"|"B"|"C"|"D") => {
    if (!poll || !profile) return;
    const { error } = await supabase.from("poll_votes").insert({
      poll_id: poll.id, user_id: profile.user_id, choice,
    });
    if (error) { toast.error("Não foi possível registrar o voto"); return; }
    setMyVote(choice);
    toast.success("Voto registrado!");
    loadResults(poll.id);
  };

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0) || 1;
  const opts = poll
    ? ([
        ["A", poll.option_a],
        ["B", poll.option_b],
        ["C", poll.option_c],
        ["D", poll.option_d],
      ].filter(([, t]) => !!t) as ["A"|"B"|"C"|"D", string][])
    : [];

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <h1 className="font-display text-2xl">Praça da Tropa</h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-5">
        <Card className="p-4">
          <h2 className="font-display text-lg mb-3 flex items-center gap-2">
            <Trophy className="text-accent" /> Ranking semanal (FVM)
          </h2>
          {ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados desta semana ainda.</p>
          ) : (
            <ol className="space-y-2">
              {ranking.map((r, i) => {
                const isMe = r.user_id === profile.user_id;
                return (
                  <li
                    key={r.user_id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg",
                      isMe && "bg-accent/15 border border-accent/40",
                    )}
                  >
                    <span className="font-display text-lg w-7 text-center text-muted-foreground">
                      {i === 0 ? <Crown size={18} className="mx-auto text-accent" /> : i + 1}
                    </span>
                    <img
                      src={getAvatarSrc(r.avatar_id)}
                      alt=""
                      width={36} height={36}
                      className="w-9 h-9 rounded-full bg-secondary"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{r.display_name ?? "Recruta"}</div>
                      <div className="text-xs text-muted-foreground">
                        {RANK_INFO[r.rank]?.label} • {r.missions_done} séries
                      </div>
                    </div>
                    <div className="font-display text-base text-primary">
                      {Number(r.week_fvm).toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-display text-lg mb-3 flex items-center gap-2">
            <MessageCircle className="text-primary" /> Enquete do dia
          </h2>
          {!poll ? (
            <p className="text-sm text-muted-foreground">Sem enquete ativa hoje. Volte amanhã!</p>
          ) : (
            <>
              <p className="font-medium mb-3">{poll.question}</p>
              <div className="space-y-2">
                {opts.map(([letter, text]) => {
                  const votes = results[letter] ?? 0;
                  const pct = myVote ? Math.round((votes / totalVotes) * 100) : 0;
                  const mine = myVote === letter;
                  return (
                    <button
                      key={letter}
                      disabled={!!myVote}
                      onClick={() => vote(letter)}
                      className={cn(
                        "w-full text-left rounded-lg border-2 p-2.5 bg-card transition-all relative overflow-hidden",
                        !myVote && "border-border hover:border-primary/40",
                        mine && "border-accent",
                        myVote && !mine && "border-border opacity-80",
                      )}
                    >
                      {myVote && (
                        <div
                          className="absolute inset-y-0 left-0 bg-primary/15"
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                      )}
                      <div className="relative flex items-center justify-between gap-2 text-sm">
                        <span><strong className="font-display mr-2">{letter}</strong>{text}</span>
                        {myVote && <span className="font-display text-xs text-muted-foreground">{pct}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {myVote && (
                <p className="text-xs text-muted-foreground mt-3">
                  Seu voto: <strong>{myVote}</strong> • Total: {totalVotes} {totalVotes === 1 ? "voto" : "votos"}
                </p>
              )}
            </>
          )}
        </Card>
      </main>
    </div>
  );
}
