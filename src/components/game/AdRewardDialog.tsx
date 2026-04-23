import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Tv } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  RewardAdPluginEvents,
  type AdMobRewardItem,
  type RewardAdOptions,
} from "@capacitor-community/admob";

// IDs de teste oficiais do Google AdMob (substituir pelos reais antes de publicar).
// Android Rewarded teste: ca-app-pub-3940256099942544/5224354917
const REWARDED_AD_ID =
  (import.meta.env.VITE_ADMOB_REWARDED_ID as string | undefined) ||
  "ca-app-pub-3940256099942544/5224354917";

let admobInitialized = false;
async function ensureAdMob() {
  if (admobInitialized) return;
  await AdMob.initialize({ initializeForTesting: true });
  admobInitialized = true;
}

/**
 * Anúncio premiado real via @capacitor-community/admob quando rodando em
 * dispositivo nativo (Android/iOS). Em web, exibe um mock de 5s para
 * permitir desenvolvimento e QA.
 */
export function AdRewardDialog({
  open, onOpenChange, onReward, rewardLabel,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onReward: () => void;
  rewardLabel: string;
}) {
  const isNative = Capacitor.isNativePlatform();
  const [count, setCount] = useState(5);
  const [loadingAd, setLoadingAd] = useState(false);

  // --- Web (mock 5s) ---
  useEffect(() => {
    if (isNative) return;
    if (!open) { setCount(5); return; }
    const t = setInterval(() => setCount((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [open, isNative]);

  // --- Native (AdMob real) ---
  useEffect(() => {
    if (!isNative || !open) return;
    let rewarded = false;
    let listenersReady = false;
    setLoadingAd(true);

    const run = async () => {
      try {
        await ensureAdMob();
        const onReward_ = await AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          (_r: AdMobRewardItem) => { rewarded = true; },
        );
        const onDismiss_ = await AdMob.addListener(
          RewardAdPluginEvents.Dismissed,
          () => {
            if (rewarded) onReward();
            onOpenChange(false);
            onReward_.remove();
            onDismiss_.remove();
          },
        );
        listenersReady = true;
        const opts: RewardAdOptions = { adId: REWARDED_AD_ID };
        await AdMob.prepareRewardVideoAd(opts);
        await AdMob.showRewardVideoAd();
      } catch (e) {
        console.error("AdMob error", e);
        // Em caso de falha, libera a recompensa para não travar o jogo
        onReward();
        onOpenChange(false);
      } finally {
        setLoadingAd(false);
      }
    };
    run();
    return () => { /* listeners removidos no Dismissed */ void listenersReady; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isNative]);

  // Em nativo o diálogo serve só de fallback visual enquanto o anúncio carrega
  if (isNative) {
    return (
      <Dialog open={open && loadingAd} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gradient-hero text-primary-foreground border-primary">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <Tv /> Carregando anúncio…
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              Aguarde para receber: <strong>{rewardLabel}</strong>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-hero text-primary-foreground border-primary">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Tv /> Anúncio em exibição
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            Após o anúncio você recebe: <strong>{rewardLabel}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center font-display text-5xl">
          {count}
        </div>
        <Button
          variant="secondary"
          disabled={count > 0}
          onClick={() => { onReward(); onOpenChange(false); }}
        >
          {count > 0 ? `Aguarde ${count}s…` : "Resgatar recompensa"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}