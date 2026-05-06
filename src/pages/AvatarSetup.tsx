import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { AVATARS, CAPTAIN_AVATAR } from "@/data/avatars";
import { SPECIALTIES, Specialty } from "@/data/specialties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AvatarSetup() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.display_name ?? "");
  const [nomeGuerra, setNomeGuerra] = useState("");
  const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id);
  const [spec, setSpec] = useState<Specialty>("infantaria");
  const [saving, setSaving] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (profile?.onboarded) return <Navigate to="/dashboard" replace />;

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: name || "Recruta",
      nome_guerra: nomeGuerra || null,
      avatar_id: avatarId,
      specialty: spec,
      onboarded: true,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error("Erro ao salvar"); return; }
    await refreshProfile();
    nav("/briefing");
  };

  return (
    <div className="min-h-dvh bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <header className="flex items-center gap-3">
          <img src={CAPTAIN_AVATAR} alt="" width={56} height={56} className="w-14 h-14" />
          <div>
            <h1 className="font-display text-2xl text-primary">Cadastro do recruta</h1>
            <p className="text-sm text-muted-foreground">Etapa {step + 1} de 4</p>
          </div>
        </header>

        {step === 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-display text-xl">Como devemos te chamar?</h2>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" maxLength={40} />
            <Input value={nomeGuerra} onChange={(e) => setNomeGuerra(e.target.value)} placeholder="Nome de guerra (opcional, exibido nas Ligas)" maxLength={20} />
            <Button className="w-full" disabled={!name.trim()} onClick={() => setStep(1)}>Avançar</Button>
          </motion.section>
        )}

        {step === 1 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-display text-xl">Escolha seu avatar</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAvatarId(a.id)}
                  className={cn(
                    "rounded-xl border-2 p-2 bg-gradient-card transition-all",
                    avatarId === a.id ? "border-accent shadow-gold scale-105" : "border-border hover:border-primary/40"
                  )}
                >
                  <img src={a.src} alt={a.label} width={120} height={120} loading="lazy" className="w-full aspect-square object-contain" />
                  <p className="text-xs mt-1 truncate">{a.label}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(0)}>Voltar</Button>
              <Button className="flex-1" onClick={() => setStep(2)}>Avançar</Button>
            </div>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <h2 className="font-display text-xl">Escolha sua especialidade</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SPECIALTIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSpec(s.id)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left bg-gradient-card transition-all",
                    spec === s.id ? "border-accent shadow-gold" : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="text-2xl">{s.icon}</div>
                  <div className="font-semibold text-sm">{s.label}</div>
                  <div className="text-xs text-muted-foreground">{s.desc}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
              <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90" disabled={saving} onClick={save}>
                {saving ? "Alistando..." : "Apresentar-se ao Capitão"}
              </Button>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}