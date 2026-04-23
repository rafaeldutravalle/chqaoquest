import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Subject = "portugues"|"geografia"|"historia"|"estatuto"|"risg"|"rae"|"rde"|"licitacoes"|"cpm"|"cppm"|"musica";
type MinRank = "soldado"|"cabo"|"terceiro_sgt"|"segundo_sgt"|"primeiro_sgt"|"subtenente"|"segundo_ten_qao";

const SUBJECTS: { id: Subject; label: string }[] = [
  { id: "portugues", label: "Português" }, { id: "geografia", label: "Geografia do Brasil" },
  { id: "historia", label: "História do Brasil" }, { id: "estatuto", label: "Estatuto dos Militares" },
  { id: "risg", label: "RISG" }, { id: "rae", label: "RAE" }, { id: "rde", label: "RDE" },
  { id: "licitacoes", label: "Licitações" }, { id: "cpm", label: "Código Penal Militar" },
  { id: "cppm", label: "Código de Processo Penal Militar" }, { id: "musica", label: "Música" },
];

const RANKS: { id: MinRank; label: string }[] = [
  { id: "soldado", label: "Soldado" }, { id: "cabo", label: "Cabo" },
  { id: "terceiro_sgt", label: "3º Sgt" }, { id: "segundo_sgt", label: "2º Sgt" },
  { id: "primeiro_sgt", label: "1º Sgt" }, { id: "subtenente", label: "S Ten" },
  { id: "segundo_ten_qao", label: "2º Ten QAO" },
];

export default function Admin() {
  const { isAdmin, user, loading } = useAuth();
  const nav = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState<Subject | "all">("all");
  const [polls, setPolls] = useState<any[]>([]);
  const [pollForm, setPollForm] = useState({
    question: "", option_a: "", option_b: "", option_c: "", option_d: "",
    active_date: new Date().toISOString().slice(0, 10),
  });
  const [form, setForm] = useState({
    subject: "portugues" as Subject, year: 2024, question_number: 1,
    text: "", option_a: "", option_b: "", option_c: "", option_d: "",
    correct_answer: "A" as "A"|"B"|"C"|"D",
    explanation: "", difficulty: "medium" as "easy"|"medium"|"hard",
    min_rank: "soldado" as MinRank,
  });

  const load = async () => {
    let q = supabase.from("questions").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("subject", filter);
    const { data } = await q;
    setList(data ?? []);
    const { data: p } = await supabase.from("polls").select("*").order("active_date", { ascending: false }).limit(30);
    setPolls(p ?? []);
  };
  useEffect(() => { if (isAdmin) load(); /* eslint-disable-next-line */ }, [isAdmin, filter]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return (
    <div className="min-h-dvh grid place-items-center p-6 text-center">
      <Card className="p-6 max-w-md">
        <h2 className="font-display text-2xl mb-2">Acesso restrito</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Apenas administradores podem inserir questões. Peça a um admin para conceder seu papel.
        </p>
        <Button onClick={() => nav("/dashboard")}>Voltar</Button>
      </Card>
    </div>
  );

  const save = async () => {
    const { error } = await supabase.from("questions").insert({ ...form, created_by: user.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Questão cadastrada!");
    setForm({ ...form, text: "", option_a: "", option_b: "", option_c: "", option_d: "", explanation: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir questão?")) return;
    await supabase.from("questions").delete().eq("id", id);
    load();
  };

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="bg-gradient-hero text-primary-foreground px-4 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => nav("/dashboard")}>
            <ArrowLeft />
          </Button>
          <h1 className="font-display text-2xl">Painel administrativo — Questões</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 grid lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <h2 className="font-display text-xl flex items-center gap-2"><Plus size={20} /> Nova questão</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Matéria</Label>
              <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v as Subject })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Posto mínimo</Label>
              <Select value={form.min_rank} onValueChange={(v) => setForm({ ...form, min_rank: v as MinRank })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{RANKS.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Ano</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: +e.target.value })} /></div>
            <div><Label>Nº questão</Label><Input type="number" value={form.question_number} onChange={(e) => setForm({ ...form, question_number: +e.target.value })} /></div>
          </div>

          <div><Label>Enunciado</Label><Textarea rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></div>
          {(["A","B","C","D"] as const).map((L) => {
            const k = (`option_${L.toLowerCase()}`) as "option_a"|"option_b"|"option_c"|"option_d";
            return (
              <div key={L}><Label>Alternativa {L}</Label>
                <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </div>
            );
          })}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Resposta correta</Label>
              <Select value={form.correct_answer} onValueChange={(v) => setForm({ ...form, correct_answer: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["A","B","C","D"].map((L) => <SelectItem key={L} value={L}>{L}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dificuldade</Label>
              <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div><Label>Explicação (resposta certa / erro)</Label><Textarea rows={3} value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} /></div>

          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={!form.text || !form.option_a} onClick={save}>
            Cadastrar questão
          </Button>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">Questões cadastradas ({list.length})</h2>
            <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
              <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {SUBJECTS.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {list.map((q) => (
              <div key={q.id} className="border border-border rounded-lg p-3 text-sm flex items-start gap-2 bg-card">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground uppercase">{q.subject} • {q.year} • {q.min_rank}</div>
                  <div className="font-medium line-clamp-2">{q.text}</div>
                  <div className="text-xs text-success mt-1">Resposta: {q.correct_answer}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(q.id)} aria-label="Excluir">
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}