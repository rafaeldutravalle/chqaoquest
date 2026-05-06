import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Sparkles, ShieldAlert, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { nextRank, RANK_INFO, RANK_ORDER, type Rank } from "@/data/ranks";
import { CAPTAIN_AVATAR } from "@/data/avatars";

type Q = {
  id: string;
  subject: string;
  text: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
};

const SERIES_SIZE = 5;
const REQUIRED_AVG = 7.0; // pontuação mínima da série para promover

// Matérias por posto-alvo (próximo posto)
const SUBJECTS_BY_TARGET: Record<string, ("portugues"|"geografia"|"historia"|"estatuto"|"risg"|"rae"|"rde"|"licitacoes"|"cpm"|"cppm"|"musica"|"doutrina"|"sindicancia"|"ingles")[]> = {
  cabo:           ["portugues", "geografia"],
  terceiro_sgt:   ["portugues", "geografia", "historia"],
  segundo_sgt:    ["portugues", "geografia", "historia", "estatuto"],
  primeiro_sgt:   ["portugues", "geografia", "historia", "estatuto", "risg"],
  subtenente:     ["portugues", "geografia", "historia", "estatuto", "risg", "rae", "rde"],
  segundo_tenente:["portugues", "geografia", "historia", "estatuto", "risg", "rae", "rde", "licitacoes", "cpm", "cppm", "musica"],
  primeiro_tenente:["portugues", "geografia", "historia", "estatuto", "risg", "rae", "rde", "licitacoes", "cpm", "cppm", "musica", "doutrina", "sindicancia"],
  capitao_qao:   ["portugues", "geografia", "historia", "estatuto", "risg", "rae", "rde", "licitacoes", "cpm", "cppm", "musica", "doutrina", "sindicancia", "ingles"],
};

export default function Mission() {
  const { profile, user, refreshProfile, loading } = useAuth();
  const nav = useNavigate();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showExplain, setShowExplain] = useState(false);
  const [aiExplain, setAiExplain] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [loadingQ, setLoadingQ] = useState(true);
  const [prontidao, setProntidao] = useState(100); // sessão
  const [baixa, setBaixa] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const target = (nextRank((profile?.rank ?? "soldado") as Rank) ?? "cabo") as Rank;
      const subjects = SUBJECTS_BY_TARGET[target] ?? ["portugues", "geografia"];
      // Aceita questões cadastradas para qualquer posto até o alvo
      const targetIdx = RANK_ORDER.indexOf(target);
      const eligibleRanks = RANK_ORDER.slice(0, targetIdx + 1);
      const { data, error } = await supabase
        .from("questions")
        .select("id, subject, text, option_a, option_b, option_c, option_d, correct_answer, explanation")
        .in("subject", subjects)
        .in("min_rank", eligibleRanks as any)
        .eq("active", true)
        .limit(50);
      if (error || !data) { toast.error("Erro carregando questões"); nav("/dashboard"); return; }
      const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, SERIES_SIZE);
      setQuestions(shuffled as Q[]);
      setLoadingQ(false);
    })();
  }, [user, nav, profile?.rank]);

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  if (loadingQ) return <div className="min-h-dvh grid place-items-center text-muted-foreground">Carregando série…</div>;
  if (questions.length === 0) {
    return (
      <div className="min-h-dvh grid place-items-center p-6 text-center">
        <Card className="p-6 max-w-md">
          <p>Nenhuma questão disponível para este posto. Peça ao administrador para inserir mais questões.</p>
          <Button className="mt-4" onClick={() => nav("/dashboard")}>Voltar</Button>
        </Card>
      </div>
    );
  }

  const q = questions[idx];
  const opts: ["A"|"B"|"C"|"D", string][] = [
    ["A", q.option_a], ["B", q.option_b], ["C", q.option_c], ["D", q.option_d],
  ];

  const submit = () => {
    if (!picked) return;
    setRevealed(true);
    if (picked === q.correct_answer) {
      setCorrect((c) => c + 1);
    } else {
      const newPront = Math.max(0, prontidao - 20);
      setProntidao(newPront);
      if (newPront === 0) setBaixa(true);
    }
  };

  const fetchAiExplain = async () => {
    if (profile.plan !== "maxwolf") {
      toast.info("IA Tática é exclusiva do plano Max-Wolf Filho");
      return;
    }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("explain-error", {
        body: {
          questionText: q.text,
          userAnswer: picked,
          correctAnswer: q.correct_answer,
          options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
          subject: q.subject,
        },
      });
      if (error) throw error;
      setAiExplain(data.explanation);
    } catch (e: any) {
      toast.error(e.message ?? "Falha na IA Tática");
    } finally {
      setAiLoading(false);
    }
  };

  const next = async () => {
    if (baixa) {
      // Baixa ao Rancho — abandona missão
      const newEnergy = Math.max(0, profile.energy - 1);
      await supabase.from("profiles").update({ prontidao: newEnergy } as any).eq("user_id", profile.user_id);
      await refreshProfile();
      nav("/rancho");
      return;
    }
    if (idx + 1 < questions.length) {
      setIdx(idx + 1); setPicked(null); setRevealed(false); setShowExplain(false); setAiExplain(null);
      return;
    }
    // Finalizar série
    const total = questions.length;
    const score = (correct / total) * 10;
    const newEnergy = Math.max(0, profile.energy - 1);
    const newXp = profile.xp + correct * 10;
    const newGems = profile.gems + (score >= REQUIRED_AVG ? 2 : 0);
    const newFvm = +(profile.fvm_score + score / 10).toFixed(2);
    const target = (nextRank(profile.rank as Rank) ?? profile.rank) as Rank;

    await supabase.from("mission_attempts").insert({
      user_id: profile.user_id,
      rank_target: target,
      series_index: 1,
      correct, total, score,
    });

    // Promoção: 3 séries com média >= REQUIRED_AVG no posto-alvo
    let newRank: Rank = profile.rank as Rank;
    if (score >= REQUIRED_AVG && nextRank(profile.rank as Rank)) {
      const { count } = await supabase
        .from("mission_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.user_id)
        .eq("rank_target", target)
        .gte("score", REQUIRED_AVG);
      if ((count ?? 0) >= 3) {
        newRank = target;
        toast.success(`🎖️ Promovido a ${RANK_INFO[target].label}!`);
      }
    }

    // Punição Disciplinar: nota < 5 acumula puniçoes
    const punicaoDelta = score < 5 ? 1 : 0;
    await supabase.from("profiles").update({
      prontidao: newEnergy, xp: newXp, municao: newGems, pontos_merito: newFvm, rank: newRank,
      punicoes: profile.punicoes + punicaoDelta,
    } as any).eq("user_id", profile.user_id);
    if (punicaoDelta) toast.warning("⚠️ Punição Disciplinar registrada na FVM");
    await refreshProfile();
    if (newRank === "capitao_qao" && profile.rank !== "capitao_qao") {
      nav("/formatura");
      return;
    }
    if (newRank !== profile.rank) {
      nav("/promocao", { state: { newRank } });
      return;
    }
    setDone(true);
  };

  if (done) {
    const score = (correct / questions.length) * 10;
    const passed = score >= REQUIRED_AVG;
    return (
      <div className="min-h-dvh bg-gradient-hero text-primary-foreground grid place-items-center p-6">
        <Card className="p-6 max-w-md w-full bg-card text-foreground text-center space-y-4">
          <img src={CAPTAIN_AVATAR} alt="" width={120} height={120} className="w-28 h-28 mx-auto" />
          <h2 className="font-display text-3xl">{passed ? "Bom trabalho, recruta!" : "Continue treinando!"}</h2>
          <p className="text-muted-foreground">Você acertou <strong>{correct} de {questions.length}</strong> ({score.toFixed(1)}/10).</p>
          <div className="flex justify-center gap-4 text-sm">
            <span className="text-xp font-semibold">+{correct * 10} XP</span>
            {passed && <span className="text-gem font-semibold">+2 gemas</span>}
            <span className="text-accent font-semibold">+{(score/10).toFixed(2)} FVM</span>
          </div>
          <Button className="w-full" onClick={() => nav("/dashboard")}>Voltar ao quartel</Button>
        </Card>
      </div>
    );
  }

  if (baixa) {
    return (
      <div className="min-h-dvh bg-background grid place-items-center p-6">
        <Card className="p-6 max-w-md text-center space-y-4 border-destructive border-2">
          <ShieldAlert className="mx-auto text-destructive" size={56} />
          <h2 className="font-display text-2xl text-destructive">Baixa ao Rancho</h2>
          <p className="text-muted-foreground">Sua Prontidão chegou a 0%. Recupere-se antes de retomar a missão.</p>
          <Button className="w-full" onClick={next}>Ir ao Rancho</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <div className="bg-gradient-hero text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            ← Sair
          </Button>
          <span className="font-display text-lg">Série • {idx + 1}/{questions.length}</span>
          <span className="font-display text-lg text-success">{correct} ✓</span>
        </div>
        <Progress value={((idx) / questions.length) * 100} className="h-2 max-w-md mx-auto" />
        <div className="max-w-md mx-auto mt-2">
          <div className="flex justify-between text-xs mb-0.5"><span>Prontidão</span><span>{prontidao}%</span></div>
          <Progress value={prontidao} className={cn("h-1.5", prontidao < 40 && "[&>div]:bg-destructive")} />
        </div>
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">{q.subject}</span>
            <h2 className="font-display text-2xl mt-1 mb-5 text-primary">{q.text}</h2>
            <div className="space-y-2 flex-1">
              {opts.map(([letter, text]) => {
                const isCorrect = letter === q.correct_answer;
                const isPicked = picked === letter;
                return (
                  <button
                    key={letter}
                    disabled={revealed}
                    onClick={() => setPicked(letter)}
                    className={cn(
                      "w-full text-left rounded-xl border-2 p-3 flex items-start gap-3 transition-all bg-card",
                      !revealed && isPicked && "border-primary shadow-card",
                      !revealed && !isPicked && "border-border hover:border-primary/40",
                      revealed && isCorrect && "border-success bg-success/10",
                      revealed && isPicked && !isCorrect && "border-destructive bg-destructive/10",
                      revealed && !isCorrect && !isPicked && "opacity-60",
                    )}
                  >
                    <span className="font-display text-lg w-7 h-7 rounded-md bg-secondary grid place-items-center shrink-0">{letter}</span>
                    <span className="flex-1 text-sm pt-0.5">{text}</span>
                    {revealed && isCorrect && <Check className="text-success shrink-0" />}
                    {revealed && isPicked && !isCorrect && <X className="text-destructive shrink-0" />}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => setShowExplain((s) => !s)}>
                  <Sparkles className="mr-2" size={16} />
                  {picked === q.correct_answer ? "Explicar minha resposta" : "Explicar meu erro"}
                </Button>
                {showExplain && (
                  <>
                    <Card className="p-3 text-sm bg-secondary/50">
                      {q.explanation || "Explicação padrão não cadastrada."}
                    </Card>
                    <Button variant="outline" className="w-full border-accent/40" onClick={fetchAiExplain} disabled={aiLoading}>
                      <Crown className="mr-2 text-accent" size={16} />
                      {aiLoading ? "Convocando IA Tática..." : "IA Tática (Max-Wolf)"}
                    </Button>
                    {aiExplain && (
                      <Card className="p-3 text-sm bg-accent/5 border-accent/30 whitespace-pre-wrap">
                        {aiExplain}
                      </Card>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="pt-4">
          {!revealed ? (
            <Button size="lg" className="w-full font-display text-lg" disabled={!picked} onClick={submit}>Confirmar</Button>
          ) : (
            <Button size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display text-lg" onClick={next}>
              {idx + 1 < questions.length ? "Próxima" : "Finalizar série"}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}