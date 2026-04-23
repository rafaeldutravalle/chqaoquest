import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CAPTAIN_AVATAR, getAvatarSrc } from "@/data/avatars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Award, Sparkles } from "lucide-react";

export default function Graduation() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;
  if (profile.rank !== "segundo_ten_qao") return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-dvh bg-gradient-hero text-primary-foreground px-4 py-8 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative"
      >
        <Sparkles className="absolute -top-4 -left-4 text-accent animate-pulse" size={32} />
        <Sparkles className="absolute -bottom-4 -right-4 text-accent animate-pulse" size={32} />
        <img
          src={getAvatarSrc(profile.avatar_id)}
          alt=""
          width={180}
          height={180}
          className="w-44 h-44 rounded-full bg-card/20 border-4 border-accent shadow-gold"
        />
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 space-y-3 max-w-md"
      >
        <Award className="mx-auto text-accent" size={56} />
        <h1 className="font-display text-4xl">Espada de Honra</h1>
        <p className="font-display text-2xl text-accent">2º Tenente QAO</p>
        <p className="text-primary-foreground/85">
          Parabéns, <strong>{profile.display_name}</strong>! Você concluiu toda a
          jornada do CHQAO. O Capitão Cmt da CCAp lhe entrega a Espada de Honra
          em reconhecimento à sua dedicação.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 w-full max-w-md"
      >
        <Card className="p-4 bg-card/15 border-primary-foreground/20 backdrop-blur flex items-center gap-3">
          <img src={CAPTAIN_AVATAR} alt="" width={56} height={56} className="w-14 h-14" />
          <p className="text-sm text-primary-foreground/90">
            "Continue se preparando, Tenente. O Brasil precisa de líderes como você."
          </p>
        </Card>
      </motion.div>

      <Button
        size="lg"
        className="mt-8 w-full max-w-md bg-accent text-accent-foreground hover:bg-accent/90 font-display text-lg shadow-gold"
        onClick={() => nav("/fvm")}
      >
        Ver minha FVM completa
      </Button>
      <Button
        variant="ghost"
        className="mt-2 text-primary-foreground hover:bg-primary-foreground/10"
        onClick={() => nav("/dashboard")}
      >
        Voltar ao quartel
      </Button>
    </div>
  );
}
