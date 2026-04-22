import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import appIcon from "@/assets/app-icon.png";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

export default function Auth() {
  const { user, profile, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (user && profile?.onboarded) return <Navigate to="/dashboard" replace />;
  if (user && profile && !profile.onboarded) return <Navigate to="/setup" replace />;

  const signIn = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/setup",
    });
    if (res.error) {
      toast.error("Falha ao entrar com Google");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-hero text-primary-foreground flex flex-col items-center justify-center px-6 gap-8">
      <img src={appIcon} alt="CHQAO Quest" width={160} height={160} className="w-40 h-40 object-contain drop-shadow-2xl" />
      <div className="text-center space-y-2">
        <h1 className="font-display text-4xl">Apresente-se ao Capitão</h1>
        <p className="text-primary-foreground/80 max-w-xs">Faça login para iniciar sua trajetória no CHQAO.</p>
      </div>
      <Button
        size="lg"
        disabled={busy}
        className="bg-card text-foreground hover:bg-card/90 font-semibold w-full max-w-sm shadow-gold"
        onClick={signIn}
      >
        <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C33.5 6.1 29 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 3l5.7-5.7C33.5 6.1 29 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.1 0 9.7-1.9 13.2-5l-6.1-5c-2 1.4-4.5 2.3-7.1 2.3-5.2 0-9.6-3.4-11.2-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l6.1 5c-.4.4 6.8-5 6.8-14.5 0-1.3-.1-2.3-.4-3.5z"/>
        </svg>
        {busy ? "Conectando..." : "Entrar com Google"}
      </Button>
      <p className="text-xs text-primary-foreground/60 text-center max-w-xs">
        Login obrigatório para liberar o jogo e os anúncios premiados.
      </p>
    </div>
  );
}