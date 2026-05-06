import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { RANK_INFO, type Rank } from "@/data/ranks";
import { getAvatarSrc, CAPTAIN_AVATAR } from "@/data/avatars";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Award, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function Promocao() {
  const { profile, loading } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const newRank: Rank = loc.state?.newRank ?? profile?.rank;

  if (loading) return null;
  if (!profile) return <Navigate to="/auth" replace />;

  const share = async () => {
    const text = `🎖️ Fui promovido a ${RANK_INFO[newRank].label} no CHQAO Quest!`;
    if (navigator.share) {
      try { await navigator.share({ title: "Promoção CHQAO", text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Texto copiado!");
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-hero text-primary-foreground px-4 py-8 grid place-items-center">
      <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="w-full max-w-md">
        <Card className="p-6 bg-card text-foreground text-center space-y-4 border-4 border-accent shadow-gold relative overflow-hidden">
          <Sparkles className="absolute top-2 left-2 text-accent animate-pulse" size={20} />
          <Sparkles className="absolute top-2 right-2 text-accent animate-pulse" size={20} />
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Certificado de Promoção</div>
          <Award className="mx-auto text-accent" size={64} />
          <img src={getAvatarSrc(profile.avatar_id)} alt="" className="w-24 h-24 rounded-full mx-auto border-4 border-accent shadow-gold" />
          <div>
            <div className="text-sm text-muted-foreground">Promovido a</div>
            <div className="font-display text-3xl text-primary">{RANK_INFO[newRank].label}</div>
          </div>
          <div className="font-display text-xl">{profile.display_name}</div>
          {profile.nome_guerra && <div className="text-sm text-muted-foreground italic">"{profile.nome_guerra}"</div>}
          <div className="border-t pt-3 text-xs text-muted-foreground flex items-center justify-center gap-2">
            <img src={CAPTAIN_AVATAR} alt="" className="w-8 h-8" />
            Capitão Cmt da CCAp • {new Date().toLocaleDateString("pt-BR")}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <Button variant="secondary" onClick={share}><Share2 size={16} className="mr-2" /> Compartilhar</Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => nav("/dashboard")}>Continuar</Button>
        </div>
      </motion.div>
    </div>
  );
}