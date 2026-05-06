import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Dilema = {
  id: string; title: string; context: string; question: string;
  option_a: string; option_b: string; option_c: string | null; option_d: string | null;
  best_answer: "A" | "B" | "C" | "D"; explanation: string | null;
};

export default function Dilemas() {
  const { profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [list, setList] = useState<Dilema[]>([]);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from("dilemmas").select("*").eq("active", true).then(({ data }) => setList((data ?? []) as Dilema[]));
  }, []);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const submit = async (d: Dilema) => {
    if (!picked[d.id]) return;
    setRevealed({ ...revealed, [d.id]: true });
    if (picked[d.id] === d.best_answer) {
      const newFvm = +(profile.pontos_merito + 0.5).toFixed(2);
      await supabase.from("profiles").update({ pontos_merito: newFvm, xp: profile.xp + 40 } as any).eq("user_id", profile.user_id);
      await refreshProfile();
      toast.success("+0.5 FVM, +40 XP — decisão acertada");
    } else {
      toast.warning("Decisão equivocada — leia o fundamento");
    }
  };

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <div>
            <h1 className="font-display text-2xl flex items-center gap-2"><Scale /> Dilemas do Comandante</h1>
            <p className="text-xs opacity-85">Decisão de comando sob pressão</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        {list.map((d) => {
          const opts = [["A", d.option_a], ["B", d.option_b], d.option_c && ["C", d.option_c], d.option_d && ["D", d.option_d]].filter(Boolean) as [string, string][];
          const rev = revealed[d.id];
          return (
            <Card key={d.id} className="p-4 space-y-3 border-accent/30">
              <h2 className="font-display text-lg text-primary">{d.title}</h2>
              <p className="text-sm text-muted-foreground italic">{d.context}</p>
              <div className="text-sm font-semibold">{d.question}</div>
              <div className="space-y-2">
                {opts.map(([letter, text]) => {
                  const isBest = letter === d.best_answer;
                  const isPicked = picked[d.id] === letter;
                  return (
                    <button
                      key={letter}
                      disabled={rev}
                      onClick={() => setPicked({ ...picked, [d.id]: letter })}
                      className={cn(
                        "w-full text-left rounded-lg border-2 p-3 text-sm bg-card transition-all",
                        !rev && isPicked && "border-primary",
                        !rev && !isPicked && "border-border hover:border-primary/40",
                        rev && isBest && "border-success bg-success/10",
                        rev && isPicked && !isBest && "border-destructive bg-destructive/10",
                      )}
                    >
                      <span className="font-display mr-2">{letter}.</span>{text}
                    </button>
                  );
                })}
              </div>
              {!rev ? (
                <Button className="w-full" disabled={!picked[d.id]} onClick={() => submit(d)}>Decidir</Button>
              ) : (
                d.explanation && <Card className="p-3 text-xs bg-secondary/50"><strong>Fundamento:</strong> {d.explanation}</Card>
              )}
            </Card>
          );
        })}
      </main>
    </div>
  );
}