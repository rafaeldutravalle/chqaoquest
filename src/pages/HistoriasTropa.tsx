import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Story = { id: string; title: string; body: string; question: string; option_a: string; option_b: string; correct_answer: "A" | "B" };

export default function HistoriasTropa() {
  const { profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [picked, setPicked] = useState<Record<string, "A" | "B" | null>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from("tropa_stories").select("*").eq("active", true).then(({ data }) => setStories((data ?? []) as Story[]));
  }, []);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const submit = async (s: Story) => {
    if (!picked[s.id]) return;
    setRevealed({ ...revealed, [s.id]: true });
    if (picked[s.id] === s.correct_answer) {
      await supabase.from("profiles").update({ xp: profile.xp + 30, municao: profile.municao + 10 } as any).eq("user_id", profile.user_id);
      await refreshProfile();
      toast.success("+30 XP, +10 munição");
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
            <h1 className="font-display text-2xl flex items-center gap-2"><BookOpen /> Histórias da Tropa</h1>
            <p className="text-xs opacity-85">Casos práticos do dia a dia do quartel</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-4">
        {stories.map((s) => (
          <Card key={s.id} className="p-4 space-y-3">
            <h2 className="font-display text-lg text-primary">{s.title}</h2>
            <p className="text-sm text-muted-foreground">{s.body}</p>
            <div className="text-sm font-semibold pt-2">{s.question}</div>
            {(["A", "B"] as const).map((letter) => {
              const text = letter === "A" ? s.option_a : s.option_b;
              const isCorrect = letter === s.correct_answer;
              const isPicked = picked[s.id] === letter;
              const rev = revealed[s.id];
              return (
                <button
                  key={letter}
                  disabled={rev}
                  onClick={() => setPicked({ ...picked, [s.id]: letter })}
                  className={cn(
                    "w-full text-left rounded-lg border-2 p-3 flex gap-2 text-sm bg-card transition-all",
                    !rev && isPicked && "border-primary",
                    !rev && !isPicked && "border-border hover:border-primary/40",
                    rev && isCorrect && "border-success bg-success/10",
                    rev && isPicked && !isCorrect && "border-destructive bg-destructive/10",
                  )}
                >
                  <span className="font-display">{letter}</span>
                  <span className="flex-1">{text}</span>
                  {rev && isCorrect && <Check className="text-success" size={18} />}
                  {rev && isPicked && !isCorrect && <X className="text-destructive" size={18} />}
                </button>
              );
            })}
            {!revealed[s.id] && <Button className="w-full" disabled={!picked[s.id]} onClick={() => submit(s)}>Confirmar</Button>}
          </Card>
        ))}
      </main>
    </div>
  );
}