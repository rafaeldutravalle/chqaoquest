import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CAPTAIN_AVATAR, getAvatarSrc } from "@/data/avatars";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { RANK_INFO, nextRank } from "@/data/ranks";

export default function Briefing() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;
  const next = nextRank(profile.rank);

  return (
    <div className="min-h-dvh bg-gradient-hero text-primary-foreground px-4 py-6 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col items-center justify-center gap-6 text-center">
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          src={CAPTAIN_AVATAR} alt="Capitão" width={200} height={200}
          className="w-48 h-48 object-contain drop-shadow-2xl"
        />
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h1 className="font-display text-3xl">Capitão Cmt da CCAp</h1>
          <p className="mt-2 text-primary-foreground/85">
            Bem-vindo, {RANK_INFO[profile.rank].label} <strong>{profile.display_name}</strong>!
            Esta é a sua <strong>Ficha de Valorização do Mérito</strong>.
            Para ser promovido a {next ? RANK_INFO[next].label : "Oficial"}, complete <strong>3 séries</strong> de
            questões de Português e Geografia do Brasil.
          </p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex items-center gap-3 bg-card/15 border border-primary-foreground/20 rounded-xl px-4 py-3">
          <img src={getAvatarSrc(profile.avatar_id)} alt="" width={48} height={48} className="w-12 h-12" />
          <div className="text-left text-sm">
            <div className="font-display text-base">{profile.display_name}</div>
            <div className="opacity-80">FVM: {profile.fvm_score.toFixed(2)} pts</div>
          </div>
        </motion.div>
      </div>
      <Button
        size="lg"
        className="bg-accent text-accent-foreground hover:bg-accent/90 font-display text-lg shadow-gold w-full max-w-md mx-auto"
        onClick={() => nav("/dashboard")}
      >
        Aceitar missão
      </Button>
    </div>
  );
}